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
  }, [title, description]);

  return null;
};
