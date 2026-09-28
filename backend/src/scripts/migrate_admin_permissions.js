import prisma from '../config/prisma.js';

async function migrate() {
  console.log('[Migration] Starting Admin Permissions Schema Migration...');

  try {
    // 1. Create enum AdminPermissionType if not exists
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "AdminPermissionType" AS ENUM (
          'MANAGE_ADMINS',
          'MANAGE_BUSINESSES',
          'MANAGE_BUSINESS_REQUESTS',
          'MANAGE_QR_REQUESTS',
          'MANAGE_PRICING',
          'VIEW_ANALYTICS',
          'MANAGE_QR',
          'VIEW_DASHBOARD'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('[Migration] Enum "AdminPermissionType" verified.');

    // 2. Create table admin_users if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "admin_users" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "displayName" TEXT,
        "email" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastLoginAt" TIMESTAMP(3),
        "createdById" TEXT,

        CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "admin_users_userId_key" UNIQUE ("userId"),
        CONSTRAINT "admin_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "admin_users_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE
      );
    `);
    console.log('[Migration] Table "admin_users" verified.');

    // Index on isActive
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "admin_users_isActive_idx" ON "admin_users"("isActive");
    `);

    // 3. Create table admin_permissions if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "admin_permissions" (
        "id" TEXT NOT NULL,
        "adminId" TEXT NOT NULL,
        "permission" "AdminPermissionType" NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "admin_permissions_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "admin_permissions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    console.log('[Migration] Table "admin_permissions" verified.');

    // Unique index on (adminId, permission) and index on adminId
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "admin_permissions_adminId_permission_key" ON "admin_permissions"("adminId", "permission");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "admin_permissions_adminId_idx" ON "admin_permissions"("adminId");
    `);

    // 4. Create table admin_audit_logs if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
        "id" TEXT NOT NULL,
        "actorAdminId" TEXT,
        "targetAdminId" TEXT,
        "action" TEXT NOT NULL,
        "metadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('[Migration] Table "admin_audit_logs" verified.');

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "admin_audit_logs_actorAdminId_idx" ON "admin_audit_logs"("actorAdminId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "admin_audit_logs_targetAdminId_idx" ON "admin_audit_logs"("targetAdminId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "admin_audit_logs_createdAt_idx" ON "admin_audit_logs"("createdAt");
    `);

    console.log('[Migration] All tables and indexes successfully created.');

    // 5. Seed initial admin profile for any existing user with role = 'ADMIN'
    const existingAdmins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
    });
    console.log(`[Migration] Found ${existingAdmins.length} existing admin user(s) to verify.`);

    const allPermissions = [
      'MANAGE_ADMINS',
      'MANAGE_BUSINESSES',
      'MANAGE_BUSINESS_REQUESTS',
      'MANAGE_QR_REQUESTS',
      'MANAGE_PRICING',
      'VIEW_ANALYTICS',
      'MANAGE_QR',
      'VIEW_DASHBOARD',
    ];

    for (const admin of existingAdmins) {
      // Find or create admin_users record
      let adminRecord = await prisma.adminUser.findUnique({
        where: { userId: admin.id },
      });

      if (!adminRecord) {
        adminRecord = await prisma.adminUser.create({
          data: {
            userId: admin.id,
            displayName: admin.name || admin.email.split('@')[0],
            email: admin.email,
            isActive: true,
          },
        });
        console.log(`[Migration] Created AdminUser for ${admin.email} (${adminRecord.id})`);
      }

      // Ensure all permissions are assigned to existing admin
      for (const perm of allPermissions) {
        await prisma.adminPermission.upsert({
          where: {
            adminId_permission: {
              adminId: adminRecord.id,
              permission: perm,
            },
          },
          update: {},
          create: {
            adminId: adminRecord.id,
            permission: perm,
          },
        });
      }
      console.log(`[Migration] Seeded all 8 permissions for ${admin.email}`);
    }

    console.log('[Migration] Migration & Seeding Complete!');
  } catch (err) {
    console.error('[Migration] Failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
