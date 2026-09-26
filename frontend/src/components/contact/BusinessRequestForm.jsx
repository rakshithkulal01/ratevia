import React from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Send, Loader2, AlertTriangle } from 'lucide-react';
import { getCategoryOptions } from '../../config/businessCategories';

export const BusinessRequestForm = ({
  ownerName,
  setOwnerName,
  businessName,
  setBusinessName,
  businessType,
  setBusinessType,
  countryCode,
  setCountryCode,
  phoneNumber,
  setPhoneNumber,
  email,
  setEmail,
  city,
  setCity,
  message,
  setMessage,
  onSubmit,
  submitting,
  errorMessage,
  isDuplicate,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 text-xs">
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
  );
};

export default BusinessRequestForm;
