import { env } from '../config/env.js';

/**
 * Constructs the canonical public review route URL for a business slug.
 * Guarantees no trailing slashes on base and no duplicate slashes.
 *
 * Example:
 * Development: "http://localhost:5173/r/cafe-xyz"
 * Production:  "https://ratevia.in/r/cafe-xyz"
 *
 * @param {string} slug - Unique business slug
 * @returns {string} Fully-qualified customer review URL
 */
export function getCustomerReviewUrl(slug) {
  const base = (env.FRONTEND_URL || 'http://localhost:5173').trim().replace(/\/+$/, '');
  const cleanSlug = (slug || 'demo').trim().replace(/^\/+/, '');
  return `${base}/r/${cleanSlug}`;
}

export default getCustomerReviewUrl;
