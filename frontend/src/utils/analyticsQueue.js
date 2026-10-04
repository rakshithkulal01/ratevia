/**
 * Frontend Analytics Accumulator and Batch Queue
 *
 * Implements high-efficiency client-side session accumulation:
 * - Primary trigger: Flushes immediately when pending analytics sessions >= 25.
 * - Secondary fallback: Flushes on page lifecycle (visibilitychange / pagehide) ONLY when:
 *     A. Pending sessions >= 25, OR
 *     B. Oldest pending session exceeds MAX_QUEUE_AGE_MS (default: 2 hours).
 * - Multi-tab safe: Uses light-weight localStorage lease locks to prevent concurrent batching.
 * - LocalStorage safe: In-memory fallback if localStorage is disabled/corrupted/quota exceeded.
 * - Idempotency: Uses client-generated batchId verified against backend unique database index.
 * - Privacy: Zero review text, zero customer PII, zero 4-5★ messages transmitted.
 * - Non-blocking: Customer navigation to Google or feedback submission is never delayed.
 */

export const BATCH_SIZE = 25;
export const MAX_QUEUE_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours
export const MAX_SESSION_RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days max retention
const STORAGE_KEY_PREFIX = 'ratevia_analytics_q_v1_';
const LOCK_KEY_PREFIX = 'ratevia_analytics_lock_v1_';
const LOCK_TIMEOUT_MS = 5000; // 5 seconds lock timeout

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// In-memory fallback storage if localStorage is blocked or throws
const memoryStorage = new Map();

// In-flight batch locks to prevent concurrent double-transmissions within the same tab
const activeFlushes = new Set();

// Exponential backoff tracker for failed batch attempts
const flushRetryTracker = new Map(); // businessSlug -> nextAllowedRetryTimestamp

/**
 * Generate a unique v4 UUID or fallback for batchId / sessionId
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback below
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getStorageKey(businessSlug) {
  return `${STORAGE_KEY_PREFIX}${businessSlug || 'general'}`;
}

function getLockKey(businessSlug) {
  return `${LOCK_KEY_PREFIX}${businessSlug || 'general'}`;
}

// Safe storage accessors with memory fallback
function safeGetItem(key) {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch (e) {
    // LocalStorage blocked (e.g. Safari private browsing, disabled cookies)
  }
  return memoryStorage.get(key) || null;
}

function safeSetItem(key, val) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
      return;
    }
  } catch (e) {
    // QuotaExceededError or security block
  }
  memoryStorage.set(key, val);
}

function safeRemoveItem(key) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (e) {
    // Ignore
  }
  memoryStorage.delete(key);
}

/**
 * Acquire multi-tab lock for a business queue.
 * Returns lockId if acquired, null if already locked by another tab.
 */
function acquireLock(businessSlug) {
  const lockKey = getLockKey(businessSlug);
  const now = Date.now();
  const raw = safeGetItem(lockKey);
  if (raw) {
    try {
      const lockData = JSON.parse(raw);
      if (lockData && lockData.expiresAt > now) {
        return null; // Lock is currently held
      }
    } catch {
      // Malformed lock, allow reacquisition
    }
  }

  const lockId = generateUUID();
  safeSetItem(lockKey, JSON.stringify({ lockId, expiresAt: now + LOCK_TIMEOUT_MS }));
  return lockId;
}

function releaseLock(businessSlug, lockId) {
  if (!lockId) return;
  const lockKey = getLockKey(businessSlug);
  try {
    const raw = safeGetItem(lockKey);
    if (raw) {
      const lockData = JSON.parse(raw);
      if (lockData && lockData.lockId === lockId) {
        safeRemoveItem(lockKey);
      }
    }
  } catch {
    // Ignore
  }
}

/**
 * Read and validate queue from storage.
 * Discards malformed records and enforces 30-day stale session eviction.
 */
export function readQueue(businessSlug) {
  try {
    const raw = safeGetItem(getStorageKey(businessSlug));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const now = Date.now();
    // Validate each session structure and filter out abandoned stale sessions (>30 days)
    return parsed.filter((s) => {
      if (!s || typeof s !== 'object' || !s.sessionId) return false;
      const age = now - (s.createdAt || s.updatedAt || now);
      return age < MAX_SESSION_RETENTION_MS;
    });
  } catch (e) {
    console.warn('[AnalyticsQueue] Failed to parse queue, resetting:', e);
    return [];
  }
}

/**
 * Write queue to storage.
 */
export function writeQueue(businessSlug, sessions) {
  try {
    const validSessions = Array.isArray(sessions) ? sessions : [];
    safeSetItem(getStorageKey(businessSlug), JSON.stringify(validSessions));
  } catch (e) {
    console.warn('[AnalyticsQueue] Failed to write queue:', e);
  }
}

/**
 * Enqueue or update a session in the local accumulation queue.
 * Flushes immediately if the queue reaches 25 sessions.
 */
export function recordSession(businessSlug, sessionData) {
  if (!businessSlug || !sessionData) return;

  try {
    const queue = readQueue(businessSlug);
    const existingIndex = queue.findIndex((s) => s.sessionId === sessionData.sessionId);
    const now = Date.now();

    const record = {
      sessionId: sessionData.sessionId || generateUUID(),
      scanned: Boolean(sessionData.scanned),
      feedbackStarted: Boolean(sessionData.feedbackStarted),
      rating: Number(sessionData.rating) || 0,
      reviewGenerated: Boolean(sessionData.reviewGenerated),
      reviewCopied: Boolean(sessionData.reviewCopied),
      googleClicked: Boolean(sessionData.googleClicked),
      topics: Array.isArray(sessionData.topics) ? sessionData.topics.slice(0, 10) : [],
      completed: Boolean(sessionData.completed),
      createdAt: sessionData.createdAt || now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      // Merge updates
      const existing = queue[existingIndex];
      queue[existingIndex] = {
        ...existing,
        ...record,
        createdAt: existing.createdAt || record.createdAt,
        scanned: existing.scanned || record.scanned,
        feedbackStarted: existing.feedbackStarted || record.feedbackStarted,
        reviewGenerated: existing.reviewGenerated || record.reviewGenerated,
        reviewCopied: existing.reviewCopied || record.reviewCopied,
        googleClicked: existing.googleClicked || record.googleClicked,
        rating: record.rating || existing.rating,
      };
    } else {
      queue.push(record);
    }

    writeQueue(businessSlug, queue);

    // Primary rule: flush immediately when batch size reaches 25 sessions
    if (queue.length >= BATCH_SIZE) {
      flushQueue(businessSlug, 'batch_size_reached');
    }
  } catch (err) {
    console.warn('[AnalyticsQueue] Error recording session:', err);
  }
}

/**
 * Flush accumulated sessions for a business to POST /api/analytics/batch.
 *
 * Rules:
 * - If reason === 'lifecycle':
 *     Flush ONLY if queue.length >= 25 OR oldest session >= MAX_QUEUE_AGE_MS.
 *     Otherwise DO NOT flush.
 * - If queue >= 25: send batch of 25.
 * - Multi-tab safe: checks and acquires cross-tab lock.
 */
export async function flushQueue(businessSlug, reason = 'manual') {
  if (!businessSlug) return false;
  if (activeFlushes.has(businessSlug)) return false;

  // Check exponential backoff retry gate
  const nextAllowed = flushRetryTracker.get(businessSlug) || 0;
  if (Date.now() < nextAllowed && reason !== 'manual') {
    return false;
  }

  const queue = readQueue(businessSlug);
  if (queue.length === 0) return false;

  // Lifecycle check: do NOT flush if queue < 25 unless oldest session exceeded MAX_QUEUE_AGE_MS
  if (reason === 'lifecycle') {
    const isBatchFull = queue.length >= BATCH_SIZE;
    const now = Date.now();
    const isOldestExpired = queue.some(
      (s) => now - (s.createdAt || s.updatedAt || now) >= MAX_QUEUE_AGE_MS
    );

    if (!isBatchFull && !isOldestExpired) {
      // Suppress flush: preserve 25-session batching!
      return false;
    }
  }

  // Multi-tab lock acquisition
  const lockId = acquireLock(businessSlug);
  if (!lockId) {
    // Another tab is currently flushing this business queue
    return false;
  }

  activeFlushes.add(businessSlug);

  // Take up to 25 sessions per batch
  const batchSessions = queue.slice(0, BATCH_SIZE);
  const batchSessionIds = new Set(batchSessions.map((s) => s.sessionId));
  const batchId = generateUUID();

  const payload = {
    batchId,
    businessSlug,
    sessions: batchSessions.map((s) => ({
      sessionId: s.sessionId,
      scanned: s.scanned,
      feedbackStarted: s.feedbackStarted,
      rating: s.rating,
      reviewGenerated: s.reviewGenerated,
      reviewCopied: s.reviewCopied,
      googleClicked: s.googleClicked,
      topics: s.topics,
      completed: s.completed,
    })),
  };

  const endpoint = `${API_URL}/api/analytics/batch`;
  let dispatched = false;

  try {
    // 1. If triggered by page unload, prefer navigator.sendBeacon
    if (reason === 'lifecycle' && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      dispatched = navigator.sendBeacon(endpoint, blob);
    }

    // 2. Standard fetch fallback
    if (!dispatched && typeof fetch !== 'undefined') {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch((err) => {
        console.warn('[AnalyticsQueue] Batch fetch network failure:', err.message);
        return null;
      });

      if (res && (res.ok || res.status === 200 || res.status === 204)) {
        dispatched = true;
      }
    }
  } catch (err) {
    console.warn('[AnalyticsQueue] Batch dispatch error:', err);
  } finally {
    activeFlushes.delete(businessSlug);
    releaseLock(businessSlug, lockId);
  }

  if (dispatched) {
    // On success: remove ONLY the sessions that were successfully included in this batch
    // Re-read fresh queue from storage in case new sessions were added during transmission
    const latestQueue = readQueue(businessSlug);
    const updatedQueue = latestQueue.filter((s) => !batchSessionIds.has(s.sessionId));
    writeQueue(businessSlug, updatedQueue);
    flushRetryTracker.delete(businessSlug);

    // If there are still 25+ remaining, continue flushing next batch
    if (updatedQueue.length >= BATCH_SIZE) {
      setTimeout(() => flushQueue(businessSlug, 'batch_size_remaining'), 50);
    }
    return true;
  } else {
    // On failure: preserve all sessions for retry and set exponential backoff delay (30s)
    flushRetryTracker.set(businessSlug, Date.now() + 30000);
    return false;
  }
}

/**
 * Flush all pending business queues in localStorage (called on pagehide / visibilitychange)
 */
export function flushAllQueues(reason = 'lifecycle') {
  try {
    if (typeof localStorage === 'undefined') {
      // Memory fallback scan
      for (const key of memoryStorage.keys()) {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          const businessSlug = key.slice(STORAGE_KEY_PREFIX.length);
          if (businessSlug && businessSlug !== 'general') {
            flushQueue(businessSlug, reason);
          }
        }
      }
      return;
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        const businessSlug = key.slice(STORAGE_KEY_PREFIX.length);
        if (businessSlug && businessSlug !== 'general') {
          flushQueue(businessSlug, reason);
        }
      }
    }
  } catch (err) {
    console.warn('[AnalyticsQueue] Error flushing all queues:', err);
  }
}

// Lifecycle listeners: Flush pending queues when tab or page is hidden/closed
// ONLY flushes if queue >= 25 OR oldest session >= MAX_QUEUE_AGE_MS
if (typeof window !== 'undefined') {
  const onLifecycleEnd = () => {
    flushAllQueues('lifecycle');
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        onLifecycleEnd();
      }
    });
  }

  window.addEventListener('pagehide', onLifecycleEnd);
}
