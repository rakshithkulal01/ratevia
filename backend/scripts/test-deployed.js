import { getSupabaseAdmin } from '../src/config/supabase.js';

async function runTests() {
  const sb = getSupabaseAdmin();
  const testPw = 'RateviaTest2026!';

  console.log('Authenticating Admin (rakshithkulal002@gmail.com)...');
  const { data: adminAuth, error: adminErr } = await sb.auth.signInWithPassword({
    email: 'rakshithkulal002@gmail.com',
    password: testPw,
  });
  if (adminErr) throw adminErr;
  const adminToken = adminAuth.session.access_token;

  console.log('Authenticating Business Owner (obitauchiha001@gmail.com)...');
  const { data: userAuth, error: userErr } = await sb.auth.signInWithPassword({
    email: 'obitauchiha001@gmail.com',
    password: testPw,
  });
  if (userErr) throw userErr;
  const userToken = userAuth.session.access_token;

  const BASE_URL = 'https://ratevia.ratevia.workers.dev';

  async function test(name, url, options = {}) {
    const start = Date.now();
    try {
      const res = await fetch(BASE_URL + url, options);
      const time = Date.now() - start;
      const text = await res.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch {}

      const icon = res.ok ? '✅' : (res.status === 404 ? 'ℹ️' : '❌');
      console.log(`${icon} [${res.status}] ${name} (${time}ms)`);
      if (res.status >= 400 && res.status !== 404) {
        console.log('   Error response:', text.substring(0, 250));
      } else if (res.ok && json) {
        const preview = JSON.stringify(json).substring(0, 100);
        console.log(`   Data preview: ${preview}...`);
      }
      await new Promise((r) => setTimeout(r, 300));
      return { status: res.status, ok: res.ok, json, time };
    } catch (e) {
      console.log(`❌ [FAIL] ${name}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 300));
      return { status: 0, ok: false, error: e.message };
    }
  }

  console.log('\n========================================');
  console.log('1. PUBLIC ENDPOINTS');
  console.log('========================================');
  await test('GET /api/health', '/api/health');
  await test('GET /api/public/settings/price', '/api/public/settings/price');
  await test('POST /api/public/qr-requests (Create Lead Request)', '/api/public/qr-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessName: 'Live Cloudflare Test Cafe',
      category: 'CAFE',
      contactName: 'Automated Tester',
      phone: '98' + Math.floor(10000000 + Math.random() * 90000000),
      email: `live-test-${Date.now()}@ratevia.test`,
      city: 'Bangalore',
      destinationUrl: 'https://g.page/r/live-test',
      qrConfig: {
        tagline: 'Review us on Google',
        selectedAccent: 'ratevia-blue',
        selectedStyle: 'classic',
      },
    }),
  });

  console.log('\n========================================');
  console.log('2. ADMIN ENDPOINTS (Admin Auth: rakshithkulal002@gmail.com)');
  console.log('========================================');
  const adminHeaders = {
    Authorization: 'Bearer ' + adminToken,
    'Content-Type': 'application/json',
  };
  await test('GET /api/admin/me (Admin Profile & Permissions)', '/api/admin/me', { headers: adminHeaders });
  await test('GET /api/admin/permissions (Permissions Catalog)', '/api/admin/permissions', { headers: adminHeaders });
  await test('GET /api/admin/stats (Platform Dashboard Stats)', '/api/admin/stats', { headers: adminHeaders });
  await test('GET /api/admin/admins (Admin Users List)', '/api/admin/admins', { headers: adminHeaders });
  await test('GET /api/admin/qr-requests (Custom QR Requests)', '/api/admin/qr-requests', { headers: adminHeaders });
  await test('GET /api/admin/business-requests (Business Lead Inquiries)', '/api/admin/business-requests', { headers: adminHeaders });
  await test('GET /api/admin/businesses (Business Directory)', '/api/admin/businesses', { headers: adminHeaders });
  await test('GET /api/admin/settings/price (Admin Pricing & History)', '/api/admin/settings/price', { headers: adminHeaders });

  console.log('\n========================================');
  console.log('3. USER / BUSINESS OWNER ENDPOINTS (User Auth: obitauchiha001@gmail.com)');
  console.log('========================================');
  const userHeaders = {
    Authorization: 'Bearer ' + userToken,
    'Content-Type': 'application/json',
  };
  await test('POST /api/auth/sync (User Sync with DB)', '/api/auth/sync', {
    method: 'POST',
    headers: userHeaders,
  });
  await test('GET /api/auth/me (Current User & Businesses)', '/api/auth/me', { headers: userHeaders });
  await test('GET /api/business (User Active Business Profile)', '/api/business', { headers: userHeaders });
  await test('GET /api/analytics (User Business Analytics)', '/api/analytics', { headers: userHeaders });
  await test('GET /api/feedback (User Feedback History)', '/api/feedback', { headers: userHeaders });
  await test('GET /api/qr (User QR Configuration)', '/api/qr', { headers: userHeaders });

  console.log('\n========================================');
  console.log('ALL API TESTS COMPLETED');
  console.log('========================================\n');
}

runTests().catch(console.error);
