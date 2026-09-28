import { generateBusinessInitials, QR_ACCENTS, QR_STYLES, QR_PREDEFINED_MESSAGES, DEFAULT_QR_MESSAGE, getCategoryDefaultAccent, generateCenterBadgeSvgUri, getQRBrandConfig } from '../frontend/src/utils/qrBrandUtils.js';
import { BUSINESS_CATEGORIES, SUPPORTED_CATEGORIES, getCategoryConfig } from '../frontend/src/config/businessCategories.js';

console.log('====================================================');
console.log('       RATEVIA BRANDED QR SYSTEM TEST SUITE        ');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName} ${details ? '- ' + details : ''}`);
  }
}

// ----------------------------------------------------
// 1. Business Initials Generation Tests
// ----------------------------------------------------
console.log('--- 1. Testing Business Initials Generation ---');

const promptExamples = [
  { name: 'The Coffee House', expected: 'CH' },
  { name: 'Royal Salon', expected: 'RS' },
  { name: 'Mangalore Auto Care', expected: 'MAC' },
  { name: 'Fresh Bake', expected: 'FB' },
  { name: 'FitZone Gym', expected: 'FZ' },
  { name: 'FitZone', expected: 'FZ' },
  { name: 'Tech World', expected: 'TW' },
  { name: 'ABC Electronics', expected: 'AE' },
];

for (const ex of promptExamples) {
  const actual = generateBusinessInitials(ex.name);
  assert(actual === ex.expected, `Prompt example: "${ex.name}" -> "${ex.expected}"`, `got "${actual}"`);
}

console.log('\n--- 2. Testing Initials Edge Cases ---');

const edgeCases = [
  { name: 'Starbucks', expected: 'ST', desc: 'Single-word brand' },
  { name: '7-Eleven', expected: '7E', desc: 'Numbers & hyphen' },
  { name: '360 Fitness', expected: '3F', desc: 'Leading number' },
  { name: 'A', expected: 'AR', desc: 'Single character fallback' },
  { name: '', expected: 'RV', desc: 'Empty string fallback' },
  { name: null, expected: 'RV', desc: 'Null fallback' },
  { name: undefined, expected: 'RV', desc: 'Undefined fallback' },
  { name: '    ', expected: 'RV', desc: 'Whitespace fallback' },
  { name: '***@@@###', expected: 'RV', desc: 'Special symbols fallback' },
  { name: 'The Grand Palace International Resort & Spa', expected: 'GPI', desc: 'Very long name (max 3 initials)' },
  { name: 'Cafe Coffee Day', expected: 'CCD', desc: '3-word brand' },
];

for (const ec of edgeCases) {
  const actual = generateBusinessInitials(ec.name);
  assert(actual === ec.expected, `Edge case: ${ec.desc} ("${ec.name}") -> "${ec.expected}"`, `got "${actual}"`);
}

// ----------------------------------------------------
// 3. Category Brand Theme Configuration Tests
// ----------------------------------------------------
console.log('\n--- 3. Testing Category-Aware Brand Identity (11 Categories) ---');

assert(SUPPORTED_CATEGORIES.length === 11, 'Exactly 11 business categories supported');

for (const catKey of SUPPORTED_CATEGORIES) {
  const config = getCategoryConfig(catKey);
  const theme = config.brandTheme;
  const hasTheme = Boolean(theme && theme.defaultAccent && theme.accentColor && theme.mood && theme.tagline);
  assert(hasTheme, `Category "${catKey}" has complete brandTheme configuration`);
  assert(Boolean(QR_ACCENTS[theme.defaultAccent]), `Category "${catKey}" references valid accent: "${theme.defaultAccent}"`);
}

// ----------------------------------------------------
// 4. Center Badge SVG Data URI Generation Tests
// ----------------------------------------------------
console.log('\n--- 4. Testing Center Badge SVG Generation ---');

const svgUri = generateCenterBadgeSvgUri('CH', '#0052FF', 22);
assert(svgUri.startsWith('data:image/svg+xml;utf8,'), 'SVG badge returns valid data URI header');

const decodedSvg = decodeURIComponent(svgUri.replace('data:image/svg+xml;utf8,', ''));
assert(decodedSvg.includes('xmlns="http://www.w3.org/2000/svg"'), 'Decoded SVG has correct XML namespace');
assert(decodedSvg.includes('fill="#0052FF"'), 'Decoded SVG uses specified accent color');
assert(decodedSvg.includes('>CH<'), 'Decoded SVG contains initials text');
assert(decodedSvg.includes('stroke="#FFFFFF"'), 'Decoded SVG has white border buffer for excavation');

// ----------------------------------------------------
// 5. Curated Options & Config Merging Tests
// ----------------------------------------------------
console.log('\n--- 5. Testing QR Brand Config Merging ---');

const sampleBusiness = {
  id: 'biz_123',
  name: 'The Coffee House',
  businessType: 'CAFE',
  slug: 'the-coffee-house',
};

const brandConfig = getQRBrandConfig({
  business: sampleBusiness,
  categoryKey: sampleBusiness.businessType,
  selectedAccent: 'warm',
  selectedStyle: 'classic',
  selectedMessage: DEFAULT_QR_MESSAGE,
});

assert(brandConfig.initials === 'CH', 'Config computes correct initials (CH)');
assert(brandConfig.accent.id === 'warm', 'Config uses selected accent (warm)');
assert(brandConfig.accent.hex === '#D97706', 'Config accent hex matches expected amber (#D97706)');
assert(brandConfig.style.id === 'classic', 'Config uses selected style (classic)');
assert(brandConfig.message === 'Scan to share your experience', 'Config uses default message');
assert(brandConfig.category.category === 'CAFE', 'Config references correct CAFE category');

console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passedTests}/${totalTests} Passed (${totalTests - passedTests} Failed)`);
console.log('====================================================');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
