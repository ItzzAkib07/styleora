import React, { useState, useRef, useEffect, useCallback } from 'react';

// Palette of luxury heart colors matching the light heart theme and STYLEORA aesthetic
const HEART_COLORS = [
  '#ff4d6d', // Vivid Rose
  '#ff758f', // Soft Heart Pink
  '#ffb3c1', // Light Heart Blush
  '#fda4af', // Warm Petal Pink
  '#f43f5e', // Radiant Crimson Heart
  '#e6d7c3', // Liquid Champagne Gold
  '#c5a880', // Muted Atelier Gold
  '#fecdd3', // Pastel Light Heart
];

export const DeveloperCredit = ({ className = '' }) => {
  const [hearts, setHearts] = useState([]);
  const heartIdRef = useRef(0);
  const intervalRef = useRef(null);
  const isHoveredRef = useRef(false);

  // Spawn a single dynamic heart particle
  const spawnHeart = useCallback(() => {
    const id = ++heartIdRef.current;
    const color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
    const xPercent = 10 + Math.random() * 80; // 10% to 90% across box
    const tx = (Math.random() - 0.5) * 90; // horizontal drift: -45px to +45px
    const ty = -(70 + Math.random() * 70); // float upward: -70px to -140px
    const scale = 0.65 + Math.random() * 0.75; // scale: 0.65 to 1.4
    const rot = (Math.random() - 0.5) * 60; // rotation: -30deg to +30deg
    const duration = 1.0 + Math.random() * 0.5; // duration: 1.0s to 1.5s
    const size = 12 + Math.random() * 10; // 12px to 22px

    const newHeart = {
      id,
      color,
      xPercent,
      tx,
      ty,
      scale,
      rot,
      duration,
      size,
    };

    setHearts((prev) => {
      // Keep maximum 40 hearts at once for high performance
      const trimmed = prev.length > 40 ? prev.slice(prev.length - 35) : prev;
      return [...trimmed, newHeart];
    });
  }, []);

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    // Initial immediate burst
    spawnHeart();
    spawnHeart();
    spawnHeart();

    // Continuous spawning every 80ms while cursor is hovering
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (isHoveredRef.current) {
        spawnHeart();
        // Occasional double spawn for lush effect
        if (Math.random() > 0.4) {
          spawnHeart();
        }
      }
    }, 85);
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const removeHeart = useCallback((id) => {
    setHearts((prev) => prev.filter((h) => h.id !== id));
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Floating Popping Hearts Container */}
      <div className="absolute inset-0 pointer-events-none overflow-visible z-30">
        {hearts.map((heart) => (
          <span
            key={heart.id}
            onAnimationEnd={() => removeHeart(heart.id)}
            style={{
              position: 'absolute',
              left: `${heart.xPercent}%`,
              bottom: '50%',
              pointerEvents: 'none',
              animation: `floatHeartPop ${heart.duration}s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
              '--tx': `${heart.tx}px`,
              '--ty': `${heart.ty}px`,
              '--scale': heart.scale,
              '--rot': `${heart.rot}deg`,
            }}
          >
            <svg
              width={heart.size}
              height={heart.size}
              viewBox="0 0 24 24"
              fill={heart.color}
              stroke="none"
              style={{
                filter: `drop-shadow(0 2px 6px ${heart.color}88)`,
              }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </span>
        ))}
      </div>

      {/* Developer Credit Box — Light Heart Color with Luxury Champagne Glow */}
      <a
        href="https://dezifolio.netlify.app/"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rose-300/35 bg-gradient-to-r from-rose-500/10 via-rose-300/15 to-rose-500/10 hover:from-rose-500/20 hover:via-rose-300/25 hover:to-rose-500/20 shadow-[0_2px_14px_rgba(244,63,94,0.15)] hover:shadow-[0_4px_22px_rgba(244,63,94,0.35)] hover:border-rose-400/60 transition-all duration-300 backdrop-blur-sm cursor-pointer select-none text-[0.72rem] tracking-editorial-wide"
      >
        {/* Pulsing Light Heart Icon */}
        <span className="relative flex items-center justify-center text-rose-400 group-hover:text-rose-300 transition-colors duration-300">
          <svg
            className="w-3.5 h-3.5 fill-rose-500 text-rose-400 group-hover:scale-125 transition-transform duration-300 animate-pulse"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </span>

        {/* Text */}
        <span className="text-rose-200/90 group-hover:text-rose-100 font-medium transition-colors duration-300">
          Crafted with{' '}
          <span className="text-rose-400 group-hover:text-rose-300 font-serif">♥</span>{' '}
          by{' '}
          <span className="text-warm-ivory group-hover:text-champagne font-semibold underline underline-offset-2 decoration-rose-400/40 group-hover:decoration-rose-300">
            Akib
          </span>
        </span>

        {/* Arrow Badge */}
        <span className="text-rose-400/80 group-hover:text-rose-200 text-[0.65rem] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
          ↗
        </span>
      </a>

      {/* Global CSS for the Popping Heart Animation */}
      <style>{`
        @keyframes floatHeartPop {
          0% {
            opacity: 0;
            transform: translate3d(0, 0, 0) scale(0.3) rotate(0deg);
          }
          15% {
            opacity: 1;
            transform: translate3d(calc(var(--tx) * 0.2), calc(var(--ty) * 0.2), 0) scale(var(--scale)) rotate(calc(var(--rot) * 0.3));
          }
          75% {
            opacity: 0.9;
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--tx), var(--ty), 0) scale(calc(var(--scale) * 1.25)) rotate(var(--rot));
          }
        }
      `}</style>
    </div>
  );
};
