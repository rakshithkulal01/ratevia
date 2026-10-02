import prisma from '../config/prisma.js';

async function migrate() {
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE business_requests ADD COLUMN IF NOT EXISTS "stickerImageCreatedAt" TIMESTAMP WITH TIME ZONE;'
    );
    // Backfill existing rows with stickerImageUrl
    await prisma.$executeRawUnsafe(
      'UPDATE business_requests SET "stickerImageCreatedAt" = "createdAt" WHERE "stickerImageUrl" IS NOT NULL AND "stickerImageCreatedAt" IS NULL;'
    );
    console.log('Column "stickerImageCreatedAt" added and backfilled successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
