import React, { useEffect, useRef } from 'react';
import {
  ArrowUpRight,
  Sparkles,
  Download,
  Clock,
  Layers,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { CORE_PACKAGE } from '@/constants/packages';
import {
  BLUEPRINT_FEATURE_DETAILS,
  BLUEPRINT_AUDIENCE_SITUATIONS,
} from '@/data/signatureBlueprint';
import { AtelierContainer, Button, SEO } from '@/components/ui';
import { AtmosphericBackground } from '@/components/background';
import { gsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export const SignatureBlueprintPage = () => {
  const heroRef = useRef(null);
  const inclusionsRef = useRef([]);
  const situationsRef = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Hero Reveal
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.14,
            ease: 'power2.out',
          }
        );
      }

      // 2. Inclusions Cards Reveal
      const validInclusions = inclusionsRef.current.filter(Boolean);
      if (validInclusions.length > 0) {
        gsap.fromTo(
          validInclusions,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: validInclusions[0],
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 3. Audience Situations Reveal
      const validSituations = situationsRef.current.filter(Boolean);
      if (validSituations.length > 0) {
        gsap.fromTo(
          validSituations,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: validSituations[0],
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <>
      <SEO
        title="STYLEORA Signature Blueprint | Personal Style Atelier"
        description="A personalised styling experience including personal style assessment, colour direction, silhouettes, outfit ideas, consultation and a digital style guide."
      />

      <div className="bg-obsidian min-h-screen">
        {/* ========================================================================= */}
        {/* SECTION 1: EDITORIAL HERO                                                 */}
        {/* ========================================================================= */}
        <section className="pt-36 pb-24 md:pt-48 md:pb-32 border-b border-border-subtle relative overflow-hidden">
          {/* Bespoke Blueprint Atmosphere */}
          <AtmosphericBackground variant="blueprint" intensity="subtle" />

          <AtelierContainer>
            <div ref={heroRef} className="max-w-4xl mx-auto text-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-champagne/10 border border-champagne/30 text-champagne text-[0.68rem] tracking-editorial-ultra uppercase mb-6 font-semibold">
                <Sparkles size={12} />
                THE PRIMARY ATELIER EXPERIENCE // BESPOKE STYLE DOSSIER
              </span>

              <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-warm-ivory font-normal leading-[1.05] tracking-tight mb-6">
                STYLEORA Signature Blueprint
              </h1>

              <p className="font-editorial text-2xl sm:text-3xl md:text-4xl text-champagne font-normal italic mb-6">
                Your personal style, thoughtfully defined.
              </p>

              <p className="text-ivory-muted text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto mb-10">
                A personalised style blueprint created around your lifestyle, proportions, colour direction, preferences and everyday life.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-14">
                <Button to={ROUTES.CONSULTATION} variant="primary" size="lg" icon={ArrowUpRight}>
                  Book Your Signature Blueprint
                </Button>
                <Button to={ROUTES.HOW_IT_WORKS} variant="outline" size="lg">
                  Explore The Method
                </Button>
              </div>

              {/* Highlights Bar */}
              <div className="pt-8 border-t border-border-subtle/60 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-stone">
                <div className="flex items-center justify-center gap-2">
                  <Clock size={16} className="text-muted-gold shrink-0" />
                  <span>30-Minute 1:1 Private Consultation</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Sparkles size={16} className="text-champagne shrink-0" />
                  <span>20 Curated Outfit Formulas</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Download size={16} className="text-muted-gold shrink-0" />
                  <span>Personalised Digital Style Guide</span>
                </div>
              </div>
            </div>
          </AtelierContainer>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: INSIDE YOUR BLUEPRINT (10 AUTHORITATIVE INCLUSIONS)             */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 border-b border-border-subtle bg-charcoal/40 relative overflow-hidden">
          {/* Blueprint Curation Atmosphere */}
          <AtmosphericBackground variant="blueprint" intensity="minimal" />

          <AtelierContainer>
            <div className="max-w-3xl mb-16">
              <span className="font-cinzel text-xs text-muted-gold tracking-editorial-ultra uppercase block mb-3">
                Comprehensive Curation
              </span>
              <h2 className="font-editorial text-3xl sm:text-5xl text-warm-ivory font-normal mb-4">
                Inside your blueprint:
              </h2>
              <p className="text-ivory-muted text-sm sm:text-base font-light leading-relaxed">
                Every STYLEORA Signature Blueprint encompasses ten bespoke styling dimensions, combining rigorous proportion analysis with wearable real-life formulas.
              </p>
            </div>

            {/* 10 Feature Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {BLUEPRINT_FEATURE_DETAILS.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.num}
                    ref={(el) => (inclusionsRef.current[idx] = el)}
                    className="p-8 bg-charcoal border border-border-subtle hover:border-champagne/40 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5 pb-3 border-b border-border-subtle/50">
                        <div className="flex items-center gap-3">
                          <span className="text-champagne text-sm select-none">✦</span>
                          <span className="font-cinzel text-xs text-muted-gold tracking-widest">
                            INCLUSION {feat.num}
                          </span>
                        </div>
                        <div className="w-8 h-8 border border-border-medium flex items-center justify-center text-muted-gold bg-obsidian group-hover:text-champagne transition-colors">
                          <Icon size={16} />
                        </div>
                      </div>

                      <h3 className="font-editorial text-2xl text-warm-ivory mb-2 font-normal">
                        {feat.title}
                      </h3>

                      <p className="text-[0.72rem] text-champagne/80 font-serif italic mb-3">
                        {feat.tagline}
                      </p>

                      <p className="text-ivory-muted text-xs sm:text-sm font-light leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-3 border-t border-border-subtle/30 flex items-center justify-between text-[0.65rem] text-stone uppercase tracking-widest">
                      <span>Signature Spec</span>
                      <span className="text-muted-gold">Included</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </AtelierContainer>
        </section>


        {/* ========================================================================= */}
        {/* SECTION 8: WHO IT IS FOR (AUDIENCE SITUATIONS)                             */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 border-b border-border-subtle bg-charcoal/40 relative">
          <AtelierContainer>
            <div className="max-w-3xl mb-16">
              <span className="font-cinzel text-xs text-muted-gold tracking-editorial-ultra uppercase block mb-3">
                Clarity for Real Lives
              </span>
              <h2 className="font-editorial text-3xl sm:text-5xl text-warm-ivory font-normal mb-4">
                Who the Blueprint Is For.
              </h2>
              <p className="text-ivory-muted text-sm sm:text-base font-light leading-relaxed">
                If you have experienced any of the dilemmas below, the Signature Blueprint was created specifically for you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BLUEPRINT_AUDIENCE_SITUATIONS.map((sit, idx) => (
                <div
                  key={sit.id}
                  ref={(el) => (situationsRef.current[idx] = el)}
                  className="p-8 bg-charcoal border border-border-subtle flex flex-col justify-between hover:border-champagne/40 transition-all duration-300"
                >
                  <div>
                    <p className="font-editorial text-xl sm:text-2xl text-warm-ivory italic leading-snug mb-3">
                      "{sit.quote}"
                    </p>
                    <span className="text-[0.68rem] tracking-editorial-ultra text-muted-gold uppercase block mb-3">
                      {sit.context}
                    </span>
                    <p className="text-ivory-muted text-xs sm:text-sm leading-relaxed font-light">
                      {sit.solution}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AtelierContainer>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 9: INVESTMENT                                                     */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 border-b border-border-subtle bg-obsidian relative">
          <AtelierContainer size="narrow">
            <div className="bg-charcoal border-2 border-champagne p-8 sm:p-14 relative shadow-elevated">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 mb-8 border-b border-border-subtle">
                <div>
                  <span className="font-cinzel text-xs text-muted-gold tracking-widest uppercase block mb-1">
                    {CORE_PACKAGE.tier}
                  </span>
                  <h2 className="font-editorial text-3xl sm:text-4xl text-warm-ivory font-normal">
                    {CORE_PACKAGE.name}
                  </h2>
                  <p className="text-stone text-xs mt-1">
                    Complete styling experience • Inclusive of all deliverables
                  </p>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="font-editorial text-5xl text-champagne font-normal block">
                    {CORE_PACKAGE.price}
                  </span>
                  <span className="text-stone text-xs font-light">
                    All-inclusive investment
                  </span>
                </div>
              </div>

              {/* Inclusions Quick Recap */}
              <p className="text-xs tracking-editorial-ultra text-muted-gold uppercase font-medium mb-4 flex items-center gap-2">
                <Sparkles size={13} className="text-champagne" />
                Inside your blueprint:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {CORE_PACKAGE.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs text-ivory-muted font-light leading-relaxed">
                    <span className="text-champagne text-xs mt-0.5 select-none">✦</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Optional Add-ons Note */}
              <div className="p-4 bg-obsidian border border-border-subtle mb-8 text-xs text-stone flex items-start gap-3">
                <Layers size={16} className="text-muted-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-warm-ivory font-medium mb-0.5">Optional Enhancements Available During Booking:</p>
                  <p className="font-light">
                    The Wardrobe Edit (₹1,499) • The Shopping Edit (₹499) • The Beauty Atelier (₹1,499)
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-border-subtle/60">
                <p className="text-xs text-stone font-light">
                  Private 1:1 consultation held via encrypted high-definition video session.
                </p>
                <Button to={ROUTES.CONSULTATION} variant="primary" size="lg" icon={ArrowUpRight} className="w-full sm:w-auto">
                  Book Your Signature Blueprint
                </Button>
              </div>
            </div>
          </AtelierContainer>
        </section>

      </div>
    </>
  );
};
