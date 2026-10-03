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
   * Delete an individual business request row
   */
  deleteBusinessRequest: (token, requestId) => {
    return apiRequest(`/api/admin/business-requests/${requestId}`, {
      method: 'DELETE',
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
   * Delete an individual QR customization request row
   */
  deleteQRRequest: (token, id) => {
    return apiRequest(`/api/admin/qr-requests/${id}`, {
      method: 'DELETE',
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

  /**
   * Fetch current admin profile and granted permissions
   */
  getAdminMe: (token) => {
    return apiRequest('/api/admin/me', { token });
  },

  /**
   * Fetch available permissions catalog
   */
  getAdminPermissions: (token) => {
    return apiRequest('/api/admin/permissions', { token });
  },

  /**
   * Fetch list of all administrators
   */
  getAdmins: (token) => {
    return apiRequest('/api/admin/admins', { token });
  },

  /**
   * Fetch details of a specific administrator
   */
  getAdminById: (token, id) => {
    return apiRequest(`/api/admin/admins/${id}`, { token });
  },

  /**
   * Create a new administrator
   */
  createAdmin: (token, payload) => {
    return apiRequest('/api/admin/admins', {
      method: 'POST',
      body: payload,
      token,
    });
  },

  /**
   * Update administrator details and permissions
   */
  updateAdmin: (token, id, payload) => {
    return apiRequest(`/api/admin/admins/${id}`, {
      method: 'PATCH',
      body: payload,
      token,
    });
  },

  /**
   * Reactivate an administrator
   */
  activateAdmin: (token, id) => {
    return apiRequest(`/api/admin/admins/${id}/activate`, {
      method: 'POST',
      token,
    });
  },

  /**
   * Deactivate an administrator
   */
  deactivateAdmin: (token, id) => {
    return apiRequest(`/api/admin/admins/${id}/deactivate`, {
      method: 'POST',
      token,
    });
  },

  /**
   * Permanently delete an administrator
   */
  deleteAdmin: (token, id) => {
    return apiRequest(`/api/admin/admins/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};

export default adminService;
