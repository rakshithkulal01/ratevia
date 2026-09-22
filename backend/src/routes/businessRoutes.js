import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/authMiddleware.js';
import prisma from '../config/prisma.js';
import { generateUniqueBusinessSlug } from '../utils/slug.js';
import { SUPPORTED_CATEGORIES } from '../config/businessCategories.js';

const router = Router();

// Centrally defined demo trial duration
const TRIAL_DAYS = 20;

// Zod schema for business onboarding
const createBusinessSchema = z.object({
  name: z
    .string({ required_error: 'Business name is required' })
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must not exceed 100 characters'),
  businessType: z.enum(SUPPORTED_CATEGORIES, {
    errorMap: () => ({ message: `Business type must be one of: ${SUPPORTED_CATEGORIES.join(', ')}` }),
  }),
  googleReviewUrl: z
    .string({ required_error: 'Google review URL is required' })
    .trim()
    .url('Please enter a valid URL')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'URL must start with http:// or https://'
    ),
});

// Zod schema for updating business profile
const updateBusinessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must not exceed 100 characters')
    .optional(),
  businessType: z.enum(SUPPORTED_CATEGORIES).optional(),
  googleReviewUrl: z
    .string()
    .trim()
    .url('Please enter a valid URL')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'URL must start with http:// or https://'
    )
    .optional(),
});

// Helper: Ensure user exists in local PostgreSQL database
const ensureDbUser = async (req) => {
  if (req.user?.id) return req.user;

  // If user hasn't been synced yet, auto-sync using supabaseUserId
  let dbUser = await prisma.user.findUnique({
    where: { supabaseUserId: req.user.supabaseUserId },
  });

  if (!dbUser) {
    const name = req.user.metadata?.name || req.user.metadata?.full_name || null;
    dbUser = await prisma.user.create({
      data: {
        supabaseUserId: req.user.supabaseUserId,
        email: req.user.email,
        name,
        role: 'BUSINESS_OWNER',
      },
    });
  }

  req.user.id = dbUser.id;
  return req.user;
};

/**
 * POST /api/business
 * Create a new business profile with 20-day TRIAL subscription and active QRCode
 */
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    await ensureDbUser(req);

    // Phase 11: Public self-registration disabled; admin-only provisioning
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'AdminProvisioningRequired',
        message:
          'Public self-service business creation is disabled. Ratevia businesses are provisioned manually by the Ratevia administration after ₹1,000 purchase. Please contact our team.',
      });
    }

    // Validate request body
    const validationResult = createBusinessSchema.safeParse(req.body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]?.message || 'Invalid input data';
      return res.status(400).json({
        error: 'ValidationError',
        message: firstError,
        details: validationResult.error.format(),
      });
    }

    const { name, businessType, googleReviewUrl } = validationResult.data;

    // Generate guaranteed unique slug
    const slug = await generateUniqueBusinessSlug(name);

    // Calculate trial dates on server
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);

    // Atomic creation: Business + Subscription (TRIAL) + QRCode (active)
    const business = await prisma.business.create({
      data: {
        ownerId: req.user.id,
        name,
        businessType,
        googleReviewUrl,
        slug,
        isActive: true,
        subscription: {
          create: {
            status: 'TRIAL',
            trialStartsAt: now,
            trialEndsAt: trialEndsAt,
          },
        },
        qrCodes: {
          create: {
            active: true,
          },
        },
      },
      include: {
        subscription: true,
        qrCodes: {
          where: { active: true },
          take: 1,
        },
      },
    });

    console.log(`[BusinessCreated] "${business.name}" (${business.slug}) with 20-day trial`);

    return res.status(201).json({
      business,
      subscription: business.subscription,
      qrCode: business.qrCodes[0],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/business
 * Retrieve the authenticated user's active business and trial status
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
          where: { active: true },
          take: 1,
        },
      },
    });

    if (!business) {
      return res.status(200).json({
        business: null,
      });
    }

    return res.status(200).json({
      business,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/business
 * Update business details (name, businessType, googleReviewUrl)
 */
router.patch('/', authMiddleware, async (req, res, next) => {
  try {
    await ensureDbUser(req);

    const validationResult = updateBusinessSchema.safeParse(req.body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]?.message || 'Invalid update data';
      return res.status(400).json({
        error: 'ValidationError',
        message: firstError,
        details: validationResult.error.format(),
      });
    }

    const business = await prisma.business.findFirst({
      where: {
        ownerId: req.user.id,
        isActive: true,
      },
    });

    if (!business) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'No active business profile found to update.',
      });
    }

    // Only allow updating whitelisted fields
    const updated = await prisma.business.update({
      where: { id: business.id },
      data: validationResult.data,
      include: {
        subscription: true,
        qrCodes: { where: { active: true }, take: 1 },
      },
    });

    return res.status(200).json({
      business: updated,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
