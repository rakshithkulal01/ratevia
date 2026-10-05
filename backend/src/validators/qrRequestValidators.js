import { z } from 'zod';
import { SUPPORTED_CATEGORIES } from '../config/businessCategories.js';

const ALLOWED_ACCENTS = ['ratevia-blue', 'warm', 'elegant', 'bold', 'neutral'];
const ALLOWED_STYLES = ['classic', 'soft'];

export const createPublicQRRequestSchema = z.object({
  businessName: z
    .string({ required_error: 'Business name is required' })
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name cannot exceed 100 characters'),
  category: z.enum(SUPPORTED_CATEGORIES, {
    errorMap: () => ({ message: `Category must be one of: ${SUPPORTED_CATEGORIES.join(', ')}` }),
  }),
  contactName: z
    .string({ required_error: 'Contact name is required' })
    .trim()
    .min(2, 'Contact name must be at least 2 characters')
    .max(100, 'Contact name cannot exceed 100 characters'),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .min(5, 'Phone number must be at least 5 digits')
    .max(20, 'Phone number cannot exceed 20 characters'),
  countryCode: z.string().trim().optional().default('+91'),
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .email('Please provide a valid email address')
    .max(150, 'Email cannot exceed 150 characters'),
  city: z
    .string()
    .trim()
    .max(100, 'City cannot exceed 100 characters')
    .optional()
    .nullable(),
  destinationUrl: z
    .string({ required_error: 'Destination URL is required' })
    .trim()
    .url('Please provide a valid URL (e.g., https://yourwebsite.com)')
    .refine((url) => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
      } catch {
        return false;
      }
    }, 'URL must use http or https protocol'),
  qrConfig: z
    .object({
      selectedAccent: z.enum(ALLOWED_ACCENTS).optional().default('ratevia-blue'),
      selectedStyle: z.enum(ALLOWED_STYLES).optional().default('classic'),
      selectedMessage: z.string().trim().max(200).optional().nullable(),
      initials: z.string().trim().max(10).optional().nullable(),
      tagline: z.string().trim().max(100).optional().nullable(),
      badgeType: z.enum(['sparkle', 'initials', 'none']).optional().default('sparkle'),
    })
    .strict()
    .optional()
    .default({}),
  stickerImage: z.string().max(3 * 1024 * 1024, 'Sticker image exceeds maximum allowed size').optional(),
  stickerImageUrl: z.string().max(1000).optional().nullable(),
});

export const updatePriceSchema = z.object({
  price: z
    .number({ required_error: 'Price is required' })
    .min(0, 'Price must be non-negative')
    .max(1000000, 'Price must not exceed 10,00,000'),
  currency: z.string().trim().min(3).max(5).optional().default('INR'),
});

export const rejectRequestSchema = z.object({
  reason: z.string().trim().max(500, 'Reason cannot exceed 500 characters').optional().nullable(),
});
