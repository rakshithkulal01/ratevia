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
   * Log that customer copied the generated review
   */
  logReviewCopied: (feedbackId, payload = {}) => {
    return apiRequest(`/api/feedback/${feedbackId}/copied`, {
      method: 'POST',
      body: payload,
    });
  },

  /**
   * Log that customer clicked the Google review redirect link
   */
  logGoogleClicked: (feedbackId, payload = {}) => {
    return apiRequest(`/api/feedback/${feedbackId}/google-clicked`, {
      method: 'POST',
      body: payload,
    });
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
