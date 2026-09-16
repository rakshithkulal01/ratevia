import React from 'react';
import { cn } from '../../lib/utils';

export const Badge = ({
  children,
  className,
  dot = true,
  pulse = false,
  variant = 'accent',
  ...props
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5',
        variant === 'muted' && 'border-border bg-muted/60 text-muted-foreground',
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'h-2 w-2 rounded-full bg-accent',
            pulse && 'animate-pulse'
          )}
        />
      )}
      <span className="font-mono text-xs uppercase tracking-[0.15em] text-accent font-medium">
        {children}
      </span>
    </div>
  );
};
