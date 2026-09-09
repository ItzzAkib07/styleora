import React, { forwardRef } from 'react';

export const Card = forwardRef(({
  children,
  className = '',
  hoverEffect = false,
  as: Component = 'div',
  ...props
}, ref) => {
  return (
    <Component
      ref={ref}
      className={`bg-charcoal border border-border-subtle p-6 sm:p-8 md:p-10 transition-all duration-400 ${
        hoverEffect ? 'hover:border-border-medium hover:shadow-ambient hover:-translate-y-1' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';
