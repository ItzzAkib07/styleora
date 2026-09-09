import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { AtelierContainer, Button, SEO } from '@/components/ui';

export const NotFoundPage = () => {
  return (
    <>
      <SEO
        title="404 — Space Not Found | STYLEORA Atelier"
        description="The requested page does not exist or has been archived in the STYLEORA atelier."
      />

      <div className="pt-40 pb-32 min-h-[85vh] flex items-center justify-center text-center">
        <AtelierContainer size="narrow">
          <span className="font-editorial text-7xl sm:text-8xl md:text-9xl text-muted-gold/70 leading-none block mb-4 font-normal select-none">
            404
          </span>

          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-warm-ivory mb-5 font-normal">
            The Requested Space Does Not Exist.
          </h1>

          <p className="text-stone text-base sm:text-lg max-w-md mx-auto mb-10 leading-relaxed font-light">
            The page you are seeking has been archived or relocated within the STYLEORA atelier records.
          </p>

          <Button to={ROUTES.HOME} variant="primary" size="lg" icon={ArrowLeft}>
            Return to the Atelier
          </Button>
        </AtelierContainer>
      </div>
    </>
  );
};
