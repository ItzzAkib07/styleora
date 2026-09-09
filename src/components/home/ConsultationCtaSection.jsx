import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { AtelierContainer, Eyebrow, Button } from '@/components/ui';

export const ConsultationCtaSection = () => {
  return (
    <section className="py-24 md:py-32 border-t border-border-subtle bg-gradient-to-b from-charcoal/60 to-obsidian relative overflow-hidden text-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-muted-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <AtelierContainer size="narrow">
        <div className="mb-6 flex justify-center">
          <Eyebrow>Exclusive Atelier Intake</Eyebrow>
        </div>

        <h2 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.1] text-warm-ivory mb-6 tracking-tight">
          Begin Your Wardrobe Architecture.
        </h2>

        <p className="text-stone text-base sm:text-lg font-light leading-relaxed max-w-xl mx-auto mb-10">
          Step beyond reactive consumption. Commission your private personal style blueprint and establish a lifetime of effortless, commanding presence.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          <Button to={ROUTES.CONSULTATION} variant="primary" size="lg" icon={ArrowUpRight}>
            Reserve Your Consultation
          </Button>
          <Button to={ROUTES.CONTACT} variant="outline" size="lg">
            Speak with Concierge
          </Button>
        </div>
      </AtelierContainer>
    </section>
  );
};
