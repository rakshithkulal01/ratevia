/**
 * Centralized Backend Category Configuration
 * Supports 11 business categories with topics, review context, and fallback to OTHER.
 */

export const BUSINESS_CATEGORIES = {
  CAFE: {
    category: 'CAFE',
    displayName: 'Café',
    positiveTopics: [
      'Food Quality',
      'Taste',
      'Staff Friendliness',
      'Ambience',
      'Cleanliness',
      'Service Speed',
      'Value for Money',
    ],
    improvementTopics: [
      'Taste',
      'Waiting Time',
      'Pricing',
      'Service Speed',
      'Cleanliness',
      'Ambience',
      'Staff Service',
    ],
    reviewContext: 'café and beverage experience',
  },
  RESTAURANT: {
    category: 'RESTAURANT',
    displayName: 'Restaurant',
    positiveTopics: [
      'Food Quality',
      'Taste',
      'Menu Variety',
      'Staff Service',
      'Ambience',
      'Cleanliness',
      'Service Speed',
      'Value for Money',
    ],
    improvementTopics: [
      'Food Quality',
      'Taste',
      'Waiting Time',
      'Pricing',
      'Service',
      'Cleanliness',
      'Ambience',
    ],
    reviewContext: 'dining and culinary experience',
  },
  HOTEL: {
    category: 'HOTEL',
    displayName: 'Hotel',
    positiveTopics: [
      'Room Quality',
      'Cleanliness',
      'Staff Service',
      'Location',
      'Facilities',
      'Comfort',
      'Check-in Experience',
      'Value for Money',
    ],
    improvementTopics: [
      'Room Quality',
      'Cleanliness',
      'Staff Service',
      'Check-in/Check-out',
      'Facilities',
      'Pricing',
      'Location',
    ],
    reviewContext: 'hotel stay and hospitality experience',
  },
  CLOTHING_SHOP: {
    category: 'CLOTHING_SHOP',
    displayName: 'Clothing Shop',
    positiveTopics: [
      'Product Variety',
      'Product Quality',
      'Staff Assistance',
      'Store Experience',
      'Pricing',
      'Availability',
      'Store Cleanliness',
    ],
    improvementTopics: [
      'Product Variety',
      'Product Availability',
      'Pricing',
      'Staff Assistance',
      'Store Experience',
      'Product Quality',
      'Waiting Time',
    ],
    reviewContext: 'clothing and shopping experience',
  },
  ELECTRONICS_SHOP: {
    category: 'ELECTRONICS_SHOP',
    displayName: 'Electronics Shop',
    positiveTopics: [
      'Product Quality',
      'Product Variety',
      'Staff Knowledge',
      'Staff Assistance',
      'Pricing',
      'Product Availability',
      'Store Experience',
    ],
    improvementTopics: [
      'Product Availability',
      'Pricing',
      'Staff Assistance',
      'Product Variety',
      'Product Knowledge',
      'Waiting Time',
      'Store Experience',
    ],
    reviewContext: 'electronics shopping experience',
  },
  SALON: {
    category: 'SALON',
    displayName: 'Salon',
    positiveTopics: [
      'Service Quality',
      'Staff Friendliness',
      'Professionalism',
      'Cleanliness',
      'Waiting Time',
      'Ambience',
      'Value for Money',
    ],
    improvementTopics: [
      'Service Quality',
      'Waiting Time',
      'Pricing',
      'Staff Service',
      'Cleanliness',
      'Ambience',
    ],
    reviewContext: 'salon and personal care experience',
  },
  GARAGE: {
    category: 'GARAGE',
    displayName: 'Garage / Auto Service',
    positiveTopics: [
      'Service Quality',
      'Repair Quality',
      'Staff Professionalism',
      'Pricing Transparency',
      'Service Speed',
      'Communication',
      'Value for Money',
    ],
    improvementTopics: [
      'Repair Quality',
      'Service Time',
      'Pricing',
      'Communication',
      'Transparency',
      'Staff Service',
      'Overall Experience',
    ],
    reviewContext: 'vehicle service and repair experience',
  },
  BAKERY: {
    category: 'BAKERY',
    displayName: 'Bakery',
    positiveTopics: [
      'Taste',
      'Freshness',
      'Product Variety',
      'Staff Service',
      'Cleanliness',
      'Pricing',
      'Product Quality',
    ],
    improvementTopics: [
      'Taste',
      'Freshness',
      'Product Availability',
      'Pricing',
      'Staff Service',
      'Cleanliness',
      'Variety',
    ],
    reviewContext: 'bakery and food experience',
  },
  GYM: {
    category: 'GYM',
    displayName: 'Gym',
    positiveTopics: [
      'Equipment Quality',
      'Cleanliness',
      'Trainers',
      'Staff',
      'Facilities',
      'Crowd Levels',
      'Atmosphere',
      'Value for Money',
    ],
    improvementTopics: [
      'Equipment',
      'Cleanliness',
      'Crowd Levels',
      'Trainers',
      'Staff',
      'Facilities',
      'Pricing',
      'Maintenance',
    ],
    reviewContext: 'fitness and training experience',
  },
  RETAIL_SHOP: {
    category: 'RETAIL_SHOP',
    displayName: 'Retail Shop',
    positiveTopics: [
      'Product Variety',
      'Product Quality',
      'Staff Service',
      'Pricing',
      'Availability',
      'Store Experience',
      'Cleanliness',
    ],
    improvementTopics: [
      'Product Availability',
      'Product Variety',
      'Pricing',
      'Staff Service',
      'Waiting Time',
      'Cleanliness',
    ],
    reviewContext: 'retail store experience',
  },
  OTHER: {
    category: 'OTHER',
    displayName: 'Other',
    positiveTopics: [
      'Product/Service Quality',
      'Staff Friendliness',
      'Customer Service',
      'Cleanliness',
      'Value for Money',
      'Overall Experience',
    ],
    improvementTopics: [
      'Product/Service Quality',
      'Customer Service',
      'Waiting Time',
      'Pricing',
      'Cleanliness',
      'Overall Experience',
    ],
    reviewContext: 'customer service and overall experience',
  },
};

export const SUPPORTED_CATEGORIES = Object.keys(BUSINESS_CATEGORIES);

/**
 * Returns category config, falling back to 'OTHER' if category is invalid or undefined.
 */
export function getCategoryConfig(category) {
  if (!category || !BUSINESS_CATEGORIES[category]) {
    return BUSINESS_CATEGORIES.OTHER;
  }
  return BUSINESS_CATEGORIES[category];
}

/**
 * Returns array of supported category string keys.
 */
export function getSupportedCategories() {
  return SUPPORTED_CATEGORIES;
}

/**
 * Checks if a category string is supported.
 */
export function isSupportedCategory(category) {
  return Boolean(category && BUSINESS_CATEGORIES[category]);
}
