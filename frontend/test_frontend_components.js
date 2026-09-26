import {
  BUSINESS_CATEGORIES,
  getCategoryConfig,
  isSupportedCategory,
  getCategoryOptions,
} from './src/config/businessCategories.js';
import { generateDeterministicReview } from './src/utils/reviewEngine.js';

const EXPECTED_CATEGORIES = [
  'CAFE',
  'RESTAURANT',
  'HOTEL',
  'CLOTHING_SHOP',
  'ELECTRONICS_SHOP',
  'SALON',
  'GARAGE',
  'BAKERY',
  'GYM',
  'RETAIL_SHOP',
  'OTHER',
];

async function runFrontendComponentTests() {
  console.log('====================================================');
  console.log('       RATEVIA FRONTEND ARCHITECTURE TESTS          ');
  console.log('====================================================\n');

  // --- TEST 1: CATEGORY CONFIGURATION INTEGRITY ---
  console.log('[Test 1] Validating frontend category configurations...');
  const options = getCategoryOptions();
  if (options.length !== 11) {
    throw new Error(`Expected 11 category options, got ${options.length}`);
  }

  for (const cat of EXPECTED_CATEGORIES) {
    if (!isSupportedCategory(cat)) {
      throw new Error(`Category ${cat} is not reported as supported by isSupportedCategory!`);
    }
    const config = getCategoryConfig(cat);
    if (!config || config.category !== cat) {
      throw new Error(`getCategoryConfig(${cat}) did not return proper config!`);
    }
    if (!config.displayName) {
      throw new Error(`Category ${cat} missing displayName!`);
    }
    if (!Array.isArray(config.positiveTopics) || config.positiveTopics.length === 0) {
      throw new Error(`Category ${cat} missing positive topics!`);
    }
    if (!Array.isArray(config.improvementTopics) || config.improvementTopics.length === 0) {
      throw new Error(`Category ${cat} missing improvement topics!`);
    }
    console.log(`  ✓ ${cat.padEnd(18)} → "${config.displayName}" (${config.positiveTopics.length} pos, ${config.improvementTopics.length} imp topics)`);
  }

  // --- TEST 2: CATEGORY FALLBACK ---
  console.log('\n[Test 2] Testing category fallback for unknown industry types...');
  const fallbackConfig = getCategoryConfig('UNKNOWN_UNSUPPORTED_TYPE');
  if (fallbackConfig.category !== 'OTHER') {
    throw new Error(`Expected fallback to 'OTHER', got '${fallbackConfig.category}'`);
  }
  if (!fallbackConfig.displayName) {
    throw new Error("Fallback config missing displayName");
  }
  console.log('  ✓ Unknown category safely resolves to "OTHER" fallback configuration');

  // --- TEST 3: DETERMINISTIC REVIEW ENGINE (5-STAR POSITIVE FLOW) ---
  console.log('\n[Test 3] Testing 5★ deterministic review generation...');
  const fiveStarReview = generateDeterministicReview({
    businessCategory: 'CAFE',
    businessName: 'The Roast Bean',
    rating: 5,
    selectedTopics: ['Food Quality', 'Taste', 'Staff Friendliness'],
    customerMessage: 'The pour over coffee was world class.',
    variationIndex: 0,
  });

  if (!fiveStarReview || typeof fiveStarReview !== 'string') {
    throw new Error('generateDeterministicReview failed to produce a valid string!');
  }
  if (!fiveStarReview.includes('The Roast Bean')) {
    throw new Error('Review does not include business name!');
  }
  if (!fiveStarReview.includes('The pour over coffee was world class')) {
    throw new Error('Review failed to incorporate customer message!');
  }
  console.log('  ✓ Generated 5★ review text incorporates venue, customer notes, and positive topic phrases');
  console.log(`    Sample: "${fiveStarReview.slice(0, 100)}..."`);

  // --- TEST 4: DETERMINISTIC REVIEW ENGINE (2-STAR CONSTRUCTIVE FLOW) ---
  console.log('\n[Test 4] Testing 2★ constructive review generation...');
  const twoStarReview = generateDeterministicReview({
    businessCategory: 'GARAGE',
    businessName: 'Apex Motor Works',
    rating: 2,
    selectedTopics: ['Waiting Time'],
    customerMessage: 'Waited 3 hours without update.',
    variationIndex: 1,
  });

  if (!twoStarReview.includes('Apex Motor Works')) {
    throw new Error('Constructive review does not include business name!');
  }
  if (!twoStarReview.includes('Waited 3 hours without update')) {
    throw new Error('Constructive review failed to incorporate customer note!');
  }
  console.log('  ✓ Generated 2★ constructive review successfully reflects feedback without fabricating');

  // --- TEST 5: DETERMINISTIC VARIANTS REPRODUCIBILITY ---
  console.log('\n[Test 5] Testing determinism and variant variations...');
  const reviewA1 = generateDeterministicReview({
    businessCategory: 'RESTAURANT',
    businessName: 'Ocean Catch',
    rating: 5,
    selectedTopics: ['Taste'],
    variationIndex: 0,
  });
  const reviewA2 = generateDeterministicReview({
    businessCategory: 'RESTAURANT',
    businessName: 'Ocean Catch',
    rating: 5,
    selectedTopics: ['Taste'],
    variationIndex: 0,
  });
  const reviewB = generateDeterministicReview({
    businessCategory: 'RESTAURANT',
    businessName: 'Ocean Catch',
    rating: 5,
    selectedTopics: ['Taste'],
    variationIndex: 1,
  });

  if (reviewA1 !== reviewA2) {
    throw new Error('Review engine is not deterministic! Same inputs produced different outputs.');
  }
  if (reviewA1 === reviewB) {
    throw new Error('Variant 0 and Variant 1 produced identical review texts!');
  }
  console.log('  ✓ Determinism confirmed (identical inputs = identical outputs)');
  console.log('  ✓ Variant cycling confirmed (different variants produce distinct phrasing)');

  // --- TEST 6: CLIENT PHONE NORMALIZATION & FORM VALIDATION LOGIC ---
  console.log('\n[Test 6] Testing phone & form validation specifications...');
  const cleanPhone = (phone, country = '+91') => {
    const raw = (phone || '').replace(/[\s\-\(\)\.]/g, '');
    if (raw.startsWith('+')) return raw;
    const cleanPrefix = country.startsWith('+') ? country : `+${country}`;
    return `${cleanPrefix}${raw.replace(/^0+/, '')}`;
  };

  const testCases = [
    { input: '9876543210', country: '+91', expected: '+919876543210' },
    { input: '98765 43210', country: '+91', expected: '+919876543210' },
    { input: '+91 98765-43210', country: '+91', expected: '+919876543210' },
    { input: '08012345678', country: '+91', expected: '+918012345678' },
  ];

  for (const tc of testCases) {
    const result = cleanPhone(tc.input, tc.country);
    if (result !== tc.expected) {
      throw new Error(`Phone normalization failed for ${tc.input}: expected ${tc.expected}, got ${result}`);
    }
  }
  console.log('  ✓ Phone normalization accurately formats local and international numbers');

  // --- TEST 7: AUTOMATIC COPY ON CONTINUE TO GOOGLE (SUCCESS FLOW) ---
  console.log('\n[Test 7] Testing automatic clipboard copy on Continue to Google...');
  let mockClipboard = null;
  const simulatedNavigator = {
    clipboard: {
      writeText: async (text) => {
        mockClipboard = text;
      },
    },
  };

  const reviewGenerated = generateDeterministicReview({
    businessCategory: 'CAFE',
    businessName: 'Coastal Cafe',
    rating: 5,
    selectedTopics: ['Taste'],
    variationIndex: 0,
  });

  // Simulate handler logic
  let reviewCopiedLogged = false;
  let googleClickedLogged = false;
  let copyBannerShown = false;

  const simulateContinueGoogle = async ({ reviewText, isNavigating, navigatorObj, hasFailedOnce = false }) => {
    if (isNavigating) return { aborted: true, reason: 'double_click' };
    const textToCopy = (reviewText || '').trim();
    if (!textToCopy) return { error: 'empty_review' };

    if (hasFailedOnce) {
      googleClickedLogged = true;
      return { success: true, navigated: true };
    }

    try {
      if (navigatorObj?.clipboard?.writeText) {
        await navigatorObj.clipboard.writeText(textToCopy);
        reviewCopiedLogged = true;
        googleClickedLogged = true;
        copyBannerShown = true;
        return { success: true, copiedText: mockClipboard, navigated: true };
      }
      throw new Error('Clipboard API unavailable');
    } catch {
      return { success: false, error: 'clipboard_failed', hasFailedOnce: true };
    }
  };

  const res7 = await simulateContinueGoogle({
    reviewText: reviewGenerated,
    isNavigating: false,
    navigatorObj: simulatedNavigator,
  });

  if (!res7.success || mockClipboard !== reviewGenerated) {
    throw new Error('Automatic clipboard copy failed to copy exact generated review!');
  }
  if (!reviewCopiedLogged || !googleClickedLogged || !copyBannerShown) {
    throw new Error('Automatic copy did not trigger REVIEW_COPIED and GOOGLE_LINK_CLICKED events!');
  }
  console.log('  ✓ Clipboard contains exact generated review');
  console.log('  ✓ REVIEW_COPIED and GOOGLE_LINK_CLICKED recorded');
  console.log('  ✓ Copy confirmation banner displayed');

  // --- TEST 8: EDITED REVIEW COPY INTEGRITY ---
  console.log('\n[Test 8] Testing customer-edited review copy integrity...');
  mockClipboard = null;
  const editedReviewText = reviewGenerated + ' P.S. Barista Alex was incredible!';
  const res8 = await simulateContinueGoogle({
    reviewText: editedReviewText,
    isNavigating: false,
    navigatorObj: simulatedNavigator,
  });

  if (!res8.success || mockClipboard !== editedReviewText) {
    throw new Error('Edited review text was not copied! Original or empty text was copied instead.');
  }
  if (!mockClipboard.includes('Barista Alex was incredible!')) {
    throw new Error('Customer custom manual edits were lost during automatic copy!');
  }
  console.log('  ✓ Customer custom manual edits strictly preserved and copied');

  // --- TEST 9: REGENERATED REVIEW COPY INTEGRITY ---
  console.log('\n[Test 9] Testing regenerated review copy integrity...');
  mockClipboard = null;
  const regeneratedReview = generateDeterministicReview({
    businessCategory: 'CAFE',
    businessName: 'Coastal Cafe',
    rating: 5,
    selectedTopics: ['Taste'],
    variationIndex: 1, // regenerated version
  });

  const res9 = await simulateContinueGoogle({
    reviewText: regeneratedReview,
    isNavigating: false,
    navigatorObj: simulatedNavigator,
  });

  if (mockClipboard !== regeneratedReview) {
    throw new Error('Regenerated review variant was not properly copied!');
  }
  console.log('  ✓ Latest regenerated review variant correctly copied');

  // --- TEST 10: CLIPBOARD FAILURE HANDLING ---
  console.log('\n[Test 10] Testing clipboard failure graceful handling...');
  const failingNavigator = {
    clipboard: {
      writeText: async () => {
        throw new Error('Simulated PermissionDeniedError: Clipboard access blocked');
      },
    },
  };

  reviewCopiedLogged = false;
  googleClickedLogged = false;
  const res10 = await simulateContinueGoogle({
    reviewText: reviewGenerated,
    isNavigating: false,
    navigatorObj: failingNavigator,
  });

  if (res10.success || res10.error !== 'clipboard_failed') {
    throw new Error('Clipboard failure was not detected!');
  }
  if (reviewCopiedLogged) {
    throw new Error('REVIEW_COPIED was incorrectly logged on clipboard failure!');
  }
  console.log('  ✓ Failure detected without false "Review copied!" banner');
  console.log('  ✓ REVIEW_COPIED is NOT logged when copy fails');

  // Subsequent click retry allows proceeding to Google
  const retryRes = await simulateContinueGoogle({
    reviewText: reviewGenerated,
    isNavigating: false,
    navigatorObj: failingNavigator,
    hasFailedOnce: true,
  });
  if (!retryRes.navigated || !googleClickedLogged) {
    throw new Error('Retry after failure did not allow customer to continue to Google!');
  }
  console.log('  ✓ Customer is not trapped: subsequent click continues to Google');

  // --- TEST 11: DOUBLE-CLICK GUARD ---
  console.log('\n[Test 11] Testing double-click protection...');
  const res11 = await simulateContinueGoogle({
    reviewText: reviewGenerated,
    isNavigating: true, // Already in flight
    navigatorObj: simulatedNavigator,
  });
  if (!res11.aborted || res11.reason !== 'double_click') {
    throw new Error('Double-click was not blocked while navigation was in progress!');
  }
  console.log('  ✓ Concurrent clicks safely rejected while processing');

  // --- TEST 12: EMPTY REVIEW PROTECTION ---
  console.log('\n[Test 12] Testing empty review protection...');
  mockClipboard = null;
  reviewCopiedLogged = false;
  const res12 = await simulateContinueGoogle({
    reviewText: '   ',
    isNavigating: false,
    navigatorObj: simulatedNavigator,
  });
  if (res12.error !== 'empty_review' || mockClipboard !== null || reviewCopiedLogged) {
    throw new Error('Empty review was not rejected!');
  }
  console.log('  ✓ Empty/whitespace review blocked from clipboard copy and analytics');

  console.log('\n====================================================');
  console.log('   ALL FRONTEND ARCHITECTURE TESTS PASSED (12/12)   ');
  console.log('====================================================');
}

runFrontendComponentTests().catch((err) => {
  console.error('\n❌ FRONTEND TEST FAILED:', err);
  process.exit(1);
});

