import prisma from '../config/prisma.js';

let isRunning = false;

/**
 * Purge raw Feedback records older than 30 days (1-3 stars)
 * and raw AnalyticsEvent records older than 30 days.
 * Historical data is permanently retained in DailyBusinessAnalytics.
 */
export async function runDataRetentionCleanup() {
  if (isRunning) {
    console.log('[Cleanup] Cleanup already in progress, skipping concurrent run.');
    return;
  }

  isRunning = true;
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 1. Delete 1-3 star raw feedbacks older than 30 days
    const feedbackResult = await prisma.feedback.deleteMany({
      where: {
        rating: { lte: 3 },
        createdAt: { lt: thirtyDaysAgo },
      },
    });

    // 2. Also clean any accidental >= 4 star feedbacks if any existed from before
    const oldFourFiveStarResult = await prisma.feedback.deleteMany({
      where: {
        rating: { gte: 4 },
      },
    });

    // 3. Purge raw analytics events older than 30 days
    const eventsResult = await prisma.analyticsEvent.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
      },
    });

    console.log(
      `[Cleanup] Data retention cleanup complete: deleted ${feedbackResult.count} old raw 1-3★ feedbacks, ${oldFourFiveStarResult.count} 4-5★ feedbacks, ${eventsResult.count} old raw events.`
    );

    return {
      deletedFeedbacks: feedbackResult.count + oldFourFiveStarResult.count,
      deletedEvents: eventsResult.count,
    };
  } catch (err) {
    console.error('[Cleanup] Error during data retention cleanup:', err.message);
  } finally {
    isRunning = false;
  }
}

/**
 * Start the daily scheduled cleanup service.
 * Runs once immediately on startup and repeats every 24 hours.
 */
export function startCleanupScheduler() {
  // Initial run after a short delay on server startup
  setTimeout(() => {
    runDataRetentionCleanup().catch((err) =>
      console.error('[Cleanup] Startup cleanup failed:', err)
    );
  }, 10000);

  // Repeat every 24 hours
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    runDataRetentionCleanup().catch((err) =>
      console.error('[Cleanup] Scheduled cleanup failed:', err)
    );
  }, TWENTY_FOUR_HOURS);

  console.log('[Cleanup] 30-day automated raw feedback cleanup scheduler started.');
}
