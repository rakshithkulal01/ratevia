import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEOHead from '../../components/seo/SEOHead';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { GoogleIcon } from '../../components/ui/GoogleIcon';
import { useAuth } from '../../context/AuthContext';
import { BrandedQRCard } from '../../components/dashboard/BrandedQRCard';
import { RateviaStickerPreview } from '../../components/dashboard/RateviaStickerPreview';
import { QRCustomizationPanel } from '../../components/dashboard/QRCustomizationPanel';
import { publicService } from '../../services/publicService';
import { usePlatformPrice } from '../../hooks/usePlatformPrice';
import { getCategoryOptions, getCategoryConfig } from '../../config/businessCategories';
import {
  getQRBrandConfig,
  getCategoryDefaultAccent,
  DEFAULT_QR_MESSAGE,
  renderRateviaStickerDataUrl,
  buildCustomerQRUrl,
  slugify,
} from '../../utils/qrBrandUtils';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  QrCode,
  Globe,
  Building2,
  Phone,
  Mail,
  User,
  MapPin,
  Clock,
  HelpCircle,
  Lock,
  LogIn,
  X,
  UserCheck,
} from 'lucide-react';

export const PublicQRCustomizePage = () => {
  const { session, user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const { formattedPrice, price: currentPrice, loading: priceLoading } = usePlatformPrice();

  // Form Fields
  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('Your experience matters 💙');
  const [category, setCategory] = useState('CAFE');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');

  // QR Customization
  const [badgeType, setBadgeType] = useState('sparkle');
  const [previewMode, setPreviewMode] = useState('sticker'); // 'sticker' | 'stand'
  const [selectedAccent, setSelectedAccent] = useState('warm');
  const [selectedStyle, setSelectedStyle] = useState('classic');
  const [selectedMessage, setSelectedMessage] = useState(DEFAULT_QR_MESSAGE);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);
  const [restoredDraft, setRestoredDraft] = useState(false);
  const stickerCanvasRef = useRef(null);
  const isSubmittingRef = useRef(false);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authGoogleLoading, setAuthGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Save current design draft into localStorage
  const saveDesignDraft = () => {
    try {
      const draft = {
        businessName,
        tagline,
        category,
        contactName,
        phone,
        email,
        city,
        destinationUrl,
        badgeType,
        selectedAccent,
        selectedStyle,
        selectedMessage,
      };
      localStorage.setItem('ratevia_pending_qr_design', JSON.stringify(draft));
    } catch (e) {
      console.warn('Could not save draft to localStorage:', e);
    }
  };

  // Restore saved design draft on mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ratevia_pending_qr_design');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.businessName) setBusinessName(parsed.businessName);
        if (parsed.tagline) setTagline(parsed.tagline);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.contactName) setContactName(parsed.contactName);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.city) setCity(parsed.city);
        if (parsed.destinationUrl) setDestinationUrl(parsed.destinationUrl);
        if (parsed.badgeType) setBadgeType(parsed.badgeType);
        if (parsed.selectedAccent) setSelectedAccent(parsed.selectedAccent);
        if (parsed.selectedStyle) setSelectedStyle(parsed.selectedStyle);
        if (parsed.selectedMessage) setSelectedMessage(parsed.selectedMessage);
        setRestoredDraft(true);
      }
    } catch (err) {
      console.warn('Failed to parse saved QR design:', err);
    }
  }, []);

  // Sync user details when authenticated
  useEffect(() => {
    if (user) {
      if (!email && user.email) setEmail(user.email);
      if (!contactName && (user.name || user.user_metadata?.name)) {
        setContactName(user.name || user.user_metadata?.name);
      }
    }
  }, [user]);

  // When opening modal, pre-populate auth fields
  useEffect(() => {
    if (showAuthModal) {
      if (email && !authEmail) setAuthEmail(email);
      if (contactName && !authName) setAuthName(contactName);
      setAuthError(null);
    }
  }, [showAuthModal]);

  const categoryOptions = useMemo(() => getCategoryOptions(), []);
  const categoryConfig = useMemo(() => getCategoryConfig(category), [category]);

  // Handle category change and auto-set suggested accent & tagline
  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setCategory(newCat);
    const suggestedAccent = getCategoryDefaultAccent(newCat);
    setSelectedAccent(suggestedAccent);
    const catConfig = getCategoryConfig(newCat);
    if (catConfig?.brandTheme?.tagline) {
      setTagline(catConfig.brandTheme.tagline);
    }
  };

  // Build live preview brand configuration
  const brandConfig = useMemo(() => {
    return getQRBrandConfig({
      business: { name: businessName || 'Your Business', businessType: category },
      categoryKey: category,
      selectedAccent,
      selectedStyle,
      selectedMessage,
    });
  }, [businessName, category, selectedAccent, selectedStyle, selectedMessage]);

  // Live QR encode target - Ratevia review URL
  const livePreviewUrl = useMemo(() => {
    const slug = slugify(businessName) || 'your-business';
    return buildCustomerQRUrl(slug);
  }, [businessName]);

  // Auth action handlers for the modal
  const handleModalGoogleLogin = async () => {
    try {
      setAuthError(null);
      setAuthGoogleLoading(true);
      saveDesignDraft();
      await signInWithGoogle();
    } catch (err) {
      setAuthError(err.message || 'Google sign-in failed. Please try again.');
      setAuthGoogleLoading(false);
    }
  };

  const handleModalEmailAuth = async (e) => {
    e.preventDefault();
    if (!authEmail.trim() || !authEmail.includes('@')) {
      setAuthError('Please provide a valid email address.');
      return;
    }
    if (!authPassword || authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setAuthError(null);
      setAuthLoading(true);
      saveDesignDraft();

      if (authMode === 'login') {
        await signInWithEmail(authEmail.trim(), authPassword);
        setEmail(authEmail.trim());
        setShowAuthModal(false);
        await executeSubmission();
      } else {
        await signUpWithEmail(authEmail.trim(), authPassword, authName.trim() || contactName.trim());
        setEmail(authEmail.trim());
        setShowAuthModal(false);
        await executeSubmission();
      }
    } catch (err) {
      console.error('[PublicQRCustomize] Modal auth error:', err);
      setAuthError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Perform backend submission
  const executeSubmission = async () => {
    isSubmittingRef.current = true;
    setSubmitting(true);
    setValidationError(null);

    try {
      // Render the complete customized Ratevia sticker PNG
      let stickerImageDataUrl = null;
      try {
        const qrCanvas = stickerCanvasRef.current?.querySelector('canvas');
        const stickerResult = await renderRateviaStickerDataUrl({
          businessName: businessName.trim(),
          tagline: tagline.trim(),
          customerUrl: livePreviewUrl,
          config: brandConfig,
          qrCanvas,
          badgeType,
        });
        stickerImageDataUrl = stickerResult?.dataUrl || null;
      } catch (renderErr) {
        console.warn('[PublicQRCustomize] Could not pre-render sticker image:', renderErr);
      }

      const payload = {
        businessName: businessName.trim(),
        category,
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim() || null,
        destinationUrl: destinationUrl.trim(),
        stickerImage: stickerImageDataUrl,
        qrConfig: {
          selectedAccent,
          selectedStyle,
          selectedMessage,
          initials: brandConfig.initials,
          tagline: tagline.trim() || undefined,
          badgeType,
        },
      };

      const res = await publicService.submitQRRequest(payload);
      try {
        localStorage.removeItem('ratevia_pending_qr_design');
      } catch {}
      setSubmittedData(res.request);
      setShowAuthModal(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('[PublicQRCustomize] Submit error:', err);
      setValidationError(err.message || 'Failed to submit QR request. Please try again.');
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  };

  // Form Validation & Submission Trigger
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmittingRef.current || submitting) return;
    setValidationError(null);

    // 1. Validate fields
    if (!businessName.trim() || businessName.trim().length < 2) {
      setValidationError('Please enter a business name (at least 2 characters).');
      return;
    }
    if (!contactName.trim() || contactName.trim().length < 2) {
      setValidationError('Please enter a contact person name.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setValidationError('Please provide a valid 10-digit phone number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please provide a valid email address.');
      return;
    }
    if (!destinationUrl.trim()) {
      setValidationError('Please provide a Website or Destination URL for your QR code.');
      return;
    }

    // 2. Validate URL protocol
    try {
      const parsedUrl = new URL(destinationUrl.trim());
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        setValidationError('URL must begin with http:// or https://');
        return;
      }
    } catch {
      setValidationError('Please enter a valid URL (e.g. https://yourwebsite.com or https://g.page/r/your-id)');
      return;
    }

    // 3. User must be logged in to submit request
    if (!session || !user) {
      saveDesignDraft();
      setShowAuthModal(true);
      return;
    }

    // 4. Authenticated -> execute submission directly
    await executeSubmission();
  };

  // ----------------------------------------------------
  // CONFIRMATION VIEW UPON SUCCESSFUL SUBMISSION
  // ----------------------------------------------------
  if (submittedData) {
    return (
      <div className="min-h-[85vh] py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <Card className="p-8 sm:p-12 text-center space-y-6 shadow-xl border-border bg-white relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-100 rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-9 w-9 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 font-mono text-xs">
              Request Received
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl text-slate-900 font-bold">
              Your Custom QR Setup Has Been Submitted!
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Our team will review your branded QR design, verify your destination URL, and contact you shortly.
            </p>
          </div>

          {/* Reference & Details Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-left max-w-md mx-auto space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Request Reference:</span>
              <span className="font-bold text-slate-900">{submittedData.referenceId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Business Name:</span>
              <span className="font-semibold text-slate-900">{submittedData.businessName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Destination URL:</span>
              <span className="text-slate-700 truncate max-w-[220px]" title={submittedData.destinationUrl}>
                {submittedData.destinationUrl}
              </span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-semibold">
              <span className="text-slate-900">Ratevia QR Package:</span>
              <span className="text-accent">{submittedData.quotedPrice ? `₹${submittedData.quotedPrice}` : formattedPrice}</span>
            </div>
          </div>

          {/* Reassurance Notice */}
          <div className="flex items-start gap-2.5 p-4 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 max-w-md mx-auto text-left leading-relaxed">
            <ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">What happens next?</span>
              Ratevia does not automatically activate QR codes for unverified websites. An admin will review your design, contact you via phone or email, and provide your print stand folios upon confirmation.
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/">
              <Button variant="primary" size="md" className="rounded-md">
                Back to Homepage
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="md" className="rounded-md">
                Contact Support
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN CUSTOMIZATION & SUBMISSION FORM
  // ----------------------------------------------------
  return (
    <div className="py-10 md:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      <SEOHead
        title="Create Your Google Review QR Stand — Ratevia"
        exactTitle={true}
        description="Design a custom branded QR stand for your business. Preview in real time, choose your style, and submit for Ratevia verification. One-time setup."
        canonicalUrl="https://ratevia.in/qr-customize"
      />

      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge dot pulse variant="accent" className="font-mono text-xs">
          Public QR Studio
        </Badge>
        <h1 className="font-display text-4xl sm:text-5xl text-foreground font-bold tracking-tight">
          Create Your Branded QR Stand<span className="text-accent">.</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Design a custom, physical tabletop QR stand tailored for your business. See your live preview in real time and submit for official Ratevia verification.
        </p>
      </div>

      {restoredDraft && (
        <div className="max-w-3xl mx-auto p-4 rounded-xl border border-sky-200 bg-sky-50/80 text-sky-900 text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-accent shrink-0" />
            <span>
              {user ? (
                <>Restored your saved QR design! You're signed in as <strong>{user.email}</strong>.</>
              ) : (
                <>Your previous QR design draft has been restored. Finish customizing and submit when ready.</>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              try { localStorage.removeItem('ratevia_pending_qr_design'); } catch {}
              setRestoredDraft(false);
            }}
            className="text-xs text-sky-700 hover:text-sky-900 underline shrink-0 font-medium"
          >
            Clear draft
          </button>
        </div>
      )}

      {validationError && (
        <div className="max-w-3xl mx-auto p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Configuration Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Business Profile */}
          <Card className="p-6 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-display flex items-center gap-2 text-foreground">
                <Building2 className="h-4 w-4 text-accent" />
                1. Business Information
              </CardTitle>
              <CardDescription className="text-xs">
                Your business name will be prominently displayed on your table tent stand.
              </CardDescription>
            </CardHeader>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g., The Coffee House"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Business Tagline (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Your experience matters 💙 or Fresh coffee. Great moments."
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  maxLength={48}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Business Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={handleCategoryChange}
                    className="w-full h-11 px-3 rounded-md border border-border bg-white text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    City / Location
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Mumbai, Bangalore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Rohan Shetty"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="name@business.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Step 2: Website / Destination URL */}
          <Card className="p-6 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-display flex items-center gap-2 text-foreground">
                <Globe className="h-4 w-4 text-accent" />
                2. Website / Destination URL
              </CardTitle>
              <CardDescription className="text-xs">
                Where should customers be directed when they scan your physical QR stand?
              </CardDescription>
            </CardHeader>

            <div className="space-y-2 pt-1">
              <Input
                type="url"
                placeholder="https://g.page/r/your-review-link or https://yourwebsite.com"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                required
              />
              <p className="text-[11px] text-muted-foreground">
                You can provide your Google Review link, Instagram page, digital menu, or business website.
              </p>
            </div>
          </Card>

          {/* Step 3: QR Customization Panel */}
          <QRCustomizationPanel
            businessName={businessName}
            onBusinessNameChange={setBusinessName}
            tagline={tagline}
            onTaglineChange={setTagline}
            badgeType={badgeType}
            onBadgeTypeChange={setBadgeType}
            selectedAccent={selectedAccent}
            onSelectAccent={setSelectedAccent}
            selectedStyle={selectedStyle}
            onSelectStyle={setSelectedStyle}
            selectedMessage={selectedMessage}
            onSelectMessage={setSelectedMessage}
            categoryTheme={categoryConfig?.brandTheme}
          />

          {/* Step 4: Pricing & Submission CTA */}
          <Card className="p-6 border-accent/30 bg-gradient-to-br from-accent/5 via-white to-transparent space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                  Official Ratevia Package
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                    {priceLoading ? <Loader2 className="h-7 w-7 animate-spin text-accent inline" /> : formattedPrice}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">One-time setup fee</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Includes custom branded stand design, high-res print folios, and verified review intake.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
                className="rounded-md flex-shrink-0 text-sm font-semibold h-12 px-6 shadow-md transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Design...
                  </>
                ) : !session ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Sign In & Submit Request
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Submit QR for Approval
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            <div className="border-t border-border/80 pt-3 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Reviewed before activation
              </span>
              <span>No recurring subscription</span>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Sticky Live Preview Stand & Sticker */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4 flex flex-col items-center">
          <Card className="w-full p-5 sm:p-6 border-border shadow-lg flex flex-col items-center relative overflow-hidden bg-white/95">
            {/* Ambient Accent Glow */}
            <div
              className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ backgroundColor: brandConfig.accent.hex }}
            />

            {/* Live Preview Switcher Tabs */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-border mb-4">
              <div className="flex p-0.5 rounded-lg bg-slate-100/90 border border-slate-200/80 text-xs w-full">
                <button
                  type="button"
                  onClick={() => setPreviewMode('sticker')}
                  className={`flex-1 py-1.5 px-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    previewMode === 'sticker'
                      ? 'bg-white text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  <span>Ratevia Sticker</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 bg-accent/10 text-accent border-accent/20">
                    Live
                  </Badge>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('stand')}
                  className={`flex-1 py-1.5 px-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    previewMode === 'stand'
                      ? 'bg-white text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>Desk Stand Card</span>
                </button>
              </div>
            </div>

            {/* Live Component: Ratevia Sticker or Branded Stand Card */}
            <div className="w-full flex justify-center">
              <div className={`w-full flex justify-center ${previewMode === 'sticker' ? '' : 'hidden'}`}>
                <RateviaStickerPreview
                  businessName={businessName}
                  tagline={tagline}
                  customerUrl={livePreviewUrl}
                  config={brandConfig}
                  badgeType={badgeType}
                  qrCanvasRef={stickerCanvasRef}
                />
              </div>
              <div className={`w-full flex justify-center ${previewMode === 'stand' ? '' : 'hidden'}`}>
                <BrandedQRCard
                  business={{
                    name: businessName || 'Your Business',
                    businessType: category,
                  }}
                  customerUrl={livePreviewUrl}
                  config={brandConfig}
                  size={210}
                />
              </div>
            </div>

            {/* Scannability Note */}
            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground font-mono">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Error Correction Level H • 100% Scannable</span>
            </div>

            <p className="text-[11px] text-center text-muted-foreground mt-2 leading-relaxed">
              Scan with any mobile camera to test destination routing in real time.
            </p>
          </Card>
        </div>
      </form>

      {/* Auth Prompt Modal (Prompts user to sign in before submission) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Top decorative accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-accent via-indigo-500 to-sky-400" />

            {/* Close modal button */}
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Close and keep editing"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 sm:p-7 space-y-5">
              {/* Header */}
              <div className="space-y-1.5 text-center sm:text-left">
                <Badge variant="outline" className="text-accent bg-accent/5 border-accent/20 font-mono text-[11px] mb-1">
                  Account Required
                </Badge>
                <h3 className="font-display text-2xl font-bold text-slate-900">
                  Sign In to Submit Your Request
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your custom design for <strong>"{businessName || 'Your Business'}"</strong> is saved! Please sign in or create an account to link it to your dashboard.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* One-Click Google Sign In */}
              <button
                type="button"
                onClick={handleModalGoogleLogin}
                disabled={authGoogleLoading || authLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {authGoogleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
                ) : (
                  <GoogleIcon className="h-5 w-5" />
                )}
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-mono uppercase text-slate-400 shrink-0">
                  Or use email
                </span>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(null); }}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${
                    authMode === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                  className={`flex-1 py-1.5 rounded-md font-semibold transition-all ${
                    authMode === 'signup'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Email Form */}
              <form onSubmit={handleModalEmailAuth} className="space-y-3.5">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Your Full Name</label>
                    <Input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">Password</label>
                    {authMode === 'login' && (
                      <Link
                        to="/login"
                        className="text-[11px] text-accent hover:underline"
                        onClick={() => saveDesignDraft()}
                      >
                        Forgot?
                      </Link>
                    )}
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-11 text-sm font-semibold rounded-xl shadow-md"
                  disabled={authLoading || authGoogleLoading}
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {authMode === 'login' ? 'Signing in & submitting...' : 'Creating account & submitting...'}
                    </>
                  ) : (
                    <>
                      {authMode === 'login' ? 'Sign In & Submit Request' : 'Create Account & Submit Request'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="pt-2 text-center text-xs text-slate-500 flex items-center justify-center gap-1">
                <span>Want to change your design?</span>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="text-accent font-semibold hover:underline"
                >
                  Keep Editing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicQRCustomizePage;
