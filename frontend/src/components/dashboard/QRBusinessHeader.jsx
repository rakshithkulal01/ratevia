import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Power, Loader2, Sparkles, Building2 } from 'lucide-react';

/**
 * QRBusinessHeader
 * Section 1: Business Identity & Intake Status
 */
export const QRBusinessHeader = ({
  business,
  category,
  isActive,
  toggling,
  onToggleStatus,
}) => {
  const CategoryIcon = category?.icon || Building2;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge dot pulse={isActive} variant={isActive ? 'accent' : 'muted'}>
            {isActive ? 'Live Review Intake' : 'Intake Paused'}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border">
            <CategoryIcon className="h-3 w-3" />
            {category?.displayName || business?.businessType || 'Business'}
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl text-foreground">
          Branded QR Generator<span className="text-accent">.</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          A high-contrast, business-branded QR code designed for tabletop stands, reception counters, and receipts.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <Button
          variant={isActive ? 'outline' : 'primary'}
          size="sm"
          onClick={onToggleStatus}
          disabled={toggling}
          className="flex items-center gap-2"
        >
          {toggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Power className={`h-4 w-4 ${isActive ? 'text-amber-500' : 'text-white'}`} />
          )}
          {isActive ? 'Pause Review Intake' : 'Activate Review Intake'}
        </Button>
      </div>
    </div>
  );
};
