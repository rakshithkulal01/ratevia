import prisma from '../config/prisma.js';
import { Prisma } from '@prisma/client';
import { normalizePhoneNumber } from '../utils/phone.js';
import pricingService from './pricingService.js';
import { storeStickerImage, deleteStickerImage } from '../utils/stickerStorage.js';
import crypto from 'crypto';

export const qrRequestService = {
  /**
   * Submit a public QR customization request without authentication.
   * Captures price snapshot and performs 24h duplicate prevention.
   */
  createQRRequest: async ({
    businessName,
    category,
    contactName,
    phone,
    countryCode = '+91',
    email,
    city,
    destinationUrl,
    qrConfig,
    stickerImage,
    stickerImageUrl,
  }) => {
    // 1. Phone normalization
    const combinedPhone = phone.startsWith('+') ? phone : `${countryCode} ${phone}`;
    const normalizedPhone = normalizePhoneNumber(combinedPhone, countryCode);

    if (!normalizedPhone) {
      const err = new Error('Please provide a valid phone number with 10 to 15 digits.');
      err.status = 400;
      throw err;
    }

    // 2. Email normalization
    const normalizedEmail = email.toLowerCase().trim();

    // 3. Duplicate check within 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const existingRequest = await prisma.businessRequest.findFirst({
      where: {
        createdAt: { gte: twentyFourHoursAgo },
        status: { in: ['NEW', 'CONTACTED', 'APPROVED'] },
        OR: [
          { phoneNumber: normalizedPhone },
          { email: normalizedEmail },
        ],
      },
    });

    if (existingRequest) {
      const err = new Error(
        'A request for this business was recently submitted. Our team will review your design and contact you shortly.'
      );
      err.status = 409;
      err.code = 'DuplicateRequest';
      throw err;
    }

    // 4. Capture current price snapshot
    const { price, currency } = await pricingService.getPublicPrice();

    // 5. Store Rendered Sticker Image (if provided)
    const requestId = crypto.randomUUID();
    let finalStickerUrl = null;
    if (stickerImage || stickerImageUrl) {
      finalStickerUrl = await storeStickerImage(requestId, stickerImage || stickerImageUrl);
    }

    // 6. Store Request Entity with Rollback on DB Error
    let request;
    try {
      request = await prisma.businessRequest.create({
        data: {
          id: requestId,
          ownerName: contactName,
          businessName,
          businessType: category,
          phoneNumber: normalizedPhone,
          email: normalizedEmail,
          city: city || null,
          destinationUrl: destinationUrl.trim(),
          qrConfig: qrConfig || {},
          stickerImageUrl: finalStickerUrl,
          stickerImageCreatedAt: finalStickerUrl ? new Date() : null,
          quotedPrice: new Prisma.Decimal(price),
          status: 'NEW',
        },
      });
    } catch (dbError) {
      if (finalStickerUrl) {
        try {
          await deleteStickerImage(requestId, finalStickerUrl);
        } catch (cleanupError) {
          console.error(
            `[QRRequest] Failed to rollback orphaned sticker storage for ${requestId}:`,
            cleanupError.message
          );
        }
      }
      throw dbError; // Preserve original database error
    }

    const referenceId = `RV-${request.id.slice(0, 8).toUpperCase()}`;

    console.log(
      `[QRRequest] New QR customization request "${referenceId}" submitted for "${businessName}" (Quoted: ₹${price}, Sticker: ${finalStickerUrl ? 'Stored' : 'None'})`
    );

    return {
      id: request.id,
      referenceId,
      businessName: request.businessName,
      status: request.status,
      quotedPrice: Number(request.quotedPrice),
      currency,
      destinationUrl: request.destinationUrl,
      stickerImageUrl: request.stickerImageUrl,
      createdAt: request.createdAt,
    };
  },

  /**
   * Fetch safe public status of a request for unauthenticated users.
   */
  getPublicRequestStatus: async (id) => {
    const request = await prisma.businessRequest.findUnique({
      where: { id },
      select: {
        id: true,
        businessName: true,
        businessType: true,
        destinationUrl: true,
        status: true,
        quotedPrice: true,
        createdAt: true,
        approvedAt: true,
        provisionedAt: true,
      },
    });

    if (!request) {
      const err = new Error('Request not found.');
      err.status = 404;
      throw err;
    }

    return {
      id: request.id,
      referenceId: `RV-${request.id.slice(0, 8).toUpperCase()}`,
      businessName: request.businessName,
      category: request.businessType,
      destinationUrl: request.destinationUrl,
      status: request.status,
      quotedPrice: request.quotedPrice ? Number(request.quotedPrice) : null,
      createdAt: request.createdAt,
      approvedAt: request.approvedAt,
      provisionedAt: request.provisionedAt,
    };
  },

  /**
   * Admin: List all submitted QR customization requests.
   */
  getAdminQRRequests: async (statusFilter) => {
    const where = {
      destinationUrl: { not: null },
    };

    if (
      statusFilter &&
      ['NEW', 'CONTACTED', 'APPROVED', 'REJECTED', 'PROVISIONED'].includes(statusFilter.toUpperCase())
    ) {
      where.status = statusFilter.toUpperCase();
    }

    const requests = await prisma.businessRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        contactedBy: {
          select: { id: true, name: true, email: true },
        },
        approvedBy: {
          select: { id: true, name: true, email: true },
        },
        rejectedBy: {
          select: { id: true, name: true, email: true },
        },
        provisionedBusiness: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    const now = Date.now();
    const TWENTY_FIVE_DAYS_MS = 25 * 24 * 60 * 60 * 1000;

    return requests.map((r) => {
      const isStickerExpired = !r.stickerImageUrl && (now - new Date(r.createdAt).getTime() > TWENTY_FIVE_DAYS_MS);
      return {
        id: r.id,
        referenceId: `RV-${r.id.slice(0, 8).toUpperCase()}`,
        businessName: r.businessName,
        businessType: r.businessType,
        ownerName: r.ownerName,
        phoneNumber: r.phoneNumber,
        email: r.email,
        city: r.city,
        destinationUrl: r.destinationUrl,
        qrConfig: r.qrConfig,
        stickerImageUrl: r.stickerImageUrl,
        stickerImageCreatedAt: r.stickerImageCreatedAt,
        isStickerExpired,
        isExpired: isStickerExpired,
        quotedPrice: r.quotedPrice ? Number(r.quotedPrice) : null,
        status: r.status,
        createdAt: r.createdAt,
        contactedAt: r.contactedAt,
        contactedBy: r.contactedBy,
        approvedAt: r.approvedAt,
        approvedBy: r.approvedBy,
        rejectedAt: r.rejectedAt,
        rejectedBy: r.rejectedBy,
        rejectionReason: r.rejectionReason,
        provisionedAt: r.provisionedAt,
        provisionedBusiness: r.provisionedBusiness,
      };
    });
  },

  /**
   * Admin: Fetch full details for a single QR customization request.
   */
  getAdminQRRequestById: async (id) => {
    const request = await prisma.businessRequest.findUnique({
      where: { id },
      include: {
        contactedBy: {
          select: { id: true, name: true, email: true },
        },
        approvedBy: {
          select: { id: true, name: true, email: true },
        },
        rejectedBy: {
          select: { id: true, name: true, email: true },
        },
        provisionedBusiness: {
          select: { id: true, name: true, slug: true, isActive: true },
        },
      },
    });

    if (!request) {
      const err = new Error('QR customization request not found.');
      err.status = 404;
      throw err;
    }

    const now = Date.now();
    const TWENTY_FIVE_DAYS_MS = 25 * 24 * 60 * 60 * 1000;
    const isStickerExpired = !request.stickerImageUrl && (now - new Date(request.createdAt).getTime() > TWENTY_FIVE_DAYS_MS);

    return {
      ...request,
      referenceId: `RV-${request.id.slice(0, 8).toUpperCase()}`,
      quotedPrice: request.quotedPrice ? Number(request.quotedPrice) : null,
      isStickerExpired,
      isExpired: isStickerExpired,
    };
  },

  /**
   * Admin: Approve request (Transitions NEW / CONTACTED -> APPROVED).
   */
  approveRequest: async (id, adminUser) => {
    const request = await prisma.businessRequest.findUnique({
      where: { id },
    });

    if (!request) {
      const err = new Error('Request not found.');
      err.status = 404;
      throw err;
    }

    if (request.status === 'PROVISIONED') {
      const err = new Error('This request has already been provisioned into an active business.');
      err.status = 400;
      throw err;
    }

    if (request.status === 'REJECTED') {
      const err = new Error('Cannot approve a previously rejected request. Contact requester first.');
      err.status = 400;
      throw err;
    }

    if (request.status === 'APPROVED') {
      return { request, alreadyApproved: true };
    }

    const updated = await prisma.businessRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedById: adminUser?.id || null,
      },
      include: {
        approvedBy: { select: { id: true, name: true, email: true } },
      },
    });

    console.log(`[AdminApproval] QR Request "${request.businessName}" (${id}) approved by ${adminUser?.email}`);

    return { request: updated, alreadyApproved: false };
  },

  /**
   * Admin: Reject request with optional reason.
   */
  rejectRequest: async (id, reason, adminUser) => {
    const request = await prisma.businessRequest.findUnique({
      where: { id },
    });

    if (!request) {
      const err = new Error('Request not found.');
      err.status = 404;
      throw err;
    }

    if (request.status === 'PROVISIONED') {
      const err = new Error('Cannot reject a request that is already provisioned into an active business.');
      err.status = 400;
      throw err;
    }

    const updated = await prisma.businessRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedById: adminUser?.id || null,
        rejectionReason: reason || null,
      },
      include: {
        rejectedBy: { select: { id: true, name: true, email: true } },
      },
    });

    console.log(
      `[AdminRejection] QR Request "${request.businessName}" (${id}) rejected by ${adminUser?.email}. Reason: ${reason || 'None'}`
    );

    return { request: updated };
  },

  /**
   * Admin: Delete QR customization request row and associated storage artifact.
   */
  deleteQRRequest: async (id, adminUser) => {
    const request = await prisma.businessRequest.findUnique({
      where: { id },
    });

    if (!request) {
      const err = new Error('QR customization request not found.');
      err.status = 404;
      throw err;
    }

    // Clean up stored customized sticker image from Supabase Storage and disk
    if (request.stickerImageUrl) {
      try {
        await deleteStickerImage(request.id, request.stickerImageUrl);
      } catch (storageErr) {
        console.warn(`[DeleteQRRequest] Storage cleanup warning for ${id}:`, storageErr.message);
      }
    }

    await prisma.businessRequest.delete({
      where: { id },
    });

    console.log(
      `[DeleteQRRequest] QR request "${request.businessName}" (${id}) deleted by ${adminUser?.email || 'admin'}`
    );

    return {
      success: true,
      message: `QR customization request for "${request.businessName}" has been deleted.`,
    };
  },
};

export default qrRequestService;
