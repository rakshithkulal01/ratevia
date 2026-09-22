import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  ShieldCheck,
  Loader2,
  PhoneCall,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const OnboardingPage = () => {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const [checkingExisting, setCheckingExisting] = useState(true);
  const [hasBusiness, setHasBusiness] = useState(false);

  const checkBusinessStatus = async () => {
    if (!session?.access_token) return;
    setCheckingExisting(true);

    try {
      const res = await fetch(`${API_URL}/api/business`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.business) {
          setHasBusiness(true);
          navigate('/dashboard', { replace: true });
          return;
        }
      }
    } catch (err) {
      console.error('[Onboarding] Error checking business status:', err.message);
    } finally {
      setCheckingExisting(false);
    }
  };

  useEffect(() => {
    checkBusinessStatus();
  }, [session, navigate]);

  if (checkingExisting) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">Checking your business account...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] py-16 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto flex flex-col justify-center">
      <Card className="shadow-xl border-border/80 text-center p-6 sm:p-8 space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <ShieldCheck className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <Badge variant="outline" className="text-xs font-mono uppercase">
            Admin Provisioned
          </Badge>
          <h1 className="font-display text-2xl sm:text-3xl text-foreground font-semibold">
            Assisted Business Provisioning
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ratevia is a ₹1,000 one-time purchase product. Business profiles, unique QR routing, and Google review configurations are securely provisioned by the Ratevia administration.
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-left space-y-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
            <span>Already contacted our team & paid ₹1,000?</span>
          </div>
          <p className="pl-6">
            Your business is likely being provisioned right now. Click "Refresh Status" below once the team confirms your setup.
          </p>
          <div className="flex items-center gap-2 font-medium text-foreground">
            <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
            <span>Haven't purchased yet?</span>
          </div>
          <p className="pl-6">
            Contact us to request Ratevia access for your café, restaurant, or hotel.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={checkBusinessStatus}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Status
          </Button>
          <Link to="/contact" className="flex-1">
            <Button variant="primary" size="lg" className="w-full">
              <PhoneCall className="mr-2 h-4 w-4" />
              Contact Ratevia
            </Button>
          </Link>
        </div>

        <div className="pt-2 border-t border-border/50">
          <button
            onClick={() => logout()}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Log out of this account
          </button>
        </div>
      </Card>
    </div>
  );
};
