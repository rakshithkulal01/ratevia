import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import prisma from '../config/prisma.js';
import { env } from '../config/env.js';

const router = Router();

/**
 * GET /api/qr
 * Retrieve the active business QR configuration and customer routing URL
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
        qrCodes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!business) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'No active business profile found. Please complete onboarding first.',
      });
    }

    let qrCode = business.qrCodes[0];

    // If for any reason no QR code exists yet, create one
    if (!qrCode) {
      qrCode = await prisma.qRCode.create({
        data: {
          businessId: business.id,
          active: true,
        },
      });
    }

    const frontendBase = env.FRONTEND_URL || 'http://localhost:5173';
    const customerUrl = `${frontendBase}/r/${business.slug}`;

    return res.status(200).json({
      qrCode,
      business: {
        id: business.id,
        name: business.name,
        businessType: business.businessType,
        slug: business.slug,
        isActive: business.isActive,
      },
      subscription: business.subscription,
      customerUrl,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/qr/regenerate
 * Regenerate a new active QR code for the business
 */
router.post('/regenerate', authMiddleware, async (req, res, next) => {
  try {
    const business = await prisma.business.findFirst({
      where: {
        ownerId: req.user.id,
        isActive: true,
      },
    });

    if (!business) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'No active business profile found.',
      });
    }

    // Deactivate previous QR codes
    await prisma.qRCode.updateMany({
      where: { businessId: business.id },
      data: { active: false },
    });

    // Create fresh active QR code
    const newQr = await prisma.qRCode.create({
      data: {
        businessId: business.id,
        active: true,
      },
    });

    const frontendBase = env.FRONTEND_URL || 'http://localhost:5173';
    const customerUrl = `${frontendBase}/r/${business.slug}`;

    return res.status(201).json({
      qrCode: newQr,
      customerUrl,
      message: 'QR code regenerated successfully.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/qr/toggle
 * Toggle active status of the business QR code (pause or resume review intake)
 */
router.patch('/toggle', authMiddleware, async (req, res, next) => {
  try {
    const business = await prisma.business.findFirst({
      where: {
        ownerId: req.user.id,
        isActive: true,
      },
      include: {
        qrCodes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!business || business.qrCodes.length === 0) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'No QR code found to toggle.',
      });
    }

    const currentQr = business.qrCodes[0];
    const updatedQr = await prisma.qRCode.update({
      where: { id: currentQr.id },
      data: { active: !currentQr.active },
    });

    return res.status(200).json({
      qrCode: updatedQr,
      message: updatedQr.active
        ? 'QR code is now active and collecting reviews.'
        : 'QR code is now paused. Customers will see a temporary pause notice.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/qr/public/:businessSlug
 * Public endpoint when customer scans the QR code at /r/:businessSlug
 */
router.get('/public/:businessSlug', async (req, res, next) => {
  try {
    const { businessSlug } = req.params;

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

    // Check trial expiration
    const isExpired =
      business.subscription?.status === 'EXPIRED' ||
      (business.subscription?.trialEndsAt && new Date() > new Date(business.subscription.trialEndsAt));

    if (isExpired) {
      return res.status(403).json({
        error: 'SubscriptionExpired',
        isExpired: true,
        business: {
          name: business.name,
          slug: business.slug,
        },
        message: 'This business review experience is temporarily unavailable.',
      });
    }

    // Check if QR code is paused
    const qr = business.qrCodes[0];
    if (!qr || !qr.active) {
      return res.status(403).json({
        error: 'QRPaused',
        isPaused: true,
        business: {
          name: business.name,
          slug: business.slug,
        },
        message: 'Feedback collection is currently paused by this business.',
      });
    }

    // Log QR_SCANNED analytics event
    try {
      await prisma.analyticsEvent.create({
        data: {
          businessId: business.id,
          eventType: 'QR_SCANNED',
          sessionId: req.headers['x-session-id'] || null,
          metadata: {
            userAgent: req.headers['user-agent'] || null,
            ip: req.ip || null,
          },
        },
      });
    } catch (analyticsErr) {
      console.warn('[Analytics] QR_SCANNED non-fatal logging notice:', analyticsErr.message);
    }

    return res.status(200).json({
      business: {
        id: business.id,
        name: business.name,
        businessType: business.businessType,
        slug: business.slug,
        googleReviewUrl: business.googleReviewUrl,
      },
      active: true,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
