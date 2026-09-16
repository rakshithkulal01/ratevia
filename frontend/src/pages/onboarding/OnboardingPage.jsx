import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Coffee,
  UtensilsCrossed,
  Hotel,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  HelpCircle,
  ShieldCheck,
  Clock
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BUSINESS_TYPES = [
  {
    id: 'CAFE',
    label: 'Café',
    description: 'Coffee shops, bakeries, roasteries, and tea houses.',
    icon: Coffee,
  },
  {
    id: 'RESTAURANT',
    label: 'Restaurant',
    description: 'Bistros, fine dining, casual eateries, and diners.',
    icon: UtensilsCrossed,
  },
  {
    id: 'HOTEL',
    label: 'Hotel',
    description: 'Boutique hotels, resorts, B&Bs, and hospitality stays.',
    icon: Hotel,
  },
];

export const OnboardingPage = () => {
  const { session, user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState('CAFE');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [successCelebration, setSuccessCelebration] = useState(false);
  const [error, setError] = useState(null);

  // Check if user already has a business; if so, redirect directly to dashboard
  useEffect(() => {
    let mounted = true;

    const checkExistingBusiness = async () => {
      if (!session?.access_token) return;

      try {
        const res = await fetch(`${API_URL}/api/business`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.business && mounted) {
            navigate('/dashboard', { replace: true });
            return;
          }
        }
      } catch (err) {
        console.error('[Onboarding] Error checking existing business:', err.message);
      } finally {
        if (mounted) setCheckingExisting(false);
      }
    };

    checkExistingBusiness();

    return () => {
      mounted = false;
    };
  }, [session, navigate]);

  // Step 1 Validation
  const handleStep1Next = (e) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError('Business name must be at least 2 characters long.');
      return;
    }
    if (trimmedName.length > 100) {
      setError('Business name cannot exceed 100 characters.');
      return;
    }
    if (!businessType) {
      setError('Please select your business type.');
      return;
    }

    setStep(2);
  };

  // Step 2 Validation
  const handleStep2Next = (e) => {
    e.preventDefault();
    setError(null);

    const trimmedUrl = googleReviewUrl.trim();
    if (!trimmedUrl) {
      setError('Please provide your Google review link.');
      return;
    }

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      setError('The Google review URL must start with http:// or https://');
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      setError('Please enter a valid URL.');
      return;
    }

    setStep(3);
  };

  // Final Activation Submission
  const handleActivate = async () => {
    if (submitting) return; // Prevent double-clicks

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/business`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          businessType,
          googleReviewUrl: googleReviewUrl.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError('This account already has a business profile. Redirecting to dashboard...');
          setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
          return;
        }
        throw new Error(data.message || 'Failed to create business profile.');
      }

      // Success celebration state
      setSuccessCelebration(true);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1800);
    } catch (err) {
      console.error('[Onboarding] Activation error:', err);
      setError(err.message || 'Something went wrong while creating your business. Please try again.');
      setSubmitting(false);
    }
  };

  if (checkingExisting) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">Checking your business account...</p>
      </div>
    );
  }

  // Success Celebration Screen
  if (successCelebration) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center border-accent/40 shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-secondary text-white shadow-xl shadow-accent/30">
            <Sparkles className="h-8 w-8 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-3xl text-foreground">
              {name} is live!
            </h2>
            <p className="text-sm text-muted-foreground">
              Your 20-day free demo trial is active and your QR routing is ready. Opening your dashboard...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-accent">
            <Clock className="h-4 w-4" /> 20-Day Trial Activated
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
      {/* Header & Step Tracker */}
      <div className="text-center space-y-4">
        <Badge dot pulse>
          Step {step} of 3
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl text-foreground tracking-tight">
          Set up your business profile<span className="text-accent">.</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Start collecting genuine feedback and turning great customer experiences into 5-star Google reviews.
        </p>

        {/* Visual Progress Steps */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-10 bg-accent'
                    : s < step
                    ? 'w-6 bg-accent/50'
                    : 'w-6 bg-border'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700 shadow-sm animate-in fade-in">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
        </div>
      )}

      {/* STEP 1: BUSINESS IDENTITY */}
      {step === 1 && (
        <Card className="shadow-lg border-border/80 p-6 sm:p-8 space-y-8">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl font-display">1. Business Identity</CardTitle>
            <CardDescription>
              What is your business called and what category does it belong to?
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleStep1Next} className="space-y-6">
            {/* Business Name */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium">
                Business Name <span className="text-accent">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Blue Bottle Coffee or The Grand Bistro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                This name will appear on your customer feedback pages and review prompts.
              </p>
            </div>

            {/* Business Type Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium">
                Business Type <span className="text-accent">*</span>
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                {BUSINESS_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = businessType === type.id;
                  return (
                    <button
                      type="button"
                      key={type.id}
                      onClick={() => setBusinessType(type.id)}
                      className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'border-accent bg-accent/[0.04] ring-2 ring-accent ring-offset-2 shadow-sm'
                          : 'border-border bg-white hover:border-accent/40 hover:bg-muted/40'
                      }`}
                    >
                      <div
                        className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-accent text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-base">
                          {type.label}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {type.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" size="lg" className="group">
                Continue to Review Link
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* STEP 2: GOOGLE REVIEW URL */}
      {step === 2 && (
        <Card className="shadow-lg border-border/80 p-6 sm:p-8 space-y-8">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl font-display">2. Google Review Connection</CardTitle>
            <CardDescription>
              Connect the destination where happy customers will be guided to leave their review.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleStep2Next} className="space-y-6">
            <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 text-sm text-foreground space-y-2">
              <div className="flex items-center gap-2 font-semibold text-accent">
                <HelpCircle className="h-4 w-4" />
                Why does Ratevia need this?
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This is the direct link customers open when they tap "Continue to Google" after rating their experience. Ratevia doesn't require Google API credentials or passwords.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium">
                Google Review Link <span className="text-accent">*</span>
              </label>
              <Input
                type="url"
                placeholder="https://g.page/r/your-business/review or https://maps.app.goo.gl/..."
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                autoFocus
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
                <span>
                  Find your link in your <strong>Google Business Profile</strong> by clicking "Ask for reviews".
                </span>
                {googleReviewUrl.trim().startsWith('http') && (
                  <a
                    href={googleReviewUrl.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline font-medium flex-shrink-0"
                  >
                    Test link in new tab <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  setError(null);
                  setStep(1);
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="submit" variant="primary" size="lg" className="group">
                Review & Confirmation
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* STEP 3: CONFIRMATION & TRIAL ACTIVATION */}
      {step === 3 && (
        <Card className="shadow-lg border-border/80 p-6 sm:p-8 space-y-8">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl font-display">3. Confirm & Activate</CardTitle>
            <CardDescription>
              Review your setup summary before starting your 20-day free demo trial.
            </CardDescription>
          </CardHeader>

          <div className="space-y-4">
            {/* Summary Details */}
            <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-xs font-mono uppercase text-muted-foreground">Business Name</span>
                <span className="font-semibold text-foreground text-sm">{name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-xs font-mono uppercase text-muted-foreground">Category</span>
                <span className="font-semibold text-foreground text-sm">
                  {BUSINESS_TYPES.find((t) => t.id === businessType)?.label || businessType}
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-xs font-mono uppercase text-muted-foreground">Google Review Destination</span>
                <span className="text-xs font-mono text-accent truncate">{googleReviewUrl}</span>
              </div>
            </div>

            {/* Trial Banner */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-900 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <strong className="block font-semibold text-sm">20-Day Free Demo Trial Included</strong>
                Your trial begins immediately with full access to QR code generation, review assistance, and real-time analytics. No credit card required.
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={submitting}
              onClick={() => {
                setError(null);
                setStep(2);
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={submitting}
              onClick={handleActivate}
              className="group font-semibold shadow-accent"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating Business...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Activate My Business
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
