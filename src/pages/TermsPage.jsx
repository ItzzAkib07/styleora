import React from 'react';
import { AtelierContainer, SectionHeading, SEO } from '@/components/ui';

export const TermsPage = () => {
  return (
    <>
      <SEO
        title="Terms of Service — Client Engagement Agreement"
        description="STYLEORA Terms of Service governing personal styling consultations, intellectual property of Styleora Blueprints, and client service standards."
      />

      <div className="pt-32 pb-24 md:pt-40 md:pb-32">
        <AtelierContainer size="narrow">
          <SectionHeading
            align="left"
            eyebrow="Service Agreement"
            title="Terms of Service."
            subtitle="Last Revised: September 2026 • Agreement Version 1.2"
          />

          <div className="text-ivory-muted text-sm sm:text-base leading-relaxed flex flex-col gap-8 font-light">
            <section>
              <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                1. Acceptance of Terms
              </h3>
              <p>
                By commissioning an atelier styling consultation through STYLEORA, you agree to be bound by these Terms of Service. STYLEORA provides high-touch aesthetic advisory, silhouette proportion analysis, and tailored wardrobe guidance.
              </p>
            </section>

            <section>
              <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                2. Nature of Advisory Services
              </h3>
              <p>
                STYLEORA is an independent personal style advisory firm. We do not manufacture garments, sell retail clothing inventory, or act as an agent for fashion retailers. All acquisition recommendations reflect our stylists’ independent aesthetic discernment.
              </p>
            </section>

            <section>
              <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                3. Consultation Scheduling Protocol
              </h3>
              <p>
                Submitting a consultation reservation establishes your place in our atelier queue. Confirmation of your actual virtual appointment occurs once our styling concierge mutually coordinates an exclusive calendar slot with you.
              </p>
            </section>

            <section>
              <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                4. Intellectual Property of Styleora Blueprints
              </h3>
              <p>
                All digital dossiers, custom proportion blueprints, color swatch matrices, and diagnostic materials produced by STYLEORA remain the exclusive intellectual property of STYLEORA. You are granted an irrevocable, personal, non-commercial license to utilize the blueprint for your own wardrobe curation.
              </p>
            </section>

            <section>
              <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                5. Client Responsibilities
              </h3>
              <p>
                Accurate proportion mapping requires truthful intake measurements and clear reference photography under natural lighting. STYLEORA is not responsible for fit discrepancies resulting from inaccurate client-submitted measurements.
              </p>
            </section>
          </div>
        </AtelierContainer>
      </div>
    </>
  );
};
