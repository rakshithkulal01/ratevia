import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import prisma from '../config/prisma.js';

const router = Router();

/**
 * POST /api/auth/sync
 * Synchronize the authenticated Supabase user with the local PostgreSQL User table.
 */
router.post('/sync', authMiddleware, async (req, res, next) => {
  try {
    const { supabaseUserId, email, metadata } = req.user;

    let user = req.dbUser;

    if (!user) {
      // Extract name from Supabase user metadata if available
      const name = metadata?.name || metadata?.full_name || metadata?.user_name || null;

      // Always assign BUSINESS_OWNER as default role. Never trust role from client.
      user = await prisma.user.create({
        data: {
          supabaseUserId,
          email,
          name,
          role: 'BUSINESS_OWNER',
        },
      });

      console.log(`[AuthSync] Created local user for ${email} (${user.id})`);
    } else {
      // Optionally update name if it changed in metadata and was null in DB
      const name = metadata?.name || metadata?.full_name || null;
      if (name && !user.name) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { name },
        });
      }
    }

    res.status(200).json({
      user: {
        id: user.id,
        supabaseUserId: user.supabaseUserId,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Return the current authenticated user and active business information.
 */
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    if (!req.dbUser) {
      return res.status(404).json({
        error: 'UserNotFound',
        message: 'User profile not found. Please sync your account first.',
      });
    }

    const userWithBusinesses = await prisma.user.findUnique({
      where: { id: req.dbUser.id },
      select: {
        id: true,
        supabaseUserId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        businesses: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            businessType: true,
            slug: true,
            googleReviewUrl: true,
            isActive: true,
            createdAt: true,
            subscription: {
              select: {
                id: true,
                status: true,
                trialStartsAt: true,
                trialEndsAt: true,
                subscriptionStartsAt: true,
                subscriptionEndsAt: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      user: userWithBusinesses,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
