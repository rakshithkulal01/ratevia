import prisma from '../config/prisma.js';
import { generateUniqueBusinessSlug } from '../utils/slug.js';

export const adminService = {
  /**
   * Aggregate platform statistics across businesses, users, feedbacks, scans, and requests.
   */
  getAdminPlatformStats: async () => {
    const [
      totalBusinesses,
      activeBusinesses,
      suspendedBusinesses,
      totalUsers,
      totalFeedbacks,
      totalQrScans,
      totalRequests,
      newRequests,
      contactedRequests,
    ] = await Promise.all([
      prisma.business.count(),
      prisma.business.count({ where: { isActive: true } }),
      prisma.business.count({ where: { isActive: false } }),
      prisma.user.count(),
      prisma.feedback.count(),
      prisma.analyticsEvent.count({ where: { eventType: 'QR_SCANNED' } }),
      prisma.businessRequest.count(),
      prisma.businessRequest.count({ where: { status: 'NEW' } }),
      prisma.businessRequest.count({ where: { status: 'CONTACTED' } }),
    ]);

    return {
      totalBusinesses,
      activeBusinesses,
      suspendedBusinesses,
      totalUsers,
      totalFeedbacks,
      totalQrScans,
      totalRequests,
      newRequests,
      contactedRequests,
    };
  },

  /**
   * Return directory of all businesses with owner details and feedback counts.
   */
  getAllBusinesses: async () => {
    const businesses = await prisma.business.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            feedbacks: true,
            analyticsEvents: true,
          },
        },
      },
    });

    return businesses.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      businessType: b.businessType,
      googleReviewUrl: b.googleReviewUrl,
      isActive: b.isActive,
      status: b.isActive ? 'ACTIVE' : 'SUSPENDED',
      createdAt: b.createdAt,
      owner: b.owner,
      feedbackCount: b._count.feedbacks,
      eventsCount: b._count.analyticsEvents,
    }));
  },

  /**
   * Return list of business registration requests sorted newest first.
   */
  getBusinessRequests: async (statusFilter) => {
    const where = {};
    if (
      statusFilter &&
      ['NEW', 'CONTACTED', 'PROVISIONED', 'REJECTED'].includes(statusFilter.toUpperCase())
    ) {
      where.status = statusFilter.toUpperCase();
    }

    return prisma.businessRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        contactedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        provisionedBusiness: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  },

  /**
   * Mark request as CONTACTED idempotently.
   */
  logRequestContact: async (requestId, adminUser) => {
    const existing = await prisma.businessRequest.findUnique({
      where: { id: requestId },
      include: {
        contactedBy: { select: { id: true, name: true, email: true } },
        provisionedBusiness: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!existing) {
      const err = new Error('Business request not found.');
      err.status = 404;
      throw err;
    }

    // Idempotent: If already CONTACTED or PROVISIONED, do not overwrite timestamp or user
    if (existing.status === 'CONTACTED' || existing.status === 'PROVISIONED') {
      return { request: existing, alreadyContacted: true };
    }

    const updated = await prisma.businessRequest.update({
      where: { id: requestId },
      data: {
        status: 'CONTACTED',
        contactedAt: new Date(),
        contactedById: adminUser?.id || null,
      },
      include: {
        contactedBy: { select: { id: true, name: true, email: true } },
        provisionedBusiness: { select: { id: true, name: true, slug: true } },
      },
    });

    console.log(
      `[AdminContact] BusinessRequest "${updated.businessName}" marked CONTACTED by ${adminUser?.email}`
    );

    return { request: updated, alreadyContacted: false };
  },

  /**
   * Toggle business active or suspended status.
   */
  toggleBusinessStatus: async (businessId, targetIsActive) => {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      const err = new Error('Business not found.');
      err.status = 404;
      throw err;
    }

    const updated = await prisma.business.update({
      where: { id: businessId },
      data: { isActive: targetIsActive },
    });

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      isActive: updated.isActive,
      status: updated.isActive ? 'ACTIVE' : 'SUSPENDED',
    };
  },

  /**
   * Atomic business provisioning via Prisma transaction.
   * If requestId is provided, verifies it is unprovisioned and links it atomically.
   */
  provisionBusiness: async ({
    name,
    businessType,
    googleReviewUrl,
    ownerEmail,
    ownerName,
    requestId,
  }) => {
    const normalizedEmail = ownerEmail.toLowerCase();

    // Check if requestId exists and is not already provisioned
    if (requestId) {
      const existingReq = await prisma.businessRequest.findUnique({
        where: { id: requestId },
      });

      if (!existingReq) {
        const err = new Error('Business request not found.');
        err.status = 404;
        throw err;
      }

      if (existingReq.status === 'PROVISIONED' || existingReq.provisionedBusinessId) {
        const err = new Error(
          'This registration request has already been converted into a business.'
        );
        err.status = 409;
        throw err;
      }
    }

    // Atomic transaction for provisioning and linking with 30s timeout
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Find or create local User record for the owner
        let owner = await tx.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!owner) {
          owner = await tx.user.create({
            data: {
              email: normalizedEmail,
              name: ownerName || null,
              role: 'BUSINESS_OWNER',
              supabaseUserId: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            },
          });
        } else if (ownerName && !owner.name) {
          owner = await tx.user.update({
            where: { id: owner.id },
            data: { name: ownerName },
          });
        }

        // 2. Generate unique slug using transaction client
        const slug = await generateUniqueBusinessSlug(name, tx);

        // 3. Create Business with active QRCode
        const business = await tx.business.create({
          data: {
            ownerId: owner.id,
            name,
            businessType,
            googleReviewUrl,
            slug,
            isActive: true,
            qrCodes: {
              create: {
                active: true,
              },
            },
          },
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            qrCodes: {
              where: { active: true },
              take: 1,
            },
          },
        });

        // 4. If requestId is provided, update BusinessRequest atomically
        let linkedRequest = null;
        if (requestId) {
          linkedRequest = await tx.businessRequest.update({
            where: { id: requestId },
            data: {
              status: 'PROVISIONED',
              provisionedBusinessId: business.id,
            },
          });
        }

        return { business, linkedRequest };
      },
      { maxWait: 15000, timeout: 30000 }
    );

    const { business, linkedRequest } = result;

    console.log(
      `[AdminProvisioning] Business "${business.name}" (${business.slug}) provisioned for ${business.owner?.email}${
        linkedRequest ? ` (linked to request ${linkedRequest.id})` : ''
      }`
    );

    return {
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        businessType: business.businessType,
        googleReviewUrl: business.googleReviewUrl,
        isActive: business.isActive,
        status: 'ACTIVE',
        owner: business.owner,
        qrCode: business.qrCodes[0],
      },
      linkedRequestId: linkedRequest ? linkedRequest.id : null,
    };
  },
};

export default adminService;
