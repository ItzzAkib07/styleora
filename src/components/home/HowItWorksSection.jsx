import React, { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { METHOD_STAGES } from '@/constants/method';
import { AtelierContainer, SectionHeading, Button } from '@/components/ui';
import { AtmosphericBackground } from '@/components/background';
import { gsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export const HowItWorksSection = () => {
  const sectionRef = useRef(null);
  const stepsRef = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const targets = stepsRef.current.filter(Boolean);
      if (targets.length > 0) {
        gsap.fromTo(
          targets,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.12,
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
    <section ref={sectionRef} className="py-20 md:py-28 border-t border-border-subtle bg-charcoal/40 relative overflow-hidden">
      {/* Atelier Method Craft & Process Atmosphere */}
      <AtmosphericBackground variant="method" intensity="subtle" />

      <AtelierContainer>
        <SectionHeading
          eyebrow="The STYLEORA Atelier Method"
          title="A Method of Distinctive Precision."
          subtitle="Personal style is more than what looks good. It is the relationship between who you are, how you live and how you want to be seen. Our Atelier Method brings those elements together into a style direction that feels distinctly yours."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative mb-14">
          {METHOD_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.num}
                ref={(el) => (stepsRef.current[idx] = el)}
                className="relative bg-charcoal border border-border-subtle p-7 flex flex-col justify-between transition-all duration-300 hover:border-champagne/60 hover:-translate-y-1"
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

        <div className="text-center">
          <Button to={ROUTES.HOW_IT_WORKS} variant="outline" size="md" icon={ArrowUpRight}>
            Explore The Complete Methodology
          </Button>
        </div>
      </AtelierContainer>
    </section>
  );
};
