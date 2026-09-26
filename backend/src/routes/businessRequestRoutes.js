import { Router } from 'express';
import businessRequestService from '../services/businessRequestService.js';
import { createBusinessRequestSchema } from '../validators/businessRequestValidators.js';

const router = Router();

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

    const request = await businessRequestService.createBusinessRequest(parseResult.data);

    return res.status(201).json({
      success: true,
      message:
        "Request received. Thanks for your interest in Ratevia. We'll contact you shortly to understand your business and help you get started.",
      request,
    });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({
        error: 'ValidationError',
        message: error.message,
      });
    }
    if (error.status === 409) {
      return res.status(409).json({
        error: error.code || 'DuplicateRequest',
        message: error.message,
      });
    }
    next(error);
  }
});

export default router;
