import { BUSINESS_CATEGORIES } from './businessCategories';

/**
 * High-intent SEO Category Landing Page Data
 * Powers /review-qr-code/:category pages with differentiated value propositions,
 * placement strategies, FAQs, and structured data.
 */
export const CATEGORY_LANDING_DATA = {
  cafe: {
    slug: 'cafe',
    categoryKey: 'CAFE',
    h1: 'Google Review QR Code for Cafés',
    metaTitle: 'Google Review QR Code for Cafés — Ratevia',
    metaDescription:
      'Help your café collect more Google reviews with a branded tabletop QR stand. Customers scan, rate, and post reviews in seconds. One-time payment, no subscription.',
    heroBadge: 'BUILT FOR CAFÉS & COFFEE SHOPS',
    heroTagline: 'Turn daily regulars and coffee lovers into 5-star Google reviews before their cup runs dry.',
    valueProposition:
      'Café visitors often have great experiences with your coffee and atmosphere, but rarely think to leave a Google review unless prompted. Ratevia provides elegant acrylic stands and stickers that invite patrons to scan right from their table or the brew bar, eliminating writer’s block with smart, barista-tailored prompts.',
    placementTips: [
      {
        title: 'Table Standees',
        description: 'Place compact QR standees directly on table numbers or condiments trays where customers sit while enjoying their brew.',
      },
      {
        title: 'Order Counter & Espresso Bar',
        description: 'Position an eye-catching QR sticker beside the pickup counter or espresso bar while patrons wait for their takeaway drink.',
      },
      {
        title: 'WiFi Login Placards',
        description: 'Co-locate your review QR code on your guest WiFi access card to capture feedback from remote workers and laptop regulars.',
      },
    ],
    differentiators: [
      {
        title: 'Coffee-Centric Topics',
        description: 'Highlights like Cold Brew, Bean Freshness, Pastry Pairings, and Friendly Baristas make reviews detailed and organic.',
      },
      {
        title: '30-Second Turnaround',
        description: 'Guests can scan, tap topics, and copy their generated review onto Google Maps in under 30 seconds.',
      },
      {
        title: 'Zero Review Gating',
        description: 'Fully compliant with Google guidelines so your café maintains an untainted, authentic 5-star reputation.',
      },
    ],
    sampleReview:
      '"Had a wonderful visit! The espresso was rich and smooth, the cozy atmosphere made it great for relaxing, and the baristas were genuinely warm and welcoming."',
    faqs: [
      {
        q: 'Where is the best place to put the QR code in a café?',
        a: 'Table centers, near the sugar and napkins, or beside the espresso pickup counter. Customers waiting for their beverage or lounging over their second cup are in the prime mindset to leave feedback.',
      },
      {
        q: 'Do customers need to download an app?',
        a: 'No app is needed. Patrons simply scan using the default iOS Camera or Android Lens to instantly access your review page in their mobile browser.',
      },
      {
        q: 'Can customers still leave constructive feedback privately?',
        a: 'Yes. If a guest selects 1–3 stars, Ratevia provides an immediate constructive feedback box sent straight to your dashboard, while still maintaining Google compliance.',
      },
    ],
  },

  restaurant: {
    slug: 'restaurant',
    categoryKey: 'RESTAURANT',
    h1: 'Google Review QR Code for Restaurants',
    metaTitle: 'Google Review QR Code for Restaurants — Ratevia',
    metaDescription:
      'Boost your restaurant’s Google reviews with a custom QR stand. Touchless, table-side review collection that works while you serve. One-time payment.',
    heroBadge: 'FOR RESTAURANTS & BISTROS',
    heroTagline: 'Collect rave culinary reviews directly at the dining table right when the bill is presented.',
    valueProposition:
      'In the restaurant industry, high Google ratings and recent review velocity directly influence weekend footfall and tourist discovery. Ratevia provides premium tabletop review stands that engage diners at the happiest moment of their meal, turning exceptional culinary service into public 5-star reviews.',
    placementTips: [
      {
        title: 'Bill Presentation Folders',
        description: 'Insert a sleek Ratevia QR card into the check folder or bill tray when presenting the final receipt to diners.',
      },
      {
        title: 'Center Dining Standee',
        description: 'Place a freestanding brushed standee on each dining table, discreetly visible without cluttering the cutlery or glassware.',
      },
      {
        title: 'Host Desk & Exit Stand',
        description: 'Position an inviting stand by the maître d’ station or entrance foyer where satisfied diners pause before leaving.',
      },
    ],
    differentiators: [
      {
        title: 'Culinary Vocabularies',
        description: 'Topic options include Food Quality, Taste, Portion Size, Service Speed, and Dining Ambience tailored for dining rooms.',
      },
      {
        title: 'Peak Rush Friendly',
        description: 'Waitstaff do not have to awkwardly ask for reviews verbally—the branded standee invites patrons naturally.',
      },
      {
        title: 'Kitchen Alerts',
        description: 'Constructive input on wait times or temperature is routed privately to management so head chefs can act quickly.',
      },
    ],
    sampleReview:
      '"An exceptional dining experience from start to finish. The flavors were incredible, plating was artful, and our server made our evening truly memorable. Will be returning!"',
    faqs: [
      {
        q: 'How does table-side QR collection compare to follow-up SMS or emails?',
        a: 'In-venue collection achieves up to 4x higher response rates because the emotional glow of an enjoyable meal is fresh, whereas SMS follow-ups are frequently ignored or delayed.',
      },
      {
        q: 'Is Ratevia compliant with Google’s strict restaurant anti-gating policies?',
        a: 'Yes, 100%. Ratevia never prevents or restricts anyone from accessing your official Google review page regardless of star rating.',
      },
      {
        q: 'Can waitstaff track their table performance?',
        a: 'Yes, the Ratevia dashboard provides daily and weekly trend analytics so management can celebrate service milestones with front-of-house staff.',
      },
    ],
  },

  hotel: {
    slug: 'hotel',
    categoryKey: 'HOTEL',
    h1: 'Google Review QR Code for Hotels',
    metaTitle: 'Google Review QR Code for Hotels — Ratevia',
    metaDescription:
      'Elevate your hotel’s reputation on Google Maps. Branded QR stands for reception desks, guest rooms, and keycard folios. No monthly subscriptions.',
    heroBadge: 'FOR HOTELS, RESORTS & STAYS',
    heroTagline: 'Transform memorable guest stays into glowing Google reviews at checkout and bedside.',
    valueProposition:
      'Hotel bookings rely heavily on Google Maps ratings and traveler photo reviews. Ratevia provides luxury, discreet QR touchpoints for front desks, concierge counters, and room key folios, making it effortless for satisfied travelers to share their experience before departure.',
    placementTips: [
      {
        title: 'Reception & Checkout Counter',
        description: 'Place a brushed acrylic stand at check-out desks where guests pause during billing and keycard return.',
      },
      {
        title: 'In-Room Bedside Table',
        description: 'Display an elegant stand alongside the room directory or room service menu for evening guests.',
      },
      {
        title: 'Breakfast Buffet & Lounge',
        description: 'Place compact stands on dining tables in the breakfast lounge when travelers are energized and relaxed.',
      },
    ],
    differentiators: [
      {
        title: 'Hospitality-Focused Prompts',
        description: 'Guests can select Room Cleanliness, Bed Comfort, Staff Hospitality, Breakfast Variety, and Location Convenience.',
      },
      {
        title: 'Multi-Lingual Friendly',
        description: 'Intuitive icon-based topic selection allows international travelers to express satisfaction with zero language friction.',
      },
      {
        title: 'Real-Time Housekeeping Insights',
        description: 'Constructive notes are captured privately in your dashboard so operations can fix room issues before future check-ins.',
      },
    ],
    sampleReview:
      '"Loved our stay here! The room was spotless, the bed was exceptionally comfortable, and the front desk staff went above and beyond to assist us throughout our trip."',
    faqs: [
      {
        q: 'Should we place QR stands in every guest room or just at reception?',
        a: 'Both work exceptionally well. Reception checkout stands capture high-intent travelers right before departure, while bedside stands capture guests relaxing after a comfortable stay.',
      },
      {
        q: 'Does Ratevia work for boutique villas and bed & breakfasts?',
        a: 'Yes! Small boutique properties, homestays, and boutique hotels benefit tremendously from Ratevia’s one-time purchase model with no recurring SaaS costs.',
      },
      {
        q: 'Can we redirect guests to TripAdvisor instead of Google?',
        a: 'Ratevia supports any custom review destination URL you configure in your dashboard settings.',
      },
    ],
  },

  salon: {
    slug: 'salon',
    categoryKey: 'SALON',
    h1: 'Google Review QR Code for Salons & Spas',
    metaTitle: 'Google Review QR Code for Salons & Spas — Ratevia',
    metaDescription:
      'Collect 5-star Google reviews for your salon or spa while clients admire their fresh new look. Beautiful mirror and checkout stands.',
    heroBadge: 'FOR SALONS, SPAS & BARBERSHOPS',
    heroTagline: 'Capture raving reviews at the exact moment clients look in the mirror and love their transformation.',
    valueProposition:
      'Salons thrive on visual proof and personal recommendations. When a client loves their fresh haircut, manicure, or spa treatment, their satisfaction is at its peak. Ratevia’s mirror-mounted QR stickers and reception stands invite clients to share their love on Google in seconds.',
    placementTips: [
      {
        title: 'Styling Station Mirrors',
        description: 'Apply a compact Ratevia branded QR sticker to the bottom corner of each styling station mirror.',
      },
      {
        title: 'Payment & Reception Counter',
        description: 'Set a premium acrylic standee next to your card payment machine where clients settle their appointment.',
      },
      {
        title: 'Waiting Lounge Coffee Bar',
        description: 'Feature a stand on lounge tables where companions wait or clients relax during color processing.',
      },
    ],
    differentiators: [
      {
        title: 'Stylist & Treatment Prompts',
        description: 'Specific highlights include Hair Styling, Skin Glow, Cleanliness, Ambience, Staff Politeness, and Value for Money.',
      },
      {
        title: 'Overcomes Awkward Asks',
        description: 'Stylists do not have to plead for reviews; clients naturally scan while admiring their new style.',
      },
      {
        title: 'Portfolio & Search Boost',
        description: 'Fresh reviews containing keywords like haircut, facial, and highlights boost your local Google Maps ranking.',
      },
    ],
    sampleReview:
      '"Always an amazing experience here! My stylist understood exactly what I wanted, the scalp massage was so relaxing, and the salon was clean and stylish."',
    faqs: [
      {
        q: 'Can clients upload photos of their haircut or nails?',
        a: 'When Ratevia redirects the client to your official Google Maps review screen, they can easily attach photos directly alongside their generated review text.',
      },
      {
        q: 'Can we customize the accent color to match our salon branding?',
        a: 'Yes! Ratevia lets you select from curated design accents to perfectly complement your salon interior aesthetic.',
      },
      {
        q: 'Does it work for independent barbers and solo nail technicians?',
        a: 'Absolutely. Solo professionals love our one-time payment structure because there are no expensive monthly subscriptions eating into their margins.',
      },
    ],
  },

  bakery: {
    slug: 'bakery',
    categoryKey: 'BAKERY',
    h1: 'Google Review QR Code for Bakeries',
    metaTitle: 'Google Review QR Code for Bakeries — Ratevia',
    metaDescription:
      'Help your bakery turn sourdough fans and cake lovers into Google reviews. Branded counter standees and takeaway box stickers. One-time setup.',
    heroBadge: 'FOR BAKERIES & PASTRY SHOPS',
    heroTagline: 'Turn mouthwatering pastries and fresh bread aroma into stellar Google reviews.',
    valueProposition:
      'Artisan bakeries and cake shops rely heavily on local word-of-mouth and Google searches like "best croissants near me" or "custom birthday cakes". Ratevia provides eye-catching counter standees and takeaway packaging QR codes that make leaving a review sweet and effortless.',
    placementTips: [
      {
        title: 'Pastry Display Glass Counter',
        description: 'Place a stand on the glass display counter right where patrons point out their favorite artisanal bakes.',
      },
      {
        title: 'Packaging & Cake Boxes',
        description: 'Affix Ratevia QR stickers to custom cake boxes and pastry bags for customers savoring treats at home.',
      },
      {
        title: 'Seated Café Tables',
        description: 'If you offer café seating, place small tabletop standees near the sugar station for seated guests.',
      },
    ],
    differentiators: [
      {
        title: 'Baking-Specific Topics',
        description: 'Highlight Freshness, Crust Quality, Pastry Flakiness, Sourdough Taste, Custom Cakes, and Warm Service.',
      },
      {
        title: 'Takeaway Friendly',
        description: 'Works seamlessly whether customers dine in or take fresh bread home to enjoy with family.',
      },
      {
        title: 'No App or Signup Needed',
        description: 'Customers scan immediately on their phone with zero barriers.',
      },
    ],
    sampleReview:
      '"The best bakery in town! Freshly baked goods with incredible texture and flavor. The staff was friendly and the aroma when you walk in is heavenly."',
    faqs: [
      {
        q: 'Can we print the QR code on our custom cake boxes?',
        a: 'Yes! Ratevia provides high-resolution vector and print-ready digital assets that you can send directly to your packaging printer.',
      },
      {
        q: 'What if a customer has an issue with their custom order?',
        a: 'Ratevia captures constructive notes privately for 1–3 star ratings so you can resolve order issues quickly with the customer.',
      },
      {
        q: 'How fast can a bakery start using Ratevia?',
        a: 'Once approved, your dashboard and digital printable assets are ready immediately.',
      },
    ],
  },

  gym: {
    slug: 'gym',
    categoryKey: 'GYM',
    h1: 'Google Review QR Code for Gyms & Fitness Studios',
    metaTitle: 'Google Review QR Code for Gyms & Fitness Studios — Ratevia',
    metaDescription:
      'Boost your gym or fitness studio’s Google reviews with branded QR stands. Motivate members to leave reviews at water stations and checkout.',
    heroBadge: 'FOR GYMS, CROSSFIT & PILATES STUDIOS',
    heroTagline: 'Harness high post-workout endorphins into enthusiastic 5-star Google ratings.',
    valueProposition:
      'Gym-goers are at their happiest and most energized immediately following a great workout or personal training milestone. Ratevia’s durable, high-visibility QR standees turn that post-exercise high into genuine, glowing Google reviews that attract new local members.',
    placementTips: [
      {
        title: 'Water Cooler & Hydration Stations',
        description: 'Place a waterproof standee near the hydration lounge where members rest between circuits.',
      },
      {
        title: 'Member Check-In & Exit Turnstiles',
        description: 'Mount a prominent QR stand beside the check-in iPad or front desk counter where members exit.',
      },
      {
        title: 'Locker Room Exit Mirrors',
        description: 'Position stickers near locker room exit mirrors where members freshen up after training.',
      },
    ],
    differentiators: [
      {
        title: 'Fitness Vocabularies',
        description: 'Topics include Equipment Variety, Cleanliness, Trainer Support, Energy/Vibe, Locker Rooms, and Community.',
      },
      {
        title: 'Durable & Modern Design',
        description: 'Stands that look right at home in modern boutique fitness studios, CrossFit boxes, and traditional health clubs.',
      },
      {
        title: 'Facility Maintenance Alerts',
        description: 'Private feedback alerts staff if equipment needs maintenance before negative reviews appear online.',
      },
    ],
    sampleReview:
      '"Fantastic gym! The equipment is top-tier and well-maintained, the coaches are knowledgeable and motivating, and the atmosphere keeps you pushing for your best."',
    faqs: [
      {
        q: 'Why should gyms collect reviews on Google instead of just internal surveys?',
        a: 'Internal surveys don’t improve your Google Maps local SEO. When prospective members search for "gyms near me", review count and recent ratings are the #1 factor in their decision to tour.',
      },
      {
        q: 'How do trainers benefit from Ratevia?',
        a: 'Reviews frequently mention helpful trainers and class coaches by name, which builds personal credibility and brings more personal training clients.',
      },
      {
        q: 'Is there any ongoing monthly cost per member?',
        a: 'None! Ratevia is an all-inclusive one-time setup fee with unlimited member scans.',
      },
    ],
  },
};

export const getCategoryLandingData = (slug) => {
  return CATEGORY_LANDING_DATA[slug?.toLowerCase()] || null;
};
