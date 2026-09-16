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
          eyebrow="Atelier Form & Silhouette"
          title="The Architecture of the Silhouette."
          subtitle="An interactive study in couture draping and anatomical proportion. An artistic metaphor expressing how structured tailoring and bias-cut textiles sculpt an empowering personal style."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
          {/* 3D WebGL Canvas — Hero-Level Viewport (70-85vh) */}
          <div className="lg:col-span-7 xl:col-span-8 min-h-[500px] h-[64vh] sm:h-[72vh] lg:h-[78vh] xl:h-[82vh] max-h-[880px] border border-border-subtle bg-gradient-to-b from-charcoal/90 via-charcoal/60 to-obsidian relative overflow-hidden flex flex-col justify-center items-center shadow-elevated">
            <AtelierSculpture className="w-full h-full" />
            
            {/* Editorial Metadata Overlays */}
            <div className="absolute top-4 left-4 sm:top-5 sm:left-5 text-[0.65rem] tracking-editorial-ultra text-muted-gold uppercase pointer-events-none">
              INTERACTIVE ATELIER CANVAS // 60 FPS
            </div>
            <div className="hidden sm:block absolute top-5 right-5 text-[0.65rem] tracking-editorial-ultra text-stone/80 uppercase pointer-events-none">
              ATELIER SPEC 1:1 // 360° INSPECT
            </div>
            <div className="hidden sm:block absolute bottom-4 left-5 text-[0.65rem] tracking-editorial-ultra text-stone/60 uppercase pointer-events-none">
              PROPORTION CALIBRATION // BESPOKE
            </div>
            <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 text-[0.65rem] tracking-editorial-ultra text-muted-gold uppercase pointer-events-none">
              DRAG TO ROTATE 360°
            </div>
          </div>

          {/* Right Narrative Specifications */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5">
            <div className="p-6 border border-border-subtle bg-charcoal/80 transition-colors duration-300 hover:border-border-medium">
              <span className="font-cinzel text-xs text-muted-gold tracking-widest block mb-1">
                SILHOUETTE SPEC. I
              </span>
              <h4 className="font-editorial text-2xl text-warm-ivory mb-2 font-normal">
                Couture Draping & Proportions
              </h4>
              <p className="text-ivory-muted text-sm font-light leading-relaxed">
                Garments should elevate rather than conceal the body. Through precise bias-cut draping, fabric cascades along natural anatomical contours, elongating the posture and creating an effortless sense of poise.
              </p>
            </div>

            <div className="p-6 border border-border-subtle bg-charcoal/80 transition-colors duration-300 hover:border-border-medium">
              <span className="font-cinzel text-xs text-muted-gold tracking-widest block mb-1">
                SILHOUETTE SPEC. II
              </span>
              <h4 className="font-editorial text-2xl text-warm-ivory mb-2 font-normal">
                Tactile Materiality & Contrast
              </h4>
              <p className="text-ivory-muted text-sm font-light leading-relaxed">
                A curated wardrobe thrives on sensory balance. The tactile dialogue between matte tailored crepe, liquid champagne silks, and brushed metal accents mirrors the sophisticated layering of a bespoke capsule collection.
              </p>
            </div>

            <div className="p-6 border border-border-subtle bg-charcoal/80 transition-colors duration-300 hover:border-border-medium">
              <span className="font-cinzel text-xs text-muted-gold tracking-widest block mb-1">
                SILHOUETTE SPEC. III
              </span>
              <h4 className="font-editorial text-2xl text-warm-ivory mb-2 font-normal">
                Anatomical Architecture
              </h4>
              <p className="text-ivory-muted text-sm font-light leading-relaxed">
                Personal style is architectural. By calibrating the golden ratio between shoulder breadth, waistline cinch, and hem trajectory, every ensemble is engineered to empower your authentic presence.
              </p>
            </div>
          </div>
        </div>
      </AtelierContainer>
    </section>
  );
};
