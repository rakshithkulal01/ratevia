import React from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Power, Sparkles, ShieldCheck } from 'lucide-react';
import { generateCenterSparkleSvgUri } from '../../utils/qrBrandUtils';

/**
 * RateviaStickerPreview
 * Pixel-accurate, responsive live Ratevia sticker preview.
 * Fixed artwork remains identical to the provided product design,
 * while the QR code, Business Name, and Tagline update in real time.
 */
export const RateviaStickerPreview = React.forwardRef(
  (
    {
      businessName = '',
      tagline = '',
      customerUrl = 'https://ratevia.in',
      config,
      isPaused = false,
      badgeType = 'sparkle', // 'sparkle' | 'initials'
      qrCanvasRef,
      className = '',
      showShadow = true,
      id = 'print-sticker-container',
    },
    ref
  ) => {
    const rawName = (businessName || '').trim();
    const hasName = rawName.length > 0;
    const displayName = hasName ? rawName.toUpperCase() : '';
    const cleanTagline = (tagline || '').trim();

    const accentHex = config?.accent?.hex || '#0052FF';
    const fgColor = config?.style?.fgColor || '#0A1C3C';

    // Badge URI: Sparkle matching exact sticker design or Initials monogram
    const badgeSvgUri =
      badgeType === 'initials'
        ? config?.badgeSvgUri
        : generateCenterSparkleSvgUri(accentHex);

    // Dynamic font-size calculation for business name based on character length
    // Coordinates relative to 682x1024 container width (cqw)
    const getNameFontSize = (text) => {
      const len = text.length;
      if (len <= 10) return 'clamp(14px, 5.6cqw, 24px)';
      if (len <= 16) return 'clamp(12px, 4.8cqw, 20px)';
      if (len <= 24) return 'clamp(11px, 4.0cqw, 17px)';
      if (len <= 34) return 'clamp(10px, 3.4cqw, 14px)';
      return 'clamp(9px, 2.9cqw, 12px)';
    };

    return (
      <div
        ref={ref}
        id={id}
        className={`relative w-full max-w-[340px] sm:max-w-[370px] mx-auto aspect-[682/1024] rounded-[28px] overflow-hidden select-none transition-all duration-300 @container ${
          showShadow ? 'shadow-2xl shadow-blue-950/15 ring-1 ring-slate-900/5' : ''
        } ${className}`}
        style={{
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Layer 1: Fixed Clean Sticker Background (100% identical to provided artwork) */}
        <img
          src="/ratevia_sticker_clean.png"
          alt="Ratevia Branded Sticker Template"
          width="682"
          height="1024"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none block"
          loading="eager"
          decoding="async"
        />

        {/* Layer 2: Dynamic Business Name Overlay (flanked by fixed ✦ stars) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-center pointer-events-none px-1"
          style={{
            top: '13.5%',
            width: '61%',
            maxHeight: '9%',
          }}
        >
          {hasName ? (
            <h2
              className="font-display font-bold uppercase tracking-wider text-[#062464] leading-[1.15] line-clamp-2 drop-shadow-xs"
              style={{
                fontSize: getNameFontSize(displayName),
                letterSpacing: displayName.length > 20 ? '0.02em' : '0.06em',
              }}
              title={displayName}
            >
              {displayName}
            </h2>
          ) : (
            <span
              className="font-display font-medium uppercase tracking-wider text-[#062464]/30 leading-tight"
              style={{ fontSize: 'clamp(11px, 4.2cqw, 16px)' }}
            >
              YOUR BUSINESS
            </span>
          )}
        </div>

        {/* Layer 3: Dynamic Business Tagline Overlay */}
        {cleanTagline ? (
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-center pointer-events-none px-2"
            style={{
              top: '19.0%',
              width: '68%',
              maxHeight: '4.5%',
            }}
          >
            <p
              className="font-sans font-medium text-[#334155] leading-none truncate"
              style={{
                fontSize: cleanTagline.length > 28 ? 'clamp(9px, 2.3cqw, 11px)' : 'clamp(10px, 2.7cqw, 13px)',
              }}
              title={cleanTagline}
            >
              {cleanTagline}
            </p>
          </div>
        ) : null}

        {/* Layer 4: Dynamic Scannable QR Code Overlay (inside blue-bordered QR frame) */}
        <div
          className="absolute flex items-center justify-center pointer-events-none"
          style={{
            left: '31.38%',
            top: '23.24%',
            width: '37.24%',
            height: '23.05%',
          }}
        >
          <div className="w-[88%] h-[88%] flex items-center justify-center p-1 bg-white rounded-xl shadow-xs transition-transform duration-200">
            <QRCodeSVG
              id="ratevia-sticker-qr-svg"
              value={customerUrl || 'https://ratevia.in'}
              size={210}
              level="H"
              fgColor={fgColor}
              bgColor="#FFFFFF"
              includeMargin={false}
              className="w-full h-full max-w-full max-h-full block"
              imageSettings={{
                src: badgeSvgUri,
                height: Math.round(210 * 0.22),
                width: Math.round(210 * 0.22),
                excavate: true,
              }}
              title={`Ratevia QR code for ${displayName || 'Business'}`}
              aria-label={`Ratevia QR code for ${displayName || 'Business'}`}
            />
          </div>

          {/* Feedback Paused Status Overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center text-white text-center p-2 space-y-1 animate-in fade-in">
              <Power className="h-5 w-5 text-amber-400" />
              <span className="text-[10px] font-semibold tracking-wide">Paused</span>
            </div>
          )}
        </div>

        {/* Hidden High-Resolution Canvas for Ultra-Crisp PNG Export (1024x1024) */}
        {qrCanvasRef && (
          <div ref={qrCanvasRef} className="hidden" aria-hidden="true">
            <QRCodeCanvas
              value={customerUrl || 'https://ratevia.in'}
              size={1024}
              level="H"
              fgColor={fgColor}
              bgColor="#FFFFFF"
              includeMargin={false}
              imageSettings={{
                src: badgeSvgUri,
                height: 225,
                width: 225,
                excavate: true,
              }}
            />
          </div>
        )}
      </div>
    );
  }
);

RateviaStickerPreview.displayName = 'RateviaStickerPreview';
