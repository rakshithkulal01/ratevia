import { Router } from 'express';
import prisma from '../config/prisma.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { analyticsBatchLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * GET /api/analytics
 * Retrieve comprehensive business analytics from DailyBusinessAnalytics and live records.
 * Provides permanent historical data retention even after 30-day raw feedback purging.
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const business = await prisma.business.findFirst({
      where: {
        ownerId: req.user.id,
      },
    });

    if (!business) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'No active business profile found.',
      });
    }

    // 1. Fetch DailyBusinessAnalytics rows and current live records
    const [dailyRows, legacyFeedbacks] = await Promise.all([
      prisma.dailyBusinessAnalytics.findMany({
        where: { businessId: business.id },
        orderBy: { date: 'asc' },
      }),
      prisma.feedback.findMany({
        where: { businessId: business.id },
        select: {
          id: true,
          rating: true,
          selectedTopics: true,
          createdAt: true,
          googleLinkClickedAt: true,
          reviewCopiedAt: true,
        },
      }),
    ]);

    // 2. Rating distribution map & cumulative counters
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalFeedbacks = 0;
    let totalRatingSum = 0;
    let totalQrScans = 0;
    let totalReviewsCopied = 0;
    let totalGoogleClicks = 0;

    const likedTopicsMap = {};
    const improvementTopicsMap = {};

    if (dailyRows.length > 0) {
      dailyRows.forEach((row) => {
        ratingCounts[1] += row.rating1;
        ratingCounts[2] += row.rating2;
        ratingCounts[3] += row.rating3;
        ratingCounts[4] += row.rating4;
        ratingCounts[5] += row.rating5;

        const rowFeedbacks =
          row.rating1 + row.rating2 + row.rating3 + row.rating4 + row.rating5;
        totalFeedbacks += rowFeedbacks;
        totalRatingSum +=
          row.rating1 * 1 +
          row.rating2 * 2 +
          row.rating3 * 3 +
          row.rating4 * 4 +
          row.rating5 * 5;

        totalQrScans += row.qrScans;
        totalReviewsCopied += row.reviewsCopied;
        totalGoogleClicks += row.googleClicks;

        if (row.positiveTopicCounts && typeof row.positiveTopicCounts === 'object') {
          Object.entries(row.positiveTopicCounts).forEach(([topic, count]) => {
            likedTopicsMap[topic] = (likedTopicsMap[topic] || 0) + Number(count);
          });
        }

        if (row.improvementTopicCounts && typeof row.improvementTopicCounts === 'object') {
          Object.entries(row.improvementTopicCounts).forEach(([topic, count]) => {
            improvementTopicsMap[topic] = (improvementTopicsMap[topic] || 0) + Number(count);
          });
        }
      });
    }

    // Include fallback for any legacy raw records not yet aggregated
    if (totalFeedbacks === 0 && legacyFeedbacks.length > 0) {
      legacyFeedbacks.forEach((fb) => {
        ratingCounts[fb.rating] = (ratingCounts[fb.rating] || 0) + 1;
        totalFeedbacks++;
        totalRatingSum += fb.rating;

        if (Array.isArray(fb.selectedTopics)) {
          fb.selectedTopics.forEach((topic) => {
            const clean = topic.trim();
            if (!clean) return;
            if (fb.rating >= 4) {
              likedTopicsMap[clean] = (likedTopicsMap[clean] || 0) + 1;
            } else {
              improvementTopicsMap[clean] = (improvementTopicsMap[clean] || 0) + 1;
            }
          });
        }
      });

      totalReviewsCopied = legacyFeedbacks.filter((f) => f.reviewCopiedAt).length;
      totalGoogleClicks = legacyFeedbacks.filter((f) => f.googleLinkClickedAt).length;
    }

    const ratingDistribution = [
      { rating: '5 Stars', count: ratingCounts[5], stars: 5, fill: '#10B981' },
      { rating: '4 Stars', count: ratingCounts[4], stars: 4, fill: '#3B82F6' },
      { rating: '3 Stars', count: ratingCounts[3], stars: 3, fill: '#F59E0B' },
      { rating: '2 Stars', count: ratingCounts[2], stars: 2, fill: '#F97316' },
      { rating: '1 Star', count: ratingCounts[1], stars: 1, fill: '#EF4444' },
    ];

    const averageRating =
      totalFeedbacks > 0 ? Number((totalRatingSum / totalFeedbacks).toFixed(1)) : 0;

    // 3. Topics Rankings
    const mostLikedTopics = Object.entries(likedTopicsMap)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const improvementAreas = Object.entries(improvementTopicsMap)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // 4. Compute 14-day trends
    const last14DaysMap = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      last14DaysMap[dateKey] = { date: dateKey, feedbacks: 0, sumRating: 0 };
    }

    // Populate from dailyRows first
    dailyRows.forEach((row) => {
      const dateKey = new Date(row.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      if (last14DaysMap[dateKey]) {
        const count = row.rating1 + row.rating2 + row.rating3 + row.rating4 + row.rating5;
        const sum =
          row.rating1 * 1 +
          row.rating2 * 2 +
          row.rating3 * 3 +
          row.rating4 * 4 +
          row.rating5 * 5;
        last14DaysMap[dateKey].feedbacks += count;
        last14DaysMap[dateKey].sumRating += sum;
      }
    });

    const feedbackTrends = Object.values(last14DaysMap).map((day) => ({
      date: day.date,
      feedbacks: day.feedbacks,
      averageRating:
        day.feedbacks > 0 ? Number((day.sumRating / day.feedbacks).toFixed(1)) : null,
    }));

    // 5. Funnel
    const funnel = [
      { step: 'QR Scanned', count: totalQrScans },
      { step: 'Feedback Submissions', count: totalFeedbacks },
      { step: 'Reviews Copied', count: totalReviewsCopied },
      { step: 'Google Link Clicked', count: totalGoogleClicks },
    ];

    const conversionRate =
      totalQrScans > 0
        ? Number(((totalGoogleClicks / totalQrScans) * 100).toFixed(1))
        : 0;

    const accountStatus = business.isActive ? 'ACTIVE' : 'SUSPENDED';

    return res.status(200).json({
      overview: {
        totalQrScans,
        totalFeedbacks,
        googleClicks: totalGoogleClicks,
        reviewsCopied: totalReviewsCopied,
        averageRating,
        conversionRate,
      },
      ratingDistribution,
      feedbackTrends,
      mostLikedTopics,
      improvementAreas,
      funnel,
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        businessType: business.businessType,
        googleReviewUrl: business.googleReviewUrl,
        isActive: business.isActive,
        status: accountStatus,
      },
      accountStatus,
    });
  } catch (error) {
    next(error);
  }
});

// Idempotency cache: Set of processed batchIds with expiration
const processedBatches = new Map(); // batchId -> timestamp
const BATCH_IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function isBatchDuplicate(batchId) {
  if (!batchId) return false;
  const now = Date.now();
  // Evict expired entries when map grows
  if (processedBatches.size > 20000) {
    for (const [id, time] of processedBatches.entries()) {
      if (now - time > BATCH_IDEMPOTENCY_TTL_MS) {
        processedBatches.delete(id);
      }
    }
  }
  if (processedBatches.has(batchId)) {
    return true;
  }
  processedBatches.set(batchId, now);
  return false;
}

/**
 * POST /api/analytics/batch
 * High-performance, idempotent batch ingest endpoint for customer session analytics.
 * Aggregates up to 25 customer sessions in memory and performs a single atomic upsert.
 */
router.post('/batch', analyticsBatchLimiter, async (req, res, next) => {
  try {
    const { batchId, businessSlug, sessions } = req.body || {};

    if (
      !batchId ||
      typeof batchId !== 'string' ||
      batchId.length > 100 ||
      !businessSlug ||
      typeof businessSlug !== 'string' ||
      businessSlug.length > 100 ||
      !Array.isArray(sessions) ||
      sessions.length === 0
    ) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Missing or invalid required batch fields: batchId, businessSlug, and sessions array.',
      });
    }

    // Enforce strict limit: MAX 100 sessions per batch
    if (sessions.length > 100) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Batch size exceeds maximum limit of 100 sessions.',
      });
    }

    // 1. Idempotency Check: Reject duplicate delivery (pagehide + visibilitychange or network retries)
    if (isBatchDuplicate(batchId)) {
      return res.status(200).json({ status: 'duplicate_ignored', batchId });
    }

    // 2. Validate Business Slug
    const business = await prisma.business.findUnique({
      where: { slug: businessSlug },
      select: { id: true, isActive: true },
    });

    if (!business || !business.isActive) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Business not found or inactive.',
      });
    }

    // 3. In-memory aggregation across sessions in this batch
    let totalQrScans = 0;
    let totalFeedbackStarted = 0;
    let totalReviewsGenerated = 0;
    let totalReviewsCopied = 0;
    let totalGoogleClicks = 0;
    const ratingDeltas = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const positiveTopicDeltas = {};
    const improvementTopicDeltas = {};

    for (const session of sessions) {
      if (!session || typeof session !== 'object') continue;

      if (session.scanned) totalQrScans++;
      if (session.feedbackStarted) totalFeedbackStarted++;
      if (session.reviewGenerated) totalReviewsGenerated++;
      if (session.reviewCopied) totalReviewsCopied++;
      if (session.googleClicked) totalGoogleClicks++;

      const r = Number(session.rating);
      if (r >= 1 && r <= 5) {
        ratingDeltas[r]++;
        const topics = Array.isArray(session.topics) ? session.topics.slice(0, 20) : [];
        for (const t of topics) {
          const clean = typeof t === 'string' ? t.trim().slice(0, 50) : '';
          if (!clean) continue;
          if (r >= 4) {
            positiveTopicDeltas[clean] = (positiveTopicDeltas[clean] || 0) + 1;
          } else {
            improvementTopicDeltas[clean] = (improvementTopicDeltas[clean] || 0) + 1;
          }
        }
      }
    }

    // 4. Normalized date for daily aggregation
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // 5. Execute batch insertion and metrics update inside a single atomic transaction
    const transactionResult = await prisma.$transaction(async (tx) => {
      // 5a. Persistent idempotency check using unique batchId constraint
      try {
        await tx.analyticsBatch.create({
          data: {
            batchId,
            businessId: business.id,
            sessionCount: sessions.length,
          },
        });
      } catch (err) {
        if (err.code === 'P2002') {
          // Unique constraint violation: batch has already been processed!
          return { duplicate: true };
        }
        throw err;
      }

      // 5b. Topic aggregation merge within the transaction
      let positiveTopics = {};
      let improvementTopics = {};

      if (Object.keys(positiveTopicDeltas).length > 0 || Object.keys(improvementTopicDeltas).length > 0) {
        const existing = await tx.dailyBusinessAnalytics.findUnique({
          where: { businessId_date: { businessId: business.id, date: today } },
          select: { positiveTopicCounts: true, improvementTopicCounts: true },
        });

        if (existing?.positiveTopicCounts && typeof existing.positiveTopicCounts === 'object') {
          positiveTopics = { ...existing.positiveTopicCounts };
        }
        if (existing?.improvementTopicCounts && typeof existing.improvementTopicCounts === 'object') {
          improvementTopics = { ...existing.improvementTopicCounts };
        }

        for (const [t, count] of Object.entries(positiveTopicDeltas)) {
          positiveTopics[t] = (positiveTopics[t] || 0) + count;
        }
        for (const [t, count] of Object.entries(improvementTopicDeltas)) {
          improvementTopics[t] = (improvementTopics[t] || 0) + count;
        }
      }

      // 5c. Atomic upsert to DailyBusinessAnalytics within the transaction
      await tx.dailyBusinessAnalytics.upsert({
        where: {
          businessId_date: { businessId: business.id, date: today },
        },
        create: {
          businessId: business.id,
          date: today,
          qrScans: totalQrScans,
          feedbackStarted: totalFeedbackStarted,
          reviewsGenerated: totalReviewsGenerated,
          reviewsCopied: totalReviewsCopied,
          googleClicks: totalGoogleClicks,
          rating1: ratingDeltas[1],
          rating2: ratingDeltas[2],
          rating3: ratingDeltas[3],
          rating4: ratingDeltas[4],
          rating5: ratingDeltas[5],
          positiveTopicCounts: positiveTopics,
          improvementTopicCounts: improvementTopics,
        },
        update: {
          qrScans: { increment: totalQrScans },
          feedbackStarted: { increment: totalFeedbackStarted },
          reviewsGenerated: { increment: totalReviewsGenerated },
          reviewsCopied: { increment: totalReviewsCopied },
          googleClicks: { increment: totalGoogleClicks },
          rating1: { increment: ratingDeltas[1] },
          rating2: { increment: ratingDeltas[2] },
          rating3: { increment: ratingDeltas[3] },
          rating4: { increment: ratingDeltas[4] },
          rating5: { increment: ratingDeltas[5] },
          ...(Object.keys(positiveTopicDeltas).length > 0 ? { positiveTopicCounts: positiveTopics } : {}),
          ...(Object.keys(improvementTopicDeltas).length > 0 ? { improvementTopicCounts: improvementTopics } : {}),
        },
      });

      return { duplicate: false };
    });

    if (transactionResult.duplicate) {
      return res.status(200).json({ status: 'duplicate_ignored', batchId });
    }

    return res.status(200).json({ success: true, processedSessions: sessions.length });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/analytics/events
 * Public lightweight endpoint to ingest client-side operational telemetry.
 * Returns 204 immediately.
 */
router.post('/events', async (req, res) => {
  return res.status(204).end();
});

export default router;
