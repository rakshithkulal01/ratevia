import { apiRequest } from './apiClient.js';

export const adminService = {
  /**
   * Fetch platform metrics (total businesses, active, feedbacks, scans, inquiries)
   */
  getStats: (token) => {
    return apiRequest('/api/admin/stats', { token });
  },

  /**
   * Fetch directory of all businesses
   */
  getBusinesses: (token) => {
    return apiRequest('/api/admin/businesses', { token });
  },

  /**
   * Fetch business registration requests with optional status filter
   */
  getBusinessRequests: (token, status = 'ALL') => {
    const query = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest(`/api/admin/business-requests${query}`, { token });
  },

  /**
   * Mark a business request as CONTACTED
   */
  logContact: (token, requestId) => {
    return apiRequest(`/api/admin/business-requests/${requestId}/contact`, {
      method: 'PATCH',
      token,
    });
  },

  /**
   * Toggle business active/suspended status
   */
  toggleBusinessStatus: (token, businessId, isActive) => {
    return apiRequest(`/api/admin/businesses/${businessId}/status`, {
      method: 'PATCH',
      body: { isActive },
      token,
    });
  },

  /**
   * Provision a new business (supports optional requestId to link lead history)
   */
  provisionBusiness: (token, payload) => {
    return apiRequest('/api/admin/businesses', {
      method: 'POST',
      body: payload,
      token,
    });
  },
};

export default adminService;
