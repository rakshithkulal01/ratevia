import React from 'react';
import { Card } from '../ui/Card';
import { Check, ExternalLink } from 'lucide-react';

export const CustomerThankYou = ({ business, rating, googleReviewUrl }) => {
  return (
    <Card className="p-8 text-center space-y-4 max-w-md mx-auto">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-100 text-emerald-600 mx-auto">
        <Check className="h-6 w-6" />
      </div>

      <div className="space-y-1">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Thank you for your feedback!
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your input has been directly shared with the management at{' '}
          <strong className="text-foreground">{business?.name}</strong>.
        </p>
      </div>

      {googleReviewUrl && (
        <div className="pt-3 border-t border-border space-y-2">
          <p className="text-xs text-muted-foreground">
            Your review was copied to your clipboard. Simply paste it on Google:
          </p>
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors"
          >
            <span>Open Google Reviews</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      <div className="pt-2 text-[10px] text-muted-foreground flex items-center justify-center gap-1">
        <span>Powered by</span>
        <strong className="font-mono text-foreground font-semibold">Ratevia</strong>
      </div>
    </Card>
  );
};

export default CustomerThankYou;
