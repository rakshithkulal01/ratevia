import { apiRequest } from './apiClient.js';

export const analyticsService = {
  /**
   * Log public customer funnel events (QR_SCANNED, FEEDBACK_STARTED, etc.)
   */
  logEvent: (payload) => {
    return apiRequest('/api/analytics/events', {
      method: 'POST',
      body: payload,
    });
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
