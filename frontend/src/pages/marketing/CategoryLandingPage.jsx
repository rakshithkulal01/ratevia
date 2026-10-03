import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEOHead from '../../components/seo/SEOHead';
import { getCategoryLandingData, CATEGORY_LANDING_DATA } from '../../config/categoryLandingData';
import { BUSINESS_CATEGORIES } from '../../config/businessCategories';
import { usePlatformPrice } from '../../hooks/usePlatformPrice';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  MapPin,
  Star,
  Quote,
  Layers,
  ShieldCheck,
  Store,
} from 'lucide-react';

export const CategoryLandingPage = () => {
  const { category: rawCategory } = useParams();
  const categoryData = getCategoryLandingData(rawCategory);
  const { formattedPrice } = usePlatformPrice();
  const [openFaq, setOpenFaq] = useState(0);

  if (!categoryData) {
    return <Navigate to="/review-qr-code" replace />;
  }

  const baseConfig = BUSINESS_CATEGORIES[categoryData.categoryKey] || {};
  const Icon = baseConfig.icon || Store;
  const canonicalUrl = `https://ratevia.in/review-qr-code/${categoryData.slug}`;

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
        name: 'Review QR Codes',
        item: 'https://ratevia.in/review-qr-code',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: baseConfig.displayName || categoryData.slug,
        item: canonicalUrl,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: categoryData.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  const otherCategories = Object.values(CATEGORY_LANDING_DATA).filter(
    (c) => c.slug !== categoryData.slug
  );

  return (
    <div className="space-y-20 pb-20">
      <SEOHead
        title={categoryData.metaTitle}
        exactTitle={true}
        description={categoryData.metaDescription}
        canonicalUrl={canonicalUrl}
        schema={[breadcrumbSchema, faqSchema]}
      />

      {/* 1. BREADCRUMBS & HERO SECTION */}
      <section className="relative pt-8 md:pt-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
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
                Review QR Codes
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </li>
            <li className="text-foreground font-medium truncate" aria-current="page">
              {baseConfig.displayName}
            </li>
          </ol>
        </nav>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/3 left-10 -z-10 h-60 w-60 rounded-full bg-accent-secondary/10 blur-3xl" />

        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          {/* Section Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3.5 py-1 text-xs font-mono font-medium text-accent">
            <Icon className="h-3.5 w-3.5" />
            <span>{categoryData.heroBadge}</span>
          </div>

          {/* H1 Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground font-normal tracking-tight leading-[1.15]">
            {categoryData.h1}
          </h1>

          {/* Subtitle / Value Proposition */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl font-sans">
            {categoryData.valueProposition}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
            <Link to="/qr-customize" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md shadow-accent/20 gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Customize Stand — {formattedPrice}</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pricing" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Pricing Details
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. PLACEMENT STRATEGY SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="font-mono text-xs uppercase">
            High-Impact Placement
          </Badge>
          <h2 className="font-display text-3xl text-foreground font-normal">
            Where to place your QR stand for maximum scans
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Strategic touchpoints designed for your venue layout and guest flow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryData.placementTips.map((tip, idx) => (
            <Card key={idx} className="p-6 space-y-3 hover:border-accent/40 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground text-base">{tip.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{tip.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. CATEGORY POSITIVE TOPICS */}
      {baseConfig.positiveTopics && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 md:p-10 border border-accent/20 bg-accent/5 rounded-3xl space-y-6">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <Badge variant="outline" className="font-mono text-xs uppercase bg-white border-accent/30 text-accent">
                Smart Feedback Prompts
              </Badge>
              <h2 className="font-display text-2xl sm:text-3xl text-foreground font-normal">
                Vocabularies tailored for {baseConfig.displayName} patrons
              </h2>
              <p className="text-xs text-muted-foreground">
                Customers simply tap highlights of their visit. Ratevia crafts natural phrasing without generic clichés.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {baseConfig.positiveTopics.map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-border/80 text-foreground text-xs font-medium shadow-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{topic}</span>
                </span>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* 4. SAMPLE GENERATED REVIEW SHOWCASE */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center">
        <div className="space-y-2">
          <Badge variant="outline" className="font-mono text-xs uppercase">
            Organic Voice
          </Badge>
          <h2 className="font-display text-3xl text-foreground font-normal">
            What your Google reviews will sound like
          </h2>
          <p className="text-xs text-muted-foreground">
            Authentic, detailed reviews that highlight what makes your venue distinct.
          </p>
        </div>

        <Card className="p-8 text-left max-w-2xl mx-auto shadow-md border-border/80 relative">
          <Quote className="h-8 w-8 text-accent/20 absolute top-6 right-6" />
          <div className="flex items-center gap-1 text-amber-500 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-4 w-4 fill-amber-500" />
            ))}
            <span className="text-xs font-semibold text-foreground ml-2">5.0 on Google Maps</span>
          </div>
          <p className="text-sm sm:text-base text-foreground italic leading-relaxed">
            {categoryData.sampleReview}
          </p>
          <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>Customer maintains 100% editing control</span>
            <span className="text-accent font-medium font-mono">1-Tap Copy to Google</span>
          </div>
        </Card>
      </section>

      {/* 5. SPECIFIC BENEFIT CARDS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="font-mono text-xs uppercase">
            Why Ratevia Works
          </Badge>
          <h2 className="font-display text-3xl text-foreground font-normal">
            Built specifically for the flow of a {baseConfig.displayName}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryData.differentiators.map((diff, idx) => (
            <Card key={idx} className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground text-base">{diff.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{diff.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. CATEGORY FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="font-mono text-xs uppercase">
            Common Questions
          </Badge>
          <h2 className="font-display text-3xl text-foreground font-normal">
            Frequently Asked Questions for {baseConfig.displayName}s
          </h2>
        </div>

        <div className="space-y-3">
          {categoryData.faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <Card
                key={idx}
                className={`transition-all border ${
                  isOpen ? 'border-accent shadow-xs' : 'border-border/80'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-semibold text-foreground text-sm sm:text-base">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-accent' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* 7. OTHER CATEGORIES NAVIGATION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="font-display text-xl text-foreground font-normal">
            Explore Ratevia for other business categories
          </h3>
          <p className="text-xs text-muted-foreground">
            Custom-tailored review collections across retail, hospitality, and wellness.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {otherCategories.map((other) => {
            const cfg = BUSINESS_CATEGORIES[other.categoryKey] || {};
            const OtherIcon = cfg.icon || Store;
            return (
              <Link
                key={other.slug}
                to={`/review-qr-code/${other.slug}`}
                className="group block"
              >
                <Card className="p-4 text-center space-y-2 hover:border-accent/40 transition-all group-hover:-translate-y-0.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent mx-auto group-hover:bg-accent group-hover:text-white transition-colors">
                    <OtherIcon className="h-4 w-4" />
                  </div>
                  <h4 className="font-semibold text-foreground text-xs">{cfg.displayName}</h4>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="font-display text-3xl sm:text-4xl text-foreground font-normal">
          Ready to collect 5-star Google reviews for your {baseConfig.displayName}?
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          One-time payment of {formattedPrice}. Includes your branded tabletop standee assets, lifetime dashboard access, and unlimited customer scans.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/qr-customize">
            <Button variant="primary" size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Customize QR Stand</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
