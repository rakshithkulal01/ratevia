import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  Star,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Loader2,
  Clock,
} from 'lucide-react';

import { feedbackService } from '../../services/feedbackService';

export const FeedbackHistoryPage = () => {
  const { session } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchFeedbacks = async () => {
      if (!session?.access_token) return;
      try {
        setLoading(true);
        const json = await feedbackService.getFeedbacks(session.access_token, ratingFilter);
        if (mounted) {
          setFeedbacks(json.feedbacks || []);
          setSummary(json.summary || null);
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to retrieve customer feedbacks.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFeedbacks();
    return () => {
      mounted = false;
    };
  }, [session, ratingFilter]);

  // Client-side search filter across customer message and topics
  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesMessage = fb.customerMessage?.toLowerCase().includes(q);
    const matchesReview = fb.generatedReview?.toLowerCase().includes(q);
    const matchesTopics = fb.selectedTopics?.some((t) => t.toLowerCase().includes(q));
    return matchesMessage || matchesReview || matchesTopics;
  });

  return (
    <DashboardLayout activeTab="feedback">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Customer Feedback Log</h2>
            <p className="text-xs text-muted-foreground">
              Review verified customer impressions, chosen topics, and AI-assisted reviews.
            </p>
          </div>
          {summary && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-white border border-border px-3 py-1.5 rounded-md shadow-xs">
                Active 1–3★ Logs: <strong className="text-foreground">{summary.totalFeedback}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Privacy Notice Banner */}
        <div className="rounded-md border border-accent/20 bg-accent/5 p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-foreground">Privacy-First Data Retention: </span>
            4–5★ customer reviews are routed directly to Google and counted in your aggregate analytics without persisting raw customer records. 1–3★ feedbacks containing service feedback are temporarily retained for 30 days for business follow-up.
          </div>
        </div>

        {/* Filter and Search Bar */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Rating Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <button
                onClick={() => setRatingFilter('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  ratingFilter === 'all'
                    ? 'bg-accent text-white'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                All Retained (1–3★)
              </button>
              {[5, 4, 3, 2, 1].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setRatingFilter(String(stars))}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    ratingFilter === String(stars)
                      ? 'bg-accent text-white'
                      : 'bg-muted/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{stars}</span>
                  <Star className="h-3 w-3 fill-current" />
                </button>
              ))}
            </div>

            {/* Keyword Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search feedback keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </Card>

        {/* Feedbacks Listing */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto mb-3" />
            <p className="text-xs text-muted-foreground">Loading feedback history...</p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <Card className="py-16 text-center bg-muted/10 border-dashed">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <h4 className="font-medium text-foreground text-sm mb-1">
              {ratingFilter === '4' || ratingFilter === '5'
                ? `${ratingFilter}★ Feedbacks are Aggregate-Only`
                : 'No feedback entries found'}
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {ratingFilter === '4' || ratingFilter === '5'
                ? 'Under Ratevia privacy policy, 4–5★ reviews are routed directly to Google and tracked in the Analytics tab without storing raw customer messages.'
                : searchQuery
                ? 'No reviews matched your search query. Try clearing your search.'
                : 'No raw feedback records have been logged in the past 30 days for this rating.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredFeedbacks.map((fb) => (
              <Card key={fb.id} className="p-5 hover:border-accent/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Stars */}
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
                      className="text-[10px] font-mono uppercase"
                    >
                      {fb.rating >= 4 ? 'Positive' : 'Needs Attention'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(fb.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Selected Topics */}
                {fb.selectedTopics && fb.selectedTopics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {fb.selectedTopics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-foreground font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                {/* Customer Written Feedback */}
                {fb.customerMessage && (
                  <div className="mt-3 p-3 rounded-lg bg-muted/40 border border-border/60">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold block mb-1">
                      Customer Note
                    </span>
                    <p className="text-xs text-foreground leading-relaxed">
                      "{fb.customerMessage}"
                    </p>
                  </div>
                )}

                {/* AI Review Assistance Output */}
                {fb.generatedReview && (
                  <div className="mt-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className="h-3 w-3 text-accent" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold">
                        Generated Review Suggestion
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                      "{fb.generatedReview}"
                    </p>
                  </div>
                )}

                {/* Action Conversion Audit Status */}
                <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`h-3.5 w-3.5 ${
                        fb.reviewCopiedAt ? 'text-emerald-500' : 'text-border'
                      }`}
                    />
                    <span>
                      Review Copied: {fb.reviewCopiedAt ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`h-3.5 w-3.5 ${
                        fb.googleLinkClickedAt ? 'text-blue-500' : 'text-border'
                      }`}
                    />
                    <span>
                      Continued to Google: {fb.googleLinkClickedAt ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
