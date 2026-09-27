import 'dotenv/config';
process.env.NODE_ENV = 'test';

import prisma from './src/config/prisma.js';
import app from './src/app.js';
import http from 'http';
import { getNormalizedDate, flushPendingAnalytics } from './src/utils/analyticsHelper.js';

let server;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const start = performance.now();
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const duration = performance.now() - start;

  let data = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return { status: res.status, data, duration };
}

async function runConcurrencyTests() {
  console.log('====================================================');
  console.log('    RATEVIA QR LOOKUP & CONCURRENCY LOAD TESTS      ');
  console.log('====================================================\n');

  const port = 5066;
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(port, resolve));
  baseUrl = `http://localhost:${port}`;
  console.log(`Test server active at ${baseUrl}\n`);

  let testBiz = null;
  let testOwner = null;

  try {
    // 1. Setup isolated test business
    console.log('[Setup] Connecting and creating isolated test business...');
    for (let setupAttempt = 0; setupAttempt < 5; setupAttempt++) {
      try {
        testOwner = await prisma.user.findFirst({ where: { role: 'BUSINESS_OWNER' } });
        if (!testOwner) {
          testOwner = await prisma.user.create({
            data: {
              email: `concur-owner-${Date.now()}@ratevia.test`,
              name: 'Concurrency Owner',
              role: 'BUSINESS_OWNER',
              supabaseUserId: `concur-sub-${Date.now()}`,
            },
          });
        }
        break;
      } catch (connErr) {
        if (setupAttempt === 4) throw connErr;
        console.log(`  [Notice] Initial connection attempt ${setupAttempt + 1} failed (${connErr.message.split('\n')[0]}). Retrying in 2s...`);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    const slug = `load-test-cafe-${Date.now()}`;
    testBiz = await prisma.business.create({
      data: {
        name: 'The Concurrency Cafe',
        slug,
        businessType: 'CAFE',
        googleReviewUrl: 'https://g.page/r/concurrency-cafe',
        ownerId: testOwner.id,
        isActive: true,
        qrCodes: {
          create: { active: true },
        },
      },
    });
    console.log(`  ✓ Created test business "${testBiz.name}" (slug: ${slug})\n`);

    // 2. Functional & Security Audit on QR lookup response payload
    console.log('[Audit 1] Verifying response payload fields and security...');
    const singleRes = await request(`/api/qr/public/${slug}`);
    if (singleRes.status !== 200) {
      throw new Error(`Expected 200, got ${singleRes.status}: ${JSON.stringify(singleRes.data)}`);
    }

    const payload = singleRes.data;
    if (!payload.active || !payload.business) {
      throw new Error('Payload missing active flag or business object!');
    }
    const b = payload.business;
    const allowedKeys = ['id', 'name', 'businessType', 'category', 'slug', 'googleReviewUrl'];
    for (const key of Object.keys(b)) {
      if (!allowedKeys.includes(key)) {
        throw new Error(`Security leak! Unexpected field "${key}" exposed in public QR response!`);
      }
    }
    if (b.ownerId || b.subscription || b.owner) {
      throw new Error('Security leak: Sensitive relational data exposed!');
    }
    console.log('  ✓ Response fields strictly sanitized: zero sensitive or internal data leaked');
    console.log(`  ✓ Sample lookup response time: ${singleRes.duration.toFixed(1)}ms`);

    // Audit error handling: 403 on suspended/missing, 400 on empty
    console.log('\n[Audit 2] Verifying error handling (403 suspended, 400 invalid)...');
    const notFoundRes = await request('/api/qr/public/non-existent-venue-slug-99999');
    if (notFoundRes.status !== 403 || notFoundRes.data?.error !== 'BusinessSuspended') {
      throw new Error(`Expected 403 BusinessSuspended for missing business, got ${notFoundRes.status}`);
    }
    console.log('  ✓ Missing business slug returns 403 BusinessSuspended notice');

    // Create a temporary inactive business to test 403
    const inactiveSlug = `inactive-cafe-${Date.now()}`;
    const inactiveBiz = await prisma.business.create({
      data: {
        name: 'Suspended Cafe',
        slug: inactiveSlug,
        businessType: 'CAFE',
        googleReviewUrl: 'https://g.page/r/suspended-cafe',
        ownerId: testOwner.id,
        isActive: false,
        qrCodes: { create: { active: true } },
      },
    });
    const inactiveRes = await request(`/api/qr/public/${inactiveSlug}`);
    await prisma.qRCode.deleteMany({ where: { businessId: inactiveBiz.id } });
    await prisma.business.deleteMany({ where: { id: inactiveBiz.id } });
    if (inactiveRes.status !== 403) {
      throw new Error(`Expected 403 for inactive business, got ${inactiveRes.status}`);
    }
    console.log('  ✓ Inactive/suspended business returns 403 suspension notice');

    // Settle settle analytics background promise
    await new Promise((r) => setTimeout(r, 200));

    // 3. Concurrency Test Level 1: 10 concurrent requests
    console.log('\n[Concurrency 1] Firing 10 simultaneous QR lookups...');
    const batch10Start = performance.now();
    const batch10 = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        request(`/api/qr/public/${slug}`, {
          headers: { 'x-session-id': `sess-10-${i}` },
        })
      )
    );
    const batch10Total = performance.now() - batch10Start;
    const b10Durations = batch10.map((r) => r.duration);
    const b10Avg = b10Durations.reduce((a, b) => a + b, 0) / 10;
    const b10Failures = batch10.filter((r) => r.status !== 200).length;

    console.log(`  ✓ 10/10 completed in ${batch10Total.toFixed(0)}ms (avg: ${b10Avg.toFixed(1)}ms, failures: ${b10Failures})`);
    if (b10Failures > 0) throw new Error(`${b10Failures} requests failed in 10-concurrency batch!`);

    // Settle background analytics
    await new Promise((r) => setTimeout(r, 300));

    // 4. Concurrency Test Level 2: 25 concurrent requests
    console.log('\n[Concurrency 2] Firing 25 simultaneous QR lookups...');
    const batch25Start = performance.now();
    const batch25 = await Promise.all(
      Array.from({ length: 25 }, (_, i) =>
        request(`/api/qr/public/${slug}`, {
          headers: { 'x-session-id': `sess-25-${i}` },
        })
      )
    );
    const batch25Total = performance.now() - batch25Start;
    const b25Durations = batch25.map((r) => r.duration);
    const b25Avg = b25Durations.reduce((a, b) => a + b, 0) / 25;
    const b25Failures = batch25.filter((r) => r.status !== 200).length;

    console.log(`  ✓ 25/25 completed in ${batch25Total.toFixed(0)}ms (avg: ${b25Avg.toFixed(1)}ms, failures: ${b25Failures})`);
    if (b25Failures > 0) throw new Error(`${b25Failures} requests failed in 25-concurrency batch!`);

    await new Promise((r) => setTimeout(r, 300));

    // 5. Concurrency Test Level 3: 50 concurrent requests
    console.log('\n[Concurrency 3] Firing 50 simultaneous QR lookups...');
    const batch50Start = performance.now();
    const batch50 = await Promise.all(
      Array.from({ length: 50 }, (_, i) =>
        request(`/api/qr/public/${slug}`, {
          headers: { 'x-session-id': `sess-50-${i}` },
        })
      )
    );
    const batch50Total = performance.now() - batch50Start;
    const b50Durations = batch50.map((r) => r.duration);
    const b50Avg = b50Durations.reduce((a, b) => a + b, 0) / 50;
    const b50Failures = batch50.filter((r) => r.status !== 200).length;

    console.log(`  ✓ 50/50 completed in ${batch50Total.toFixed(0)}ms (avg: ${b50Avg.toFixed(1)}ms, failures: ${b50Failures})`);
    if (b50Failures > 0) throw new Error(`${b50Failures} requests failed in 50-concurrency batch!`);

    await new Promise((r) => setTimeout(r, 400));

    // 6. Concurrency Test Level 4: 100 concurrent requests
    console.log('\n[Concurrency 4] Firing 100 simultaneous QR lookups...');
    const batch100Start = performance.now();
    const batch100 = await Promise.all(
      Array.from({ length: 100 }, (_, i) =>
        request(`/api/qr/public/${slug}`, {
          headers: { 'x-session-id': `sess-100-${i}` },
        })
      )
    );
    const batch100Total = performance.now() - batch100Start;
    const b100Durations = batch100.map((r) => r.duration);
    const b100Avg = b100Durations.reduce((a, b) => a + b, 0) / 100;
    const b100Min = Math.min(...b100Durations);
    const b100Max = Math.max(...b100Durations);
    const b100Failures = batch100.filter((r) => r.status !== 200).length;

    console.log(`  ✓ 100/100 completed in ${batch100Total.toFixed(0)}ms`);
    console.log(`    Min: ${b100Min.toFixed(1)}ms | Max: ${b100Max.toFixed(1)}ms | Avg: ${b100Avg.toFixed(1)}ms | Failures: ${b100Failures}`);
    if (b100Failures > 0) throw new Error(`${b100Failures} requests failed in 100-concurrency batch!`);

    // Settle and flush background analytics writes
    console.log('\n[Verification] Flushing and checking database analytics counters...');
    await flushPendingAnalytics();
    await new Promise((r) => setTimeout(r, 200));

    // Total scans fired = 1 (single) + 10 + 25 + 50 + 100 = 186
    const expectedScans = 1 + 10 + 25 + 50 + 100;
    const today = getNormalizedDate();

    // Verify uniqueness of DailyBusinessAnalytics row (strictly 1 row per businessId + date)
    const dailyRows = await prisma.dailyBusinessAnalytics.findMany({
      where: {
        businessId: testBiz.id,
        date: today,
      },
    });

    if (dailyRows.length !== 1) {
      throw new Error(`Expected exactly 1 DailyBusinessAnalytics row, found ${dailyRows.length}! Concurrency created duplicate rows!`);
    }
    console.log('  ✓ Exactly 1 DailyBusinessAnalytics row exists (no duplicate daily rows created under concurrency)');

    const dailyRow = dailyRows[0];
    console.log(`  ✓ DailyBusinessAnalytics.qrScans counter = ${dailyRow.qrScans} (expected: ${expectedScans})`);
    if (dailyRow.qrScans !== expectedScans) {
      throw new Error(`Lost updates detected! Expected ${expectedScans} qrScans, got ${dailyRow.qrScans}`);
    }
    console.log('  ✓ Zero lost increments! All 186 scans recorded atomically in PostgreSQL');

    // 7. Concurrent feedback submissions test
    console.log('\n[Concurrency 5] Testing concurrent feedback submissions across multiple ratings...');
    const feedbackRatings = [5, 4, 3, 2, 1, 5, 5, 4, 2, 5]; // 10 feedbacks
    const feedbackSessions = feedbackRatings.map(() => crypto.randomUUID());
    const fbStart = performance.now();
    const fbResults = await Promise.all(
      feedbackRatings.map((rating, i) =>
        request('/api/feedback', {
          method: 'POST',
          body: {
            businessSlug: slug,
            sessionId: feedbackSessions[i],
            rating,
            selectedTopics: ['Food Quality', 'Taste'],
            customerMessage: `Concurrent note ${i}`,
            generatedReview: `Generated review ${i}`,
          },
        })
      )
    );
    const fbTotal = performance.now() - fbStart;
    const fbFailures = fbResults.filter((r) => r.status !== 201).length;
    console.log(`  ✓ 10 concurrent feedback submissions finished in ${fbTotal.toFixed(0)}ms (failures: ${fbFailures})`);
    if (fbFailures > 0) throw new Error(`${fbFailures} feedback submissions failed!`);

    // Verify feedbackStarted and rating counters
    const updatedDaily = await prisma.dailyBusinessAnalytics.findUnique({
      where: { businessId_date: { businessId: testBiz.id, date: today } },
    });
    console.log(`  ✓ feedbackStarted = ${updatedDaily.feedbackStarted} (expected: 10)`);
    console.log(`  ✓ 5★ count: ${updatedDaily.rating5} (expected: 4)`);
    console.log(`  ✓ 4★ count: ${updatedDaily.rating4} (expected: 2)`);
    console.log(`  ✓ 3★ count: ${updatedDaily.rating3} (expected: 1)`);
    console.log(`  ✓ 2★ count: ${updatedDaily.rating2} (expected: 2)`);
    console.log(`  ✓ 1★ count: ${updatedDaily.rating1} (expected: 1)`);

    if (
      updatedDaily.feedbackStarted !== 10 ||
      updatedDaily.rating5 !== 4 ||
      updatedDaily.rating4 !== 2 ||
      updatedDaily.rating3 !== 1 ||
      updatedDaily.rating2 !== 2 ||
      updatedDaily.rating1 !== 1
    ) {
      throw new Error('Rating counters do not match exact expected counts!');
    }
    console.log('  ✓ All feedback counters atomically updated without concurrency loss');

    // 8. Test Customer Journey: Concurrent Review Copy & Google Link Clicks
    console.log('\n[Concurrency 6] Testing concurrent Review Copied & Google Click tracking...');
    const feedbackIds = fbResults.map((r) => r.data.feedbackId);

    // Concurrently trigger review copy on all 10 submissions
    const copyResults = await Promise.all(
      feedbackIds.map((fId, i) =>
        request(`/api/feedback/${encodeURIComponent(fId)}/copied`, {
          method: 'PATCH',
          body: { sessionId: feedbackSessions[i] },
        })
      )
    );
    const copyFailures = copyResults.filter((r) => r.status !== 200).length;
    if (copyFailures > 0) throw new Error(`${copyFailures} review copy events failed!`);
    console.log(`  ✓ 10 concurrent review copy events recorded successfully`);

    // Concurrently trigger Google click on all 10 submissions
    const googleResults = await Promise.all(
      feedbackIds.map((fId, i) =>
        request(`/api/feedback/${encodeURIComponent(fId)}/google-clicked`, {
          method: 'PATCH',
          body: { sessionId: feedbackSessions[i] },
        })
      )
    );
    const googleFailures = googleResults.filter((r) => r.status !== 200).length;
    if (googleFailures > 0) throw new Error(`${googleFailures} Google click events failed!`);
    console.log(`  ✓ 10 concurrent Google click events recorded successfully`);

    // Flush and verify analytics counters for copy and google click
    await flushPendingAnalytics();
    await new Promise((r) => setTimeout(r, 200));

    const finalDaily = await prisma.dailyBusinessAnalytics.findUnique({
      where: { businessId_date: { businessId: testBiz.id, date: today } },
    });
    console.log(`  ✓ reviewsCopied = ${finalDaily.reviewsCopied} (expected: 10)`);
    console.log(`  ✓ googleClicks = ${finalDaily.googleClicks} (expected: 10)`);
    if (finalDaily.reviewsCopied !== 10 || finalDaily.googleClicks !== 10) {
      throw new Error(`Expected 10 reviewsCopied and 10 googleClicks, got ${finalDaily.reviewsCopied} and ${finalDaily.googleClicks}`);
    }
    console.log('  ✓ Complete customer journey concurrency verified end-to-end');

    console.log('\n====================================================');
    console.log('   ALL QR LOOKUP & CONCURRENCY TESTS PASSED! 🚀     ');
    console.log('====================================================');
  } finally {
    console.log('\n[Cleanup] Cleaning up test data...');
    try {
      if (testBiz) {
        await prisma.dailyBusinessAnalytics.deleteMany({ where: { businessId: testBiz.id } });
        await prisma.analyticsEvent.deleteMany({ where: { businessId: testBiz.id } });
        await prisma.feedback.deleteMany({ where: { businessId: testBiz.id } });
        await prisma.qRCode.deleteMany({ where: { businessId: testBiz.id } });
        await prisma.business.deleteMany({ where: { id: testBiz.id } });
      }
      console.log('  ✓ Cleanup finished.');
    } catch (e) {
      console.warn('Cleanup notice:', e.message);
    }

    if (server) {
      server.close();
    }
  }
}

runConcurrencyTests().catch((err) => {
  console.error('\n❌ CONCURRENCY TEST FAILED:', err);
  process.exit(1);
});
