import { z } from 'zod';
import { SUPPORTED_CATEGORIES } from '../config/businessCategories.js';

export const provisionBusinessSchema = z.object({
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

export const statusUpdateSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
  isActive: z.boolean().optional(),
});
