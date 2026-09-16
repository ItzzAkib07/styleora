import React from 'react';
import { Mail, Clock, Shield, ArrowUpRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { AtelierContainer, SectionHeading, Card, Button, SEO } from '@/components/ui';

export const ContactPage = () => {
  return (
    <>
      <SEO
        title="Contact Concierge — Private Atelier Inquiries"
        description="Connect with the STYLEORA private styling concierge for consultation inquiries, corporate bookings, and client service."
      />

      <div className="pt-32 pb-24 md:pt-40 md:pb-32">
        <AtelierContainer size="narrow">
          <SectionHeading
            align="left"
            eyebrow="Private Inquiries"
            title="Contact the Atelier."
            subtitle="Our private styling concierge is dedicated to assisting discerning clientele with reservations, custom corporate executive engagements, and client service."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
            {/* Concierge Desk */}
            <Card className="p-8 sm:p-10">
              <Mail size={24} className="text-muted-gold mb-6" />
              <span className="font-cinzel text-xs text-muted-gold tracking-widest uppercase block mb-1">
                PRIMARY DESK
              </span>
              <h3 className="font-editorial text-2xl text-warm-ivory mb-2 font-normal">
                Direct Concierge
              </h3>
              <a
                href="mailto:hello@styleora.me"
                className="text-champagne font-medium text-base mb-3 select-all hover:text-champagne/80 hover:underline transition-colors inline-block"
              >
                hello@styleora.me
              </a>
              <p className="text-stone text-xs sm:text-sm leading-relaxed font-light">
                For consultation inquiries, reservation queries, private client coordination, and press inquiries.
              </p>
            </Card>

            {/* Atelier Operating Hours */}
            <Card className="p-8 sm:p-10">
              <Clock size={24} className="text-muted-gold mb-6" />
              <span className="font-cinzel text-xs text-muted-gold tracking-widest uppercase block mb-1">
                AVAILABILITY
              </span>
              <h3 className="font-editorial text-2xl text-warm-ivory mb-2 font-normal">
                Atelier Hours
              </h3>
              <p className="text-warm-ivory font-medium text-base mb-1">
                Monday — Saturday
              </p>
              <p className="text-stone text-xs sm:text-sm leading-relaxed font-light mb-4">
                10:00 — 19:00 IST (By confirmed appointment only)
              </p>
              <p className="text-stone text-xs font-light">
                Consultation sessions outside standard hours can be arranged on special request.
              </p>
            </Card>
          </div>

          {/* Booking Notice Box */}
          <div className="p-8 border border-border-subtle bg-charcoal mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={18} className="text-muted-gold shrink-0" />
              <h4 className="font-editorial text-xl text-warm-ivory font-normal">
                Private Consultation Protocol
              </h4>
            </div>
            <p className="text-ivory-muted text-sm leading-relaxed font-light mb-6">
              To preserve uncompromised quality and focus for every client dossier, consultations are arranged strictly through scheduled reservations. We do not accommodate unannounced walk-ins or ad-hoc appointments.
            </p>
            <Button to={ROUTES.CONSULTATION} variant="primary" size="md" icon={ArrowUpRight}>
              Explore Consultation Tiers
            </Button>
          </div>
        </AtelierContainer>
      </div>
    </>
  );
};
