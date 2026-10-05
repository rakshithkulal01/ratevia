import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import prisma from '../config/prisma.js';
import { env } from '../config/env.js';
import { getCustomerReviewUrl } from '../utils/url.js';

import { publicQrLimiter } from '../middleware/rateLimiter.js';
import { ensureDbUser } from '../utils/ensureDbUser.js';

const router = Router();

/**
 * GET /api/qr
 * Retrieve the active business QR configuration and customer routing URL
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    await ensureDbUser(req);

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

    const customerUrl = getCustomerReviewUrl(business.slug);

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
    await ensureDbUser(req);

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

    const customerUrl = getCustomerReviewUrl(business.slug);

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
    await ensureDbUser(req);

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
router.get('/public/:businessSlug', publicQrLimiter, async (req, res, next) => {
  try {
    const { businessSlug } = req.params;

    const cleanSlug = typeof businessSlug === 'string' ? businessSlug.trim() : '';
    if (!cleanSlug) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Business slug is required.',
      });
    }

    // High-performance narrow select using unique slug index (zero subscription join, zero sensitive columns)
    let business = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        business = await prisma.business.findUnique({
          where: { slug: cleanSlug },
          select: {
            id: true,
            name: true,
            slug: true,
            businessType: true,
            googleReviewUrl: true,
            isActive: true,
            qrCodes: {
              select: {
                active: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        });
        break;
      } catch (dbErr) {
        const isTransient =
          dbErr.code === 'P1001' ||
          dbErr.code === 'P2024' ||
          dbErr.message?.includes('closed the connection') ||
          dbErr.message?.includes('handshake') ||
          dbErr.message?.includes('TLS') ||
          dbErr.message?.includes('EOF') ||
          dbErr.message?.includes('ConnectionReset') ||
          dbErr.message?.includes("Can't reach database") ||
          dbErr.message?.includes('connection pool');

        if (attempt < 2 && isTransient) {
          await new Promise((r) => setTimeout(r, 50 * (attempt + 1) + Math.random() * 50));
          continue;
        }
        throw dbErr;
      }
    }

    if (!business || !business.isActive) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(403).json({
        error: 'BusinessSuspended',
        isSuspended: true,
        isExpired: true,
        business: {
          name: business?.name || 'Business',
          slug: cleanSlug,
        },
        message: 'This business review experience is currently suspended.',
      });
    }

    // Check if QR code is paused by business owner
    const qr = business.qrCodes[0];
    if (!qr || !qr.active) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
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

    // Fast, read-only response with HTTP browser/edge caching.
    // Scan analytics are collected asynchronously via frontend batching.
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

    return res.status(200).json({
      business: {
        name: business.name,
        businessType: business.businessType,
        category: business.businessType,
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
