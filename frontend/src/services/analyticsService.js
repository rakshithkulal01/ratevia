import { apiRequest } from './apiClient.js';

export const analyticsService = {
  /**
   * Send a batch of aggregated customer sessions (Primary trigger: 25 sessions)
   */
  sendBatch: (batchPayload) => {
    return apiRequest('/api/analytics/batch', {
      method: 'POST',
      body: batchPayload,
    });
  },

  /**
   * Log single event (Deprecated - replaced by client-side session batching)
   */
  logEvent: () => {
    return Promise.resolve();
  },

  /**
   * Fetch aggregate analytics for owner dashboard
   */
  getBusinessAnalytics: (token, businessId, range = '30d') => {
    return apiRequest(`/api/analytics/business/${encodeURIComponent(businessId)}?range=${encodeURIComponent(range)}`, {
      token,
    });
  },
};

export default analyticsService;
