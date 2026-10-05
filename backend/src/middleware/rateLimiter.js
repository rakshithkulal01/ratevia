import rateLimit from 'express-rate-limit';

/**
 * Standardized JSON error response handler for rate-limited requests.
 */
const createLimiterResponse = (message) => ({
  error: 'TooManyRequests',
  message,
});

/**
 * Rate limiter for customer feedback submission (POST /api/feedback)
 * Recommended: 10 requests / minute / IP
 */
export const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: createLimiterResponse('Too many feedback submissions from this network. Please wait a moment before trying again.'),
});

/**
 * Rate limiter for registration requests (POST /api/business-requests)
 * Recommended: 3 requests / hour / IP
 */
export const businessRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: createLimiterResponse('Too many business registration requests from this network. Please try again in an hour.'),
});

/**
 * Rate limiter for public QR setup submissions (POST /api/public/qr-requests)
 * Recommended: 3 requests / hour / IP
 */
export const qrRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: createLimiterResponse('Too many QR design submissions from this network. Please try again in an hour.'),
});

/**
 * Rate limiter for analytics batch ingestion (POST /api/analytics/batch)
 * Recommended: 60 requests / minute / IP
 */
export const analyticsBatchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: createLimiterResponse('Analytics reporting rate limit reached. Please wait before reporting new batches.'),
});

/**
 * Rate limiter for public business QR resolution (GET /api/qr/public/:slug)
 * Recommended: 120 requests / minute / IP
 */
export const publicQrLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: createLimiterResponse('Too many requests. Please wait a moment before trying again.'),
});
