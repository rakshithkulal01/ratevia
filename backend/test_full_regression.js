process.env.NODE_ENV = 'test';

import prisma from './src/config/prisma.js';
import app from './src/app.js';
import http from 'http';
import { runDataRetentionCleanup } from './src/utils/cleanup.js';

let server;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return { status: res.status, data, headers: res.headers };
}

async function runRegression() {
  console.log('====================================================');
  console.log('     RATEVIA FULL BACKEND PRODUCTION REGRESSION     ');
  console.log('====================================================\n');

  // Start temporary test server
  const port = 5055;
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(port, resolve));
  baseUrl = `http://localhost:${port}`;
  console.log(`Test server running at ${baseUrl}\n`);

  let testOwner = null;
  const createdBusinessIds = [];
  const createdRequestIds = [];

  const adminHeaders = { Authorization: 'Bearer test-token-admin' };
  const ownerHeaders = { Authorization: 'Bearer test-token-business_owner' };

  try {
    // 0. Setup Mock Users
    console.log('[Setup] Locating or creating test accounts...');
    testOwner = await prisma.user.findFirst({ where: { role: 'BUSINESS_OWNER' } });
    if (!testOwner) {
      testOwner = await prisma.user.create({
        data: {
          email: `owner-reg-${Date.now()}@ratevia.com`,
          name: 'Regression Owner',
          role: 'BUSINESS_OWNER',
          supabaseUserId: `owner-reg-${Date.now()}`,
        },
      });
    }

    // ==========================================
    // SECTION 1: AUTHENTICATION & AUTHORIZATION
    // ==========================================
    console.log('\n--- SECTION 1: AUTHENTICATION & AUTHORIZATION ---');

    console.log('[Auth 1] Unauthenticated request to admin endpoint is rejected (401)...');
    const unauthRes = await request('/api/admin/stats');
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated admin call, got ${unauthRes.status}`);
    }
    console.log('  ✓ 401 Unauthorized correctly returned');

    console.log('[Auth 2] Non-admin business owner accessing admin endpoint is forbidden (403)...');
    const nonAdminRes = await request('/api/admin/stats', { headers: ownerHeaders });
    if (nonAdminRes.status !== 403) {
      throw new Error(`Expected 403 for non-admin call, got ${nonAdminRes.status}`);
    }
    console.log('  ✓ 403 Forbidden correctly returned for standard business owner');

    console.log('[Auth 3] Admin accessing admin endpoint succeeds (200)...');
    const adminRes = await request('/api/admin/stats', { headers: adminHeaders });
    if (adminRes.status !== 200 || !adminRes.data.stats) {
      throw new Error(`Expected 200 and stats payload, got ${adminRes.status}`);
    }
    console.log(`  ✓ 200 OK: Total businesses = ${adminRes.data.stats.totalBusinesses}`);

    // ==========================================
    // SECTION 2: QR & PUBLIC BUSINESS LOOKUP
    // ==========================================
    console.log('\n--- SECTION 2: QR & PUBLIC BUSINESS LOOKUP ---');

    // Create a regression test business
    const testSlug = `reg-test-biz-${Date.now()}`;
    const testBiz = await prisma.business.create({
      data: {
        name: 'Full Regression Bistro',
        slug: testSlug,
        businessType: 'RESTAURANT',
        googleReviewUrl: 'https://g.page/r/full-regression',
        ownerId: testOwner.id,
        isActive: true,
        qrCodes: {
          create: { active: true },
        },
      },
    });
    createdBusinessIds.push(testBiz.id);

    console.log('[QR 1] Public QR lookup for active business returns 200...');
    const qrRes = await request(`/api/qr/public/${testSlug}`);
    if (qrRes.status !== 200 || qrRes.data.business.name !== 'Full Regression Bistro') {
      throw new Error(`QR lookup failed: status ${qrRes.status}`);
    }
    console.log('  ✓ 200 OK: Active business resolved');

    console.log('[QR 2] Non-existent business returns 403 BusinessSuspended...');
    const notFoundQr = await request('/api/qr/public/this-slug-does-not-exist-xyz');
    if (notFoundQr.status !== 403 || notFoundQr.data.error !== 'BusinessSuspended') {
      throw new Error(`Expected 403 BusinessSuspended, got ${notFoundQr.status}`);
    }
    console.log('  ✓ 403 BusinessSuspended correctly returned');

    console.log('[QR 3] Suspended business returns 403 BusinessSuspended...');
    await prisma.business.update({ where: { id: testBiz.id }, data: { isActive: false } });
    const suspendedQr = await request(`/api/qr/public/${testSlug}`);
    if (suspendedQr.status !== 403 || suspendedQr.data.error !== 'BusinessSuspended') {
      throw new Error(`Expected 403 for suspended business, got ${suspendedQr.status}`);
    }
    console.log('  ✓ 403 BusinessSuspended correctly returned');

    // Reactivate for feedback tests
    await prisma.business.update({ where: { id: testBiz.id }, data: { isActive: true } });

    // ==========================================
    // SECTION 3: FEEDBACK RETENTION & ANALYTICS
    // ==========================================
    console.log('\n--- SECTION 3: FEEDBACK RETENTION & ANALYTICS ---');

    console.log('[Feedback 1] Submitting 5★ positive review (Phase 11 Retention Policy)...');
    const sessionId1 = '11111111-1111-4111-8111-111111111111';
    const fiveStarRes = await request('/api/feedback', {
      method: 'POST',
      body: {
        businessSlug: testSlug,
        sessionId: sessionId1,
        rating: 5,
        selectedTopics: ['Great Food', 'Friendly Service'],
        customerMessage: 'Amazing dinner tonight! Must visit.',
        generatedReview: 'Antigravity Bistro offers great food and friendly service.',
      },
    });

    if (fiveStarRes.status !== 201) {
      throw new Error(`Expected 201 for 5★ feedback, got ${fiveStarRes.status}`);
    }
    if (!fiveStarRes.data.feedbackId.startsWith('transient-')) {
      throw new Error(`Expected transient feedbackId for 5★, got: ${fiveStarRes.data.feedbackId}`);
    }

    // Verify raw row is NOT in database
    const rawFiveStar = await prisma.feedback.findFirst({
      where: { businessId: testBiz.id, rating: 5 },
    });
    if (rawFiveStar) {
      throw new Error('5★ feedback row was found in raw Feedback table! Violates Phase 11 privacy retention!');
    }
    console.log('  ✓ 5★ feedback aggregated without persisting raw customer text');

    // Test transient copy action
    const copyRes = await request(`/api/feedback/${fiveStarRes.data.feedbackId}/copied`, {
      method: 'PATCH',
      body: { sessionId: sessionId1 },
    });
    if (copyRes.status !== 200 || !copyRes.data.success) {
      throw new Error(`Failed to record copy on transient feedback: ${copyRes.status}`);
    }
    console.log('  ✓ Review copy recorded on transient feedback ID');

    // Test transient google click action
    const googleRes = await request(`/api/feedback/${fiveStarRes.data.feedbackId}/google-clicked`, {
      method: 'PATCH',
      body: { sessionId: sessionId1 },
    });
    if (googleRes.status !== 200 || !googleRes.data.success) {
      throw new Error(`Failed to record google click on transient feedback: ${googleRes.status}`);
    }
    console.log('  ✓ Google click recorded on transient feedback ID');

    console.log('[Feedback 2] Submitting 2★ constructive feedback...');
    const sessionId2 = '22222222-2222-4222-8222-222222222222';
    const twoStarRes = await request('/api/feedback', {
      method: 'POST',
      body: {
        businessSlug: testSlug,
        sessionId: sessionId2,
        rating: 2,
        selectedTopics: ['Slow Service'],
        customerMessage: 'We waited 45 minutes for our drinks.',
      },
    });

    if (twoStarRes.status !== 201) {
      throw new Error(`Expected 201 for 2★ feedback, got ${twoStarRes.status}`);
    }
    if (twoStarRes.data.feedbackId.startsWith('transient-')) {
      throw new Error('2★ feedback returned transient ID instead of persistent ID!');
    }

    // Verify raw row IS in database
    const rawTwoStar = await prisma.feedback.findUnique({
      where: { id: twoStarRes.data.feedbackId },
    });
    if (!rawTwoStar || rawTwoStar.customerMessage !== 'We waited 45 minutes for our drinks.') {
      throw new Error('2★ feedback row not properly persisted in database!');
    }
    console.log('  ✓ 2★ feedback temporarily stored for operational review');

    // Verify DailyBusinessAnalytics holds both ratings
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dailyAnalytics = await prisma.dailyBusinessAnalytics.findUnique({
      where: {
        businessId_date: {
          businessId: testBiz.id,
          date: today,
        },
      },
    });
    if (!dailyAnalytics || dailyAnalytics.rating5 !== 1 || dailyAnalytics.rating2 !== 1) {
      throw new Error(`DailyBusinessAnalytics counters incorrect: ${JSON.stringify(dailyAnalytics)}`);
    }
    console.log('  ✓ DailyBusinessAnalytics accurately reflects aggregate ratings (1x 5★, 1x 2★)');

    // ==========================================
    // SECTION 4: DATA RETENTION CLEANUP
    // ==========================================
    console.log('\n--- SECTION 4: DATA RETENTION CLEANUP (30-DAY PURGE) ---');

    // Create an artificial 35-day-old 2★ feedback
    const oldDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);
    const oldFeedback = await prisma.feedback.create({
      data: {
        businessId: testBiz.id,
        rating: 2,
        customerMessage: 'Old message from 35 days ago',
        createdAt: oldDate,
      },
    });

    const cleanupResult = await runDataRetentionCleanup();
    console.log(`  ✓ Ran retention cleanup: deleted ${cleanupResult.deletedFeedbacks} feedbacks`);

    const shouldBeDeleted = await prisma.feedback.findUnique({
      where: { id: oldFeedback.id },
    });
    if (shouldBeDeleted) {
      throw new Error('35-day old feedback was not deleted by retention cleanup!');
    }
    const shouldRemain = await prisma.feedback.findUnique({
      where: { id: twoStarRes.data.feedbackId },
    });
    if (!shouldRemain) {
      throw new Error('Recent feedback was improperly deleted by retention cleanup!');
    }
    console.log('  ✓ 30-day cutoff strictly enforced: stale feedback purged, recent feedback preserved');

    // ==========================================
    // SECTION 5: BUSINESS PROVISIONING & WORKFLOW
    // ==========================================
    console.log('\n--- SECTION 5: BUSINESS PROVISIONING & TRANSACTIONS ---');

    // 5.1 Provision without requestId
    console.log('[Provision 1] Provisioning standalone business without requestId...');
    const provRes1 = await request('/api/admin/businesses', {
      method: 'POST',
      headers: adminHeaders,
      body: {
        name: 'Direct Provision Studio',
        businessType: 'SALON',
        googleReviewUrl: 'https://g.page/r/direct-provision',
        ownerEmail: `salon-${Date.now()}@example.com`,
        ownerName: 'Priya Sharma',
      },
    });

    if (provRes1.status !== 201 || !provRes1.data.business) {
      throw new Error(`Direct provisioning failed: status ${provRes1.status}, ${JSON.stringify(provRes1.data)}`);
    }
    createdBusinessIds.push(provRes1.data.business.id);
    console.log(`  ✓ Business provisioned: ${provRes1.data.business.name} (linkedRequestId: ${provRes1.data.linkedRequestId})`);

    // 5.2 Provision with requestId (atomic link)
    console.log('[Provision 2] Creating business request and provisioning with requestId...');
    const reqRes = await request('/api/business-requests', {
      method: 'POST',
      body: {
        ownerName: 'Devan Nair',
        businessName: 'Nair Auto Care',
        businessType: 'GARAGE',
        phoneNumber: '+919988776655',
        email: `devan-${Date.now()}@nairauto.com`,
        city: 'Kochi',
        message: 'Ready to purchase ₹1,000 package',
      },
    });

    if (reqRes.status !== 201) {
      throw new Error(`Failed to submit business request: ${reqRes.status}`);
    }
    const requestId = reqRes.data.request.id;
    createdRequestIds.push(requestId);
    console.log(`  ✓ Request created: ${requestId}`);

    // Mark as CONTACTED
    const contactRes = await request(`/api/admin/business-requests/${requestId}/contact`, {
      method: 'PATCH',
      headers: adminHeaders,
    });
    if (contactRes.status !== 200 || contactRes.data.request.status !== 'CONTACTED') {
      throw new Error(`Failed to mark request as contacted: ${contactRes.status}`);
    }
    console.log('  ✓ Request status transitioned to CONTACTED');

    // Provision linking to requestId
    const provRes2 = await request('/api/admin/businesses', {
      method: 'POST',
      headers: adminHeaders,
      body: {
        name: 'Nair Auto Care',
        businessType: 'GARAGE',
        googleReviewUrl: 'https://g.page/r/nair-auto',
        ownerEmail: `devan-${Date.now()}@nairauto.com`,
        ownerName: 'Devan Nair',
        requestId,
      },
    });

    if (provRes2.status !== 201) {
      throw new Error(`Provisioning with requestId failed: ${provRes2.status}`);
    }
    createdBusinessIds.push(provRes2.data.business.id);

    // Verify request status transitioned to PROVISIONED
    const updatedReq = await prisma.businessRequest.findUnique({
      where: { id: requestId },
    });
    if (updatedReq.status !== 'PROVISIONED' || updatedReq.provisionedBusinessId !== provRes2.data.business.id) {
      throw new Error('BusinessRequest not atomically updated to PROVISIONED with business ID!');
    }
    console.log('  ✓ BusinessRequest atomically updated to PROVISIONED and linked to new Business');

    // 5.3 Duplicate provisioning rejection (409)
    console.log('[Provision 3] Attempting duplicate provisioning on already-provisioned request (409)...');
    const dupProvRes = await request('/api/admin/businesses', {
      method: 'POST',
      headers: adminHeaders,
      body: {
        name: 'Nair Auto Care Duplicate',
        businessType: 'GARAGE',
        googleReviewUrl: 'https://g.page/r/nair-auto-dup',
        ownerEmail: `devan-dup-${Date.now()}@nairauto.com`,
        requestId,
      },
    });
    if (dupProvRes.status !== 409) {
      throw new Error(`Expected 409 for duplicate provisioning, got ${dupProvRes.status}`);
    }
    console.log('  ✓ Duplicate provisioning rejected with 409 Conflict');

    // ==========================================
    // SECTION 6: ADMIN DIRECTORY & STATUS TOGGLE
    // ==========================================
    console.log('\n--- SECTION 6: ADMIN DIRECTORY & STATUS MANAGEMENT ---');

    console.log('[Admin 1] Fetching all businesses directory...');
    const dirRes = await request('/api/admin/businesses', { headers: adminHeaders });
    if (dirRes.status !== 200 || !Array.isArray(dirRes.data.businesses)) {
      throw new Error(`Failed to fetch businesses: ${dirRes.status}`);
    }
    console.log(`  ✓ Successfully retrieved directory with ${dirRes.data.businesses.length} businesses`);

    console.log('[Admin 2] Toggling business status ACTIVE -> SUSPENDED -> ACTIVE...');
    const toggleSuspended = await request(`/api/admin/businesses/${testBiz.id}/status`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: { status: 'SUSPENDED' },
    });
    if (toggleSuspended.status !== 200 || toggleSuspended.data.business.isActive !== false) {
      throw new Error(`Failed to suspend business: ${toggleSuspended.status}`);
    }
    console.log('  ✓ Business successfully suspended');

    const toggleActive = await request(`/api/admin/businesses/${testBiz.id}/status`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: { isActive: true },
    });
    if (toggleActive.status !== 200 || toggleActive.data.business.isActive !== true) {
      throw new Error(`Failed to reactivate business: ${toggleActive.status}`);
    }
    console.log('  ✓ Business successfully reactivated');

    console.log('\n====================================================');
    console.log('      ALL FULL BACKEND REGRESSION TESTS PASSED!     ');
    console.log('====================================================');
  } finally {
    console.log('\n[Cleanup] Cleaning up test records...');
    try {
      if (createdRequestIds.length > 0) {
        await prisma.businessRequest.deleteMany({
          where: { id: { in: createdRequestIds } },
        });
      }
      for (const bizId of createdBusinessIds) {
        await prisma.dailyBusinessAnalytics.deleteMany({ where: { businessId: bizId } });
        await prisma.analyticsEvent.deleteMany({ where: { businessId: bizId } });
        await prisma.feedback.deleteMany({ where: { businessId: bizId } });
        await prisma.qRCode.deleteMany({ where: { businessId: bizId } });
        await prisma.business.deleteMany({ where: { id: bizId } });
      }
      console.log('✓ Cleanup complete.');
    } catch (cleanupErr) {
      console.warn('Cleanup warning:', cleanupErr.message);
    }

    if (server) {
      server.close();
    }
  }
}

runRegression().catch((err) => {
  console.error('\n❌ REGRESSION TEST FAILED:', err);
  process.exit(1);
});
