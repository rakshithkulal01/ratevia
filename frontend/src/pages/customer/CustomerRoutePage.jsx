import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Star,
  Sparkles,
  AlertCircle,
  Clock,
  Loader2,
  Check,
  Copy,
  ExternalLink,
  RotateCcw,
  Heart,
  ChevronRight,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import { generateReviewText } from '../../utils/reviewEngine';
import { getCategoryConfig } from '../../config/businessCategories';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SESSION_KEY = 'ratevia_session_id';

// Anonymous session UUID helper
function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
              const r = (Math.random() * 16) | 0;
              return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
            });
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch (err) {
    return '00000000-0000-4000-8000-000000000000';
  }
}

const STAR_LABELS = {
  1: '1 star — Very poor',
  2: '2 stars — Poor',
  3: '3 stars — Okay',
  4: '4 stars — Good',
  5: '5 stars — Excellent',
};

export const CustomerRoutePage = () => {
  const { businessSlug } = useParams();

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Customer Flow State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [customerMessage, setCustomerMessage] = useState('');
  const [generatedReview, setGeneratedReview] = useState('');
  const [variationIndex, setVariationIndex] = useState(0);
  const [hasCustomEdits, setHasCustomEdits] = useState(false);

  // Submission & Tracking State
  const [feedbackId, setFeedbackId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isNavigatingGoogle, setIsNavigatingGoogle] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [actionError, setActionError] = useState(null);

  const sessionId = useMemo(() => getSessionId(), []);

  // 1. Resolve business information on load
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

  // Derive centralized category configuration (with fallback to 'OTHER')
  const categoryConfig = useMemo(() => {
    const catKey = business?.category || business?.businessType || 'OTHER';
    return getCategoryConfig(catKey);
  }, [business]);

  // Contextual topics based on rating and business category
  const availableTopics = useMemo(() => {
    if (!business) return [];
    if (rating >= 4) {
      return categoryConfig.positiveTopics || [];
    } else if (rating >= 1) {
      return categoryConfig.improvementTopics || [];
    }
    return [];
  }, [rating, business, categoryConfig]);

  // Topic toggle handler
  const handleTopicToggle = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
    // When topics change, reset custom edits flag so review draft updates
    setHasCustomEdits(false);
  };

  // Synchronize review generation when rating, topics, or variation changes (if user hasn't manually overridden)
  useEffect(() => {
    if (rating > 0 && !hasCustomEdits && business) {
      const draft = generateReviewText({
        businessCategory: categoryConfig.category,
        businessName: business.name || 'this business',
        rating,
        selectedTopics,
        customerMessage,
        variationIndex,
      });
      setGeneratedReview(draft);
    }
  }, [rating, selectedTopics, customerMessage, variationIndex, business, hasCustomEdits, categoryConfig]);

  // Regenerate handler (cycles variation without overwriting rating/topics)
  const handleRegenerate = () => {
    setHasCustomEdits(false);
    setVariationIndex((prev) => prev + 1);
  };

  // Submit feedback record to backend
  const submitFeedbackIfNeeded = async () => {
    if (feedbackId) return feedbackId;

    try {
      setIsSubmitting(true);
      setActionError(null);

      const res = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessSlug,
          sessionId,
          rating,
          selectedTopics,
          customerMessage: customerMessage || null,
          generatedReview: generatedReview || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit feedback.');
      }

      setFeedbackId(data.feedbackId);
      return data.feedbackId;
    } catch (err) {
      console.error('[CustomerRoute] Submit error:', err);
      setActionError(err.message || 'Unable to save feedback.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy Review Action
  const handleCopyReview = async () => {
    if (!generatedReview) return;
    try {
      await navigator.clipboard.writeText(generatedReview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      // Submit feedback record first if not yet created
      const currentFeedbackId = await submitFeedbackIfNeeded();

      if (currentFeedbackId) {
        // Track REVIEW_COPIED
        await fetch(`${API_URL}/api/feedback/${currentFeedbackId}/copied`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        }).catch((e) => console.warn('Non-fatal copy track error:', e));
      }
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      setActionError('Could not copy automatically. You can select and copy the text manually.');
    }
  };

  // Continue to Google Action (NO REVIEW GATING: Available for ALL ratings 1-5)
  const handleContinueToGoogle = async () => {
    try {
      setIsNavigatingGoogle(true);
      setActionError(null);

      // Submit feedback record first if needed
      const currentFeedbackId = await submitFeedbackIfNeeded();

      if (currentFeedbackId) {
        // Track GOOGLE_LINK_CLICKED
        await fetch(`${API_URL}/api/feedback/${currentFeedbackId}/google-clicked`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        }).catch((e) => console.warn('Non-fatal google click track error:', e));
      }

      const targetUrl = business?.googleReviewUrl;
      if (targetUrl) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        setActionError('Google review link is not configured for this business yet.');
      }

      setIsCompleted(true);
    } catch (err) {
      console.error('Google navigation error:', err);
    } finally {
      setIsNavigatingGoogle(false);
    }
  };

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

  // Step 5: Completed / Thank-You Screen
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <Card className="p-8 text-center shadow-xl border-border relative overflow-hidden bg-white">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-accent to-accent-secondary" />

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4 border border-emerald-200">
              <Check className="h-8 w-8 stroke-[2.5]" />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl text-foreground">
              Thank You!
            </h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Your feedback helps <span className="font-semibold text-foreground">{business?.name}</span> understand what's working and how they can continuously improve.
            </p>

            <div className="pt-6 border-t border-border mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCompleted(false);
                  setRating(0);
                  setSelectedTopics([]);
                  setCustomerMessage('');
                  setFeedbackId(null);
                }}
                className="w-full text-xs"
              >
                Submit another response
              </Button>
            </div>
          </Card>

          <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
            Powered by <span className="font-display font-semibold text-foreground">Ratevia</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500 inline ml-0.5" />
          </p>
        </div>
      </div>
    );
  }

  const BusinessIcon = categoryConfig.icon;
  const isPositive = rating >= 4;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-8 sm:py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Business Header Card */}
        <Card className="p-6 sm:p-8 text-center shadow-xl border-border relative overflow-hidden bg-white">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-accent to-accent-secondary" />

          {/* Business Icon & Badges */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-3 shadow-sm">
            <BusinessIcon className="h-7 w-7" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge dot pulse>
              Verified Ratevia QR
            </Badge>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border font-medium">
              {categoryConfig.displayName}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl text-foreground mt-1">
            {business?.name}
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
            How was your experience at {business?.name}?
          </p>

          {/* STEP 1: Star Rating */}
          <div className="mt-6 pt-6 border-t border-border/80">
            <div
              className="flex items-center justify-center gap-2 sm:gap-3"
              role="group"
              aria-label="Rating selection"
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      setHasCustomEdits(false);
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={STAR_LABELS[star]}
                    className={`group flex flex-col items-center p-2.5 sm:p-3 rounded-md border transition-all duration-200 active:scale-95 touch-manipulation ${
                      rating === star
                        ? 'border-accent bg-accent/10 shadow-sm ring-2 ring-accent/30'
                        : 'border-border hover:border-accent/60 hover:bg-accent/5'
                    }`}
                  >
                    <Star
                      className={`h-7 w-7 sm:h-8 sm:w-8 transition-transform duration-150 ${
                        isFilled
                          ? 'text-amber-400 fill-amber-400 scale-105'
                          : 'text-slate-300'
                      }`}
                    />
                    <span className="text-[11px] font-mono text-muted-foreground mt-1 font-semibold">
                      {star}★
                    </span>
                  </button>
                );
              })}
            </div>

            {rating > 0 && (
              <p className="text-xs font-medium text-accent mt-2 animate-in fade-in">
                {STAR_LABELS[rating]}
              </p>
            )}
          </div>

          {/* STEP 2: Contextual Topics */}
          {rating > 0 && (
            <div className="mt-6 pt-6 border-t border-border/80 text-left space-y-3 animate-in fade-in">
              {!isPositive ? (
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs leading-relaxed">
                  <p className="font-semibold text-amber-950">
                    We're sorry your experience wasn't what you expected.
                  </p>
                  <p className="mt-0.5 text-amber-800">
                    What could be improved? Select any categories that apply:
                  </p>
                </div>
              ) : (
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                  What did you enjoy most?
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                {availableTopics.map((topic) => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => handleTopicToggle(topic)}
                      className={`text-xs px-3 py-1.5 rounded-md border transition-all duration-150 active:scale-95 ${
                        isSelected
                          ? 'bg-accent text-white border-accent shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-border hover:border-accent/50 hover:bg-white'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Optional Customer Message */}
          {rating > 0 && (
            <div className="mt-6 pt-6 border-t border-border/80 text-left space-y-2 animate-in fade-in">
              <label
                htmlFor="customer-message"
                className="block text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold"
              >
                Want to tell us more? (Optional)
              </label>
              <textarea
                id="customer-message"
                rows={2}
                value={customerMessage}
                onChange={(e) => {
                  setCustomerMessage(e.target.value);
                  setHasCustomEdits(false);
                }}
                maxLength={600}
                placeholder={
                  isPositive
                    ? 'Share specific dishes, staff members, or moments you loved...'
                    : 'Share details of what happened so the business can fix it...'
                }
                className="w-full text-xs sm:text-sm rounded-2xl border border-border p-3 focus:outline-hidden focus:ring-2 focus:ring-accent/40 focus:border-accent resize-none placeholder:text-muted-foreground/60 transition-all"
              />
            </div>
          )}

          {/* STEP 4: Review Assistance & Editing */}
          {rating > 0 && generatedReview && (
            <div className="mt-6 pt-6 border-t border-border/80 text-left space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="generated-review"
                  className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Your Review Draft
                </label>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors active:scale-95"
                  title="Try another wording variation"
                >
                  <RotateCcw className="h-3 w-3" />
                  Regenerate
                </button>
              </div>

              <div className="relative">
                <textarea
                  id="generated-review"
                  rows={4}
                  value={generatedReview}
                  onChange={(e) => {
                    setGeneratedReview(e.target.value);
                    setHasCustomEdits(true);
                  }}
                  className="w-full text-xs sm:text-sm rounded-2xl border border-accent/30 bg-accent/5 p-3.5 focus:outline-hidden focus:ring-2 focus:ring-accent/40 focus:border-accent resize-none leading-relaxed text-slate-800"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Feel free to tweak or edit this review directly before copying.
              </p>
            </div>
          )}

          {/* Error notice if action fails */}
          {actionError && (
            <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-left animate-in fade-in flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* STEP 5: Action Bar (NO REVIEW GATING: Available for ALL 1-5 stars) */}
          {rating > 0 && (
            <div className="mt-6 pt-6 border-t border-border space-y-3 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Copy Review Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleCopyReview}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm font-medium py-3 rounded-md border-border hover:bg-slate-50 transition-all active:scale-98"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600 animate-in zoom-in" />
                      <span className="text-emerald-700 font-semibold">Review Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-600" />
                      <span>Copy Review</span>
                    </>
                  )}
                </Button>

                {/* 2. Continue to Google Button (ALWAYS available for 1-5 stars) */}
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleContinueToGoogle}
                  disabled={isNavigatingGoogle}
                  className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold py-3 rounded-md shadow-md transition-all active:scale-98"
                >
                  {isNavigatingGoogle ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>Continue to Google</span>
                      <ExternalLink className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground text-center pt-1">
                Your feedback is genuine and transparent. Ratevia never filters or restricts Google reviews.
              </p>
            </div>
          )}
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

export default CustomerRoutePage;
