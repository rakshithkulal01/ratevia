/**
 * Ratevia SEO Configuration
 * Centralized metadata, URLs, defaults, and structured data schemas.
 */

export const SITE_CONFIG = {
  name: 'Ratevia',
  legalName: 'Ratevia Technologies',
  domain: 'ratevia.in',
  siteUrl: 'https://ratevia.in',
  defaultTitle: 'Google Review QR Code for Business — Ratevia',
  titleTemplate: '%s — Ratevia',
  defaultDescription:
    "Create a custom Google Review QR code for your business. Ratevia's branded QR stands help cafés, restaurants, and hotels collect more authentic reviews. One-time payment, no subscription.",
  ogImage: 'https://ratevia.in/og-image.png',
  twitterHandle: '@ratevia',
  themeColor: '#0052FF',
  locale: 'en_IN',
};

export const DEFAULT_ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_CONFIG.name,
  legalName: SITE_CONFIG.legalName,
  url: SITE_CONFIG.siteUrl,
  logo: `${SITE_CONFIG.siteUrl}/favicon.svg`,
  sameAs: [
    'https://twitter.com/ratevia',
    'https://www.linkedin.com/company/ratevia',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    url: `${SITE_CONFIG.siteUrl}/contact`,
  },
};

export const DEFAULT_WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.siteUrl,
  description: SITE_CONFIG.defaultDescription,
};
