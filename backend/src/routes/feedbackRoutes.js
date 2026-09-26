import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import feedbackService from '../services/feedbackService.js';
import { createFeedbackSchema } from '../validators/feedbackValidators.js';

const router = Router();

/**
 * POST /api/feedback
 * Submit customer feedback.
 * Phase 11 Privacy Retention Policy:
 * - 4–5★: Aggregate only in DailyBusinessAnalytics. Do NOT persist raw Feedback row.
 * - 1–3★: Persist raw Feedback row temporarily (max 30 days) for operational review.
 */
router.post('/', async (req, res, next) => {
  try {
    const parseResult = createFeedbackSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid feedback submission data',
        details: parseResult.error.format(),
      });
    }

    const result = await feedbackService.createFeedback(parseResult.data);

    return res.status(201).json({
      success: true,
      feedbackId: result.feedbackId,
      business: result.business,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.code || 'Error',
        message: error.message,
      });
    }
    next(error);
  }
});

/**
 * PATCH /api/feedback/:id/copied
 * Record that customer clicked "Copy Review" and emit REVIEW_COPIED analytics event.
 */
router.patch('/:id/copied', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sessionId } = req.body || {};

    const result = await feedbackService.recordReviewCopied(id, sessionId);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.code || 'Error',
        message: error.message,
      });
    }
    next(error);
  }
});

/**
 * PATCH /api/feedback/:id/google-clicked
 * Record that customer clicked "Continue to Google" and emit GOOGLE_LINK_CLICKED analytics event.
 */
router.patch('/:id/google-clicked', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sessionId } = req.body || {};

    const result = await feedbackService.recordGoogleClicked(id, sessionId);
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.code || 'Error',
        message: error.message,
      });
    }
    next(error);
  }
});

/**
 * GET /api/feedback
 * Retrieve temporary raw feedback history for the authenticated business owner.
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { rating, limit, offset } = req.query;
    const result = await feedbackService.getFeedbackHistory(req.user.id, {
      rating,
      limit,
      offset,
    });

    return res.status(200).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.code || 'Error',
        message: error.message,
      });
    }
    next(error);
  }
});

export default router;
