import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const PricingPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="outline" className="font-mono text-xs uppercase">
          Simple Pricing
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl text-foreground font-normal">
          One payment. Zero recurring fees<span className="text-accent">.</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Everything a small business needs to collect customer feedback and improve its Google review flow without costly monthly subscriptions.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="max-w-lg mx-auto">
        <Card className="p-8 border-2 border-accent relative flex flex-col justify-between shadow-lg shadow-accent/5">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-2xl text-foreground">Ratevia</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Complete setup for small cafés, restaurants, and hotels.
                </p>
              </div>
              <Badge variant="default" className="bg-emerald-600 text-white font-mono text-[11px] uppercase px-2.5 py-1">
                One-Time Purchase
              </Badge>
            </div>

            <div className="flex items-baseline gap-2 pt-2">
              <span className="font-display text-4xl font-bold text-foreground">₹1,000</span>
              <span className="text-xs font-medium text-muted-foreground">one-time payment</span>
            </div>

            <div className="space-y-3 pt-2 text-xs text-foreground">
              {[
                'Custom QR feedback system with branded standee export',
                'Touchless mobile customer feedback collection',
                'AI-assisted review suggestion generator',
                'Seamless Google Review redirection flow',
                'Real-time business overview dashboard',
                'Customer experience analytics & Recharts trends',
                'Feedback history for retained 1–3★ constructive reviews',
                'Complete QR management & regeneration controls',
                'Unlimited customer QR scans and review submissions',
                'No monthly subscription or hidden fees',
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground pt-3 border-t border-border">
              Interested? Contact us to get your business provisioned by our team.
            </p>
          </div>

          <div className="pt-6">
            <Link to="/contact" className="w-full">
              <Button variant="primary" size="lg" className="w-full justify-center">
                <span>Contact Us to Get Ratevia</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* FAQ Teaser */}
      <div className="max-w-2xl mx-auto text-center space-y-4 pt-4">
        <h3 className="font-display text-xl text-foreground">Have questions about our ₹1,000 one-time plan?</h3>
        <p className="text-xs text-muted-foreground">
          Learn more about how our QR codes work, data privacy policies, and admin provisioning.
        </p>
        <div>
          <Link to="/faq">
            <Button variant="ghost" size="sm" className="text-accent hover:underline">
              Read Frequently Asked Questions &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
