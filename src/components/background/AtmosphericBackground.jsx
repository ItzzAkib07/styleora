import React from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * AtmosphericBackground — STYLEORA Unified Background Motion Component
 * 
 * Provides subtle, slow, organic, and elegant background atmospheric motion
 * calibrated for luxury fashion editorial presence without overpowering foreground content.
 * 
 * Variants:
 * - 'hero': Cinematic atelier atmosphere with layered drifting radial glows
 * - 'editorial': Minimalist flowing light diffusion with soft warm ivory / gold wash
 * - 'method': Craft & process journey with slow directional ambient gradient
 * - 'blueprint': Curation & architecture with layered floating light fields
 * - 'outfit': Fashion editorial with soft moving shadows and subtle gradient washes
 * - 'transformation': Warm atmospheric glow supporting personal storytelling
 * - 'stats': Minimal soft light sweep keeping oversized numbers completely dominant
 * - 'invitation': Warm luxurious radial glow for consultation calls to action
 * - 'calm': Ultra-subtle ambient gradient for form pages with pristine legibility
 */
export const AtmosphericBackground = ({
  variant = 'editorial',
  intensity = 'subtle',
  className = '',
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Multiplier for intensity levels
  const opacityMultiplier =
    intensity === 'minimal' ? 'opacity-40' : intensity === 'pronounced' ? 'opacity-90' : 'opacity-70';

  if (prefersReducedMotion) {
    return (
      <div
        className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-radial-gradient from-muted-gold/5 to-transparent pointer-events-none" />
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${opacityMultiplier} ${className}`}
      aria-hidden="true"
    >
      {/* ------------------------------------------------------------------ */}
      {/* VARIANT: HERO                                                      */}
      {/* ------------------------------------------------------------------ */}
      {variant === 'hero' && (
        <>
          {/* Primary Top-Center Drifting Golden Halo */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[550px] sm:w-[750px] h-[550px] sm:h-[750px] bg-muted-gold/8 rounded-full blur-[110px] sm:blur-[160px] animate-aura-drift-1" />
          {/* Ambient Champagne Corner Drift */}
          <div className="absolute top-1/3 -right-24 w-[420px] sm:w-[580px] h-[420px] sm:h-[580px] bg-champagne/6 rounded-full blur-[100px] sm:blur-[150px] animate-aura-drift-2" />
          {/* Soft Bottom Breathing Shadow */}
          <div className="absolute -bottom-20 left-10 w-[380px] h-[380px] bg-muted-gold/5 rounded-full blur-[120px] animate-ambient-breathe" />
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VARIANT: EDITORIAL / BRAND POSITIONING                             */}
      {/* ------------------------------------------------------------------ */}
      {variant === 'editorial' && (
        <>
          <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-muted-gold/5 rounded-full blur-[120px] sm:blur-[150px] animate-aura-drift-1" />
          <div className="absolute bottom-10 -right-20 w-[460px] h-[460px] bg-champagne/5 rounded-full blur-[110px] sm:blur-[140px] animate-aura-drift-2" />
          <div className="absolute top-2/3 left-1/3 w-[320px] h-[320px] bg-muted-gold/3 rounded-full blur-[100px] animate-ambient-breathe" />
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VARIANT: METHOD / PROCESS JOURNEY                                  */}
      {/* ------------------------------------------------------------------ */}
      {variant === 'method' && (
        <>
          {/* Subtle directional progression gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-muted-gold/[0.025] to-transparent animate-gradient-shift opacity-60" />
          {/* Step Progression Ambient Glows */}
          <div className="absolute top-10 right-1/4 w-[480px] h-[480px] bg-champagne/6 rounded-full blur-[130px] animate-aura-drift-2" />
          <div className="absolute bottom-16 left-10 w-[420px] h-[420px] bg-muted-gold/5 rounded-full blur-[120px] animate-aura-drift-1" />
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VARIANT: BLUEPRINT / CURATION & ARCHITECTURE                       */}
      {/* ------------------------------------------------------------------ */}
      {variant === 'blueprint' && (
        <>
          <div className="absolute -top-16 right-1/3 w-[520px] h-[520px] bg-muted-gold/7 rounded-full blur-[130px] sm:blur-[160px] animate-aura-drift-1" />
          <div className="absolute bottom-10 left-12 w-[480px] h-[480px] bg-champagne/6 rounded-full blur-[120px] sm:blur-[150px] animate-aura-drift-2" />
          {/* Central subtle highlight for dossier graphics */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-muted-gold/4 rounded-full blur-[110px] animate-ambient-breathe" />
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VARIANT: OUTFIT / LOOK EDIT                                        */}
      {/* ------------------------------------------------------------------ */}
      {variant === 'outfit' && (
        <>
          <div className="absolute top-12 left-10 w-[440px] h-[440px] bg-champagne/5 rounded-full blur-[120px] animate-aura-drift-2" />
          <div className="absolute bottom-12 right-12 w-[520px] h-[520px] bg-muted-gold/6 rounded-full blur-[130px] animate-aura-drift-1" />
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VARIANT: TRANSFORMATION / CLIENT STORIES                           */}
      {/* ------------------------------------------------------------------ */}
      {variant === 'transformation' && (
        <>
          <div className="absolute top-1/4 -right-16 w-[560px] h-[560px] bg-muted-gold/7 rounded-full blur-[140px] sm:blur-[170px] animate-aura-drift-1" />
          <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-champagne/6 rounded-full blur-[130px] sm:blur-[160px] animate-aura-drift-2" />
          <div className="absolute top-2/3 right-1/3 w-[360px] h-[360px] bg-muted-gold/4 rounded-full blur-[120px] animate-ambient-breathe" />
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VARIANT: STATS / CALIBRATED PRECISION                              */}
      {/* ------------------------------------------------------------------ */}
      {variant === 'stats' && (
        <>
          {/* Subtle minimal light sweep across the open metrics */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[400px] bg-muted-gold/5 rounded-full blur-[140px] animate-aura-drift-1" />
          <div className="absolute bottom-0 right-10 w-[500px] h-[350px] bg-champagne/4 rounded-full blur-[120px] animate-ambient-breathe" />
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VARIANT: INVITATION / CONSULTATION CTA                             */}
      {/* ------------------------------------------------------------------ */}
      {variant === 'invitation' && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[700px] h-[550px] sm:h-[700px] bg-muted-gold/8 rounded-full blur-[130px] sm:blur-[180px] animate-aura-drift-1" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-champagne/6 rounded-full blur-[120px] animate-ambient-breathe" />
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* VARIANT: CALM / FORM & LEGAL PAGES                                 */}
      {/* ------------------------------------------------------------------ */}
      {variant === 'calm' && (
        <>
          {/* Ultra-subtle, non-distracting ambient aura for forms and reading */}
          <div className="absolute top-1/4 right-10 w-[450px] h-[450px] bg-muted-gold/[0.035] rounded-full blur-[150px] animate-ambient-breathe" />
          <div className="absolute bottom-1/3 left-10 w-[420px] h-[420px] bg-champagne/[0.03] rounded-full blur-[140px] animate-aura-drift-2" />
        </>
      )}
    </div>
  );
};
