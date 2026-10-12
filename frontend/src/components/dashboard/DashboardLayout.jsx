import React, { createContext, useContext, useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import SEOHead from '../seo/SEOHead';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../context/DashboardContext';
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

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

const DashboardLayoutContext = createContext(false);

export const DashboardLayout = ({ children, activeTab, title }) => {
  const isNested = useContext(DashboardLayoutContext);
  if (isNested) {
    return <>{children || <Outlet />}</>;
  }

  const { session, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { dashboardData, loading: contextLoading, error: contextError, refetch } = useDashboardData();

  // Local fallback if used standalone without DashboardDataProvider
  const [localBusinessData, setLocalBusinessData] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/admin', { replace: true });
      return;
    }

    // Only fetch locally if not provided by DashboardDataProvider
    if (!dashboardData && session?.access_token && !contextLoading && !contextError) {
      let mounted = true;
      const fetchBusiness = async () => {
        try {
          setLocalLoading(true);
          const res = await fetch(`${API_URL}/api/business`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (mounted) {
              if (!data.business) {
                navigate('/onboarding');
                return;
              }
              setLocalBusinessData(data.business);
            }
          } else {
            if (mounted) setLocalError('Failed to load business profile.');
          }
        } catch (err) {
          if (mounted) setLocalError(err.message);
        } finally {
          if (mounted) setLocalLoading(false);
        }
      };
      fetchBusiness();
      return () => {
        mounted = false;
      };
    }
  }, [session, user, navigate, dashboardData, contextLoading, contextError]);

  const businessData = dashboardData?.business || localBusinessData;
  const loading = dashboardData !== null ? contextLoading : (contextLoading || localLoading);
  const error = contextError || localError;

  const currentPath = location.pathname;
  let computedTab = activeTab;
  if (!computedTab) {
    if (currentPath === '/dashboard' || currentPath === '/dashboard/' || currentPath.startsWith('/dashboard/overview')) {
      computedTab = 'overview';
    } else if (currentPath.startsWith('/dashboard/analytics')) {
      computedTab = 'analytics';
    } else if (currentPath.startsWith('/dashboard/feedback')) {
      computedTab = 'feedback';
    } else if (currentPath.startsWith('/dashboard/qr')) {
      computedTab = 'qr code';
    } else if (currentPath.startsWith('/dashboard/business')) {
      computedTab = 'settings';
    }
  }

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Feedback', path: '/dashboard/feedback', icon: MessageSquare },
    { label: 'QR Code', path: '/dashboard/qr', icon: QrCode },
    { label: 'Settings', path: '/dashboard/business', icon: Settings },
  ];

  const pageTitle = title || (computedTab ? `${computedTab.charAt(0).toUpperCase() + computedTab.slice(1)} — Dashboard` : 'Business Dashboard');
  const isSuspended = businessData ? !businessData.isActive : false;

  return (
    <DashboardLayoutContext.Provider value={true}>
      <div className="min-h-screen bg-background text-foreground pb-16">
        <SEOHead title={pageTitle} noindex={true} />
        {/* Account Status Banner */}
        {businessData && (
          <div className="border-b border-border">
            {isSuspended ? (
              <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 text-amber-800 dark:text-amber-300">
                <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>
                      <strong className="font-semibold">Account Suspended:</strong> Public QR review intake is paused. Please contact administrator to activate.
                    </span>
                  </div>
                  <div className="text-xs font-mono bg-amber-500/20 px-2.5 py-1 rounded">
                    Status: Suspended
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/5 border-b border-emerald-500/15 px-4 py-2 text-foreground">
                <div className="mx-auto max-w-6xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-muted-foreground">Account Status:</span>
                    <span className="font-semibold text-emerald-600">Active</span>
                  </div>
                  <span className="text-muted-foreground font-mono text-[11px]">
                    Lifetime Plan • Unlimited QR Reviews
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
                const isActive = (computedTab || '').toLowerCase() === item.label.toLowerCase();
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
          {loading && !businessData ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-accent animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Loading dashboard information...</p>
            </div>
          ) : error && !businessData ? (
            <Card className="p-8 text-center border-red-200 bg-red-50/50">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">Failed to load business</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={() => (refetch ? refetch() : window.location.reload())}>
                Retry
              </Button>
            </Card>
          ) : (
            children || <Outlet />
          )}
        </main>
      </div>
    </DashboardLayoutContext.Provider>
  );
};
