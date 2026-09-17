import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  QrCode,
  MessageSquare,
  ExternalLink,
  Star,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Clock,
  ThumbsUp,
  AlertCircle,
  Copy,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const DashboardOverviewPage = () => {
  const { session } = useAuth();
  const [data, setData] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadOverview = async () => {
      if (!session?.access_token) return;
      try {
        setLoading(true);
        const [analyticsRes, feedbackRes] = await Promise.all([
          fetch(`${API_URL}/api/analytics`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
          fetch(`${API_URL}/api/feedback?limit=5`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }),
        ]);

        if (analyticsRes.ok && feedbackRes.ok) {
          const analyticsJson = await analyticsRes.json();
          const feedbackJson = await feedbackRes.json();

          if (mounted) {
            setData(analyticsJson);
            setFeedbacks(feedbackJson.feedbacks || []);
          }
        } else {
          if (mounted) setError('Could not load dashboard data.');
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadOverview();
    return () => {
      mounted = false;
    };
  }, [session]);

  const overview = data?.overview || {
    totalQrScans: 0,
    totalFeedbacks: 0,
    googleClicks: 0,
    reviewsCopied: 0,
    averageRating: 0,
    conversionRate: 0,
  };

  const business = data?.business;

  return (
    <DashboardLayout activeTab="overview">
      <div className="space-y-8">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: QR Scans */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Total QR Scans
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <QrCode className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-display text-foreground">
                  {overview.totalQrScans}
                </span>
                <span className="text-xs text-muted-foreground">scans</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Customers who accessed your review QR</p>
            </CardContent>
          </Card>

          {/* Card 2: Feedback Submissions */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Feedbacks Received
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <MessageSquare className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-display text-foreground">
                  {overview.totalFeedbacks}
                </span>
                <span className="text-xs text-muted-foreground">submissions</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Private responses collected</p>
            </CardContent>
          </Card>

          {/* Card 3: Google Review Clicks */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Google Link Clicks
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <ExternalLink className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-display text-foreground">
                  {overview.googleClicks}
                </span>
                <span className="text-xs font-medium text-accent">
                  {overview.conversionRate}% conversion
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Continued to Google review page</p>
            </CardContent>
          </Card>

          {/* Card 4: Average Rating */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Avg Feedback Rating
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Star className="h-4 w-4 fill-amber-500" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-display text-foreground">
                  {overview.averageRating > 0 ? overview.averageRating : '—'}
                </span>
                <span className="text-xs text-muted-foreground">/ 5.0</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Based on {overview.totalFeedbacks} ratings</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Banner */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-muted/60 via-white to-accent/5 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 rounded-full bg-accent" />
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Customer QR Destination
              </span>
            </div>
            <h3 className="font-semibold text-foreground text-lg">
              Collect reviews seamlessly at tables & counters
            </h3>
            <p className="text-sm text-muted-foreground max-w-xl mt-0.5">
              Print your personalized QR code or share your business link directly with your patrons.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link to="/dashboard/qr" className="w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full sm:w-auto">
                <QrCode className="mr-2 h-4 w-4" />
                View & Download QR
              </Button>
            </Link>
            {business && (
              <a
                href={`/r/${business.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Test Flow
                  <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Two-column Section: Recent Feedback & Funnel Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Recent Customer Feedback */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Recent Customer Feedback</h2>
                <p className="text-xs text-muted-foreground">Latest impressions and suggestions</p>
              </div>
              <Link
                to="/dashboard/feedback"
                className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
              >
                View all ({overview.totalFeedbacks})
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {feedbacks.length === 0 ? (
              <Card className="p-8 text-center bg-muted/20 border-dashed">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent mx-auto mb-3">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h4 className="font-medium text-foreground mb-1">No feedback received yet</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                  Once customers scan your QR code and rate their experience, their feedback and AI-assisted reviews will appear here.
                </p>
                <Link to="/dashboard/qr">
                  <Button variant="outline" size="sm">
                    Print Your QR Standee
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {feedbacks.map((fb) => (
                  <Card key={fb.id} className="p-4 hover:border-accent/40 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= fb.rating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-border'
                              }`}
                            />
                          ))}
                        </div>
                        <Badge
                          variant={fb.rating >= 4 ? 'default' : 'secondary'}
                          className="text-[10px] uppercase font-mono"
                        >
                          {fb.rating >= 4 ? 'Positive' : 'Needs Attention'}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(fb.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Topics */}
                    {fb.selectedTopics && fb.selectedTopics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {fb.selectedTopics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Message */}
                    {fb.customerMessage && (
                      <p className="mt-2 text-xs text-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">
                        "{fb.customerMessage}"
                      </p>
                    )}

                    {/* Footer Status Indicators */}
                    <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-border/60 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle2
                          className={`h-3.5 w-3.5 ${
                            fb.reviewCopiedAt ? 'text-emerald-500' : 'text-muted-foreground/50'
                          }`}
                        />
                        {fb.reviewCopiedAt ? 'Review Copied' : 'Not Copied'}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2
                          className={`h-3.5 w-3.5 ${
                            fb.googleLinkClickedAt ? 'text-blue-500' : 'text-muted-foreground/50'
                          }`}
                        />
                        {fb.googleLinkClickedAt ? 'Google Link Clicked' : 'Not Clicked'}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right 1 Col: Experience Funnel & Analytics Link */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Interaction Funnel</h2>
              <p className="text-xs text-muted-foreground">Journey from QR scan to Google click</p>
            </div>

            <Card className="p-5 space-y-4">
              {data?.funnel ? (
                data.funnel.map((step, idx) => {
                  const maxVal = Math.max(overview.totalQrScans, 1);
                  const pct = Math.min(100, Math.round((step.count / maxVal) * 100));
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{step.step}</span>
                        <span className="font-mono text-muted-foreground font-semibold">
                          {step.count}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, step.count > 0 ? 6 : 0)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground py-4 text-center">Loading funnel...</p>
              )}

              <div className="pt-3 border-t border-border">
                <Link to="/dashboard/analytics">
                  <Button variant="secondary" size="sm" className="w-full justify-center text-xs">
                    <TrendingUp className="mr-1.5 h-3.5 w-3.5 text-accent" />
                    Open Detailed Analytics
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Google Review URL Preview */}
            <Card className="p-5">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Target Google Review URL
              </span>
              <p className="text-xs text-foreground font-mono truncate mt-1 bg-muted/50 p-2 rounded border border-border">
                {business?.googleReviewUrl || 'Not configured'}
              </p>
              <div className="mt-3 flex justify-end">
                <Link to="/dashboard/business">
                  <span className="text-xs text-accent hover:underline">Edit URL in Settings &rarr;</span>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
