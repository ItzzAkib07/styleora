import React, { forwardRef } from 'react';
import { Eyebrow } from './Eyebrow';

export const SectionHeading = forwardRef(({
  eyebrow,
  title,
  subtitle,
  align = 'center', // 'center' | 'left'
  className = '',
  titleClassName = '',
  subtitleClassName = '',
  ...props
}, ref) => {
  const isCenter = align === 'center';

  return (
    <div
      ref={ref}
      className={`mb-12 md:mb-16 ${isCenter ? 'text-center' : 'text-left'} ${className}`}
      {...props}
    >
      {eyebrow && (
        <div className={`mb-4 ${isCenter ? 'flex justify-center' : ''}`}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
      )}

      {title && (
        <h2
          className={`font-editorial text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.1] text-warm-ivory mb-5 tracking-tight ${titleClassName}`}
        >
          {title}
        </h2>
      )}

      {subtitle && (
        <p
          className={`text-stone text-base sm:text-lg font-light leading-relaxed ${
            isCenter ? 'max-w-2xl mx-auto' : 'max-w-2xl'
          } ${subtitleClassName}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
});

SectionHeading.displayName = 'SectionHeading';
