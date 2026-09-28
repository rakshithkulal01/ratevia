import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Download, Printer, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { exportBrandedQRPNG, exportBrandedQRSVG } from '../../utils/qrBrandUtils';

/**
 * QRDownloadActions
 * Download buttons for High-Res PNG, Vector SVG, Direct Print, and Copy Link.
 */
export const QRDownloadActions = ({
  business,
  config,
  customerUrl,
  qrCanvasRef,
  onCopyLink,
  copied,
}) => {
  const [downloadingPNG, setDownloadingPNG] = useState(false);
  const [downloadingSVG, setDownloadingSVG] = useState(false);

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
      const svgElement = document.getElementById('ratevia-branded-qr-svg');
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
      <div className="grid grid-cols-2 gap-2.5">
        <Button
          variant="primary"
          size="md"
          onClick={handleDownloadPNG}
          disabled={downloadingPNG}
          className="flex items-center justify-center gap-2 text-xs font-semibold shadow-xs"
          title="Download High-Resolution PNG for printing or sharing on WhatsApp"
        >
          <Download className="h-4 w-4" />
          {downloadingPNG ? 'Generating...' : 'Download PNG'}
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={handleDownloadSVG}
          disabled={downloadingSVG}
          className="flex items-center justify-center gap-2 text-xs font-semibold"
          title="Download Lossless Vector SVG for professional printing and designers"
        >
          <Download className="h-4 w-4" />
          {downloadingSVG ? 'Generating...' : 'Download SVG'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Printer className="h-3.5 w-3.5 text-accent" />
          Print Table Stand
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onCopyLink}
          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied Link' : 'Copy URL'}
        </Button>
      </div>
    </div>
  );
};
