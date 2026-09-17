import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  QrCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Power,
  Sparkles,
  Printer,
  AlertCircle,
  Loader2,
  Share2
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
          setError('No active business found. Please complete onboarding first.');
          return;
        }
        throw new Error('Failed to load QR code settings.');
      }

      const data = await res.json();
      setBusiness(data.business);
      setQrCode(data.qrCode);
      setCustomerUrl(data.customerUrl);
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

  // Download High-Resolution Print PNG (1024x1024 with branded card)
  const handleDownloadPNG = () => {
    const canvas = qrCanvasRef.current?.querySelector('canvas');
    if (!canvas) return;

    // Create a high resolution 1024x1024 export canvas for crisp physical printing
    const exportCanvas = document.createElement('canvas');
    const size = 1024;
    exportCanvas.width = size;
    exportCanvas.height = size;
    const ctx = exportCanvas.getContext('2d');

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.roundRect(0, 0, size, size, 32);
    ctx.fill();

    // Subtle border
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 4;
    ctx.roundRect(4, 4, size - 8, size - 8, 32);
    ctx.stroke();

    // Draw QR code centered
    const qrSize = 720;
    const qrX = (size - qrSize) / 2;
    const qrY = 70;
    ctx.drawImage(canvas, qrX, qrY, qrSize, qrSize);

    // Draw Business Name
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 44px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(business?.name || 'Ratevia Review', size / 2, 855);

    // Draw Call to Action
    ctx.fillStyle = '#0052FF';
    ctx.font = '600 28px Inter, sans-serif';
    ctx.fillText('Scan to Share Your Experience', size / 2, 915);

    const link = document.createElement('a');
    link.download = `${business?.slug || 'ratevia'}-review-qr.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  // Download Lossless Vector SVG
  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('ratevia-qr-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = `${business?.slug || 'ratevia'}-review-qr.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">Loading QR code configuration...</p>
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

  const isActive = qrCode?.active;

  return (
    <DashboardLayout activeTab="qr code">
      <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
        <div>
          <Badge dot pulse={isActive} variant={isActive ? 'accent' : 'muted'}>
            {isActive ? 'Live Review Intake' : 'Intake Paused'}
          </Badge>
          <h1 className="font-display text-3xl sm:text-4xl text-foreground mt-2">
            QR Code Management<span className="text-accent">.</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Display this QR code at checkout, on receipts, or on table tents to guide customers to leave reviews.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={isActive ? 'outline' : 'primary'}
            size="sm"
            onClick={handleToggleStatus}
            disabled={toggling}
            className="flex items-center gap-2"
          >
            {toggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Power className={`h-4 w-4 ${isActive ? 'text-amber-500' : 'text-white'}`} />
            )}
            {isActive ? 'Pause QR Reviews' : 'Activate QR Reviews'}
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: QR Code Showcase & Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <Card className="w-full text-center p-8 border-border shadow-lg flex flex-col items-center relative overflow-hidden bg-white">
            {/* Ambient Accent Glow */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

            {/* QR Card Container */}
            <div className="p-5 rounded-3xl border-2 border-border/80 bg-white shadow-md relative transition-all duration-300 hover:shadow-xl hover:border-accent/40">
              {/* Visible SVG QR */}
              <QRCodeSVG
                id="ratevia-qr-svg"
                value={customerUrl || 'https://ratevia.com'}
                size={240}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: '/vite.svg',
                  x: undefined,
                  y: undefined,
                  height: 36,
                  width: 36,
                  excavate: true,
                }}
              />

              {/* Hidden Canvas for High-Resolution PNG Export */}
              <div ref={qrCanvasRef} className="hidden">
                <QRCodeCanvas
                  value={customerUrl || 'https://ratevia.com'}
                  size={1024}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {!isActive && (
                <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-4 text-white space-y-2">
                  <Power className="h-8 w-8 text-amber-400" />
                  <span className="font-semibold text-sm">QR Code Paused</span>
                  <span className="text-xs text-slate-300 text-center">
                    Customers will see a temporary maintenance message.
                  </span>
                </div>
              )}
            </div>

            {/* Business Badge */}
            <div className="mt-6 space-y-1">
              <h3 className="font-display text-2xl text-foreground">{business?.name}</h3>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                {business?.businessType} • Ratevia Smart QR
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 w-full mt-6 pt-6 border-t border-border">
              <Button
                variant="primary"
                size="md"
                onClick={handleDownloadPNG}
                className="flex items-center justify-center gap-2 text-xs"
              >
                <Download className="h-4 w-4" /> Download PNG
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleDownloadSVG}
                className="flex items-center justify-center gap-2 text-xs"
              >
                <Download className="h-4 w-4" /> Download SVG
              </Button>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: URL & Distribution Settings */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Route Box */}
          <Card className="p-6 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-xl font-display">Customer Review URL</CardTitle>
              <CardDescription>
                This is the smart routing link embedded in your QR code. It captures genuine feedback before opening Google.
              </CardDescription>
            </CardHeader>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
              <div className="flex-1 rounded-xl border border-border bg-muted/40 px-4 py-3 font-mono text-xs sm:text-sm text-foreground select-all truncate">
                {customerUrl}
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 flex-shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              <a
                href={customerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button variant="outline" size="md" className="flex items-center justify-center gap-1">
                  <ExternalLink className="h-4 w-4" /> Visit
                </Button>
              </a>
            </div>
          </Card>

          {/* Table Tent / Display Recommendations */}
          <Card className="p-6 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-xl font-display flex items-center gap-2">
                <Printer className="h-5 w-5 text-accent" />
                Display & Printing Recommendations
              </CardTitle>
              <CardDescription>
                Where to place your QR code to maximize scan rates and review submissions:
              </CardDescription>
            </CardHeader>

            <div className="grid gap-3 sm:grid-cols-2 pt-1 text-xs text-muted-foreground leading-relaxed">
              <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
                <span className="font-semibold text-foreground text-sm block">Table Tents & Stands</span>
                Place 4x6" acrylic stands on dining tables, counters, or café bar tops where customers spend dwell time.
              </div>
              <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
                <span className="font-semibold text-foreground text-sm block">Receipts & Folders</span>
                Print the high-resolution PNG on the bottom of guest checks or bill presentation folios.
              </div>
              <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
                <span className="font-semibold text-foreground text-sm block">Checkout Counter Sticker</span>
                Place a 3x3" vinyl sticker near point-of-sale terminals or pickup stations.
              </div>
              <div className="rounded-xl border border-border bg-background p-3.5 space-y-1">
                <span className="font-semibold text-foreground text-sm block">Hotel Keycard / In-Room</span>
                Place QR cards on bedside stands or inside check-in welcome packets.
              </div>
            </div>
          </Card>

          {/* Advanced / Maintenance */}
          <Card className="p-6 space-y-4 border-dashed border-border/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-foreground text-sm">Regenerate QR Code</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Creates a new unique QR code record while keeping your business slug intact.
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
