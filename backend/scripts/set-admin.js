import prisma from '../src/config/prisma.js';
import { getSupabaseAdmin } from '../src/config/supabase.js';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.log('Usage: node scripts/set-admin.js <email>');
  console.log('Example: node scripts/set-admin.js admin@ratevia.com');
  process.exit(1);
}

async function setAdminRole() {
  console.log(`Setting ADMIN role for: ${email}...`);

  // 1. Check if user already exists in PostgreSQL
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    if (user.role === 'ADMIN') {
      console.log(`User "${email}" is already an ADMIN.`);
      return;
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });

    console.log(`✅ Success! Updated ${updated.email} role to: ADMIN`);
    return;
  }

  // 2. If not yet in PostgreSQL, check if they exist in Supabase Auth
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      throw error;
    }

    const supabaseUser = data.users.find(
      (u) => u.email?.toLowerCase() === email
    );

    if (supabaseUser) {
      const name =
        supabaseUser.user_metadata?.name ||
        supabaseUser.user_metadata?.full_name ||
        null;

      const newUser = await prisma.user.create({
        data: {
          supabaseUserId: supabaseUser.id,
          email: supabaseUser.email.toLowerCase(),
          name,
          role: 'ADMIN',
        },
      });

      console.log(
        `✅ Success! Found user in Supabase Auth and created local user record as ADMIN (${newUser.id}).`
      );
      return;
    }
  } catch (supabaseErr) {
    console.warn('[Notice] Could not query Supabase Auth directly:', supabaseErr.message);
  }

  console.log(
    `❌ User with email "${email}" was not found in the database or Supabase Auth.`
  );
  console.log('\nTo add an admin:');
  console.log('1. First sign up or log in with that email at http://localhost:5173/login');
  console.log(`2. Then run: node scripts/set-admin.js ${email}`);
}

setAdminRole()
  .catch((err) => {
    console.error('Failed to set admin role:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
