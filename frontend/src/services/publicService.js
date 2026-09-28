import { apiRequest } from './apiClient.js';

export const publicService = {
  /**
   * Fetch current public Ratevia price from backend
   */
  getPublicPrice: async () => {
    return apiRequest('/api/public/settings/price');
  },

  /**
   * Submit public QR customization request
   */
  submitQRRequest: async (payload) => {
    return apiRequest('/api/public/qr-requests', {
      method: 'POST',
      body: payload,
    });
  },

  /**
   * Get safe public status of a submitted QR request
   */
  getQRRequestStatus: async (requestId) => {
    return apiRequest(`/api/public/qr-requests/${requestId}`);
  },
};

export default publicService;
