import prisma from '../config/prisma.js';
import { deleteStickerImage } from '../utils/stickerStorage.js';

let isCleanupRunning = false;

/**
 * Automatically purges stored Ratevia sticker image artifacts older than 25 days.
 * Permanently retains all Business and BusinessRequest entities, URLs, analytics,
 * and structured QR configurations intact.
 *
 * Idempotent and resilient: failure on a single file does not abort the batch.
 */
export async function runStickerRetentionCleanup() {
  if (isCleanupRunning) {
    console.log('[StickerRetention] Cleanup job already running, skipping overlapping invocation.');
    return { skipped: true };
  }

  isCleanupRunning = true;
  const startTime = Date.now();

  try {
    const twentyFiveDaysMs = 25 * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - twentyFiveDaysMs);

    // Find all business requests where stickerImageUrl is set and the image was created >= 25 days ago.
    // Fall back to createdAt if stickerImageCreatedAt was null (for pre-migration entries).
    const expiredRequests = await prisma.businessRequest.findMany({
      where: {
        stickerImageUrl: { not: null },
        OR: [
          { stickerImageCreatedAt: { lt: cutoffDate } },
          {
            stickerImageCreatedAt: null,
            createdAt: { lt: cutoffDate },
          },
        ],
      },
      select: {
        id: true,
        businessName: true,
        stickerImageUrl: true,
        stickerImageCreatedAt: true,
        createdAt: true,
      },
    });

    if (expiredRequests.length === 0) {
      console.log('[StickerRetention] No expired sticker images found (>25 days old).');
      return { totalChecked: 0, deletedCount: 0, failedCount: 0 };
    }

    console.log(`[StickerRetention] Found ${expiredRequests.length} sticker image(s) older than 25 days. Starting cleanup...`);

    let deletedCount = 0;
    let failedCount = 0;

    for (const req of expiredRequests) {
      try {
        // 1. Delete physical image file (Supabase storage object and/or local upload fallback)
        await deleteStickerImage(req.id, req.stickerImageUrl);

        // 2. Clear database reference to avoid broken image URLs
        await prisma.businessRequest.update({
          where: { id: req.id },
          data: {
            stickerImageUrl: null,
            stickerImageCreatedAt: null,
          },
        });

        deletedCount++;

        // 3. Operational Audit Log: STICKER_IMAGE_EXPIRED
        console.log(
          `[StickerRetention] STICKER_IMAGE_EXPIRED: requestId=${req.id}, businessName="${req.businessName}", deletedAt=${new Date().toISOString()}`
        );
      } catch (err) {
        failedCount++;
        console.error(
          `[StickerRetention] Error purging sticker image for request ${req.id} ("${req.businessName}"):`,
          err.message
        );
        // Continue processing remaining requests
      }
    }

    const durationMs = Date.now() - startTime;
    console.log(
      `[StickerRetention] Cleanup cycle complete in ${durationMs}ms: ${deletedCount} deleted, ${failedCount} failed.`
    );

    return {
      totalChecked: expiredRequests.length,
      deletedCount,
      failedCount,
      durationMs,
    };
  } catch (error) {
    console.error('[StickerRetention] Fatal error in sticker retention cleanup cycle:', error);
    return { error: error.message };
  } finally {
    isCleanupRunning = false;
  }
}

export default {
  runStickerRetentionCleanup,
};
