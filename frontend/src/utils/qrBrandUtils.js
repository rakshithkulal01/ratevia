import { BUSINESS_CATEGORIES } from '../config/businessCategories.js';

/**
 * Intelligent Business Initials Generator
 * Extracts a punchy 2-3 character brand mark for QR center badges.
 *
 * Rules:
 * - Strips leading articles ("The", "A", "An")
 * - Handles PascalCase/CamelCase brand compounds ("FitZone" -> "FZ", "FitZone Gym" -> "FZ")
 * - Handles 2-word names ("The Coffee House" -> "CH", "Royal Salon" -> "RS", "ABC Electronics" -> "AE")
 * - Handles 3-word names ("Mangalore Auto Care" -> "MAC")
 * - Handles single words ("Starbucks" -> "ST")
 * - Handles numbers & punctuation ("7-Eleven" -> "7E")
 * - Graceful fallback to "RV" (Ratevia) on null/empty/invalid input
 */
export function generateBusinessInitials(name) {
  if (!name || typeof name !== 'string') return 'RV';
  const clean = name.trim();
  if (!clean) return 'RV';

  // Remove common leading noise words
  const leadingStopWords = /^(the|a|an)\s+/i;
  const stripped = clean.replace(leadingStopWords, '').trim();
  if (!stripped) return 'RV';

  // Common trailing category / corporate descriptors
  const commonSuffixes = [
    'gym',
    'salon',
    'cafe',
    'restaurant',
    'bar',
    'hotel',
    'shop',
    'store',
    'co',
    'company',
    'inc',
    'llc',
    'ltd',
    'pvt',
    'services',
    'service',
    'care',
  ];

  const rawWords = stripped.split(/\s+/).filter(Boolean);

  // Check if first word is PascalCase/CamelCase compound with multiple uppercase letters
  // E.g. "FitZone Gym" -> "FZ", "AutoCare Shop" -> "AC"
  if (rawWords.length >= 2) {
    const lastWordLower = rawWords[rawWords.length - 1].toLowerCase().replace(/[^a-z0-9]/g, '');
    const firstWord = rawWords[0];
    const pascalMatches = firstWord.match(/[A-Z][a-z0-9]*/g);
    if (pascalMatches && pascalMatches.length >= 2 && commonSuffixes.includes(lastWordLower)) {
      return (pascalMatches[0][0] + pascalMatches[1][0]).toUpperCase();
    }
  }

  // 3-word names: "Mangalore Auto Care" -> "MAC"
  if (rawWords.length === 3) {
    const initials = rawWords
      .map((w) => w.replace(/[^a-zA-Z0-9]/g, '')[0])
      .filter(Boolean)
      .join('');
    if (initials.length >= 2) return initials.slice(0, 3).toUpperCase();
  }

  // 2-word names: "The Coffee House" -> "CH", "Royal Salon" -> "RS", "ABC Electronics" -> "AE"
  if (rawWords.length === 2) {
    const w1 = rawWords[0].replace(/[^a-zA-Z0-9]/g, '');
    const w2 = rawWords[1].replace(/[^a-zA-Z0-9]/g, '');
    if (w1 && w2) return (w1[0] + w2[0]).toUpperCase();
  }

  // 4+ words: take first 2 or 3 meaningful word initials
  if (rawWords.length > 3) {
    const initials = rawWords
      .slice(0, 3)
      .map((w) => w.replace(/[^a-zA-Z0-9]/g, '')[0])
      .filter(Boolean)
      .join('');
    if (initials.length >= 2) return initials.slice(0, 3).toUpperCase();
  }

  // Single word: check if PascalCase e.g. "FitZone" -> "FZ"
  const single = rawWords[0];
  const pascalMatches = single.match(/[A-Z][a-z0-9]*/g);
  if (pascalMatches && pascalMatches.length >= 2) {
    return (pascalMatches[0][0] + pascalMatches[1][0]).toUpperCase();
  }

  // Fallback single word: take first 2 alphanumeric chars (e.g. "Starbucks" -> "ST")
  const alphaNum = single.replace(/[^a-zA-Z0-9]/g, '');
  if (alphaNum.length >= 2) {
    return alphaNum.slice(0, 2).toUpperCase();
  }
  if (alphaNum.length === 1) {
    return (alphaNum + 'R').toUpperCase();
  }

  return 'RV';
}

/**
 * Curated Brand Accents
 * High contrast, print-safe, and visually harmonious.
 */
export const QR_ACCENTS = {
  'ratevia-blue': {
    id: 'ratevia-blue',
    label: 'Ratevia Blue',
    hex: '#0052FF',
    secondaryHex: '#4D7CFF',
    lightBg: '#EFF6FF',
    border: '#BFDBFE',
    badgeText: '#1E40AF',
    description: 'Electric signature blue',
  },
  warm: {
    id: 'warm',
    label: 'Warm',
    hex: '#D97706',
    secondaryHex: '#F59E0B',
    lightBg: '#FFFBEB',
    border: '#FDE68A',
    badgeText: '#92400E',
    description: 'Warm artisan amber',
  },
  elegant: {
    id: 'elegant',
    label: 'Elegant',
    hex: '#0F766E',
    secondaryHex: '#14B8A6',
    lightBg: '#F0FDFA',
    border: '#99F6E4',
    badgeText: '#115E59',
    description: 'Sophisticated deep teal',
  },
  bold: {
    id: 'bold',
    label: 'Bold',
    hex: '#DC2626',
    secondaryHex: '#EF4444',
    lightBg: '#FEF2F2',
    border: '#FECACA',
    badgeText: '#991B1B',
    description: 'Energetic vibrant crimson',
  },
  neutral: {
    id: 'neutral',
    label: 'Neutral',
    hex: '#1E293B',
    secondaryHex: '#475569',
    lightBg: '#F8FAFC',
    border: '#E2E8F0',
    badgeText: '#0F172A',
    description: 'Minimal slate & obsidian',
  },
};

/**
 * Supported QR Geometry / Module Styles
 */
export const QR_STYLES = {
  classic: {
    id: 'classic',
    label: 'Classic',
    description: 'Crisp high-contrast geometry with sharp corners',
    fgColor: '#0F172A',
    badgeRadius: 18,
  },
  soft: {
    id: 'soft',
    label: 'Soft',
    description: 'Refined deep slate with gentle rounded badge',
    fgColor: '#1E293B',
    badgeRadius: 26,
  },
};

/**
 * Curated, honest customer call-to-action messages
 */
export const QR_PREDEFINED_MESSAGES = [
  'Scan to share your experience',
  'Scan & tell us what you think',
  'Share your experience',
  'Your feedback matters',
];

export const DEFAULT_QR_MESSAGE = 'Scan to share your experience';

/**
 * Get the recommended default accent for a business category
 */
export function getCategoryDefaultAccent(categoryKey) {
  const cat = BUSINESS_CATEGORIES[categoryKey];
  if (cat?.brandTheme?.defaultAccent && QR_ACCENTS[cat.brandTheme.defaultAccent]) {
    return cat.brandTheme.defaultAccent;
  }
  return 'ratevia-blue';
}

/**
 * Generates an SVG Data URI for the QR Center Initials Badge.
 * High contrast, bold typography, with a thick white border to ensure
 * clean separation from surrounding excavated QR modules.
 */
export function generateCenterBadgeSvgUri(initials, accentHex = '#0052FF', radius = 22) {
  const chars = (initials || 'RV').slice(0, 3).toUpperCase();
  const fontSize = chars.length >= 3 ? 34 : 42;
  const letterSpacing = chars.length >= 3 ? '-0.5' : '1';

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">`,
    `  <rect x="5" y="5" width="90" height="90" rx="${radius}" fill="${accentHex}" stroke="#FFFFFF" stroke-width="8" />`,
    `  <text x="50" y="52" text-anchor="middle" dominant-baseline="central" font-family="Inter, -apple-system, sans-serif" font-weight="800" font-size="${fontSize}" fill="#FFFFFF" letter-spacing="${letterSpacing}">${chars}</text>`,
    `</svg>`,
  ].join('\n');

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generates an SVG Data URI for the 4-point Sparkle Icon.
 * Exactly matches the aesthetic of the provided Ratevia sticker design.
 */
export function generateCenterSparkleSvgUri(accentHex = '#0D92F4') {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">`,
    `  <rect x="0" y="0" width="100" height="100" rx="20" fill="#FFFFFF" />`,
    `  <path d="M50 8 C50 32, 68 50, 92 50 C68 50, 50 68, 50 92 C50 68, 32 50, 8 50 C32 50, 50 32, 50 8 Z" fill="${accentHex}" />`,
    `</svg>`,
  ].join('\n');

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Authoritative Customer QR URL Builder
 * Preserves the contract: /r/:businessSlug
 */
export function buildCustomerQRUrl(businessSlug) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  return `${origin}/r/${businessSlug || 'demo'}`;
}

/**
 * Merges business info, category defaults, and user customization
 */
export function getQRBrandConfig({
  business,
  categoryKey,
  selectedAccent,
  selectedStyle,
  selectedMessage,
}) {
  const category = BUSINESS_CATEGORIES[categoryKey] || BUSINESS_CATEGORIES.OTHER;
  const initials = generateBusinessInitials(business?.name);
  const accentKey = selectedAccent || category.brandTheme?.defaultAccent || 'ratevia-blue';
  const accent = QR_ACCENTS[accentKey] || QR_ACCENTS['ratevia-blue'];
  const style = QR_STYLES[selectedStyle] || QR_STYLES.classic;
  const message = selectedMessage || DEFAULT_QR_MESSAGE;
  const badgeSvgUri = generateCenterBadgeSvgUri(initials, accent.hex, style.badgeRadius);

  return {
    initials,
    accent,
    style,
    message,
    category,
    badgeSvgUri,
  };
}

/**
 * High-Resolution Print-Ready PNG Exporter (1000 x 1380 Table Stand Card)
 * Deterministic white background, crisp typography, and excavated QR.
 */
export function exportBrandedQRPNG({ business, qrCanvas, config }) {
  if (!qrCanvas) return;
  const canvas = document.createElement('canvas');
  const width = 1000;
  const height = 1380;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Outer border with rounded corners
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 4;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(16, 16, width - 32, height - 32, 36);
    ctx.stroke();
  } else {
    ctx.strokeRect(16, 16, width - 32, height - 32);
  }

  // Top accent bar
  ctx.fillStyle = config.accent.hex || '#0052FF';
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(20, 20, width - 40, 16, [18, 18, 0, 0]);
    ctx.fill();
  } else {
    ctx.fillRect(20, 20, width - 40, 16);
  }

  // Category pill
  const categoryText = (config.category?.displayName || 'BUSINESS').toUpperCase();
  ctx.fillStyle = config.accent.lightBg || '#F1F5F9';
  ctx.strokeStyle = config.accent.border || '#CBD5E1';
  ctx.lineWidth = 2;
  const pillW = Math.max(220, categoryText.length * 14 + 60);
  const pillH = 44;
  const pillX = (width - pillW) / 2;
  const pillY = 70;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 22);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = config.accent.badgeText || '#0F172A';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(categoryText, width / 2, pillY + pillH / 2);

  // Business Name
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 44px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const rawName = (business?.name || 'Ratevia Business').toUpperCase();
  const displayName = rawName.length > 32 ? rawName.slice(0, 30) + '...' : rawName;
  ctx.fillText(displayName, width / 2, 140);

  // Tagline
  if (config.category?.brandTheme?.tagline) {
    ctx.fillStyle = '#64748B';
    ctx.font = '500 20px Inter, system-ui, sans-serif';
    ctx.fillText(config.category.brandTheme.tagline, width / 2, 196);
  }

  // QR Code Frame
  const qrFrameSize = 680;
  const qrFrameX = (width - qrFrameSize) / 2;
  const qrFrameY = 250;
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#F1F5F9';
  ctx.lineWidth = 4;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(qrFrameX, qrFrameY, qrFrameSize, qrFrameSize, 32);
    ctx.fill();
    ctx.stroke();
  }

  // Draw QR canvas
  const qrInnerSize = 620;
  const qrInnerOffset = (qrFrameSize - qrInnerSize) / 2;
  ctx.drawImage(qrCanvas, qrFrameX + qrInnerOffset, qrFrameY + qrInnerOffset, qrInnerSize, qrInnerSize);

  // Center Badge
  const badgeSize = Math.round(qrInnerSize * 0.22);
  const badgeX = qrFrameX + qrInnerOffset + (qrInnerSize - badgeSize) / 2;
  const badgeY = qrFrameY + qrInnerOffset + (qrInnerSize - badgeSize) / 2;
  ctx.fillStyle = config.accent.hex || '#0052FF';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 8;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 26);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = '#FFFFFF';
  const initials = (config.initials || 'RV').slice(0, 3).toUpperCase();
  ctx.font = `bold ${initials.length >= 3 ? 46 : 56}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, badgeX + badgeSize / 2, badgeY + badgeSize / 2);

  // Call to action message
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 34px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(config.message || 'Scan to share your experience', width / 2, 980);

  ctx.fillStyle = '#64748B';
  ctx.font = '500 22px Inter, system-ui, sans-serif';
  ctx.fillText('Takes less than 30 seconds', width / 2, 1030);

  // Divider
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 180, 1100);
  ctx.lineTo(width / 2 + 180, 1100);
  ctx.stroke();

  // Footer - POWERED BY RATEVIA
  ctx.fillStyle = config.accent.hex || '#0052FF';
  ctx.beginPath();
  ctx.arc(width / 2 - 120, 1150, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('POWERED BY RATEVIA', width / 2, 1150);

  const link = document.createElement('a');
  link.download = `${business?.slug || 'ratevia'}-branded-qr.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Lossless Vector SVG Exporter (Table Stand Card)
 * Resolution-independent vector card for professional print shops.
 */
export function exportBrandedQRSVG({ business, config, qrSvgElement }) {
  if (!qrSvgElement) return;

  const width = 1000;
  const height = 1380;
  const rawName = (business?.name || 'Ratevia Business').toUpperCase();
  const displayName = rawName.length > 32 ? rawName.slice(0, 30) + '...' : rawName;
  const categoryText = (config.category?.displayName || 'BUSINESS').toUpperCase();
  const initials = (config.initials || 'RV').slice(0, 3).toUpperCase();
  const accentHex = config.accent.hex || '#0052FF';
  const accentSecondary = config.accent.secondaryHex || '#4D7CFF';
  const lightBg = config.accent.lightBg || '#F1F5F9';
  const borderHex = config.accent.border || '#CBD5E1';
  const badgeText = config.accent.badgeText || '#0F172A';
  const message = config.message || 'Scan to share your experience';
  const tagline = config.category?.brandTheme?.tagline || '';

  // Get serialized SVG content of the QR code
  const qrInner = qrSvgElement.innerHTML;
  const qrViewBox = qrSvgElement.getAttribute('viewBox') || '0 0 100 100';

  const svgMarkup = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accentHex}" />
      <stop offset="100%" stop-color="${accentSecondary}" />
    </linearGradient>
    <style>
      .title { font-family: Inter, system-ui, -apple-system, sans-serif; font-size: 42px; font-weight: 800; fill: #0F172A; text-anchor: middle; }
      .tagline { font-family: Inter, system-ui, -apple-system, sans-serif; font-size: 20px; font-weight: 500; fill: #64748B; text-anchor: middle; }
      .category { font-family: monospace; font-size: 18px; font-weight: 700; fill: ${badgeText}; text-anchor: middle; }
      .message { font-family: Inter, system-ui, -apple-system, sans-serif; font-size: 32px; font-weight: 700; fill: #0F172A; text-anchor: middle; }
      .submessage { font-family: Inter, system-ui, -apple-system, sans-serif; font-size: 20px; font-weight: 500; fill: #64748B; text-anchor: middle; }
      .footer { font-family: monospace; font-size: 19px; font-weight: 700; fill: #475569; text-anchor: middle; letter-spacing: 2px; }
      .badge-text { font-family: Inter, system-ui, -apple-system, sans-serif; font-size: ${initials.length >= 3 ? 46 : 56}px; font-weight: 800; fill: #FFFFFF; text-anchor: middle; dominant-baseline: central; }
    </style>
  </defs>

  <!-- Background -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="#FFFFFF" />
  <rect x="16" y="16" width="${width - 32}" height="${height - 32}" rx="32" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="4" />

  <!-- Top Accent Bar -->
  <rect x="20" y="20" width="${width - 40}" height="16" rx="8" fill="url(#headerGrad)" />

  <!-- Category Badge -->
  <rect x="${width / 2 - 130}" y="70" width="260" height="44" rx="22" fill="${lightBg}" stroke="${borderHex}" stroke-width="2" />
  <text x="${width / 2}" y="98" class="category">${categoryText}</text>

  <!-- Business Name & Tagline -->
  <text x="${width / 2}" y="175" class="title">${displayName}</text>
  ${tagline ? `<text x="${width / 2}" y="215" class="tagline">${tagline}</text>` : ''}

  <!-- QR Frame -->
  <rect x="170" y="260" width="660" height="660" rx="28" fill="#FFFFFF" stroke="#F1F5F9" stroke-width="4" />

  <!-- Nested QR Code Vector -->
  <svg x="200" y="290" width="600" height="600" viewBox="${qrViewBox}">
    ${qrInner}
  </svg>

  <!-- Center Badge -->
  <rect x="432" y="522" width="136" height="136" rx="30" fill="${accentHex}" stroke="#FFFFFF" stroke-width="8" />
  <text x="500" y="590" class="badge-text">${initials}</text>

  <!-- Call to Action -->
  <text x="${width / 2}" y="1000" class="message">${message}</text>
  <text x="${width / 2}" y="1040" class="submessage">Takes less than 30 seconds</text>

  <!-- Divider -->
  <line x1="${width / 2 - 180}" y1="1100" x2="${width / 2 + 180}" y2="1100" stroke="#E2E8F0" stroke-width="2" />

  <!-- Footer -->
  <circle cx="${width / 2 - 130}" cy="1150" r="6" fill="${accentHex}" />
  <text x="${width / 2}" y="1156" class="footer">POWERED BY RATEVIA</text>
</svg>`;

  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${business?.slug || 'ratevia'}-branded-qr.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Deterministically splits text into up to 2 balanced lines that fit within maxTextWidth.
 * Dynamically scales font down to minFontSize before applying gentle ellipsis.
 */
export function layoutBusinessNameLines(ctx, text, maxTextWidth, initialFontSize = 76, minFontSize = 32) {
  const words = text.split(/\s+/).filter(Boolean);

  // If text is short (< 22 chars) or single word, try 1 line first
  if (text.length < 22 || words.length <= 1) {
    let singleFs = initialFontSize;
    while (singleFs >= minFontSize) {
      ctx.font = `bold ${singleFs}px 'Calistoga', Georgia, serif`;
      if (ctx.measureText(text).width <= maxTextWidth) {
        return { lines: [text], fontSize: singleFs };
      }
      singleFs -= 4;
    }
  }

  // If text is long (>= 22 chars) and has multiple words, prefer 2 balanced lines at larger legible font size
  if (words.length > 1) {
    let twoLineFs = Math.max(initialFontSize, 52);
    while (twoLineFs >= minFontSize) {
      ctx.font = `bold ${twoLineFs}px 'Calistoga', Georgia, serif`;
      let bestSplit = null;
      let minDiff = Infinity;

      for (let i = 1; i < words.length; i++) {
        const l1 = words.slice(0, i).join(' ');
        const l2 = words.slice(i).join(' ');
        const w1 = ctx.measureText(l1).width;
        const w2 = ctx.measureText(l2).width;

        if (w1 <= maxTextWidth && w2 <= maxTextWidth) {
          const diff = Math.abs(w1 - w2);
          if (diff < minDiff) {
            minDiff = diff;
            bestSplit = [l1, l2];
          }
        }
      }

      if (bestSplit) {
        return { lines: bestSplit, fontSize: twoLineFs };
      }

      twoLineFs -= 4;
    }
  }

  // Fallback: single line
  let fontSize = initialFontSize;
  while (fontSize > minFontSize) {
    fontSize -= 4;
    ctx.font = `bold ${fontSize}px 'Calistoga', Georgia, serif`;
    if (ctx.measureText(text).width <= maxTextWidth) {
      return { lines: [text], fontSize };
    }
  }

  // Truncate if still exceeds maxTextWidth at minFontSize
  ctx.font = `bold ${minFontSize}px 'Calistoga', Georgia, serif`;
  let truncated = text;
  while (truncated.length > 3 && ctx.measureText(truncated + '...').width > maxTextWidth) {
    truncated = truncated.slice(0, -1);
  }
  return { lines: [truncated + '...'], fontSize: minFontSize };
}

/**
 * High-Resolution Ratevia Sticker Canvas Renderer (1364 x 2048 PNG)
 * Renders the clean fixed sticker template with real-time customized business name,
 * dynamic tagline, and current QR code into a 300DPI canvas.
 */
export function renderRateviaStickerCanvas({
  businessName,
  tagline,
  customerUrl,
  config,
  qrCanvas,
  badgeType = 'sparkle',
}) {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const width = 1364; // 2x of 682
      const height = 2048; // 2x of 1024
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize 2d canvas context');

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          // 1. Draw clean fixed template background
          ctx.drawImage(img, 0, 0, width, height);

          // 2. Draw Business Name (centered horizontally, between the fixed ✦ stars)
          const rawName = (businessName || 'YOUR BUSINESS').toUpperCase().trim();
          ctx.fillStyle = '#062464';

          const maxTextWidth = 830;
          const initialFontSize =
            rawName.length <= 12
              ? 76
              : rawName.length <= 18
              ? 64
              : rawName.length <= 26
              ? 52
              : rawName.length <= 36
              ? 42
              : 36;

          const { lines, fontSize } = layoutBusinessNameLines(ctx, rawName, maxTextWidth, initialFontSize, 32);

          ctx.font = `bold ${fontSize}px 'Calistoga', Georgia, serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const centerY = 276;
          if (lines.length === 1) {
            ctx.fillText(lines[0], width / 2, centerY);
          } else {
            const lineHeight = fontSize * 1.15;
            ctx.fillText(lines[0], width / 2, centerY - lineHeight / 2);
            ctx.fillText(lines[1], width / 2, centerY + lineHeight / 2);
          }

          // 3. Draw Business Tagline
          if (tagline && tagline.trim()) {
            ctx.fillStyle = '#334155';
            ctx.font = `500 ${tagline.length > 28 ? 32 : 36}px 'Inter', system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tagline.trim(), width / 2, 388);
          }

          // 4. Draw QR Code inside the blue-bordered frame
          const boxX = 428;
          const boxY = 476;
          const boxW = 508;
          const boxH = 472;
          const qrSize = 436;
          const qrX = boxX + (boxW - qrSize) / 2;
          const qrY = boxY + (boxH - qrSize) / 2;

          if (qrCanvas) {
            ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
          }

          // 5. Draw center badge
          const badgeSize = Math.round(qrSize * 0.22);
          const badgeX = qrX + (qrSize - badgeSize) / 2;
          const badgeY = qrY + (qrSize - badgeSize) / 2;
          const accentHex = config?.accent?.hex || '#0052FF';

          if (badgeType === 'initials') {
            ctx.fillStyle = accentHex;
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 6;
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 20);
              ctx.fill();
              ctx.stroke();
            }
            ctx.fillStyle = '#FFFFFF';
            const initials = (config?.initials || 'RV').slice(0, 3).toUpperCase();
            ctx.font = `bold ${initials.length >= 3 ? 34 : 44}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(initials, badgeX + badgeSize / 2, badgeY + badgeSize / 2);
          } else {
            // Sparkle badge matching original sticker design
            ctx.fillStyle = '#FFFFFF';
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(badgeX, badgeY, badgeSize, badgeSize, 20);
              ctx.fill();
            }
            const cx = badgeX + badgeSize / 2;
            const cy = badgeY + badgeSize / 2;
            const r = badgeSize * 0.42;
            ctx.fillStyle = accentHex;
            ctx.beginPath();
            ctx.moveTo(cx, cy - r);
            ctx.bezierCurveTo(cx, cy - r * 0.35, cx + r * 0.35, cy, cx + r, cy);
            ctx.bezierCurveTo(cx + r * 0.35, cy, cx, cy + r * 0.35, cx, cy + r);
            ctx.bezierCurveTo(cx, cy + r * 0.35, cx - r * 0.35, cy, cx - r, cy);
            ctx.bezierCurveTo(cx - r * 0.35, cy, cx, cy - r * 0.35, cx, cy - r);
            ctx.closePath();
            ctx.fill();
          }

          const dataUrl = canvas.toDataURL('image/png');
          canvas.toBlob((blob) => {
            resolve({ canvas, dataUrl, blob });
          }, 'image/png');
        } catch (innerErr) {
          reject(innerErr);
        }
      };

      img.onerror = () => reject(new Error('Failed to load sticker template background image'));
      img.src = '/ratevia_sticker_clean.png';
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Returns rendered Base64 PNG and Blob for the complete customized Ratevia sticker.
 */
export async function renderRateviaStickerDataUrl(params) {
  const { dataUrl, blob, canvas } = await renderRateviaStickerCanvas(params);
  return { dataUrl, blob, canvas };
}

/**
 * High-Resolution Ratevia Sticker Exporter (1364 x 2048 PNG)
 * Renders the clean fixed sticker template and initiates browser download.
 */
export async function exportRateviaStickerPNG(params) {
  const { dataUrl } = await renderRateviaStickerCanvas(params);
  const link = document.createElement('a');
  link.download = `${params?.slug || 'ratevia'}-sticker.png`;
  link.href = dataUrl;
  link.click();
  return true;
}


