import React, { forwardRef } from 'react';
import { Sparkles } from 'lucide-react';

export const Eyebrow = forwardRef(({
  children,
  icon = true,
  className = '',
  as: Component = 'div',
  ...props
}, ref) => {
  return (
    <Component
      ref={ref}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 border border-border-medium bg-charcoal/60 text-muted-gold text-[0.7rem] tracking-editorial-ultra uppercase font-medium ${className}`}
      {...props}
    >
      {icon && <Sparkles size={12} className="text-muted-gold shrink-0" />}
      <span>{children}</span>
    </Component>
  );
});

Eyebrow.displayName = 'Eyebrow';
