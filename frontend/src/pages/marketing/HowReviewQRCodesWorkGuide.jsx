import React from 'react';
import { Link } from 'react-router-dom';
import { GuideLayout } from '../../components/marketing/GuideLayout';
import { Card } from '../../components/ui/Card';
import { CheckCircle2, QrCode, Smartphone, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export const HowReviewQRCodesWorkGuide = () => {
  return (
    <GuideLayout
      title="How Google Review QR Codes Work — A Complete Guide"
      description="Understand the technology, scan-to-review mechanics, policy compliance, and customization options behind physical review QR codes for small businesses."
      canonicalUrl="https://ratevia.in/guides/how-review-qr-codes-work"
      readTime="5 min read"
      badge="PRODUCT & TECH GUIDE"
    >
      <section className="space-y-4">
        <h2 className="font-display text-2xl text-foreground font-normal">
          What is a Google Review QR Code?
        </h2>
        <p className="text-muted-foreground">
          A Google Review QR code is a machine-readable optical label that encodes a direct web address. When scanned with any modern iOS or Android smartphone camera, it immediately launches the user's mobile browser and directs them to an interactive review experience or straight to the business’s official Google Maps review dialogue box.
        </p>
        <p className="text-muted-foreground">
          Instead of asking patrons to unlock their phone, open Google Maps, search for your exact business name, filter through identically named venues, and tap "Write a review", a QR code accomplishes the entire sequence in a single tap.
        </p>
      </section>

      <section className="space-y-4 pt-4">
        <h2 className="font-display text-2xl text-foreground font-normal">
          The Scan-to-Review Flow: Step-by-Step
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5 space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Smartphone className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">Step 1: The Touchless Camera Scan</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Customers point their native camera at the tabletop stand or counter sticker. An instant banner notification pops up. No app download or signup is required.
            </p>
          </Card>

          <Card className="p-5 space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <QrCode className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">Step 2: Instant Star & Topic Selection</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The customer selects 1 to 5 stars and taps specific positive highlights tailored to your industry (e.g. "Fast Service", "Cleanliness", "Great Taste").
            </p>
          </Card>

          <Card className="p-5 space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">Step 3: AI Review Phrasing</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ratevia formulates an articulate draft based on their selections. The customer maintains 100% editing control to modify words or select alternative tones.
            </p>
          </Card>

          <Card className="p-5 space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">Step 4: One-Tap Copy & Post to Google</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              With a single click, the review text copies to clipboard and opens the venue's official Google Maps review screen where the customer pastes and submits.
            </p>
          </Card>
        </div>
      </section>

      <section className="space-y-4 pt-4">
        <h2 className="font-display text-2xl text-foreground font-normal">
          Static QR Codes vs Dynamic QR Review Platforms
        </h2>
        <p className="text-muted-foreground">
          Many small business owners start by generating a free generic QR code linked directly to their Google Business URL. While free, static QR codes have major drawbacks:
        </p>

        <div className="space-y-3">
          <Card className="p-5 space-y-2">
            <h4 className="font-semibold text-foreground text-sm">1. High Drop-Off Rates Due to Writer's Block</h4>
            <p className="text-xs text-muted-foreground">
              A static QR code opens Google's empty box. Over 70% of diners or salon guests abandon the screen because they don't know what to write on the spot.
            </p>
          </Card>

          <Card className="p-5 space-y-2">
            <h4 className="font-semibold text-foreground text-sm">2. Zero Analytics or Scan Intelligence</h4>
            <p className="text-xs text-muted-foreground">
              Static codes provide zero tracking. You have no way of knowing how many patrons scanned your table stands, what topics are praised, or what times of day receive the most interaction.
            </p>
          </Card>

          <Card className="p-5 space-y-2">
            <h4 className="font-semibold text-foreground text-sm">3. Inability to Capture Constructive Feedback</h4>
            <p className="text-xs text-muted-foreground">
              When a guest is frustrated with slow service or a cold meal, a raw Google link invites a public 1-star review. A smart platform like Ratevia invites them to submit constructive feedback privately to management first.
            </p>
          </Card>
        </div>
      </section>

      <section className="space-y-4 pt-4">
        <h2 className="font-display text-2xl text-foreground font-normal">
          How to Get Started with Ratevia
        </h2>
        <p className="text-muted-foreground">
          Ratevia eliminates monthly subscriptions with a transparent, one-time setup fee. You receive high-resolution, print-ready QR standee files with verified Google destination routing and lifetime dashboard access.
        </p>
        <div className="pt-2">
          <Link to="/qr-customize">
            <button className="text-sm font-semibold text-accent hover:underline inline-flex items-center gap-1.5">
              <span>Preview your custom QR stand in real time</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>
    </GuideLayout>
  );
};
