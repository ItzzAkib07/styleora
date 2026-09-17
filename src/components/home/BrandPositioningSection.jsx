import React, { useEffect, useRef } from 'react';
import { AtelierContainer, SectionHeading, Card } from '@/components/ui';
import { AtmosphericBackground } from '@/components/background';
import { gsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export const BrandPositioningSection = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  const pillars = [
    {
      num: '01',
      title: 'Proportion Architecture',
      subtitle: 'STYLEORA FORM',
      desc: 'We analyze skeletal geometry, vertical ratios, and natural drape lines to select garment cuts that command effortless equilibrium and visual poise.',
    },
    {
      num: '02',
      title: 'Chromatic Precision',
      subtitle: 'STYLEORA PALETTE',
      desc: 'True personal color curation goes beyond generic seasonal types. We map warm and cool micro-undertones to craft your immutable 8-color signature index.',
    },
    {
      num: '03',
      title: 'Lifestyle Resonance',
      subtitle: 'STYLEORA OCCASIONS',
      desc: 'Whether entering a high-stakes boardroom, international travel, or an evening gathering, your wardrobe architecture communicates status without uttering a word.',
    },
  ];

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const targets = cardsRef.current.filter(Boolean);
      if (targets.length > 0) {
        gsap.fromTo(
          targets,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.18,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 78%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section ref={sectionRef} className="py-20 md:py-28 border-t border-border-subtle bg-obsidian relative overflow-hidden">
      <AtmosphericBackground variant="editorial" />
      <AtelierContainer>
        <SectionHeading
          eyebrow="The Atelier Philosophy"
          title="We Do Not Follow Trends. We Architect Presence."
          subtitle="STYLEORA operates on the belief that dress is personal architecture. Our atelier rejects fast-moving hype cycles in favor of immutable design fundamentals."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((pillar, idx) => (
            <Card
              key={pillar.num}
              ref={(el) => (cardsRef.current[idx] = el)}
              hoverEffect
              className="flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-subtle">
                  <span className="font-editorial text-4xl text-muted-gold leading-none">
                    {pillar.num}
                  </span>
                  <span className="text-[0.65rem] tracking-editorial-ultra text-champagne uppercase font-medium">
                    {pillar.subtitle}
                  </span>
                </div>

                <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                  {pillar.title}
                </h3>
                <p className="text-ivory-muted text-sm sm:text-base leading-relaxed font-light">
                  {pillar.desc}
                </p>
              </div>

              <div className="pt-6 mt-8 border-t border-border-subtle/60 text-xs text-stone font-light">
                Fundamental Pillar
              </div>
            </Card>
          ))}
        </div>
      </AtelierContainer>
    </section>
  );
};
