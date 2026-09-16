import React, { Suspense, lazy } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useIsMobile } from '@/hooks/useIsMobile';

const AtelierSculptureCanvas = lazy(() => import('./AtelierSculptureCanvas'));

export const AtelierSculpture = ({ className = '' }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();

  // Static luxury visual fallback for reduced motion or mobile devices
  if (prefersReducedMotion || isMobile) {
    return (
      <div className={`relative flex items-center justify-center bg-charcoal/80 border border-border-subtle p-8 overflow-hidden ${className}`}>
        <img
          src="/assets/atelier-seal.svg"
          alt="STYLEORA Sculptural Form"
          className="w-48 h-48 opacity-90 object-contain"
          loading="lazy"
        />
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-[0.65rem] text-stone tracking-editorial-ultra uppercase">
          <span>COUTURE SILHOUETTE</span>
          <span>STATIC EDITION</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Suspense
        fallback={
          <div className="w-full h-full min-h-[320px] flex items-center justify-center bg-charcoal/50 border border-border-subtle">
            <span className="font-editorial text-xl text-muted-gold/60 animate-pulse">
              Sculpting Atelier Silhouette...
            </span>
          </div>
        }
      >
        <AtelierSculptureCanvas isInteractive={!prefersReducedMotion} />
      </Suspense>
    </div>
  );
};
