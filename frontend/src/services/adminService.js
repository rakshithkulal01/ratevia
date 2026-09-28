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

  /**
   * Fetch QR customization requests with optional status filter
   */
  getQRRequests: (token, status = 'ALL') => {
    const query = status && status !== 'ALL' ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest(`/api/admin/qr-requests${query}`, { token });
  },

  /**
   * Fetch complete details of a single QR customization request
   */
  getQRRequestById: (token, id) => {
    return apiRequest(`/api/admin/qr-requests/${id}`, { token });
  },

  /**
   * Mark a QR request as CONTACTED
   */
  logQRContact: (token, id) => {
    return apiRequest(`/api/admin/qr-requests/${id}/contact`, {
      method: 'PATCH',
      token,
    });
  },

  /**
   * Approve a QR customization request
   */
  approveQRRequest: (token, id) => {
    return apiRequest(`/api/admin/qr-requests/${id}/approve`, {
      method: 'POST',
      token,
    });
  },

  /**
   * Reject a QR customization request with optional reason
   */
  rejectQRRequest: (token, id, reason) => {
    return apiRequest(`/api/admin/qr-requests/${id}/reject`, {
      method: 'POST',
      body: { reason },
      token,
    });
  },

  /**
   * Fetch current admin pricing settings and history
   */
  getPricingSettings: (token) => {
    return apiRequest('/api/admin/settings/price', { token });
  },

  /**
   * Update Ratevia pricing
   */
  updatePricingSettings: (token, payload) => {
    return apiRequest('/api/admin/settings/price', {
      method: 'PUT',
      body: payload,
      token,
    });
  },
};

export default adminService;
