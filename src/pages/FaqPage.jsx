import React from 'react';
import { Mail } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { AtelierContainer, SectionHeading, Accordion, Button, SEO } from '@/components/ui';
import { AtmosphericBackground } from '@/components/background';

export const FaqPage = () => {
  const schedulingFaqs = [
    {
      q: 'How are consultation appointments scheduled?',
      a: 'Following your reservation confirmation, our private styling concierge directly reaches out to you within 24 hours to present exclusive available consultation slots. You choose your preferred date and time directly with our team.',
    },
    {
      q: 'Can I reschedule if an unforeseen conflict arises?',
      a: 'Yes. We understand executive schedules change. Rescheduling requests made with at least 48 hours notice prior to your scheduled consultation are accommodated at no additional charge.',
    },
    {
      q: 'What is the waitlist timeline for intake?',
      a: 'Because our master stylists take on a strictly limited number of clients per month (maximum 20), typical booking lead time is 7 to 14 business days from initial reservation.',
    },
  ];

  const consultationFaqs = [
    {
      q: 'Where do consultations take place?',
      a: 'Consultations are conducted one-on-one via private high-definition video sessions with dedicated screen-sharing for color grading, silhouette charts, and curated dossier review.',
    },
    {
      q: 'What should I prepare prior to the session?',
      a: 'You will receive a minimal photographic preparation guide after booking that helps you capture 5–10 key pieces currently in your rotation and articulate your immediate lifestyle priorities in our intake questionnaire.',
    },
    {
      q: 'Do I need to show my entire wardrobe during the video call?',
      a: 'No. You do not need to parade your closet on camera. The intake captures what your stylist needs beforehand, allowing the 30-minute private consultation to focus on your style goals, proportion principles, lifestyle context, and chromatic direction.',
    },
  ];

  const deliverableFaqs = [
    {
      q: 'What format is the Styleora Blueprint delivered in?',
      a: 'Your blueprint is delivered as an ultra-high-definition interactive digital style guide containing your personal style assessment, body & proportion analysis, personal colour direction, signature silhouettes & fits, personalised shopping guidance, 20 curated outfit ideas, accessories & footwear guidance, and hair & makeup direction.',
    },
    {
      q: 'Do you sell clothes directly or recommend specific stores?',
      a: 'We never sell garments or hold inventory. Our recommendations are objective, independent, and tailored to your lifestyle, proportions, and budget.',
    },
    {
      q: 'Can I add specialized sessions for wardrobe detox or beauty?',
      a: 'Yes. During consultation reservation, you can enhance your experience with optional add-on sessions: The Wardrobe Edit (₹1,499), The Shopping Edit (₹499), and The Beauty Atelier (₹1,499).',
    },
  ];

  const privacyFaqs = [
    {
      q: 'How is client confidentiality maintained?',
      a: 'All photographs, body measurements, session recordings, and styling dossiers are sealed under strict non-disclosure terms. Your personal data is never shared, marketed, or displayed publicly without explicit written consent.',
    },
    {
      q: 'Who has access to my styling archives?',
      a: 'Only your assigned master stylist and the lead atelier director have access to your consultation files. Files are encrypted and stored in secure private archives.',
    },
  ];

  return (
    <>
      <SEO
        title="Journal & Inquiries — Frequently Answered Questions"
        description="Comprehensive answers to all questions regarding the STYLEORA personal styling atelier, scheduling protocol, session preparation, and deliverable dossiers."
      />

      <div className="pt-32 pb-24 md:pt-40 md:pb-32 relative overflow-hidden">
        {/* Editorial Clarifications Atmosphere */}
        <AtmosphericBackground variant="editorial" intensity="minimal" />

        <AtelierContainer size="narrow">
          <SectionHeading
            align="left"
            eyebrow="Journal & Inquiries"
            title="Frequently Answered Inquiries."
            subtitle="Transparent clarity regarding our consultation methodology, preparation requirements, deliverable dossiers, and client discretion."
          />

          {/* Section 1: Scheduling */}
          <div className="mb-14">
            <h3 className="font-cinzel text-xs text-muted-gold tracking-widest uppercase mb-6 pb-2 border-b border-border-subtle">
              I. RESERVATION & SCHEDULING
            </h3>
            <Accordion items={schedulingFaqs} />
          </div>

          {/* Section 2: Consultation */}
          <div className="mb-14">
            <h3 className="font-cinzel text-xs text-muted-gold tracking-widest uppercase mb-6 pb-2 border-b border-border-subtle">
              II. THE ATELIER SESSION
            </h3>
            <Accordion items={consultationFaqs} />
          </div>

          {/* Section 3: Deliverables */}
          <div className="mb-14">
            <h3 className="font-cinzel text-xs text-muted-gold tracking-widest uppercase mb-6 pb-2 border-b border-border-subtle">
              III. DELIVERABLES & DOSSIER
            </h3>
            <Accordion items={deliverableFaqs} />
          </div>

          {/* Section 4: Privacy */}
          <div className="mb-16">
            <h3 className="font-cinzel text-xs text-muted-gold tracking-widest uppercase mb-6 pb-2 border-b border-border-subtle">
              IV. PRIVACY & DISCRETION
            </h3>
            <Accordion items={privacyFaqs} />
          </div>

          {/* Concierge Desk Callout */}
          <div className="p-8 border border-border-subtle bg-charcoal text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-editorial text-2xl text-warm-ivory mb-1 font-normal">
                Have an Unlisted Inquiry?
              </h4>
              <p className="text-stone text-sm font-light">
                Our private concierge is available Monday through Saturday.
              </p>
            </div>
            <Button to={ROUTES.CONTACT} variant="outline" size="md" icon={Mail}>
              Contact Concierge
            </Button>
          </div>
        </AtelierContainer>
      </div>
    </>
  );
};
