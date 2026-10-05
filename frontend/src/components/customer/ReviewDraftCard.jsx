import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Sparkles,
  RotateCcw,
  Check,
  AlertTriangle,
  ExternalLink,
  Loader2,
} from 'lucide-react';

export const ReviewDraftCard = ({
  rating,
  generatedReview,
  onChangeReview,
  onRegenerate,
  onContinueGoogle,
  isNavigatingGoogle,
  hasCustomEdits,
  copySuccess,
  copyError,
}) => {
  if (!rating || !generatedReview) return null;

  const isPositive = rating >= 4;
  const currentLength = (generatedReview || '').length;
  const isOverLimit = currentLength > 200;
  const isNearLimit = currentLength >= 190 && !isOverLimit;
  const isInvalid = isOverLimit || currentLength === 0;

  return (
    <Card className="p-6 space-y-4 border-accent/30 bg-accent/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">
            {isPositive ? 'Suggested Review Draft' : 'Constructive Feedback Summary'}
          </h3>
        </div>

        <button
          type="button"
          onClick={onRegenerate}
          className="text-xs text-accent hover:text-accent/80 font-medium inline-flex items-center gap-1 hover:underline"
        >
          <RotateCcw className="h-3 w-3" />
          Try Another Version
        </button>
      </div>

      <div className="space-y-1">
        <textarea
          rows={4}
          maxLength={200}
          value={generatedReview}
          onChange={onChangeReview}
          className={`w-full p-3 text-xs rounded-md border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 leading-relaxed ${
            isOverLimit
              ? 'border-red-500 focus:ring-red-500'
              : 'border-border focus:ring-accent'
          }`}
          placeholder="Your review draft..."
        />
        <div className="flex items-center justify-between text-xs pt-0.5">
          {hasCustomEdits ? (
            <span className="text-[10px] text-muted-foreground italic">
              You've edited the draft. Your customized text will be preserved.
            </span>
          ) : (
            <span />
          )}
          <span
            className={`font-mono text-[11px] font-medium ml-auto ${
              isOverLimit
                ? 'text-red-600 font-bold'
                : isNearLimit
                ? 'text-amber-600'
                : 'text-muted-foreground'
            }`}
          >
            {currentLength}/200
          </span>
        </div>
        {isOverLimit && (
          <p className="text-[11px] text-red-600 font-medium">
            Review text cannot exceed 200 characters. Please shorten your review to continue.
          </p>
        )}
      </div>

      {/* Copy Success Banner */}
      {copySuccess && (
        <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md flex items-start gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <span className="font-medium">
            ✓ Review copied! Paste it into Google to share your experience.
          </span>
        </div>
      )}

      {/* Copy Failure Notice */}
      {copyError && (
        <div className="p-3 text-xs bg-amber-50 text-amber-900 border border-amber-200 rounded-md flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{copyError}</span>
        </div>
      )}

      {/* Main CTA: Continue to Google */}
      <div className="pt-2">
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onContinueGoogle}
          disabled={isNavigatingGoogle || isInvalid}
          className="w-full justify-center rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isNavigatingGoogle ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>{copySuccess ? 'Copied! Opening Google...' : 'Continuing to Google...'}</span>
            </>
          ) : (
            <>
              <span>Continue to Google</span>
              <ExternalLink className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default ReviewDraftCard;
