import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export const Footer = () => {
  return (
    <footer className="bg-charcoal border-t border-border-subtle pt-20 pb-12 mt-auto">
      <div className="atelier-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-border-subtle">
          {/* Atelier Brand Column */}
          <div>
            <span className="font-editorial text-[1.8rem] tracking-editorial-wide text-warm-ivory block mb-2">
              STYLEORA
            </span>
            <p className="text-[0.75rem] tracking-editorial-ultra text-muted-gold uppercase mb-5 font-medium">
              Personal Style Atelier
            </p>
            <p className="text-sm text-stone leading-[1.7] max-w-[320px]">
              An intentional personal styling experience designed around your proportions, palette, presence, and lifestyle.
            </p>
          </div>

          {/* Navigation Column */}
          <div>
            <h4 className="text-[0.75rem] tracking-editorial-ultra text-muted-gold uppercase mb-5 font-medium">
              The Atelier
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              <li>
                <Link to={ROUTES.ABOUT} className="text-sm text-ivory-muted hover:text-champagne transition-colors">
                  Brand Philosophy
                </Link>
              </li>
              <li>
                <Link to={ROUTES.HOW_IT_WORKS} className="text-sm text-ivory-muted hover:text-champagne transition-colors">
                  The Method
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CONSULTATION} className="text-sm text-ivory-muted hover:text-champagne transition-colors">
                  Private Consultation
                </Link>
              </li>
              <li>
                <Link to={ROUTES.FAQ} className="text-sm text-ivory-muted hover:text-champagne transition-colors">
                  Journal & FAQ
                </Link>
              </li>
            </ul>
          </div>

            {/* Concierge & Inquiries */}
            <div>
              <h4 className="text-[0.75rem] tracking-editorial-ultra text-muted-gold uppercase mb-5 font-medium">
                Private Concierge
              </h4>
              <p className="text-sm text-champagne mb-2 font-medium select-all">
                atelier@styleora.luxury
              </p>
              <p className="text-sm text-stone leading-[1.6] mb-4 font-light">
                Direct private styling consultations booked strictly by reservation.
              </p>
              <Link to={ROUTES.CONTACT} className="text-xs text-muted-gold uppercase tracking-editorial-wide hover:text-champagne transition-colors">
                Contact Concierge Desk →
              </Link>
            </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-[0.75rem] tracking-editorial-ultra text-muted-gold uppercase mb-5 font-medium">
              Policies & Terms
            </h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              <li>
                <Link to={ROUTES.PRIVACY} className="text-sm text-stone hover:text-champagne transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to={ROUTES.TERMS} className="text-sm text-stone hover:text-champagne transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to={ROUTES.REFUND_POLICY} className="text-sm text-stone hover:text-champagne transition-colors">
                  Refund & Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-wrap justify-between items-center gap-4 text-[0.78rem] text-stone-dark">
          <p>© {new Date().getFullYear()} STYLEORA. All rights reserved.</p>
          <p className="tracking-[0.05em]">Personal Style Atelier — Module 1 Production Build</p>
        </div>
      </div>
    </footer>
  );
};
