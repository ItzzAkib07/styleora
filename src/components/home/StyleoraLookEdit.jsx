import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { LOOKS } from '@/constants/looks';
import { AtelierContainer, Eyebrow, Button } from '@/components/ui';
import { AtmosphericBackground } from '@/components/background';
import { ROUTES } from '@/constants/routes';
import { gsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useIsMobile } from '@/hooks/useIsMobile';

export const StyleoraLookEdit = () => {
  // Selected look ID for button highlights and indicator position
  const [selectedId, setSelectedId] = useState(LOOKS[0].id);

  // Editorial details state (updates cleanly during the crossfade midpoint)
  const [displayLook, setDisplayLook] = useState(LOOKS[0]);

  // Two alternating physical image layers (Role 0 <-> Role 1)
  // Layer 0 starts as visible active look; Layer 1 starts hidden.
  const [layer0Src, setLayer0Src] = useState(LOOKS[0].src);
  const [layer1Src, setLayer1Src] = useState(LOOKS[0].src);

  // DOM node references
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const stageParallaxRef = useRef(null);
  const layer0Ref = useRef(null);
  const layer1Ref = useRef(null);
  const lightSweepRef = useRef(null);
  const ambientGlowRef = useRef(null);
  const textContainerRef = useRef(null);
  const specBadgeRef = useRef(null);
  const paletteBadgeRef = useRef(null);
  const selectorContainerRef = useRef(null);
  const buttonRefs = useRef({});
  const activeIndicatorRef = useRef(null);

  // Deterministic transition ownership refs
  const timelineRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const activeLayerIndexRef = useRef(0); // 0 means layer0 is currently visible, 1 means layer1 is visible
  const currentLookRef = useRef(LOOKS[0]);

  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile(900);

  // 1. Preload all remaining look images on mount for instant transitions
  useEffect(() => {
    if (typeof window === 'undefined') return;
    LOOKS.forEach((look) => {
      if (look.src && look.mediaType === 'image') {
        const img = new Image();
        img.src = look.src;
      }
    });
  }, []);

  // 2. Shared Active Indicator Underline (smoothly glides across buttons via GSAP)
  const updateIndicator = useCallback((id, animate = true) => {
    const btn = buttonRefs.current[id];
    const container = selectorContainerRef.current;
    const indicator = activeIndicatorRef.current;
    if (!btn || !container || !indicator) return;

    const cRect = container.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();

    const x = bRect.left - cRect.left;
    const y = bRect.top - cRect.top + bRect.height - 2;
    const width = bRect.width;

    if (animate && !prefersReducedMotion) {
      gsap.to(indicator, {
        x,
        y,
        width,
        duration: 0.35,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    } else {
      gsap.set(indicator, { x, y, width });
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    updateIndicator(selectedId, true);

    const handleResize = () => updateIndicator(selectedId, false);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedId, updateIndicator]);

  // 3. Deterministic Role-Toggling 2-Layer Media Transition
  // ZERO flash, ZERO reset, OLD look exits once and NEVER reappears
  const startTransition = useCallback((nextLook) => {
    if (!nextLook || nextLook.id === currentLookRef.current.id) return;

    // A. Safely kill any in-progress timeline (for rapid clicking)
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    isTransitioningRef.current = true;
    currentLookRef.current = nextLook;

    // B. Determine which layer is currently dominant/visible
    const l0 = layer0Ref.current;
    const l1 = layer1Ref.current;

    let currentLayer;
    let incomingLayer;
    let nextActiveIndex;

    if (timelineRef.current && timelineRef.current.isActive && timelineRef.current.isActive()) {
      // Rapid click mid-animation: determine which layer has higher opacity
      const op0 = Number(gsap.getProperty(l0, 'opacity')) || 0;
      const op1 = Number(gsap.getProperty(l1, 'opacity')) || 0;
      if (op0 >= op1) {
        currentLayer = l0;
        incomingLayer = l1;
        setLayer1Src(nextLook.src);
        nextActiveIndex = 1;
      } else {
        currentLayer = l1;
        incomingLayer = l0;
        setLayer0Src(nextLook.src);
        nextActiveIndex = 0;
      }
    } else {
      // Normal state: rely on activeLayerIndexRef
      if (activeLayerIndexRef.current === 0) {
        currentLayer = l0;
        incomingLayer = l1;
        setLayer1Src(nextLook.src);
        nextActiveIndex = 1;
      } else {
        currentLayer = l1;
        incomingLayer = l0;
        setLayer0Src(nextLook.src);
        nextActiveIndex = 0;
      }
    }

    // Reduced motion fast-path
    if (prefersReducedMotion) {
      gsap.set(incomingLayer, { opacity: 1, scale: 1, y: 0, filter: 'none', visibility: 'visible', zIndex: 2 });
      gsap.set(currentLayer, { opacity: 0, visibility: 'hidden', zIndex: 1 });
      activeLayerIndexRef.current = nextActiveIndex;
      setDisplayLook(nextLook);
      isTransitioningRef.current = false;
      return;
    }

    // Prepare incoming layer at opacity 0 behind or above current layer
    incomingLayer.style.zIndex = '3';
    incomingLayer.style.visibility = 'visible';
    currentLayer.style.zIndex = '2';

    gsap.set(incomingLayer, {
      opacity: 0,
      scale: 1.025,
      y: 8,
      filter: 'blur(5px)',
    });

    const sweep = lightSweepRef.current;
    const glow = ambientGlowRef.current;
    const textEl = textContainerRef.current;
    const specBadge = specBadgeRef.current;
    const paletteBadge = paletteBadgeRef.current;

    // C. Single Immutable Transition Timeline
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => {
        // Deterministic Settle:
        // Outgoing layer stays at opacity 0 and is marked hidden
        currentLayer.style.visibility = 'hidden';
        currentLayer.style.zIndex = '1';

        // Incoming layer stays at opacity 1 as the new active layer
        incomingLayer.style.zIndex = '2';

        // Update active layer pointer (role toggles safely without any source swap)
        activeLayerIndexRef.current = nextActiveIndex;
        isTransitioningRef.current = false;
      },
    });

    timelineRef.current = tl;

    // 1. Editorial Text & Badges Soft Fade Out (0ms - 180ms)
    if (textEl) {
      tl.to(textEl, { opacity: 0, y: -4, duration: 0.18, ease: 'power2.in' }, 0);
    }
    if (specBadge && paletteBadge) {
      tl.to([specBadge, paletteBadge], { opacity: 0, duration: 0.16, ease: 'power2.in' }, 0);
    }

    // 2. Light Sweep Overlay & Backdrop Glow (60ms - 600ms)
    if (sweep) {
      tl.fromTo(
        sweep,
        { xPercent: -100, opacity: 0 },
        { xPercent: 100, opacity: 0.6, duration: 0.52, ease: 'power1.inOut' },
        0.06
      );
    }
    if (glow) {
      tl.to(glow, {
        scale: 1.15,
        opacity: 0.9,
        duration: 0.32,
        yoyo: true,
        repeat: 1,
        ease: 'sine.inOut',
      }, 0.05);
    }

    // 3. ONE-DIRECTIONAL Cross-Transition:
    // Outgoing layer dissolves to 0 and NEVER turns back:
    tl.to(currentLayer, {
      opacity: 0,
      scale: 1.015,
      y: -4,
      filter: 'blur(3px)',
      duration: 0.52,
      ease: 'power2.inOut',
    }, 0.08);

    // Incoming layer resolves to 1 and STAYS at 1:
    tl.to(incomingLayer, {
      opacity: 1,
      scale: 1.0,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.58,
      ease: 'power3.out',
    }, 0.12);

    // 4. Update text at midpoint and fade back in (200ms - 540ms)
    tl.add(() => {
      setDisplayLook(nextLook);
    }, 0.20);

    if (textEl) {
      tl.fromTo(
        textEl,
        { opacity: 0, y: 5 },
        { opacity: 1, y: 0, duration: 0.34, ease: 'power2.out' },
        0.24
      );
    }
    if (specBadge && paletteBadge) {
      tl.to([specBadge, paletteBadge], { opacity: 1, duration: 0.32, ease: 'power2.out' }, 0.26);
    }
  }, [prefersReducedMotion]);

  // Look button click handler
  const handleSelectLook = (lookId) => {
    // If user clicked the already active look, do nothing
    if (lookId === currentLookRef.current.id) return;

    // Instant tactile feedback: move indicator immediately
    setSelectedId(lookId);

    const targetLook = LOOKS.find((l) => l.id === lookId);
    if (!targetLook) return;

    // Trigger one-directional deterministic transition
    startTransition(targetLook);
  };

  // 4. Subtle Desktop Cursor Parallax
  const handleMouseMove = (e) => {
    if (isMobile || prefersReducedMotion || !stageRef.current || !stageParallaxRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const xRel = (e.clientX - rect.left) / rect.width - 0.5;
    const yRel = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(stageParallaxRef.current, {
      x: xRel * -6,
      y: yRel * -4,
      duration: 0.8,
      ease: 'power1.out',
      overwrite: 'auto',
    });
  };

  const handleMouseLeave = () => {
    if (isMobile || prefersReducedMotion || !stageParallaxRef.current) return;
    gsap.to(stageParallaxRef.current, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="look-edit"
      className="py-10 sm:py-12 md:py-14 border-t border-border-subtle bg-obsidian relative overflow-hidden select-none"
      aria-labelledby="look-edit-heading"
    >
      {/* Fashion Editorial Atmosphere */}
      <AtmosphericBackground variant="outfit" intensity="subtle" />

      <AtelierContainer>
        {/* Compact Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-5 sm:mb-6">
          <div className="mb-2 flex justify-center">
            <Eyebrow>Editorial Look Archive</Eyebrow>
          </div>

          <h2
            id="look-edit-heading"
            className="font-editorial text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal leading-tight text-warm-ivory mb-1.5 tracking-tight"
          >
            One Woman.{' '}
            <span className="text-champagne italic font-normal">Many Expressions.</span>
          </h2>

          <p className="text-stone text-xs sm:text-sm font-light leading-relaxed max-w-xl mx-auto">
            Experience how STYLEORA proportion architecture and silhouette calibration transform the same signature presence across every occasion.
          </p>
        </div>

        {/* Fashion Stage Container */}
        <div className="max-w-5xl mx-auto">
          {/* Main Stage Card */}
          <div
            ref={stageRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative border border-border-subtle bg-charcoal/80 overflow-hidden shadow-elevated"
          >
            {/* Stage Top Bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-border-subtle/80 bg-obsidian/70 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-cinzel text-muted-gold text-[0.7rem] tracking-editorial-wide">
                  STYLEORA // LOOK EDIT
                </span>
                <span className="text-stone/40 hidden sm:inline">|</span>
                <span className="text-[0.62rem] tracking-editorial-ultra text-stone uppercase hidden sm:inline">
                  {displayLook.tag}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-stone font-mono text-[0.68rem]">
                <span className="text-champagne font-bold">{displayLook.num}</span>
                <span>/</span>
                <span>08</span>
              </div>
            </div>

            {/* Model Stage Area: Fixed Bounds & Luminous Halo */}
            <div className="relative h-[310px] sm:h-[360px] md:h-[410px] lg:h-[450px] flex items-center justify-center p-2 sm:p-4 overflow-hidden bg-gradient-to-b from-[#141416] via-[#101012] to-[#0b0b0c]">
              {/* Studio Rim Lighting Halo behind Model */}
              <div
                ref={ambientGlowRef}
                className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-500"
              >
                <div className="w-[300px] sm:w-[420px] h-[300px] sm:h-[420px] bg-gradient-to-tr from-champagne/15 via-warm-ivory/12 to-muted-gold/15 rounded-full blur-[70px]" />
              </div>

              {/* Shared Parallax Stage Container */}
              <div
                ref={stageParallaxRef}
                className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none will-change-transform"
              >
                {/* LAYER 0 (Permanent DOM Image Layer) */}
                <img
                  ref={layer0Ref}
                  src={layer0Src}
                  alt="STYLEORA Look Edit Model Layer 0"
                  className="absolute inset-0 m-auto max-h-[280px] sm:max-h-[330px] md:max-h-[380px] lg:max-h-[420px] w-auto max-w-full object-contain filter contrast-[1.03] brightness-[1.02] drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
                  style={{ transition: 'none' }}
                />

                {/* LAYER 1 (Permanent DOM Image Layer) */}
                <img
                  ref={layer1Ref}
                  src={layer1Src}
                  alt="STYLEORA Look Edit Model Layer 1"
                  className="absolute inset-0 m-auto max-h-[280px] sm:max-h-[330px] md:max-h-[380px] lg:max-h-[420px] w-auto max-w-full object-contain filter contrast-[1.03] brightness-[1.02] drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)] opacity-0 pointer-events-none"
                  style={{ transition: 'none' }}
                />
              </div>

              {/* Champagne Light Sweep Overlay */}
              <div
                ref={lightSweepRef}
                className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-r from-transparent via-champagne/20 to-transparent -translate-x-full opacity-0 transform-gpu"
                aria-hidden="true"
              />

              {/* Architectural Framing Accents */}
              <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t border-l border-border-medium pointer-events-none opacity-50" />
              <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t border-r border-border-medium pointer-events-none opacity-50" />
              <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b border-l border-border-medium pointer-events-none opacity-50" />
              <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b border-r border-border-medium pointer-events-none opacity-50" />

              {/* Floating Specification Badge (Desktop Overlay) */}
              <div
                ref={specBadgeRef}
                className="absolute bottom-3 left-3 z-20 hidden sm:block max-w-[220px] p-2.5 bg-obsidian/90 backdrop-blur-md border border-border-subtle text-left shadow-sm"
              >
                <span className="text-[0.58rem] font-mono tracking-editorial-ultra text-muted-gold uppercase block mb-0.5">
                  CALIBRATED SPECIFICATION
                </span>
                <span className="text-warm-ivory font-editorial text-sm block font-normal leading-tight">
                  {displayLook.silhouette}
                </span>
                <span className="text-stone text-[0.68rem] font-light block leading-snug mt-0.5">
                  {displayLook.dimension}
                </span>
              </div>

              {/* Chromatic Swatch Matrix (Desktop Overlay) */}
              <div
                ref={paletteBadgeRef}
                className="absolute bottom-3 right-3 z-20 hidden sm:flex flex-col items-end p-2.5 bg-obsidian/90 backdrop-blur-md border border-border-subtle shadow-sm"
              >
                <span className="text-[0.58rem] font-mono tracking-editorial-ultra text-muted-gold uppercase mb-1.5">
                  PALETTE
                </span>
                <div className="flex items-center gap-1.5 mb-1">
                  {displayLook.swatches.map((color, idx) => (
                    <span
                      key={idx}
                      className="w-3.5 h-3.5 border border-border-medium inline-block shadow-sm"
                      style={{ backgroundColor: color }}
                      title={`Swatch ${color}`}
                    />
                  ))}
                </div>
                <span className="text-[0.62rem] text-ivory-muted font-light">
                  {displayLook.paletteName}
                </span>
              </div>
            </div>

            {/* Compact Editorial Information Bar */}
            <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-border-subtle bg-obsidian/95 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-h-[76px]">
              <div ref={textContainerRef} className="max-w-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[0.62rem] tracking-editorial-ultra text-champagne uppercase font-medium">
                    {displayLook.tag}
                  </span>
                  <span className="text-stone/40">•</span>
                  <span className="text-[0.62rem] tracking-editorial-ultra text-stone uppercase">
                    {displayLook.dimension}
                  </span>
                </div>

                <h3 className="font-editorial text-lg sm:text-xl text-warm-ivory font-normal leading-snug">
                  {displayLook.title}
                  <span className="text-stone text-xs sm:text-sm italic font-light ml-2 font-editorial">
                    — {displayLook.subtitle}
                  </span>
                </h3>

                <p className="text-ivory-muted text-xs sm:text-sm font-light leading-relaxed line-clamp-2 md:line-clamp-none mt-1">
                  {displayLook.description}
                </p>
              </div>

              <div className="shrink-0 flex items-center justify-between sm:justify-end w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle/50">
                <Button
                  to={ROUTES.CONSULTATION}
                  variant="primary"
                  size="sm"
                  icon={ArrowRight}
                  className="text-[0.72rem] px-4 py-2"
                >
                  Curate Look
                </Button>
              </div>
            </div>
          </div>

          {/* Look Selector Grid with ONE Shared Continuous Underline */}
          <div className="mt-4 sm:mt-5">
            <div className="text-center mb-2.5">
              <span className="text-[0.62rem] tracking-editorial-ultra text-stone uppercase font-medium">
                SELECT EXPRESSION TO TRANSFORM
              </span>
            </div>

            <div
              ref={selectorContainerRef}
              className="relative grid grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-2 w-full max-w-4xl mx-auto"
              role="tablist"
              aria-label="STYLEORA Look Edit Expressions"
            >
              {/* The SINGLE shared continuous underline indicator */}
              <div
                ref={activeIndicatorRef}
                className="absolute h-[2px] bg-gradient-to-r from-muted-gold via-champagne to-muted-gold pointer-events-none z-20"
                style={{ willChange: 'transform, width' }}
                aria-hidden="true"
              />

              {LOOKS.map((look) => {
                const isActive = look.id === selectedId;

                return (
                  <button
                    key={look.id}
                    ref={(el) => (buttonRefs.current[look.id] = el)}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`look-panel-${look.id}`}
                    onClick={() => handleSelectLook(look.id)}
                    className={`relative py-2 px-1 sm:px-2 min-h-[38px] sm:min-h-[42px] border text-center transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1 text-[0.65rem] sm:text-[0.72rem] tracking-wider uppercase select-none focus-visible:outline-2 focus-visible:outline-champagne z-10 ${
                      isActive
                        ? 'bg-charcoal text-champagne border-champagne/60 font-semibold shadow-sm'
                        : 'bg-charcoal/60 text-stone hover:text-warm-ivory border-border-subtle hover:border-champagne/30'
                    }`}
                  >
                    <span className="truncate">{look.label}</span>
                    {isActive && (
                      <Sparkles size={10} className="text-muted-gold shrink-0 hidden md:inline" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </AtelierContainer>
    </section>
  );
};
