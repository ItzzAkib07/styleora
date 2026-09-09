/**
 * STYLEORA Luxury Design System Tokens
 * Digital Personal Style Atelier
 */

export const tokens = {
  colors: {
    // Primary Surfaces & Backgrounds
    obsidian: '#0B0B0C',
    charcoal: '#161618',
    surfaceSubtle: '#1C1C1F',
    surfaceElevated: '#242428',

    // Text & Foreground
    warmIvory: '#F7F5F0',
    ivoryMuted: 'rgba(247, 245, 240, 0.72)',
    stone: '#8E8D8A',
    stoneDark: '#5E5D5A',

    // Accents (Subtle Luxury)
    champagne: '#E6D7C3',
    champagneLight: '#F3ECE1',
    mutedGold: '#C5A880',
    goldSubtle: 'rgba(197, 168, 128, 0.15)',

    // State Colors (Refined, not neon)
    success: '#6B8E70',
    error: '#B85D5D',
    warning: '#D49A6A',
    info: '#7E919F',

    // Borders & Dividers
    borderSubtle: 'rgba(230, 215, 195, 0.12)',
    borderMedium: 'rgba(230, 215, 195, 0.22)',
    borderStrong: 'rgba(197, 168, 128, 0.35)',
  },

  fonts: {
    serif: "'Cormorant Garamond', 'Cinzel', Georgia, serif",
    sans: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  // Responsive fluid typography with clamp()
  typography: {
    display1: 'clamp(2.75rem, 6vw + 1rem, 5.5rem)',
    display2: 'clamp(2.25rem, 4.5vw + 0.75rem, 4.25rem)',
    h1: 'clamp(1.85rem, 3.2vw + 0.5rem, 3.25rem)',
    h2: 'clamp(1.5rem, 2.4vw + 0.4rem, 2.5rem)',
    h3: 'clamp(1.25rem, 1.8vw + 0.3rem, 1.85rem)',
    bodyLarge: 'clamp(1.05rem, 0.8vw + 0.8rem, 1.25rem)',
    bodyMedium: 'clamp(0.95rem, 0.4vw + 0.85rem, 1.05rem)',
    bodySmall: 'clamp(0.825rem, 0.3vw + 0.75rem, 0.9rem)',
    caption: '0.75rem',
    overline: '0.7rem',
  },

  letterSpacing: {
    editorialWide: '0.15em',
    editorialUltra: '0.25em',
    normal: '0em',
    tight: '-0.02em',
  },

  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4.5rem', // 72px
    '4xl': '6rem',   // 96px
    '5xl': '8rem',   // 128px
  },

  breakpoints: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },

  containers: {
    narrow: '840px',
    standard: '1200px',
    wide: '1440px',
    full: '100%',
  },

  transitions: {
    slow: 'cubic-bezier(0.16, 1, 0.3, 1)', // Smooth luxury deceleration
    medium: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    instant: 'cubic-bezier(0, 0, 0.2, 1)',
  },

  shadows: {
    ambient: '0 20px 50px rgba(0, 0, 0, 0.4)',
    elevated: '0 30px 70px rgba(0, 0, 0, 0.6)',
    subtleGoldGlow: '0 0 40px rgba(197, 168, 128, 0.08)',
  },
};
