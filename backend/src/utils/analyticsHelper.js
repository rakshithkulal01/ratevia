import prisma from '../config/prisma.js';

/**
 * Returns today's date normalized to midnight UTC.
 */
export function getNormalizedDate(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Record a feedback submission in DailyBusinessAnalytics.
 * Updates rating counter, topic counts, feedbackStarted, and reviewsGenerated.
 */
export async function recordDailyFeedbackAnalytics(businessId, ratingOrObj, topics = [], hasGeneratedReview = false) {
  let rating = ratingOrObj;
  if (typeof ratingOrObj === 'object' && ratingOrObj !== null) {
    rating = ratingOrObj.rating;
    topics = ratingOrObj.topics || ratingOrObj.selectedTopics || [];
    hasGeneratedReview = ratingOrObj.hasGeneratedReview || Boolean(ratingOrObj.generatedReview);
  }

  const date = getNormalizedDate();
  const ratingKey = `rating${rating}`;

  // Find or create the daily row
  let row = await prisma.dailyBusinessAnalytics.findUnique({
    where: {
      businessId_date: { businessId, date },
    },
  });

  const positiveTopics = row?.positiveTopicCounts || {};
  const improvementTopics = row?.improvementTopicCounts || {};

  if (Array.isArray(topics)) {
    topics.forEach((topic) => {
      const clean = topic.trim();
      if (!clean) return;
      if (rating >= 4) {
        positiveTopics[clean] = (positiveTopics[clean] || 0) + 1;
      } else {
        improvementTopics[clean] = (improvementTopics[clean] || 0) + 1;
      }
    });
  }

  return prisma.dailyBusinessAnalytics.upsert({
    where: {
      businessId_date: { businessId, date },
    },
    create: {
      businessId,
      date,
      feedbackStarted: 1,
      reviewsGenerated: hasGeneratedReview ? 1 : 0,
      [ratingKey]: 1,
      positiveTopicCounts: positiveTopics,
      improvementTopicCounts: improvementTopics,
    },
    update: {
      feedbackStarted: { increment: 1 },
      reviewsGenerated: hasGeneratedReview ? { increment: 1 } : undefined,
      [ratingKey]: { increment: 1 },
      positiveTopicCounts: positiveTopics,
      improvementTopicCounts: improvementTopics,
    },
  });
}

/**
 * Record event counter (QR_SCANNED, REVIEW_COPIED, GOOGLE_LINK_CLICKED).
 */
export async function recordDailyEventAnalytics(businessId, eventType) {
  const date = getNormalizedDate();

  let updateField = null;
  if (eventType === 'QR_SCANNED') updateField = 'qrScans';
  else if (eventType === 'REVIEW_COPIED') updateField = 'reviewsCopied';
  else if (eventType === 'GOOGLE_LINK_CLICKED') updateField = 'googleClicks';

  if (!updateField) return;

  return prisma.dailyBusinessAnalytics.upsert({
    where: {
      businessId_date: { businessId, date },
    },
    create: {
      businessId,
      date,
      [updateField]: 1,
    },
    update: {
      [updateField]: { increment: 1 },
    },
  });
}
