import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import {
  QrCode,
  Star,
  Sparkles,
  MessageSquare,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Copy,
  Sliders,
  ChevronRight,
  Store,
  Coffee,
  Hotel,
  UtensilsCrossed,
} from 'lucide-react';

export const HomePage = () => {
  // Interactive Product Preview Step
  const [activeStep, setActiveStep] = useState(0);

  const previewSteps = [
    {
      step: '01',
      title: 'Scan QR at Table',
      badge: 'Touchless Intake',
      description: 'Patrons scan the placed table standee or receipt QR code with their mobile camera.',
      previewContent: (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-border inline-block">
            <QrCode className="h-28 w-28 text-accent mx-auto" />
          </div>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-3 py-1 rounded-full">
            ratevia.com/r/coastal-brew
          </span>
          <p className="text-xs text-muted-foreground">Scan with iOS Camera or Android Lens</p>
        </div>
      ),
    },
    {
      step: '02',
      title: 'Rate & Select Topics',
      badge: 'Expressive Feedback',
      description: 'Customer chooses 1–5 stars and taps what made their visit memorable or what could be improved.',
      previewContent: (
        <div className="space-y-4 p-4">
          <div className="text-center space-y-1">
            <span className="text-xs font-mono uppercase text-muted-foreground">How was your visit?</span>
            <div className="flex justify-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-6 w-6 fill-amber-500" />
              ))}
            </div>
            <span className="text-xs font-medium text-foreground">5.0 — Excellent!</span>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 pt-2">
            {['Friendly Staff', 'Cold Brew', 'Cozy Ambiance', 'Fast Service'].map((t) => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-accent text-white font-medium">
                {t} ✓
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      step: '03',
      title: 'AI Review Assistance',
      badge: 'Zero Writer\'s Block',
      description: 'Ratevia formats genuine experiences into clear, helpful review suggestions they can refine.',
      previewContent: (
        <div className="space-y-3 p-4 bg-accent/5 rounded-xl border border-accent/20">
          <div className="flex items-center gap-1.5 text-xs font-mono text-accent font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>Generated Review Suggestion</span>
          </div>
          <p className="text-xs text-foreground italic leading-relaxed">
            "Had a fantastic time at Coastal Brew! The cold brew was exceptional, staff was warm and attentive, and the cozy ambiance made it the perfect spot. Highly recommend!"
          </p>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-accent/15">
            <span>Customer has 100% editing control</span>
            <span className="text-accent font-medium">3 Tone Variations</span>
          </div>
        </div>
      ),
    },
    {
      step: '04',
      title: 'Post to Google in Seconds',
      badge: 'One-Tap Copy',
      description: 'Customer copies their draft and opens the official Google Review page with a single tap.',
      previewContent: (
        <div className="p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 p-3 bg-white border border-border rounded-xl shadow-xs">
            <Copy className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium text-foreground">Review Copied to Clipboard!</span>
          </div>
          <Button variant="primary" size="sm" className="w-full justify-center">
            <span>Continue to Google Reviews</span>
            <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </Button>
          <p className="text-[11px] text-muted-foreground">
            Customer pastes review on Google directly. No Google credentials requested.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/3 left-10 -z-10 h-60 w-60 rounded-full bg-accent-secondary/10 blur-3xl" />

        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
          {/* Section Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3.5 py-1 text-xs font-mono font-medium text-accent">
            <span className="flex h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span>BUILT FOR CAFÉS, RESTAURANTS & HOTELS</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground font-normal tracking-tight leading-[1.15]">
            Turn customer experiences into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-secondary">
              better reviews.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl font-sans">
            Make it effortless for satisfied customers to share genuine feedback on Google, while capturing actionable insights to continuously improve your business.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md shadow-accent/20">
                <span>Start 20-Day Free Trial</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                See How It Works
              </Button>
            </a>
          </div>

          <div className="flex items-center gap-6 pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Google Policy Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Instant QR Generation
            </span>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE PRODUCT PREVIEW FLOW */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <Badge variant="outline" className="font-mono text-xs uppercase">
            Customer Experience Flow
          </Badge>
          <h2 className="font-display text-3xl text-foreground font-normal">
            From QR scan to 5-star review in under 30 seconds
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Experience how customers interact with your custom QR standee without leaving anything to chance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Step Selector Tabs */}
          <div className="lg:col-span-5 space-y-3">
            {previewSteps.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  activeStep === idx
                    ? 'border-accent bg-white shadow-md shadow-accent/5 translate-x-1'
                    : 'border-border/70 bg-muted/30 hover:bg-white hover:border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-semibold text-accent">{item.step}</span>
                  <Badge variant={activeStep === idx ? 'default' : 'outline'} className="text-[10px]">
                    {item.badge}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Interactive Mobile Simulator Screen */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-md rounded-3xl border-4 border-slate-800 bg-white p-4 shadow-xl">
              <div className="flex justify-between items-center px-4 py-2 border-b border-border/50 text-xs text-muted-foreground mb-4 font-mono">
                <span>ratevia.com/r/...</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <div className="min-h-[300px] flex items-center justify-center">
                {previewSteps[activeStep].previewContent}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR CORE VALUE PILLARS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <Badge variant="outline" className="font-mono text-xs uppercase">
            Platform Capabilities
          </Badge>
          <h2 className="font-display text-3xl text-foreground font-normal">
            Everything your venue needs to manage reviews
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">Review Assistance</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Solves customer writer’s block by proposing clear drafts based on what they genuinely loved about their visit.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">Customer Feedback</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Gives customers who had constructive remarks an immediate, listening ear so your management team can address issues.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">Business Analytics</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Track QR scan volumes, conversion rates to Google clicks, and daily feedback trends with beautiful Recharts graphics.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">Customer Insights</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Identify your most appreciated qualities (e.g. cold brew, staff friendliness) and spot operational bottlenecks before they escalate.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. INVERTED CONTRAST SECTION (fdesign.md Pattern 2) */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl max-w-6xl mx-auto shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="border-accent text-accent font-mono text-xs uppercase bg-accent/10">
            Ethics & Google Compliance
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl text-white font-normal leading-tight">
            Genuine experiences. Zero rating manipulation.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Ratevia strictly complies with Google Maps review guidelines. We never gate negative reviews, never request private customer Google account credentials, and never submit reviews automatically without user confirmation. Customers always maintain 100% control over their feedback.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left">
            <div className="border border-slate-800 p-4 rounded-xl bg-slate-800/40">
              <span className="font-mono text-accent text-sm font-semibold block mb-1">01. Compliance</span>
              <p className="text-xs text-slate-300">Customers can freely continue to Google regardless of star rating.</p>
            </div>
            <div className="border border-slate-800 p-4 rounded-xl bg-slate-800/40">
              <span className="font-mono text-accent text-sm font-semibold block mb-1">02. Authentic</span>
              <p className="text-xs text-slate-300">Review wording reflects the customer's actual chosen experience topics.</p>
            </div>
            <div className="border border-slate-800 p-4 rounded-xl bg-slate-800/40">
              <span className="font-mono text-accent text-sm font-semibold block mb-1">03. Confidential</span>
              <p className="text-xs text-slate-300">Operational concerns are sent privately to your management dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SUPPORTED BUSINESS CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="space-y-2">
          <Badge variant="outline" className="font-mono text-xs uppercase">
            Tailored Industry Profiles
          </Badge>
          <h2 className="font-display text-3xl text-foreground font-normal">
            Specialized vocabulary for your venue
          </h2>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            Topic suggestions are customized to your specific trade so patron reviews sound authentic.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="p-6 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mx-auto">
              <Coffee className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-foreground text-base">Cafés</h3>
            <p className="text-xs text-muted-foreground">
              Espresso, cold brew, pastries, cozy atmosphere, WiFi, quick take-away, friendly baristas.
            </p>
          </Card>

          <Card className="p-6 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-foreground text-base">Restaurants</h3>
            <p className="text-xs text-muted-foreground">
              Food presentation, chef specials, table service, waiting times, wine pairings, ambiance.
            </p>
          </Card>

          <Card className="p-6 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 mx-auto">
              <Hotel className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-foreground text-base">Hotels</h3>
            <p className="text-xs text-muted-foreground">
              Room comfort, front desk hospitality, cleanliness, breakfast buffet, concierge, checkout ease.
            </p>
          </Card>
        </div>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="font-display text-3xl sm:text-4xl text-foreground font-normal">
          Ready to elevate your business's Google reputation?
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Start your 20-day free trial in under 2 minutes. Generate your custom QR code, place it on your counters, and watch your reviews flourish.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/signup">
            <Button variant="primary" size="lg">
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button variant="outline" size="lg">
              View Pricing Details
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
