import React from 'react';
import { Lock, UserCheck, Scale, Sparkles } from 'lucide-react';
import { AtelierContainer, SectionHeading, Card } from '@/components/ui';

export const StylistAtelierSection = () => {
  const commitments = [
    {
      icon: UserCheck,
      title: 'Senior Master Stylists Only',
      desc: 'You consult directly with verified industry practitioners who possess deep expertise across bespoke tailoring, couture draping, and chromatic theory.',
    },
    {
      icon: Scale,
      title: 'Zero Brand Bias',
      desc: 'STYLEORA does not sell garments, hold retail inventory, or accept commissions from fashion houses. Our recommendations serve only your aesthetic interests.',
    },
    {
      icon: Lock,
      title: 'Absolute Discretion',
      desc: 'Your consultation recordings, measurements, photographic records, and styling blueprints are sealed under strict non-disclosure protections.',
    },
  ];

  return (
    <section className="py-20 md:py-28 border-t border-border-subtle bg-obsidian relative">
      <AtelierContainer>
        <div className="max-w-4xl mx-auto text-center mb-16">
          <SectionHeading
            eyebrow="The Atelier Distinction"
            title="A Human-Centric Master Atelier."
            subtitle="In an era of generic automated algorithms, true luxury remains intensely human. STYLEORA pairs technological measurement precision with the refined discernment of master personal stylists."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {commitments.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.title} hoverEffect className="text-center p-8 flex flex-col items-center">
                <div className="w-12 h-12 border border-border-medium flex items-center justify-center text-muted-gold mb-6 bg-charcoal">
                  <Icon size={20} />
                </div>
                <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                  {c.title}
                </h3>
                <p className="text-ivory-muted text-sm leading-relaxed font-light">
                  {c.desc}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Atelier Seal Card */}
        <div className="max-w-3xl mx-auto p-8 border border-border-subtle bg-charcoal/50 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 text-center sm:text-left">
          <img
            src="/assets/atelier-seal.svg"
            alt="STYLEORA Atelier Seal"
            className="w-24 h-24 shrink-0 opacity-90"
            loading="lazy"
          />
          <div>
            <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
              <Sparkles size={14} className="text-muted-gold" />
              <span className="font-cinzel text-xs text-muted-gold tracking-widest uppercase">
                STYLEORA PRIVATE CHARTER
              </span>
            </div>
            <h4 className="font-editorial text-xl text-warm-ivory mb-2 font-normal">
              Intake Limited to 20 Clients Per Calendar Month
            </h4>
            <p className="text-stone text-xs sm:text-sm font-light leading-relaxed">
              To guarantee individual attention and painstaking preparation for each client dossier, reservations are managed strictly through a dedicated queue.
            </p>
          </div>
        </div>
      </AtelierContainer>
    </section>
  );
};
