import { useEffect } from 'react';

export const SEO = ({
  title = 'STYLEORA — Digital Personal Style Atelier',
  description = 'STYLEORA is a private luxury personal styling atelier. Bespoke wardrobe architecture, color curation, and tailored presence for discerning clientele.',
}) => {
  useEffect(() => {
    // Update Title
    const formattedTitle = title.includes('STYLEORA') ? title : `${title} | STYLEORA Atelier`;
    document.title = formattedTitle;

    // Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Guarantee Favicon is present and active across SPA route navigations
    let favicon = document.querySelector("link[rel='icon']");
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      favicon.setAttribute('type', 'image/svg+xml');
      favicon.setAttribute('href', '/favicon.svg');
      document.head.appendChild(favicon);
    } else {
      favicon.setAttribute('type', 'image/svg+xml');
      favicon.setAttribute('href', '/favicon.svg');
    }
  }, [title, description]);

  return null;
};
