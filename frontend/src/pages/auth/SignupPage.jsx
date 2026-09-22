import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { GoogleIcon } from '../../components/ui/GoogleIcon';
import { AlertCircle, ArrowRight, Loader2, MailCheck } from 'lucide-react';

export const SignupPage = () => {
  const { signInWithGoogle, signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const validate = () => {
    if (!name.trim()) {
      setError('Please enter your full name or business name.');
      return false;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return false;
    }
    return true;
  };

  const handleGoogleSignup = async () => {
    try {
      setError(null);
      setGoogleLoading(true);
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign-up error:', err);
      setError(err.message || 'Unable to sign up with Google. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    try {
      setLoading(true);
      const data = await signUpWithEmail(email.trim(), password, name.trim());

      // If user session is immediately created (email auto-confirm enabled)
      if (data?.session) {
        navigate('/onboarding', { replace: true });
      } else if (data?.user && !data?.session) {
        // Email confirmation is required by Supabase project
        setEmailSent(true);
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (err) {
      console.error('Signup error:', err);
      if (err.message?.toLowerCase().includes('already registered')) {
        setError('An account with this email already exists. Please log in instead.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-lg border-border/80 text-center">
          <CardContent className="space-y-6 pt-8 pb-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <MailCheck className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl text-foreground">
                Verify your email
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We've sent a confirmation link to{' '}
                <span className="font-semibold text-foreground">{email}</span>.
                Please click the link in your inbox to activate your account.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <Badge variant="outline">
            ₹1,000 One-Time Access
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl text-foreground tracking-tight">
            Create account<span className="text-accent">.</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign up to access your business dashboard once provisioned by Ratevia.
          </p>
        </div>

        {/* Card */}
        <Card className="shadow-lg border-border/80">
          <CardContent className="space-y-6 pt-6">
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 h-12 rounded-md border border-border bg-white text-foreground hover:bg-muted/60 hover:border-accent/30 font-medium text-sm transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
              ) : (
                <GoogleIcon className="h-5 w-5" />
              )}
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-border" />
              <span className="bg-card px-3 font-mono text-xs uppercase tracking-wider text-muted-foreground/80 absolute">
                or with email
              </span>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium">
                  Full Name / Business Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Alex Rivera or Artisan Café"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading || googleLoading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="name@business.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || googleLoading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium">
                  Password (min. 6 characters)
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || googleLoading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading || googleLoading}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full group font-semibold"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-accent hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
