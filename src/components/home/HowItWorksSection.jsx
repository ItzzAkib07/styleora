import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, Calendar, Video, FileText } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { AtelierContainer, SectionHeading, Button } from '@/components/ui';
import { gsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export const HowItWorksSection = () => {
  const sectionRef = useRef(null);
  const stepsRef = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  const steps = [
    {
      num: '01',
      icon: Calendar,
      title: 'Private Reservation & Intake',
      duration: 'Step 1 • Immediate',
      desc: 'Submit your styling reservation and complete our private digital questionnaire capturing lifestyle demands, current frustrations, and aesthetic inclinations.',
    },
    {
      num: '02',
      icon: Video,
      title: 'One-on-One Atelier Session',
      duration: 'Step 2 • 90 Minutes',
      desc: 'Connect in an unhurried, private high-definition consultation with your master stylist for comprehensive facial analysis, silhouette calibration, and chromatic testing.',
    },
    {
      num: '03',
      icon: FileText,
      title: 'The Bespoke Styleora Blueprint',
      duration: 'Step 3 • Delivered in 5 Days',
      desc: 'Receive your comprehensive digital dossier—a 30+ page bespoke guide detailing your 30-piece capsule, tailoring specifications, and color harmony cards.',
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
            stagger: 0.16,
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
          eyebrow="The Atelier Method"
          title="From Consultation to Defined Permanence."
          subtitle="A structured, high-touch styling journey designed with rigor, discretion, and profound respect for your time."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mb-14">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                ref={(el) => (stepsRef.current[idx] = el)}
                className="relative bg-charcoal border border-border-subtle p-8 flex flex-col justify-between transition-all duration-300 hover:border-border-medium hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 border border-border-medium flex items-center justify-center text-muted-gold">
                      <Icon size={18} />
                    </div>
                    <span className="font-editorial text-3xl text-muted-gold/60 leading-none">
                      {step.num}
                    </span>
                  </div>

                  <span className="text-[0.68rem] tracking-editorial-ultra text-champagne uppercase font-medium block mb-2">
                    {step.duration}
                  </span>

                  <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                    {step.title}
                  </h3>

                  <p className="text-ivory-muted text-sm leading-relaxed font-light">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-border-subtle/50 text-[0.7rem] text-stone uppercase tracking-wider">
                  Phase 0{idx + 1}
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
