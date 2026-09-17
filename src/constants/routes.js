export const ROUTES = Object.freeze({
  HOME: '/',
  ABOUT: '/about',
  HOW_IT_WORKS: '/how-it-works',
  SIGNATURE_BLUEPRINT: '/signature-blueprint',
  CONSULTATION: '/consultation',
  FAQ: '/faq',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  REFUND_POLICY: '/refund-policy',
});

export const NAV_LINKS = Object.freeze([
  { label: 'About', path: ROUTES.ABOUT },
  { label: 'Signature Blueprint', path: ROUTES.SIGNATURE_BLUEPRINT },
  { label: 'Atelier Method', path: ROUTES.HOW_IT_WORKS },
  { label: 'Consultation', path: ROUTES.CONSULTATION },
  { label: 'Journal & FAQ', path: ROUTES.FAQ },
  { label: 'Contact', path: ROUTES.CONTACT },
]);
