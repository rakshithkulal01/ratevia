import prisma from '../config/prisma.js';
import { Prisma } from '@prisma/client';
import { normalizePhoneNumber } from '../utils/phone.js';
import pricingService from './pricingService.js';

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

    // 5. Store Request Entity
    const request = await prisma.businessRequest.create({
      data: {
        ownerName: contactName,
        businessName,
        businessType: category,
        phoneNumber: normalizedPhone,
        email: normalizedEmail,
        city: city || null,
        destinationUrl: destinationUrl.trim(),
        qrConfig: qrConfig || {},
        quotedPrice: new Prisma.Decimal(price),
        status: 'NEW',
      },
    });

    const referenceId = `RV-${request.id.slice(0, 8).toUpperCase()}`;

    console.log(
      `[QRRequest] New QR customization request "${referenceId}" submitted for "${businessName}" (Quoted: ₹${price})`
    );

    return {
      id: request.id,
      referenceId,
      businessName: request.businessName,
      status: request.status,
      quotedPrice: Number(request.quotedPrice),
      currency,
      destinationUrl: request.destinationUrl,
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

    return requests.map((r) => ({
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
    }));
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

    return {
      ...request,
      referenceId: `RV-${request.id.slice(0, 8).toUpperCase()}`,
      quotedPrice: request.quotedPrice ? Number(request.quotedPrice) : null,
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
};

export default qrRequestService;
