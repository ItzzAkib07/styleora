import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { AtelierContainer, SectionHeading, Accordion, Button } from '@/components/ui';
import { AtmosphericBackground } from '@/components/background';

export const HomeFaqSection = () => {
  const faqs = [
    {
      q: 'How are consultation appointments scheduled?',
      a: 'Following your reservation, our private styling concierge personally reaches out within 24 hours to present exclusive available slots. You select your preferred consultation time directly with our concierge team.',
    },
    {
      q: 'Where do consultations take place?',
      a: 'Consultations are conducted one-on-one via private high-definition video sessions with dedicated screen-sharing for chromatic testing, facial geometry charts, and real-time wardrobe architecture review.',
    },
    {
      q: 'Do you sell or ship clothes directly?',
      a: 'No. STYLEORA is an independent personal style atelier. We never hold retail stock or accept brand kickbacks. We provide exact brand links and tailor-specification sheets so you can acquire pieces freely according to your budget.',
    },
    {
      q: 'What should I prepare prior to the session?',
      a: 'You will receive a minimal digital intake form after reservation that guides you through photographing 5–10 key pieces currently in your rotation and detailing your primary lifestyle priorities.',
    },
    {
      q: 'Can I reschedule if an unforeseen conflict arises?',
      a: 'Yes. We accommodate rescheduling requests made with at least 48 hours notice prior to your scheduled consultation slot with no penalty.',
    },
  ];

  return (
    <section className="py-20 md:py-28 border-t border-border-subtle bg-obsidian relative overflow-hidden">
      {/* Editorial Clarifications Atmosphere */}
      <AtmosphericBackground variant="editorial" intensity="minimal" />

      <AtelierContainer size="narrow">
        <SectionHeading
          eyebrow="Inquiries & Clarity"
          title="Frequently Answered Inquiries."
          subtitle="Clear answers concerning our atelier protocol, scheduling mechanics, and styling deliverables."
        />

        <Accordion items={faqs} className="mb-12" />

        <div className="text-center">
          <Button to={ROUTES.FAQ} variant="ghost" size="md" icon={ArrowUpRight}>
            View All Inquiries in the Journal
          </Button>
        </div>
      </AtelierContainer>
    </section>
  );
};
