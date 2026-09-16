import React from 'react';
import { Check, ArrowUpRight, Sparkles, Plus } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { CORE_PACKAGE, ADD_ONS } from '@/constants/packages';
import { AtelierContainer, SectionHeading, Button } from '@/components/ui';

export const PackagesSection = () => {
  return (
    <section className="py-20 md:py-28 border-t border-border-subtle bg-charcoal/40 relative">
      <AtelierContainer>
        <SectionHeading
          eyebrow="The STYLEORA Experience"
          title="One Considered Experience. Infinite Expression."
          subtitle="Your personalised style identity, distilled into one considered blueprint — created around your features, proportions, colouring, lifestyle and the way you want to show up."
        />

        {/* Core Experience Hero Card */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-charcoal border-2 border-champagne p-8 sm:p-14 relative shadow-elevated overflow-hidden">
            {/* Ambient Gold Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-muted-gold/10 rounded-full blur-3xl pointer-events-none" />

            {/* Badge */}
            <div className="absolute top-0 right-8 transform -translate-y-1/2 px-4 py-1 bg-champagne text-obsidian text-[0.65rem] tracking-editorial-ultra uppercase font-bold shadow-md">
              Primary Atelier Experience
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10 pb-8 border-b border-border-subtle">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-cinzel text-xs text-muted-gold tracking-widest uppercase">
                    {CORE_PACKAGE.tier}
                  </span>
                  <span className="text-xs text-stone">•</span>
                  <span className="text-xs text-stone">{CORE_PACKAGE.duration}</span>
                </div>

                <h3 className="font-editorial text-3xl sm:text-4xl text-warm-ivory mb-4 font-normal">
                  {CORE_PACKAGE.name}
                </h3>

                <p className="text-ivory-muted text-sm sm:text-base font-light leading-relaxed max-w-xl">
                  {CORE_PACKAGE.desc}
                </p>
              </div>

              <div className="md:text-right shrink-0">
                <span className="font-editorial text-4xl sm:text-5xl text-champagne font-normal block">
                  {CORE_PACKAGE.price}
                </span>
                <span className="text-stone text-xs block mt-1">
                  Complete styling experience • Inclusive of all deliverables
                </span>
              </div>
            </div>

            {/* Core Inclusions Matrix */}
            <div className="mb-10">
              <p className="text-xs tracking-editorial-ultra text-muted-gold uppercase font-medium mb-5 flex items-center gap-2">
                <Sparkles size={13} className="text-champagne" />
                What is Included in Your Signature Blueprint
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {CORE_PACKAGE.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-3 text-sm text-ivory-muted font-light leading-relaxed">
                    <Check size={16} className="text-muted-gold shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-6 border-t border-border-subtle/60 flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-xs text-stone font-light">
                Private 1:1 consultation held via encrypted high-definition video session.
              </p>
              <Button
                to={ROUTES.CONSULTATION}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                icon={ArrowUpRight}
              >
                Commission Your Blueprint
              </Button>
            </div>
          </div>
        </div>

        {/* Optional Add-ons Header */}
        <div className="max-w-4xl mx-auto mb-10 text-center">
          <span className="text-xs tracking-editorial-ultra text-muted-gold uppercase font-semibold block mb-2">
            Optional Enhancements
          </span>
          <h3 className="font-editorial text-2xl sm:text-3xl text-warm-ivory font-normal mb-3">
            Enhance Your Experience.
          </h3>
          <p className="text-stone text-sm max-w-xl mx-auto font-light">
            Complement your Signature Blueprint with specialized add-on sessions focused on closet detox, intentional shopping, or tailored beauty.
          </p>
        </div>

        {/* Optional Add-ons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {ADD_ONS.map((addon) => (
            <div
              key={addon.id}
              className="bg-charcoal/80 border border-border-subtle p-6 sm:p-8 flex flex-col justify-between hover:border-border-medium transition-colors relative"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[0.65rem] tracking-editorial-ultra text-muted-gold uppercase font-semibold">
                    Optional Add-on
                  </span>
                  <span className="font-editorial text-lg text-champagne">
                    {addon.price}
                  </span>
                </div>

                <h4 className="font-editorial text-xl text-warm-ivory mb-1 font-normal">
                  {addon.name}
                </h4>

                <p className="text-[0.72rem] text-champagne/80 font-serif italic mb-3">
                  "{addon.tagline}"
                </p>

                <p className="text-ivory-muted text-xs leading-relaxed font-light mb-5">
                  {addon.desc}
                </p>

                <div className="pt-4 border-t border-border-subtle/50 mb-6">
                  <ul className="list-none p-0 m-0 space-y-2">
                    {addon.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-stone font-light">
                        <Plus size={12} className="text-muted-gold shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle/40 flex items-center justify-between text-xs text-stone">
                <span>{addon.duration}</span>
                <span className="text-[0.65rem] tracking-editorial-wide text-muted-gold uppercase">
                  Available in Booking
                </span>
              </div>
            </div>
          ))}
        </div>
      </AtelierContainer>
    </section>
  );
};
