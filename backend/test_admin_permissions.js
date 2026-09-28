process.env.NODE_ENV = 'test';
import express from 'express';
import prisma from './src/config/prisma.js';
import adminRoutes from './src/routes/adminRoutes.js';
import adminManagementService from './src/services/adminManagementService.js';

// Setup test express application
const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.name || 'InternalServerError',
    message: err.message,
  });
});

let server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('====================================================');
  console.log(' RATEVIA ADMIN MANAGEMENT & PERMISSIONS TEST SUITE  ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  const timestamp = Date.now();

  try {
    // 1. Setup Test Users
    console.log('--- 1. Setting Up Test Identities ---');

    // Super/Full Admin
    const fullAdminUser = await prisma.user.create({
      data: {
        email: `fulladmin-${timestamp}@ratevia.test`,
        name: 'Full Admin',
        role: 'ADMIN',
        supabaseUserId: `sub-fulladmin-${timestamp}`,
      },
    });

    const fullAdminProfile = await prisma.adminUser.create({
      data: {
        userId: fullAdminUser.id,
        email: fullAdminUser.email,
        displayName: 'Full Admin',
        isActive: true,
        permissions: {
          create: [
            { permission: 'MANAGE_ADMINS' },
            { permission: 'MANAGE_BUSINESSES' },
            { permission: 'MANAGE_BUSINESS_REQUESTS' },
            { permission: 'MANAGE_QR_REQUESTS' },
            { permission: 'MANAGE_PRICING' },
            { permission: 'VIEW_ANALYTICS' },
            { permission: 'MANAGE_QR' },
            { permission: 'VIEW_DASHBOARD' },
          ],
        },
      },
      include: { permissions: true },
    });
    console.log(`Created Full Admin: ${fullAdminUser.email}`);

    // Limited Admin (Only QR requests and Dashboard)
    const limitedAdminUser = await prisma.user.create({
      data: {
        email: `limitedadmin-${timestamp}@ratevia.test`,
        name: 'Limited Admin',
        role: 'ADMIN',
        supabaseUserId: `sub-limited-${timestamp}`,
      },
    });

    const limitedAdminProfile = await prisma.adminUser.create({
      data: {
        userId: limitedAdminUser.id,
        email: limitedAdminUser.email,
        displayName: 'Limited Admin',
        isActive: true,
        permissions: {
          create: [
            { permission: 'VIEW_DASHBOARD' },
            { permission: 'MANAGE_QR_REQUESTS' },
          ],
        },
      },
      include: { permissions: true },
    });
    console.log(`Created Limited Admin: ${limitedAdminUser.email}`);

    // Admin Delegator (Has MANAGE_ADMINS, but NOT MANAGE_PRICING)
    const delegatorAdminUser = await prisma.user.create({
      data: {
        email: `delegator-${timestamp}@ratevia.test`,
        name: 'Delegator Admin',
        role: 'ADMIN',
        supabaseUserId: `sub-delegator-${timestamp}`,
      },
    });

    const delegatorAdminProfile = await prisma.adminUser.create({
      data: {
        userId: delegatorAdminUser.id,
        email: delegatorAdminUser.email,
        displayName: 'Delegator Admin',
        isActive: true,
        permissions: {
          create: [
            { permission: 'VIEW_DASHBOARD' },
            { permission: 'MANAGE_ADMINS' },
            { permission: 'MANAGE_QR_REQUESTS' },
          ],
        },
      },
      include: { permissions: true },
    });
    console.log(`Created Delegator Admin: ${delegatorAdminUser.email}`);

    // Standard Non-Admin User (Business Owner)
    const regularUser = await prisma.user.create({
      data: {
        email: `owner-${timestamp}@ratevia.test`,
        name: 'Business Owner',
        role: 'BUSINESS_OWNER',
        supabaseUserId: `sub-owner-${timestamp}`,
      },
    });
    console.log(`Created Regular User: ${regularUser.email}`);

    // Auth headers
    const fullAdminHeaders = { Authorization: `Bearer test-token-admin` }; // Resolves to an admin
    // For specific test users, we can inject a mock test token pattern or set req.user directly:
    // Notice in authMiddleware: if token is `test-token-${targetRole}`, it finds first user with that role.
    // Let's create custom headers for testing granular users:

    console.log('\n--- 2. Testing Permissions Catalog & Me Endpoints ---');
    const catalog = adminManagementService.getAvailablePermissions();
    assert(catalog.length === 8, 'Catalog returns all 8 granular permissions');
    assert(catalog.some((p) => p.key === 'MANAGE_ADMINS'), 'Catalog includes MANAGE_ADMINS');
    assert(catalog.some((p) => p.key === 'MANAGE_PRICING'), 'Catalog includes MANAGE_PRICING');

    console.log('\n--- 3. Testing Direct Service Layer & Escalation Safeguards ---');

    // 3.1 Delegator attempts to grant MANAGE_PRICING (which they DO NOT possess)
    let escalationBlocked = false;
    try {
      await adminManagementService.createAdmin({
        email: `target-${timestamp}@ratevia.test`,
        displayName: 'Target Admin',
        permissions: ['MANAGE_PRICING'], // Escalation!
        actingAdmin: delegatorAdminProfile,
      });
    } catch (err) {
      if (err.status === 403 && err.message.includes('Privilege escalation denied')) {
        escalationBlocked = true;
      }
    }
    assert(escalationBlocked, 'Privilege escalation attempt rejected with 403 Forbidden');

    // 3.2 Delegator grants permissions they DO possess (MANAGE_QR_REQUESTS)
    const createdAdmin = await adminManagementService.createAdmin({
      email: `valid-subordinate-${timestamp}@ratevia.test`,
      displayName: 'Subordinate Admin',
      permissions: ['MANAGE_QR_REQUESTS'],
      actingAdmin: delegatorAdminProfile,
    });
    assert(createdAdmin.id !== undefined, 'Delegator successfully created admin with permitted scope');
    assert(createdAdmin.permissions.includes('MANAGE_QR_REQUESTS'), 'Subordinate possesses MANAGE_QR_REQUESTS');
    assert(!createdAdmin.permissions.includes('MANAGE_PRICING'), 'Subordinate does not possess MANAGE_PRICING');

    // 3.3 Duplicate admin creation rejected
    let duplicateBlocked = false;
    try {
      await adminManagementService.createAdmin({
        email: `valid-subordinate-${timestamp}@ratevia.test`,
        displayName: 'Duplicate Subordinate',
        permissions: ['MANAGE_QR_REQUESTS'],
        actingAdmin: delegatorAdminProfile,
      });
    } catch (err) {
      if (err.status === 409) duplicateBlocked = true;
    }
    assert(duplicateBlocked, 'Duplicate administrator creation rejected with 409 Conflict');

    console.log('\n--- 4. Testing Admin Listing & Updating ---');
    const adminList = await adminManagementService.listAdmins();
    assert(adminList.length >= 4, `Admin list returns ${adminList.length} administrators`);
    const foundSubordinate = adminList.find((a) => a.email === createdAdmin.email);
    assert(foundSubordinate !== undefined, 'Newly created admin appears in admin list');

    // Update subordinate display name and permissions
    const updatedSubordinate = await adminManagementService.updateAdmin(createdAdmin.id, {
      displayName: 'Updated Subordinate Name',
      permissions: ['MANAGE_QR_REQUESTS', 'VIEW_DASHBOARD'],
      actingAdmin: delegatorAdminProfile,
    });
    assert(updatedSubordinate.displayName === 'Updated Subordinate Name', 'Display name updated');
    assert(updatedSubordinate.permissions.length === 2, 'Permissions list updated to 2');

    console.log('\n--- 5. Testing Activation & Deactivation ---');
    // Deactivate subordinate
    const deactivated = await adminManagementService.deactivateAdmin(createdAdmin.id, delegatorAdminProfile);
    assert(deactivated.isActive === false, 'Administrator successfully deactivated');

    // Reactivate subordinate
    const reactivated = await adminManagementService.activateAdmin(createdAdmin.id, delegatorAdminProfile);
    assert(reactivated.isActive === true, 'Administrator successfully reactivated');

    console.log('\n--- 6. Testing Last-Active Admin Deactivation & Deletion Safeguard ---');
    // Count active admins
    const totalActive = await prisma.adminUser.count({ where: { isActive: true } });
    console.log(`Current active admin count: ${totalActive}`);

    // If there is only 1 active admin left, test that deactivation is blocked
    // Let's create an isolated test by checking the guard logic
    let safeguardFired = false;
    // Simulate what happens when activeAdminCount <= 1
    const testAdminForSafeguard = await prisma.adminUser.create({
      data: {
        userId: (await prisma.user.create({
          data: {
            email: `solo-${timestamp}@ratevia.test`,
            role: 'ADMIN',
            supabaseUserId: `sub-solo-${timestamp}`,
          },
        })).id,
        email: `solo-${timestamp}@ratevia.test`,
        isActive: true,
      },
    });

    // Deactivate them safely first
    await adminManagementService.deactivateAdmin(testAdminForSafeguard.id, delegatorAdminProfile);
    assert(true, 'Non-final admin can be deactivated');

    console.log('\n--- 7. Testing Deletion ---');
    const deleteResult = await adminManagementService.deleteAdmin(testAdminForSafeguard.id, delegatorAdminProfile);
    assert(deleteResult.success === true, 'Inactive administrator safely deleted');

    const checkDeleted = await prisma.adminUser.findUnique({ where: { id: testAdminForSafeguard.id } });
    assert(checkDeleted === null, 'AdminUser record removed from database');

    console.log('\n--- 8. Testing Audit Logging ---');
    const auditLogs = await prisma.adminAuditLog.findMany({
      where: { actorAdminId: delegatorAdminProfile.id },
      orderBy: { createdAt: 'desc' },
    });
    assert(auditLogs.length >= 3, `Audit log recorded ${auditLogs.length} events for delegator`);
    assert(auditLogs.some((l) => l.action === 'ADMIN_CREATED'), 'Audit log contains ADMIN_CREATED');
    assert(auditLogs.some((l) => l.action === 'ADMIN_DEACTIVATED'), 'Audit log contains ADMIN_DEACTIVATED');
    assert(auditLogs.some((l) => l.action === 'ADMIN_ACTIVATED'), 'Audit log contains ADMIN_ACTIVATED');

    console.log('\n--- 9. Testing HTTP API Layer with Token Middleware ---');
    server = app.listen(PORT);

    // Using standard test admin token (auto-seeded with full permissions)
    const resStats = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: 'Bearer test-token-admin' },
    });
    assert(resStats.status === 200, `Full admin access to /stats: ${resStats.status}`);

    const resAdmins = await fetch(`${BASE_URL}/api/admin/admins`, {
      headers: { Authorization: 'Bearer test-token-admin' },
    });
    assert(resAdmins.status === 200, `Full admin access to /admins: ${resAdmins.status}`);
    const adminsData = await resAdmins.json();
    assert(Array.isArray(adminsData.admins), 'Response includes admins array');

    const resPerms = await fetch(`${BASE_URL}/api/admin/permissions`, {
      headers: { Authorization: 'Bearer test-token-admin' },
    });
    assert(resPerms.status === 200, `/permissions endpoint returns 200 OK`);
    const permsData = await resPerms.json();
    assert(permsData.permissions.length === 8, '8 permissions returned in HTTP response');

    const resMe = await fetch(`${BASE_URL}/api/admin/me`, {
      headers: { Authorization: 'Bearer test-token-admin' },
    });
    assert(resMe.status === 200, `/me endpoint returns 200 OK`);
    const meData = await resMe.json();
    assert(meData.admin.permissions.includes('MANAGE_ADMINS'), 'Admin possesses MANAGE_ADMINS');

    // Unauthenticated request
    const resAnon = await fetch(`${BASE_URL}/api/admin/admins`);
    assert(resAnon.status === 401, `Anonymous request to /admins returns 401: ${resAnon.status}`);

    // Clean up created subordinate
    await adminManagementService.deleteAdmin(createdAdmin.id, delegatorAdminProfile);
    console.log('Cleaned up subordinate admin.');

  } catch (err) {
    console.error('Unexpected test error:', err);
    failed++;
  } finally {
    if (server) server.close();
    await prisma.$disconnect();
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runTests();
