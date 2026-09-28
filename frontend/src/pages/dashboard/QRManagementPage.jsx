import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BrandedQRCard } from '../../components/dashboard/BrandedQRCard';
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
      setQrCode(data.qrCode);
      setCustomerUrl(data.customerUrl);

      // Initialize default category accent
      if (data.business?.businessType) {
        const defaultAccent = getCategoryDefaultAccent(data.business.businessType);
        setSelectedAccent(defaultAccent);
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
    business,
    categoryKey: business?.businessType,
    selectedAccent,
    selectedStyle,
    selectedMessage,
  });

  return (
    <DashboardLayout activeTab="qr code">
      {/* Print-specific stylesheet isolating the card for physical stand printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-branded-qr-card, #print-branded-qr-card * {
            visibility: visible !important;
          }
          #print-branded-qr-card {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) scale(1.15) !important;
            box-shadow: none !important;
            border: 2px solid #CBD5E1 !important;
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
          {/* LEFT COLUMN: Section 2 — Live Branded QR Stand Preview & Downloads */}
          <div className="lg:col-span-5 flex flex-col items-center space-y-4">
            <Card className="w-full p-6 sm:p-7 border-border shadow-md flex flex-col items-center relative overflow-hidden bg-white/95">
              {/* Subtle Ambient Glow */}
              <div
                className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20"
                style={{ backgroundColor: brandConfig.accent.hex }}
              />

              {/* Physical Stand Card Preview */}
              <div id="print-branded-qr-card" className="w-full flex justify-center">
                <BrandedQRCard
                  business={business}
                  customerUrl={customerUrl}
                  config={brandConfig}
                  isPaused={!isActive}
                  qrCanvasRef={qrCanvasRef}
                  size={210}
                />
              </div>

              {/* Quality & Scannability Badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Error Correction Level H • 100% Scannable</span>
              </div>

              {/* Download & Print Actions */}
              <QRDownloadActions
                business={business}
                config={brandConfig}
                customerUrl={customerUrl}
                qrCanvasRef={qrCanvasRef}
                onCopyLink={handleCopyLink}
                copied={copied}
              />
            </Card>
          </div>

          {/* RIGHT COLUMN: Section 3 — Customization & Deployment Settings */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customization Panel */}
            <QRCustomizationPanel
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
