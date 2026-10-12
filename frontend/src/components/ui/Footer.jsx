import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-white text-muted-foreground transition-colors">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand & Parent Company Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 font-display text-xl tracking-tight text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-secondary text-white shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="font-semibold">
                Ratevia<span className="text-accent">.</span>
              </span>
            </div>

            <p className="max-w-sm text-xs text-muted-foreground leading-relaxed">
              A product of <span className="font-medium text-foreground">BringUonline</span>. Turn customer experiences into authentic reviews and actionable insights.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-[11px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="tracking-wide">Be seen. Be found. Be online.</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs md:pt-1">
            <Link to="/review-qr-code" className="hover:text-foreground transition-colors">Review QR Codes</Link>
            <Link to="/qr-customize" className="hover:text-foreground transition-colors">QR Studio</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>

        {/* Bottom subtle copyright and tagline bar */}
        <div className="mt-8 border-t border-border/60 pt-6 flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} Ratevia by <span className="font-medium text-foreground">BringUonline</span>. All rights reserved.
          </p>
          <p className="text-[11px] text-muted-foreground/80">
            <span className="font-medium text-foreground/80">BringUonline</span> — <span className="italic">Be seen. Be found. Be online.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
