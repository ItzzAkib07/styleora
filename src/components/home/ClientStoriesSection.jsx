import React, { useState, useEffect, useRef } from 'react';
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
 * Provides fluid touch/mouse drag, clip-path mask reveals, and one-click presets
 */
const BeforeAfterSlider = ({ beforeImage, afterImage, name, initialPos = 50 }) => {
  const [sliderPos, setSliderPos] = useState(initialPos);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handlePointerMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percent = Math.round((x / rect.width) * 100);
    setSliderPos(percent);
  };

  const onPointerDown = (e) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    handlePointerMove(e.clientX);
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    handlePointerMove(e.clientX);
  };

  const onPointerUp = () => {
    setIsDragging(false);
  };

  const setPreset = (mode) => {
    if (mode === 'before') setSliderPos(100);
    else if (mode === 'after') setSliderPos(0);
    else setSliderPos(50);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Visual Canvas Container */}
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative aspect-[3/4] w-full overflow-hidden select-none bg-obsidian border border-border-subtle cursor-ew-resize touch-none group shadow-ambient"
        role="slider"
        aria-label={`Before and after style comparison for ${name}`}
        aria-valuenow={sliderPos}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setSliderPos((p) => Math.max(0, p - 5));
          if (e.key === 'ArrowRight') setSliderPos((p) => Math.min(100, p + 5));
        }}
      >
        {/* Layer 1: BEFORE Image (Full Canvas) */}
        <img
          src={beforeImage}
          alt={`${name} — Before Personal Styling`}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          loading="lazy"
        />

        {/* Layer 2: AFTER Image (Clipped from left to sliderPos) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{
            clipPath: `polygon(${sliderPos}% 0, 100% 0, 100% 100%, ${sliderPos}% 100%)`,
          }}
        >
          <img
            src={afterImage}
            alt={`${name} — After STYLEORA Signature Blueprint`}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            loading="lazy"
          />
        </div>

        {/* Draggable Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-champagne shadow-[0_0_12px_rgba(201,169,110,0.85)] pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Centered Luxury Circular Drag Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-obsidian border-2 border-champagne text-champagne flex items-center justify-center shadow-elevated">
            <ChevronsLeftRight size={15} className="text-champagne" />
          </div>
        </div>

        {/* Corner Badges */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="px-2.5 py-1 bg-obsidian/85 backdrop-blur-md border border-border-subtle text-[0.62rem] font-cinzel text-stone tracking-widest uppercase">
            Before
          </span>
        </div>
        <div className="absolute top-3 right-3 pointer-events-none">
          <span className="px-2.5 py-1 bg-champagne/90 backdrop-blur-md text-obsidian text-[0.62rem] font-cinzel font-semibold tracking-widest uppercase shadow-sm">
            After Blueprint
          </span>
        </div>

        {/* Bottom Drag Instruction */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
          <span className="px-3 py-1 bg-obsidian/85 backdrop-blur-md border border-border-subtle/70 text-[0.58rem] font-mono tracking-widest text-warm-ivory uppercase">
            Drag or Tap to Compare
          </span>
        </div>
      </div>

      {/* Preset Controls & Subtle Disclaimer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="inline-flex p-0.5 bg-obsidian border border-border-subtle">
          <button
            type="button"
            onClick={() => setPreset('before')}
            className={`px-3 py-1 text-[0.65rem] tracking-editorial-wide uppercase transition-all ${
              sliderPos > 75
                ? 'bg-charcoal text-warm-ivory font-medium border border-border-medium'
                : 'text-stone hover:text-warm-ivory'
            }`}
          >
            Before
          </button>
          <button
            type="button"
            onClick={() => setPreset('split')}
            className={`px-3 py-1 text-[0.65rem] tracking-editorial-wide uppercase transition-all ${
              sliderPos >= 25 && sliderPos <= 75
                ? 'bg-champagne/15 text-champagne font-medium border border-champagne/40'
                : 'text-stone hover:text-warm-ivory'
            }`}
          >
            Split 50/50
          </button>
          <button
            type="button"
            onClick={() => setPreset('after')}
            className={`px-3 py-1 text-[0.65rem] tracking-editorial-wide uppercase transition-all ${
              sliderPos < 25
                ? 'bg-champagne text-obsidian font-semibold shadow-sm'
                : 'text-stone hover:text-warm-ivory'
            }`}
          >
            After Blueprint
          </button>
        </div>

        <span className="text-[0.65rem] text-stone font-light italic">
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
      // 1. Stagger entrance for quick notes
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
              trigger: sectionRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // 2. Stagger entrance for client story cards
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
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-36 border-t border-border-subtle bg-charcoal/30 relative overflow-hidden"
    >
      {/* Storytelling Warm Transformation Atmosphere */}
      <AtmosphericBackground variant="transformation" intensity="subtle" />

      <AtelierContainer>
        {/* ========================================================================= */}
        {/* PART A: HERO COPY & THREE QUICK NOTES                                     */}
        {/* ========================================================================= */}
        <div className="mb-14 md:mb-20">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
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

        {/* ========================================================================= */}
        {/* PART B: CLIENT STORIES SUBSECTION                                         */}
        {/* ========================================================================= */}
        <div className="pt-8 border-t border-border-subtle/60">
          <SectionHeading
            align="left"
            eyebrow="Editorial Style Stories"
            title="What changed for three STYLEORA clients."
            subtitle="Their concerns were different. The advice had to fit their bodies, comfort and real lives."
          />

          {/* Three In-Depth Case Study Cards */}
          <div className="flex flex-col gap-16">
            {CLIENT_STORIES.map((story, idx) => {
              const currentView = activeViews[story.id] || 'after';
              const activeData = currentView === 'after' ? story.after : story.before;

              return (
                <div
                  key={story.id}
                  ref={(el) => (storiesRef.current[idx] = el)}
                  className="bg-charcoal border border-border-subtle p-8 sm:p-12 relative overflow-hidden transition-all duration-500 hover:border-champagne/40 shadow-ambient"
                >
                  {/* Header Row: Client Dossier Profile */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-border-subtle">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 border border-champagne/40 bg-obsidian flex items-center justify-center text-champagne font-cinzel text-sm font-semibold tracking-wider shrink-0">
                        {story.profileInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
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

                    <span className="text-[0.65rem] tracking-editorial-ultra text-stone uppercase font-mono">
                      {story.badge}
                    </span>
                  </div>

                  {/* Main Grid: Interactive Before/After Visual + Narrative */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Left Column: Interactive Before / After Comparison Slider */}
                    <div className="lg:col-span-5">
                      <BeforeAfterSlider
                        beforeImage={story.beforeImage}
                        afterImage={story.afterImage}
                        name={story.name}
                        category={story.category}
                      />
                    </div>

                    {/* Right Column: Editorial Narrative & Diagnostics */}
                    <div className="lg:col-span-7 flex flex-col justify-between">
                      <div>
                        <span className="font-cinzel text-xs text-muted-gold tracking-editorial-ultra uppercase block mb-1">
                          {story.category}
                        </span>

                        {/* Pull Quote */}
                        <blockquote className="font-editorial text-xl sm:text-2xl text-champagne italic mb-6 leading-snug">
                          "{story.quote}"
                        </blockquote>

                        {/* Concern & Transformation */}
                        <div className="space-y-4 mb-6">
                          <div>
                            <span className="text-[0.68rem] tracking-editorial-ultra text-muted-gold uppercase block mb-1 font-medium">
                              The Client Dilemma
                            </span>
                            <p className="text-ivory-muted text-sm leading-relaxed font-light">
                              "{story.concern}"
                            </p>
                          </div>

                          <div>
                            <span className="text-[0.68rem] tracking-editorial-ultra text-warm-ivory uppercase block mb-1 font-medium">
                              The Styling Transformation
                            </span>
                            <p className="text-stone text-sm leading-relaxed font-light">
                              {story.experience}
                            </p>
                          </div>
                        </div>

                        {/* What Changed Highlight Card */}
                        <div className="p-5 bg-obsidian border border-border-subtle/80 mb-6">
                          <span className="text-[0.65rem] tracking-editorial-ultra text-champagne uppercase block mb-1.5 font-medium">
                            Key Wardrobe Evolution
                          </span>
                          <p className="text-stone text-xs sm:text-sm font-light leading-relaxed">
                            {story.whatChanged}
                          </p>
                        </div>

                        {/* Diagnostic Breakdown Matrix */}
                        <div className="bg-obsidian/60 border border-border-subtle p-5">
                          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-subtle">
                            <span className="text-[0.65rem] tracking-editorial-ultra text-stone uppercase">
                              Diagnostic Breakdown
                            </span>
                            <div className="inline-flex p-0.5 bg-charcoal border border-border-subtle text-[0.62rem]">
                              <button
                                type="button"
                                onClick={() => toggleStoryView(story.id, 'before')}
                                className={`px-2.5 py-0.5 uppercase tracking-widest ${
                                  currentView === 'before'
                                    ? 'bg-obsidian text-warm-ivory font-medium'
                                    : 'text-stone hover:text-warm-ivory'
                                }`}
                              >
                                Before Audit
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleStoryView(story.id, 'after')}
                                className={`px-2.5 py-0.5 uppercase tracking-widest ${
                                  currentView === 'after'
                                    ? 'bg-champagne text-obsidian font-semibold'
                                    : 'text-stone hover:text-warm-ivory'
                                }`}
                              >
                                After Blueprint
                              </button>
                            </div>
                          </div>

                          <span
                            className={`inline-block text-[0.62rem] tracking-editorial-ultra uppercase px-2 py-0.5 mb-2 font-semibold ${
                              currentView === 'after'
                                ? 'bg-champagne/10 border border-champagne/40 text-champagne'
                                : 'bg-surface-subtle border border-border-medium text-stone'
                            }`}
                          >
                            {activeData.tag}
                          </span>
                          <h4 className="font-editorial text-lg text-warm-ivory font-normal mb-3">
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
      </AtelierContainer>
    </section>
  );
};

