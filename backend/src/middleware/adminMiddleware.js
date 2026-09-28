import prisma from '../config/prisma.js';
import { authMiddleware } from './authMiddleware.js';

export const ALL_ADMIN_PERMISSIONS = [
  'MANAGE_ADMINS',
  'MANAGE_BUSINESSES',
  'MANAGE_BUSINESS_REQUESTS',
  'MANAGE_QR_REQUESTS',
  'MANAGE_PRICING',
  'VIEW_ANALYTICS',
  'MANAGE_QR',
  'VIEW_DASHBOARD',
];

/**
 * Middleware ensuring the authenticated user has the ADMIN role and an active AdminUser profile.
 * Attaches req.adminUser with granted permissions.
 */
export const adminMiddleware = async (req, res, next) => {
  if (!req.user) {
    return authMiddleware(req, res, () => {
      resolveAdminProfile(req, res, next);
    });
  }

  resolveAdminProfile(req, res, next);
};

async function resolveAdminProfile(req, res, next) {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied. Administrative privileges are required for this action.',
      });
    }

    // Find local AdminUser profile
    let adminProfile = await prisma.adminUser.findUnique({
      where: { userId: req.user.id },
      include: { permissions: true },
    });

    // If no admin profile exists yet for this ADMIN user, auto-provision with all permissions
    // ensuring zero lockout for existing or newly promoted administrators.
    if (!adminProfile) {
      adminProfile = await prisma.adminUser.create({
        data: {
          userId: req.user.id,
          displayName: req.user.name || req.user.email?.split('@')[0] || 'Admin',
          email: req.user.email,
          isActive: true,
          permissions: {
            create: ALL_ADMIN_PERMISSIONS.map((perm) => ({ permission: perm })),
          },
        },
        include: { permissions: true },
      });
    }

    // Check active status
    if (!adminProfile.isActive) {
      return res.status(403).json({
        error: 'AdminDeactivated',
        message: 'Your administrator account has been deactivated. Access denied.',
      });
    }

    // Update lastLoginAt timestamp periodically (max once every 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (!adminProfile.lastLoginAt || adminProfile.lastLoginAt < fiveMinutesAgo) {
      prisma.adminUser
        .update({
          where: { id: adminProfile.id },
          data: { lastLoginAt: new Date() },
        })
        .catch((err) => console.warn('[AdminMiddleware] Failed to update lastLoginAt:', err.message));
    }

    req.adminUser = {
      id: adminProfile.id,
      userId: req.user.id,
      email: adminProfile.email || req.user.email,
      displayName: adminProfile.displayName || req.user.name,
      isActive: adminProfile.isActive,
      permissions: adminProfile.permissions.map((p) => p.permission),
    };

    next();
  } catch (err) {
    console.error('[AdminMiddleware] Profile resolution error:', err);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to verify administrator profile.',
    });
  }
}

/**
 * Middleware factory ensuring the active administrator possesses the required granular permission.
 * @param {string} requiredPermission - Must match an AdminPermissionType enum value
 */
export const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Administrative privileges required.',
      });
    }

    if (!req.adminUser.isActive) {
      return res.status(403).json({
        error: 'AdminDeactivated',
        message: 'Administrator account has been deactivated.',
      });
    }

    if (!req.adminUser.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        error: 'InsufficientPermissions',
        message: `Access denied. Requires '${requiredPermission}' permission.`,
        requiredPermission,
      });
    }

    next();
  };
};
