import { apiRequest } from './apiClient.js';

export const feedbackService = {
  /**
   * Submit customer feedback from the public QR flow
   */
  submitFeedback: (payload) => {
    return apiRequest('/api/feedback', {
      method: 'POST',
      body: payload,
    });
  },

  /**
   * Log that customer copied the generated review (Deprecated - handled via analytics batching)
   */
  logReviewCopied: () => {
    return Promise.resolve({ success: true });
  },

  /**
   * Log that customer clicked the Google review redirect link (Deprecated - handled via analytics batching)
   */
  logGoogleClicked: () => {
    return Promise.resolve({ success: true });
  },

  /**
   * Retrieve feedback history for owner dashboard with optional rating filter
   */
  getFeedbacks: (token, ratingFilter = 'all') => {
    const query = ratingFilter && ratingFilter !== 'all' ? `?rating=${encodeURIComponent(ratingFilter)}` : '';
    return apiRequest(`/api/feedback${query}`, { token });
  },

  /**
   * Retrieve feedback history for owner dashboard by business ID
   */
  getBusinessFeedback: (token, businessId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/feedback/business/${businessId}${query ? `?${query}` : ''}`, {
      token,
    });
  },
};

export default feedbackService;
