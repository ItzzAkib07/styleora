import React from 'react';
import { ArrowUpRight, Compass, Shield, Award } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { AtelierContainer, SectionHeading, Card, Button, SEO } from '@/components/ui';
import { AtmosphericBackground } from '@/components/background';

export const AboutPage = () => {
  const principles = [
    {
      num: 'I',
      icon: Compass,
      title: 'Form Follows Anatomy',
      desc: 'Style begins with bone structure, skeletal balance, and muscle drape. We reject mass trends in favor of geometric equilibrium tailored to individual biology.',
    },
    {
      num: 'II',
      icon: Award,
      title: 'Intentional Restraint',
      desc: 'A crowded wardrobe is a monument to indecision. True luxury is curating a disciplined, modular capsule where every garment asserts commanding purpose.',
    },
    {
      num: 'III',
      icon: Shield,
      title: 'Absolute Discretion',
      desc: 'STYLEORA operates as a private atelier. We safeguard our clients’ identities, styling blueprints, and consultations with stringent institutional confidentiality.',
    },
  ];

  return (
    <>
      <SEO
        title="Brand Philosophy — An Atelier of Intentional Presence"
        description="Learn about the philosophy and principles guiding STYLEORA. An exclusive digital atelier dedicated to bespoke wardrobe architecture and timeless presence."
      />

      <div className="pt-32 pb-24 md:pt-40 md:pb-32 relative overflow-hidden">
        {/* Atelier Editorial Manifesto Atmosphere */}
        <AtmosphericBackground variant="editorial" intensity="subtle" />

        <AtelierContainer size="narrow">
          <SectionHeading
            align="left"
            eyebrow="The Atelier Manifesto"
            title="An Atelier of Intentional Presence."
            subtitle="STYLEORA is built upon a single, unapologetic truth: personal style is not fashion consumed passively, but architectural intention applied to physical presence."
          />

          {/* Narrative Body */}
          <div className="text-ivory-muted text-base sm:text-lg leading-relaxed flex flex-col gap-6 font-light mb-16">
            <p>
              In a digital landscape inundated with fast fashion, algorithm-driven micro-trends, and generic advice, personal presence has become diluted. The modern executive and discerning individual is left with abundant choices but diminished clarity.
            </p>
            <p>
              We established STYLEORA as a sanctuary of discernment. Operating strictly by private reservation, our atelier combines analytical rigor—optical facial geometry, shoulder-to-hip proportions, and reflectance chromatography—with the refined human touch of senior master stylists.
            </p>
            <p>
              We do not sell clothing. We do not accept commissions from fashion houses. We provide uncompromised, objective style intelligence that endures for a lifetime.
            </p>
          </div>

          {/* Core Principles Grid */}
          <div className="mb-16">
            <h3 className="font-cinzel text-xs text-muted-gold tracking-widest uppercase mb-8">
              CORE ATELIER PRINCIPLES
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {principles.map((p) => {
                const Icon = p.icon;
                return (
                  <Card key={p.num} className="p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="font-editorial text-3xl text-muted-gold leading-none">
                          {p.num}
                        </span>
                        <Icon size={18} className="text-champagne" />
                      </div>
                      <h4 className="font-editorial text-xl text-warm-ivory mb-2 font-normal">
                        {p.title}
                      </h4>
                      <p className="text-ivory-muted text-xs sm:text-sm font-light leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Atelier Charter Note with Seal */}
          <div className="p-8 border border-border-subtle bg-charcoal flex flex-col sm:flex-row items-center gap-6 mb-14">
            <img
              src="/assets/atelier-seal.svg"
              alt="STYLEORA Seal"
              className="w-20 h-20 shrink-0 opacity-80"
              loading="lazy"
            />
            <div>
              <h4 className="font-editorial text-xl text-warm-ivory mb-2 font-normal">
                Private Consultation Protocol
              </h4>
              <p className="text-stone text-xs sm:text-sm font-light leading-relaxed">
                Every consultation is conducted one-on-one with high-definition screen sharing and secure digital delivery. All styling dossiers remain permanently accessible in your private archive.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-border-subtle flex items-center justify-between flex-wrap gap-4">
            <Button to={ROUTES.CONSULTATION} variant="primary" size="lg" icon={ArrowUpRight}>
              Reserve Your Consultation
            </Button>
            <Button to={ROUTES.HOW_IT_WORKS} variant="outline" size="lg">
              Explore The Method
            </Button>
          </div>
        </AtelierContainer>
      </div>
    </>
  );
};
