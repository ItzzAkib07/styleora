/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0B0C',
        charcoal: '#161618',
        'surface-subtle': '#1C1C1F',
        'surface-elevated': '#242428',
        'warm-ivory': '#F7F5F0',
        'ivory-muted': 'rgba(247, 245, 240, 0.72)',
        stone: {
          DEFAULT: '#8E8D8A',
          dark: '#5E5D5A',
        },
        champagne: {
          DEFAULT: '#E6D7C3',
          light: '#F3ECE1',
        },
        'muted-gold': '#C5A880',
        'gold-subtle': 'rgba(197, 168, 128, 0.15)',
        'atelier-success': '#6B8E70',
        'atelier-error': '#B85D5D',
        'atelier-warning': '#D49A6A',
        'atelier-info': '#7E919F',
        'border-subtle': 'rgba(230, 215, 195, 0.12)',
        'border-medium': 'rgba(230, 215, 195, 0.22)',
        'border-strong': 'rgba(197, 168, 128, 0.35)',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Cinzel', 'Georgia', 'serif'],
        cinzel: ['Cinzel', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      letterSpacing: {
        'editorial-wide': '0.15em',
        'editorial-ultra': '0.25em',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      boxShadow: {
        ambient: '0 20px 50px rgba(0, 0, 0, 0.4)',
        elevated: '0 30px 70px rgba(0, 0, 0, 0.6)',
        'gold-glow': '0 0 40px rgba(197, 168, 128, 0.08)',
      },
    },
  },
  plugins: [],
};
