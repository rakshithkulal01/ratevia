import { apiRequest } from './apiClient.js';

export const businessRequestService = {
  /**
   * Submit an inbound business registration request
   * @param {object} payload
   */
  submitBusinessRequest: (payload) => {
    return apiRequest('/api/business-requests', {
      method: 'POST',
      body: payload,
    });
  },
};

export default businessRequestService;
