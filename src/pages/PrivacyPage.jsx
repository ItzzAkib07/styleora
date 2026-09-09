import React from 'react';
import { AtelierContainer, SectionHeading, SEO } from '@/components/ui';

export const PrivacyPage = () => {
  return (
    <>
      <SEO
        title="Privacy Policy — Confidentiality & Data Protection"
        description="STYLEORA client privacy and confidentiality policy. Learn how our personal style atelier protects your photographic records, measurements, and personal data."
      />

      <div className="pt-32 pb-24 md:pt-40 md:pb-32">
        <AtelierContainer size="narrow">
          <SectionHeading
            align="left"
            eyebrow="Confidentiality & Data"
            title="Privacy Policy."
            subtitle="Last Revised: September 2026 • Policy Version 1.2"
          />

          <div className="text-ivory-muted text-sm sm:text-base leading-relaxed flex flex-col gap-8 font-light">
            <section>
              <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                1. Institutional Commitment to Confidentiality
              </h3>
              <p>
                STYLEORA operates as an exclusive, private personal styling atelier. We recognize that wardrobe curation, body proportions, and lifestyle disclosures are inherently intimate. We maintain stringent technical and organizational standards to safeguard every piece of client information entrusted to our care.
              </p>
            </section>

            <section>
              <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                2. Information Gathered
              </h3>
              <p className="mb-3">
                To conduct tailored styling consultations and generate bespoke dossiers, we collect only strictly necessary data:
              </p>
              <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
                <li><strong className="text-warm-ivory font-medium">Contact Identification:</strong> Full name, professional title, email address, phone number, and city location.</li>
                <li><strong className="text-warm-ivory font-medium">Intake Imagery:</strong> Photographs of representative garments and reference posture images provided during confidential intake.</li>
                <li><strong className="text-warm-ivory font-medium">Measurement Guidelines:</strong> Self-reported or tailor-measured silhouette metrics, shoe sizing, and optical preferences.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                3. Purpose of Processing
              </h3>
              <p>
                Your information is used solely to calibrate facial geometry, silhouette balance, and chromatic harmonies, and to coordinate calendar scheduling. We never sell, rent, license, or barter client data to third parties, advertising platforms, or fashion retailers.
              </p>
            </section>

            <section>
              <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                4. Payment Processing Security
              </h3>
              <p>
                Consultation reservation fees are processed exclusively through certified PCI-DSS Level 1 compliant gateways (including Razorpay). STYLEORA does not store, process, or transmit credit card numbers, debit credentials, or sensitive banking passwords on our application servers.
              </p>
            </section>

            <section>
              <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                5. Data Retention & Archival
              </h3>
              <p>
                Your styling dossiers remain archived in your private encrypted atelier vault for lifetime reference. You may at any time request permanent purging of photographic intake assets by notifying our privacy officer at <span className="text-champagne">atelier@styleora.luxury</span>.
              </p>
            </section>
          </div>
        </AtelierContainer>
      </div>
    </>
  );
};
