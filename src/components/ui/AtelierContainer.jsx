import React, { forwardRef } from 'react';

export const AtelierContainer = forwardRef(({
  children,
  size = 'standard', // 'standard' | 'narrow' | 'wide' | 'full'
  className = '',
  as: Component = 'div',
  ...props
}, ref) => {
  const sizeClasses = {
    narrow: 'max-w-4xl',
    standard: 'max-w-7xl',
    wide: 'max-w-[1440px]',
    full: 'w-full',
  }[size] || 'max-w-7xl';

  return (
    <Component
      ref={ref}
      className={`w-full mx-auto px-5 sm:px-8 lg:px-12 ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
});

AtelierContainer.displayName = 'AtelierContainer';
