import React from 'react';
import { ArrowUpRight, UserCheck, Eye, Shapes, Palette, Sparkles, BookOpen, Clock, ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { AtelierContainer, SectionHeading, Card, Button, SEO } from '@/components/ui';

export const HowItWorksPage = () => {
  const methodPhases = [
    {
      num: '01',
      icon: UserCheck,
      title: 'Profile — The Person Behind The Wardrobe',
      timing: 'Intake & Stylist Discussion',
      desc: 'Understanding your individual lifestyle, career demands, aesthetic goals, comfort boundaries, and personal style aspirations. We anchor styling decisions in who you are and how you actually live.',
      inclusions: [
        'Confidential lifestyle & wardrobe questionnaire',
        '30-minute private 1:1 stylist consultation session',
        'Occasion-aware and practical lifestyle priorities',
      ],
    },
    {
      num: '02',
      icon: Eye,
      title: 'Visage — The Visual Frame',
      timing: 'Facial Analysis & Optical Balance',
      desc: 'Analyzing your face shape, features, and bone structure to identify flattering necklines, eyewear frames, earring shapes, and haircut/hairstyling direction for everyday and special occasions.',
      inclusions: [
        'Face-shape breakdown and optical balancing rules',
        'Flattering eyewear geometry and sunglass framing',
        'Neckline and sleeve style recommendations',
        'Haircut, styling direction & accessory pairing',
      ],
    },
    {
      num: '03',
      icon: Shapes,
      title: 'Form — Proportions & Silhouette Strategy',
      timing: 'Body Shape & Proportional Balance',
      desc: 'Evaluating body proportions, horizontal and vertical lines, and movement to establish deliberate silhouette strategies. We focus on column dressing, proportion balancing, waist definition, fabrics, and tailoring guidance.',
      inclusions: [
        'Body shape identification and proportional balancing',
        'Waist definition and column dressing techniques',
        'Fabric drape, textures, prints, and scale guidance',
        'Fit, tailoring modifications, and hemline guidelines',
      ],
    },
    {
      num: '04',
      icon: Palette,
      title: 'Palette — Chromatic Harmony',
      timing: 'Skin Tone & Undertone Discovery',
      desc: 'Discovering the specific shades and undertones that make your natural coloring look radiant and energized. Your palette is thoughtfully organized into foundational neutrals, signature colors, accents, and evening shades.',
      inclusions: [
        'Skin tone and warm/cool/neutral undertone analysis',
        'Foundational neutral palette for wardrobe building blocks',
        'Signature colours, seasonal accents & evening shades',
        'Colour coordination rules and contrast level advice',
      ],
    },
    {
      num: '05',
      icon: Sparkles,
      title: 'Signature — Personalised Outfit Direction',
      timing: 'Contextual Look Curation',
      desc: 'Translating theory into tangible, beautiful outfit curation across every context of your life—including professional dressing, smart-casual, elevated casual, ethnic, Indo-Western, and festive occasion wear.',
      inclusions: [
        'Executive & professional silhouette combinations',
        'Smart-casual and relaxed weekend ensembles',
        'Ethnic, festive, and Indo-Western look direction',
        'Footwear, handbag, jewelry, and accessory pairing',
      ],
    },
    {
      num: '06',
      icon: BookOpen,
      title: 'Blueprint — The Tangible Core Deliverable',
      timing: 'Delivered Post-Consultation',
      desc: 'All findings, analyses, and personalized directions are distilled into your STYLEORA Signature Blueprint—an authoritative, comprehensive style dossier designed around you that you can actually use for years to come.',
      inclusions: [
        'Complete Personalised Style Blueprint digital dossier',
        'Summary of all visage, form, palette, and signature looks',
        'Wardrobe essentials, layering, and third-piece strategy',
        'Personalised makeup, grooming, and fragrance finishing notes',
      ],
    },
  ];

  return (
    <>
      <SEO
        title="The STYLEORA Atelier Method — Structured Styling Intelligence"
        description="Discover the 6-phase Atelier Method guiding the STYLEORA Signature Blueprint: Profile, Visage, Form, Palette, Signature, and Blueprint."
      />

      <div className="pt-32 pb-24 md:pt-40 md:pb-32">
        <AtelierContainer size="narrow">
          <SectionHeading
            align="left"
            eyebrow="The STYLEORA Atelier Method"
            title="A Method of Uncompromising Distinction."
            subtitle="Personal style is more than what looks good. It is the relationship between who you are, how you live and how you want to be seen. Our Atelier Method brings those elements together into a style direction that feels distinctly yours."
          />

          {/* Chronological Steps */}
          <div className="flex flex-col gap-8 mb-16">
            {methodPhases.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.num} className="p-8 sm:p-10">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <span className="font-editorial text-4xl text-muted-gold leading-none">
                        {step.num}
                      </span>
                      <div className="w-10 h-10 border border-border-medium flex items-center justify-center text-champagne bg-obsidian">
                        <Icon size={18} />
                      </div>
                    </div>
                    <span className="font-cinzel text-xs text-muted-gold tracking-wider uppercase">
                      {step.timing}
                    </span>
                  </div>

                  <h3 className="font-editorial text-2xl text-warm-ivory mb-3 font-normal">
                    {step.title}
                  </h3>

                  <p className="text-ivory-muted text-sm sm:text-base leading-relaxed font-light mb-6">
                    {step.desc}
                  </p>

                  <div className="pt-4 border-t border-border-subtle/60">
                    <p className="text-xs text-stone uppercase tracking-wider mb-2">Phase Deliverables:</p>
                    <ul className="list-disc list-inside text-xs sm:text-sm text-ivory-muted font-light flex flex-col gap-1.5">
                      {step.inclusions.map((inc) => (
                        <li key={inc}>{inc}</li>
                      ))}
                    </ul>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Bottom Action */}
          <div className="p-8 border border-border-subtle bg-charcoal text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-editorial text-2xl text-warm-ivory mb-1 font-normal">
                Ready to Commission Your Blueprint?
              </h4>
              <p className="text-stone text-sm font-light">
                STYLEORA Signature Blueprint — Complete personal styling experience for ₹2,799.
              </p>
            </div>
            <Button to={ROUTES.CONSULTATION} variant="primary" size="lg" icon={ArrowUpRight}>
              Commission Your Blueprint
            </Button>
          </div>
        </AtelierContainer>
      </div>
    </>
  );
};
