import prisma from '../config/prisma.js';
import {
  recordDailyFeedbackAnalytics,
  recordDailyEventAnalytics,
} from '../utils/analyticsHelper.js';

/**
 * Service handling feedback submission, privacy retention, event logging, and history.
 */
export const feedbackService = {
  /**
   * Submit customer feedback according to Phase 11 Privacy Retention Policy:
   * - 4–5★: Aggregate only in DailyBusinessAnalytics. Do NOT persist raw Feedback row.
   * - 1–3★: Persist raw Feedback row temporarily (max 30 days) for operational review.
   */
  async createFeedback({ businessSlug, sessionId, rating, selectedTopics = [], customerMessage, generatedReview }) {
    // 1. Find business and check active status
    const business = await prisma.business.findUnique({
      where: { slug: businessSlug },
      include: {
        qrCodes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!business || !business.isActive) {
      const err = new Error('This business review experience is currently suspended.');
      err.code = 'BusinessSuspended';
      err.statusCode = 403;
      throw err;
    }

    // 2. Validate QR active state
    const qr = business.qrCodes[0];
    if (!qr || !qr.active) {
      const err = new Error('Feedback collection is currently paused by this business.');
      err.code = 'QRPaused';
      err.statusCode = 403;
      throw err;
    }

    // 3. Update Long-Term Aggregated Analytics (All ratings 1–5 contribute)
    await recordDailyFeedbackAnalytics(
      business.id,
      rating,
      selectedTopics,
      Boolean(generatedReview)
    );

    let feedbackId = null;

    // 4. Privacy Storage Policy:
    // Only persist raw Feedback for constructive 1-3 star ratings (auto-purged after 30 days)
    if (rating <= 3) {
      const feedback = await prisma.feedback.create({
        data: {
          businessId: business.id,
          rating,
          selectedTopics,
          customerMessage: customerMessage?.trim() || null,
          generatedReview: generatedReview?.trim() || null,
        },
      });
      feedbackId = feedback.id;
    } else {
      // For 4-5 stars, do NOT persist raw Feedback. Use transient ID for copy/google tracking.
      feedbackId = `transient-${business.id}-${Date.now()}`;
    }

    // 5. Track operational AnalyticsEvents
    try {
      const now = new Date();
      await prisma.analyticsEvent.createMany({
        data: [
          {
            businessId: business.id,
            eventType: 'FEEDBACK_STARTED',
            sessionId,
            metadata: { rating, topicsCount: selectedTopics.length },
            createdAt: now,
          },
          {
            businessId: business.id,
            eventType: 'RATING_SELECTED',
            sessionId,
            metadata: { rating },
            createdAt: new Date(now.getTime() + 10),
          },
          {
            businessId: business.id,
            eventType: 'REVIEW_GENERATED',
            sessionId,
            metadata: { hasCustomReview: Boolean(generatedReview) },
            createdAt: new Date(now.getTime() + 20),
          },
        ],
      });
    } catch (analyticsErr) {
      console.warn('[Analytics] Non-fatal logging notice on feedback creation:', analyticsErr.message);
    }

    return {
      feedbackId,
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        businessType: business.businessType,
        googleReviewUrl: business.googleReviewUrl,
      },
    };
  },

  /**
   * Record that customer clicked "Copy Review" and emit REVIEW_COPIED analytics event.
   * Compatible with both persistent (1-3★) and transient (4-5★) feedback IDs.
   */
  async recordReviewCopied(id, sessionId) {
    if (id.startsWith('transient-')) {
      const businessId = id.slice(10, id.lastIndexOf('-'));

      if (businessId) {
        await recordDailyEventAnalytics(businessId, 'REVIEW_COPIED');
        try {
          await prisma.analyticsEvent.create({
            data: {
              businessId,
              eventType: 'REVIEW_COPIED',
              sessionId: sessionId || null,
            },
          });
        } catch {
          // non-fatal
        }
      }

      return {
        feedbackId: id,
        reviewCopiedAt: new Date(),
      };
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!feedback) {
      const err = new Error('Feedback record not found.');
      err.code = 'NotFound';
      err.statusCode = 404;
      throw err;
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: {
        reviewCopiedAt: feedback.reviewCopiedAt || new Date(),
      },
    });

    await recordDailyEventAnalytics(feedback.businessId, 'REVIEW_COPIED');

    try {
      await prisma.analyticsEvent.create({
        data: {
          businessId: feedback.businessId,
          eventType: 'REVIEW_COPIED',
          sessionId: sessionId || null,
          metadata: { feedbackId: feedback.id, rating: feedback.rating },
        },
      });
    } catch (analyticsErr) {
      console.warn('[Analytics] Non-fatal logging notice on review copy:', analyticsErr.message);
    }

    return {
      feedbackId: updatedFeedback.id,
      reviewCopiedAt: updatedFeedback.reviewCopiedAt,
    };
  },

  /**
   * Record that customer clicked "Continue to Google" and emit GOOGLE_LINK_CLICKED analytics event.
   * Compatible with both persistent (1-3★) and transient (4-5★) feedback IDs.
   */
  async recordGoogleClicked(id, sessionId) {
    if (id.startsWith('transient-')) {
      const businessId = id.slice(10, id.lastIndexOf('-'));

      const business = await prisma.business.findUnique({
        where: { id: businessId },
      });

      if (business) {
        await recordDailyEventAnalytics(business.id, 'GOOGLE_LINK_CLICKED');
        try {
          await prisma.analyticsEvent.create({
            data: {
              businessId: business.id,
              eventType: 'GOOGLE_LINK_CLICKED',
              sessionId: sessionId || null,
            },
          });
        } catch {
          // non-fatal
        }
      }

      return {
        feedbackId: id,
        googleLinkClickedAt: new Date(),
        googleReviewUrl: business?.googleReviewUrl || '',
      };
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!feedback) {
      const err = new Error('Feedback record not found.');
      err.code = 'NotFound';
      err.statusCode = 404;
      throw err;
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: {
        googleLinkClickedAt: feedback.googleLinkClickedAt || new Date(),
      },
    });

    await recordDailyEventAnalytics(feedback.businessId, 'GOOGLE_LINK_CLICKED');

    try {
      await prisma.analyticsEvent.create({
        data: {
          businessId: feedback.businessId,
          eventType: 'GOOGLE_LINK_CLICKED',
          sessionId: sessionId || null,
          metadata: { feedbackId: feedback.id, rating: feedback.rating },
        },
      });
    } catch (analyticsErr) {
      console.warn('[Analytics] Non-fatal logging notice on Google link click:', analyticsErr.message);
    }

    return {
      feedbackId: updatedFeedback.id,
      googleLinkClickedAt: updatedFeedback.googleLinkClickedAt,
      googleReviewUrl: feedback.business.googleReviewUrl,
    };
  },

  /**
   * Retrieve temporary raw feedback history for the authenticated business owner.
   * Retains 1–3★ feedbacks for up to 30 days.
   * Historical summary is computed from DailyBusinessAnalytics so stats never degrade.
   */
  async getFeedbackHistory(ownerId, { rating, limit = 50, offset = 0 } = {}) {
    const business = await prisma.business.findFirst({
      where: {
        ownerId,
        isActive: true,
      },
    });

    if (!business) {
      const err = new Error('No active business profile found for this user.');
      err.code = 'NotFound';
      err.statusCode = 404;
      throw err;
    }

    const whereClause = {
      businessId: business.id,
    };

    if (rating && !isNaN(Number(rating))) {
      whereClause.rating = Number(rating);
    }

    const parsedLimit = Math.min(Math.max(1, Number(limit) || 50), 100);
    const parsedOffset = Math.max(0, Number(offset) || 0);

    const [feedbacks, totalCount, dailyRows] = await Promise.all([
      prisma.feedback.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: parsedLimit,
        skip: parsedOffset,
      }),
      prisma.feedback.count({
        where: whereClause,
      }),
      prisma.dailyBusinessAnalytics.findMany({
        where: { businessId: business.id },
      }),
    ]);

    // Calculate rating distribution from permanent daily analytics
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalAllRatings = 0;
    let sumRatings = 0;

    dailyRows.forEach((row) => {
      ratingDistribution[1] += row.rating1;
      ratingDistribution[2] += row.rating2;
      ratingDistribution[3] += row.rating3;
      ratingDistribution[4] += row.rating4;
      ratingDistribution[5] += row.rating5;

      const rowTotal = row.rating1 + row.rating2 + row.rating3 + row.rating4 + row.rating5;
      totalAllRatings += rowTotal;
      sumRatings +=
        row.rating1 * 1 +
        row.rating2 * 2 +
        row.rating3 * 3 +
        row.rating4 * 4 +
        row.rating5 * 5;
    });

    // Fallback if no daily rows exist yet
    if (totalAllRatings === 0) {
      const fallbackGroups = await prisma.feedback.groupBy({
        by: ['rating'],
        where: { businessId: business.id },
        _count: { id: true },
      });
      fallbackGroups.forEach((group) => {
        ratingDistribution[group.rating] = group._count.id;
        totalAllRatings += group._count.id;
        sumRatings += group.rating * group._count.id;
      });
    }

    const averageRating =
      totalAllRatings > 0 ? Number((sumRatings / totalAllRatings).toFixed(1)) : 0;

    return {
      feedbacks,
      totalCount,
      limit: parsedLimit,
      offset: parsedOffset,
      retentionPolicyNotice: '4–5★ reviews are aggregated without storing raw customer messages. 1–3★ feedback is retained for 30 days.',
      summary: {
        totalFeedback: totalAllRatings,
        averageRating,
        ratingDistribution,
      },
    };
  },
};

export default feedbackService;
