import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  CheckCircle2,
  Send,
  Loader2,
  AlertTriangle,
  Phone,
  Mail,
  Building2,
  User,
  MapPin,
} from 'lucide-react';
import { getCategoryOptions } from '../../config/businessCategories';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const ContactPage = () => {
  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('CAFE');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const resetForm = () => {
    setOwnerName('');
    setBusinessName('');
    setBusinessType('CAFE');
    setCountryCode('+91');
    setPhoneNumber('');
    setEmail('');
    setCity('');
    setMessage('');
    setErrorMessage(null);
    setIsDuplicate(false);
    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    setIsDuplicate(false);

    try {
      const res = await fetch(`${API_URL}/api/business-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerName: ownerName.trim(),
          businessName: businessName.trim(),
          businessType,
          countryCode: countryCode.trim(),
          phoneNumber: phoneNumber.trim(),
          email: email.trim(),
          city: city.trim(),
          message: message.trim() || null,
        }),
      });

      const json = await res.json();

      if (res.status === 201) {
        setSubmitted(true);
      } else if (res.status === 409) {
        setIsDuplicate(true);
        setErrorMessage(
          json.message ||
            'A registration request for this business was recently submitted. Our team will contact you shortly.'
        );
      } else {
        setErrorMessage(json.message || 'Unable to submit request. Please check your details.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Network error connecting to Ratevia server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="outline" className="font-mono text-xs uppercase">
          Get Started With Ratevia
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl text-foreground font-normal">
          Request Ratevia for Your Business<span className="text-accent">.</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Ratevia is ₹1,000 one-time for local businesses with zero recurring subscription fees. Fill in your details below and our team will get in touch to set up your venue.
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
              No monthly subscription. No scan limits.
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
              'Direct administrator onboarding & verification',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border text-xs text-muted-foreground">
            <p className="leading-relaxed">
              Once you submit your request, our team contacts you directly to understand your business, verify your Google Maps profile, and activate your account.
            </p>
          </div>
        </Card>

        {/* Right Column: Business Request Form */}
        <Card className="md:col-span-7 p-6">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-100 text-emerald-600 mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl text-foreground font-semibold">
                Request received.
              </h3>
              <p className="text-sm text-foreground max-w-md mx-auto leading-relaxed">
                Thanks for your interest in Ratevia.
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                We'll contact you shortly to understand your business and help you get started.
              </p>
              <div className="pt-4">
                <Button variant="outline" size="sm" onClick={resetForm} className="rounded-md">
                  Submit another inquiry
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMessage && (
                <div
                  className={`p-3 text-xs border rounded-md flex items-start gap-2 ${
                    isDuplicate
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  <AlertTriangle
                    className={`h-4 w-4 shrink-0 mt-0.5 ${
                      isDuplicate ? 'text-amber-600' : 'text-red-500'
                    }`}
                  />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Owner Name & Business Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Owner / Contact Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Rahul Kumar"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Business / Venue Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Amber Roast Café"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Business Category & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Business Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
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
                    City / Location <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Mangalore / Bangalore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Phone Number with Country Code */}
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Phone Number (For Verification & Onboarding) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-24 rounded-md border border-border bg-white px-2 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent shrink-0 font-mono"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US/CA)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+971">+971 (UAE)</option>
                    <option value="+65">+65 (SG)</option>
                    <option value="+61">+61 (AU)</option>
                  </select>
                  <Input
                    type="tel"
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="flex-1 font-mono"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  We'll contact you on this number to verify your location and share onboarding steps.
                </p>
              </div>

              {/* Email Address */}
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="owner@yourbusiness.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Message / Details */}
              <div>
                <label className="block font-medium text-foreground mb-1">
                  Note / Details (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us a little about your business or Google Maps link..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={1000}
                  className="w-full p-2.5 text-xs rounded-md border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full justify-center rounded-md"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Business Request (₹1,000 One-Time)
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
export default ContactPage;
