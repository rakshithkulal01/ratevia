import {
  Coffee,
  UtensilsCrossed,
  Hotel,
  Shirt,
  Smartphone,
  Scissors,
  Wrench,
  Croissant,
  Dumbbell,
  ShoppingBag,
  Store,
} from 'lucide-react';

/**
 * Centralized Frontend Business Categories Configuration
 * Drives icons, display names, positive & improvement topics, and review context
 * for all 11 supported business categories.
 */
export const BUSINESS_CATEGORIES = {
  CAFE: {
    category: 'CAFE',
    displayName: 'Café',
    icon: Coffee,
    brandTheme: {
      defaultAccent: 'warm',
      accentColor: '#D97706',
      badgeClasses: 'bg-amber-50 text-amber-800 border-amber-200',
      mood: 'Warm & Welcoming',
      tagline: 'Artisan Coffee & Warm Sips',
    },
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
    description: 'Coffee, pastries, beverages, and casual cafe ambience.',
  },
  RESTAURANT: {
    category: 'RESTAURANT',
    displayName: 'Restaurant',
    icon: UtensilsCrossed,
    brandTheme: {
      defaultAccent: 'elegant',
      accentColor: '#0F766E',
      badgeClasses: 'bg-teal-50 text-teal-800 border-teal-200',
      mood: 'Refined & Dining-Oriented',
      tagline: 'Fine Dining & Flavor Excellence',
    },
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
    description: 'Fine dining, bistros, casual eateries, and culinary service.',
  },
  HOTEL: {
    category: 'HOTEL',
    displayName: 'Hotel',
    icon: Hotel,
    brandTheme: {
      defaultAccent: 'elegant',
      accentColor: '#1E3A8A',
      badgeClasses: 'bg-blue-50 text-blue-900 border-blue-200',
      mood: 'Premium & Elegant',
      tagline: 'Boutique Hospitality & Comfort',
    },
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
    description: 'Boutique stays, resorts, hospitality rooms, and guest comfort.',
  },
  CLOTHING_SHOP: {
    category: 'CLOTHING_SHOP',
    displayName: 'Clothing Shop',
    icon: Shirt,
    brandTheme: {
      defaultAccent: 'ratevia-blue',
      accentColor: '#7C3AED',
      badgeClasses: 'bg-purple-50 text-purple-800 border-purple-200',
      mood: 'Fashion-Oriented & Minimal',
      tagline: 'Curated Style & Apparel',
    },
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
    description: 'Apparel, boutiques, fashion collections, and retail assistance.',
  },
  ELECTRONICS_SHOP: {
    category: 'ELECTRONICS_SHOP',
    displayName: 'Electronics Shop',
    icon: Smartphone,
    brandTheme: {
      defaultAccent: 'ratevia-blue',
      accentColor: '#0284C7',
      badgeClasses: 'bg-sky-50 text-sky-800 border-sky-200',
      mood: 'Modern & Technical',
      tagline: 'Innovative Devices & Tech Gear',
    },
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
    description: 'Gadgets, devices, tech accessories, and knowledgeable advice.',
  },
  SALON: {
    category: 'SALON',
    displayName: 'Salon',
    icon: Scissors,
    brandTheme: {
      defaultAccent: 'elegant',
      accentColor: '#BE185D',
      badgeClasses: 'bg-rose-50 text-rose-800 border-rose-200',
      mood: 'Elegant & Sophisticated',
      tagline: 'Grooming, Style & Personal Care',
    },
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
    description: 'Haircare, grooming, styling, and personal wellness treatments.',
  },
  GARAGE: {
    category: 'GARAGE',
    displayName: 'Garage / Auto Service',
    icon: Wrench,
    brandTheme: {
      defaultAccent: 'neutral',
      accentColor: '#334155',
      badgeClasses: 'bg-slate-100 text-slate-800 border-slate-300',
      mood: 'Strong & Industrial',
      tagline: 'Precision Auto Care & Mechanics',
    },
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
    description: 'Vehicle maintenance, mechanics, transparent pricing, and repairs.',
  },
  BAKERY: {
    category: 'BAKERY',
    displayName: 'Bakery',
    icon: Croissant,
    brandTheme: {
      defaultAccent: 'warm',
      accentColor: '#EA580C',
      badgeClasses: 'bg-orange-50 text-orange-800 border-orange-200',
      mood: 'Warm & Friendly',
      tagline: 'Fresh Oven Bakes & Sweet Treats',
    },
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
    description: 'Fresh bread, artisan cakes, confections, and baked treats.',
  },
  GYM: {
    category: 'GYM',
    displayName: 'Gym',
    icon: Dumbbell,
    brandTheme: {
      defaultAccent: 'bold',
      accentColor: '#DC2626',
      badgeClasses: 'bg-red-50 text-red-800 border-red-200',
      mood: 'Energetic & Bold',
      tagline: 'Fitness, Strength & Energy',
    },
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
    description: 'Fitness centers, modern workout equipment, coaches, and hygiene.',
  },
  RETAIL_SHOP: {
    category: 'RETAIL_SHOP',
    displayName: 'Retail Shop',
    icon: ShoppingBag,
    brandTheme: {
      defaultAccent: 'ratevia-blue',
      accentColor: '#059669',
      badgeClasses: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      mood: 'Clean & Commercial',
      tagline: 'Neighborhood Goods & Essentials',
    },
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
    description: 'General merchandise, neighborhood convenience, and customer care.',
  },
  OTHER: {
    category: 'OTHER',
    displayName: 'Other',
    icon: Store,
    brandTheme: {
      defaultAccent: 'ratevia-blue',
      accentColor: '#0052FF',
      badgeClasses: 'bg-blue-50 text-blue-800 border-blue-200',
      mood: 'Neutral & Trusted',
      tagline: 'Quality Service & Customer Care',
    },
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
    description: 'Local services, professional trade, and specialized businesses.',
  },
};

export const SUPPORTED_CATEGORIES = Object.keys(BUSINESS_CATEGORIES);

/**
 * Returns configuration for a given category key, falling back to 'OTHER' if unrecognized.
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

/**
 * Returns category options formatted for select dropdowns.
 */
export function getCategoryOptions() {
  return Object.values(BUSINESS_CATEGORIES).map((c) => ({
    value: c.category,
    label: c.displayName,
    icon: c.icon,
    description: c.description,
  }));
}

