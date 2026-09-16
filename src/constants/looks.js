import defaultImg from '@/assets/images/Default-look.png';
import casualImg from '@/assets/images/Casual-look.png';
import corporateImg from '@/assets/images/Corporate-look.png';
import ethnicImg from '@/assets/images/Ethnic-look.png';
import traditionalImg from '@/assets/images/Traditional-look.png';
import eveningImg from '@/assets/images/Evening-look.png';
import travelImg from '@/assets/images/Travel-look.png';
import partyImg from '@/assets/images/Party-look.png';

/**
 * STYLEORA LOOK EDIT — Editorial Look Definitions
 * "One Woman. Many Expressions."
 *
 * Architecture note: Every look is structured with `mediaType` ('image' | 'video')
 * allowing visual sources to be upgraded to video in the future without refactoring.
 */
export const LOOKS = [
  {
    id: 'signature',
    num: '01',
    label: 'Signature',
    tag: 'STYLEORA FOUNDATION',
    title: 'STYLEORA Signature',
    subtitle: 'Timeless Simplicity & Architectural Poise',
    description:
      'The foundational aesthetic. Clean vertical drape, unembellished tailoring, and monochromatic harmony calibrated to accentuate innate bone structure and commanding presence.',
    dimension: 'Dimension I // Visage & Proportion',
    silhouette: 'Sculpted Minimalist Silhouette',
    swatches: ['#0B0B0C', '#E6D7C3', '#8E8D8A'],
    paletteName: 'Obsidian & Champagne Mineral',
    mediaType: 'image',
    src: defaultImg,
    alt: 'STYLEORA Signature Look — Timeless Minimalist Luxury',
  },
  {
    id: 'casual',
    num: '02',
    label: 'Casual',
    tag: 'RELAXED REFINEMENT',
    title: 'Effortless Everyday',
    subtitle: 'Fluid Drape & Quiet Elegance',
    description:
      'Casual dressing stripped of informality. Relaxed cashmere knits, fluid linen-silk trousers, and deconstructed tailoring engineered for off-duty ease with uncompromised sophistication.',
    dimension: 'Dimension II // Silhouette Drape',
    silhouette: 'Deconstructed Fluid Line',
    swatches: ['#F7F5F0', '#C5A880', '#5E5D5A'],
    paletteName: 'Warm Ivory & Raw Camel',
    mediaType: 'image',
    src: casualImg,
    alt: 'STYLEORA Casual Look — Effortless Everyday Style',
  },
  {
    id: 'professional',
    num: '03',
    label: 'Professional',
    tag: 'EXECUTIVE ARCHITECTURE',
    title: 'Executive Refined',
    subtitle: 'High-Stakes Authority & Sharp Discipline',
    description:
      'Precision sartorial armor designed for the modern boardroom. Clean shoulder geometry, sharp peak lapels, and high-twist worsted wools projecting unforced authority and executive presence.',
    dimension: 'Dimension VI // High-Stakes Stratagem',
    silhouette: 'Structured Sharp Shoulders',
    swatches: ['#161618', '#242428', '#E6D7C3'],
    paletteName: 'Charcoal Slate & Platinum Accent',
    mediaType: 'image',
    src: corporateImg,
    alt: 'STYLEORA Professional Look — Executive Tailoring and Authority',
  },
  {
    id: 'ethnic',
    num: '04',
    label: 'Ethnic',
    tag: 'CONTEMPORARY HERITAGE',
    title: 'Artisan Contemporary',
    subtitle: 'Textural Richness & Modern Drape',
    description:
      'Honoring indigenous weaving techniques through a modern architectural lens. Hand-loomed silks, fluid pleats, and subtle metallic zari threads creating depth and textural resonance.',
    dimension: 'Dimension III // Bespoke Chromatic Harmony',
    silhouette: 'Artisanal Continuous Pleats',
    swatches: ['#2A1D1A', '#C5A880', '#D49A6A'],
    paletteName: 'Earthy Terra & Burnished Gold',
    mediaType: 'image',
    src: ethnicImg,
    alt: 'STYLEORA Ethnic Look — Contemporary Heritage and Woven Craft',
  },
  {
    id: 'traditional',
    num: '05',
    label: 'Traditional',
    tag: 'CEREMONIAL MAJESTY',
    title: 'Regal Ceremonial',
    subtitle: 'Heritage Craft & Unmistakable Splendor',
    description:
      'Bespoke ceremonial attire curated for pivotal celebratory milestones. Deep jewel-tone silks, bespoke brocade architecture, and regal drape calibrated for heirloom permanence.',
    dimension: 'Dimension IV // The Sartorial Hallmark',
    silhouette: 'Regal Volumetric Drape',
    swatches: ['#3A1215', '#C5A880', '#F3ECE1'],
    paletteName: 'Deep Burgundy & Antique Zari',
    mediaType: 'image',
    src: traditionalImg,
    alt: 'STYLEORA Traditional Look — Regal Ceremonial Splendor',
  },
  {
    id: 'evening',
    num: '06',
    label: 'Evening',
    tag: 'NOCTURNE GLAMOUR',
    title: 'Nocturne Black-Tie',
    subtitle: 'Sensual Chiaroscuro & Flowing Satin',
    description:
      'Gala and evening attire mastered through light absorption and reflection. Floor-grazing bias-cut crepe, plunging architectural lines, and luminous satin catching ambient gala illumination.',
    dimension: 'Dimension VI // Contextual High-Stakes',
    silhouette: 'Bias-Cut Elongated Column',
    swatches: ['#0B0B0C', '#1C1C1F', '#E6D7C3'],
    paletteName: 'Midnight Noir & Liquid Champagne',
    mediaType: 'image',
    src: eveningImg,
    alt: 'STYLEORA Evening Look — Nocturne Black-Tie Glamour',
  },
  {
    id: 'resort',
    num: '07',
    label: 'Travel',
    tag: 'TRANSNATIONAL VOYAGE',
    title: 'Resort & Transnational',
    subtitle: 'Breathable Ease for Global Horizons',
    description:
      'Modular travel curation engineered for effortless packing across climate transitions. Breathable mulberry silks, airy poplin weaves, and interchangeable earth-tone coordinates.',
    dimension: 'Dimension V // 30-Piece Modular Capsule',
    silhouette: 'Relaxed Kimono & Wide Trouser',
    swatches: ['#8E8D8A', '#E6D7C3', '#6B8E70'],
    paletteName: 'Olive Mineral & Sun-Bleached Sand',
    mediaType: 'image',
    src: travelImg,
    alt: 'STYLEORA Resort & Travel Look — Transnational Luxury',
  },
  {
    id: 'soiree',
    num: '08',
    label: 'Soirée',
    tag: 'CELEBRATION CHIC',
    title: 'Celebration Soirée',
    subtitle: 'Vibrant Magnetism & Radiant Texture',
    description:
      'Intimate cocktail and celebration styling combining playful luminescence with tailored poise. Shimmering micro-textures and sculpted waistlines designed to captivate in warm ambient light.',
    dimension: 'Dimension IV // Sartorial Presence',
    silhouette: 'Sculpted Asymmetric Hem',
    swatches: ['#1C1C1F', '#D49A6A', '#F7F5F0'],
    paletteName: 'Tuscan Amber & Polished Onyx',
    mediaType: 'image',
    src: partyImg,
    alt: 'STYLEORA Soirée Look — Celebration Chic and Radiance',
  },
];
