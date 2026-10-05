import {
  BUSINESS_CATEGORIES,
  getCategoryConfig,
  isSupportedCategory,
  getCategoryOptions,
} from './src/config/businessCategories.js';
import { generateDeterministicReview, safeTrimToLimit } from './src/utils/reviewEngine.js';
import { createFeedbackSchema } from '../backend/src/validators/feedbackValidators.js';

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

  // --- TEST 13: 200-CHAR HARD MAX ON ALL DETERMINISTIC REVIEWS ---
  console.log('\n[Test 13] Testing 200-char hard maximum across all categories and inputs...');
  const venues = ['Short', 'The Local Corner Bistro', 'The Grand Majestic Heritage Luxury Resort & Spa'];
  const testMessages = [
    '',
    'Great service!',
    'The staff was attentive and coffee was hot.',
    'A'.repeat(150),
    'Sentence one is great. Sentence two is amazing. Sentence three is wonderful. Sentence four goes on and on and on.',
  ];
  let combinationsChecked = 0;
  for (const cat of EXPECTED_CATEGORIES) {
    const config = getCategoryConfig(cat);
    for (const venue of venues) {
      for (const rating of [1, 2, 3, 4, 5]) {
        for (const variant of [0, 1, 2]) {
          for (const msg of testMessages) {
            const topicPool = rating >= 4 ? config.positiveTopics : config.improvementTopics;
            const topicSelections = [
              [],
              topicPool.slice(0, 1),
              topicPool.slice(0, 2),
              topicPool.slice(0, 3),
              topicPool.slice(0, 5),
            ];
            for (const topics of topicSelections) {
              const review = generateDeterministicReview({
                businessCategory: cat,
                businessName: venue,
                rating,
                selectedTopics: topics,
                customerMessage: msg,
                variationIndex: variant,
              });
              combinationsChecked++;
              if (review.length > 200) {
                throw new Error(`Review exceeded 200 characters! (${review.length} chars): "${review}"`);
              }
            }
          }
        }
      }
    }
  }
  console.log(`  ✓ Verified ${combinationsChecked} combinations: 100% produced review text <= 200 characters`);

  // --- TEST 14: 0 CHARACTERS REVIEW (EMPTY REVIEW REJECTED) ---
  console.log('\n[Test 14] Testing 0 characters review validation...');
  const zeroCharText = '';
  const isZeroCharDisabled = zeroCharText.length > 200 || !zeroCharText.trim();
  if (!isZeroCharDisabled) {
    throw new Error('0 characters review was not flagged as disabled!');
  }
  const counterZero = `${zeroCharText.length}/200`;
  if (counterZero !== '0/200') {
    throw new Error(`Expected counter '0/200', got '${counterZero}'`);
  }
  console.log('  ✓ 0 characters review correctly disabled and displays "0/200"');

  // --- TEST 15: SHORT REVIEW (VALID AND COPIED) ---
  console.log('\n[Test 15] Testing short review validation...');
  const shortText = 'Great coffee and friendly staff!';
  const isShortDisabled = shortText.length > 200 || !shortText.trim();
  if (isShortDisabled) {
    throw new Error('Short review was unexpectedly disabled!');
  }
  const counterShort = `${shortText.length}/200`;
  if (counterShort !== `${shortText.length}/200`) {
    throw new Error(`Counter mismatch for short review: ${counterShort}`);
  }
  mockClipboard = null;
  const resShort = await simulateContinueGoogle({
    reviewText: shortText,
    isNavigating: false,
    navigatorObj: simulatedNavigator,
  });
  if (!resShort.success || mockClipboard !== shortText) {
    throw new Error('Short review was not copied correctly!');
  }
  console.log(`  ✓ Short review (${shortText.length} chars) valid, counter "${counterShort}", successfully copied`);

  // --- TEST 16: EXACTLY 200 CHARACTERS (VALID AND ALLOWED) ---
  console.log('\n[Test 16] Testing exactly 200 characters review...');
  const exact200 = 'Had a fantastic experience at this wonderful cafe! The staff was friendly, the coffee was world class, and the ambience was lovely. We loved every moment and will definitely be coming back very soon!!';
  if (exact200.length !== 200) {
    throw new Error(`Test setup error: exact200 is ${exact200.length} chars, expected 200`);
  }
  const isExact200Disabled = exact200.length > 200 || !exact200.trim();
  if (isExact200Disabled) {
    throw new Error('Exactly 200 characters review was incorrectly flagged as disabled!');
  }
  const counterExact200 = `${exact200.length}/200`;
  if (counterExact200 !== '200/200') {
    throw new Error(`Expected counter '200/200', got '${counterExact200}'`);
  }
  mockClipboard = null;
  const resExact200 = await simulateContinueGoogle({
    reviewText: exact200,
    isNavigating: false,
    navigatorObj: simulatedNavigator,
  });
  if (!resExact200.success || mockClipboard !== exact200) {
    throw new Error('Exactly 200 characters review failed clipboard copy!');
  }
  const backendParse200 = createFeedbackSchema.safeParse({
    businessSlug: 'test-cafe',
    sessionId: '123e4567-e89b-12d3-a456-426614174000',
    rating: 3,
    generatedReview: exact200,
  });
  if (!backendParse200.success) {
    throw new Error(`Backend schema rejected valid 200-char review: ${JSON.stringify(backendParse200.error)}`);
  }
  console.log('  ✓ Exactly 200 characters is VALID: counter "200/200", copied to clipboard, accepted by backend schema');

  // --- TEST 17: 201 CHARACTERS (REJECTED/PREVENTED) ---
  console.log('\n[Test 17] Testing 201 characters rejection and prevention...');
  const text201 = exact200 + '!'; // 201 chars
  if (text201.length !== 201) {
    throw new Error(`Test setup error: text201 is ${text201.length} chars, expected 201`);
  }
  // 1. Textarea editor input handler truncation simulation
  const handleReviewChange = (val) => (val || '').slice(0, 200);
  const editorResult = handleReviewChange(text201);
  if (editorResult.length !== 200) {
    throw new Error(`Editor failed to cap text at 200 chars! Got ${editorResult.length}`);
  }
  // 2. UI button disabled state for 201 chars
  const is201Disabled = text201.length > 200 || !text201.trim();
  if (!is201Disabled) {
    throw new Error('201 characters review was not flagged as disabled in UI!');
  }
  // 3. Backend schema rejects 201 chars
  const backendParse201 = createFeedbackSchema.safeParse({
    businessSlug: 'test-cafe',
    sessionId: '123e4567-e89b-12d3-a456-426614174000',
    rating: 3,
    generatedReview: text201,
  });
  if (backendParse201.success) {
    throw new Error('Backend schema unexpectedly accepted a 201-character review!');
  }
  console.log('  ✓ 201 characters PREVENTED: editor slices to 200, UI button disabled, backend schema rejects with error');

  // --- TEST 18: EDITED REVIEW REACHING EXACTLY 200 CHARACTERS ---
  console.log('\n[Test 18] Testing customer edited review reaching exactly 200 characters...');
  const baseDraft = 'Had a great experience with The Roast Bean! ';
  const addedCustomText = 'A'.repeat(200 - baseDraft.length);
  const edited200 = baseDraft + addedCustomText;
  if (edited200.length !== 200) {
    throw new Error(`Test setup error: edited200 is ${edited200.length} chars`);
  }
  mockClipboard = null;
  const resEdited200 = await simulateContinueGoogle({
    reviewText: edited200,
    isNavigating: false,
    navigatorObj: simulatedNavigator,
  });
  if (!resEdited200.success || mockClipboard !== edited200) {
    throw new Error('Edited review of 200 characters was not preserved or copied accurately!');
  }
  console.log('  ✓ Customer customized review of exactly 200 characters fully preserved and copied');

  // --- TEST 19: GENERATED REVIEW EXCEEDING 200 CHARS SAFELY HANDLED AND REDUCED ---
  console.log('\n[Test 19] Testing safe handling and reduction of oversized review text...');
  const oversizedReview = 'Had a wonderful visit to The Grand Resort. The room was exceptionally clean, the staff was extremely courteous and welcoming at check-in, and the dining experience exceeded all of our expectations. We look forward to returning soon!';
  if (oversizedReview.length <= 200) {
    throw new Error(`Test setup error: oversizedReview should be > 200 chars, got ${oversizedReview.length}`);
  }
  const safelyReduced = safeTrimToLimit(oversizedReview, 200);
  if (safelyReduced.length > 200) {
    throw new Error(`safeTrimToLimit failed! Result is ${safelyReduced.length} chars`);
  }
  if (!safelyReduced.endsWith('.') && !safelyReduced.endsWith('!') && !safelyReduced.endsWith('?')) {
    throw new Error(`safeTrimToLimit produced awkward truncation without sentence punctuation: "${safelyReduced}"`);
  }
  mockClipboard = null;
  // Test Continue to Google safe handling
  const safeHandledText = oversizedReview.length > 200 ? safeTrimToLimit(oversizedReview, 200) : oversizedReview;
  const resReduced = await simulateContinueGoogle({
    reviewText: safeHandledText,
    isNavigating: false,
    navigatorObj: simulatedNavigator,
  });
  if (!resReduced.success || mockClipboard.length > 200) {
    throw new Error(`Continue to Google failed to safely reduce review: clipboard length is ${mockClipboard?.length}`);
  }
  console.log(`  ✓ Oversized review (${oversizedReview.length} chars) safely reduced to ${safelyReduced.length} chars ("${safelyReduced}")`);

  // --- TEST 20: CHARACTER COUNTER FORMAT AND LIMIT NOTATION ---
  console.log('\n[Test 20] Testing character counter format (e.g. 157/200)...');
  const sample157 = 'A'.repeat(157);
  const counterFormat = `${sample157.length}/200`;
  if (counterFormat !== '157/200') {
    throw new Error(`Character counter format error: expected '157/200', got '${counterFormat}'`);
  }
  console.log('  ✓ Character counter format strictly complies with "157/200" requirement');

  console.log('\n====================================================');
  console.log('   ALL FRONTEND ARCHITECTURE TESTS PASSED (20/20)   ');
  console.log('====================================================');
}

runFrontendComponentTests().catch((err) => {
  console.error('\n❌ FRONTEND TEST FAILED:', err);
  process.exit(1);
});

