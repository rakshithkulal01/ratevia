import React from 'react';
import { Button } from '../ui/Button';
import { CheckCircle2 } from 'lucide-react';

export const BusinessRequestSuccess = ({ onReset }) => {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-100 text-emerald-600 mx-auto">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h3 className="font-display text-2xl text-foreground font-semibold">
        Request received.
      </h3>
      <p className="text-sm text-foreground max-w-md mx-auto leading-relaxed">
        Thanks for your interest in Ratevia.
      </p>
      <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
        We'll contact you shortly to understand your business and help you get started.
      </p>
      <div className="pt-4">
        <Button variant="outline" size="sm" onClick={onReset} className="rounded-md">
          Submit another inquiry
        </Button>
      </div>
    </div>
  );
};

export default BusinessRequestSuccess;
