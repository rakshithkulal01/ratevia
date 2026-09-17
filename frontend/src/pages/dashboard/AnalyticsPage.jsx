import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Star,
  ThumbsUp,
  AlertCircle,
  QrCode,
  ExternalLink,
  Loader2,
  Calendar,
  Sparkles,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AnalyticsPage = () => {
  const { session } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchAnalytics = async () => {
      if (!session?.access_token) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/analytics`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (res.ok) {
          const json = await res.json();
          if (mounted) setData(json);
        } else {
          if (mounted) setError('Failed to load analytics data.');
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => {
      mounted = false;
    };
  }, [session]);

  const ratingDistribution = data?.ratingDistribution || [];
  const feedbackTrends = data?.feedbackTrends || [];
  const mostLikedTopics = data?.mostLikedTopics || [];
  const improvementAreas = data?.improvementAreas || [];
  const overview = data?.overview || {
    totalQrScans: 0,
    totalFeedbacks: 0,
    googleClicks: 0,
    reviewsCopied: 0,
    averageRating: 0,
    conversionRate: 0,
  };

  return (
    <DashboardLayout activeTab="analytics">
      <div className="space-y-8">
        {/* Top Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Customer Insights & Analytics</h2>
            <p className="text-xs text-muted-foreground">
              Deep dive into rating trends, customer preferences, and conversion funnel performance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              <Calendar className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              Last 14 Days
            </Badge>
          </div>
        </div>

        {/* Charts Row 1: Rating Distribution & Feedback Activity Over Time */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Rating Distribution Bar Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-base font-semibold text-foreground">
                  Rating Distribution
                </CardTitle>
                <p className="text-xs text-muted-foreground">Star ratings breakdown from 1★ to 5★</p>
              </div>
              <div className="flex items-center gap-1.5 font-display text-lg font-bold text-foreground">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>{overview.averageRating > 0 ? overview.averageRating : '—'}</span>
                <span className="text-xs font-normal text-muted-foreground">avg</span>
              </div>
            </div>

            <div className="h-64 w-full">
              {overview.totalFeedbacks === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Star className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">No rating records yet to display.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ratingDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="rating" tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '0.5rem',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                        fontSize: '12px',
                      }}
                      formatter={(value) => [`${value} responses`, 'Count']}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#0052FF" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Chart 2: Feedback Submissions Over Time Area Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-base font-semibold text-foreground">
                  Feedback Volume Over Time
                </CardTitle>
                <p className="text-xs text-muted-foreground">Daily customer submissions over the last 14 days</p>
              </div>
              <Badge variant="outline" className="font-mono text-xs text-accent">
                {overview.totalFeedbacks} Total
              </Badge>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={feedbackTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="feedbackGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0052FF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0052FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.5rem',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="feedbacks"
                    stroke="#0052FF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#feedbackGradient)"
                    name="Submissions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Topics Breakdown Row: What Patrons Love vs. What Could Be Improved */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Liked Topics */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <ThumbsUp className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-foreground">
                  What Patrons Appreciate Most
                </CardTitle>
                <p className="text-xs text-muted-foreground">Topics selected on positive ratings (4–5 stars)</p>
              </div>
            </div>

            {mostLikedTopics.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center bg-muted/20 rounded-xl">
                No positive feedback topics logged yet.
              </p>
            ) : (
              <div className="space-y-3">
                {mostLikedTopics.map((item, idx) => {
                  const maxCount = Math.max(...mostLikedTopics.map((t) => t.count), 1);
                  const pct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{item.topic}</span>
                        <span className="font-mono text-emerald-600 font-semibold">
                          {item.count} mentions
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Common Improvement Areas */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-foreground">
                  Constructive Feedback Areas
                </CardTitle>
                <p className="text-xs text-muted-foreground">Items noted when patrons rated 1–3 stars</p>
              </div>
            </div>

            {improvementAreas.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center bg-muted/20 rounded-xl">
                No improvement concerns reported. Keep up the high standard!
              </p>
            ) : (
              <div className="space-y-3">
                {improvementAreas.map((item, idx) => {
                  const maxCount = Math.max(...improvementAreas.map((t) => t.count), 1);
                  const pct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{item.topic}</span>
                        <span className="font-mono text-amber-600 font-semibold">
                          {item.count} mentions
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};
