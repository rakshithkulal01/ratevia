import { getSupabaseAdmin } from '../config/supabase.js';
import prisma from '../config/prisma.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header. Expected format: Bearer <token>',
      });
    }

    const token = authHeader.split(' ')[1]?.trim();

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Bearer token is empty',
      });
    }

    // Support mock tokens during automated integration tests only
    if (process.env.NODE_ENV === 'test' && token.startsWith('test-token-')) {
      const targetRole = token.replace('test-token-', '').toUpperCase();
      let dbUser = await prisma.user.findFirst({ where: { role: targetRole } });
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: `test-${targetRole.toLowerCase()}@ratevia.test`,
            supabaseUserId: `test-sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: `Test ${targetRole}`,
            role: targetRole,
          },
        });
      }
      req.user = {
        id: dbUser.id,
        supabaseUserId: dbUser.supabaseUserId,
        email: dbUser.email,
        role: dbUser.role,
        metadata: {},
      };
      req.dbUser = dbUser;
      return next();
    }

    // Verify token with Supabase Admin Auth
    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch (configError) {
      console.error('[AuthMiddleware] Supabase config error:', configError.message);
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: configError.message,
      });
    }

    const { data: { user: supabaseUser }, error: supabaseError } = await supabase.auth.getUser(token);

    if (supabaseError || !supabaseUser) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: supabaseError?.message || 'Invalid or expired session token',
      });
    }

    // Look up local user in PostgreSQL
    let dbUser = null;
    try {
      dbUser = await prisma.user.findUnique({
        where: { supabaseUserId: supabaseUser.id },
      });
    } catch (dbError) {
      console.error('[AuthMiddleware] DB lookup error:', dbError.message);
      // DB connection issues should not be masked as a simple 401
      return res.status(500).json({
        error: 'DatabaseError',
        message: 'Failed to query user records from database',
      });
    }

    // Attach verified user info to request
    req.user = {
      id: dbUser?.id || null,
      supabaseUserId: supabaseUser.id,
      email: supabaseUser.email,
      role: dbUser?.role || 'BUSINESS_OWNER',
      metadata: supabaseUser.user_metadata || {},
    };

    req.dbUser = dbUser;

    next();
  } catch (error) {
    console.error('[AuthMiddleware] Unexpected error:', error);
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An error occurred while validating authentication',
    });
  }
};
