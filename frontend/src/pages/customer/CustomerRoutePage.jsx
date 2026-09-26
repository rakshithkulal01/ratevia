import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AlertCircle, Clock, Loader2, MessageSquare } from 'lucide-react';

import { qrService } from '../../services/qrService';
import { feedbackService } from '../../services/feedbackService';
import { analyticsService } from '../../services/analyticsService';
import { getSessionId } from '../../utils/session';
import { generateReviewText } from '../../utils/reviewEngine';
import { getCategoryConfig } from '../../config/businessCategories';

import { CustomerHeader } from '../../components/customer/CustomerHeader';
import { RatingSelector } from '../../components/customer/RatingSelector';
import { TopicSelector } from '../../components/customer/TopicSelector';
import { ReviewDraftCard } from '../../components/customer/ReviewDraftCard';
import { CustomerThankYou } from '../../components/customer/CustomerThankYou';

export const CustomerRoutePage = () => {
  const { businessSlug } = useParams();

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Flow State
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
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyError, setCopyError] = useState(null);
  const [clipboardFailedOnce, setClipboardFailedOnce] = useState(false);
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

        const data = await qrService.getPublicBusiness(businessSlug);
        if (!mounted) return;

        setBusiness(data.business);

        // Funnel Step 1: QR_SCANNED
        analyticsService
          .logEvent({
            businessId: data.business.id,
            eventType: 'QR_SCANNED',
            sessionId,
            metadata: { slug: businessSlug },
          })
          .catch(() => {});
      } catch (err) {
        if (!mounted) return;
        if (err.status === 403) {
          if (err.data?.isExpired) setIsExpired(true);
          if (err.data?.isPaused) setIsPaused(true);
        } else if (err.status === 404) {
          setError('Business not found. Please scan an active Ratevia QR standee.');
        } else {
          setError(err.message || 'Unable to connect to Ratevia.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    resolveBusiness();
    return () => {
      mounted = false;
    };
  }, [businessSlug, sessionId]);

  // Dynamic category config
  const businessCategory = business?.category || business?.businessType || 'OTHER';
  const categoryConfig = useMemo(() => getCategoryConfig(businessCategory), [businessCategory]);

  // 2. Synthesize Review when rating, topics, message, or variation changes
  const reviewSynthesisTimer = useRef(null);

  useEffect(() => {
    if (rating === 0) return;
    if (hasCustomEdits) return; // Preserve manual user edits

    if (reviewSynthesisTimer.current) clearTimeout(reviewSynthesisTimer.current);

    reviewSynthesisTimer.current = setTimeout(() => {
      const generated = generateReviewText({
        businessName: business?.name || 'this venue',
        businessCategory,
        rating,
        selectedTopics,
        customerMessage,
        variationIndex,
      });

      setGeneratedReview(generated);

      if (feedbackId) {
        analyticsService
          .logEvent({
            businessId: business?.id,
            eventType: 'REVIEW_GENERATED',
            sessionId,
            metadata: { rating, topicCount: selectedTopics.length, variationIndex },
          })
          .catch(() => {});
      }
    }, 150);

    return () => {
      if (reviewSynthesisTimer.current) clearTimeout(reviewSynthesisTimer.current);
    };
  }, [
    rating,
    selectedTopics,
    customerMessage,
    variationIndex,
    business?.name,
    businessCategory,
    feedbackId,
    sessionId,
    hasCustomEdits,
  ]);

  // Rating Selection Handler
  const handleSelectRating = async (selectedStar) => {
    setRating(selectedStar);
    setSelectedTopics([]);
    setHasCustomEdits(false);
    setCopySuccess(false);
    setCopyError(null);
    setClipboardFailedOnce(false);
    setActionError(null);

    if (business?.id) {
      analyticsService
        .logEvent({
          businessId: business.id,
          eventType: 'RATING_SELECTED',
          sessionId,
          metadata: { rating: selectedStar },
        })
        .catch(() => {});

      if (!feedbackId) {
        analyticsService
          .logEvent({
            businessId: business.id,
            eventType: 'FEEDBACK_STARTED',
            sessionId,
          })
          .catch(() => {});
      }
    }
  };

  // Topic Toggle Handler
  const handleToggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
    setCopySuccess(false);
    setCopyError(null);
  };

  // Review Edit Handler
  const handleReviewChange = (e) => {
    setGeneratedReview(e.target.value);
    setHasCustomEdits(true);
    setCopySuccess(false);
    setCopyError(null);
  };

  // Variation Cycle Handler
  const handleCycleVariation = () => {
    setVariationIndex((prev) => (prev + 1) % 4);
    setHasCustomEdits(false);
    setCopySuccess(false);
    setCopyError(null);
  };

  // Submit Feedback to Backend
  const submitFeedbackPayload = async () => {
    if (!business || rating === 0) return null;
    setIsSubmitting(true);
    setActionError(null);

    try {
      const data = await feedbackService.submitFeedback({
        businessSlug,
        sessionId,
        rating,
        selectedTopics,
        customerMessage: customerMessage.trim() || null,
        generatedReview: generatedReview.trim() || null,
      });

      setFeedbackId(data.feedbackId);
      return data.feedbackId;
    } catch (err) {
      setActionError(err.message || 'Could not save feedback.');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Automatic Review Copy and Continue to Google Review Redirect
  const handleContinueGoogle = async () => {
    if (!business?.googleReviewUrl) {
      setActionError('Google Review URL is not configured for this business.');
      return;
    }

    // Double-click protection
    if (isNavigatingGoogle) return;

    // Empty review protection
    const reviewTextToCopy = (generatedReview || '').trim();
    if (!reviewTextToCopy) {
      setActionError('Review text is empty. Please enter or generate a review before continuing.');
      return;
    }

    setIsNavigatingGoogle(true);
    setActionError(null);

    // If user already experienced a clipboard failure, allow continuing to Google on subsequent click
    if (clipboardFailedOnce) {
      try {
        const fId = feedbackId || (await submitFeedbackPayload());
        if (fId) {
          feedbackService.logGoogleClicked(fId, { sessionId }).catch(() => {});
        }
        window.open(business.googleReviewUrl, '_blank', 'noopener,noreferrer');
        setIsCompleted(true);
      } catch {
        window.open(business.googleReviewUrl, '_blank', 'noopener,noreferrer');
        setIsCompleted(true);
      } finally {
        setIsNavigatingGoogle(false);
      }
      return;
    }

    // Attempt automatic clipboard copy using the latest currently displayed review text
    let copySuccessful = false;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(reviewTextToCopy);
        copySuccessful = true;
      } catch (clipErr) {
        console.warn('[Clipboard] navigator.clipboard.writeText failed:', clipErr);
        copySuccessful = false;
      }
    }

    // Fallback attempt for browsers/webviews where navigator.clipboard might be restricted
    if (!copySuccessful && typeof document !== 'undefined') {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = reviewTextToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copySuccessful = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (fallbackErr) {
        console.warn('[Clipboard] document.execCommand fallback failed:', fallbackErr);
        copySuccessful = false;
      }
    }

    if (copySuccessful) {
      // 1. Show clear confirmation banner
      setCopySuccess(true);
      setCopyError(null);

      try {
        // 2. Persist feedback (if not already done)
        const fId = feedbackId || (await submitFeedbackPayload());

        // 3. Record REVIEW_COPIED
        if (fId) {
          feedbackService.logReviewCopied(fId, { sessionId }).catch(() => {});
        }

        // 4. Record GOOGLE_LINK_CLICKED
        if (fId) {
          feedbackService.logGoogleClicked(fId, { sessionId }).catch(() => {});
        }

        // 5. Allow customer to see the confirmation banner for ~800ms before navigating
        await new Promise((resolve) => setTimeout(resolve, 800));

        // 6. Open Google review page
        window.open(business.googleReviewUrl, '_blank', 'noopener,noreferrer');
        setIsCompleted(true);
      } catch {
        window.open(business.googleReviewUrl, '_blank', 'noopener,noreferrer');
        setIsCompleted(true);
      } finally {
        setIsNavigatingGoogle(false);
      }
    } else {
      // Clipboard copy failed:
      // - Do NOT record REVIEW_COPIED
      // - Do NOT show "Review copied!"
      // - Show clear failure message
      // - Keep review visible and editable
      // - Allow customer to copy manually and click Continue again
      setCopySuccess(false);
      setCopyError(
        "We couldn't copy the review automatically. Please copy the text manually before continuing to Google."
      );
      setClipboardFailedOnce(true);
      setIsNavigatingGoogle(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 px-4">
        <Loader2 className="h-8 w-8 text-accent animate-spin" />
        <p className="text-xs text-muted-foreground font-mono animate-pulse">
          Connecting to venue standee...
        </p>
      </div>
    );
  }

  // Error States
  if (error || isExpired || isPaused) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-4 border-amber-200 bg-amber-50/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-amber-100 text-amber-600 mx-auto">
            {isExpired ? <Clock className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
          </div>
          <h2 className="font-display text-2xl text-foreground font-semibold">
            {isExpired
              ? 'Link Inactive'
              : isPaused
              ? 'Service Temporarily Paused'
              : 'Location Not Found'}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isExpired
              ? 'This Ratevia venue code is not currently active.'
              : isPaused
              ? 'This business has temporarily paused review collection.'
              : error}
          </p>
          <div className="pt-2">
            <Link to="/">
              <Button variant="outline" size="sm" className="rounded-md">
                Return to Ratevia Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Completed State
  if (isCompleted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <CustomerThankYou
          business={business}
          rating={rating}
          googleReviewUrl={business?.googleReviewUrl}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <CustomerHeader business={business} categoryConfig={categoryConfig} />

        {/* Action Error */}
        {actionError && (
          <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-md">
            {actionError}
          </div>
        )}

        {/* 1. Rating Selector */}
        <RatingSelector
          rating={rating}
          hoverRating={hoverRating}
          onSelectRating={handleSelectRating}
          onHoverRating={setHoverRating}
        />

        {/* 2. Category Topics (visible after rating) */}
        {rating > 0 && (
          <TopicSelector
            rating={rating}
            categoryConfig={categoryConfig}
            selectedTopics={selectedTopics}
            onToggleTopic={handleToggleTopic}
          />
        )}

        {/* 3. Optional Custom Message Note */}
        {rating > 0 && (
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                Additional Comments (Optional)
              </h3>
            </div>
            <textarea
              rows={2}
              value={customerMessage}
              onChange={(e) => setCustomerMessage(e.target.value)}
              placeholder="Any specific mention, staff shoutout, or note..."
              className="w-full p-2.5 text-xs rounded-md border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              maxLength={500}
            />
          </Card>
        )}

        {/* 4. Review Draft / Summary Card */}
        {rating > 0 && generatedReview && (
          <ReviewDraftCard
            rating={rating}
            generatedReview={generatedReview}
            onChangeReview={handleReviewChange}
            onRegenerate={handleCycleVariation}
            onContinueGoogle={handleContinueGoogle}
            isNavigatingGoogle={isNavigatingGoogle}
            hasCustomEdits={hasCustomEdits}
            copySuccess={copySuccess}
            copyError={copyError}
          />
        )}


      </div>
    </div>
  );
};

export default CustomerRoutePage;
