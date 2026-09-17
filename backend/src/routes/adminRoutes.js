import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

// Apply auth + admin verification to all admin endpoints
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * GET /api/admin/stats
 * Return overall platform metrics: total businesses, trial breakdown, feedbacks, scans.
 */
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalBusinesses,
      totalUsers,
      totalFeedbacks,
      totalQrScans,
      businessesWithSub,
    ] = await Promise.all([
      prisma.business.count(),
      prisma.user.count(),
      prisma.feedback.count(),
      prisma.analyticsEvent.count({ where: { eventType: 'QR_SCANNED' } }),
      prisma.business.findMany({
        select: {
          id: true,
          subscription: {
            select: {
              status: true,
              trialEndsAt: true,
            },
          },
        },
      }),
    ]);

    const now = new Date();
    let trialCount = 0;
    let activeCount = 0;
    let expiredCount = 0;

    businessesWithSub.forEach((b) => {
      const sub = b.subscription;
      if (!sub) return;

      const isDateExpired = sub.trialEndsAt && now > new Date(sub.trialEndsAt);
      if (sub.status === 'EXPIRED' || isDateExpired) {
        expiredCount++;
      } else if (sub.status === 'ACTIVE') {
        activeCount++;
      } else {
        trialCount++;
      }
    });

    return res.status(200).json({
      stats: {
        totalBusinesses,
        totalUsers,
        trialCount,
        activeCount,
        expiredCount,
        totalFeedbacks,
        totalQrScans,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/businesses
 * Return directory of all businesses with owner details, trial status, and activity counts.
 */
router.get('/businesses', async (req, res, next) => {
  try {
    const businesses = await prisma.business.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        subscription: true,
        _count: {
          select: {
            feedbacks: true,
            analyticsEvents: true,
          },
        },
      },
    });

    const now = new Date();

    const formattedBusinesses = businesses.map((b) => {
      const sub = b.subscription;
      let daysRemaining = 0;
      let isExpired = false;

      if (sub?.trialEndsAt) {
        const msLeft = new Date(sub.trialEndsAt).getTime() - now.getTime();
        daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
        if (msLeft <= 0 || sub.status === 'EXPIRED') {
          isExpired = true;
        }
      }

      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        businessType: b.businessType,
        googleReviewUrl: b.googleReviewUrl,
        isActive: b.isActive,
        createdAt: b.createdAt,
        owner: b.owner,
        subscription: sub
          ? {
              id: sub.id,
              status: isExpired ? 'EXPIRED' : sub.status,
              trialStartsAt: sub.trialStartsAt,
              trialEndsAt: sub.trialEndsAt,
              daysRemaining,
              isExpired,
            }
          : null,
        feedbackCount: b._count.feedbacks,
        eventsCount: b._count.analyticsEvents,
      };
    });

    return res.status(200).json({
      businesses: formattedBusinesses,
    });
  } catch (error) {
    next(error);
  }
});

const trialUpdateSchema = z.object({
  action: z.enum(['extend', 'expire', 'reactivate']),
  days: z.number().int().min(1).max(365).optional(),
});

/**
 * PATCH /api/admin/businesses/:id/trial
 * Admin management for extending trials (e.g. +7, +14, +30 days),
 * expiring access immediately, or reactivating demo access.
 */
router.patch('/businesses/:id/trial', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parseResult = trialUpdateSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid trial update payload',
        details: parseResult.error.format(),
      });
    }

    const { action, days = 7 } = parseResult.data;

    const business = await prisma.business.findUnique({
      where: { id },
      include: { subscription: true },
    });

    if (!business) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Business not found.',
      });
    }

    const now = new Date();
    let updatedSubscription;

    if (action === 'extend') {
      // Extend trial from current trialEndsAt (or now if past)
      const currentEnd =
        business.subscription?.trialEndsAt && new Date(business.subscription.trialEndsAt) > now
          ? new Date(business.subscription.trialEndsAt)
          : now;

      const newTrialEnd = new Date(currentEnd.getTime() + days * 24 * 60 * 60 * 1000);

      updatedSubscription = await prisma.subscription.upsert({
        where: { businessId: business.id },
        update: {
          status: 'TRIAL',
          trialEndsAt: newTrialEnd,
        },
        create: {
          businessId: business.id,
          status: 'TRIAL',
          trialStartsAt: now,
          trialEndsAt: newTrialEnd,
        },
      });

      // Ensure business is marked active
      await prisma.business.update({
        where: { id: business.id },
        data: { isActive: true },
      });
    } else if (action === 'expire') {
      // Set trial end date to past and status to EXPIRED
      updatedSubscription = await prisma.subscription.upsert({
        where: { businessId: business.id },
        update: {
          status: 'EXPIRED',
          trialEndsAt: new Date(now.getTime() - 1000),
        },
        create: {
          businessId: business.id,
          status: 'EXPIRED',
          trialEndsAt: new Date(now.getTime() - 1000),
        },
      });
    } else if (action === 'reactivate') {
      // Reactivate with requested days (default 14 days)
      const newTrialEnd = new Date(now.getTime() + (days || 14) * 24 * 60 * 60 * 1000);

      updatedSubscription = await prisma.subscription.upsert({
        where: { businessId: business.id },
        update: {
          status: 'TRIAL',
          trialStartsAt: now,
          trialEndsAt: newTrialEnd,
        },
        create: {
          businessId: business.id,
          status: 'TRIAL',
          trialStartsAt: now,
          trialEndsAt: newTrialEnd,
        },
      });

      await prisma.business.update({
        where: { id: business.id },
        data: { isActive: true },
      });
    }

    const msLeft = updatedSubscription.trialEndsAt
      ? new Date(updatedSubscription.trialEndsAt).getTime() - now.getTime()
      : 0;
    const daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

    return res.status(200).json({
      message: `Business trial successfully updated with action: ${action}`,
      subscription: {
        ...updatedSubscription,
        daysRemaining,
        isExpired: updatedSubscription.status === 'EXPIRED' || msLeft <= 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
