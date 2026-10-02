import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Download, Printer, Copy, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import {
  exportBrandedQRPNG,
  exportBrandedQRSVG,
  exportRateviaStickerPNG,
} from '../../utils/qrBrandUtils';

/**
 * QRDownloadActions
 * Download and print actions for the Complete Customized Ratevia Sticker,
 * standalone high-res QR PNG, Vector SVG, and Review URL copy.
 */
export const QRDownloadActions = ({
  business,
  config,
  customerUrl,
  qrCanvasRef,
  customBusinessName,
  tagline,
  badgeType = 'sparkle',
  activePreviewTab = 'sticker',
  onCopyLink,
  copied,
}) => {
  const [downloadingSticker, setDownloadingSticker] = useState(false);
  const [downloadingPNG, setDownloadingPNG] = useState(false);
  const [downloadingSVG, setDownloadingSVG] = useState(false);

  const handleDownloadSticker = async () => {
    try {
      setDownloadingSticker(true);
      const canvas = qrCanvasRef?.current?.querySelector('canvas');
      await exportRateviaStickerPNG({
        businessName: customBusinessName || business?.name,
        tagline,
        customerUrl,
        config,
        qrCanvas: canvas,
        badgeType,
        slug: business?.slug,
      });
    } catch (err) {
      console.error('[QRDownloadActions] Sticker export error:', err);
      alert('Could not generate sticker export: ' + (err.message || 'Unknown error'));
    } finally {
      setTimeout(() => setDownloadingSticker(false), 600);
    }
  };

  const handleDownloadPNG = () => {
    try {
      setDownloadingPNG(true);
      const canvas = qrCanvasRef?.current?.querySelector('canvas');
      exportBrandedQRPNG({
        business,
        qrCanvas: canvas,
        config,
      });
    } catch (err) {
      console.error('[QRDownloadActions] PNG export error:', err);
    } finally {
      setTimeout(() => setDownloadingPNG(false), 600);
    }
  };

  const handleDownloadSVG = () => {
    try {
      setDownloadingSVG(true);
      const svgElement =
        document.getElementById('ratevia-sticker-qr-svg') ||
        document.getElementById('ratevia-branded-qr-svg');
      exportBrandedQRSVG({
        business,
        config,
        qrSvgElement: svgElement,
      });
    } catch (err) {
      console.error('[QRDownloadActions] SVG export error:', err);
    } finally {
      setTimeout(() => setDownloadingSVG(false), 600);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-3 pt-4 border-t border-border">
      {/* 1. Primary Highlighted Action: Complete Customized Ratevia Sticker */}
      <Button
        variant="primary"
        size="md"
        onClick={handleDownloadSticker}
        disabled={downloadingSticker}
        className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold shadow-md bg-gradient-to-r from-accent to-accent-secondary hover:brightness-105 transition-all"
        title="Download complete high-resolution print-ready Ratevia sticker with your name, tagline, and customized QR code"
      >
        <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
        <span>{downloadingSticker ? 'Generating Sticker PNG...' : 'Download Ratevia Sticker (PNG)'}</span>
      </Button>

      {/* 2. Secondary QR Code Only Exports */}
      <div className="grid grid-cols-2 gap-2.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownloadPNG}
          disabled={downloadingPNG}
          className="flex items-center justify-center gap-1.5 text-xs font-semibold"
          title="Download standalone high-resolution QR PNG (for posters, menus, or digital sharing)"
        >
          <Download className="h-3.5 w-3.5" />
          <span>{downloadingPNG ? 'Exporting...' : 'QR Only (PNG)'}</span>
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownloadSVG}
          disabled={downloadingSVG}
          className="flex items-center justify-center gap-1.5 text-xs font-semibold"
          title="Download Lossless Vector SVG for professional printing and signage"
        >
          <Download className="h-3.5 w-3.5" />
          <span>{downloadingSVG ? 'Exporting...' : 'Lossless SVG'}</span>
        </Button>
      </div>

      {/* 3. Utility actions */}
      <div className="grid grid-cols-2 gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          title="Print physical sticker / desk stand"
        >
          <Printer className="h-3.5 w-3.5 text-accent" />
          <span>{activePreviewTab === 'sticker' ? 'Print Sticker' : 'Print Stand Card'}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onCopyLink}
          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          title="Copy customer review intake URL"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Copied Link' : 'Copy URL'}</span>
        </Button>
      </div>
    </div>
  );
};
