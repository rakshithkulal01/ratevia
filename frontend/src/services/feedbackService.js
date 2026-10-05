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
   * Retrieve feedback history for owner dashboard with optional rating filter
   */
  getFeedbacks: (token, ratingFilter = 'all') => {
    const query = ratingFilter && ratingFilter !== 'all' ? `?rating=${encodeURIComponent(ratingFilter)}` : '';
    return apiRequest(`/api/feedback${query}`, { token });
  },
};

export default feedbackService;
