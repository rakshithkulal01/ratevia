import { authMiddleware } from './authMiddleware.js';

/**
 * Middleware ensuring the authenticated user has the ADMIN role.
 * Must be preceded by authMiddleware or runs authMiddleware first.
 */
export const adminMiddleware = async (req, res, next) => {
  // Ensure user is authenticated first
  if (!req.user) {
    return authMiddleware(req, res, () => {
      checkAdminRole(req, res, next);
    });
  }

  checkAdminRole(req, res, next);
};

function checkAdminRole(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied. Administrative privileges are required for this action.',
    });
  }
  next();
}
