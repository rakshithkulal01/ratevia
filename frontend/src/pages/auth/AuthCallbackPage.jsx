import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const processAuth = async () => {
      try {
        if (!supabase) {
          throw new Error('Supabase client is not configured.');
        }

        // Check if there is an error in URL hash or search params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);

        const errorDesc = hashParams.get('error_description') || searchParams.get('error_description');
        if (errorDesc) {
          throw new Error(decodeURIComponent(errorDesc));
        }

        // Get the current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (currentSession) {
          // Perform user synchronization with backend
          try {
            const syncRes = await fetch(`${API_URL}/api/auth/sync`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${currentSession.access_token}`,
              },
            });

            if (syncRes.ok) {
              const { user: dbUser } = await syncRes.json();
              // Check if user already has a business
              const meRes = await fetch(`${API_URL}/api/auth/me`, {
                headers: {
                  Authorization: `Bearer ${currentSession.access_token}`,
                },
              });
              if (meRes.ok) {
                const meData = await meRes.json();
                if (meData?.user?.businesses?.length > 0) {
                  navigate('/dashboard', { replace: true });
                  return;
                }
              }
            }
          } catch (syncErr) {
            console.error('[AuthCallback] Backend sync non-fatal warning:', syncErr.message);
          }

          // Default redirect for new / onboarding users
          navigate('/onboarding', { replace: true });
        }
      } catch (err) {
        console.error('[AuthCallback] Error processing authentication:', err);
        if (mounted) {
          setError(err.message || 'Authentication failed. Please try logging in again.');
        }
      }
    };

    processAuth();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6 space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 border border-red-200">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl text-foreground">Authentication Error</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              variant="primary"
              onClick={() => navigate('/login', { replace: true })}
              className="w-full"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-secondary text-white shadow-xl shadow-accent/25 animate-pulse">
        <Sparkles className="h-7 w-7 animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="font-display text-2xl text-foreground">Completing sign in...</h3>
        <p className="text-sm text-muted-foreground">
          Setting up your Ratevia session and verifying your credentials.
        </p>
      </div>
    </div>
  );
};
