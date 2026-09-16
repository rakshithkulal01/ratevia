import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-accent to-accent-secondary text-accent-foreground shadow-sm hover:shadow-accent hover:-translate-y-0.5 hover:brightness-105',
        secondary:
          'bg-white hover:bg-muted text-foreground border border-border hover:border-accent/40 shadow-sm hover:-translate-y-0.5',
        outline:
          'bg-transparent border border-border hover:bg-muted/40 text-foreground hover:border-foreground/30',
        ghost:
          'bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground',
      },
      size: {
        sm: 'h-9 px-3 text-xs rounded-lg',
        md: 'h-11 px-5 text-sm',
        lg: 'h-13 px-7 text-base rounded-xl',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export const Button = React.forwardRef(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
