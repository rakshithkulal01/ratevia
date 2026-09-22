import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-white text-muted-foreground transition-colors">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2.5 font-display text-xl tracking-tight text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-secondary text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span>
              Ratevia<span className="text-accent">.</span>
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Ratevia. Turn customer experiences into better reviews.
          </p>

          <div className="flex items-center gap-6 text-xs">
            <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link to="/faq" className="hover:text-foreground">FAQ</Link>
            <Link to="/contact" className="hover:text-foreground">Contact</Link>
            <Link to="/design-system" className="hover:text-foreground">Design System</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
