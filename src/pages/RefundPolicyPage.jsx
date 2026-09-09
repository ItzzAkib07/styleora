import React from 'react';
import { AtelierContainer, SectionHeading, SEO } from '@/components/ui';

export const RefundPolicyPage = () => {
  return (
    <>
      <SEO
        title="Refund & Cancellation Policy — STYLEORA Atelier"
        description="STYLEORA consultation cancellation and refund terms. Learn about our 100% refund guarantee prior to scheduling confirmation."
      />

      <div className="pt-32 pb-24 md:pt-40 md:pb-32">
        <AtelierContainer size="narrow">
          <SectionHeading
            align="left"
            eyebrow="Cancellation & Guarantees"
            title="Refund & Cancellation Policy."
            subtitle="Last Revised: September 2026 • Policy Version 1.2"
          />

          <div className="text-ivory-muted text-sm sm:text-base leading-relaxed flex flex-col gap-8 font-light">
            <section>
              <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                1. Overview & Limited Intake Policy
              </h3>
              <p>
                Due to the bespoke nature of our personal styling preparations and strictly limited client intake (maximum 20 clients per month), STYLEORA enforces a structured, fair cancellation policy that balances client flexibility with master stylist reservation time.
              </p>
            </section>

            <section>
              <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                2. Cancellations Prior to Scheduling Confirmation
              </h3>
              <p>
                If you elect to cancel your consultation reservation before a calendar slot has been mutually selected and scheduled with our styling concierge, you are entitled to a <strong className="text-warm-ivory font-medium">100% full refund</strong>. Refunds are automatically remitted to your original payment method within 5–7 business days.
              </p>
            </section>

            <section>
              <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                3. Rescheduling Confirmed Consultations
              </h3>
              <p>
                You may reschedule your confirmed consultation appointment without penalty by providing written notice to our concierge at least <strong className="text-warm-ivory font-medium">48 hours prior</strong> to the scheduled session time. Rescheduling requests with less than 48 hours notice may be subject to a ₹5,000 stylist re-booking fee.
              </p>
            </section>

            <section>
              <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                4. Completed Consultations
              </h3>
              <p>
                Once a consultation session has been conducted and custom dossier preparation has commenced, fees become non-refundable as intellectual labor and professional time have been fully expended.
              </p>
            </section>

            <section>
              <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                5. Initiating a Refund or Reschedule
              </h3>
              <p>
                To request a cancellation, refund, or date adjustment, email <span className="text-champagne font-medium">atelier@styleora.luxury</span> with your reservation identifier. Our concierge will attend to your request within one business day.
              </p>
            </section>
          </div>
        </AtelierContainer>
      </div>
    </>
  );
};
