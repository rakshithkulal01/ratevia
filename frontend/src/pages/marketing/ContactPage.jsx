import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  Mail,
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  Loader2,
} from 'lucide-react';
import { getCategoryOptions } from '../../config/businessCategories';

export const ContactPage = () => {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [businessType, setBusinessType] = useState('CAFE');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate inquiry submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="outline" className="font-mono text-xs uppercase">
          Get Started With Ratevia
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl text-foreground font-normal">
          Contact Us to Get Ratevia<span className="text-accent">.</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Ratevia is ₹1,000 one-time for small businesses with zero recurring subscription fees. Tell us about your venue to get your business provisioned.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Plan Highlights */}
        <Card className="md:col-span-5 p-6 space-y-6 bg-muted/20 border-border/70">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                What's Included
              </span>
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              ₹1,000 <span className="text-xs font-normal text-muted-foreground font-sans">one-time</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              No monthly subscription. No usage limits.
            </p>
          </div>

          <div className="space-y-3 text-xs text-foreground">
            {[
              'Custom QR code standee & digital link',
              'AI-assisted review suggestion engine',
              'Constructive feedback intake with 30-day retention',
              'Business analytics & Recharts dashboard',
              'Google review redirection flow',
              'Unlimited QR scans & customer feedback',
              'Direct administrator onboarding',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border text-xs text-muted-foreground">
            <p className="leading-relaxed">
              Once you reach out, our team sets up your venue profile, generates your high-resolution QR graphics, and activates your dashboard access.
            </p>
          </div>
        </Card>

        {/* Right Column: Contact Inquiry Form */}
        <Card className="md:col-span-7 p-6">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-100 text-emerald-600 mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl text-foreground font-semibold">
                Thank You for Reaching Out!
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                We have received your inquiry for <strong className="text-foreground">{businessName}</strong>. Our team will contact you at <strong className="text-foreground">{email}</strong> to finalize your setup.
              </p>
              <div className="pt-4">
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Business / Venue Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Amber Roast Café"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Business Category
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full rounded-md border border-border bg-white px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {getCategoryOptions().map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Your Email Address
                </label>
                <Input
                  type="email"
                  placeholder="owner@yourbusiness.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-foreground mb-1">
                  Note / Location / Special Requirements (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your location, Google Maps link, or questions..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 text-xs rounded-md border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="md" className="w-full justify-center" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Inquiry...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Request Provisioning (₹1,000 One-Time)
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
