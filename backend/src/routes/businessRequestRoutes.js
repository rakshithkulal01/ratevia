import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma.js';
import { SUPPORTED_CATEGORIES } from '../config/businessCategories.js';
import { normalizePhoneNumber } from '../utils/phone.js';

const router = Router();

const createBusinessRequestSchema = z.object({
  ownerName: z
    .string({ required_error: 'Owner / Contact Name is required' })
    .trim()
    .min(2, 'Owner name must be at least 2 characters')
    .max(100, 'Owner name cannot exceed 100 characters'),
  businessName: z
    .string({ required_error: 'Business name is required' })
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name cannot exceed 100 characters'),
  businessType: z.enum(SUPPORTED_CATEGORIES, {
    errorMap: () => ({ message: `Business category must be one of: ${SUPPORTED_CATEGORIES.join(', ')}` }),
  }),
  phoneNumber: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .min(5, 'Phone number is required'),
  countryCode: z.string().trim().optional().default('+91'),
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Please provide a valid email address'),
  city: z
    .string({ required_error: 'City / Location is required' })
    .trim()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City cannot exceed 100 characters'),
  message: z
    .string()
    .trim()
    .max(1000, 'Message cannot exceed 1000 characters')
    .optional()
    .nullable(),
});

/**
 * POST /api/business-requests
 * Public endpoint for businesses submitting a registration request to Ratevia.
 */
router.post('/', async (req, res, next) => {
  try {
    const parseResult = createBusinessRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: parseResult.error.errors[0]?.message || 'Invalid input data',
        details: parseResult.error.format(),
      });
    }

    const {
      ownerName,
      businessName,
      businessType,
      phoneNumber,
      countryCode,
      email,
      city,
      message,
    } = parseResult.data;

    // Normalize phone number (handling country code prefix if separate)
    const combinedPhone = phoneNumber.startsWith('+')
      ? phoneNumber
      : `${countryCode || '+91'} ${phoneNumber}`;
    const normalizedPhone = normalizePhoneNumber(combinedPhone, countryCode || '+91');

    if (!normalizedPhone) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Please provide a valid phone number with 10 to 15 digits.',
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase();

    // Duplicate protection: Check for active requests created within the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const existingRequest = await prisma.businessRequest.findFirst({
      where: {
        createdAt: { gte: twentyFourHoursAgo },
        status: { in: ['NEW', 'CONTACTED'] },
        OR: [
          { phoneNumber: normalizedPhone },
          { email: normalizedEmail },
        ],
      },
    });

    if (existingRequest) {
      return res.status(409).json({
        error: 'DuplicateRequest',
        message:
          'A registration request for this business was recently submitted. Our team will contact you shortly.',
      });
    }

    // Create the BusinessRequest entity
    const businessRequest = await prisma.businessRequest.create({
      data: {
        ownerName,
        businessName,
        businessType,
        phoneNumber: normalizedPhone,
        email: normalizedEmail,
        city,
        message: message || null,
        status: 'NEW',
      },
    });

    console.log(
      `[BusinessRequest] New registration request received from "${businessName}" (${normalizedPhone}, ${normalizedEmail})`
    );

    return res.status(201).json({
      success: true,
      message:
        "Request received. Thanks for your interest in Ratevia. We'll contact you shortly to understand your business and help you get started.",
      request: {
        id: businessRequest.id,
        businessName: businessRequest.businessName,
        status: businessRequest.status,
        createdAt: businessRequest.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
