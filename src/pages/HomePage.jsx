import React, { useEffect, useState } from 'react';
import { healthService } from '@/services/healthService';
import {
  HeroSection,
  BrandPositioningSection,
  StyleoraLookEdit,
  HowItWorksSection,
  DimensionsSection,
  AtelierSculptureSection,
  BlueprintDeliverableSection,
  StylistAtelierSection,
  PackagesSection,
  HomeFaqSection,
  ConsultationCtaSection,
} from '@/components/home';
import { SEO } from '@/components/ui';

export const HomePage = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    healthService
      .checkReadiness()
      .then((res) => {
        if (mounted && res?.data) {
          setHealth(res.data);
        }
      })
      .catch(() => {
        // Fallback in dev if backend not started yet
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <SEO
        title="STYLEORA — Digital Personal Style Atelier | Your Style, Considered"
        description="STYLEORA is a private luxury personal styling atelier. Bespoke wardrobe architecture, proportion analysis, and seasonal color curation for discerning clientele."
      />
      <div className="flex flex-col">
        <HeroSection health={health} loading={loading} />
        <BrandPositioningSection />
        <StyleoraLookEdit />
        <HowItWorksSection />
        <DimensionsSection />
        <AtelierSculptureSection />
        <BlueprintDeliverableSection />
        <StylistAtelierSection />
        <PackagesSection />
        <HomeFaqSection />
        <ConsultationCtaSection />
      </div>
    </>
  );
};
