import { z } from 'zod';

export const createFeedbackSchema = z.object({
  businessSlug: z.string().min(1, 'Business slug is required'),
  sessionId: z.string().uuid('A valid session UUID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  selectedTopics: z.array(z.string()).default([]),
  customerMessage: z.string().max(2000).optional().nullable(),
  generatedReview: z.string().max(4000).optional().nullable(),
});
