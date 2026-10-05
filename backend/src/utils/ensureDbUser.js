import prisma from '../config/prisma.js';

/**
 * Ensure user authenticated by Supabase exists in local PostgreSQL database
 * and attach the local database UUID to req.user.id.
 */
export const ensureDbUser = async (req) => {
  if (req.user?.id) return req.user;

  let dbUser = await prisma.user.findUnique({
    where: { supabaseUserId: req.user.supabaseUserId },
  });

  if (!dbUser) {
    const name = req.user.metadata?.name || req.user.metadata?.full_name || null;
    dbUser = await prisma.user.create({
      data: {
        supabaseUserId: req.user.supabaseUserId,
        email: req.user.email,
        name,
        role: 'BUSINESS_OWNER',
      },
    });
  }

  req.user.id = dbUser.id;
  return req.user;
};

export default ensureDbUser;
