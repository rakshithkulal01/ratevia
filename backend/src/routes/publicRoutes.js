import { Router } from 'express';
import pricingService from '../services/pricingService.js';
import qrRequestService from '../services/qrRequestService.js';
import { createPublicQRRequestSchema } from '../validators/qrRequestValidators.js';
import { qrRequestLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * GET /api/public/settings/price
 * Safe public endpoint returning only public pricing information.
 */
router.get('/settings/price', async (req, res, next) => {
  try {
    const data = await pricingService.getPublicPrice();
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/public/qr-requests
 * Public submission of custom QR design request. Captures price snapshot.
 */
router.post('/qr-requests', qrRequestLimiter, async (req, res, next) => {
  try {
    const parseResult = createPublicQRRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: parseResult.error.errors[0]?.message || 'Invalid QR customization data',
        details: parseResult.error.format(),
      });
    }

    const request = await qrRequestService.createQRRequest(parseResult.data);

    return res.status(201).json({
      success: true,
      message: 'Your QR setup has been submitted successfully. Our team will review your design and contact you shortly.',
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

/**
 * GET /api/public/qr-requests/:id
 * Retrieve safe status of a submitted QR request without authentication.
 */
router.get('/qr-requests/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await qrRequestService.getPublicRequestStatus(id);
    return res.status(200).json({ request });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({
        error: 'NotFound',
        message: error.message,
      });
    }
    next(error);
  }
});

export default router;
