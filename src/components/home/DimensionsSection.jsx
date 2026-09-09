import React, { useEffect, useRef } from 'react';
import { Eye, Layers, Palette, Award, Briefcase, Compass } from 'lucide-react';
import { AtelierContainer, SectionHeading, Card } from '@/components/ui';
import { gsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export const DimensionsSection = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  const dimensions = [
    {
      code: 'VISAGE',
      title: 'Facial Geometry & Optical Framing',
      icon: Eye,
      desc: 'Jawline curvature, ocular distance, and bone structure inform neckline cuts, lapel breadth, eyewear selection, and grooming architecture.',
    },
    {
      code: 'FORM',
      title: 'Proportions & Silhouette Drape',
      icon: Layers,
      desc: 'Torso-to-leg proportions, shoulder breadth, and natural posture calibrate jacket drops, trouser rises, fabric weight, and drape rigidity.',
    },
    {
      code: 'PALETTE',
      title: 'Bespoke Chromatic Harmony',
      icon: Palette,
      desc: 'Exact color temperature, chroma intensity, and value contrast mapped against skin undertone, eye pigments, and natural contrast ratios.',
    },
    {
      code: 'SIGNATURE',
      title: 'The Sartorial Hallmark',
      icon: Award,
      desc: 'Developing an effortless personal aesthetic—the unique style markers, textures, and silhouettes that make your presence immediately unmistakable.',
    },
    {
      code: 'WARDROBE',
      title: 'The 30-Piece Modular Capsule',
      icon: Briefcase,
      desc: 'Eliminating excess. A disciplined, high-interchangeability wardrobe where every garment harmonizes with at least four companion pieces.',
    },
    {
      code: 'OCCASIONS',
      title: 'Contextual High-Stakes Stratagem',
      icon: Compass,
      desc: 'Complete outfit stratagems calibrated for keynote addresses, board assemblies, private client retreats, and transnational travel.',
    },
  ];

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const targets = cardsRef.current.filter(Boolean);
      if (targets.length > 0) {
        gsap.fromTo(
          targets,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section ref={sectionRef} className="py-20 md:py-28 border-t border-border-subtle bg-obsidian relative">
      <AtelierContainer>
        <SectionHeading
          eyebrow="The Six Dimensions"
          title="Holistic Style Intelligence."
          subtitle="True personal elegance is never a single garment. It is the confluence of six interrelated physical and aesthetic dimensions."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dimensions.map((dim, idx) => {
            const Icon = dim.icon;
            return (
              <Card
                key={dim.code}
                ref={(el) => (cardsRef.current[idx] = el)}
                hoverEffect
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-cinzel text-xs text-muted-gold tracking-editorial-wide">
                      STYLEORA {dim.code}
                    </span>
                    <Icon size={18} className="text-champagne" />
                  </div>

                  <h3 className="font-editorial text-xl text-warm-ivory mb-2.5 font-normal">
                    {dim.title}
                  </h3>

                  <p className="text-ivory-muted text-sm leading-relaxed font-light">
                    {dim.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border-subtle/50 text-[0.68rem] tracking-editorial-ultra text-stone uppercase">
                  Calibrated Dimension
                </div>
              </Card>
            );
          })}
        </div>
      </AtelierContainer>
    </section>
  );
};
