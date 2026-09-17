import { Router } from 'express';
import prisma from '../config/prisma.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * GET /api/analytics
 * Retrieve comprehensive business analytics, KPI counts, rating breakdowns,
 * and topic trends for Recharts visualization.
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const business = await prisma.business.findFirst({
      where: {
        ownerId: req.user.id,
        isActive: true,
      },
      include: {
        subscription: true,
      },
    });

    if (!business) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'No active business profile found.',
      });
    }

    // 1. Fetch total counts
    const [
      totalQrScans,
      totalFeedbacks,
      googleClicksCount,
      reviewsCopiedCount,
      feedbacksList,
    ] = await Promise.all([
      prisma.analyticsEvent.count({
        where: {
          businessId: business.id,
          eventType: 'QR_SCANNED',
        },
      }),
      prisma.feedback.count({
        where: {
          businessId: business.id,
        },
      }),
      prisma.analyticsEvent.count({
        where: {
          businessId: business.id,
          eventType: 'GOOGLE_LINK_CLICKED',
        },
      }),
      prisma.analyticsEvent.count({
        where: {
          businessId: business.id,
          eventType: 'REVIEW_COPIED',
        },
      }),
      prisma.feedback.findMany({
        where: {
          businessId: business.id,
        },
        select: {
          id: true,
          rating: true,
          selectedTopics: true,
          createdAt: true,
          googleLinkClickedAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ]);

    // 2. Compute Rating Distribution & Average Rating
    const ratingDistribution = [
      { rating: '5 Stars', count: 0, stars: 5, fill: '#10B981' },
      { rating: '4 Stars', count: 0, stars: 4, fill: '#3B82F6' },
      { rating: '3 Stars', count: 0, stars: 3, fill: '#F59E0B' },
      { rating: '2 Stars', count: 0, stars: 2, fill: '#F97316' },
      { rating: '1 Star', count: 0, stars: 1, fill: '#EF4444' },
    ];

    let totalSum = 0;
    const likedTopicsMap = {};
    const improvementTopicsMap = {};

    feedbacksList.forEach((fb) => {
      totalSum += fb.rating;

      // Update distribution
      const distItem = ratingDistribution.find((d) => d.stars === fb.rating);
      if (distItem) distItem.count++;

      // Tally topics
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

    const averageRating =
      feedbacksList.length > 0
        ? Number((totalSum / feedbacksList.length).toFixed(1))
        : 0;

    // 3. Transform topic breakdown arrays (sorted by count desc)
    const mostLikedTopics = Object.entries(likedTopicsMap)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const improvementAreas = Object.entries(improvementTopicsMap)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // 4. Compute Activity over the last 14 days
    const last14DaysMap = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      last14DaysMap[dateKey] = { date: dateKey, feedbacks: 0, avgRating: 0, sumRating: 0 };
    }

    feedbacksList.forEach((fb) => {
      const dateKey = new Date(fb.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      if (last14DaysMap[dateKey]) {
        last14DaysMap[dateKey].feedbacks++;
        last14DaysMap[dateKey].sumRating += fb.rating;
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
      { step: 'Reviews Copied', count: reviewsCopiedCount },
      { step: 'Google Link Clicked', count: Math.max(googleClicksCount, feedbacksList.filter(f => f.googleLinkClickedAt).length) },
    ];

    // 6. Trial info & days remaining
    const trialEndsAt = business.subscription?.trialEndsAt;
    let daysRemaining = 0;
    let isExpired = business.subscription?.status === 'EXPIRED';

    if (trialEndsAt) {
      const msLeft = new Date(trialEndsAt).getTime() - new Date().getTime();
      daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      if (msLeft <= 0) isExpired = true;
    }

    const conversionRate =
      totalQrScans > 0
        ? Number(((funnel[3].count / totalQrScans) * 100).toFixed(1))
        : 0;

    return res.status(200).json({
      overview: {
        totalQrScans,
        totalFeedbacks,
        googleClicks: funnel[3].count,
        reviewsCopied: reviewsCopiedCount,
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
      },
      subscription: {
        status: isExpired ? 'EXPIRED' : business.subscription?.status || 'TRIAL',
        trialEndsAt,
        daysRemaining,
        isExpired,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
