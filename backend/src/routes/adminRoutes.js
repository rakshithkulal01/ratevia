import { Router } from 'express';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware, requirePermission } from '../middleware/adminMiddleware.js';
import { getSupabaseAdmin } from '../config/supabase.js';
import adminService from '../services/adminService.js';
import qrRequestService from '../services/qrRequestService.js';
import pricingService from '../services/pricingService.js';
import adminManagementService from '../services/adminManagementService.js';
import {
  provisionBusinessSchema,
  statusUpdateSchema,
} from '../validators/adminValidators.js';
import {
  updatePriceSchema,
  rejectRequestSchema,
} from '../validators/qrRequestValidators.js';
import {
  createAdminSchema,
  updateAdminSchema,
} from '../validators/adminManagementValidators.js';

const router = Router();

// Apply auth + admin verification to all admin endpoints
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * GET /api/admin/me
 * Return currently authenticated administrator profile and granted permissions.
 */
router.get('/me', (req, res) => {
  return res.status(200).json({
    admin: req.adminUser,
  });
});

/**
 * GET /api/admin/permissions
 * Return catalog of all supported granular administrator permissions.
 */
router.get('/permissions', (req, res) => {
  const permissions = adminManagementService.getAvailablePermissions();
  return res.status(200).json({ permissions });
});

/**
 * GET /api/admin/stats
 * Return overall platform metrics: total businesses, active vs suspended, feedbacks, scans, requests.
 */
router.get('/stats', requirePermission('VIEW_DASHBOARD'), async (req, res, next) => {
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
router.get('/business-requests', requirePermission('MANAGE_BUSINESS_REQUESTS'), async (req, res, next) => {
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
router.patch('/business-requests/:id/contact', requirePermission('MANAGE_BUSINESS_REQUESTS'), async (req, res, next) => {
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
 * DELETE /api/admin/business-requests/:id
 * Permanently delete an individual business request row with proper authorization and cleanup.
 */
router.delete('/business-requests/:id', requirePermission('MANAGE_BUSINESS_REQUESTS'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteBusinessRequest(id, req.user);
    return res.status(200).json(result);
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
router.get('/qr-requests', requirePermission('MANAGE_QR_REQUESTS'), async (req, res, next) => {
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
router.get('/qr-requests/:id', requirePermission('MANAGE_QR_REQUESTS'), async (req, res, next) => {
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
router.patch('/qr-requests/:id/contact', requirePermission('MANAGE_QR_REQUESTS'), async (req, res, next) => {
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
router.post('/qr-requests/:id/approve', requirePermission('MANAGE_QR_REQUESTS'), async (req, res, next) => {
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
router.post('/qr-requests/:id/reject', requirePermission('MANAGE_QR_REQUESTS'), async (req, res, next) => {
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
 * DELETE /api/admin/qr-requests/:id
 * Permanently delete an individual QR customization request and associated storage artifact.
 */
router.delete('/qr-requests/:id', requirePermission('MANAGE_QR_REQUESTS'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await qrRequestService.deleteQRRequest(id, req.user);
    return res.status(200).json(result);
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
 * GET /api/admin/qr-requests/:id/download
 * Download the complete customized Ratevia sticker PNG or fallback QR format.
 */
router.get('/qr-requests/:id/download', (req, res, next) => {
  const perms = req.adminUser?.permissions || [];
  if (!perms.includes('MANAGE_QR') && !perms.includes('MANAGE_QR_REQUESTS')) {
    return res.status(403).json({
      error: 'InsufficientPermissions',
      message: "Access denied. Requires 'MANAGE_QR' or 'MANAGE_QR_REQUESTS' permission.",
    });
  }
  next();
}, async (req, res, next) => {
  try {
    const { id } = req.params;
    const format = req.query.format ? req.query.format.toLowerCase() : 'sticker';
    const request = await qrRequestService.getAdminQRRequestById(id);

    const safeSlug = (request.businessName || 'business')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'ratevia';

    // 1. Customized sticker design download (default, format=sticker, format=png)
    const isCustomizedSticker = format === 'sticker' || format === 'png' || req.query.sticker === 'true' || !req.query.format;
    if (isCustomizedSticker) {
      if (!request.stickerImageUrl) {
        return res.status(410).json({
          error: 'StickerExpired',
          message: 'The sticker preview has expired after 25 days and is no longer available for download.',
        });
      }

      const stickerUrl = request.stickerImageUrl;

      if (stickerUrl.startsWith('data:image/')) {
        const base64Data = stickerUrl.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="${safeSlug}-ratevia-sticker.png"`);
        return res.send(buffer);
      } else if (stickerUrl.startsWith('/uploads/')) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const localPath = path.join(__dirname, '../../uploads', stickerUrl.replace(/^\/uploads\//, ''));
        if (fs.existsSync(localPath)) {
          return res.download(localPath, `${safeSlug}-ratevia-sticker.png`);
        }
      } else if (stickerUrl.startsWith('http://') || stickerUrl.startsWith('https://')) {
        try {
          const fetched = await fetch(stickerUrl);
          if (fetched.ok) {
            const arrayBuffer = await fetched.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `attachment; filename="${safeSlug}-ratevia-sticker.png"`);
            return res.send(buffer);
          }
        } catch (fetchErr) {
          console.warn('[AdminDownload] Remote fetch failed, trying Supabase storage download:', fetchErr.message);
        }

        // Secure fallback: download directly via Supabase Admin SDK
        try {
          const sb = getSupabaseAdmin();
          const { data: blobData, error: dlErr } = await sb.storage
            .from('business-requests')
            .download(`${id}/sticker.png`);
          if (!dlErr && blobData) {
            const arrayBuffer = await blobData.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `attachment; filename="${safeSlug}-ratevia-sticker.png"`);
            return res.send(buffer);
          }
        } catch (sbErr) {
          console.warn('[AdminDownload] Supabase storage download exception:', sbErr.message);
        }
      }

      return res.status(502).json({
        error: 'StorageUnavailable',
        message: 'Could not retrieve sticker image artifact from storage. Please try again later.',
      });
    }

    // 2. Explicitly requested standalone raw SVG format
    const urlToEncode = request.destinationUrl || 'https://ratevia.in';
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
router.get('/settings/price', requirePermission('MANAGE_PRICING'), async (req, res, next) => {
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
router.put('/settings/price', requirePermission('MANAGE_PRICING'), async (req, res, next) => {
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
router.get('/businesses', requirePermission('MANAGE_BUSINESSES'), async (req, res, next) => {
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
router.post('/businesses', requirePermission('MANAGE_BUSINESSES'), async (req, res, next) => {
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
router.patch('/businesses/:id/status', requirePermission('MANAGE_BUSINESSES'), async (req, res, next) => {
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

// ==========================================
// ADMIN MANAGEMENT ENDPOINTS
// Protected by MANAGE_ADMINS permission
// ==========================================

/**
 * GET /api/admin/admins
 * Return list of all administrators with their permissions.
 */
router.get('/admins', requirePermission('MANAGE_ADMINS'), async (req, res, next) => {
  try {
    const admins = await adminManagementService.listAdmins();
    return res.status(200).json({ admins });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/admins/:id
 * Return details of a specific administrator.
 */
router.get('/admins/:id', requirePermission('MANAGE_ADMINS'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const admin = await adminManagementService.getAdminById(id);
    return res.status(200).json({ admin });
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
 * POST /api/admin/admins
 * Create a new administrator account with permissions and escalation safeguards.
 */
router.post('/admins', requirePermission('MANAGE_ADMINS'), async (req, res, next) => {
  try {
    const parseResult = createAdminSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: parseResult.error.errors[0]?.message || 'Invalid administrator payload',
        details: parseResult.error.format(),
      });
    }

    const { email, displayName, permissions } = parseResult.data;
    const newAdmin = await adminManagementService.createAdmin({
      email,
      displayName,
      permissions,
      actingAdmin: req.adminUser,
    });

    return res.status(201).json({
      success: true,
      message: `Administrator "${newAdmin.displayName || newAdmin.email}" created successfully.`,
      admin: newAdmin,
    });
  } catch (error) {
    if (error.status === 400 || error.status === 403 || error.status === 409) {
      return res.status(error.status).json({
        error: error.name || 'AdminCreationError',
        message: error.message,
      });
    }
    next(error);
  }
});

/**
 * PATCH /api/admin/admins/:id
 * Update administrator display name, permissions, or activation state.
 */
router.patch('/admins/:id', requirePermission('MANAGE_ADMINS'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const parseResult = updateAdminSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: parseResult.error.errors[0]?.message || 'Invalid update payload',
        details: parseResult.error.format(),
      });
    }

    const updated = await adminManagementService.updateAdmin(id, {
      ...parseResult.data,
      actingAdmin: req.adminUser,
    });

    return res.status(200).json({
      success: true,
      message: 'Administrator updated successfully.',
      admin: updated,
    });
  } catch (error) {
    if (error.status === 400 || error.status === 403 || error.status === 404) {
      return res.status(error.status).json({
        error: error.name || 'AdminUpdateError',
        message: error.message,
      });
    }
    next(error);
  }
});

/**
 * POST /api/admin/admins/:id/activate
 * Reactivate a deactivated administrator.
 */
router.post('/admins/:id/activate', requirePermission('MANAGE_ADMINS'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const activated = await adminManagementService.activateAdmin(id, req.adminUser);

    return res.status(200).json({
      success: true,
      message: `Administrator "${activated.displayName || activated.email}" has been reactivated.`,
      admin: activated,
    });
  } catch (error) {
    if (error.status === 400 || error.status === 404) {
      return res.status(error.status).json({
        error: error.name || 'AdminActivationError',
        message: error.message,
      });
    }
    next(error);
  }
});

/**
 * POST /api/admin/admins/:id/deactivate
 * Deactivate an administrator (with last-active admin safeguard).
 */
router.post('/admins/:id/deactivate', requirePermission('MANAGE_ADMINS'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const deactivated = await adminManagementService.deactivateAdmin(id, req.adminUser);

    return res.status(200).json({
      success: true,
      message: `Administrator "${deactivated.displayName || deactivated.email}" has been deactivated.`,
      admin: deactivated,
    });
  } catch (error) {
    if (error.status === 400 || error.status === 404) {
      return res.status(error.status).json({
        error: error.name || 'AdminDeactivationError',
        message: error.message,
      });
    }
    next(error);
  }
});

/**
 * DELETE /api/admin/admins/:id
 * Permanently delete an administrator (safeguarded against last-active admin).
 */
router.delete('/admins/:id', requirePermission('MANAGE_ADMINS'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminManagementService.deleteAdmin(id, req.adminUser);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error.status === 400 || error.status === 404) {
      return res.status(error.status).json({
        error: error.name || 'AdminDeleteError',
        message: error.message,
      });
    }
    next(error);
  }
});

export default router;
