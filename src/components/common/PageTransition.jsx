import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export const PageTransition = ({ children }) => {
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;

    setTransitioning(true);
    const timeout = setTimeout(() => {
      setTransitioning(false);
    }, 220);

    return () => clearTimeout(timeout);
  }, [location.pathname, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <div
      key={location.pathname}
      className={`transition-all duration-200 ease-out ${
        transitioning
          ? 'opacity-0 translate-y-1.5'
          : 'opacity-100 translate-y-0'
      }`}
    >
      {children}
    </div>
  );
};
