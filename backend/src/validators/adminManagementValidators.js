import { z } from 'zod';

export const ADMIN_PERMISSION_VALUES = [
  'MANAGE_ADMINS',
  'MANAGE_BUSINESSES',
  'MANAGE_BUSINESS_REQUESTS',
  'MANAGE_QR_REQUESTS',
  'MANAGE_PRICING',
  'VIEW_ANALYTICS',
  'MANAGE_QR',
  'VIEW_DASHBOARD',
];

export const createAdminSchema = z.object({
  email: z
    .string({ required_error: 'Admin email is required' })
    .email('Invalid email address')
    .transform((val) => val.trim().toLowerCase()),
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  permissions: z
    .array(z.enum(ADMIN_PERMISSION_VALUES), {
      required_error: 'At least one permission must be assigned',
    })
    .min(1, 'At least one permission must be assigned'),
});

export const updateAdminSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  permissions: z
    .array(z.enum(ADMIN_PERMISSION_VALUES))
    .min(1, 'An administrator must retain at least one permission')
    .optional(),
  isActive: z.boolean().optional(),
});
