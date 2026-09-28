import prisma from './src/config/prisma.js';
import pricingService from './src/services/pricingService.js';
import qrRequestService from './src/services/qrRequestService.js';
import adminService from './src/services/adminService.js';

console.log('====================================================');
console.log(' RATEVIA PUBLIC QR CUSTOMIZATION & PRICING TESTS  ');
console.log('====================================================\n');

let total = 0;
let passed = 0;

function assert(condition, name, details = '') {
  total++;
  if (condition) {
    passed++;
    console.log(`[PASS] ${name}`);
  } else {
    console.error(`[FAIL] ${name} ${details ? '- ' + details : ''}`);
  }
}

async function runTests() {
  const testRunId = Date.now();
  const testEmail = `test-requester-${testRunId}@example.com`;
  const testPhone = `98765${String(testRunId).slice(-5)}`;

  // 1. Setup Admin and Normal User in DB
  const adminUser = await prisma.user.upsert({
    where: { email: `admin-${testRunId}@ratevia.test` },
    create: {
      email: `admin-${testRunId}@ratevia.test`,
      name: 'Test Admin',
      role: 'ADMIN',
      supabaseUserId: `admin-sb-${testRunId}`,
    },
    update: {},
  });

  const normalUser = await prisma.user.upsert({
    where: { email: `owner-${testRunId}@ratevia.test` },
    create: {
      email: `owner-${testRunId}@ratevia.test`,
      name: 'Test Owner',
      role: 'BUSINESS_OWNER',
      supabaseUserId: `owner-sb-${testRunId}`,
    },
    update: {},
  });

  // ----------------------------------------------------------------
  // SECTION 1: PUBLIC PRICING & AUTO-SEED
  // ----------------------------------------------------------------
  console.log('--- 1. Testing Dynamic Pricing Service ---');

  const initialPriceData = await pricingService.getPublicPrice();
  assert(typeof initialPriceData.price === 'number', 'Public price is a number', `got ${initialPriceData.price}`);
  assert(initialPriceData.currency === 'INR', 'Currency is INR');

  // Admin updates price to ₹1,499
  const updatedPricing = await pricingService.updatePrice({
    newPrice: 1499,
    currency: 'INR',
    adminUser,
  });
  assert(updatedPricing.price === 1499, 'Admin updated price to ₹1499');

  const newPublicPrice = await pricingService.getPublicPrice();
  assert(newPublicPrice.price === 1499, 'Public price reflects updated price (₹1499)');

  // Verify price history audit
  const history = await pricingService.getPriceHistory();
  assert(history.length > 0, 'Price history records audit events');
  assert(history[0].newPrice === 1499, 'Latest history entry shows newPrice 1499');
  assert(history[0].changedBy?.id === adminUser.id, 'History correctly links admin user');

  // Test non-negative price validation
  let caughtNegative = false;
  try {
    await pricingService.updatePrice({ newPrice: -50, adminUser });
  } catch (err) {
    caughtNegative = err.status === 400;
  }
  assert(caughtNegative, 'Negative price rejected with 400 error');

  // ----------------------------------------------------------------
  // SECTION 2: PUBLIC QR CUSTOMIZATION SUBMISSION & PRICE SNAPSHOT
  // ----------------------------------------------------------------
  console.log('\n--- 2. Testing Public QR Request Submission ---');

  const qrConfig = {
    selectedAccent: 'warm',
    selectedStyle: 'classic',
    selectedMessage: 'Scan to share your experience',
    initials: 'CH',
  };

  const submitPayload = {
    businessName: 'The Coastal Cafe',
    category: 'CAFE',
    contactName: 'Rohan Shetty',
    phone: testPhone,
    countryCode: '+91',
    email: testEmail,
    city: 'Mangalore',
    destinationUrl: 'https://coastalcafe.in/menu',
    qrConfig,
  };

  const createdRequest = await qrRequestService.createQRRequest(submitPayload);
  assert(Boolean(createdRequest.id), 'QR request created successfully with ID');
  assert(createdRequest.referenceId.startsWith('RV-'), 'Human-friendly reference ID generated (RV-XXXXXX)');
  assert(createdRequest.quotedPrice === 1499, 'Quoted price snapshot captured current price (1499)');
  assert(createdRequest.status === 'NEW', 'Initial request status is NEW');

  // Test duplicate prevention within 24 hours
  let caughtDuplicate = false;
  try {
    await qrRequestService.createQRRequest(submitPayload);
  } catch (err) {
    caughtDuplicate = err.status === 409;
  }
  assert(caughtDuplicate, 'Duplicate submission within 24h rejected with 409 DuplicateRequest');

  // Now change global price to ₹2,000 and verify historical quote remains ₹1,499
  await pricingService.updatePrice({ newPrice: 2000, adminUser });
  const fetchedRequest = await qrRequestService.getAdminQRRequestById(createdRequest.id);
  assert(
    fetchedRequest.quotedPrice === 1499,
    'Historical quoted price remains immutable (₹1499) after global price change to ₹2000'
  );

  // Test safe public status endpoint
  const publicStatus = await qrRequestService.getPublicRequestStatus(createdRequest.id);
  assert(publicStatus.id === createdRequest.id, 'Public request status retrieved');
  assert(publicStatus.quotedPrice === 1499, 'Public request status shows quotedPrice');
  assert(publicStatus.ownerName === undefined, 'Sensitive internal contact fields excluded from public status');

  // ----------------------------------------------------------------
  // SECTION 3: ADMIN APPROVAL WORKFLOW
  // ----------------------------------------------------------------
  console.log('\n--- 3. Testing Admin Approval Workflow ---');

  // Contact action
  const contactResult = await adminService.logRequestContact(createdRequest.id, adminUser);
  assert(contactResult.request.status === 'CONTACTED', 'Admin marks request as CONTACTED');
  assert(Boolean(contactResult.request.contactedAt), 'contactedAt timestamp recorded');

  // Approve action
  const approveResult = await qrRequestService.approveRequest(createdRequest.id, adminUser);
  assert(approveResult.request.status === 'APPROVED', 'Admin approves request (status: APPROVED)');
  assert(Boolean(approveResult.request.approvedAt), 'approvedAt timestamp recorded');
  assert(approveResult.request.approvedById === adminUser.id, 'approvedById links admin');

  // Reject action on another request
  const secondPhone = `98765${String(testRunId + 1).slice(-5)}`;
  const rejectableReq = await qrRequestService.createQRRequest({
    businessName: 'Unsuitable Business',
    category: 'OTHER',
    contactName: 'Fake Person',
    phone: secondPhone,
    email: `fake-${testRunId}@example.com`,
    destinationUrl: 'https://spam.example.com',
    qrConfig: {},
  });

  const rejectResult = await qrRequestService.rejectRequest(
    rejectableReq.id,
    'Destination URL violates acceptable use policy.',
    adminUser
  );
  assert(rejectResult.request.status === 'REJECTED', 'Admin rejects request (status: REJECTED)');
  assert(rejectResult.request.rejectionReason.includes('violates acceptable use'), 'Rejection reason recorded');

  // Cannot approve a rejected request
  let caughtApproveRejected = false;
  try {
    await qrRequestService.approveRequest(rejectableReq.id, adminUser);
  } catch (err) {
    caughtApproveRejected = err.status === 400;
  }
  assert(caughtApproveRejected, 'Approving a rejected request is prohibited (400)');

  // ----------------------------------------------------------------
  // SECTION 4: BUSINESS PROVISIONING INTEGRATION
  // ----------------------------------------------------------------
  console.log('\n--- 4. Testing Business Provisioning Integration ---');

  const provisionResult = await adminService.provisionBusiness({
    name: 'The Coastal Cafe',
    businessType: 'CAFE',
    destinationUrl: 'https://coastalcafe.in/menu',
    ownerEmail: `owner-${testRunId}@coastalcafe.in`,
    ownerName: 'Rohan Shetty',
    requestId: createdRequest.id,
  });

  assert(Boolean(provisionResult.business.id), 'Business provisioned successfully');
  assert(provisionResult.linkedRequestId === createdRequest.id, 'Business linked to requestId');
  assert(provisionResult.business.destinationUrl === 'https://coastalcafe.in/menu', 'destinationUrl stored on Business');

  // Verify request transitioned to PROVISIONED
  const postProvisionReq = await qrRequestService.getAdminQRRequestById(createdRequest.id);
  assert(postProvisionReq.status === 'PROVISIONED', 'Request status transitioned to PROVISIONED');
  assert(Boolean(postProvisionReq.provisionedAt), 'provisionedAt timestamp recorded');
  assert(postProvisionReq.provisionedBusinessId === provisionResult.business.id, 'provisionedBusinessId linked');

  // Cannot provision the same request twice
  let caughtDoubleProvision = false;
  try {
    await adminService.provisionBusiness({
      name: 'The Coastal Cafe Duplicate',
      businessType: 'CAFE',
      googleReviewUrl: 'https://coastalcafe.in/menu',
      ownerEmail: `owner-dup-${testRunId}@coastalcafe.in`,
      requestId: createdRequest.id,
    });
  } catch (err) {
    caughtDoubleProvision = err.status === 409;
  }
  assert(caughtDoubleProvision, 'Duplicate provisioning on same requestId rejected with 409 Conflict');

  // Cleanup test pricing back to ₹1,000 for standard environment
  await pricingService.updatePrice({ newPrice: 1000, adminUser });

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed}/${total} Passed (${total - passed} Failed)`);
  console.log('====================================================');

  await prisma.$disconnect();

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Unhandled test error:', err);
  process.exit(1);
});
