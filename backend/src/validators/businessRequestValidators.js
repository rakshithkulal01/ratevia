import { z } from 'zod';
import { SUPPORTED_CATEGORIES } from '../config/businessCategories.js';

export const createBusinessRequestSchema = z.object({
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
