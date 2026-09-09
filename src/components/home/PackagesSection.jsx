import React from 'react';
import { Check, ArrowUpRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { AtelierContainer, SectionHeading, Button } from '@/components/ui';

export const PackagesSection = () => {
  const packages = [
    {
      id: 'signature_silhouette',
      name: 'Signature Silhouette Atelier',
      tier: 'STYLEORA FOUNDATION',
      price: '₹25,000',
      duration: '90 Minutes Private Session',
      popular: false,
      desc: 'Ideal for individuals seeking a complete structural overhaul of their silhouettes, optical proportions, and seasonal palette.',
      features: [
        '90-Minute Private Virtual Consultation with Senior Stylist',
        'Facial Geometry & Silhouette Proportion Architecture',
        '8-Color Personalized Chromatic Harmony Index',
        'Garment Silhouette & Tailoring Specification Guidelines',
        'Hair & Eyewear Framing Blueprint',
        'Comprehensive 25-Page Digital Atelier Dossier',
      ],
    },
    {
      id: 'couture_capsule',
      name: 'Bespoke Capsule Architecture',
      tier: 'STYLEORA COMPREHENSIVE',
      price: '₹50,000',
      duration: 'Half-Day Intensive + 30 Days Concierge',
      popular: true,
      desc: 'The definitive executive style stratagem. A modular, highly interchangeable 30-piece wardrobe plan calibrated for global life and high-stakes presence.',
      features: [
        'All Signature Silhouette Atelier Inclusions',
        '30-Piece Bespoke Capsule Wardrobe Blueprint (120+ Outfits)',
        'Retail Brand Shopping Matrix Across International Houses',
        'Luggage & Travel Packing Stratagem Architecture',
        'Direct Stylist Messaging Channel Access for 30 Days',
        'Post-Session Dossier Revision & Event Curation Support',
      ],
    },
  ];

  return (
    <section className="py-20 md:py-28 border-t border-border-subtle bg-charcoal/40 relative">
      <AtelierContainer>
        <SectionHeading
          eyebrow="Atelier Reservations"
          title="Private Consultation Tiers."
          subtitle="Choose the level of immersion appropriate for your lifestyle and wardrobe objectives. Strictly limited monthly availability."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-charcoal p-8 sm:p-12 flex flex-col justify-between relative transition-all duration-300 ${
                pkg.popular
                  ? 'border-2 border-champagne shadow-elevated'
                  : 'border border-border-subtle'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 right-8 px-3 py-1 bg-champagne text-obsidian text-[0.65rem] tracking-editorial-ultra uppercase font-bold">
                  Recommended Atelier Tier
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-cinzel text-xs text-muted-gold tracking-widest uppercase">
                    {pkg.tier}
                  </span>
                  <span className="text-xs text-stone">{pkg.duration}</span>
                </div>

                <h3 className="font-editorial text-3xl text-warm-ivory mb-2 font-normal">
                  {pkg.name}
                </h3>

                <p className="text-ivory-muted text-sm font-light leading-relaxed mb-6">
                  {pkg.desc}
                </p>

                <div className="mb-8 pb-6 border-b border-border-subtle">
                  <span className="font-editorial text-4xl sm:text-5xl text-champagne font-normal">
                    {pkg.price}
                  </span>
                  <span className="text-stone text-xs block mt-1">
                    Inclusive of all taxes & bespoke deliverables
                  </span>
                </div>

                <div className="mb-8">
                  <p className="text-xs tracking-editorial-ultra text-muted-gold uppercase font-medium mb-4">
                    Atelier Inclusions
                  </p>
                  <ul className="list-none p-0 m-0 flex flex-col gap-3">
                    {pkg.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-sm text-ivory-muted font-light leading-relaxed">
                        <Check size={16} className="text-muted-gold shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <Button
                  to={ROUTES.CONSULTATION}
                  variant={pkg.popular ? 'primary' : 'secondary'}
                  size="lg"
                  className="w-full"
                  icon={ArrowUpRight}
                >
                  Reserve Consultation
                </Button>
              </div>
            </div>
          ))}
        </div>
      </AtelierContainer>
    </section>
  );
};
