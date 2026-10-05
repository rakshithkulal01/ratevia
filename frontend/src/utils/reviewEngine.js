import { getCategoryConfig } from '../config/businessCategories.js';

/**
 * Pure, deterministic, client-side review generation engine.
 * Tailored for all 11 supported local business categories.
 * Produces authentic review drafts incorporating category context, customer-selected topics,
 * and optional customer notes without fabricating facts.
 */

// Positive phrase mapping for topic incorporation
const POSITIVE_TOPIC_PHRASES = {
  // Food & Beverage / Hospitality
  'Food Quality': ['the food quality was exceptional', 'the food was prepared with great care', 'outstanding food quality'],
  'Taste': ['the flavors and taste were spot on', 'everything tasted delicious', 'the taste was fantastic'],
  'Freshness': ['everything tasted noticeably fresh', 'super fresh ingredients and items', 'impressive freshness'],
  'Menu Variety': ['great variety on the menu', 'a wonderful selection of options', 'plenty of diverse choices'],
  'Room Quality': ['the room was clean, comfortable, and well-maintained', 'the room was in excellent condition', 'very pleasant and well-kept room'],
  'Comfort': ['very comfortable and relaxing', 'a genuinely comfortable setup', 'great comfort throughout'],
  'Location': ['the location was convenient and easy to reach', 'great and accessible location', 'ideally situated'],
  'Facilities': ['the facilities were top-notch and clean', 'well-equipped facilities', 'great amenities and facilities'],
  'Check-in Experience': ['check-in was smooth and welcoming', 'seamless and swift check-in', 'effortless arrival process'],

  // Staff & Service across industries
  'Staff Friendliness': ['the staff was warm, welcoming, and friendly', 'very friendly team members', 'staff greeted us with genuine smiles'],
  'Staff Service': ['the staff provided attentive and polite service', 'great customer care from the staff', 'the staff was helpful and accommodating'],
  'Staff Assistance': ['staff was right there whenever assistance was needed', 'helpful and attentive staff', 'received great assistance from the team'],
  'Staff Knowledge': ['staff was clearly knowledgeable and helpful', 'great guidance from knowledgeable team members', 'impressive product knowledge'],
  'Staff Professionalism': ['the team demonstrated high professionalism', 'very courteous and professional staff', 'expert and professional conduct'],
  'Professionalism': ['the professionalism of the team stood out', 'handled everything with great professionalism', 'thoroughly professional service'],
  'Customer Service': ['customer service was top tier', 'prompt and attentive customer service', 'wonderful customer care'],
  'Trainers': ['the trainers were encouraging and knowledgeable', 'great guidance from the trainers', 'trainers provided helpful and motivating direction'],
  'Staff': ['the on-site staff was supportive and welcoming', 'friendly and helpful staff on hand', 'great team on duty'],

  // Retail & Products (Clothing, Electronics, Retail Shop, Bakery)
  'Product Variety': ['impressive variety of products', 'a broad and diverse selection', 'great range of options available'],
  'Product Quality': ['the product quality was top-tier', 'durable and high-quality products', 'consistently high quality'],
  'Availability': ['good availability of stock and items', 'found exactly what was needed in stock', 'items were well-stocked'],
  'Product Availability': ['all requested items were readily available', 'well-stocked inventory', 'great in-stock availability'],
  'Store Experience': ['the store was pleasant and easy to navigate', 'an enjoyable in-store shopping experience', 'a very welcoming shopping environment'],
  'Store Cleanliness': ['the store was remarkably tidy and organized', 'clean and organized aisles', 'spotless retail environment'],

  // Auto / Repair & Service
  'Service Quality': ['the quality of service was excellent', 'thorough and high standard of service', 'top-quality service provided'],
  'Repair Quality': ['the repair was executed flawlessly', 'high-grade repair work done right', 'solid, reliable repair quality'],
  'Pricing Transparency': ['clear and upfront pricing with no surprises', 'very transparent about costs and pricing', 'honest and clear quote'],
  'Communication': ['clear and proactive communication throughout', 'kept us well-informed at every step', 'prompt and transparent communication'],
  'Service Speed': ['the service was quick and efficient', 'handled with impressive speed', 'fast and punctual service'],

  // Gym & Fitness
  'Equipment Quality': ['the equipment was modern and well-maintained', 'top-notch gym equipment in great condition', 'high-quality workout machines'],
  'Atmosphere': ['the atmosphere was motivating and upbeat', 'a really great and energetic vibe', 'inspiring atmosphere'],
  'Crowd Levels': ['crowd levels were manageable and comfortable', 'not overly crowded, easy to work out', 'comfortable space to train without overcrowding'],

  // General & Environment
  'Ambience': ['the ambience was pleasant and inviting', 'great ambience to spend time in', 'a wonderful, welcoming atmosphere'],
  'Cleanliness': ['everything was kept clean and hygienic', 'spotless hygiene and cleanliness', 'impeccable cleanliness throughout'],
  'Waiting Time': ['minimal wait time before being attended to', 'prompt attention with very little waiting', 'hardly any waiting time'],
  'Value for Money': ['solid value for money', 'reasonably priced for the quality delivered', 'great value overall'],
  'Product/Service Quality': ['the product and service quality was top notch', 'high-quality delivery all around', 'very dependable quality'],
  'Overall Experience': ['an all-around wonderful experience', 'a thoroughly positive overall experience', 'great experience from start to finish'],
};

// Constructive phrase mapping for 1-3 star feedback
const CONSTRUCTIVE_TOPIC_PHRASES = {
  // Food & Beverage / Hospitality
  'Taste': ['the taste fell short of expectations', 'the flavors could use refinement', 'the taste was underwhelming'],
  'Food Quality': ['the food quality did not quite meet expectations', 'preparation and quality could be improved', 'the food quality was inconsistent'],
  'Freshness': ['freshness could be noticeably improved', 'items did not feel as fresh as expected', 'freshness needs better attention'],
  'Variety': ['the variety was fairly limited', 'more options and variety would be welcome', 'selection felt somewhat narrow'],
  'Room Quality': ['the room condition needs maintenance and updating', 'room amenities fell below expectations', 'the room quality was lacking'],
  'Check-in/Check-out': ['the check-in or check-out process had delays', 'front desk arrival was disorganized', 'check-in took longer than necessary'],
  'Location': ['access and parking in the area were somewhat challenging', 'location access was inconvenient', 'the area was difficult to navigate'],

  // Staff & Service
  'Staff Service': ['staff service could be more attentive', 'staff interactions felt hurried', 'staff attention and courtesy need improvement'],
  'Staff Assistance': ['it was difficult to find staff assistance when needed', 'assistance was slow in coming', 'staff availability could be better'],
  'Product Knowledge': ['staff could be better informed about product details', 'product knowledge seemed limited', 'staff needed more training on items'],
  'Communication': ['communication could have been clearer', 'there was a lack of proactive communication', 'updates were not communicated clearly'],
  'Transparency': ['greater transparency would help build trust', 'pricing details were not clearly explained upfront', 'transparency could be improved'],
  'Trainers': ['trainer guidance was scarce or lacking', 'trainers could be more engaged and supportive', 'trainer attention was minimal'],
  'Staff': ['staff was not very attentive during our visit', 'staff presence was lacking', 'staff service fell short'],

  // Operations, Timing, Pricing
  'Waiting Time': ['the waiting time was longer than anticipated', 'there was a noticeable wait before being served', 'waiting time took longer than it should have'],
  'Service Time': ['the turnaround time for service was delayed', 'service took quite a bit longer than quoted', 'completion took longer than expected'],
  'Service Speed': ['service was slow and delayed', 'speed of service could be improved', 'service took quite some time'],
  'Pricing': ['pricing felt somewhat high for the experience provided', 'prices seemed steep for what was delivered', 'pricing could be more balanced'],
  'Service': ['the service experience was not as smooth as hoped', 'service quality could definitely be improved', 'the service fell below expectations'],
  'Repair Quality': ['the repair did not fully resolve the issue', 'the repair needed follow-up attention', 'the repair quality fell short of expectations'],
  'Equipment': ['some equipment was out of order or needed upkeep', 'equipment was worn or unavailable', 'several machines needed maintenance'],
  'Maintenance': ['maintenance and upkeep need more attention', 'facilities showed signs of deferred maintenance', 'better ongoing maintenance is needed'],
  'Crowd Levels': ['it was overly crowded during the visit', 'crowd levels made it difficult to use facilities', 'crowding made the visit less pleasant'],
  'Facilities': ['facilities could use better upkeep and maintenance', 'certain facilities did not work properly', 'facilities were lacking in upkeep'],
  'Cleanliness': ['cleanliness and hygiene could be improved', 'cleanliness standards fell below expectations', 'areas were not as clean as they should be'],
  'Ambience': ['the ambience was not very comfortable', 'noise or atmosphere detracted from the experience', 'the setting was not very welcoming'],
  'Product Availability': ['several desired items were out of stock', 'product availability was limited', 'inventory availability was lacking'],
  'Product Variety': ['product variety and selection were limited', 'a wider selection would be beneficial', 'product choices were quite narrow'],
  'Product Quality': ['the product quality did not meet expectations', 'products felt underwhelming in quality', 'quality was below what was expected'],
  'Store Experience': ['the store environment felt cluttered or disorganized', 'store experience was not very smooth', 'store navigation could be improved'],
  'Customer Service': ['customer service response could be improved', 'customer care was lacking in attentiveness', 'customer service did not meet expectations'],
  'Product/Service Quality': ['the quality of service or product fell short', 'quality could be considerably better', 'quality did not match expectations'],
  'Overall Experience': ['the overall experience was underwhelming', 'the visit did not meet expectations', 'there is noticeable room for improvement overall'],
};

/**
 * Safely enforces a hard maximum length limit (default 200 characters)
 * without awkwardly chopping words or sentences when possible.
 *
 * @param {string} text - Review text
 * @param {number} limit - Maximum allowed character length (default 200)
 * @returns {string} Safe review text guaranteed to be <= limit characters
 */
export function safeTrimToLimit(text, limit = 200) {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (trimmed.length <= limit) return trimmed;

  // Initial slice to limit
  let sub = trimmed.slice(0, limit);
  // Clean up any broken surrogate pair at the boundary
  if (/[\uD800-\uDBFF]$/.test(sub)) {
    sub = sub.slice(0, -1);
  }

  // 1. Look for last complete sentence (. ! ?) within limit
  const sentenceMatch = sub.match(/.*[.!?](?=\s|$)/);
  if (sentenceMatch && sentenceMatch[0].length >= 30) {
    return sentenceMatch[0].trim();
  }

  // 2. If no complete sentence >= 30 chars, cut cleanly at last word boundary
  const lastSpace = sub.lastIndexOf(' ');
  if (lastSpace > 20) {
    const cleanWord = sub.slice(0, lastSpace).replace(/[,;:\-\s]+$/, '');
    const withPeriod = `${cleanWord}.`;
    if (withPeriod.length <= limit) {
      return withPeriod;
    }
    return cleanWord.slice(0, limit);
  }

  // 3. Absolute fallback: hard slice at limit
  return sub.slice(0, limit);
}

/**
 * Generate authentic, category-aware review text based on rating, business category, selected topics, and customer message.
 * Strictly guarantees that returned review text never exceeds 200 characters.
 *
 * @param {Object} params
 * @param {string} params.businessCategory - One of the 11 supported categories
 * @param {string} params.businessType - Alias for businessCategory
 * @param {string} params.businessName - Business name
 * @param {number} params.rating - 1 to 5
 * @param {string[]} params.selectedTopics - Array of topic names
 * @param {string} params.customerMessage - Optional written customer notes
 * @param {number} params.variationIndex - Counter for cycling phrasing on regenerate
 * @returns {string} Generated review draft (<= 200 characters)
 */
export function generateReviewText({
  businessCategory,
  businessType,
  businessName = 'this business',
  rating = 5,
  selectedTopics = [],
  customerMessage = '',
  variationIndex = 0,
}) {
  const categoryKey = businessCategory || businessType || 'OTHER';
  const categoryConfig = getCategoryConfig(categoryKey);
  const isPositive = rating >= 4;
  const trimmedMessage = (customerMessage || '').trim();
  const v = Math.abs(variationIndex) % 3;

  const rawReview = isPositive
    ? generatePositiveReview({
        categoryConfig,
        businessName,
        rating,
        selectedTopics,
        customerMessage: trimmedMessage,
        variant: v,
      })
    : generateConstructiveReview({
        categoryConfig,
        businessName,
        rating,
        selectedTopics,
        customerMessage: trimmedMessage,
        variant: v,
      });

  return safeTrimToLimit(rawReview, 200);
}

function generatePositiveReview({ categoryConfig, businessName, rating, selectedTopics, customerMessage, variant }) {
  const intros = [
    `Had a great experience with ${businessName}!`,
    `Really pleased with my visit to ${businessName}.`,
    `Always a pleasure visiting ${businessName}!`,
  ];

  const outro5 = [
    'Will definitely be coming back!',
    'Highly recommended!',
    'Thanks to the team for great service!',
  ];

  const outro4 = [
    'Solid experience overall, happy to return.',
    'Good service, glad to recommend them.',
    'A great local spot I would visit again.',
  ];

  const intro = intros[variant];
  const outro = rating === 5 ? outro5[variant] : outro4[variant];
  const userNote = customerMessage
    ? (customerMessage.endsWith('.') || customerMessage.endsWith('!') || customerMessage.endsWith('?')
        ? customerMessage
        : `${customerMessage}.`)
    : '';

  let topicSentence = '';
  if (selectedTopics.length > 0) {
    const topicPhrases = selectedTopics.map((topic) => {
      const phrases = POSITIVE_TOPIC_PHRASES[topic] || [`${topic.toLowerCase()} was great`];
      return phrases[variant % phrases.length];
    });

    if (userNote) {
      if (selectedTopics.length === 1) {
        const singlePrefixes = ['In particular,', 'Special shoutout:', 'Appreciated that'];
        topicSentence = `${singlePrefixes[variant]} ${topicPhrases[0]}.`;
      } else {
        const topicList = selectedTopics.slice(0, 3).map((t) => t.toLowerCase()).join(', ');
        topicSentence = `Loved the ${topicList}.`;
      }
    } else {
      if (topicPhrases.length === 1) {
        const singleSentences = [
          `In particular, ${topicPhrases[0]}.`,
          `Special shoutout because ${topicPhrases[0]}.`,
          `I especially appreciated that ${topicPhrases[0]}.`,
        ];
        topicSentence = singleSentences[variant];
      } else if (topicPhrases.length === 2) {
        topicSentence = `Particularly, ${topicPhrases[0]}, and ${topicPhrases[1]}.`;
      } else {
        topicSentence = `Highlights included ${topicPhrases[0]}, and ${topicPhrases[1]}.`;
      }
    }
  }

  // Priority-based sentence candidate assembly to stay naturally <= 200 characters
  const candidates = [];
  if (userNote && topicSentence) {
    candidates.push([intro, userNote, topicSentence, outro]);
    candidates.push([intro, userNote, outro]);
    candidates.push([intro, userNote, topicSentence]);
    candidates.push([intro, userNote]);
    candidates.push([userNote, outro]);
    candidates.push([userNote]);
  } else if (userNote) {
    candidates.push([intro, userNote, outro]);
    candidates.push([intro, userNote]);
    candidates.push([userNote, outro]);
    candidates.push([userNote]);
  } else if (topicSentence) {
    candidates.push([intro, topicSentence, outro]);
    candidates.push([intro, topicSentence]);
    candidates.push([intro, outro]);
    candidates.push([intro]);
  } else {
    candidates.push([intro, outro]);
    candidates.push([intro]);
  }

  for (const cand of candidates) {
    const text = cand.filter(Boolean).join(' ').trim();
    if (text.length <= 200) {
      return text;
    }
  }

  const defaultText = candidates[0].filter(Boolean).join(' ').trim();
  return safeTrimToLimit(defaultText, 200);
}

function generateConstructiveReview({ categoryConfig, businessName, rating, selectedTopics, customerMessage, variant }) {
  const intros = [
    `Sharing honest feedback for ${businessName}.`,
    `My recent visit to ${businessName} fell short.`,
    `Disappointed with my visit to ${businessName}.`,
  ];

  const outros = [
    'Hope this helps the team improve.',
    'Sharing this to help future visits.',
    'With a few adjustments, it could be much better.',
  ];

  const intro = intros[variant];
  const outro = outros[variant];
  const userNote = customerMessage
    ? (customerMessage.endsWith('.') || customerMessage.endsWith('!') || customerMessage.endsWith('?')
        ? customerMessage
        : `${customerMessage}.`)
    : '';

  let topicSentence = '';
  if (selectedTopics.length > 0) {
    const topicPhrases = selectedTopics.map((topic) => {
      const phrases = CONSTRUCTIVE_TOPIC_PHRASES[topic] || [`${topic.toLowerCase()} needs attention`];
      return phrases[variant % phrases.length];
    });

    if (userNote) {
      if (selectedTopics.length === 1) {
        topicSentence = `Specifically, ${topicPhrases[0]}.`;
      } else {
        const topicList = selectedTopics.slice(0, 3).map((t) => t.toLowerCase()).join(', ');
        topicSentence = `Areas noticed: ${topicList}.`;
      }
    } else {
      if (topicPhrases.length === 1) {
        topicSentence = `The main area noticed was that ${topicPhrases[0]}.`;
      } else if (topicPhrases.length === 2) {
        topicSentence = `In particular, ${topicPhrases[0]}, and ${topicPhrases[1]}.`;
      } else {
        topicSentence = `Areas that stood out were: ${topicPhrases[0]}, and ${topicPhrases[1]}.`;
      }
    }
  }

  // Priority-based sentence candidate assembly to stay naturally <= 200 characters
  const candidates = [];
  if (userNote && topicSentence) {
    candidates.push([intro, userNote, topicSentence, outro]);
    candidates.push([intro, userNote, outro]);
    candidates.push([intro, userNote, topicSentence]);
    candidates.push([intro, userNote]);
    candidates.push([userNote, outro]);
    candidates.push([userNote]);
  } else if (userNote) {
    candidates.push([intro, userNote, outro]);
    candidates.push([intro, userNote]);
    candidates.push([userNote, outro]);
    candidates.push([userNote]);
  } else if (topicSentence) {
    candidates.push([intro, topicSentence, outro]);
    candidates.push([intro, topicSentence]);
    candidates.push([intro, outro]);
    candidates.push([intro]);
  } else {
    candidates.push([intro, outro]);
    candidates.push([intro]);
  }

  for (const cand of candidates) {
    const text = cand.filter(Boolean).join(' ').trim();
    if (text.length <= 200) {
      return text;
    }
  }

  const defaultText = candidates[0].filter(Boolean).join(' ').trim();
  return safeTrimToLimit(defaultText, 200);
}

export const generateDeterministicReview = generateReviewText;
export default generateReviewText;
