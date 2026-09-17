import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  QrCode,
  Settings,
  AlertTriangle,
  Clock,
  ExternalLink,
  Loader2,
  Building2,
  ShieldAlert,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const DashboardLayout = ({ children, activeTab }) => {
  const { session, user } = useAuth();
  const navigate = useNavigate();

  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchBusiness = async () => {
      if (!session?.access_token) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/business`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            if (!data.business) {
              navigate('/onboarding');
              return;
            }
            setBusinessData(data.business);
          }
        } else {
          if (mounted) setError('Failed to load business profile.');
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBusiness();
    return () => {
      mounted = false;
    };
  }, [session, navigate]);

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Feedback', path: '/dashboard/feedback', icon: MessageSquare },
    { label: 'QR Code', path: '/dashboard/qr', icon: QrCode },
    { label: 'Settings', path: '/dashboard/business', icon: Settings },
  ];

  const sub = businessData?.subscription;
  const now = new Date();
  let daysRemaining = 0;
  let isExpired = false;

  if (sub?.trialEndsAt) {
    const msLeft = new Date(sub.trialEndsAt).getTime() - now.getTime();
    daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    if (msLeft <= 0 || sub.status === 'EXPIRED') {
      isExpired = true;
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* Trial Status Banner */}
      {businessData && (
        <div className="border-b border-border">
          {isExpired ? (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 text-amber-800 dark:text-amber-300">
              <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>
                    <strong className="font-semibold">Demo Trial Expired:</strong> Public QR review intake is currently suspended. All historical data is preserved.
                  </span>
                </div>
                <div className="text-xs font-mono bg-amber-500/20 px-2.5 py-1 rounded">
                  Please contact administrator to extend trial access.
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-accent/5 border-b border-accent/15 px-4 py-2 text-foreground">
              <div className="mx-auto max-w-6xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span className="font-medium text-muted-foreground">Demo Trial Active:</span>
                  <span className="font-semibold text-accent">{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining</span>
                </div>
                <span className="text-muted-foreground hidden sm:inline">
                  Ends on {sub?.trialEndsAt ? new Date(sub.trialEndsAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header Bar */}
      <header className="border-b border-border bg-white shadow-xs">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
                <Building2 className="h-3.5 w-3.5" />
                <span>BUSINESS DASHBOARD</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl sm:text-3xl text-foreground font-normal">
                  {businessData ? businessData.name : 'Business Dashboard'}
                </h1>
                {businessData && (
                  <Badge variant="outline" className="text-xs uppercase font-mono">
                    {businessData.businessType}
                  </Badge>
                )}
              </div>
            </div>

            {businessData && (
              <div className="flex items-center gap-2">
                <a
                  href={`/r/${businessData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/10 hover:bg-accent/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <span>Customer View</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Sub Navigation Tabs */}
          <nav className="flex items-center gap-1 mt-6 -mb-6 overflow-x-auto no-scrollbar border-t border-border pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.label.toLowerCase();
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-accent animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Loading dashboard information...</p>
          </div>
        ) : error ? (
          <Card className="p-8 text-center border-red-200 bg-red-50/50">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Failed to load business</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Card>
        ) : (
          children
        )}
      </main>
    </div>
  );
};
