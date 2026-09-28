import React from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Power, Sparkles, ShieldCheck } from 'lucide-react';

/**
 * BrandedQRCard
 * Physical Desk Stand / Table Tent preview component.
 * Renders a business-specific, scannable QR code embedded with the business initials badge.
 */
export const BrandedQRCard = React.forwardRef(
  (
    {
      business,
      customerUrl,
      config,
      isPaused = false,
      size = 240,
      className = '',
      showStandShadow = true,
      qrCanvasRef,
    },
    ref
  ) => {
    const CategoryIcon = config?.category?.icon;
    const businessName = business?.name || 'Your Business';
    const categoryName = config?.category?.displayName || business?.businessType || 'Local Business';
    const initials = config?.initials || 'RV';
    const accent = config?.accent;

    return (
      <div
        ref={ref}
        id="branded-qr-card-container"
        className={`relative w-full max-w-[340px] sm:max-w-[360px] mx-auto bg-white rounded-2xl border border-slate-200/90 overflow-hidden transition-all duration-300 ${
          showStandShadow ? 'shadow-xl shadow-slate-900/10' : ''
        } ${className}`}
        style={{
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
        }}
      >
        {/* Top Brand Accent Line */}
        <div
          className="h-2 w-full transition-colors duration-300"
          style={{
            background: `linear-gradient(90deg, ${accent?.hex || '#0052FF'} 0%, ${
              accent?.secondaryHex || '#4D7CFF'
            } 100%)`,
          }}
        />

        <div className="p-6 sm:p-7 flex flex-col items-center text-center space-y-5">
          {/* Category Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-200"
            style={{
              backgroundColor: accent?.lightBg || '#F8FAFC',
              borderColor: accent?.border || '#E2E8F0',
              color: accent?.badgeText || '#0F172A',
            }}
          >
            {CategoryIcon && <CategoryIcon className="h-3.5 w-3.5 flex-shrink-0" />}
            <span className="font-mono text-[11px] tracking-wide uppercase">{categoryName}</span>
          </div>

          {/* Business Name - Scaled with line clamping */}
          <div className="space-y-1 w-full px-2">
            <h2
              className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 uppercase leading-snug line-clamp-2"
              title={businessName}
            >
              {businessName}
            </h2>
            {config?.category?.brandTheme?.tagline && (
              <p className="text-[11px] font-sans text-slate-500 font-normal truncate">
                {config.category.brandTheme.tagline}
              </p>
            )}
          </div>

          {/* QR Code Container with Center Initials Badge */}
          <div className="relative p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-slate-100 shadow-xs transition-transform duration-300 hover:scale-[1.01]">
            <QRCodeSVG
              id="ratevia-branded-qr-svg"
              value={customerUrl || 'https://ratevia.com'}
              size={size}
              level="H"
              fgColor={config?.style?.fgColor || '#0F172A'}
              bgColor="#FFFFFF"
              includeMargin={false}
              imageSettings={{
                src: config?.badgeSvgUri,
                height: Math.round(size * 0.22),
                width: Math.round(size * 0.22),
                excavate: true,
              }}
              title={`Ratevia QR code for ${businessName}`}
              aria-label={`Ratevia QR code for ${businessName}`}
            />

            {/* Hidden High-Res Canvas for PNG Generation */}
            {qrCanvasRef && (
              <div ref={qrCanvasRef} className="hidden" aria-hidden="true">
                <QRCodeCanvas
                  value={customerUrl || 'https://ratevia.com'}
                  size={1024}
                  level="H"
                  fgColor={config?.style?.fgColor || '#0F172A'}
                  bgColor="#FFFFFF"
                  includeMargin={false}
                  imageSettings={{
                    src: config?.badgeSvgUri,
                    height: 225,
                    width: 225,
                    excavate: true,
                  }}
                />
              </div>
            )}

            {/* Paused Overlay */}
            {isPaused && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-4 text-white text-center space-y-2">
                <Power className="h-7 w-7 text-amber-400" />
                <span className="font-semibold text-xs tracking-wide">Feedback Paused</span>
                <span className="text-[10px] text-slate-300 leading-tight max-w-[180px]">
                  Scans currently display a maintenance notice.
                </span>
              </div>
            )}
          </div>

          {/* Call to Action Message */}
          <div className="space-y-1 max-w-[260px]">
            <p className="font-sans font-semibold text-sm sm:text-base text-slate-800 leading-snug">
              {config?.message || 'Scan to share your experience'}
            </p>
            <p className="text-[11px] text-slate-400 font-sans">
              Takes less than 30 seconds
            </p>
          </div>

          {/* Card Footer: Subtle Ratevia Brand Verification */}
          <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent?.hex || '#0052FF' }} />
            <span className="font-mono text-[10px] tracking-widest uppercase font-semibold text-slate-500">
              POWERED BY RATEVIA
            </span>
          </div>
        </div>
      </div>
    );
  }
);

BrandedQRCard.displayName = 'BrandedQRCard';
