import prisma from '../config/prisma.js';

async function migrate() {
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE business_requests ADD COLUMN IF NOT EXISTS "stickerImageUrl" TEXT;'
    );
    console.log('Column "stickerImageUrl" added to business_requests successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
