import React from 'react';
import { cn } from '../../lib/utils';

export const Card = React.forwardRef(({ className, featured = false, children, ...props }, ref) => {
  if (featured) {
    return (
      <div className={cn('rounded-2xl bg-gradient-to-br from-accent via-accent-secondary to-accent p-[2px] shadow-lg', className)}>
        <div className="h-full w-full rounded-[calc(1rem-2px)] bg-card p-6 sm:p-8">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md p-6 sm:p-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader = ({ className, children, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }) => (
  <h3 className={cn('text-xl font-semibold leading-none tracking-tight text-foreground', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }) => (
  <div className={cn('pt-0', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }) => (
  <div className={cn('flex items-center pt-4 border-t border-border/60 mt-4', className)} {...props}>
    {children}
  </div>
);
