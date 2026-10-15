import { z } from 'zod';

const countWords = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export const createFeedbackSchema = z.object({
  businessSlug: z.string().min(1, 'Business slug is required'),
  sessionId: z.string().uuid('A valid session UUID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  selectedTopics: z.array(z.string()).default([]),
  customerMessage: z.string().max(5000, 'Customer message cannot exceed 5000 characters').optional().nullable(),
  generatedReview: z
    .string()
    .max(10000, 'Generated review text cannot exceed 10000 characters')
    .refine((text) => !text || countWords(text) <= 500, {
      message: 'Generated review text cannot exceed 500 words',
    })
    .optional()
    .nullable(),
  scanned: z.boolean().optional().default(true),
});

