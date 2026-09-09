import React from 'react';
import { Check, Shield, ArrowUpRight, HelpCircle, PhoneCall } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { AtelierContainer, SectionHeading, Card, Button, SEO } from '@/components/ui';

export const ConsultationPage = () => {
  const packages = [
    {
      id: 'signature_silhouette',
      name: 'Signature Silhouette Atelier',
      tier: 'STYLEORA FOUNDATION',
      price: '₹25,000',
      duration: '90 Minutes Private Session',
      popular: false,
      desc: 'A comprehensive structural consultation establishing your foundational garment cuts, optical facial framing, and seasonal chromatic signature.',
      features: [
        '90-Minute Private Virtual Consultation with Senior Stylist',
        'Facial Geometry & Eyewear Framing Analysis',
        'Body Proportion & Silhouette Drape Architecture',
        '8-Color Signature Chromatic Swatch Matrix',
        'Garment Silhouette & Tailoring Specification Blueprint',
        '25-Page High-Definition Personal Style Dossier',
        'Direct Retail Brand Sourcing Recommendations',
      ],
    },
    {
      id: 'couture_capsule',
      name: 'Bespoke Capsule Architecture',
      tier: 'STYLEORA COMPREHENSIVE',
      price: '₹50,000',
      duration: 'Half-Day Intensive + 30 Days Concierge',
      popular: true,
      desc: 'The definitive executive style stratagem. Complete wardrobe architecture including a 30-piece capsule plan and 30 days of direct concierge styling support.',
      features: [
        'All Signature Silhouette Atelier Inclusions',
        '30-Piece Bespoke Capsule Wardrobe Blueprint (120+ Outfits)',
        'Contextual Outfit Matrix (Executive, Gala, Travel, Weekend)',
        'Retail Brand Shopping Matrix Across International Houses',
        'Luggage & High-Stakes Packing Stratagem Blueprint',
        'Direct Stylist Messaging Channel Access for 30 Days',
        'Post-Session Fitting Feedback & Revision Support',
      ],
    },
  ];

  const bookingSteps = [
    {
      num: '01',
      title: 'Select Your Tier',
      desc: 'Choose either the Signature Silhouette or Bespoke Capsule tier based on your immediate wardrobe scope.',
    },
    {
      num: '02',
      title: 'Concierge Outreach',
      desc: 'Our private styling concierge contacts you directly within 24 hours to present exclusive open calendar slots.',
    },
    {
      num: '03',
      title: 'Calendar Confirmation',
      desc: 'Mutually select your consultation date and receive the minimal photographic preparation guide.',
    },
  ];

  return (
    <>
      <SEO
        title="Private Consultation Reservations — STYLEORA Atelier"
        description="Reserve an exclusive one-on-one personal styling consultation with STYLEORA master stylists. Signature Silhouette and Bespoke Capsule Architecture packages."
      />

      <div className="pt-32 pb-24 md:pt-40 md:pb-32">
        <AtelierContainer>
          <div className="max-w-4xl mx-auto text-center mb-16">
            <SectionHeading
              eyebrow="Private Styling Reservation"
              title="Reserve Your Consultation."
              subtitle="Consultations are held in utmost confidentiality and strictly limited each month to ensure dedicated preparation and unbroken focus."
            />
          </div>

          {/* Packages Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-charcoal p-8 sm:p-12 flex flex-col justify-between relative ${
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
                      Inclusive of all consultation deliverables
                    </span>
                  </div>

                  <div className="mb-8">
                    <p className="text-xs tracking-editorial-ultra text-muted-gold uppercase font-medium mb-4">
                      Complete Inclusions:
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

                <div className="pt-6 border-t border-border-subtle/60 text-center">
                  <div className="p-3 bg-surface-subtle border border-border-subtle mb-4 text-xs text-stone">
                    Registration & Payment Gateway Integrates in Module 1.4
                  </div>
                  <Button
                    to={ROUTES.CONTACT}
                    variant={pkg.popular ? 'primary' : 'secondary'}
                    size="lg"
                    className="w-full"
                    icon={ArrowUpRight}
                  >
                    Inquire via Concierge
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Booking Protocol Explanation */}
          <div className="max-w-4xl mx-auto mb-20">
            <h3 className="font-editorial text-2xl text-center text-warm-ivory mb-8 font-normal">
              The Reservation Protocol
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bookingSteps.map((s) => (
                <Card key={s.num} className="p-6 text-center">
                  <span className="font-editorial text-3xl text-muted-gold block mb-2">
                    {s.num}
                  </span>
                  <h4 className="font-editorial text-lg text-warm-ivory mb-2 font-normal">
                    {s.title}
                  </h4>
                  <p className="text-ivory-muted text-xs leading-relaxed font-light">
                    {s.desc}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Discretion Guarantee */}
          <div className="max-w-2xl mx-auto p-6 border border-border-subtle bg-charcoal text-center flex items-center justify-center gap-3 text-stone text-xs sm:text-sm font-light">
            <Shield size={18} className="text-muted-gold shrink-0" />
            <span>
              All consultations are protected under mutual non-disclosure and strict client confidentiality.
            </span>
          </div>
        </AtelierContainer>
      </div>
    </>
  );
};
