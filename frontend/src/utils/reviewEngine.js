/**
 * Pure, deterministic, client-side review generation engine.
 * Tailored for Cafés, Restaurants, and Hotels with ethical, authentic review drafting.
 * Supports positive praise (4-5 stars) and polite, constructive feedback (1-3 stars).
 */

export const TOPICS_BY_BUSINESS_TYPE = {
  CAFE: [
    'Great Coffee',
    'Cozy Atmosphere',
    'Friendly Baristas',
    'Fast Wi-Fi',
    'Fresh Pastries',
    'Quick Service',
  ],
  RESTAURANT: [
    'Delicious Food',
    'Attentive Staff',
    'Great Ambience',
    'Generous Portions',
    'Fresh Ingredients',
    'Great Value',
  ],
  HOTEL: [
    'Clean Rooms',
    'Comfortable Bed',
    'Excellent Service',
    'Great Location',
    'Quiet Stay',
    'Smooth Check-in',
  ],
};

export const CONSTRUCTIVE_TOPICS = [
  'Waiting Time',
  'Staff & Service',
  'Food/Drink Quality',
  'Cleanliness',
  'Pricing & Value',
  'Order Accuracy',
  'Noise Level',
  'Other',
];

// Topic descriptions for natural incorporation
const POSITIVE_PHRASES = {
  'Great Coffee': ['the coffee was excellent', 'the coffee drinks were delicious', 'outstanding coffee'],
  'Cozy Atmosphere': ['the atmosphere was really cozy and welcoming', 'a lovely and warm ambience', 'great vibe to relax'],
  'Friendly Baristas': ['the baristas were genuinely friendly and welcoming', 'the team was super pleasant', 'warm and kind staff'],
  'Fast Wi-Fi': ['the Wi-Fi was fast and reliable', 'great connection for getting work done', 'reliable Wi-Fi'],
  'Fresh Pastries': ['the fresh pastries were a wonderful treat', 'delicious fresh bakery treats', 'tasty, fresh pastries'],
  'Quick Service': ['the service was swift and seamless', 'quick and efficient service', 'prompt service'],

  'Delicious Food': ['the food was delicious and full of flavor', 'every dish was cooked to perfection', 'fantastic flavors'],
  'Attentive Staff': ['the staff was attentive and accommodating', 'servers were attentive and welcoming', 'wonderful hospitality from the team'],
  'Great Ambience': ['the ambience was comfortable and stylish', 'a very enjoyable dining atmosphere', 'great setting for a meal'],
  'Generous Portions': ['the portions were generous and satisfying', 'very hearty and generous portions', 'well-portioned dishes'],
  'Fresh Ingredients': ['the ingredients tasted fresh and high quality', 'noticeably fresh and quality ingredients', 'fresh and well-prepared ingredients'],
  'Great Value': ['great quality for the price', 'solid value for money', 'reasonably priced for the experience'],

  'Clean Rooms': ['the room was spotless and well-maintained', 'everything was immaculately clean', 'clean and fresh accommodation'],
  'Comfortable Bed': ['the bed was extremely comfortable for a great night’s sleep', 'very cozy and restful bed', 'slept wonderfully in a comfortable bed'],
  'Excellent Service': ['the staff provided excellent and professional service', 'warm and professional hospitality', 'top-notch guest service'],
  'Great Location': ['convenient and central location', 'a wonderful location with easy access to everything', 'ideal and accessible spot'],
  'Quiet Stay': ['a peaceful and quiet stay', 'quiet and relaxing environment', 'very restful and low noise'],
  'Smooth Check-in': ['check-in was smooth and effortless', 'quick and welcoming check-in process', 'seamless arrival and check-in'],
};

const CONSTRUCTIVE_PHRASES = {
  'Waiting Time': ['the wait time was longer than anticipated', 'service took a bit longer than expected', 'there was quite a delay during our visit'],
  'Staff & Service': ['the service could have been a bit more attentive', 'staff interactions felt somewhat hurried', 'there is room for improvement in guest service'],
  'Food/Drink Quality': ['the food and drink quality did not quite meet expectations', 'the taste and preparation were a bit underwhelming', 'the quality could be elevated'],
  'Cleanliness': ['cleanliness could be improved in some areas', 'attention to detail with cleanliness was lacking', 'cleanliness did not meet the standard expected'],
  'Pricing & Value': ['the pricing felt a little high for what was offered', 'value for money could be better balanced', 'prices seemed somewhat steep relative to the experience'],
  'Order Accuracy': ['there was an issue with our order accuracy', 'our order had some mix-ups that needed addressing', 'greater care with order accuracy would help'],
  'Noise Level': ['it was a bit louder than comfortable', 'noise levels made it difficult to relax or converse', 'it was somewhat noisy during our visit'],
  'Other': ['there were a few operational details that could be refined', 'a few areas could use fine-tuning', 'certain details felt under-delivered'],
};

/**
 * Generates an authentic review draft based on rating, business type, selected topics, and customer notes.
 * @param {Object} params
 * @param {string} params.businessType - 'CAFE' | 'RESTAURANT' | 'HOTEL'
 * @param {string} params.businessName - Business name
 * @param {number} params.rating - 1 to 5
 * @param {string[]} params.selectedTopics - Array of topic names
 * @param {string} params.customerMessage - Optional written customer notes
 * @param {number} params.variationIndex - Counter for cycling phrasing on regenerate (0, 1, 2...)
 * @returns {string} Generated review draft
 */
export function generateReviewText({
  businessType = 'CAFE',
  businessName = 'this place',
  rating = 5,
  selectedTopics = [],
  customerMessage = '',
  variationIndex = 0,
}) {
  const isPositive = rating >= 4;
  const trimmedMessage = (customerMessage || '').trim();
  const v = Math.abs(variationIndex) % 3;

  if (isPositive) {
    return generatePositiveReview({
      businessType,
      businessName,
      rating,
      selectedTopics,
      customerMessage: trimmedMessage,
      variant: v,
    });
  } else {
    return generateConstructiveReview({
      businessType,
      businessName,
      rating,
      selectedTopics,
      customerMessage: trimmedMessage,
      variant: v,
    });
  }
}

function generatePositiveReview({ businessType, businessName, rating, selectedTopics, customerMessage, variant }) {
  const intros = [
    `Had a fantastic visit to ${businessName}!`,
    `Really enjoyed my experience at ${businessName}.`,
    `Always a pleasure visiting ${businessName}!`,
  ];

  const outro5 = [
    'I had a wonderful time and will definitely be returning.',
    'Highly recommended for anyone looking for quality and great care.',
    'Thanks to the team for an outstanding experience!',
  ];

  const outro4 = [
    'Overall a very good experience and I look forward to coming back.',
    'Solid experience overall and happy to recommend it.',
    'A great spot that I would gladly visit again.',
  ];

  const parts = [];
  parts.push(intros[variant]);

  // If customer supplied specific text, lead with or incorporate it naturally
  if (customerMessage) {
    parts.push(customerMessage.endsWith('.') ? customerMessage : `${customerMessage}.`);
  }

  // Incorporate selected topics
  if (selectedTopics.length > 0) {
    const topicPhrases = selectedTopics.map((topic) => {
      const phrases = POSITIVE_PHRASES[topic] || [topic.toLowerCase()];
      return phrases[variant % phrases.length];
    });

    if (topicPhrases.length === 1) {
      const singleSentences = [
        `In particular, ${topicPhrases[0]}.`,
        `Special shoutout because ${topicPhrases[0]}.`,
        `I especially appreciated that ${topicPhrases[0]}.`,
      ];
      parts.push(singleSentences[variant]);
    } else if (topicPhrases.length === 2) {
      parts.push(`Particularly, ${topicPhrases[0]}, and ${topicPhrases[1]}.`);
    } else {
      const head = topicPhrases.slice(0, -1).join(', ');
      const tail = topicPhrases[topicPhrases.length - 1];
      parts.push(`Among the highlights: ${head}, and ${tail}.`);
    }
  }

  parts.push(rating === 5 ? outro5[variant] : outro4[variant]);

  return parts.join(' ');
}

function generateConstructiveReview({ businessType, businessName, rating, selectedTopics, customerMessage, variant }) {
  const intros = [
    `My recent experience at ${businessName} was a bit disappointing.`,
    `Sharing some honest feedback regarding my recent visit to ${businessName}.`,
    `Unfortunately, my visit to ${businessName} was not quite what I was hoping for.`,
  ];

  const outros = [
    'I hope this feedback is helpful for making improvements moving forward.',
    'Sharing this constructively with the hope that the team can look into these points.',
    'With a few adjustments, the overall experience could be much better.',
  ];

  const parts = [];
  parts.push(intros[variant]);

  // Incorporate customer message if provided
  if (customerMessage) {
    parts.push(customerMessage.endsWith('.') ? customerMessage : `${customerMessage}.`);
  }

  // Incorporate selected constructive topics
  if (selectedTopics.length > 0) {
    const topicPhrases = selectedTopics.map((topic) => {
      const phrases = CONSTRUCTIVE_PHRASES[topic] || [topic.toLowerCase()];
      return phrases[variant % phrases.length];
    });

    if (topicPhrases.length === 1) {
      parts.push(`The main issue we noticed was that ${topicPhrases[0]}.`);
    } else if (topicPhrases.length === 2) {
      parts.push(`In particular, ${topicPhrases[0]}, and ${topicPhrases[1]}.`);
    } else {
      const head = topicPhrases.slice(0, -1).join(', ');
      const tail = topicPhrases[topicPhrases.length - 1];
      parts.push(`The areas that stood out were: ${head}, and ${tail}.`);
    }
  }

  parts.push(outros[variant]);

  return parts.join(' ');
}
