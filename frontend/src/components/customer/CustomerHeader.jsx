import React from 'react';
import { Badge } from '../ui/Badge';
import { Check } from 'lucide-react';

export const CustomerHeader = ({ business, categoryConfig }) => {
  if (!business) return null;

  const CategoryIcon = categoryConfig?.icon;

  return (
    <div className="text-center space-y-3">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-accent/10 text-accent text-xs font-medium border border-accent/20">
        {CategoryIcon && <CategoryIcon className="h-3.5 w-3.5 shrink-0" />}
        <span>{categoryConfig?.displayName || 'Local Business'}</span>
      </div>

      <h1 className="font-display text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
        {business.name}
      </h1>

      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 font-medium">
        <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
        Verified Google Maps Location
      </p>
    </div>
  );
};

export default CustomerHeader;
