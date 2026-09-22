import { Router } from 'express';
import prisma from '../config/prisma.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

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
    const [dailyRows, legacyFeedbacks, liveQrScans, liveEvents] = await Promise.all([
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
      prisma.analyticsEvent.count({
        where: { businessId: business.id, eventType: 'QR_SCANNED' },
      }),
      prisma.analyticsEvent.findMany({
        where: { businessId: business.id },
        select: { eventType: true, createdAt: true },
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

      totalQrScans = Math.max(liveQrScans, totalQrScans);
      totalReviewsCopied = legacyFeedbacks.filter((f) => f.reviewCopiedAt).length;
      totalGoogleClicks = legacyFeedbacks.filter((f) => f.googleLinkClickedAt).length;
    } else {
      totalQrScans = Math.max(liveQrScans, totalQrScans);
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

export default router;
