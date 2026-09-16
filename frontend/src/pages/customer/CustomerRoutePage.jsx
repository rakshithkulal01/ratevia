import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Coffee,
  UtensilsCrossed,
  Hotel,
  Star,
  Sparkles,
  AlertCircle,
  Clock,
  Loader2,
  CheckCircle2,
  Heart
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const CustomerRoutePage = () => {
  const { businessSlug } = useParams();

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    let mounted = true;

    const resolveBusiness = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/api/qr/public/${businessSlug}`);
        const data = await res.json();

        if (!mounted) return;

        if (!res.ok) {
          if (res.status === 403) {
            if (data.isExpired) setIsExpired(true);
            if (data.isPaused) setIsPaused(true);
            setBusiness(data.business);
            return;
          }
          throw new Error(data.message || 'Business not found');
        }

        setBusiness(data.business);
      } catch (err) {
        console.error('[CustomerRoute] Resolution error:', err);
        if (mounted) setError(err.message || 'Unable to load business details.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (businessSlug) {
      resolveBusiness();
    }

    return () => {
      mounted = false;
    };
  }, [businessSlug]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white shadow-lg shadow-accent/25 animate-pulse">
          <Sparkles className="h-6 w-6 animate-spin" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Connecting to review experience...
        </p>
      </div>
    );
  }

  // Not Found Error Screen
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-4 shadow-xl border-border">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
          <h2 className="font-display text-2xl text-foreground">Experience Not Found</h2>
          <p className="text-sm text-muted-foreground">
            We couldn't find an active review page for <code className="font-mono text-accent">"{businessSlug}"</code>.
          </p>
          <Link to="/" className="block pt-2">
            <Button variant="outline" className="w-full">
              Visit Ratevia Homepage
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Expired Screen
  if (isExpired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-4 shadow-xl border-border">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Clock className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl text-foreground">{business?.name || 'Business'}</h2>
          <p className="text-sm text-muted-foreground">
            This customer review experience is temporarily unavailable.
          </p>
        </Card>
      </div>
    );
  }

  // Paused Screen
  if (isPaused) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-4 shadow-xl border-border">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto border border-border">
            <Clock className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl text-foreground">{business?.name || 'Business'}</h2>
          <p className="text-sm text-muted-foreground">
            Feedback collection is currently paused by this business. Please check back later!
          </p>
        </Card>
      </div>
    );
  }

  const BusinessIcon =
    business?.businessType === 'HOTEL'
      ? Hotel
      : business?.businessType === 'RESTAURANT'
      ? UtensilsCrossed
      : Coffee;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Business Header Card */}
        <Card className="p-8 text-center shadow-xl border-border relative overflow-hidden bg-white">
          {/* Accent decoration */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-accent to-accent-secondary" />

          {/* Business Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-4 shadow-sm">
            <BusinessIcon className="h-8 w-8" />
          </div>

          <Badge dot pulse className="mb-2">
            Verified Ratevia QR
          </Badge>

          <h1 className="font-display text-3xl sm:text-4xl text-foreground mt-2">
            {business?.name}
          </h1>

          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
            How was your visit today? Your genuine feedback helps us improve and share your story.
          </p>

          {/* Phase 6 Placeholder Preview for 1-5 Star Rating */}
          <div className="mt-8 pt-8 border-t border-border/80 space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
              Select your rating
            </span>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="group flex flex-col items-center p-2.5 rounded-2xl border border-border hover:border-accent hover:bg-accent/5 transition-all duration-200 active:scale-95"
                >
                  <Star className="h-7 w-7 text-amber-400 group-hover:fill-amber-400 group-hover:scale-110 transition-all" />
                  <span className="text-[11px] font-mono text-muted-foreground mt-1">{star}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              (Interactive feedback and Google review assistance will activate in Phase 6)
            </p>
          </div>
        </Card>

        {/* Brand footer */}
        <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
          Powered by <span className="font-display font-semibold text-foreground">Ratevia</span>
          <Heart className="h-3 w-3 text-red-500 fill-red-500 inline ml-0.5" />
        </p>
      </div>
    </div>
  );
};
