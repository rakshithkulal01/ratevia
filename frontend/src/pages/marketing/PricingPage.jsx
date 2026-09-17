import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
} from 'lucide-react';

export const PricingPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="outline" className="font-mono text-xs uppercase">
          Simple, Transparent Pricing
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl text-foreground font-normal">
          Start free, upgrade when you're convinced<span className="text-accent">.</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Experience the full power of Ratevia with a complete 20-day free trial. No credit card required, no hidden commitments.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {/* Card 1: 20-Day Free Demo Trial (Highlighted) */}
        <Card className="p-8 border-2 border-accent relative flex flex-col justify-between shadow-lg shadow-accent/5">
          <div className="absolute -top-3 left-8">
            <Badge variant="default" className="bg-accent text-white font-mono text-xs uppercase px-3 py-1">
              Active Demo Access
            </Badge>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-display text-2xl text-foreground">20-Day Free Trial</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Full platform access for testing with your actual guests.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold text-foreground">$0</span>
              <span className="text-xs font-medium text-muted-foreground">for 20 days</span>
            </div>

            <div className="space-y-3 pt-2 text-xs text-foreground">
              {[
                'Instant custom QR code with business branding',
                'Unlimited customer feedback submissions',
                'AI-assisted review suggestion generator',
                'Customer experience analytics & Recharts dashboard',
                'High-resolution (1024x1024) printable PNG standee',
                '100% Google policy compliant workflow',
                'No credit card required at signup',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <Link to="/signup" className="w-full">
              <Button variant="primary" size="lg" className="w-full justify-center">
                <span>Start 20-Day Trial</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Card 2: Pro Business (Commercial Roadmap) */}
        <Card className="p-8 flex flex-col justify-between bg-muted/20 border-border/80">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl text-foreground">Pro Business</h3>
                <Badge variant="outline" className="text-[10px] font-mono uppercase">
                  Upcoming
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                For continuous review growth and ongoing local reputation management.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold text-foreground">$29</span>
              <span className="text-xs font-medium text-muted-foreground">/ month per location</span>
            </div>

            <div className="space-y-3 pt-2 text-xs text-muted-foreground">
              {[
                'Everything included in the free trial',
                'Continuous review collection without expiration',
                'Multi-table QR tracking & custom parameter routing',
                'Weekly email digests of patron impressions',
                'Priority customer support',
                'Dedicated onboarding specialist for your staff',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <Link to="/signup" className="w-full">
              <Button variant="outline" size="lg" className="w-full justify-center">
                Try Free First
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* FAQ Teaser */}
      <div className="max-w-2xl mx-auto text-center space-y-4 pt-8">
        <h3 className="font-display text-xl text-foreground">Have questions about our trial?</h3>
        <p className="text-xs text-muted-foreground">
          Learn more about how our QR codes work, data retention after trials, and Google review policies.
        </p>
        <div>
          <Link to="/faq">
            <Button variant="ghost" size="sm" className="text-accent hover:underline">
              Visit our FAQ &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
