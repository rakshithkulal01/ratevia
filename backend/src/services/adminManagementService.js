import { randomUUID } from 'crypto';
import prisma from '../config/prisma.js';

export const ADMIN_PERMISSIONS_CATALOG = [
  {
    key: 'VIEW_DASHBOARD',
    label: 'View Dashboard',
    group: 'General',
    description: 'Access the admin overview and high-level platform statistics.',
  },
  {
    key: 'VIEW_ANALYTICS',
    label: 'View Analytics',
    group: 'General',
    description: 'Inspect scan trends, customer sentiment, and feedback distributions.',
  },
  {
    key: 'MANAGE_BUSINESSES',
    label: 'Manage Businesses',
    group: 'Business',
    description: 'View directory, suspend/activate venues, and provision business accounts.',
  },
  {
    key: 'MANAGE_BUSINESS_REQUESTS',
    label: 'Manage Business Requests',
    group: 'Business',
    description: 'Review inbound business lead requests and mark them as contacted.',
  },
  {
    key: 'MANAGE_QR_REQUESTS',
    label: 'Manage QR Requests',
    group: 'QR',
    description: 'Review custom branded QR submissions, approve, reject, and contact.',
  },
  {
    key: 'MANAGE_QR',
    label: 'Manage QR & Stand Downloads',
    group: 'QR',
    description: 'Export print-ready vector SVG and high-res PNG table stand assets.',
  },
  {
    key: 'MANAGE_PRICING',
    label: 'Manage Pricing',
    group: 'Configuration',
    description: 'Configure dynamic Ratevia package pricing and inspect price change history.',
  },
  {
    key: 'MANAGE_ADMINS',
    label: 'Manage Administrators',
    group: 'Administration',
    description: 'Create, edit, activate/deactivate, and manage administrator permissions.',
  },
];

class AdminManagementService {
  /**
   * Return catalog of supported permissions.
   */
  getAvailablePermissions() {
    return ADMIN_PERMISSIONS_CATALOG;
  }

  /**
   * List all administrators with their granted permissions and activity timestamps.
   */
  async listAdmins() {
    const admins = await prisma.adminUser.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        permissions: {
          select: { permission: true, createdAt: true },
        },
        user: {
          select: { id: true, email: true, name: true, role: true, createdAt: true },
        },
      },
    });

    return admins.map((admin) => ({
      id: admin.id,
      userId: admin.userId,
      email: admin.email || admin.user?.email,
      displayName: admin.displayName || admin.user?.name || 'Admin',
      isActive: admin.isActive,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
      createdById: admin.createdById,
      permissions: admin.permissions.map((p) => p.permission),
    }));
  }

  /**
   * Fetch specific administrator by id.
   */
  async getAdminById(id) {
    const admin = await prisma.adminUser.findUnique({
      where: { id },
      include: {
        permissions: true,
        user: true,
      },
    });

    if (!admin) {
      const error = new Error(`Administrator with ID "${id}" was not found.`);
      error.status = 404;
      throw error;
    }

    return {
      id: admin.id,
      userId: admin.userId,
      email: admin.email || admin.user?.email,
      displayName: admin.displayName || admin.user?.name,
      isActive: admin.isActive,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
      createdById: admin.createdById,
      permissions: admin.permissions.map((p) => p.permission),
    };
  }

  /**
   * Create a new administrator account with permissions and escalation protection.
   */
  async createAdmin({ email, displayName, permissions, actingAdmin }) {
    // 1. Privilege Escalation Safeguard:
    // Acting admin cannot grant any permission they do not possess.
    const actingPermissions = (actingAdmin.permissions || []).map((p) =>
      typeof p === 'string' ? p : p.permission
    );
    const unauthorizedPermissions = permissions.filter((p) => !actingPermissions.includes(p));

    if (unauthorizedPermissions.length > 0) {
      const error = new Error(
        `Privilege escalation denied: You cannot grant permissions you do not possess (${unauthorizedPermissions.join(', ')}).`
      );
      error.status = 403;
      throw error;
    }

    // 2. Check if AdminUser with this email already exists
    const existingAdminByEmail = await prisma.adminUser.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (existingAdminByEmail) {
      const error = new Error(`An administrator with email "${email}" already exists.`);
      error.status = 409;
      throw error;
    }

    // 3. Find or create local User record
    let targetUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (!targetUser) {
      targetUser = await prisma.user.create({
        data: {
          email,
          name: displayName || email.split('@')[0],
          role: 'ADMIN',
          supabaseUserId: `admin-invited-${randomUUID()}`,
        },
      });
    } else {
      // Elevate existing user to ADMIN role
      targetUser = await prisma.user.update({
        where: { id: targetUser.id },
        data: { role: 'ADMIN' },
      });
    }

    // 4. Create AdminUser record with permissions in atomic transaction
    const newAdmin = await prisma.$transaction(
      async (tx) => {
        const adminRecord = await tx.adminUser.create({
        data: {
          userId: targetUser.id,
          displayName: displayName || targetUser.name || email.split('@')[0],
          email,
          isActive: true,
          createdById: actingAdmin.id,
          permissions: {
            create: permissions.map((perm) => ({ permission: perm })),
          },
        },
        include: { permissions: true },
      });

      // Audit log entry
      await tx.adminAuditLog.create({
        data: {
          actorAdminId: actingAdmin.id,
          targetAdminId: adminRecord.id,
          action: 'ADMIN_CREATED',
          metadata: {
            email,
            displayName: adminRecord.displayName,
            grantedPermissions: permissions,
          },
        },
      });

      return adminRecord;
    },
    { maxWait: 15000, timeout: 25000 }
  );

    return {
      id: newAdmin.id,
      userId: targetUser.id,
      email: newAdmin.email,
      displayName: newAdmin.displayName,
      isActive: newAdmin.isActive,
      permissions: newAdmin.permissions.map((p) => p.permission),
      createdAt: newAdmin.createdAt,
    };
  }

  /**
   * Update administrator details, permissions, or activation state.
   */
  async updateAdmin(id, { displayName, permissions, isActive, actingAdmin }) {
    const targetAdmin = await prisma.adminUser.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!targetAdmin) {
      const error = new Error(`Administrator with ID "${id}" was not found.`);
      error.status = 404;
      throw error;
    }

    // 1. Privilege Escalation Safeguard on permissions edit
    if (permissions && Array.isArray(permissions)) {
      const actingPermissions = (actingAdmin.permissions || []).map((p) =>
        typeof p === 'string' ? p : p.permission
      );
      const unauthorizedPermissions = permissions.filter((p) => !actingPermissions.includes(p));

      if (unauthorizedPermissions.length > 0) {
        const error = new Error(
          `Privilege escalation denied: You cannot grant permissions you do not possess (${unauthorizedPermissions.join(', ')}).`
        );
        error.status = 403;
        throw error;
      }
    }

    // 2. Safeguard: Never deactivate the final active administrator or sole manager
    if (isActive === false && targetAdmin.isActive) {
      const activeAdminCount = await prisma.adminUser.count({
        where: { isActive: true },
      });

      if (activeAdminCount <= 1) {
        const error = new Error('Action blocked: At least one active administrator must remain in the system.');
        error.status = 400;
        throw error;
      }

      // Safeguard: Cannot deactivate the only active administrator with MANAGE_ADMINS
      const hasManageAdmins = targetAdmin.permissions.some(
        (p) => (typeof p === 'string' ? p : p.permission) === 'MANAGE_ADMINS'
      );
      if (hasManageAdmins) {
        const otherActiveManagers = await prisma.adminUser.count({
          where: {
            id: { not: id },
            isActive: true,
            permissions: {
              some: { permission: 'MANAGE_ADMINS' },
            },
          },
        });

        if (otherActiveManagers < 1) {
          const error = new Error(
            'Action blocked: At least one active administrator must retain the MANAGE_ADMINS permission.'
          );
          error.status = 400;
          throw error;
        }
      }
    }

    // Safeguard: Cannot strip MANAGE_ADMINS from the sole active manager
    const willBeActive = typeof isActive === 'boolean' ? isActive : targetAdmin.isActive;
    if (willBeActive && permissions && Array.isArray(permissions) && !permissions.includes('MANAGE_ADMINS')) {
      const currentlyHasManageAdmins = targetAdmin.permissions.some(
        (p) => (typeof p === 'string' ? p : p.permission) === 'MANAGE_ADMINS'
      );

      if (currentlyHasManageAdmins) {
        const otherActiveManagers = await prisma.adminUser.count({
          where: {
            id: { not: id },
            isActive: true,
            permissions: {
              some: { permission: 'MANAGE_ADMINS' },
            },
          },
        });

        if (otherActiveManagers < 1) {
          const error = new Error(
            'Action blocked: At least one active administrator must retain the MANAGE_ADMINS permission.'
          );
          error.status = 400;
          throw error;
        }
      }
    }

    // 3. Apply updates in transaction
    const updatedAdmin = await prisma.$transaction(async (tx) => {
      // Update permissions if provided
      if (permissions && Array.isArray(permissions)) {
        await tx.adminPermission.deleteMany({
          where: { adminId: id },
        });

        await tx.adminPermission.createMany({
          data: permissions.map((perm) => ({
            adminId: id,
            permission: perm,
          })),
        });

        await tx.adminAuditLog.create({
          data: {
            actorAdminId: actingAdmin.id,
            targetAdminId: id,
            action: 'ADMIN_PERMISSION_CHANGED',
            metadata: {
              oldPermissions: targetAdmin.permissions.map((p) => p.permission),
              newPermissions: permissions,
            },
          },
        });
      }

      // Track status transitions
      if (typeof isActive === 'boolean' && isActive !== targetAdmin.isActive) {
        await tx.adminAuditLog.create({
          data: {
            actorAdminId: actingAdmin.id,
            targetAdminId: id,
            action: isActive ? 'ADMIN_ACTIVATED' : 'ADMIN_DEACTIVATED',
            metadata: {
              previousStatus: targetAdmin.isActive,
              newStatus: isActive,
            },
          },
        });
      }

      const updateData = {};
      if (displayName !== undefined) updateData.displayName = displayName;
      if (typeof isActive === 'boolean') updateData.isActive = isActive;

      const record = await tx.adminUser.update({
        where: { id },
        data: updateData,
        include: { permissions: true },
      });

      await tx.adminAuditLog.create({
        data: {
          actorAdminId: actingAdmin.id,
          targetAdminId: id,
          action: 'ADMIN_UPDATED',
          metadata: {
            updatedFields: Object.keys(updateData),
          },
        },
      });

      return record;
    },
    { maxWait: 15000, timeout: 25000 }
  );

    return {
      id: updatedAdmin.id,
      userId: updatedAdmin.userId,
      email: updatedAdmin.email,
      displayName: updatedAdmin.displayName,
      isActive: updatedAdmin.isActive,
      permissions: updatedAdmin.permissions.map((p) => p.permission),
      updatedAt: updatedAdmin.updatedAt,
    };
  }

  /**
   * Activate an administrator.
   */
  async activateAdmin(id, actingAdmin) {
    return this.updateAdmin(id, { isActive: true, actingAdmin });
  }

  /**
   * Deactivate an administrator.
   */
  async deactivateAdmin(id, actingAdmin) {
    return this.updateAdmin(id, { isActive: false, actingAdmin });
  }

  /**
   * Permanently delete an administrator account with safety checks.
   */
  async deleteAdmin(id, actingAdmin) {
    const targetAdmin = await prisma.adminUser.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!targetAdmin) {
      const error = new Error(`Administrator with ID "${id}" was not found.`);
      error.status = 404;
      throw error;
    }

    // Safeguard 1: Cannot delete if they are active and the last active admin
    // Safeguard 1: Cannot delete the only active administrator who possesses MANAGE_ADMINS
    if (targetAdmin.isActive) {
      const hasManageAdmins = targetAdmin.permissions.some(
        (p) => (typeof p === 'string' ? p : p.permission) === 'MANAGE_ADMINS'
      );
      if (hasManageAdmins) {
        const otherActiveManagers = await prisma.adminUser.count({
          where: {
            id: { not: id },
            isActive: true,
            permissions: {
              some: { permission: 'MANAGE_ADMINS' },
            },
          },
        });

        if (otherActiveManagers < 1) {
          const error = new Error(
            'Action blocked: Cannot delete the only active administrator who possesses the MANAGE_ADMINS permission.'
          );
          error.status = 400;
          throw error;
        }
      }
    }

    // Safeguard 2: Prevent deleting the only remaining active administrator
    if (targetAdmin.isActive) {
      const activeAdminCount = await prisma.adminUser.count({
        where: { isActive: true },
      });

      if (activeAdminCount <= 1) {
        const error = new Error('Action blocked: Cannot delete the only remaining active administrator.');
        error.status = 400;
        throw error;
      }
    }

    // Safeguard 3: Prevent accidental self-deletion if there are 2 or fewer admins without confirmation
    if (id === actingAdmin.id) {
      const activeCount = await prisma.adminUser.count({ where: { isActive: true } });
      if (activeCount <= 1) {
        const error = new Error('Action blocked: You cannot delete your own account as the final active administrator.');
        error.status = 400;
        throw error;
      }
    }

    await prisma.$transaction(async (tx) => {
      // Log deletion before cascade
      await tx.adminAuditLog.create({
        data: {
          actorAdminId: actingAdmin.id,
          targetAdminId: id,
          action: 'ADMIN_DELETED',
          metadata: {
            email: targetAdmin.email,
            displayName: targetAdmin.displayName,
            permissions: targetAdmin.permissions.map((p) => p.permission),
          },
        },
      });

      // Delete admin profile (cascades to AdminPermission)
      await tx.adminUser.delete({
        where: { id },
      });

      // Revert base user role to BUSINESS_OWNER so they lose admin authorization
      await tx.user.update({
        where: { id: targetAdmin.userId },
        data: { role: 'BUSINESS_OWNER' },
      });
    },
    { maxWait: 15000, timeout: 25000 }
  );

    return {
      success: true,
      message: `Administrator "${targetAdmin.displayName || targetAdmin.email}" deleted successfully.`,
    };
  }
}

export const adminManagementService = new AdminManagementService();
export default adminManagementService;
