import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { ROUTES, NAV_LINKS } from '@/constants/routes';

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile navigation on route change or Escape key
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          scrolled
            ? 'bg-obsidian/90 backdrop-blur-md border-b border-border-subtle py-3.5'
            : 'bg-transparent border-b border-transparent py-6'
        }`}
      >
        <div className="w-full px-6 sm:px-10 lg:px-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to={ROUTES.HOME}
            className="flex flex-col no-underline"
            aria-label="STYLEORA Atelier Home"
          >
            <span className="font-editorial text-[1.65rem] font-normal tracking-editorial-wide text-warm-ivory leading-none">
              STYLEORA
            </span>
            <span className="text-[0.62rem] tracking-editorial-ultra text-muted-gold uppercase mt-1 font-medium">
              Personal Style Atelier
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden min-[1024px]:flex items-center gap-5 xl:gap-7"
            aria-label="Main Navigation"
          >
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[0.8rem] tracking-[0.11em] uppercase transition-colors duration-300 py-1 ${
                    isActive ? 'text-champagne' : 'text-ivory-muted hover:text-champagne'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            className="min-[1024px]:hidden flex items-center justify-center p-2 bg-transparent border border-border-medium text-warm-ivory cursor-pointer focus-visible:outline-2 focus-visible:outline-champagne"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Overlay */}
      {mobileOpen && (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Site Navigation"
          className="fixed inset-0 bg-obsidian z-40 flex flex-col justify-center p-8"
        >
          <div className="flex flex-col gap-8 max-w-md mx-auto w-full">
            <p className="text-[0.7rem] tracking-editorial-ultra text-muted-gold uppercase">
              Navigation
            </p>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`font-editorial text-3xl no-underline transition-colors ${
                  location.pathname === link.path ? 'text-champagne' : 'text-warm-ivory hover:text-champagne'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-6 pt-6 border-t border-border-subtle">
              <Link
                to={ROUTES.CONSULTATION}
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center gap-2 w-full px-7 py-3.5 bg-champagne text-obsidian text-[0.85rem] tracking-[0.14em] font-semibold uppercase hover:bg-warm-ivory transition-colors"
              >
                <span>Reserve Consultation</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
