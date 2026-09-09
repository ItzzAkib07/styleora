import React, { useRef, useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export const CinematicHeroMedia = ({
  poster = '/assets/atelier-silhouette.svg',
  videoSrc = null,
  className = '',
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [videoError, setVideoError] = useState(false);
  const canvasRef = useRef(null);

  // Atmospheric luxury particle canvas fallback when video is absent or unsupported
  useEffect(() => {
    if (videoSrc && !videoError) return;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = null;
    let width = (canvas.width = canvas.parentElement.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement.clientHeight || 400);

    // Muted luxury particles
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: -Math.random() * 0.3 - 0.1,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.fillStyle = `rgba(197, 168, 128, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [videoSrc, videoError, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className={`relative overflow-hidden bg-charcoal ${className}`}>
        <img
          src={poster}
          alt="STYLEORA Cinematic Composition"
          className="w-full h-full object-cover opacity-80"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-obsidian ${className}`}>
      {videoSrc && !videoError ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={poster}
          onError={() => setVideoError(true)}
          className="w-full h-full object-cover opacity-75"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <canvas ref={canvasRef} className="w-full h-full object-cover opacity-80" />
      )}

      {/* Luxury Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/40 pointer-events-none" />
    </div>
  );
};
