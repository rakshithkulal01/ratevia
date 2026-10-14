import { getSupabaseAdmin } from '../src/config/supabase.js';

async function inspect() {
  const sb = getSupabaseAdmin();
  const { data: adminAuth } = await sb.auth.signInWithPassword({
    email: 'rakshithkulal002@gmail.com',
    password: 'RateviaTest2026!'
  });
  const { data: userAuth } = await sb.auth.signInWithPassword({
    email: 'obitauchiha001@gmail.com',
    password: 'RateviaTest2026!'
  });

  const adminHeaders = { Authorization: 'Bearer ' + adminAuth.session.access_token };
  const userHeaders = { Authorization: 'Bearer ' + userAuth.session.access_token };

  const endpoints = [
    { name: 'Admin Price', url: '/api/admin/settings/price', headers: adminHeaders },
    { name: 'User Business', url: '/api/business', headers: userHeaders },
    { name: 'User QR', url: '/api/qr', headers: userHeaders },
    { name: 'User Feedback', url: '/api/feedback', headers: userHeaders },
  ];

  for (const ep of endpoints) {
    const res = await fetch('https://ratevia.ratevia.workers.dev' + ep.url, { headers: ep.headers });
    console.log(`[${res.status}] ${ep.name}`);
    const text = await res.text();
    console.log('   Response:', text.substring(0, 150));
  }
}

inspect().catch(console.error);
