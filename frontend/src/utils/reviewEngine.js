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
 * Generate authentic, category-aware review text based on rating, business category, selected topics, and customer message.
 * @param {Object} params
 * @param {string} params.businessCategory - One of the 11 supported categories
 * @param {string} params.businessType - Alias for businessCategory
 * @param {string} params.businessName - Business name
 * @param {number} params.rating - 1 to 5
 * @param {string[]} params.selectedTopics - Array of topic names
 * @param {string} params.customerMessage - Optional written customer notes
 * @param {number} params.variationIndex - Counter for cycling phrasing on regenerate
 * @returns {string} Generated review draft
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

  if (isPositive) {
    return generatePositiveReview({
      categoryConfig,
      businessName,
      rating,
      selectedTopics,
      customerMessage: trimmedMessage,
      variant: v,
    });
  } else {
    return generateConstructiveReview({
      categoryConfig,
      businessName,
      rating,
      selectedTopics,
      customerMessage: trimmedMessage,
      variant: v,
    });
  }
}

function generatePositiveReview({ categoryConfig, businessName, rating, selectedTopics, customerMessage, variant }) {
  const intros = [
    `Had a great experience with ${businessName}!`,
    `Really pleased with my visit to ${businessName}.`,
    `Always a pleasure visiting ${businessName}!`,
  ];

  const outro5 = [
    'I had a wonderful experience and will definitely be coming back.',
    'Highly recommended for anyone looking for quality service and great care.',
    'Thanks to the entire team for an outstanding experience!',
  ];

  const outro4 = [
    'Overall a very good experience and I look forward to returning.',
    'Solid service overall and happy to recommend them.',
    'A great local business that I would gladly visit again.',
  ];

  const parts = [];
  parts.push(intros[variant]);

  // If customer provided a message, lead with or incorporate it naturally
  if (customerMessage) {
    parts.push(customerMessage.endsWith('.') ? customerMessage : `${customerMessage}.`);
  }

  // Incorporate selected positive topics
  if (selectedTopics.length > 0) {
    const topicPhrases = selectedTopics.map((topic) => {
      const phrases = POSITIVE_TOPIC_PHRASES[topic] || [`${topic.toLowerCase()} was great`];
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

function generateConstructiveReview({ categoryConfig, businessName, rating, selectedTopics, customerMessage, variant }) {
  const intros = [
    `Sharing some honest feedback regarding my recent experience at ${businessName}.`,
    `Unfortunately, my recent visit to ${businessName} was not quite what I was hoping for.`,
    `My recent experience at ${businessName} was a bit disappointing.`,
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
      const phrases = CONSTRUCTIVE_TOPIC_PHRASES[topic] || [`${topic.toLowerCase()} needs attention`];
      return phrases[variant % phrases.length];
    });

    if (topicPhrases.length === 1) {
      parts.push(`The main area noticed was that ${topicPhrases[0]}.`);
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

export const generateDeterministicReview = generateReviewText;
export default generateReviewText;
