import { Router } from 'express';
import QRCode from 'qrcode';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import adminService from '../services/adminService.js';
import qrRequestService from '../services/qrRequestService.js';
import pricingService from '../services/pricingService.js';
import {
  provisionBusinessSchema,
  statusUpdateSchema,
} from '../validators/adminValidators.js';
import {
  updatePriceSchema,
  rejectRequestSchema,
} from '../validators/qrRequestValidators.js';

const router = Router();

// Apply auth + admin verification to all admin endpoints
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * GET /api/admin/stats
 * Return overall platform metrics: total businesses, active vs suspended, feedbacks, scans, requests.
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await adminService.getAdminPlatformStats();
    return res.status(200).json({ stats });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/business-requests
 * Return list of business registration requests sorted newest first.
 */
router.get('/business-requests', async (req, res, next) => {
  try {
    const requests = await adminService.getBusinessRequests(req.query.status);
    return res.status(200).json({ requests });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/business-requests/:id/contact
 * Mark a business request as CONTACTED by current admin.
 */
router.patch('/business-requests/:id/contact', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.logRequestContact(id, req.user);

    if (result.alreadyContacted) {
      return res.status(200).json({
        success: true,
        message: 'Request is already marked as contacted.',
        request: result.request,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Business request marked as contacted.',
      request: result.request,
    });
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

/**
 * GET /api/admin/qr-requests
 * Return list of public QR customization requests with optional status filter.
 */
router.get('/qr-requests', async (req, res, next) => {
  try {
    const requests = await qrRequestService.getAdminQRRequests(req.query.status);
    return res.status(200).json({ requests });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/qr-requests/:id
 * Return complete details of a single QR customization request.
 */
router.get('/qr-requests/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await qrRequestService.getAdminQRRequestById(id);
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

/**
 * PATCH /api/admin/qr-requests/:id/contact
 * Mark a QR request as CONTACTED.
 */
router.patch('/qr-requests/:id/contact', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.logRequestContact(id, req.user);
    return res.status(200).json({
      success: true,
      message: result.alreadyContacted ? 'Request is already marked as contacted.' : 'Request marked as contacted.',
      request: result.request,
    });
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

/**
 * POST /api/admin/qr-requests/:id/approve
 * Transition QR customization request: NEW/CONTACTED -> APPROVED.
 */
router.post('/qr-requests/:id/approve', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await qrRequestService.approveRequest(id, req.user);
    return res.status(200).json({
      success: true,
      message: result.alreadyApproved ? 'Request is already approved.' : 'QR customization request approved.',
      request: result.request,
    });
  } catch (error) {
    if (error.status === 400 || error.status === 404) {
      return res.status(error.status).json({
        error: 'ApprovalError',
        message: error.message,
      });
    }
    next(error);
  }
});

/**
 * POST /api/admin/qr-requests/:id/reject
 * Reject a QR customization request with optional reason.
 */
router.post('/qr-requests/:id/reject', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parseResult = rejectRequestSchema.safeParse(req.body);
    const reason = parseResult.success ? parseResult.data.reason : req.body.reason;

    const result = await qrRequestService.rejectRequest(id, reason, req.user);
    return res.status(200).json({
      success: true,
      message: 'QR customization request rejected.',
      request: result.request,
    });
  } catch (error) {
    if (error.status === 400 || error.status === 404) {
      return res.status(error.status).json({
        error: 'RejectionError',
        message: error.message,
      });
    }
    next(error);
  }
});

/**
 * GET /api/admin/qr-requests/:id/download
 * Generate and download the customized QR code in requested format (SVG or PNG).
 */
router.get('/qr-requests/:id/download', async (req, res, next) => {
  try {
    const { id } = req.params;
    const format = req.query.format === 'png' ? 'png' : 'svg';
    const request = await qrRequestService.getAdminQRRequestById(id);

    const safeSlug = (request.businessName || 'business')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'ratevia';

    const urlToEncode = request.destinationUrl || 'https://ratevia.in';

    if (format === 'png') {
      const pngBuffer = await QRCode.toBuffer(urlToEncode, {
        type: 'png',
        errorCorrectionLevel: 'H',
        width: 1024,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      });

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="ratevia-${safeSlug}-qr.png"`);
      return res.send(pngBuffer);
    } else {
      const svgString = await QRCode.toString(urlToEncode, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      });

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `attachment; filename="ratevia-${safeSlug}-qr.svg"`);
      return res.send(svgString);
    }
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

/**
 * GET /api/admin/settings/price
 * Retrieve current Ratevia price and audit history.
 */
router.get('/settings/price', async (req, res, next) => {
  try {
    const pricing = await pricingService.getAdminPricing();
    const history = await pricingService.getPriceHistory();
    return res.status(200).json({ pricing, history });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/settings/price
 * Update Ratevia price with audit tracking (Admin only).
 */
router.put('/settings/price', async (req, res, next) => {
  try {
    const parseResult = updatePriceSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: parseResult.error.errors[0]?.message || 'Invalid price data',
        details: parseResult.error.format(),
      });
    }

    const updated = await pricingService.updatePrice({
      newPrice: parseResult.data.price,
      currency: parseResult.data.currency,
      adminUser: req.user,
    });

    return res.status(200).json({
      success: true,
      message: `Ratevia price successfully updated to ₹${updated.price}`,
      pricing: updated,
    });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({
        error: 'ValidationError',
        message: error.message,
      });
    }
    next(error);
  }
});

/**
 * GET /api/admin/businesses
 * Return directory of all businesses with owner details and ACTIVE/SUSPENDED status.
 */
router.get('/businesses', async (req, res, next) => {
  try {
    const businesses = await adminService.getAllBusinesses();
    return res.status(200).json({ businesses });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/businesses
 * Admin-only provisioning of new businesses.
 */
router.post('/businesses', async (req, res, next) => {
  try {
    const parseResult = provisionBusinessSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: parseResult.error.errors[0]?.message || 'Invalid input data',
        details: parseResult.error.format(),
      });
    }

    const result = await adminService.provisionBusiness(parseResult.data);

    return res.status(201).json({
      success: true,
      message: 'Business provisioned successfully.',
      business: result.business,
      linkedRequestId: result.linkedRequestId,
    });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({
        error: 'NotFound',
        message: error.message,
      });
    }
    if (error.status === 409) {
      return res.status(409).json({
        error: 'AlreadyProvisioned',
        message: error.message,
      });
    }
    next(error);
  }
});

/**
 * PATCH /api/admin/businesses/:id/status
 * Admin toggle for activating or suspending a business account.
 */
router.patch('/businesses/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const parseResult = statusUpdateSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid status payload. Expected status: "ACTIVE" | "SUSPENDED" or isActive: boolean',
      });
    }

    const { status, isActive } = parseResult.data;
    const targetIsActive = isActive !== undefined ? isActive : status === 'ACTIVE';

    const updated = await adminService.toggleBusinessStatus(id, targetIsActive);

    return res.status(200).json({
      success: true,
      message: `Business status successfully set to ${targetIsActive ? 'ACTIVE' : 'SUSPENDED'}`,
      business: updated,
    });
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
