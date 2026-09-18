import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Quote, Sparkles, ChevronsLeftRight, ArrowUpRight } from 'lucide-react';
import { AtelierContainer, SectionHeading } from '@/components/ui';
import { AtmosphericBackground } from '@/components/background';
import { ROUTES } from '@/constants/routes';
import { QUICK_NOTES, CLIENT_STORIES } from '@/data/testimonials';
import { gsap } from '@/lib/gsap';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Interactive Before / After Image Comparison Slider
 * Enhanced with:
 * - Fluid 60/120fps PointerCapture and touch drag tracking
 * - Safe non-passive touchmove with preventDefault() preventing mobile page scroll hijacking
 * - Dynamic single active title cross-fade (Only Before visible when dragging before, only After visible when dragging after)
 * - Tactile floating indicator pill on handle
 * - Ultra-responsive, high-contrast bottom "Drag or Tap to Compare" pill (always properly visible on all mobile screens)
 * - Bidirectional sync with diagnostic dossier
 * - Responsive full-width touch buttons on mobile
 */
const BeforeAfterSlider = ({
  beforeImage,
  afterImage,
  name,
  category,
  initialPos = 50,
  activeView = 'after',
  onViewChange,
}) => {
  const [sliderPos, setSliderPos] = useState(initialPos);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragDirection, setDragDirection] = useState('split'); // 'before' | 'after' | 'split'
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const prevClientXRef = useRef(0);
  const activePointerIdRef = useRef(null);

  // Bidirectional sync: when external activeView changes (e.g. from Diagnostic Breakdown tabs), glide smoothly
  useEffect(() => {
    if (isDraggingRef.current) return;
    if (activeView === 'before' && sliderPos < 70) {
      setIsAnimating(true);
      setSliderPos(100);
      setDragDirection('before');
      const timer = setTimeout(() => setIsAnimating(false), 420);
      return () => clearTimeout(timer);
    } else if (activeView === 'after' && sliderPos > 30) {
      setIsAnimating(true);
      setSliderPos(0);
      setDragDirection('after');
      const timer = setTimeout(() => setIsAnimating(false), 420);
      return () => clearTimeout(timer);
    }
  }, [activeView]);

  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percent = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));

    // Track direction
    if (clientX > prevClientXRef.current + 1) {
      setDragDirection('before');
    } else if (clientX < prevClientXRef.current - 1) {
      setDragDirection('after');
    } else if (percent > 50) {
      setDragDirection('before');
    } else if (percent < 50) {
      setDragDirection('after');
    }
    prevClientXRef.current = clientX;

    setSliderPos(percent);

    // Sync active view with parent dossier
    if (onViewChange) {
      if (percent >= 55) {
        onViewChange('before');
      } else if (percent <= 45) {
        onViewChange('after');
      }
    }
  }, [onViewChange]);

  const handlePointerDown = (e) => {
    // Only primary mouse button or any touch/stylus
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    setIsAnimating(false);
    setIsDragging(true);
    isDraggingRef.current = true;
    prevClientXRef.current = e.clientX;
    activePointerIdRef.current = e.pointerId;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      // Safe fallback
    }

    updatePosition(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    activePointerIdRef.current = null;
    try {
      if (e.currentTarget && e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch (err) {
      // Safe fallback
    }
  };

  const handlePointerCancel = (e) => {
    handlePointerUp(e);
  };

  const setPreset = (mode) => {
    setIsAnimating(true);
    if (mode === 'before') {
      setSliderPos(100);
      setDragDirection('before');
      onViewChange?.('before');
    } else if (mode === 'after') {
      setSliderPos(0);
      setDragDirection('after');
      onViewChange?.('after');
    } else {
      setSliderPos(50);
      setDragDirection('split');
    }
    setTimeout(() => setIsAnimating(false), 420);
  };

  // Window-level safety listeners and non-passive touchmove for mobile devices
  useEffect(() => {
    const handleWindowPointerMove = (e) => {
      if (!isDraggingRef.current) return;
      updatePosition(e.clientX);
    };

    const handleWindowPointerUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        activePointerIdRef.current = null;
      }
    };

    const handleTouchMove = (e) => {
      if (!isDraggingRef.current) return;
      if (e.cancelable) {
        e.preventDefault(); // Stop mobile browser scrolling while dragging the slider
      }
      if (e.touches && e.touches.length > 0) {
        updatePosition(e.touches[0].clientX);
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove, { passive: true });
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleWindowPointerUp);
    window.addEventListener('touchcancel', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleWindowPointerUp);
      window.removeEventListener('touchcancel', handleWindowPointerUp);
    };
  }, [updatePosition]);

  // Requirement: When dragging before, only Before title is visible.
  // When dragging after, only After title is visible.
  let showBefore = false;
  let showAfter = false;

  if (isDragging) {
    if (sliderPos > 50) {
      showBefore = true;
      showAfter = false;
    } else if (sliderPos < 50) {
      showBefore = false;
      showAfter = true;
    } else {
      showBefore = dragDirection === 'before';
      showAfter = dragDirection === 'after';
    }
  } else {
    // Idle state
    if (sliderPos > 55) {
      showBefore = true;
      showAfter = false;
    } else if (sliderPos < 45) {
      showBefore = false;
      showAfter = true;
    } else {
      // Centered 50/50 idle view
      showBefore = true;
      showAfter = true;
    }
  }

  return (
    <div className="flex flex-col w-full">
      {/* Visual Canvas Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{ touchAction: 'none' }}
        className="relative aspect-[3/4] w-full overflow-hidden select-none bg-obsidian border border-border-subtle cursor-ew-resize touch-none group shadow-ambient"
        role="slider"
        aria-label={`Before and after style comparison for ${name}`}
        aria-valuenow={sliderPos}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            setIsAnimating(false);
            setSliderPos((p) => {
              const next = Math.max(0, p - 5);
              if (onViewChange && next <= 45) onViewChange('after');
              return next;
            });
          }
          if (e.key === 'ArrowRight') {
            setIsAnimating(false);
            setSliderPos((p) => {
              const next = Math.min(100, p + 5);
              if (onViewChange && next >= 55) onViewChange('before');
              return next;
            });
          }
        }}
      >
        {/* Layer 1: BEFORE Image (Full Canvas) */}
        <img
          src={beforeImage}
          alt={`${name} — Before Personal Styling`}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          loading="lazy"
        />

        {/* Layer 2: AFTER Image (Clipped from sliderPos% to 100%) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{
            clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`,
            transition: isAnimating ? 'clip-path 400ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        >
          <img
            src={afterImage}
            alt={`${name} — After STYLEORA Signature Blueprint`}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            loading="lazy"
          />
        </div>

        {/* Draggable Divider Line & Luxury Handle */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-champagne/40 via-champagne to-champagne/40 shadow-[0_0_14px_rgba(230,215,195,0.9)] pointer-events-none z-10"
          style={{
            left: `${sliderPos}%`,
            transition: isAnimating ? 'left 400ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        >
          {/* Centered Circular Drag Handle */}
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-obsidian/95 border-2 border-champagne text-champagne flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.8)] transition-all duration-200 ${
              isDragging
                ? 'scale-110 border-warm-ivory shadow-[0_0_25px_rgba(230,215,195,0.7)] text-warm-ivory'
                : 'scale-100 hover:scale-105'
            }`}
          >
            <ChevronsLeftRight size={16} />

            {/* Active Floating Drag Tag directly above Handle */}
            <div
              className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-obsidian/95 backdrop-blur-md border border-champagne/60 text-[0.55rem] sm:text-[0.58rem] font-cinzel tracking-widest uppercase text-champagne whitespace-nowrap shadow-elevated transition-all duration-200 ${
                isDragging ? 'opacity-100 -translate-y-1 scale-100' : 'opacity-0 translate-y-1 scale-90 pointer-events-none'
              }`}
            >
              {sliderPos > 50 ? 'Before' : sliderPos < 50 ? 'After' : '50 / 50'}
            </div>
          </div>
        </div>

        {/* Dynamic Corner Badge: BEFORE (visible when dragging/viewing Before) */}
        <div
          className="absolute top-3 left-3 pointer-events-none z-20 transition-all duration-300 ease-out"
          style={{
            opacity: showBefore ? 1 : 0,
            transform: showBefore ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.95)',
          }}
        >
          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-obsidian/95 backdrop-blur-md border border-champagne/30 text-[0.62rem] sm:text-[0.68rem] font-cinzel text-warm-ivory tracking-widest uppercase shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-dark" />
            Before
          </span>
        </div>

        {/* Dynamic Corner Badge: AFTER BLUEPRINT (visible when dragging/viewing After) */}
        <div
          className="absolute top-3 right-3 pointer-events-none z-20 transition-all duration-300 ease-out"
          style={{
            opacity: showAfter ? 1 : 0,
            transform: showAfter ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.95)',
          }}
        >
          <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-champagne text-obsidian text-[0.62rem] sm:text-[0.68rem] font-cinzel font-semibold tracking-widest uppercase shadow-md">
            <Sparkles size={11} className="text-obsidian" />
            After Blueprint
          </span>
        </div>

        {/* Bottom Center Pill: "Drag or Tap to Compare" (Ultra-responsive, visible properly across all mobile screen sizes) */}
        <div
          className={`absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-20 transition-all duration-300 ease-out max-w-[94%] ${
            isDragging ? 'opacity-40 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-obsidian/95 backdrop-blur-md border border-champagne/60 shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
            <ChevronsLeftRight size={12} className="text-champagne shrink-0 animate-pulse" />
            <span className="text-[0.58rem] sm:text-[0.65rem] font-cinzel text-champagne tracking-widest uppercase font-medium whitespace-nowrap">
              {isDragging
                ? sliderPos > 50
                  ? 'Revealing Before'
                  : sliderPos < 50
                  ? 'Revealing After'
                  : 'Split 50 / 50'
                : 'Drag or Tap to Compare'}
            </span>
          </div>
        </div>
      </div>

      {/* Preset Controls & Subtle Disclaimer */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs">
        <div className="grid grid-cols-3 sm:inline-flex p-0.5 bg-obsidian border border-border-subtle w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setPreset('before')}
            className={`px-2.5 sm:px-3 py-1.5 sm:py-1 text-[0.62rem] sm:text-[0.65rem] tracking-editorial-wide uppercase transition-all duration-300 text-center ${
              sliderPos > 65
                ? 'bg-charcoal text-warm-ivory font-medium border border-border-medium shadow-sm'
                : 'text-stone hover:text-warm-ivory'
            }`}
          >
            Before
          </button>
          <button
            type="button"
            onClick={() => setPreset('split')}
            className={`px-2.5 sm:px-3 py-1.5 sm:py-1 text-[0.62rem] sm:text-[0.65rem] tracking-editorial-wide uppercase transition-all duration-300 text-center ${
              sliderPos >= 35 && sliderPos <= 65
                ? 'bg-champagne/15 text-champagne font-medium border border-champagne/40 shadow-sm'
                : 'text-stone hover:text-warm-ivory'
            }`}
          >
            Split 50/50
          </button>
          <button
            type="button"
            onClick={() => setPreset('after')}
            className={`px-2.5 sm:px-3 py-1.5 sm:py-1 text-[0.62rem] sm:text-[0.65rem] tracking-editorial-wide uppercase transition-all duration-300 text-center ${
              sliderPos < 35
                ? 'bg-champagne text-obsidian font-semibold shadow-sm'
                : 'text-stone hover:text-warm-ivory'
            }`}
          >
            After
          </button>
        </div>

        <span className="text-[0.6rem] sm:text-[0.62rem] text-stone/80 font-light italic self-start sm:self-auto">
          Visuals shown are AI-generated editorial representations.
        </span>
      </div>
    </div>
  );
};

export const ClientStoriesSection = () => {
  const sectionRef = useRef(null);
  const notesRef = useRef([]);
  const storiesRef = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Active view state for diagnostic tabs per story ('after' | 'before')
  const [activeViews, setActiveViews] = useState({
    ananya: 'after',
    riya: 'after',
    meera: 'after',
  });

  const toggleStoryView = (storyId, view) => {
    setActiveViews((prev) => ({
      ...prev,
      [storyId]: view,
    }));
  };

  useEffect(() => {
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Stagger entrance for client story cards (Part A)
      const validStories = storiesRef.current.filter(Boolean);
      if (validStories.length > 0) {
        gsap.fromTo(
          validStories,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.18,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: validStories[0],
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 2. Stagger entrance for quick notes (Part B)
      const validNotes = notesRef.current.filter(Boolean);
      if (validNotes.length > 0) {
        gsap.fromTo(
          validNotes,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: validNotes[0],
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-24 md:py-36 border-t border-border-subtle bg-charcoal/30 relative overflow-hidden"
    >
      {/* Storytelling Warm Transformation Atmosphere */}
      <AtmosphericBackground variant="transformation" intensity="subtle" />

      <AtelierContainer>
        {/* ========================================================================= */}
        {/* PART A: CLIENT STORIES SUBSECTION                                         */}
        {/* ========================================================================= */}
        <div className="mb-20 md:mb-28">
          <SectionHeading
            align="left"
            eyebrow="Editorial Style Stories"
            title="What changed for three STYLEORA clients."
            subtitle="Their concerns were different. The advice had to fit their bodies, comfort and real lives."
          />

          {/* Three In-Depth Case Study Cards */}
          <div className="flex flex-col gap-10 sm:gap-16">
            {CLIENT_STORIES.map((story, idx) => {
              const currentView = activeViews[story.id] || 'after';
              const activeData = currentView === 'after' ? story.after : story.before;

              return (
                <div
                  key={story.id}
                  ref={(el) => (storiesRef.current[idx] = el)}
                  className="bg-charcoal border border-border-subtle p-4 sm:p-7 md:p-10 relative overflow-hidden transition-all duration-500 hover:border-champagne/40 shadow-ambient"
                >
                  {/* Header Row: Client Dossier Profile */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-5 mb-6 sm:mb-8 border-b border-border-subtle">
                    <div className="flex items-center gap-3.5 sm:gap-4">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 border border-champagne/40 bg-obsidian flex items-center justify-center text-champagne font-cinzel text-sm font-semibold tracking-wider shrink-0">
                        {story.profileInitials}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <h3 className="font-editorial text-2xl sm:text-3xl text-warm-ivory font-normal">
                            {story.name}
                          </h3>
                          <span className="text-[0.62rem] px-2 py-0.5 border border-border-medium text-stone tracking-editorial-wide uppercase">
                            {story.location}
                          </span>
                        </div>
                        <p className="text-xs text-muted-gold font-light mt-0.5">
                          {story.role}
                        </p>
                      </div>
                    </div>

                    <span className="text-[0.62rem] sm:text-[0.65rem] tracking-editorial-ultra text-stone uppercase font-mono self-start sm:self-auto px-2 py-0.5 sm:p-0 bg-surface-subtle sm:bg-transparent border border-border-subtle sm:border-0">
                      {story.badge}
                    </span>
                  </div>

                  {/* Main Grid: Interactive Before/After Visual + Narrative */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                    {/* Left Column: Interactive Before / After Comparison Slider */}
                    <div className="lg:col-span-5 w-full">
                      <BeforeAfterSlider
                        beforeImage={story.beforeImage}
                        afterImage={story.afterImage}
                        name={story.name}
                        category={story.category}
                        activeView={currentView}
                        onViewChange={(view) => toggleStoryView(story.id, view)}
                      />
                    </div>

                    {/* Right Column: Editorial Narrative & Diagnostics */}
                    <div className="lg:col-span-7 w-full flex flex-col justify-between mt-2 lg:mt-0">
                      <div>
                        <span className="font-cinzel text-xs text-muted-gold tracking-editorial-ultra uppercase block mb-1.5">
                          {story.category}
                        </span>

                        {/* Pull Quote */}
                        <blockquote className="font-editorial text-lg sm:text-xl md:text-2xl text-champagne italic mb-5 leading-snug">
                          "{story.quote}"
                        </blockquote>

                        {/* Concern & Transformation */}
                        <div className="space-y-3.5 sm:space-y-4 mb-5 sm:mb-6">
                          <div>
                            <span className="text-[0.68rem] tracking-editorial-ultra text-muted-gold uppercase block mb-1 font-medium">
                              The Client Dilemma
                            </span>
                            <p className="text-ivory-muted text-xs sm:text-sm leading-relaxed font-light">
                              "{story.concern}"
                            </p>
                          </div>

                          <div>
                            <span className="text-[0.68rem] tracking-editorial-ultra text-warm-ivory uppercase block mb-1 font-medium">
                              The Styling Transformation
                            </span>
                            <p className="text-stone text-xs sm:text-sm leading-relaxed font-light">
                              {story.experience}
                            </p>
                          </div>
                        </div>

                        {/* What Changed Highlight Card */}
                        <div className="p-4 sm:p-5 bg-obsidian border border-border-subtle/80 mb-5 sm:mb-6">
                          <span className="text-[0.65rem] tracking-editorial-ultra text-champagne uppercase block mb-1.5 font-medium">
                            Key Wardrobe Evolution
                          </span>
                          <p className="text-stone text-xs sm:text-sm font-light leading-relaxed">
                            {story.whatChanged}
                          </p>
                        </div>

                        {/* Diagnostic Breakdown Matrix */}
                        <div className="bg-obsidian/60 border border-border-subtle p-4 sm:p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-border-subtle">
                            <span className="text-[0.65rem] tracking-editorial-ultra text-stone uppercase font-cinzel">
                              Diagnostic Breakdown
                            </span>
                            <div className="grid grid-cols-2 sm:inline-flex p-0.5 bg-charcoal border border-border-subtle text-[0.62rem] w-full sm:w-auto">
                              <button
                                type="button"
                                onClick={() => toggleStoryView(story.id, 'before')}
                                className={`px-2.5 sm:px-3 py-1.5 sm:py-0.5 uppercase tracking-widest text-center transition-all duration-200 ${
                                  currentView === 'before'
                                    ? 'bg-obsidian text-warm-ivory font-medium shadow-sm'
                                    : 'text-stone hover:text-warm-ivory'
                                }`}
                              >
                                Before Audit
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleStoryView(story.id, 'after')}
                                className={`px-2.5 sm:px-3 py-1.5 sm:py-0.5 uppercase tracking-widest text-center transition-all duration-200 ${
                                  currentView === 'after'
                                    ? 'bg-champagne text-obsidian font-semibold shadow-sm'
                                    : 'text-stone hover:text-warm-ivory'
                                }`}
                              >
                                After Blueprint
                              </button>
                            </div>
                          </div>

                          <div className="transition-opacity duration-300">
                            <span
                              className={`inline-block text-[0.62rem] tracking-editorial-ultra uppercase px-2 py-0.5 mb-2 font-semibold ${
                                currentView === 'after'
                                  ? 'bg-champagne/10 border border-champagne/40 text-champagne'
                                  : 'bg-surface-subtle border border-border-medium text-stone'
                              }`}
                            >
                              {activeData.tag}
                            </span>
                            <h4 className="font-editorial text-lg sm:text-xl text-warm-ivory font-normal mb-3">
                              {activeData.focus}
                            </h4>

                            <ul className="list-none p-0 m-0 space-y-2 mb-4">
                              {activeData.notes.map((note) => (
                                <li key={note} className="flex items-start gap-2.5 text-xs text-ivory-muted font-light leading-relaxed">
                                  {currentView === 'after' ? (
                                    <Sparkles size={13} className="text-champagne shrink-0 mt-0.5" />
                                  ) : (
                                    <span className="w-1.5 h-1.5 rounded-full bg-stone-dark shrink-0 mt-1.5" />
                                  )}
                                  <span>{note}</span>
                                </li>
                              ))}
                            </ul>

                            <div className="pt-3 border-t border-border-subtle/50 text-[0.7rem] text-stone">
                              <span className="text-muted-gold font-medium uppercase text-[0.62rem] block mb-0.5">
                                Diagnostic Assessment:
                              </span>
                              {activeData.silhouetteSummary}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Explore Consultation CTA Link */}
                      <div className="mt-6 pt-4 border-t border-border-subtle/40 flex items-center justify-between">
                        <Link
                          to={ROUTES.CONSULTATION}
                          className="inline-flex items-center gap-1.5 text-xs text-champagne uppercase tracking-editorial-wide hover:text-warm-ivory transition-colors group"
                        >
                          <span>Explore your own style blueprint</span>
                          <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PART B: THREE QUICK NOTES                                                 */}
        {/* ========================================================================= */}
        <div className="pt-16 border-t border-border-subtle/60">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="font-cinzel text-xs text-muted-gold tracking-editorial-ultra uppercase block mb-3">
              Real Clients · Real Experiences
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-warm-ivory font-normal mb-4">
              Hear it in their own words.
            </h2>
            <p className="text-stone text-sm sm:text-base font-light leading-relaxed">
              Three quick notes about what personal styling changed for them.
            </p>
          </div>

          {/* Three Quick Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {QUICK_NOTES.map((note, idx) => (
              <div
                key={note.id}
                ref={(el) => (notesRef.current[idx] = el)}
                className="bg-charcoal border border-border-subtle p-7 sm:p-8 relative flex flex-col justify-between transition-all duration-300 hover:border-champagne/50"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-9 h-9 border border-border-medium flex items-center justify-center text-champagne bg-obsidian text-xs font-cinzel">
                      {note.initials}
                    </div>
                    <Quote size={16} className="text-muted-gold/50" />
                  </div>

                  <blockquote className="font-editorial text-xl sm:text-2xl text-warm-ivory font-normal leading-snug mb-4">
                    "{note.quote}"
                  </blockquote>

                  <p className="text-xs text-ivory-muted font-light leading-relaxed">
                    {note.takeaway}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border-subtle/40 flex items-center justify-between text-[0.65rem] text-stone uppercase tracking-widest">
                  <span>{note.name}</span>
                  <span className="text-muted-gold">{note.clientContext}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AtelierContainer>
    </section>
  );
};

