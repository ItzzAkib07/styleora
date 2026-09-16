/**
 * STYLEORA Commercial Packages & Add-on Services
 * 
 * Commercial Architecture:
 * - One Core Experience: STYLEORA Signature Blueprint (₹2,799 INR)
 * - Three Optional Add-ons:
 *   1. The Wardrobe Edit (₹1,499 INR)
 *   2. The Shopping Edit (₹499 INR)
 *   3. The Beauty Atelier (₹1,499 INR)
 */

export const CORE_PACKAGE = {
  id: 'styleora_signature_blueprint',
  name: 'STYLEORA Signature Blueprint',
  tier: 'SIGNATURE ATELIER EXPERIENCE',
  price: '₹2,799',
  amountInr: 2799,
  duration: '30-Minute Private Stylist Consultation + Personalised Blueprint',
  popular: true,
  badge: 'Core Experience',
  desc: 'Your personalised style identity, distilled into one considered blueprint — created around your features, proportions, colouring, lifestyle and the way you want to show up.',
  features: [
    '30-Minute Private 1:1 Virtual Stylist Consultation',
    'Personalised Style Blueprint & Strategic Direction',
    'Bespoke Colour Palette (Neutrals, Signatures, Accents & Evening)',
    'Facial Framing, Neckline, Eyewear & Hair Guidance',
    'Proportion Balancing, Body Shape & Silhouette Strategy',
    'Personalised Outfit Curation (Professional, Casual, Ethnic & Occasion)',
    'Wardrobe Foundations, Essential Garments & Layering Direction',
    'Personalised Makeup, Grooming & Fragrance Finishing Notes',
  ],
};

export const ADD_ONS = [
  {
    id: 'wardrobe_edit',
    name: 'The Wardrobe Edit',
    tagline: 'Review. Refine. Release. Rebuild.',
    price: '₹1,499',
    amountInr: 1499,
    duration: '30-Minute Private Stylist Session',
    desc: 'An intentional edit of what you already own — keep what works, refine what can be improved, and make space for what your wardrobe actually needs.',
    coreOutcome: 'KEEP • ALTER • LET GO • REPLACE',
    features: [
      'Piece-by-piece closet evaluation with your stylist',
      'Keep, Alter, Let Go, Replace decision matrix',
      'Identification of missing wardrobe foundation gaps',
      'Tailoring, styling differently & garment alteration guidance',
    ],
  },
  {
    id: 'shopping_edit',
    name: 'The Shopping Edit',
    tagline: 'Shop with intention.',
    price: '₹499',
    amountInr: 499,
    duration: '30-Minute Private Stylist Session',
    desc: 'Shop with intention. Get a personalised shopping guide matched to your style, body, lifestyle and budget — so every purchase has a purpose.',
    coreOutcome: 'INTENTIONAL ACQUISITION INTELLIGENCE',
    features: [
      'Fabric, material & garment-quality inspection framework',
      'Label reading & investment piece quality checks',
      'Curated brand direction tailored to your budget',
      'Rule of Three & 24-hour purchase decision discipline',
    ],
  },
  {
    id: 'beauty_atelier',
    name: 'The Beauty Atelier',
    tagline: 'Your beauty, thoughtfully curated.',
    price: '₹1,499',
    amountInr: 1499,
    duration: '30-Minute Private 1:1 Beauty Consultation',
    desc: 'A private beauty consultation to help you understand the makeup, brands and products that work for your features, colouring, preferences and budget.',
    coreOutcome: 'CURATED BEAUTY & PRODUCT DIRECTION',
    features: [
      'Private 1:1 virtual consultation with beauty artist',
      'Bespoke everyday & evening makeup direction',
      'Tailored shade matching for base, blush & lip colours',
      'Curated high-low brands & budget-friendly alternatives',
    ],
    notice: 'Need makeup for an upcoming event? If you would like to work with the artist for an event, wedding or occasion, additional makeup services can be booked separately.',
  },
];

export const CONSULTATION_PACKAGES = [CORE_PACKAGE];

export const getPackageById = (id) =>
  CONSULTATION_PACKAGES.find((pkg) => pkg.id === id) || CORE_PACKAGE;

export const getAddOnById = (id) =>
  ADD_ONS.find((addon) => addon.id === id) || null;
