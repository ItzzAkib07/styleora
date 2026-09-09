import React, { useEffect, useRef } from 'react';
import { Check, Download, Shield } from 'lucide-react';
import { AtelierContainer, SectionHeading, Card } from '@/components/ui';
import { gsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export const BlueprintDeliverableSection = () => {
  const sectionRef = useRef(null);
  const showcaseRef = useRef(null);
  const textRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const inclusions = [
    'Complete Facial & Body Proportion Architecture Blueprint',
    '8-Color Signature Chromatic Swatch Matrix with Fabric Notes',
    '30-Piece Curated Capsule Wardrobe Plan with 120+ Outfits',
    'Exact Tailoring & Alterations Measurement Spec Sheet',
    'Direct Retail Brand Sourcing Guide across Luxury Houses',
    '30 Days Direct Stylist Concierge Access via Dedicated Channel',
  ];

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Reveal text block
      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { opacity: 0, x: -25 },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Reveal and parallax showcase card
      if (showcaseRef.current) {
        gsap.fromTo(
          showcaseRef.current,
          { opacity: 0, x: 25, scale: 0.98 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 1.0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );

        gsap.to(showcaseRef.current, {
          yPercent: -4,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section ref={sectionRef} className="py-20 md:py-28 border-t border-border-subtle bg-charcoal/30 relative overflow-hidden">
      <AtelierContainer>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text & Inclusions */}
          <div ref={textRef} className="lg:col-span-6">
            <SectionHeading
              align="left"
              eyebrow="The Deliverable"
              title="The Styleora Blueprint."
              subtitle="At the conclusion of your atelier session, we do not simply offer subjective opinions. We deliver a permanent personal style dossier tailored exclusively to your biology and ambitions."
            />

            <ul className="list-none p-0 m-0 flex flex-col gap-4 mb-8">
              {inclusions.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="p-1 border border-border-medium bg-obsidian text-muted-gold mt-0.5 shrink-0">
                    <Check size={14} />
                  </span>
                  <span className="text-ivory-muted text-sm sm:text-base font-light leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="p-4 bg-obsidian border border-border-subtle flex items-center gap-3 text-xs text-stone">
              <Shield size={16} className="text-muted-gold shrink-0" />
              <span>
                All dossiers are preserved in confidential atelier archives for lifetime reference.
              </span>
            </div>
          </div>

          {/* Right Blueprint Graphic Showcase */}
          <div ref={showcaseRef} className="lg:col-span-6">
            <Card className="p-4 sm:p-6 bg-obsidian border-border-medium relative shadow-ambient">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-subtle text-xs">
                <span className="font-cinzel text-muted-gold tracking-widest">
                  CLIENT ARCHIVE // SPEC. 04
                </span>
                <span className="inline-flex items-center gap-1.5 text-champagne">
                  <Download size={12} />
                  <span>Interactive Dossier</span>
                </span>
              </div>

              <img
                src="/assets/blueprint-dossier.svg"
                alt="STYLEORA Blueprint Dossier Sample"
                className="w-full h-auto border border-border-subtle opacity-95 transition-opacity hover:opacity-100"
                loading="lazy"
              />

              <div className="mt-4 pt-3 border-t border-border-subtle flex justify-between items-center text-xs text-stone">
                <span>Format: Ultra-HD Digital Dossier</span>
                <span className="text-warm-ivory font-medium">Delivered in 5 Business Days</span>
              </div>
            </Card>
          </div>
        </div>
      </AtelierContainer>
    </section>
  );
};
