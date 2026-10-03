import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '../../config/seoConfig';

/**
 * SEOHead - Centralized SEO and OpenGraph head tag manager
 *
 * @param {Object} props
 * @param {string} props.title - Page title (will be combined with titleTemplate if relative)
 * @param {boolean} [props.exactTitle=false] - If true, title is used as-is without suffix
 * @param {string} [props.description] - Page meta description
 * @param {string} [props.canonicalUrl] - Absolute canonical URL (e.g., https://ratevia.in/pricing)
 * @param {boolean} [props.noindex=false] - Whether to add noindex, nofollow
 * @param {string} [props.ogImage] - Social share image URL
 * @param {string} [props.ogType='website'] - OpenGraph type
 * @param {Object|Array} [props.schema] - JSON-LD schema object or array of schema objects
 * @param {React.ReactNode} [props.children] - Additional head tags or scripts
 */
export default function SEOHead({
  title,
  exactTitle = false,
  description = SITE_CONFIG.defaultDescription,
  canonicalUrl,
  noindex = false,
  ogImage = SITE_CONFIG.ogImage,
  ogType = 'website',
  schema,
  children,
}) {
  const pageTitle = title
    ? exactTitle
      ? title
      : title.includes(SITE_CONFIG.name)
      ? title
      : `${title} — ${SITE_CONFIG.name}`
    : SITE_CONFIG.defaultTitle;

  return (
    <Helmet>
      {/* Title */}
      <title>{pageTitle}</title>

      {/* Meta Description */}
      {description && <meta name="description" content={description} />}

      {/* Robots Directive */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* OpenGraph */}
      <meta property="og:title" content={pageTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_CONFIG.name} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {SITE_CONFIG.twitterHandle && (
        <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />
      )}

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}

      {children}
    </Helmet>
  );
}
