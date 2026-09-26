import { apiRequest } from './apiClient.js';

export const businessService = {
  /**
   * Fetch current authenticated owner's business
   */
  getBusiness: (token) => {
    return apiRequest('/api/business', { token });
  },

  /**
   * Update current authenticated owner's business settings
   */
  updateBusiness: (token, payload) => {
    return apiRequest('/api/business', {
      method: 'PATCH',
      body: payload,
      token,
    });
  },

  /**
   * Create business (onboarding)
   */
  createBusiness: (token, payload) => {
    return apiRequest('/api/business', {
      method: 'POST',
      body: payload,
      token,
    });
  },
};

export default businessService;
