import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, UserCheck, Eye, Shapes, Palette, Sparkles, BookOpen } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { AtelierContainer, SectionHeading, Button } from '@/components/ui';
import { gsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export const HowItWorksSection = () => {
  const sectionRef = useRef(null);
  const stepsRef = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  const methodPhases = [
    {
      num: '01',
      icon: UserCheck,
      title: 'Profile',
      phase: 'The Person Behind The Wardrobe',
      desc: 'We understand who you are, how you live, your professional demands, aesthetic goals, and practical daily needs.',
    },
    {
      num: '02',
      icon: Eye,
      title: 'Visage',
      phase: 'The Visual Frame',
      desc: 'Optical facial geometry analysis, flattering eyewear framing, neckline architecture, hair direction, and framing accessories.',
    },
    {
      num: '03',
      icon: Shapes,
      title: 'Form',
      phase: 'Proportions & Silhouette',
      desc: 'Body proportions calibration, flattering cut strategy, waist definition, column dressing, tailoring direction, and fabric draping.',
    },
    {
      num: '04',
      icon: Palette,
      title: 'Palette',
      phase: 'Chromatic Harmony',
      desc: 'Skin tone and undertone discovery, separating your colours into foundational neutrals, signature hues, accents, and evening shades.',
    },
    {
      num: '05',
      icon: Sparkles,
      title: 'Signature',
      phase: 'Personal Style & Looks',
      desc: 'Translating theory into curated outfit directions spanning professional, smart casual, casual, ethnic, Indo-Western, and evening attire.',
    },
    {
      num: '06',
      icon: BookOpen,
      title: 'Blueprint',
      phase: 'The Tangible Core Deliverable',
      desc: 'Bringing everything together into your considered, actionable Personal Style Blueprint—a high-resolution dossier you can actually use.',
    },
  ];

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
    <section ref={sectionRef} className="py-20 md:py-28 border-t border-border-subtle bg-charcoal/40 relative">
      <AtelierContainer>
        <SectionHeading
          eyebrow="The STYLEORA Atelier Method"
          title="A Method of Distinctive Precision."
          subtitle="Personal style is more than what looks good. It is the relationship between who you are, how you live and how you want to be seen. Our Atelier Method brings those elements together into a style direction that feels distinctly yours."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative mb-14">
          {methodPhases.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                ref={(el) => (stepsRef.current[idx] = el)}
                className="relative bg-charcoal border border-border-subtle p-7 flex flex-col justify-between transition-all duration-300 hover:border-champagne/60 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 border border-border-medium flex items-center justify-center text-muted-gold bg-obsidian">
                      <Icon size={18} />
                    </div>
                    <span className="font-editorial text-3xl text-muted-gold/50 leading-none">
                      {step.num}
                    </span>
                  </div>

                  <span className="text-[0.68rem] tracking-editorial-ultra text-champagne uppercase font-medium block mb-1">
                    {step.phase}
                  </span>

                  <h3 className="font-editorial text-2xl text-warm-ivory mb-2.5 font-normal">
                    {step.title}
                  </h3>

                  <p className="text-ivory-muted text-xs leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-border-subtle/50 text-[0.65rem] text-stone uppercase tracking-widest">
                  Method 0{idx + 1}
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
