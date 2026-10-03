import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../components/seo/SEOHead';
import { CATEGORY_LANDING_DATA } from '../../config/categoryLandingData';
import { BUSINESS_CATEGORIES, getCategoryOptions } from '../../config/businessCategories';
import { usePlatformPrice } from '../../hooks/usePlatformPrice';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  QrCode,
  Star,
  ShieldCheck,
  Zap,
  TrendingUp,
  Store,
  Layers,
} from 'lucide-react';

export const ReviewQRCodePage = () => {
  const { formattedPrice } = usePlatformPrice();
  const canonicalUrl = 'https://ratevia.in/review-qr-code';

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
        item: canonicalUrl,
      },
    ],
  };

  const highIntentCategories = Object.values(CATEGORY_LANDING_DATA);

  return (
    <div className="space-y-20 pb-20">
      <SEOHead
        title="Google Review QR Code — Collect More Reviews with Ratevia"
        exactTitle={true}
        description="Turn customer experiences into Google reviews with a branded QR code stand. Ratevia supports cafés, restaurants, hotels, salons, bakeries, and gyms. One-time payment."
        canonicalUrl={canonicalUrl}
        schema={breadcrumbSchema}
      />

      {/* 1. HERO SECTION */}
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
            <li className="text-foreground font-medium" aria-current="page">
              Review QR Codes
            </li>
          </ol>
        </nav>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/3 left-10 -z-10 h-60 w-60 rounded-full bg-accent-secondary/10 blur-3xl" />

        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3.5 py-1 text-xs font-mono font-medium text-accent">
            <QrCode className="h-3.5 w-3.5" />
            <span>GOOGLE REVIEW QR CODE FOR LOCAL BUSINESS</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground font-normal tracking-tight leading-[1.15]">
            Custom Google Review QR stands{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-secondary">
              that actually get scanned.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl font-sans">
            Paper signs and generic black-and-white QR codes get ignored. Ratevia creates beautifully branded, high-contrast acrylic stands and stickers that turn happy customers into passionate Google reviewers in under 30 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
            <Link to="/qr-customize" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md shadow-accent/20 gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Customize Your Stand — {formattedPrice}</span>
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pricing" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Pricing & Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SPECIALIZED CATEGORY HUBS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="font-mono text-xs uppercase">
            Industry Solutions
          </Badge>
          <h2 className="font-display text-3xl text-foreground font-normal">
            Choose your business type for custom QR strategies
          </h2>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            Each industry has unique guest rhythms and review triggers. Explore tailored placement tips and vocabulary prompts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {highIntentCategories.map((cat) => {
            const baseConfig = BUSINESS_CATEGORIES[cat.categoryKey] || {};
            const Icon = baseConfig.icon || Store;
            return (
              <Link
                key={cat.slug}
                to={`/review-qr-code/${cat.slug}`}
                className="group block transition-transform hover:-translate-y-1"
              >
                <Card className="p-6 h-full flex flex-col justify-between space-y-4 hover:border-accent/40 transition-colors">
                  <div className="space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-xl text-foreground flex items-center justify-between">
                      <span>{baseConfig.displayName}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {cat.heroTagline}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-accent font-medium">
                    <span>Explore {baseConfig.displayName} QR Guide</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. HOW THE RATEVIA QR FLOW WORKS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="font-mono text-xs uppercase">
            The Ratevia Advantage
          </Badge>
          <h2 className="font-display text-3xl text-foreground font-normal">
            Why our QR review flow converts 4x better
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Traditional QR codes drop customers into a blank Google box where writer’s block stalls reviews. Ratevia makes it effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">1. Instant Frictionless Scan</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No app download or account creation required. Customers scan with their native camera and land on your mobile feedback card instantly.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">2. AI-Assisted Prompts</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Customers choose what they loved. Ratevia generates eloquent phrasing reflecting their real feedback, eliminating writer's block.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">3. 100% Google Compliant</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Zero review gating. All customers have unrestricted access to open your official Google page, protecting your Maps standing.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. FINAL CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="font-display text-3xl sm:text-4xl text-foreground font-normal">
          Ready to get your custom Google review QR stand?
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Start for a one-time payment of {formattedPrice}. Receive custom printable standee artwork, dashboard access, and lifetime QR review analytics.
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
