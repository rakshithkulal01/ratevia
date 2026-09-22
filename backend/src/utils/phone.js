/**
 * Utility functions for validating and normalizing phone numbers.
 * Supports Indian format (+91 default) and international formats.
 */

/**
 * Normalizes phone numbers:
 * - Strips whitespace, hyphens, parentheses.
 * - If 10 digits without country code (e.g. "9876543210"), assumes Indian default "+91".
 * - If begins with "0" followed by 10 digits (e.g. "09876543210"), converts to "+91" prefix.
 * - Ensures single leading '+' followed by 10 to 15 digits.
 *
 * @param {string} rawPhone
 * @param {string} defaultCountryCode
 * @returns {string|null} Normalized phone number in E.164-like format (e.g. "+919876543210") or null if invalid.
 */
export function normalizePhoneNumber(rawPhone, defaultCountryCode = '+91') {
  if (!rawPhone || typeof rawPhone !== 'string') return null;

  // Remove spaces, hyphens, parentheses, dots
  let cleaned = rawPhone.trim().replace(/[\s\-\(\)\.]/g, '');

  if (!cleaned) return null;

  // Check if starts with '+'
  if (cleaned.startsWith('+')) {
    const digitsOnly = cleaned.slice(1);
    if (!/^\d{10,15}$/.test(digitsOnly)) {
      return null;
    }
    return cleaned;
  }

  // Handle leading '00' international prefix (e.g. 00919876543210)
  if (cleaned.startsWith('00')) {
    const digitsOnly = cleaned.slice(2);
    if (!/^\d{10,15}$/.test(digitsOnly)) {
      return null;
    }
    return `+${digitsOnly}`;
  }

  // Handle leading '0' for Indian local numbers (e.g. 09876543210)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  // If 10 digits (standard Indian mobile/landline), prepend default country code
  if (/^\d{10}$/.test(cleaned)) {
    const cc = defaultCountryCode.startsWith('+') ? defaultCountryCode : `+${defaultCountryCode}`;
    return `${cc}${cleaned}`;
  }

  // If already starts with country code without plus (e.g. 919876543210 for 12 digits)
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  // If 11-15 digits without plus
  if (/^\d{11,15}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  return null;
}

/**
 * Validates whether a raw phone number can be normalized into a valid phone number.
 *
 * @param {string} rawPhone
 * @returns {boolean}
 */
export function isValidPhoneNumber(rawPhone) {
  return normalizePhoneNumber(rawPhone) !== null;
}
