import React from 'react';
import { Card } from '../ui/Card';
import { CheckCircle2 } from 'lucide-react';

export const PlanHighlightsCard = () => {
  return (
    <Card className="md:col-span-5 p-6 space-y-6 bg-muted/20 border-border/70">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
            What's Included
          </span>
        </div>
        <h3 className="font-display text-2xl font-bold text-foreground">
          ₹1,000 <span className="text-xs font-normal text-muted-foreground font-sans">one-time</span>
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          No monthly subscription. No scan limits.
        </p>
      </div>

      <div className="space-y-3 text-xs text-foreground">
        {[
          'Custom QR code standee & digital link',
          'AI-assisted review suggestion engine',
          'Constructive feedback intake with 30-day retention',
          'Business analytics & Recharts dashboard',
          'Google review redirection flow',
          'Unlimited QR scans & customer feedback',
          'Direct administrator onboarding & verification',
        ].map((feature, idx) => (
          <div key={idx} className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border text-xs text-muted-foreground">
        <p className="leading-relaxed">
          Once you submit your request, our team contacts you directly to understand your business, verify your Google Maps profile, and activate your account.
        </p>
      </div>
    </Card>
  );
};

export default PlanHighlightsCard;
