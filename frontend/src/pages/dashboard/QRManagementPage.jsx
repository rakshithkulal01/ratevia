import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BrandedQRCard } from '../../components/dashboard/BrandedQRCard';
import { RateviaStickerPreview } from '../../components/dashboard/RateviaStickerPreview';
import { QRCustomizationPanel } from '../../components/dashboard/QRCustomizationPanel';
import { QRBusinessHeader } from '../../components/dashboard/QRBusinessHeader';
import { QRDownloadActions } from '../../components/dashboard/QRDownloadActions';
import {
  getQRBrandConfig,
  getCategoryDefaultAccent,
  DEFAULT_QR_MESSAGE,
} from '../../utils/qrBrandUtils';
import { getCategoryConfig } from '../../config/businessCategories';
import {
  ExternalLink,
  RefreshCw,
  Printer,
  AlertCircle,
  Loader2,
  Check,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const QRManagementPage = () => {
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [customerUrl, setCustomerUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  // Curated Branding Customization State (Instant Live Preview)
  const [customBusinessName, setCustomBusinessName] = useState('');
  const [customTagline, setCustomTagline] = useState('Your experience matters 💙');
  const [badgeType, setBadgeType] = useState('sparkle');
  const [previewMode, setPreviewMode] = useState('sticker'); // 'sticker' | 'stand'
  const [selectedAccent, setSelectedAccent] = useState('ratevia-blue');
  const [selectedStyle, setSelectedStyle] = useState('classic');
  const [selectedMessage, setSelectedMessage] = useState(DEFAULT_QR_MESSAGE);

  const qrCanvasRef = useRef(null);

  // Fetch active QR configuration
  const fetchQRData = async () => {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/qr`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 404) {
          setError('No active business profile found. Please complete onboarding first.');
          return;
        }
        throw new Error('Failed to load QR code settings.');
      }

      const data = await res.json();
      setBusiness(data.business);
      setCustomBusinessName(data.business?.name || '');
      setQrCode(data.qrCode);
      setCustomerUrl(data.customerUrl);

      // Initialize default category accent and suggested tagline
      if (data.business?.businessType) {
        const defaultAccent = getCategoryDefaultAccent(data.business.businessType);
        setSelectedAccent(defaultAccent);
        const catConfig = getCategoryConfig(data.business.businessType);
        if (catConfig?.brandTheme?.tagline) {
          setCustomTagline(catConfig.brandTheme.tagline);
        }
      }
    } catch (err) {
      console.error('[QRManagement] Fetch error:', err);
      setError(err.message || 'Error loading QR code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRData();
  }, [session]);

  // Copy customer review URL to clipboard
  const handleCopyLink = async () => {
    if (!customerUrl) return;
    try {
      await navigator.clipboard.writeText(customerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Toggle active/inactive QR status
  const handleToggleStatus = async () => {
    if (toggling) return;
    try {
      setToggling(true);
      setStatusMessage(null);
      const res = await fetch(`${API_URL}/api/qr/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to toggle QR status.');

      setQrCode(data.qrCode);
      setStatusMessage(data.message);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('[QRManagement] Toggle error:', err);
      setError(err.message);
    } finally {
      setToggling(false);
    }
  };

  // Regenerate QR code
  const handleRegenerate = async () => {
    const confirm = window.confirm(
      'Are you sure you want to regenerate this QR code? Existing printed materials will point to the new identifier.'
    );
    if (!confirm) return;

    try {
      setRegenerating(true);
      setStatusMessage(null);
      const res = await fetch(`${API_URL}/api/qr/regenerate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to regenerate QR code.');

      setQrCode(data.qrCode);
      setStatusMessage('QR code successfully regenerated.');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('[QRManagement] Regenerate error:', err);
      setError(err.message);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">Loading branded QR configuration...</p>
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-4">
          <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
          <h2 className="font-display text-2xl text-foreground">No Business Found</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Link to="/onboarding">
            <Button variant="primary" className="w-full">
              Complete Onboarding
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isActive = qrCode?.active ?? true;
  const categoryConfig = getCategoryConfig(business?.businessType);
  const brandConfig = getQRBrandConfig({
    business: {
      ...business,
      name: customBusinessName || business?.name,
    },
    categoryKey: business?.businessType,
    selectedAccent,
    selectedStyle,
    selectedMessage,
  });

  return (
    <DashboardLayout activeTab="qr code">
      {/* Print-specific stylesheet isolating the active preview for physical printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-preview-container, #print-preview-container * {
            visibility: visible !important;
          }
          #print-preview-container {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      <div className="space-y-8">
        {/* Section 1: Business Identity & Intake Header */}
        <QRBusinessHeader
          business={business}
          category={categoryConfig}
          isActive={isActive}
          toggling={toggling}
          onToggleStatus={handleToggleStatus}
        />

        {/* Status Notification */}
        {statusMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-3 animate-in fade-in">
            <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* LEFT COLUMN: Section 2 — Real-Time Ratevia Sticker Preview & Downloads */}
          <div className="lg:col-span-5 flex flex-col items-center space-y-4">
            <Card className="w-full p-5 sm:p-6 border-border shadow-md flex flex-col items-center relative overflow-hidden bg-white/95">
              {/* Ambient Accent Glow */}
              <div
                className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20"
                style={{ backgroundColor: brandConfig.accent.hex }}
              />

              {/* Preview Format Switcher Tabs */}
              <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-border">
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

              {/* Physical Preview Component (Sticker or Stand Card) */}
              <div id="print-preview-container" className="w-full flex justify-center">
                {previewMode === 'sticker' ? (
                  <RateviaStickerPreview
                    businessName={customBusinessName || business?.name}
                    tagline={customTagline}
                    customerUrl={customerUrl}
                    config={brandConfig}
                    isPaused={!isActive}
                    badgeType={badgeType}
                    qrCanvasRef={qrCanvasRef}
                  />
                ) : (
                  <BrandedQRCard
                    business={{ ...business, name: customBusinessName || business?.name }}
                    customerUrl={customerUrl}
                    config={brandConfig}
                    isPaused={!isActive}
                    qrCanvasRef={qrCanvasRef}
                    size={210}
                  />
                )}
              </div>

              {/* Quality & Scannability Badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Error Correction Level H • 100% Scannable</span>
              </div>

              {/* Download & Print Actions (Sticker PNG, Stand SVG, Print, URL) */}
              <QRDownloadActions
                business={business}
                config={brandConfig}
                customerUrl={customerUrl}
                qrCanvasRef={qrCanvasRef}
                customBusinessName={customBusinessName}
                tagline={customTagline}
                badgeType={badgeType}
                activePreviewTab={previewMode}
                onCopyLink={handleCopyLink}
                copied={copied}
              />
            </Card>
          </div>

          {/* RIGHT COLUMN: Section 3 — Customization & Deployment Settings */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customization Panel */}
            <QRCustomizationPanel
              businessName={customBusinessName}
              onBusinessNameChange={setCustomBusinessName}
              tagline={customTagline}
              onTaglineChange={setCustomTagline}
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

            {/* Smart Routing Review URL Box */}
            <Card className="p-6 space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="text-lg font-display">Customer Review URL</CardTitle>
                <CardDescription className="text-xs">
                  The verified destination encoded into your QR code. It captures genuine feedback before routing happy customers to Google.
                </CardDescription>
              </CardHeader>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <div className="flex-1 rounded-xl border border-border bg-muted/40 px-4 py-2.5 font-mono text-xs sm:text-sm text-foreground select-all truncate">
                  {customerUrl}
                </div>
                <a
                  href={customerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button variant="outline" size="md" className="flex items-center justify-center gap-1.5 text-xs">
                    <ExternalLink className="h-3.5 w-3.5" /> Visit Live
                  </Button>
                </a>
              </div>
            </Card>

            {/* Table Tent / Display Recommendations */}
            <Card className="p-6 space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Printer className="h-4 w-4 text-accent" />
                  Print & Display Placement Recommendations
                </CardTitle>
                <CardDescription className="text-xs">
                  Proven placement strategies that maximize customer review collection:
                </CardDescription>
              </CardHeader>

              <div className="grid gap-3 sm:grid-cols-2 pt-1 text-xs text-muted-foreground leading-relaxed">
                <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
                  <span className="font-semibold text-foreground text-xs block">Table Tents & Acrylic Stands</span>
                  Place 4x6" clear acrylic stands on dining tables, counters, or café bar tops where customers dwell.
                </div>
                <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
                  <span className="font-semibold text-foreground text-xs block">Receipts & Bill Folios</span>
                  Print the high-resolution PNG on the bottom of guest checks or bill presentation folders.
                </div>
                <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
                  <span className="font-semibold text-foreground text-xs block">Checkout Counter Sticker</span>
                  Place a 3x3" vinyl sticker near point-of-sale terminals or pickup stations.
                </div>
                <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
                  <span className="font-semibold text-foreground text-xs block">Hotel Keycard / In-Room</span>
                  Place QR cards on bedside stands or inside check-in welcome folios.
                </div>
              </div>
            </Card>

            {/* Maintenance / Regenerate QR Card */}
            <Card className="p-5 border-dashed border-border/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Regenerate QR Identifier</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Generates a new unique QR code record while preserving your business slug and review history.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="text-xs flex items-center gap-1.5 flex-shrink-0"
                >
                  {regenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Regenerate QR
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
