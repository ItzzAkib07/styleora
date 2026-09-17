import {
  UserCheck,
  Shapes,
  Palette,
  Layers,
  ShoppingBag,
  Sparkles,
  Footprints,
  Sparkle,
  Clock,
  BookOpen,
} from 'lucide-react';

/**
 * Detailed metadata for the 10 Authoritative Blueprint Inclusions
 */
export const BLUEPRINT_FEATURE_DETAILS = [
  {
    num: '01',
    title: 'Personal Style Assessment',
    tagline: 'Anchoring your visual identity in your real life',
    icon: UserCheck,
    desc: 'An in-depth evaluation of your aesthetic preferences, comfort boundaries, professional demands, and lifestyle priorities so your style direction feels authentically yours.',
  },
  {
    num: '02',
    title: 'Body & Proportion Analysis',
    tagline: 'Geometric balance tailored to your anatomy',
    icon: Shapes,
    desc: 'Skeletal line and torso-to-leg proportion calibration that determines optimal waist positioning, column dressing techniques, tailoring adjustments, and hemline lengths.',
  },
  {
    num: '03',
    title: 'Personal Colour Direction',
    tagline: 'Your personal chromatic resonance',
    icon: Palette,
    desc: 'Skin tone, eye pigment, and undertone discovery mapping your wardrobe into foundational neutrals, signature hues, seasonal accents, and evening shades.',
  },
  {
    num: '04',
    title: 'Signature Silhouettes & Fits',
    tagline: 'Cuts, necklines, and fabrics engineered for you',
    icon: Layers,
    desc: 'Exact guidance on neckline cuts, lapel breadth, sleeve designs, fabric rigidity, and textile drapes that optically flatter your natural bone structure.',
  },
  {
    num: '05',
    title: 'Personalised Shopping Guidance',
    tagline: 'Acquire with intention and stop wasting budget',
    icon: ShoppingBag,
    desc: 'Objective, independent brand curation matched to your budget, fabric quality inspection principles, and a disciplined rule-of-three buying framework.',
  },
  {
    num: '06',
    title: '20 Curated Outfit Ideas',
    tagline: 'Ready-to-wear formulas for every life context',
    icon: Sparkles,
    desc: '20 personalised outfit ideas spanning executive workwear, elevated smart-casual, relaxed weekend, evening dinner, and festive occasion ensembles.',
  },
  {
    num: '07',
    title: 'Accessories & Footwear Guidance',
    tagline: 'Finishing touches that pull each look together',
    icon: Footprints,
    desc: 'Handbag proportions, eyewear frames calibrated to facial geometry, jewelry scales, belt widths, and shoe styles that harmonize with your outfits.',
  },
  {
    num: '08',
    title: 'Hair & Makeup Direction',
    tagline: 'Harmonious optical framing',
    icon: Sparkle,
    desc: 'Facial framing hair direction, flattering parting lines, and everyday beauty shade matching that complements your skin undertones.',
  },
  {
    num: '09',
    title: '30-Minute 1:1 Consultation',
    tagline: 'Private stylist consultation via video call',
    icon: Clock,
    desc: 'A focused, private video consultation with your dedicated master stylist to review intake findings, discuss lifestyle priorities, and align on your direction.',
  },
  {
    num: '10',
    title: 'Personalised Digital Style Guide',
    tagline: 'Your permanent reference handbook',
    icon: BookOpen,
    desc: 'An ultra-high-definition interactive style handbook delivered to your device, ready to consult on your phone whenever you are shopping or getting dressed.',
  },
];

/**
 * The 7 Core Style Dimensions for the Blueprint
 */
export const BLUEPRINT_STYLE_DIMENSIONS = [
  {
    id: 'personal-style',
    title: 'Personal Style',
    subtitle: 'Authentic Self-Expression',
    desc: 'Establishing your distinct sartorial hallmark—moving past fleeting micro-trends to articulate a timeless personal aesthetic that commands respect.',
  },
  {
    id: 'body-proportion',
    title: 'Body & Proportion',
    subtitle: 'Anatomical Equilibrium',
    desc: 'Aligning garment architecture with individual skeletal lines, shoulder balance, and vertical proportions for effortless optical harmony.',
  },
  {
    id: 'colour-direction',
    title: 'Colour',
    subtitle: 'Chromatic Resonance',
    desc: 'Mapping your undertones against foundational neutrals and radiant signature accents so every piece makes your skin look energized.',
  },
  {
    id: 'silhouettes-fits',
    title: 'Silhouettes & Fits',
    subtitle: 'Tailored Precision',
    desc: 'Exact specifications for jacket drops, trouser rises, neckline shapes, and fabric weights that drape naturally on your figure.',
  },
  {
    id: 'shopping',
    title: 'Shopping',
    subtitle: 'Intentional Acquisition',
    desc: 'A disciplined framework to navigate brands, evaluate garment construction, and acquire pieces that harmonize with at least four existing items.',
  },
  {
    id: 'accessories',
    title: 'Accessories',
    subtitle: 'Tactile Polish',
    desc: 'Eyewear geometry, jewelry scaling, belt positioning, and footwear selection that complete and elevate your signature formulas.',
  },
  {
    id: 'beauty',
    title: 'Beauty',
    subtitle: 'Facial Framing & Palette',
    desc: 'Cohesive grooming and makeup guidance matching your skin undertones, haircut direction, and signature everyday look.',
  },
];

/**
 * Audience Archetypes / Situations
 */
export const BLUEPRINT_AUDIENCE_SITUATIONS = [
  {
    id: 'sit-1',
    quote: 'I don\'t know what suits me anymore.',
    context: 'Navigating life or body transitions with uncertainty.',
    solution: 'We conduct objective proportion and color analyses, giving you unmistakable rules for what flatters your anatomy today.',
  },
  {
    id: 'sit-2',
    quote: 'I keep buying pieces but don\'t know how to style them.',
    context: 'A crowded wardrobe of disconnected items.',
    solution: 'We deliver 20 complete, fully accessorized outfit formulas that turn your clothes into functional daily combinations.',
  },
  {
    id: 'sit-3',
    quote: 'I want to understand my true colours.',
    context: 'Feeling washed out by trial-and-error clothing shades.',
    solution: 'You receive a bespoke chromatic swatch palette categorized into foundational neutrals, signature tones, and evening accents.',
  },
  {
    id: 'sit-4',
    quote: 'I want outfits that actually work for my lifestyle.',
    context: 'Dressing for high-stakes hybrid work, parenting, or social commitments.',
    solution: 'Every formula is anchored in your actual calendar demands—combining executive polish with genuine physical comfort.',
  },
  {
    id: 'sit-5',
    quote: 'I want a clearer, more distinctive personal style.',
    context: 'Tired of blending into generic trends and algorithm feeds.',
    solution: 'We define your sartorial signature—the hallmarks, cuts, and textures that make your presence instantly recognizable.',
  },
  {
    id: 'sit-6',
    quote: 'I want to shop with more intention.',
    context: 'Stopping the cycle of impulse buys and closet regret.',
    solution: 'Your digital guide includes curated brand lists, fabric standards, and a 24-hour decision rule to protect your investment.',
  },
];
