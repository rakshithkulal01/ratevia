/**
 * Centralized Frontend API Client
 * Normalizes HTTP requests, authorization headers, and error handling across Ratevia.
 */

import { supabase } from '../lib/supabase';

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
 * Standard HTTP request wrapper with automatic Supabase session refresh on 401.
 *
 * @param {string} endpoint - API path (e.g. '/api/admin/stats')
 * @param {object} options - Fetch options (method, body, token, custom headers, _isRetry)
 * @returns {Promise<any>}
 */
export async function apiRequest(
  endpoint,
  { method = 'GET', body, token, headers = {}, _isRetry = false, ...customOptions } = {}
) {
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // If no explicit token provided, attempt to get active Supabase session token
  let effectiveToken = token;
  if (!effectiveToken && supabase) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      effectiveToken = sessionData?.session?.access_token || null;
    } catch {
      // Ignore session read error
    }
  }

  if (effectiveToken) {
    requestHeaders.Authorization = `Bearer ${effectiveToken}`;
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

  // If 401 Unauthorized occurs, attempt to refresh session before failing
  if (response.status === 401 && !_isRetry && supabase) {
    try {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (!refreshError && refreshData?.session?.access_token) {
        // Retry the request once with the newly refreshed access token
        return await apiRequest(endpoint, {
          method,
          body,
          token: refreshData.session.access_token,
          headers,
          _isRetry: true,
          ...customOptions,
        });
      }
    } catch (refreshErr) {
      console.warn('[ApiClient] Token refresh failed on 401:', refreshErr.message);
    }
  }

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
