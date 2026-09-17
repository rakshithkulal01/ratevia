import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Zod schema for POST /api/feedback
const createFeedbackSchema = z.object({
  businessSlug: z.string().min(1, 'Business slug is required'),
  sessionId: z.string().uuid('A valid session UUID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  selectedTopics: z.array(z.string()).default([]),
  customerMessage: z.string().max(2000).optional().nullable(),
  generatedReview: z.string().max(4000).optional().nullable(),
});

/**
 * POST /api/feedback
 * Submit customer feedback, generate database record, and track initial analytics events.
 */
router.post('/', async (req, res, next) => {
  try {
    const parseResult = createFeedbackSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid feedback submission data',
        details: parseResult.error.format(),
      });
    }

    const { businessSlug, sessionId, rating, selectedTopics, customerMessage, generatedReview } =
      parseResult.data;

    // 1. Find business and check relationships
    const business = await prisma.business.findUnique({
      where: { slug: businessSlug },
      include: {
        subscription: true,
        qrCodes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!business || !business.isActive) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Business not found or is currently inactive.',
      });
    }

    // 2. Validate subscription status (TRIAL or ACTIVE, not expired)
    const isExpired =
      business.subscription?.status === 'EXPIRED' ||
      (business.subscription?.trialEndsAt && new Date() > new Date(business.subscription.trialEndsAt));

    if (isExpired) {
      return res.status(403).json({
        error: 'SubscriptionExpired',
        message: 'This business subscription has expired. Feedback collection is unavailable.',
      });
    }

    // 3. Validate QR active state
    const qr = business.qrCodes[0];
    if (!qr || !qr.active) {
      return res.status(403).json({
        error: 'QRPaused',
        message: 'Feedback collection is currently paused by this business.',
      });
    }

    // 4. Create Feedback record
    const feedback = await prisma.feedback.create({
      data: {
        businessId: business.id,
        rating,
        selectedTopics,
        customerMessage: customerMessage?.trim() || null,
        generatedReview: generatedReview?.trim() || null,
      },
    });

    // 5. Track Analytics Events: FEEDBACK_STARTED, RATING_SELECTED, REVIEW_GENERATED
    try {
      const now = new Date();
      await prisma.analyticsEvent.createMany({
        data: [
          {
            businessId: business.id,
            eventType: 'FEEDBACK_STARTED',
            sessionId,
            metadata: { feedbackId: feedback.id, rating, topicsCount: selectedTopics.length },
            createdAt: now,
          },
          {
            businessId: business.id,
            eventType: 'RATING_SELECTED',
            sessionId,
            metadata: { feedbackId: feedback.id, rating },
            createdAt: new Date(now.getTime() + 10),
          },
          {
            businessId: business.id,
            eventType: 'REVIEW_GENERATED',
            sessionId,
            metadata: { feedbackId: feedback.id, hasCustomReview: Boolean(generatedReview) },
            createdAt: new Date(now.getTime() + 20),
          },
        ],
      });
    } catch (analyticsErr) {
      console.warn('[Analytics] Non-fatal logging notice on feedback creation:', analyticsErr.message);
    }

    return res.status(201).json({
      success: true,
      feedbackId: feedback.id,
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        businessType: business.businessType,
        googleReviewUrl: business.googleReviewUrl,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/feedback/:id/copied
 * Record that customer clicked "Copy Review" and emit REVIEW_COPIED analytics event.
 */
router.patch('/:id/copied', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sessionId } = req.body || {};

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!feedback) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Feedback record not found.',
      });
    }

    // Set reviewCopiedAt if not already recorded
    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: {
        reviewCopiedAt: feedback.reviewCopiedAt || new Date(),
      },
    });

    // Track REVIEW_COPIED analytics event
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

    return res.status(200).json({
      success: true,
      feedbackId: updatedFeedback.id,
      reviewCopiedAt: updatedFeedback.reviewCopiedAt,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/feedback/:id/google-clicked
 * Record that customer clicked "Continue to Google" and emit GOOGLE_LINK_CLICKED analytics event.
 */
router.patch('/:id/google-clicked', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sessionId } = req.body || {};

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!feedback) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Feedback record not found.',
      });
    }

    // Set googleLinkClickedAt if not already recorded
    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: {
        googleLinkClickedAt: feedback.googleLinkClickedAt || new Date(),
      },
    });

    // Track GOOGLE_LINK_CLICKED analytics event
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

    return res.status(200).json({
      success: true,
      feedbackId: updatedFeedback.id,
      googleLinkClickedAt: updatedFeedback.googleLinkClickedAt,
      googleReviewUrl: feedback.business.googleReviewUrl,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/feedback
 * Retrieve feedback history for the authenticated business owner.
 * Supports optional query params: ?rating=1..5&limit=50&offset=0
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { rating, limit = 50, offset = 0 } = req.query;

    // Find the business owned by the authenticated user
    const business = await prisma.business.findFirst({
      where: {
        ownerId: req.user.id,
        isActive: true,
      },
    });

    if (!business) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'No active business profile found for this user.',
      });
    }

    const whereClause = {
      businessId: business.id,
    };

    if (rating && !isNaN(Number(rating))) {
      whereClause.rating = Number(rating);
    }

    const parsedLimit = Math.min(Math.max(1, Number(limit) || 50), 100);
    const parsedOffset = Math.max(0, Number(offset) || 0);

    const [feedbacks, totalCount, statsGroup] = await Promise.all([
      prisma.feedback.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: parsedLimit,
        skip: parsedOffset,
      }),
      prisma.feedback.count({
        where: whereClause,
      }),
      prisma.feedback.groupBy({
        by: ['rating'],
        where: { businessId: business.id },
        _count: { id: true },
      }),
    ]);

    // Calculate rating distribution and overall summary
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalAllRatings = 0;
    let sumRatings = 0;

    statsGroup.forEach((group) => {
      ratingDistribution[group.rating] = group._count.id;
      totalAllRatings += group._count.id;
      sumRatings += group.rating * group._count.id;
    });

    const averageRating =
      totalAllRatings > 0 ? Number((sumRatings / totalAllRatings).toFixed(1)) : 0;

    return res.status(200).json({
      feedbacks,
      totalCount,
      limit: parsedLimit,
      offset: parsedOffset,
      summary: {
        totalFeedback: totalAllRatings,
        averageRating,
        ratingDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
