import React from 'react';
import { ArrowUpRight, Camera, Video, FileCheck, MessageSquare } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { AtelierContainer, SectionHeading, Card, Button, SEO } from '@/components/ui';

export const HowItWorksPage = () => {
  const steps = [
    {
      num: '01',
      icon: Camera,
      title: 'Digital Intake & Visual Calibration',
      timing: 'Upon Reservation • 15 Minutes',
      desc: 'Following confirmation, you complete our confidential intake dossier. You photograph 5–10 representative garments currently in your rotation and specify primary lifestyle requirements.',
      inclusions: [
        'Confidential lifestyle questionnaire',
        'Natural-light photographic guideline',
        'Color preference & sensitivity check',
      ],
    },
    {
      num: '02',
      icon: Video,
      title: 'The Private Atelier Consultation',
      timing: 'Scheduled At Your Convenience • 90 Minutes',
      desc: 'Connect with your assigned senior stylist in an unhurried virtual session. Using specialized screen-sharing tools, we perform optical face-geometry mapping, silhouette drape grading, and live chromatic testing.',
      inclusions: [
        'Live facial geometry & proportions breakdown',
        'Seasonal undertone & contrast validation',
        'Direct audit of key wardrobe questions',
      ],
    },
    {
      num: '03',
      icon: FileCheck,
      title: 'Dossier Synthesis & Delivery',
      timing: 'Delivered in 5 Business Days',
      desc: 'Our master stylists synthesize the consultation data to craft your comprehensive Styleora Blueprint—a high-resolution 30+ page personal style guide with exact brand links and tailoring metrics.',
      inclusions: [
        '30-Piece modular capsule plan (120+ combinations)',
        '8-Color signature swatch cards with fabric weights',
        'Exact garment tailoring alteration guide',
      ],
    },
    {
      num: '04',
      icon: MessageSquare,
      title: 'Dedicated Concierge Styling Window',
      timing: '30 Days Post-Delivery',
      desc: 'Ensure flawless execution. For 30 days following dossier delivery, enjoy direct messaging access with your stylist to review new acquisitions, verify fits, and calibrate upcoming event looks.',
      inclusions: [
        'Direct stylist messaging channel',
        'Fitting feedback on newly acquired pieces',
        'High-stakes event outfit confirmation',
      ],
    },
  ];

  return (
    <>
      <SEO
        title="The Atelier Method — Structured Styling Intelligence"
        description="Discover the four-phase methodology guiding every STYLEORA personal styling consultation. Analytical precision, bespoke dossiers, and 30 days of direct concierge access."
      />

      <div className="pt-32 pb-24 md:pt-40 md:pb-32">
        <AtelierContainer size="narrow">
          <SectionHeading
            align="left"
            eyebrow="The Atelier Method"
            title="A Method of Uncompromising Distinction."
            subtitle="From initial intake to lifetime wardrobe architecture, our consultation methodology is engineered for clarity, discretion, and lasting poise."
          />

          {/* Chronological Steps */}
          <div className="flex flex-col gap-8 mb-16">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.num} className="p-8 sm:p-10">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <span className="font-editorial text-4xl text-muted-gold leading-none">
                        {step.num}
                      </span>
                      <div className="w-10 h-10 border border-border-medium flex items-center justify-center text-champagne bg-obsidian">
                        <Icon size={18} />
                      </div>
                    </div>
                    <span className="font-cinzel text-xs text-muted-gold tracking-wider uppercase">
                      {step.timing}
                    </span>
                  </div>

                  <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                    {step.title}
                  </h3>

                  <p className="text-ivory-muted text-sm sm:text-base leading-relaxed font-light mb-6">
                    {step.desc}
                  </p>

                  <div className="pt-4 border-t border-border-subtle/60">
                    <p className="text-xs text-stone uppercase tracking-wider mb-2">Phase Deliverables:</p>
                    <ul className="list-disc list-inside text-xs sm:text-sm text-ivory-muted font-light flex flex-col gap-1.5">
                      {step.inclusions.map((inc) => (
                        <li key={inc}>{inc}</li>
                      ))}
                    </ul>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Bottom Action */}
          <div className="p-8 border border-border-subtle bg-charcoal text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-editorial text-2xl text-warm-ivory mb-1 font-normal">
                Ready to Commission Your Blueprint?
              </h4>
              <p className="text-stone text-sm font-light">
                Consultation slots are reserved strictly on a first-come queue.
              </p>
            </div>
            <Button to={ROUTES.CONSULTATION} variant="primary" size="lg" icon={ArrowUpRight}>
              Reserve Consultation
            </Button>
          </div>
        </AtelierContainer>
      </div>
    </>
  );
};
