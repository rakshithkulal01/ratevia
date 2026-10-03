import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../seo/SEOHead';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ChevronRight, Sparkles, ArrowRight, Clock, Calendar, User } from 'lucide-react';
import { usePlatformPrice } from '../../hooks/usePlatformPrice';

export const GuideLayout = ({
  title,
  description,
  publishDate = '2026-10-01',
  readTime = '5 min read',
  author = 'Ratevia Editorial Team',
  canonicalUrl,
  badge = 'PRACTICAL GUIDE',
  children,
}) => {
  const { formattedPrice } = usePlatformPrice();

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    author: {
      '@type': 'Organization',
      name: author,
      url: 'https://ratevia.in',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ratevia',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ratevia.in/favicon.svg',
      },
    },
    datePublished: publishDate,
    dateModified: '2026-10-03',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://ratevia.in/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Guides',
        item: 'https://ratevia.in/review-qr-code',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <article className="py-10 md:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      <SEOHead
        title={title}
        description={description}
        canonicalUrl={canonicalUrl}
        ogType="article"
        schema={[articleSchema, breadcrumbSchema]}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-xs text-muted-foreground font-mono">
          <li>
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          </li>
          <li>
            <Link to="/review-qr-code" className="hover:text-foreground transition-colors">
              Guides
            </Link>
          </li>
          <li>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          </li>
          <li className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none" aria-current="page">
            {title}
          </li>
        </ol>
      </nav>

      {/* Guide Header */}
      <header className="space-y-4 text-center max-w-3xl mx-auto">
        <Badge variant="outline" className="font-mono text-xs uppercase">
          {badge}
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground font-normal tracking-tight leading-[1.2]">
          {title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans">
          {description}
        </p>

        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2 font-mono">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {author}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {readTime}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {publishDate}
          </span>
        </div>
      </header>

      {/* Guide Body Content */}
      <div className="prose prose-slate max-w-none space-y-6 text-foreground text-sm sm:text-base leading-relaxed">
        {children}
      </div>

      {/* Conversion Banner */}
      <Card className="p-8 text-center space-y-4 bg-muted/20 border-accent/20">
        <h3 className="font-display text-2xl text-foreground font-normal">
          Collect More Google Reviews for Your Business
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
          Get a custom branded QR stand for a {formattedPrice} one-time payment. Zero subscriptions, lifetime dashboard access, and unlimited customer reviews.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/qr-customize">
            <Button variant="primary" size="md" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Customize QR Stand</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button variant="outline" size="md">
              View Pricing
            </Button>
          </Link>
        </div>
      </Card>
    </article>
  );
};
