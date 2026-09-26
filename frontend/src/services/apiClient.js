/**
 * Centralized Frontend API Client
 * Normalizes HTTP requests, authorization headers, and error handling across Ratevia.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Standard HTTP request wrapper.
 *
 * @param {string} endpoint - API path (e.g. '/api/admin/stats')
 * @param {object} options - Fetch options (method, body, token, custom headers)
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, { method = 'GET', body, token, headers = {}, ...customOptions } = {}) {
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const config = {
    method,
    headers: requestHeaders,
    ...customOptions,
  };

  if (body !== undefined && method !== 'GET' && method !== 'HEAD') {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response = await fetch(url, config);

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
    return null;
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, data);
  }

  return data;
}

export default apiRequest;
