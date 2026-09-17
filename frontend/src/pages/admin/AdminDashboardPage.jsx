import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Shield,
  Building2,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
  Loader2,
  ExternalLink,
  MessageSquare,
  QrCode,
  Search,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AdminDashboardPage = () => {
  const { session, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const isAdmin = user?.role === 'ADMIN';

  const loadAdminData = async () => {
    if (!session?.access_token) return;
    try {
      setLoading(true);
      setError(null);

      const [statsRes, businessesRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        fetch(`${API_URL}/api/admin/businesses`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
      ]);

      if (statsRes.status === 403 || businessesRes.status === 403) {
        setError('FORBIDDEN');
        return;
      }

      if (statsRes.ok && businessesRes.ok) {
        const statsJson = await statsRes.json();
        const businessesJson = await businessesRes.json();
        setStats(statsJson.stats);
        setBusinesses(businessesJson.businesses);
      } else {
        setError('Failed to fetch admin platform data.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [session]);

  const handleTrialAction = async (businessId, action, days) => {
    try {
      setUpdatingId(businessId);
      setActionSuccess(null);

      const res = await fetch(`${API_URL}/api/admin/businesses/${businessId}/trial`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action, days }),
      });

      const json = await res.json();
      if (res.ok) {
        setActionSuccess(`Trial successfully updated (${action} ${days ? `+${days}d` : ''})`);
        await loadAdminData();
        setTimeout(() => setActionSuccess(null), 3000);
      } else {
        alert(json.message || 'Action failed.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isAdmin && error === 'FORBIDDEN') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 border-red-200 bg-red-50/40 space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mx-auto">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="font-display text-xl text-foreground font-semibold">Admin Access Restricted</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your authenticated account (<code className="font-mono text-foreground">{user?.email}</code>) has the role{' '}
            <Badge variant="outline" className="text-[10px]">{user?.role || 'BUSINESS_OWNER'}</Badge>.
            Only users with the <strong className="text-foreground">ADMIN</strong> role may access the platform control center.
          </p>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
              Return to Business Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const filteredBusinesses = businesses.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.slug.toLowerCase().includes(q) ||
      b.owner?.email?.toLowerCase().includes(q) ||
      b.owner?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      {/* Header */}
      <div className="border-b border-border bg-white shadow-xs">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-accent mb-1 font-semibold">
                <Shield className="h-3.5 w-3.5" />
                <span>PLATFORM ADMINISTRATION</span>
              </div>
              <h1 className="font-display text-3xl text-foreground font-normal">
                Admin Control Center<span className="text-accent">.</span>
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Manage business accounts, inspect onboarding activity, and configure trial duration for customer demos.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={loadAdminData} disabled={loading}>
              <RotateCcw className={`mr-2 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {actionSuccess && (
          <div className="p-3 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Platform KPI Metrics */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="p-4">
              <span className="text-[11px] font-mono uppercase text-muted-foreground block">
                Total Businesses
              </span>
              <span className="text-2xl font-bold font-display text-foreground mt-1 block">
                {stats.totalBusinesses}
              </span>
            </Card>
            <Card className="p-4">
              <span className="text-[11px] font-mono uppercase text-muted-foreground block">
                Active Trials
              </span>
              <span className="text-2xl font-bold font-display text-accent mt-1 block">
                {stats.trialCount}
              </span>
            </Card>
            <Card className="p-4">
              <span className="text-[11px] font-mono uppercase text-muted-foreground block">
                Active Paid/Sub
              </span>
              <span className="text-2xl font-bold font-display text-emerald-600 mt-1 block">
                {stats.activeCount}
              </span>
            </Card>
            <Card className="p-4">
              <span className="text-[11px] font-mono uppercase text-muted-foreground block">
                Expired Demos
              </span>
              <span className="text-2xl font-bold font-display text-amber-600 mt-1 block">
                {stats.expiredCount}
              </span>
            </Card>
            <Card className="p-4 col-span-2 lg:col-span-1">
              <span className="text-[11px] font-mono uppercase text-muted-foreground block">
                Feedbacks Logged
              </span>
              <span className="text-2xl font-bold font-display text-foreground mt-1 block">
                {stats.totalFeedbacks}
              </span>
            </Card>
          </div>
        )}

        {/* Directory Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Registered Businesses</h2>
              <p className="text-xs text-muted-foreground">Real-time trial status and duration management</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search business, slug, or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto mb-3" />
              <p className="text-xs text-muted-foreground">Loading business directory...</p>
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <Card className="p-12 text-center bg-muted/20">
              <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">No businesses found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery ? 'Try adjusting your search filter' : 'No businesses have registered yet.'}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBusinesses.map((b) => {
                const sub = b.subscription;
                const isExpired = sub?.isExpired;
                const isUpdating = updatingId === b.id;

                return (
                  <Card key={b.id} className="p-5 hover:border-accent/40 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground text-base">{b.name}</h3>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {b.businessType}
                          </Badge>
                          <Badge
                            variant={isExpired ? 'secondary' : 'default'}
                            className={`text-[10px] font-mono uppercase ${
                              isExpired ? 'bg-amber-100 text-amber-800' : 'bg-accent text-white'
                            }`}
                          >
                            {isExpired ? 'EXPIRED' : sub?.status || 'TRIAL'}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            Slug: <code className="font-mono text-foreground font-medium">{b.slug}</code>
                          </span>
                          <span>•</span>
                          <span>
                            Owner: <span className="text-foreground">{b.owner?.name || 'Owner'}</span> ({b.owner?.email})
                          </span>
                          <span>•</span>
                          <span>Feedbacks: <strong className="text-foreground">{b.feedbackCount}</strong></span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {isExpired
                              ? 'Trial ended: '
                              : 'Days remaining: '}
                          </span>
                          <span className={isExpired ? 'text-amber-600 font-semibold' : 'text-accent font-semibold'}>
                            {isExpired ? 'Access Suspended' : `${sub?.daysRemaining || 0} days`}
                          </span>
                          <span className="text-muted-foreground">
                            (Ends: {sub?.trialEndsAt ? new Date(sub.trialEndsAt).toLocaleDateString() : 'N/A'})
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-border">
                        <a
                          href={`/r/${b.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent hover:underline flex items-center gap-1 mr-2"
                        >
                          Customer QR
                          <ExternalLink className="h-3 w-3" />
                        </a>

                        {/* Extend +7d */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleTrialAction(b.id, 'extend', 7)}
                          className="text-xs h-8 px-2.5"
                          title="Add 7 days to trial"
                        >
                          +7 Days
                        </Button>

                        {/* Extend +14d */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleTrialAction(b.id, 'extend', 14)}
                          className="text-xs h-8 px-2.5"
                          title="Add 14 days to trial"
                        >
                          +14 Days
                        </Button>

                        {/* Extend +30d */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleTrialAction(b.id, 'extend', 30)}
                          className="text-xs h-8 px-2.5"
                          title="Add 30 days to trial"
                        >
                          +30 Days
                        </Button>

                        {/* Expire / Reactivate */}
                        {isExpired ? (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => handleTrialAction(b.id, 'reactivate', 14)}
                            className="text-xs h-8 px-2.5"
                          >
                            Reactivate
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => handleTrialAction(b.id, 'expire')}
                            className="text-xs h-8 px-2.5 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            Expire Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
