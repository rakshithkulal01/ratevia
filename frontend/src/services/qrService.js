import { apiRequest } from './apiClient.js';

export const qrService = {
  /**
   * Fetch public business information for customer QR route (/r/:slug)
   */
  getPublicBusiness: (slug) => {
    return apiRequest(`/api/qr/public/${encodeURIComponent(slug)}`);
  },

  /**
   * Fetch QR codes for owner dashboard
   */
  getBusinessQRCodes: (token, businessId) => {
    return apiRequest(`/api/qr/business/${encodeURIComponent(businessId)}`, {
      token,
    });
  },

  /**
   * Regenerate QR code
   */
  regenerateQRCode: (token, businessId) => {
    return apiRequest(`/api/qr/business/${encodeURIComponent(businessId)}/regenerate`, {
      method: 'POST',
      token,
    });
  },
};

export default qrService;
