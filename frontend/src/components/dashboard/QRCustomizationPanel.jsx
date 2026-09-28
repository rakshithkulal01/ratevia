import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  QR_ACCENTS,
  QR_STYLES,
  QR_PREDEFINED_MESSAGES,
} from '../../utils/qrBrandUtils';
import { Check, Palette, Sliders, MessageSquareText } from 'lucide-react';

/**
 * QRCustomizationPanel
 * Provides curated, safe visual customization options for the Branded QR code.
 * Changes apply immediately to the live preview without requiring a page reload.
 */
export const QRCustomizationPanel = ({
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
            Brand Customization
          </CardTitle>
          {categoryTheme && (
            <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full border border-border">
              Theme: {categoryTheme.mood}
            </span>
          )}
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          Tailor your QR identity with print-safe accents and honest review prompts.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 space-y-5">
        {/* 1. Curated Brand Accent */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider font-mono">
            <Palette className="h-3.5 w-3.5 text-accent" />
            1. Brand Accent
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

        {/* 2. QR Style */}
        <div className="space-y-2.5 pt-2 border-t border-border/60">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider font-mono">
            <span className="font-mono text-[10px] text-accent">■</span>
            2. QR Geometry Style
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

        {/* 3. Call to Action Display Message */}
        <div className="space-y-2.5 pt-2 border-t border-border/60">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 uppercase tracking-wider font-mono">
            <MessageSquareText className="h-3.5 w-3.5 text-accent" />
            3. Customer Call to Action
          </label>
          <div className="space-y-1.5">
            {QR_PREDEFINED_MESSAGES.map((msg) => {
              const isSelected = selectedMessage === msg;
              return (
                <button
                  key={msg}
                  type="button"
                  onClick={() => onSelectMessage(msg)}
                  aria-pressed={isSelected}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent ${
                    isSelected
                      ? 'border-accent bg-accent/5 font-semibold text-foreground'
                      : 'border-border/80 bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>"{msg}"</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-accent flex-shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
