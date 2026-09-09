import React from 'react';
import { AtelierContainer, SectionHeading } from '@/components/ui';
import { AtelierSculpture } from '@/components/3d/AtelierSculpture';

export const AtelierSculptureSection = () => {
  return (
    <section className="py-24 md:py-32 border-t border-border-subtle bg-obsidian relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-muted-gold/5 rounded-full blur-[140px] pointer-events-none" />

      <AtelierContainer>
        <SectionHeading
          eyebrow="Interactive 3D Geometry"
          title="The Sculpture of Personal Architecture."
          subtitle="An interactive metaphor of style equilibrium. An infinite Mobius form expressing the unbroken harmony between facial geometry, anatomical drape, and chromatic resonance."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-6xl mx-auto">
          {/* 3D WebGL Canvas */}
          <div className="lg:col-span-7 h-[420px] sm:h-[480px] border border-border-subtle bg-charcoal/60 relative overflow-hidden">
            <AtelierSculpture className="w-full h-full" />
            <div className="absolute top-4 left-4 text-[0.65rem] tracking-editorial-ultra text-muted-gold uppercase">
              INTERACTIVE ATELIER CANVAS // 60 FPS
            </div>
            <div className="absolute bottom-4 right-4 text-[0.65rem] tracking-editorial-ultra text-stone uppercase">
              ROTATE WITH CURSOR
            </div>
          </div>

          {/* Right Narrative Notes */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="p-6 border border-border-subtle bg-charcoal">
              <span className="font-cinzel text-xs text-muted-gold tracking-widest block mb-1">
                EQUILIBRIUM SPEC. I
              </span>
              <h4 className="font-editorial text-2xl text-warm-ivory mb-2 font-normal">
                Continuous Anatomical Flow
              </h4>
              <p className="text-ivory-muted text-sm font-light leading-relaxed">
                Garments should never visually sever the body. Like the Mobius contour, proper tailoring creates an unbroken vertical trajectory that elongates and empowers.
              </p>
            </div>

            <div className="p-6 border border-border-subtle bg-charcoal">
              <span className="font-cinzel text-xs text-muted-gold tracking-widest block mb-1">
                EQUILIBRIUM SPEC. II
              </span>
              <h4 className="font-editorial text-2xl text-warm-ivory mb-2 font-normal">
                Reflectance & Texture Dynamics
              </h4>
              <p className="text-ivory-muted text-sm font-light leading-relaxed">
                Brushed champagne metals and obsidian matte surfaces mirror the contrast ratio between matte wools, raw silks, and polished leather accessories.
              </p>
            </div>
          </div>
        </div>
      </AtelierContainer>
    </section>
  );
};
