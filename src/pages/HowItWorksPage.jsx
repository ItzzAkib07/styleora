import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { METHOD_STAGES } from '@/constants/method';
import { AtelierContainer, SectionHeading, Card, Button, SEO } from '@/components/ui';
import { AtmosphericBackground } from '@/components/background';

export const HowItWorksPage = () => {
  return (
    <>
      <SEO
        title="The STYLEORA Method — Structured Styling Intelligence"
        description="Discover the 6-stage STYLEORA Method guiding the Signature Blueprint: Discover, Define, Curate, Build, Polish, and Your Style Guide."
      />

      <div className="pt-32 pb-24 md:pt-40 md:pb-32 relative overflow-hidden">
        {/* Method Journey Atmosphere */}
        <AtmosphericBackground variant="method" intensity="subtle" />

        <AtelierContainer size="narrow">
          <SectionHeading
            align="left"
            eyebrow="The STYLEORA Atelier Method"
            title="A Method of Uncompromising Distinction."
            subtitle="Personal style is more than what looks good. It is the relationship between who you are, how you live and how you want to be seen. Our Atelier Method brings those elements together into a style direction that feels distinctly yours."
          />

          {/* Chronological Stages */}
          <div className="flex flex-col gap-6 mb-16">
            {METHOD_STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <Card key={stage.num} className="p-8 sm:p-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 border border-border-medium flex items-center justify-center text-champagne bg-obsidian shrink-0">
                      <Icon size={18} />
                    </div>
                    <h3 className="font-editorial text-2xl sm:text-3xl text-warm-ivory font-normal">
                      {stage.fullTitle}
                    </h3>
                  </div>

                  <p className="text-ivory-muted text-sm sm:text-base leading-relaxed font-light">
                    {stage.desc}
                  </p>
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
                STYLEORA Signature Blueprint — Complete personal styling experience for ₹2,799.
              </p>
            </div>
            <Button to={ROUTES.CONSULTATION} variant="primary" size="lg" icon={ArrowUpRight}>
              Commission Your Blueprint
            </Button>
          </div>
        </AtelierContainer>
      </div>
    </>
  );
};
