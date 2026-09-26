import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import adminService from '../services/adminService.js';
import {
  provisionBusinessSchema,
  statusUpdateSchema,
} from '../validators/adminValidators.js';

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
 * Admin-only provisioning of new businesses after ₹1,000 one-time manual payment.
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
