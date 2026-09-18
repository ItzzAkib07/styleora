import React, { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
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
        ctaRef.current
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
          );
      }

      // 2. Subtle Scroll-Driven Parallax on Background Glow
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          yPercent: 25,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert(); // Clean up all GSAP & ScrollTrigger instances
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen min-h-[100dvh] w-full flex flex-col justify-center items-center pt-28 pb-20 sm:pt-32 sm:pb-24 overflow-hidden"
    >
      {/* Background Cinematic Atmosphere Layer - Clear, full-bleed, responsive */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden transition-opacity duration-700">
        <CinematicHeroMedia className="w-full h-full" videoSrc={videoSrc} />
        {/* Balanced Contrast Protection Gradients — preserves video clarity while ensuring crystal-clear text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/65 via-obsidian/20 to-obsidian/90 pointer-events-none" />
      </div>

      {/* Atmospheric Background Motion */}
      <AtmosphericBackground variant="hero" intensity="minimal" />

      {/* Subtle Ambient Radial Glow */}
      <div
        ref={glowRef}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-muted-gold/8 rounded-full blur-[140px] pointer-events-none animate-ambient-breathe"
      />

      <AtelierContainer>
        <div className="text-center max-w-4xl mx-auto relative z-10 py-6">
          {/* Atelier Eyebrow */}
          <div ref={eyebrowRef} className="mb-6 flex justify-center">
            <Eyebrow>Digital Personal Style Atelier</Eyebrow>
          </div>

          {/* Editorial Display Headline */}
          <h1
            ref={headlineRef}
            className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6rem] font-normal leading-[1.04] text-warm-ivory mb-6 tracking-tight drop-shadow-md"
          >
            YOUR STYLE,
            <br />
            <span className="text-champagne italic font-normal">INTENTIONALLY DEFINED.</span>
          </h1>

          {/* Subtitle Statement */}
          <p
            ref={subtitleRef}
            className="text-ivory-muted/90 text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-10 drop-shadow-sm"
          >
            A private styling atelier curating bespoke wardrobe architecture, optical proportion harmony, and seasonal chromatic resonance for discerning clientele.
          </p>

          {/* Primary & Secondary CTAs */}
          <div ref={ctaRef} className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
            <Button to={ROUTES.CONSULTATION} variant="primary" size="lg" icon={ArrowUpRight} className="shadow-elevated">
              Book Consultation
            </Button>
            <Button
              to={ROUTES.HOW_IT_WORKS}
              variant="secondary"
              size="lg"
              className="backdrop-blur-md bg-obsidian/50 border-champagne/30 hover:bg-obsidian/75 text-warm-ivory"
            >
              The Atelier Method
            </Button>
          </div>
        </div>
      </AtelierContainer>
    </section>
  );
};
