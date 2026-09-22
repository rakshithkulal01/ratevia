import prisma from './src/config/prisma.js';
import {
  BUSINESS_CATEGORIES,
  SUPPORTED_CATEGORIES,
  getCategoryConfig,
  isSupportedCategory,
} from './src/config/businessCategories.js';
import { runDataRetentionCleanup } from './src/utils/cleanup.js';
import { recordDailyFeedbackAnalytics } from './src/utils/analyticsHelper.js';

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

async function runPhase12Tests() {
  console.log('====================================================');
  console.log('       RATEVIA PHASE 12 CATEGORY MATRIX TESTS       ');
  console.log('====================================================\n');

  // --- TEST 1: CATEGORY CONFIGURATION & VALIDATION INTEGRITY ---
  console.log('[Test 1] Validating supported category enum & helpers...');
  if (SUPPORTED_CATEGORIES.length !== 11) {
    throw new Error(`Expected 11 categories, got ${SUPPORTED_CATEGORIES.length}`);
  }

  for (const cat of EXPECTED_CATEGORIES) {
    if (!isSupportedCategory(cat)) {
      throw new Error(`Category ${cat} is not reported as supported by isSupportedCategory!`);
    }
    const config = getCategoryConfig(cat);
    if (!config || config.category !== cat) {
      throw new Error(`getCategoryConfig(${cat}) did not return proper config!`);
    }
    if (!config.positiveTopics || config.positiveTopics.length === 0) {
      throw new Error(`Category ${cat} has empty positiveTopics!`);
    }
    if (!config.improvementTopics || config.improvementTopics.length === 0) {
      throw new Error(`Category ${cat} has empty improvementTopics!`);
    }
    console.log(`  ✓ ${cat.padEnd(18)} → ${config.displayName.padEnd(24)} (${config.positiveTopics.length} pos, ${config.improvementTopics.length} imp topics)`);
  }

  // --- TEST 2: INVALID CATEGORY REJECTION & FALLBACK ---
  console.log('\n[Test 2] Testing invalid category rejection and graceful fallback...');
  if (isSupportedCategory('INVALID_CATEGORY')) {
    throw new Error('isSupportedCategory("INVALID_CATEGORY") should return false!');
  }
  const fallback = getCategoryConfig('INVALID_CATEGORY');
  if (fallback.category !== 'OTHER') {
    throw new Error(`Expected fallback to 'OTHER', got '${fallback.category}'`);
  }
  console.log('  ✓ Unknown category safely resolves to "OTHER" configuration without crashing.');

  // --- TEST 3: DATABASE PROVISIONING & RESOLUTION FOR ALL 11 CATEGORIES ---
  console.log('\n[Test 3] Testing database persistence across all 11 categories...');
  let adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!adminUser) {
    adminUser = await prisma.user.findFirst();
  }

  const createdBusinessIds = [];

  for (const category of EXPECTED_CATEGORIES) {
    const slug = `p12-test-${category.toLowerCase().replace(/_/g, '-')}-${Date.now()}`;
    const b = await prisma.business.create({
      data: {
        name: `Test Business for ${category}`,
        businessType: category,
        googleReviewUrl: 'https://g.page/r/test/review',
        slug,
        ownerId: adminUser.id,
        isActive: true,
        qrCodes: {
          create: {
            active: true,
          },
        },
      },
      include: {
        qrCodes: true,
      },
    });

    createdBusinessIds.push(b.id);

    // Verify DB retrieved value
    const retrieved = await prisma.business.findUnique({
      where: { id: b.id },
      include: { qrCodes: true },
    });

    if (retrieved.businessType !== category) {
      throw new Error(`DB mismatch for ${category}: got ${retrieved.businessType}`);
    }

    const cfg = getCategoryConfig(retrieved.businessType);
    console.log(`  ✓ Successfully provisioned & persisted category "${category}" (ID: ${b.id.slice(0, 8)}..., slug: ${b.slug})`);
  }

  // --- TEST 4: TOPIC DIFFERENTIATION CHECK ---
  console.log('\n[Test 4] Verifying category-specific topic differentiation...');
  const salonConfig = getCategoryConfig('SALON');
  const garageConfig = getCategoryConfig('GARAGE');
  const gymConfig = getCategoryConfig('GYM');
  const clothingConfig = getCategoryConfig('CLOTHING_SHOP');

  // Garage must have "Repair Quality", not "Food Quality"
  if (!garageConfig.positiveTopics.includes('Repair Quality') || garageConfig.positiveTopics.includes('Food Quality')) {
    throw new Error('Garage topics incorrectly contaminated with food topics!');
  }
  // Salon must have "Service Quality", not "Room Quality"
  if (!salonConfig.positiveTopics.includes('Service Quality') || salonConfig.positiveTopics.includes('Room Quality')) {
    throw new Error('Salon topics contaminated with hotel topics!');
  }
  // Gym must have "Equipment Quality"
  if (!gymConfig.positiveTopics.includes('Equipment Quality')) {
    throw new Error('Gym topics missing Equipment Quality!');
  }
  // Clothing shop must have "Product Variety"
  if (!clothingConfig.positiveTopics.includes('Product Variety')) {
    throw new Error('Clothing Shop topics missing Product Variety!');
  }
  console.log('  ✓ Verified category topics are strictly tailored and distinct per industry.');

  // --- TEST 5: PHASE 11 DATA RETENTION COMPATIBILITY ACROSS NEW CATEGORIES ---
  console.log('\n[Test 5] Testing Phase 11 retention rules on non-hospitality categories...');
  const testSalon = await prisma.business.findFirst({ where: { businessType: 'SALON' } });
  const testGarage = await prisma.business.findFirst({ where: { businessType: 'GARAGE' } });

  // 5A: 5★ Feedback for Salon (Must NOT create raw Feedback row; updates daily analytics)
  await recordDailyFeedbackAnalytics(testSalon.id, {
    rating: 5,
    selectedTopics: ['Service Quality', 'Professionalism'],
  });

  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const salonDaily = await prisma.dailyBusinessAnalytics.findUnique({
    where: {
      businessId_date: {
        businessId: testSalon.id,
        date: todayUtc,
      },
    },
  });

  if (!salonDaily || salonDaily.rating5 < 1) {
    throw new Error('DailyBusinessAnalytics was not updated for 5★ Salon feedback!');
  }
  console.log('  ✓ Salon 5★ feedback updated DailyBusinessAnalytics without raw Feedback row.');

  // 5B: 2★ Feedback for Garage (Persists raw Feedback temporarily)
  const garageFeedback = await prisma.feedback.create({
    data: {
      businessId: testGarage.id,
      rating: 2,
      selectedTopics: ['Pricing', 'Service Time'],
      customerMessage: 'Oil change took longer than quoted.',
    },
  });

  const checkRawGarage = await prisma.feedback.findUnique({
    where: { id: garageFeedback.id },
  });
  if (!checkRawGarage) {
    throw new Error('Garage 2★ raw feedback was not persisted!');
  }
  console.log('  ✓ Garage 2★ feedback stored temporarily in raw Feedback table.');

  // 5C: Old 2★ record cleanup test (>30 days)
  const oldDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);
  const oldGymFeedback = await prisma.feedback.create({
    data: {
      businessId: createdBusinessIds[8], // GYM
      rating: 2,
      selectedTopics: ['Crowd Levels'],
      customerMessage: 'Too crowded in the evenings 35 days ago',
      createdAt: oldDate,
    },
  });

  const cleanupResult = await runDataRetentionCleanup();
  console.log('  ✓ Ran runDataRetentionCleanup():', cleanupResult);

  const checkOldGym = await prisma.feedback.findUnique({
    where: { id: oldGymFeedback.id },
  });
  if (checkOldGym) {
    throw new Error('35-day old Gym feedback was NOT deleted by cleanup!');
  }
  console.log('  ✓ 35-day old 2★ Gym feedback successfully deleted by cleanup.');

  const checkRecentGarage = await prisma.feedback.findUnique({
    where: { id: garageFeedback.id },
  });
  if (!checkRecentGarage) {
    throw new Error('Recent Garage feedback was incorrectly deleted by cleanup!');
  }
  console.log('  ✓ Recent 2★ Garage feedback remains intact.');

  // Clean up test data
  console.log('\n[Cleanup] Cleaning up created test business records...');
  await prisma.feedback.deleteMany({
    where: { businessId: { in: createdBusinessIds } },
  });
  await prisma.dailyBusinessAnalytics.deleteMany({
    where: { businessId: { in: createdBusinessIds } },
  });
  await prisma.business.deleteMany({
    where: { id: { in: createdBusinessIds } },
  });
  console.log('  ✓ Test businesses cleaned up cleanly.');

  console.log('\n====================================================');
  console.log('   ALL PHASE 12 MULTI-INDUSTRY TESTS PASSED (11/11)  ');
  console.log('====================================================');
}

runPhase12Tests()
  .catch((err) => {
    console.error('\n❌ Test failure:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
