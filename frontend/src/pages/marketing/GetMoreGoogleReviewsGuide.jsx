import React from 'react';
import { Link } from 'react-router-dom';
import { GuideLayout } from '../../components/marketing/GuideLayout';
import { Card } from '../../components/ui/Card';
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const GetMoreGoogleReviewsGuide = () => {
  return (
    <GuideLayout
      title="How to Get More Google Reviews for Your Business (Without Being Pushy)"
      description="7 proven, policy-compliant strategies to steadily grow your Google rating, increase local SEO visibility, and turn customer satisfaction into public proof."
      canonicalUrl="https://ratevia.in/guides/get-more-google-reviews"
      readTime="6 min read"
      badge="LOCAL SEO STRATEGY"
    >
      <section className="space-y-4">
        <h2 className="font-display text-2xl text-foreground font-normal">
          Why Google Reviews Matter More Than Ever
        </h2>
        <p className="text-muted-foreground">
          For local businesses—whether you run a neighborhood café, an artisan bakery, a boutique hotel, or a hair salon—Google Maps is the modern storefront. Studies consistently show that over 84% of consumers trust online reviews as much as personal recommendations, and local search algorithms heavily weight total review count, rating average, and review recency.
        </p>
        <p className="text-muted-foreground">
          However, most small businesses struggle with a fundamental asymmetry: <em>unhappy customers are motivated to complain, while delighted customers simply leave smiling without saying a word online</em>. Overcoming this requires making review submission frictionless.
        </p>
      </section>

      <section className="space-y-4 pt-4">
        <h2 className="font-display text-2xl text-foreground font-normal">
          7 Proven Strategies to Increase Your Google Reviews
        </h2>

        <div className="space-y-6">
          <Card className="p-6 space-y-2">
            <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
              <span className="text-accent font-mono">01.</span>
              <span>Place Tabletop Review QR Stands at Eye Level</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Don’t rely on customers remembering to search for your venue on Google hours later. Physical acrylic stands placed on café tables, dining booths, or reception counters provide an immediate, tactile prompt. When customers see a branded stand with clear instructions, scan rates increase dramatically.
            </p>
            <div className="pt-2">
              <Link to="/review-qr-code" className="text-xs text-accent font-medium hover:underline inline-flex items-center gap-1">
                <span>Explore custom Google review QR stands</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>

          <Card className="p-6 space-y-2">
            <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
              <span className="text-accent font-mono">02.</span>
              <span>Ask at the Emotional Peak of the Experience</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Timing is everything. In a restaurant, the peak is right after dessert when the check is delivered. In a salon, it’s when the client looks in the mirror and admires their finished haircut. In a hotel, it’s during a smooth checkout. Prompting for feedback when satisfaction is fresh produces heartfelt, enthusiastic reviews.
            </p>
          </Card>

          <Card className="p-6 space-y-2">
            <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
              <span className="text-accent font-mono">03.</span>
              <span>Eliminate "Writer’s Block" with Topic Prompts</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Many customers want to leave a nice review but freeze when confronted with a blank text box. Ratevia’s AI review assistant solves this by letting patrons tap 2 or 3 quick highlights (e.g. "Cold Brew", "Friendly Baristas", "Cozy Ambiance") and automatically crafting a natural, conversational draft they can edit and copy to Google with one tap.
            </p>
          </Card>

          <Card className="p-6 space-y-2">
            <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
              <span className="text-accent font-mono">04.</span>
              <span>Train Staff to Make Casual, Warm Mentions</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Staff shouldn’t sound scripted. A simple, polite closing phrase works best: <em>"If you enjoyed your cold brew today, our QR stand on the table lets you share a quick review on Google—it really helps our small team!"</em>
            </p>
          </Card>

          <Card className="p-6 space-y-2">
            <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
              <span className="text-accent font-mono">05.</span>
              <span>Respond Publicly to Every Single Review</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Google explicitly rewards active business profiles. Replying to both praise and constructive feedback shows prospective customers that ownership is attentive, professional, and appreciative.
            </p>
          </Card>

          <Card className="p-6 space-y-2">
            <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
              <span className="text-accent font-mono">06.</span>
              <span>Capture Constructive Feedback Privately</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Customers who had a minor complaint often leave 1-star reviews simply because they lacked a private outlet. With Ratevia, customers rating 1–3 stars are invited to share constructive operational notes that land privately on your management dashboard, allowing you to fix issues before they damage your public profile.
            </p>
          </Card>

          <Card className="p-6 space-y-2">
            <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
              <span className="text-accent font-mono">07.</span>
              <span>Never Offer Incentives or Bribes for Reviews</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Google’s guidelines strictly prohibit offering discounts, free items, or cash in exchange for reviews. Doing so puts your Google Business Profile at risk of penalties or removal. Focus on genuine service quality and frictionless QR capture instead.
            </p>
          </Card>
        </div>
      </section>

      <section className="space-y-4 pt-4">
        <h2 className="font-display text-2xl text-foreground font-normal">
          Google Review Policy: Staying 100% Compliant
        </h2>
        <Card className="p-6 border-amber-200 bg-amber-50/50 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span>Strict Anti-Gating Rule</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            Google prohibits "review gating"—the practice of selectively funneling positive reviewers to Google while blocking negative reviewers. Ratevia is built with full Google compliance: every customer, regardless of star rating, maintains direct access to open your official Google Maps review screen.
          </p>
        </Card>
      </section>
    </GuideLayout>
  );
};
