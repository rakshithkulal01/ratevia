import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { generateUniqueBusinessSlug } from '../utils/slug.js';
import { SUPPORTED_CATEGORIES } from '../config/businessCategories.js';

const router = Router();

// Apply auth + admin verification to all admin endpoints
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * GET /api/admin/stats
 * Return overall platform metrics: total businesses, active vs suspended, feedbacks, scans.
 */
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalBusinesses,
      activeBusinesses,
      suspendedBusinesses,
      totalUsers,
      totalFeedbacks,
      totalQrScans,
      totalRequests,
      newRequests,
      contactedRequests,
    ] = await Promise.all([
      prisma.business.count(),
      prisma.business.count({ where: { isActive: true } }),
      prisma.business.count({ where: { isActive: false } }),
      prisma.user.count(),
      prisma.feedback.count(),
      prisma.analyticsEvent.count({ where: { eventType: 'QR_SCANNED' } }),
      prisma.businessRequest.count(),
      prisma.businessRequest.count({ where: { status: 'NEW' } }),
      prisma.businessRequest.count({ where: { status: 'CONTACTED' } }),
    ]);

    return res.status(200).json({
      stats: {
        totalBusinesses,
        activeBusinesses,
        suspendedBusinesses,
        totalUsers,
        totalFeedbacks,
        totalQrScans,
        totalRequests,
        newRequests,
        contactedRequests,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/business-requests
 * Return list of business registration requests sorted newest first.
 * Supports optional ?status= query filter.
 */
router.get('/business-requests', async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status && ['NEW', 'CONTACTED', 'PROVISIONED', 'REJECTED'].includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    const requests = await prisma.businessRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        contactedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        provisionedBusiness: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return res.status(200).json({
      requests,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/business-requests/:id/contact
 * Mark a business request as CONTACTED by current admin.
 * Idempotent: If already CONTACTED or PROVISIONED, does not overwrite contactedAt/contactedById.
 */
router.patch('/business-requests/:id/contact', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.businessRequest.findUnique({
      where: { id },
      include: {
        contactedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        provisionedBusiness: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Business request not found.',
      });
    }

    // Idempotent: If already CONTACTED or PROVISIONED, do not re-stamp
    if (existing.status === 'CONTACTED' || existing.status === 'PROVISIONED') {
      return res.status(200).json({
        success: true,
        message: 'Request is already marked as contacted.',
        request: existing,
      });
    }

    const updated = await prisma.businessRequest.update({
      where: { id },
      data: {
        status: 'CONTACTED',
        contactedAt: new Date(),
        contactedById: req.user?.id || null,
      },
      include: {
        contactedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        provisionedBusiness: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    console.log(`[AdminContact] BusinessRequest "${updated.businessName}" marked CONTACTED by ${req.user?.email}`);

    return res.status(200).json({
      success: true,
      message: 'Business request marked as contacted.',
      request: updated,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/businesses
 * Return directory of all businesses with owner details and ACTIVE/SUSPENDED status.
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
        _count: {
          select: {
            feedbacks: true,
            analyticsEvents: true,
          },
        },
      },
    });

    const formattedBusinesses = businesses.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      businessType: b.businessType,
      googleReviewUrl: b.googleReviewUrl,
      isActive: b.isActive,
      status: b.isActive ? 'ACTIVE' : 'SUSPENDED',
      createdAt: b.createdAt,
      owner: b.owner,
      feedbackCount: b._count.feedbacks,
      eventsCount: b._count.analyticsEvents,
    }));

    return res.status(200).json({
      businesses: formattedBusinesses,
    });
  } catch (error) {
    next(error);
  }
});

const provisionBusinessSchema = z.object({
  name: z
    .string({ required_error: 'Business name is required' })
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(100),
  businessType: z.enum(SUPPORTED_CATEGORIES, {
    errorMap: () => ({ message: `Category must be one of: ${SUPPORTED_CATEGORIES.join(', ')}` }),
  }),
  googleReviewUrl: z
    .string({ required_error: 'Google Review URL is required' })
    .trim()
    .url('Please enter a valid URL'),
  ownerEmail: z
    .string({ required_error: 'Owner email is required' })
    .trim()
    .email('Please enter a valid email address'),
  ownerName: z.string().trim().optional().nullable(),
  requestId: z.string().uuid().optional().nullable(),
});

/**
 * POST /api/admin/businesses
 * Admin-only provisioning of new businesses after ₹1,000 one-time manual payment.
 * Uses atomic Prisma transaction to provision business and link business request if provided.
 */
router.post('/businesses', async (req, res, next) => {
  try {
    const parseResult = provisionBusinessSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: parseResult.error.errors[0]?.message || 'Invalid input data',
        details: parseResult.error.format(),
      });
    }

    const { name, businessType, googleReviewUrl, ownerEmail, ownerName, requestId } = parseResult.data;
    const normalizedEmail = ownerEmail.toLowerCase();

    // If requestId is provided, verify request exists and is not already provisioned
    if (requestId) {
      const existingReq = await prisma.businessRequest.findUnique({
        where: { id: requestId },
      });

      if (!existingReq) {
        return res.status(404).json({
          error: 'NotFound',
          message: 'Business request not found.',
        });
      }

      if (existingReq.status === 'PROVISIONED' || existingReq.provisionedBusinessId) {
        return res.status(409).json({
          error: 'AlreadyProvisioned',
          message: 'This registration request has already been converted into a business.',
        });
      }
    }

    // Atomic transaction for provisioning and linking
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or create local User record for the owner
      let owner = await tx.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!owner) {
        owner = await tx.user.create({
          data: {
            email: normalizedEmail,
            name: ownerName || null,
            role: 'BUSINESS_OWNER',
            supabaseUserId: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          },
        });
      } else if (ownerName && !owner.name) {
        owner = await tx.user.update({
          where: { id: owner.id },
          data: { name: ownerName },
        });
      }

      // 2. Generate unique slug using transaction client
      const slug = await generateUniqueBusinessSlug(name, tx);

      // 3. Create Business with active QRCode
      const business = await tx.business.create({
        data: {
          ownerId: owner.id,
          name,
          businessType,
          googleReviewUrl,
          slug,
          isActive: true,
          qrCodes: {
            create: {
              active: true,
            },
          },
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          qrCodes: {
            where: { active: true },
            take: 1,
          },
        },
      });

      // 4. If requestId is provided, update BusinessRequest atomically
      let linkedRequest = null;
      if (requestId) {
        linkedRequest = await tx.businessRequest.update({
          where: { id: requestId },
          data: {
            status: 'PROVISIONED',
            provisionedBusinessId: business.id,
          },
        });
      }

      return { business, linkedRequest };
    }, { maxWait: 15000, timeout: 30000 });

    const { business, linkedRequest } = result;

    console.log(
      `[AdminProvisioning] Business "${business.name}" (${business.slug}) provisioned for ${business.owner?.email}${
        linkedRequest ? ` (linked to request ${linkedRequest.id})` : ''
      }`
    );

    return res.status(201).json({
      success: true,
      message: 'Business provisioned successfully.',
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        businessType: business.businessType,
        googleReviewUrl: business.googleReviewUrl,
        isActive: business.isActive,
        status: 'ACTIVE',
        owner: business.owner,
        qrCode: business.qrCodes[0],
      },
      linkedRequestId: linkedRequest ? linkedRequest.id : null,
    });
  } catch (error) {
    next(error);
  }
});

const statusUpdateSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
  isActive: z.boolean().optional(),
});

/**
 * PATCH /api/admin/businesses/:id/status
 * Admin toggle for activating or suspending a business account.
 */
router.patch('/businesses/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parseResult = statusUpdateSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid status payload. Expected status: "ACTIVE" | "SUSPENDED" or isActive: boolean',
      });
    }

    const { status, isActive } = parseResult.data;
    const targetIsActive = isActive !== undefined ? isActive : status === 'ACTIVE';

    const business = await prisma.business.findUnique({
      where: { id },
    });

    if (!business) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Business not found.',
      });
    }

    const updated = await prisma.business.update({
      where: { id },
      data: {
        isActive: targetIsActive,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Business status successfully set to ${targetIsActive ? 'ACTIVE' : 'SUSPENDED'}`,
      business: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        isActive: updated.isActive,
        status: updated.isActive ? 'ACTIVE' : 'SUSPENDED',
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
