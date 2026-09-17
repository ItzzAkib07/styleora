import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { AtelierContainer, Eyebrow, Button } from '@/components/ui';
import { CinematicHeroMedia } from '@/components/media/CinematicHeroMedia';
import { AtmosphericBackground } from '@/components/background';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export const HeroSection = ({ health, loading, videoSrc = null }) => {
  const sectionRef = useRef(null);
  const eyebrowRef = useRef(null);
  const headlineRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const frameRef = useRef(null);
  const glowRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Staggered Hero Entrance Animation
      if (
        eyebrowRef.current &&
        headlineRef.current &&
        subtitleRef.current &&
        ctaRef.current &&
        frameRef.current
      ) {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo(
          eyebrowRef.current,
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, duration: 0.8, delay: 0.2 }
        )
          .fromTo(
            headlineRef.current,
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 1.1 },
            '-=0.5'
          )
          .fromTo(
            subtitleRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.9 },
            '-=0.7'
          )
          .fromTo(
            ctaRef.current,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.8 },
            '-=0.6'
          )
          .fromTo(
            frameRef.current,
            { opacity: 0, scale: 0.97, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power2.out' },
            '-=0.6'
          );
      }

      // 2. Subtle Scroll-Driven Parallax on Background Glow & Frame
      if (glowRef.current && frameRef.current) {
        gsap.to(glowRef.current, {
          yPercent: 30,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        });

        gsap.to(frameRef.current, {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert(); // Clean up all GSAP & ScrollTrigger instances
  }, [prefersReducedMotion]);

  return (
    <section ref={sectionRef} className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Cinematic Atmosphere Layer (Subtly elevated opacity from 0.20 to 0.30) */}
      <div className="absolute inset-0 opacity-[0.28] sm:opacity-[0.32] pointer-events-none overflow-hidden transition-opacity duration-1000">
        <CinematicHeroMedia className="w-full h-full" videoSrc={videoSrc} />
        {/* Contrast Protection Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/70 via-transparent to-obsidian/90 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_#0B0B0C_95%)] pointer-events-none" />
      </div>

      {/* Atmospheric Background Motion */}
      <AtmosphericBackground variant="hero" intensity="subtle" />

      {/* Subtle Scroll-Driven Ambient Radial Glow */}
      <div
        ref={glowRef}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-muted-gold/8 rounded-full blur-[140px] pointer-events-none animate-ambient-breathe"
      />

      <AtelierContainer>
        <div className="text-center max-w-4xl mx-auto relative z-10">
          {/* Atelier Eyebrow */}
          <div ref={eyebrowRef} className="mb-6 flex justify-center">
            <Eyebrow>Digital Personal Style Atelier</Eyebrow>
          </div>

          {/* Editorial Display Headline */}
          <h1
            ref={headlineRef}
            className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-normal leading-[1.04] text-warm-ivory mb-6 tracking-tight"
          >
            YOUR STYLE,
            <br />
            <span className="text-champagne italic font-normal">INTENTIONALLY DEFINED.</span>
          </h1>

          {/* Subtitle Statement */}
          <p
            ref={subtitleRef}
            className="text-stone text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-10"
          >
            A private styling atelier curating bespoke wardrobe architecture, optical proportion harmony, and seasonal chromatic resonance for discerning clientele.
          </p>

          {/* Primary & Secondary CTAs */}
          <div ref={ctaRef} className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 mb-14">
            <Button to={ROUTES.CONSULTATION} variant="primary" size="lg" icon={ArrowUpRight}>
              Book Consultation
            </Button>
            <Button to={ROUTES.HOW_IT_WORKS} variant="secondary" size="lg">
              The Atelier Method
            </Button>
          </div>
        </div>

        {/* Hero Visual Editorial Frame */}
        <div ref={frameRef} className="max-w-4xl mx-auto mt-4 relative z-10">
          <div className="p-3 sm:p-5 border border-border-subtle bg-charcoal/80 backdrop-blur-md relative shadow-elevated">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left Architectural Graphic */}
              <div className="md:col-span-6 overflow-hidden border border-border-subtle bg-obsidian relative">
                <img
                  src="/assets/atelier-silhouette.svg"
                  alt="STYLEORA Figure Proportion Mapping"
                  className="w-full h-auto object-cover opacity-90 transition-transform duration-700 hover:scale-[1.03]"
                  loading="eager"
                />
              </div>

              {/* Right Atelier Attributes */}
              <div className="md:col-span-6 flex flex-col justify-between py-2 px-2 sm:px-4">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-subtle">
                    <span className="font-cinzel text-xs text-muted-gold tracking-editorial-wide">
                      ATELIER ARCHITECTURE
                    </span>
                    <span className="text-[0.65rem] text-stone tracking-editorial-ultra uppercase">
                      CONFIDENTIAL
                    </span>
                  </div>

                  <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                    Precision Proportions & Chromatic Harmony
                  </h3>
                  <p className="text-ivory-muted text-sm leading-relaxed font-light mb-6">
                    Every client journey begins with exact silhouette mapping, face-geometry grading, and seasonal palette architecture. We do not curate trends—we engineer permanence.
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-6">
                    <div className="p-3 bg-surface-subtle border border-border-subtle">
                      <span className="text-muted-gold block text-[0.65rem] uppercase tracking-wider mb-1">
                        DIMENSION I
                      </span>
                      <span className="text-warm-ivory font-medium">Optical Visage</span>
                    </div>
                    <div className="p-3 bg-surface-subtle border border-border-subtle">
                      <span className="text-muted-gold block text-[0.65rem] uppercase tracking-wider mb-1">
                        DIMENSION II
                      </span>
                      <span className="text-warm-ivory font-medium">Silhouette Form</span>
                    </div>
                  </div>
                </div>

                {/* Module 1.1 Foundation Verification Badge */}
                <div className="pt-4 border-t border-border-subtle">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-stone">
                      <ShieldCheck size={14} className="text-muted-gold" />
                      <span>Atelier Gateway</span>
                    </span>
                    <span
                      className={`flex items-center gap-1.5 font-medium ${
                        health?.status === 'ready' ? 'text-atelier-success' : 'text-champagne'
                      }`}
                    >
                      <CheckCircle2 size={12} />
                      {loading
                        ? 'Validating...'
                        : health
                        ? `${health.status.toUpperCase()} (${health.database})`
                        : 'Connected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AtelierContainer>
    </section>
  );
};
