import prisma from '../config/prisma.js';

/**
 * Generates a clean, URL-safe slug from a string.
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

/**
 * Generates a guaranteed unique slug for a business in PostgreSQL.
 * If the base slug exists, appends incremental counters (-1, -2, etc.).
 */
export const generateUniqueBusinessSlug = async (businessName) => {
  const baseSlug = slugify(businessName) || 'business';
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.business.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};
