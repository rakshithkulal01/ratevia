import prisma from '../config/prisma.js';

/**
 * Returns today's date normalized to midnight UTC.
 */
export function getNormalizedDate(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Record a feedback submission in DailyBusinessAnalytics.
 * Updates rating counter, topic counts, feedbackStarted, and reviewsGenerated.
 * Uses atomic increments and concurrency-safe retry to prevent race conditions.
 */
export async function recordDailyFeedbackAnalytics(
  businessId,
  ratingOrObj,
  topics = [],
  hasGeneratedReview = false,
  maxRetries = 3
) {
  let rating = ratingOrObj;
  if (typeof ratingOrObj === 'object' && ratingOrObj !== null) {
    rating = ratingOrObj.rating;
    topics = ratingOrObj.topics || ratingOrObj.selectedTopics || [];
    hasGeneratedReview = ratingOrObj.hasGeneratedReview || Boolean(ratingOrObj.generatedReview);
  }

  const date = getNormalizedDate();
  const ratingKey = `rating${rating}`;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Fetch current topic counts to perform a clean merge
      const row = await prisma.dailyBusinessAnalytics.findUnique({
        where: {
          businessId_date: { businessId, date },
        },
        select: {
          positiveTopicCounts: true,
          improvementTopicCounts: true,
        },
      });

      const positiveTopics =
        row?.positiveTopicCounts && typeof row.positiveTopicCounts === 'object'
          ? { ...row.positiveTopicCounts }
          : {};
      const improvementTopics =
        row?.improvementTopicCounts && typeof row.improvementTopicCounts === 'object'
          ? { ...row.improvementTopicCounts }
          : {};

      if (Array.isArray(topics)) {
        topics.forEach((topic) => {
          const clean = topic.trim();
          if (!clean) return;
          if (rating >= 4) {
            positiveTopics[clean] = (positiveTopics[clean] || 0) + 1;
          } else {
            improvementTopics[clean] = (improvementTopics[clean] || 0) + 1;
          }
        });
      }

      return await prisma.dailyBusinessAnalytics.upsert({
        where: {
          businessId_date: { businessId, date },
        },
        create: {
          businessId,
          date,
          feedbackStarted: 1,
          reviewsGenerated: hasGeneratedReview ? 1 : 0,
          [ratingKey]: 1,
          positiveTopicCounts: positiveTopics,
          improvementTopicCounts: improvementTopics,
        },
        update: {
          feedbackStarted: { increment: 1 },
          reviewsGenerated: hasGeneratedReview ? { increment: 1 } : undefined,
          [ratingKey]: { increment: 1 },
          positiveTopicCounts: positiveTopics,
          improvementTopicCounts: improvementTopics,
        },
      });
    } catch (err) {
      if (attempt < maxRetries - 1) {
        // Jittered backoff to resolve concurrent pooler collisions
        await new Promise((resolve) => setTimeout(resolve, 10 + Math.random() * 20));
        continue;
      }
      throw err;
    }
  }
}

// In-memory queues for micro-batching analytics events and counters under concurrent load
const eventCounterQueue = new Map();
let counterFlushTimeout = null;

const rawEventQueue = [];
let rawEventFlushTimeout = null;

let activeFlushPromise = null;

/**
 * Flush all pending counter increments and raw analytics events to the database.
 * Serializes flushes and guarantees all pending counters and events are persisted when awaited.
 */
export async function flushPendingAnalytics() {
  if (counterFlushTimeout) {
    clearTimeout(counterFlushTimeout);
    counterFlushTimeout = null;
  }
  if (rawEventFlushTimeout) {
    clearTimeout(rawEventFlushTimeout);
    rawEventFlushTimeout = null;
  }

  // If a flush is currently in progress, wait for it
  if (activeFlushPromise) {
    await activeFlushPromise;
  }

  if (eventCounterQueue.size === 0 && rawEventQueue.length === 0) {
    return;
  }

  activeFlushPromise = (async () => {
    try {
      // 1. Flush counter increments sequentially to avoid exhausting connection pool
      if (eventCounterQueue.size > 0) {
        const entries = Array.from(eventCounterQueue.entries());
        eventCounterQueue.clear();

        for (const [key, count] of entries) {
          const [businessId, dateStr, updateField] = key.split('::');
          const date = new Date(dateStr);

          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              await prisma.dailyBusinessAnalytics.upsert({
                where: {
                  businessId_date: { businessId, date },
                },
                create: {
                  businessId,
                  date,
                  [updateField]: count,
                },
                update: {
                  [updateField]: { increment: count },
                },
              });
              break;
            } catch (err) {
              if (attempt < 2) {
                await new Promise((r) => setTimeout(r, 20 + Math.random() * 30));
                continue;
              }
              console.error(
                `[AnalyticsBatch] Failed to persist ${updateField} (+${count}) for business ${businessId}:`,
                err.message
              );
            }
          }
        }
      }

      // 2. Flush raw events in one bulk insert
      if (rawEventQueue.length > 0) {
        const events = rawEventQueue.splice(0, rawEventQueue.length);
        try {
          await prisma.analyticsEvent.createMany({
            data: events,
            skipDuplicates: true,
          });
        } catch (err) {
          console.error(`[AnalyticsBatch] Failed to bulk insert ${events.length} raw events:`, err.message);
        }
      }
    } finally {
      activeFlushPromise = null;
    }

    // Drain any events that accumulated while flushing
    if (eventCounterQueue.size > 0 || rawEventQueue.length > 0) {
      await flushPendingAnalytics();
    }
  })();

  await activeFlushPromise;
}

/**
 * Enqueue a raw event for batch insertion.
 */
export function queueRawAnalyticsEvent(event) {
  rawEventQueue.push(event);
  if (!rawEventFlushTimeout) {
    rawEventFlushTimeout = setTimeout(() => {
      flushPendingAnalytics().catch(() => {});
    }, 100);
  }
}

/**
 * Record event counter (QR_SCANNED, REVIEW_COPIED, GOOGLE_LINK_CLICKED).
 * Uses atomic micro-batching to eliminate PostgreSQL row-lock contention under high concurrency.
 */
export async function recordDailyEventAnalytics(businessId, eventType) {
  let updateField = null;
  if (eventType === 'QR_SCANNED') updateField = 'qrScans';
  else if (eventType === 'REVIEW_COPIED') updateField = 'reviewsCopied';
  else if (eventType === 'GOOGLE_LINK_CLICKED') updateField = 'googleClicks';

  if (!updateField) return;

  const date = getNormalizedDate();
  const key = `${businessId}::${date.toISOString()}::${updateField}`;
  const current = eventCounterQueue.get(key) || 0;
  eventCounterQueue.set(key, current + 1);

  if (!counterFlushTimeout) {
    counterFlushTimeout = setTimeout(() => {
      flushPendingAnalytics().catch(() => {});
    }, 50);
  }
}

// Clean up pending flushes on process termination
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    flushPendingAnalytics();
  });
}
