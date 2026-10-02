import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import {
  QR_ACCENTS,
  QR_STYLES,
} from '../../utils/qrBrandUtils';
import {
  Check,
  Palette,
  Sliders,
  Building2,
  Sparkles,
  Quote,
  Type,
} from 'lucide-react';

const SUGGESTED_TAGLINES = [
  'Your experience matters 💙',
  'Fresh coffee. Great moments.',
  'Rate your experience ★★★★★',
  'Help us grow with honest feedback',
];

/**
 * QRCustomizationPanel
 * Provides curated, real-time visual customization options for the Branded QR code
 * and Ratevia sticker preview (Business Name, Tagline, Logo Badge, Brand Accent, Geometry Style).
 * All changes apply immediately to the live preview without requiring a page reload.
 */
export const QRCustomizationPanel = ({
  businessName = '',
  onBusinessNameChange,
  tagline = '',
  onTaglineChange,
  badgeType = 'sparkle',
  onBadgeTypeChange,
  selectedAccent,
  onSelectAccent,
  selectedStyle,
  onSelectStyle,
  selectedMessage,
  onSelectMessage,
  categoryTheme,
}) => {
  return (
    <Card className="p-6 space-y-6">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2 text-foreground">
            <Sliders className="h-5 w-5 text-accent" />
            Sticker & QR Customization
          </CardTitle>
          {categoryTheme && (
            <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full border border-border">
              Theme: {categoryTheme.mood}
            </span>
          )}
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          Fine-tune your Ratevia sticker identity and print-safe QR design. Updates reflect in real time.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 space-y-5">
        {/* 1. Dynamic Business Identity (Name & Tagline) */}
        <div className="space-y-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider font-mono">
            <Building2 className="h-3.5 w-3.5 text-accent" />
            1. Sticker Business Identity
          </label>

          {/* Business Name Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">Business Name</span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {businessName.length}/32 chars
              </span>
            </div>
            <Input
              type="text"
              value={businessName}
              onChange={(e) => onBusinessNameChange && onBusinessNameChange(e.target.value)}
              placeholder="e.g. Halo Cafe"
              maxLength={32}
              className="bg-white text-xs sm:text-sm font-medium"
            />
            <p className="text-[11px] text-muted-foreground">
              Appears on the sticker header flanked by the blue ✦ stars.
            </p>
          </div>

          {/* Business Tagline Input */}
          <div className="space-y-1.5 pt-1.5 border-t border-slate-200/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 flex items-center gap-1">
                <Quote className="h-3 w-3 text-slate-400" />
                Business Tagline (Optional)
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {tagline.length}/48 chars
              </span>
            </div>
            <Input
              type="text"
              value={tagline}
              onChange={(e) => onTaglineChange && onTaglineChange(e.target.value)}
              placeholder="e.g. Your experience matters 💙"
              maxLength={48}
              className="bg-white text-xs sm:text-sm"
            />

            {/* Quick Suggestion Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-muted-foreground font-mono">Suggestions:</span>
              {SUGGESTED_TAGLINES.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onTaglineChange && onTaglineChange(suggestion)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                    tagline === suggestion
                      ? 'border-accent bg-accent/10 text-accent font-semibold'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* QR Center Badge Toggle */}
          {onBadgeTypeChange && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-accent" />
                QR Center Brand Badge
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onBadgeTypeChange('sparkle')}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs transition-all ${
                    badgeType === 'sparkle'
                      ? 'border-accent bg-accent/5 font-semibold text-accent shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span>✦ Sparkle Icon (Sticker)</span>
                  {badgeType === 'sparkle' && <Check className="h-3 w-3 text-accent" />}
                </button>
                <button
                  type="button"
                  onClick={() => onBadgeTypeChange('initials')}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs transition-all ${
                    badgeType === 'initials'
                      ? 'border-accent bg-accent/5 font-semibold text-accent shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span>RV Monogram Initials</span>
                  {badgeType === 'initials' && <Check className="h-3 w-3 text-accent" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Curated Brand Accent */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider font-mono">
            <Palette className="h-3.5 w-3.5 text-accent" />
            2. Brand Accent Color
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.values(QR_ACCENTS).map((accent) => {
              const isSelected = selectedAccent === accent.id;
              return (
                <button
                  key={accent.id}
                  type="button"
                  onClick={() => onSelectAccent(accent.id)}
                  aria-pressed={isSelected}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent ${
                    isSelected
                      ? 'border-accent bg-accent/5 shadow-xs font-semibold text-foreground'
                      : 'border-border/80 bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full flex-shrink-0 flex items-center justify-center text-white ring-1 ring-black/10"
                    style={{ backgroundColor: accent.hex }}
                  >
                    {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs truncate">{accent.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. QR Geometry Style */}
        <div className="space-y-2.5 pt-2 border-t border-border/60">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider font-mono">
            <span className="font-mono text-[10px] text-accent">■</span>
            3. QR Geometry Pattern
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.values(QR_STYLES).map((style) => {
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => onSelectStyle(style.id)}
                  aria-pressed={isSelected}
                  className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent ${
                    isSelected
                      ? 'border-accent bg-accent/5 shadow-xs text-foreground'
                      : 'border-border/80 bg-background hover:bg-muted/40 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-semibold">{style.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-accent" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    {style.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
