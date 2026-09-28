import {
  generateBusinessInitials,
  getQRBrandConfig,
  buildCustomerQRUrl,
  QR_ACCENTS,
  QR_STYLES,
  DEFAULT_QR_MESSAGE,
} from '../frontend/src/utils/qrBrandUtils.js';
import { getCategoryConfig } from '../frontend/src/config/businessCategories.js';

console.log('====================================================');
console.log('      RATEVIA MANUAL QA CHECKLIST VERIFICATION      ');
console.log('====================================================\n');

const qaCases = [
  {
    label: 'Business A',
    name: 'The Coffee House',
    category: 'CAFE',
    slug: 'the-coffee-house',
    expectedInitials: 'CH',
    expectedAccent: 'warm',
  },
  {
    label: 'Business B',
    name: 'Royal Salon',
    category: 'SALON',
    slug: 'royal-salon',
    expectedInitials: 'RS',
    expectedAccent: 'elegant',
  },
  {
    label: 'Business C',
    name: 'Mangalore Auto Care',
    category: 'GARAGE',
    slug: 'mangalore-auto-care',
    expectedInitials: 'MAC',
    expectedAccent: 'neutral',
  },
  {
    label: 'Business D',
    name: 'FitZone Gym',
    category: 'GYM',
    slug: 'fitzone-gym',
    expectedInitials: 'FZ',
    expectedAccent: 'bold',
  },
];

let allPassed = true;

for (const tc of qaCases) {
  console.log(`--- Checking ${tc.label}: ${tc.name} (${tc.category}) ---`);

  const categoryConfig = getCategoryConfig(tc.category);
  const brandConfig = getQRBrandConfig({
    business: { name: tc.name, businessType: tc.category, slug: tc.slug },
    categoryKey: tc.category,
    selectedAccent: categoryConfig.brandTheme?.defaultAccent,
    selectedStyle: 'classic',
    selectedMessage: DEFAULT_QR_MESSAGE,
  });

  const initialsMatch = brandConfig.initials === tc.expectedInitials;
  console.log(`  1. Initials generation: "${brandConfig.initials}" (expected: "${tc.expectedInitials}") -> ${initialsMatch ? 'PASS' : 'FAIL'}`);
  if (!initialsMatch) allPassed = false;

  const accentMatch = brandConfig.accent.id === tc.expectedAccent;
  console.log(`  2. Category accent: "${brandConfig.accent.id}" (${brandConfig.accent.hex}) -> ${accentMatch ? 'PASS' : 'FAIL'}`);
  if (!accentMatch) allPassed = false;

  const hasBadgeSvg = brandConfig.badgeSvgUri.startsWith('data:image/svg+xml;utf8,');
  console.log(`  3. Center badge SVG: ${hasBadgeSvg ? 'Generated valid data URI' : 'FAIL'}`);
  if (!hasBadgeSvg) allPassed = false;

  const destination = buildCustomerQRUrl(tc.slug);
  const validDestination = destination.endsWith(`/r/${tc.slug}`);
  console.log(`  4. QR Destination URL: "${destination}" -> ${validDestination ? 'PASS' : 'FAIL'}`);
  if (!validDestination) allPassed = false;

  console.log(`  5. Category mood: "${categoryConfig.brandTheme?.mood}" | Tagline: "${categoryConfig.brandTheme?.tagline}"`);
  console.log('');
}

console.log('====================================================');
console.log(`QA CHECKLIST RESULT: ${allPassed ? 'ALL CASES PASSED PERFECTLY' : 'SOME CASES FAILED'}`);
console.log('====================================================');

process.exit(allPassed ? 0 : 1);
