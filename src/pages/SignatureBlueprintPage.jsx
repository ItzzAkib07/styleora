import React, { useEffect, useRef } from 'react';
import {
  ArrowUpRight,
  Sparkles,
  Check,
  Shield,
  Download,
  Calendar,
  Clock,
  Compass,
  ArrowRight,
  Layers,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { CORE_PACKAGE, ADD_ONS } from '@/constants/packages';
import { METHOD_STAGES } from '@/constants/method';
import {
  BLUEPRINT_FEATURE_DETAILS,
  BLUEPRINT_STYLE_DIMENSIONS,
  BLUEPRINT_AUDIENCE_SITUATIONS,
} from '@/data/signatureBlueprint';
import { AtelierContainer, SectionHeading, Card, Button, SEO } from '@/components/ui';
import { AtmosphericBackground } from '@/components/background';
import { gsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export const SignatureBlueprintPage = () => {
  const heroRef = useRef(null);
  const inclusionsRef = useRef([]);
  const methodRef = useRef([]);
  const dimensionsRef = useRef([]);
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

      // 3. Style Dimensions Reveal
      const validDimensions = dimensionsRef.current.filter(Boolean);
      if (validDimensions.length > 0) {
        gsap.fromTo(
          validDimensions,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: validDimensions[0],
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 4. Method Stages Reveal
      const validStages = methodRef.current.filter(Boolean);
      if (validStages.length > 0) {
        gsap.fromTo(
          validStages,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: validStages[0],
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 5. Audience Situations Reveal
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
        {/* SECTION 3: WHAT YOU RECEIVE — PERSONALISED DIGITAL STYLE GUIDE             */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 border-b border-border-subtle bg-obsidian relative overflow-hidden">
          <AtelierContainer>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Narrative */}
              <div className="lg:col-span-6">
                <span className="font-cinzel text-xs text-muted-gold tracking-editorial-ultra uppercase block mb-3">
                  The Tangible Deliverable
                </span>
                <h2 className="font-editorial text-3xl sm:text-5xl text-warm-ivory font-normal mb-4">
                  Personalised Digital Style Guide.
                </h2>
                <p className="font-editorial text-xl text-champagne italic mb-6">
                  A beautifully designed digital style guide you can refer to whenever you're shopping or getting dressed.
                </p>

                <div className="space-y-4 text-ivory-muted text-sm font-light leading-relaxed mb-8">
                  <p>
                    Your styling investment is not lost in ephemeral memory or fleeting verbal advice. Following your private consultation, your stylist synthesizes every analysis, measurement rule, and outfit direction into your personal digital dossier.
                  </p>
                  <p>
                    Formatted in ultra-high definition for instant access on your phone, tablet, or desktop, your style guide acts as your permanent sartorial filter. When browsing in store or deciding what to pack for high-stakes travel, your rules, swatches, and formulas are right at your fingertips.
                  </p>
                </div>

                <div className="p-4 bg-charcoal border border-border-subtle flex items-center gap-3 text-xs text-stone">
                  <Shield size={16} className="text-muted-gold shrink-0" />
                  <span>
                    Delivered digitally within 5 business days post-consultation and preserved in confidential atelier archives.
                  </span>
                </div>
              </div>

              {/* Right Column: Visual Showcase */}
              <div className="lg:col-span-6">
                <Card className="p-6 sm:p-8 bg-charcoal border-border-medium relative shadow-elevated">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-subtle text-xs">
                    <span className="font-cinzel text-muted-gold tracking-widest uppercase">
                      DELIVERABLE SPECIFICATION
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-champagne">
                      <Download size={12} />
                      <span>Interactive Digital Dossier</span>
                    </span>
                  </div>

                  <img
                    src="/assets/blueprint-dossier.svg"
                    alt="STYLEORA Personalised Digital Style Guide Sample"
                    className="w-full h-auto border border-border-subtle opacity-95 hover:opacity-100 transition-opacity"
                    loading="lazy"
                  />

                  <div className="mt-4 pt-3 border-t border-border-subtle flex justify-between items-center text-xs text-stone">
                    <span>Format: Interactive Digital Style Guide</span>
                    <span className="text-warm-ivory font-medium">Delivered to Your Private Device</span>
                  </div>
                </Card>
              </div>
            </div>
          </AtelierContainer>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: 20 CURATED OUTFIT IDEAS                                        */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 border-b border-border-subtle bg-charcoal/40 relative">
          <AtelierContainer>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="font-cinzel text-xs text-muted-gold tracking-editorial-ultra uppercase block mb-3">
                Versatile Real-Life Combinations
              </span>
              <h2 className="font-editorial text-3xl sm:text-5xl text-warm-ivory font-normal mb-4">
                20 Curated Outfit Ideas.
              </h2>
              <p className="text-ivory-muted text-sm sm:text-base font-light leading-relaxed">
                Receive 20 personalised outfit ideas for work, casual, outings & occasions based on your lifestyle, style direction, proportions, and colour palette.
              </p>
            </div>

            {/* 4 Life Context Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="p-6 bg-charcoal border border-border-subtle">
                <span className="text-xs text-muted-gold tracking-editorial-ultra uppercase block mb-2 font-medium">
                  Context 01
                </span>
                <h3 className="font-editorial text-2xl text-warm-ivory mb-2 font-normal">
                  Executive & Work
                </h3>
                <p className="text-ivory-muted text-xs leading-relaxed font-light">
                  Tailored blazers, proportion-balanced trousers, and optical neckline framing for authority and commanding boardroom presence.
                </p>
              </div>

              <div className="p-6 bg-charcoal border border-border-subtle">
                <span className="text-xs text-muted-gold tracking-editorial-ultra uppercase block mb-2 font-medium">
                  Context 02
                </span>
                <h3 className="font-editorial text-2xl text-warm-ivory mb-2 font-normal">
                  Elevated Casual
                </h3>
                <p className="text-ivory-muted text-xs leading-relaxed font-light">
                  Relaxed knitwear, column drape separates, and deconstructed jackets designed for effortless off-duty elegance.
                </p>
              </div>

              <div className="p-6 bg-charcoal border border-border-subtle">
                <span className="text-xs text-muted-gold tracking-editorial-ultra uppercase block mb-2 font-medium">
                  Context 03
                </span>
                <h3 className="font-editorial text-2xl text-warm-ivory mb-2 font-normal">
                  Outings & Travel
                </h3>
                <p className="text-ivory-muted text-xs leading-relaxed font-light">
                  Breathable, high-interchangeability separates calibrated for weekend dinners, cultural visits, and transnational flights.
                </p>
              </div>

              <div className="p-6 bg-charcoal border border-border-subtle">
                <span className="text-xs text-muted-gold tracking-editorial-ultra uppercase block mb-2 font-medium">
                  Context 04
                </span>
                <h3 className="font-editorial text-2xl text-warm-ivory mb-2 font-normal">
                  Festive & Occasions
                </h3>
                <p className="text-ivory-muted text-xs leading-relaxed font-light">
                  Celebratory, ethnic, and Indo-Western attire curated with flattering fabric drapes, textures, and jewelry pairings.
                </p>
              </div>
            </div>

            <div className="p-6 bg-obsidian border border-border-subtle text-center max-w-2xl mx-auto">
              <p className="text-xs text-stone font-light leading-relaxed">
                Every look is curated by your master stylist using your existing wardrobe anchors alongside objective sourcing recommendations—never generic automated algorithms.
              </p>
            </div>
          </AtelierContainer>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: 30-MINUTE 1:1 CONSULTATION                                      */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 border-b border-border-subtle bg-obsidian relative">
          <AtelierContainer size="narrow">
            <div className="p-8 sm:p-14 bg-charcoal border border-champagne/40 relative shadow-elevated">
              <div className="flex items-center gap-2 text-champagne text-xs font-cinzel uppercase tracking-widest mb-3">
                <Clock size={16} />
                <span>Stylist-Led Human Intimacy</span>
              </div>

              <h2 className="font-editorial text-3xl sm:text-5xl text-warm-ivory font-normal mb-4">
                30-Minute 1:1 Consultation.
              </h2>

              <p className="font-editorial text-xl text-champagne italic mb-6">
                A private, focused video session conducted by a dedicated master personal stylist.
              </p>

              <div className="space-y-4 text-ivory-muted text-sm font-light leading-relaxed mb-8">
                <p>
                  We believe true personal style requires genuine human connection. Your private consultation is an intimate dialogue anchored in who you are, how you live, your professional demands, and comfort boundaries.
                </p>
                <p>
                  During the session, your stylist reviews your intake photographs, breaks down your proportions and undertones, explores your style aspirations, and answers your most pressing dressing questions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8 mb-8 border-b border-border-subtle text-xs">
                <div className="flex items-start gap-2.5 text-ivory-muted">
                  <Check size={16} className="text-atelier-success shrink-0 mt-0.5" />
                  <span>Private high-definition video with screen-sharing</span>
                </div>
                <div className="flex items-start gap-2.5 text-ivory-muted">
                  <Check size={16} className="text-atelier-success shrink-0 mt-0.5" />
                  <span>Flexible scheduling with concierge coordination</span>
                </div>
                <div className="flex items-start gap-2.5 text-ivory-muted">
                  <Check size={16} className="text-atelier-success shrink-0 mt-0.5" />
                  <span>Strict client non-disclosure protections</span>
                </div>
                <div className="flex items-start gap-2.5 text-ivory-muted">
                  <Check size={16} className="text-atelier-success shrink-0 mt-0.5" />
                  <span>Objective advice with zero brand kickbacks</span>
                </div>
              </div>

              <Button to={ROUTES.CONSULTATION} variant="primary" size="lg" icon={ArrowUpRight}>
                Reserve Your Consultation
              </Button>
            </div>
          </AtelierContainer>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6: MAJOR STYLE DIMENSIONS                                         */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 border-b border-border-subtle bg-charcoal/40 relative">
          <AtelierContainer>
            <div className="max-w-3xl mb-16">
              <span className="font-cinzel text-xs text-muted-gold tracking-editorial-ultra uppercase block mb-3">
                The Seven Pillars
              </span>
              <h2 className="font-editorial text-3xl sm:text-5xl text-warm-ivory font-normal mb-4">
                Holistic Style Direction.
              </h2>
              <p className="text-ivory-muted text-sm sm:text-base font-light leading-relaxed">
                True elegance is never a single piece. The Signature Blueprint unifies seven interrelated styling dimensions into an unmistakable personal presence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BLUEPRINT_STYLE_DIMENSIONS.map((dim, idx) => (
                <div
                  key={dim.id}
                  ref={(el) => (dimensionsRef.current[idx] = el)}
                  className="p-8 bg-charcoal border border-border-subtle hover:border-border-medium transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <span className="font-cinzel text-[0.65rem] tracking-editorial-ultra text-muted-gold uppercase block mb-2">
                      DIMENSION 0{idx + 1}
                    </span>
                    <h3 className="font-editorial text-2xl text-warm-ivory mb-1 font-normal">
                      {dim.title}
                    </h3>
                    <p className="text-xs text-champagne font-serif italic mb-3">
                      {dim.subtitle}
                    </p>
                    <p className="text-ivory-muted text-xs leading-relaxed font-light">
                      {dim.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AtelierContainer>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7: THE STYLEORA METHOD (6 AUTHORITATIVE STAGES)                    */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 border-b border-border-subtle bg-obsidian relative overflow-hidden">
          {/* Method Process Atmosphere */}
          <AtmosphericBackground variant="method" intensity="subtle" />

          <AtelierContainer>
            <div className="max-w-3xl mb-16">
              <span className="font-cinzel text-xs text-muted-gold tracking-editorial-ultra uppercase block mb-3">
                The STYLEORA Method
              </span>
              <h2 className="font-editorial text-3xl sm:text-5xl text-warm-ivory font-normal mb-4">
                Six Stages of Precision.
              </h2>
              <p className="text-ivory-muted text-sm sm:text-base font-light leading-relaxed">
                Our structured styling method brings your lifestyle, body, and aspirations into a clear direction that feels distinctly yours.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {METHOD_STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                return (
                  <div
                    key={stage.num}
                    ref={(el) => (methodRef.current[idx] = el)}
                    className="p-7 bg-charcoal border border-border-subtle flex flex-col justify-between hover:border-champagne/50 transition-all duration-300"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-10 h-10 border border-border-medium flex items-center justify-center text-muted-gold bg-obsidian">
                          <Icon size={18} />
                        </div>
                        <span className="font-editorial text-3xl text-muted-gold/50 leading-none">
                          {stage.num}
                        </span>
                      </div>

                      <h3 className="font-editorial text-xl sm:text-2xl text-warm-ivory mb-3 font-normal tracking-wide">
                        {stage.fullTitle}
                      </h3>

                      <p className="text-ivory-muted text-xs sm:text-sm leading-relaxed font-light">
                        {stage.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-3 border-t border-border-subtle/50 text-[0.65rem] text-stone uppercase tracking-widest">
                      Stage {stage.num}
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

        {/* ========================================================================= */}
        {/* SECTION 10: FINAL EDITORIAL CTA                                           */}
        {/* ========================================================================= */}
        <section className="py-24 md:py-32 bg-gradient-to-b from-charcoal/60 to-obsidian relative overflow-hidden text-center">
          {/* Final Editorial Invitation Atmosphere */}
          <AtmosphericBackground variant="invitation" intensity="subtle" />

          <AtelierContainer size="narrow">
            <span className="font-cinzel text-xs text-muted-gold tracking-editorial-ultra uppercase block mb-4">
              COMMISSION YOUR STYLE IDENTITY
            </span>

            <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.1] text-warm-ivory mb-4 tracking-tight">
              YOUR STYLE, DEFINED.
            </h2>

            <p className="font-editorial text-2xl text-champagne italic mb-6">
              Ready to dress with more clarity?
            </p>

            <p className="text-stone text-base font-light leading-relaxed max-w-xl mx-auto mb-10">
              Step beyond reactive shopping. Establish a lifelong sartorial hallmark calibrated exclusively to your body, colours, and lifestyle.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <Button to={ROUTES.CONSULTATION} variant="primary" size="lg" icon={ArrowUpRight}>
                Book Your Signature Blueprint
              </Button>
              <Button to={ROUTES.CONTACT} variant="outline" size="lg">
                Speak with Concierge Desk
              </Button>
            </div>
          </AtelierContainer>
        </section>
      </div>
    </>
  );
};
