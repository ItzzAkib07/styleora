import React, { useEffect, useRef } from 'react';
import { AtelierContainer, SectionHeading } from '@/components/ui';
import { AtmosphericBackground } from '@/components/background';
import { STYLEORA_STATS } from '@/data/styleoraStats';
import { gsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export const StatsSection = () => {
  const sectionRef = useRef(null);
  const itemsRef = useRef([]);
  const countersRef = useRef([]);
  const labelsRef = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const validItems = itemsRef.current.filter(Boolean);

      // 1. Entrance animation for the metric columns
      if (validItems.length > 0) {
        gsap.fromTo(
          validItems,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            stagger: 0.14,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 78%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 2. Coordinated Number count-up + typographic reveal
      STYLEORA_STATS.forEach((stat, idx) => {
        const counterEl = countersRef.current[idx];
        const labelEl = labelsRef.current[idx];
        if (!counterEl) return;

        // Number count-up
        const countObj = { val: 0 };
        gsap.to(countObj, {
          val: stat.targetNumber,
          duration: stat.targetNumber >= 20 ? 1.6 : 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: counterEl,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          onUpdate: () => {
            const currentInt = Math.round(countObj.val);
            const formatted = currentInt.toLocaleString('en-US');
            counterEl.textContent = `${formatted}${stat.suffix}`;
          },
          onComplete: () => {
            counterEl.textContent = stat.formatted;
          },
        });

        // Subtle number float reveal
        gsap.fromTo(
          counterEl,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: counterEl,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );

        // Labels fade & slide in smoothly
        if (labelEl) {
          gsap.fromTo(
            labelEl,
            { opacity: 0, y: 15 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: 0.15 + idx * 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: counterEl,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-36 border-t border-border-subtle bg-obsidian relative overflow-hidden"
    >
      {/* STYLEORA Calibrated Minimal Atmosphere */}
      <AtmosphericBackground variant="stats" intensity="subtle" />

      <AtelierContainer>
        {/* Editorial Section Header */}
        <div className="mb-16 md:mb-24">
          <SectionHeading
            eyebrow="The STYLEORA Standard"
            title="Calibrated Precision in Numbers."
            subtitle="Our styling practice is defined by disciplined curation, personal intimacy, and an uncompromising standard of sartorial excellence."
          />
        </div>

        {/* Pure Editorial Open Grid — No Card Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10 pt-10 border-t border-border-subtle/50">
          {STYLEORA_STATS.map((stat, idx) => (
            <div
              key={stat.id}
              ref={(el) => (itemsRef.current[idx] = el)}
              className="group flex flex-col justify-between relative"
            >
              <div>
                {/* Thin Editorial Accent Header */}
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-border-subtle/40 group-hover:border-champagne/40 transition-colors duration-500">
                  <span className="font-cinzel text-[0.68rem] tracking-editorial-ultra text-muted-gold uppercase">
                    {stat.eyebrow}
                  </span>
                  <span className="text-[0.68rem] font-mono text-stone-dark tracking-widest group-hover:text-stone transition-colors">
                    0{idx + 1}
                  </span>
                </div>

                {/* Monumental Number Display */}
                <div className="mb-4 overflow-hidden">
                  <span
                    ref={(el) => (countersRef.current[idx] = el)}
                    className="font-editorial text-7xl sm:text-8xl lg:text-8xl xl:text-9xl font-light text-champagne leading-none tracking-tight block select-none transition-all duration-700 ease-luxury group-hover:text-warm-ivory group-hover:translate-x-1.5"
                  >
                    {prefersReducedMotion ? stat.formatted : `0${stat.suffix}`}
                  </span>
                </div>

                {/* Primary Label & Representation */}
                <div ref={(el) => (labelsRef.current[idx] = el)}>
                  <h3 className="font-editorial text-2xl sm:text-3xl text-warm-ivory font-normal tracking-wide mb-3 group-hover:text-champagne transition-colors duration-300">
                    {stat.label}
                  </h3>

                  {/* Narrative Context */}
                  <p className="text-stone text-xs sm:text-sm leading-relaxed font-light max-w-[280px]">
                    {stat.narrative}
                  </p>
                </div>
              </div>

              {/* Minimal Editorial Footnote Line */}
              <div className="mt-8 pt-4 border-t border-border-subtle/20 flex items-center gap-2 text-[0.62rem] tracking-editorial-ultra text-stone-dark uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-champagne/40 group-hover:bg-champagne transition-colors duration-300" />
                <span>Atelier Metric</span>
              </div>
            </div>
          ))}
        </div>
      </AtelierContainer>
    </section>
  );
};
