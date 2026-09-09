import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';

export const Button = forwardRef(({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  to,
  icon: Icon,
  className = '',
  disabled = false,
  ...props
}, ref) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2.5 font-semibold uppercase tracking-[0.14em] transition-all duration-300 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-champagne';

  const variantClasses = {
    primary:
      'bg-champagne text-obsidian hover:bg-warm-ivory hover:-translate-y-0.5 active:translate-y-0 shadow-sm',
    secondary:
      'border border-border-medium bg-charcoal/80 text-warm-ivory hover:border-champagne hover:bg-champagne/10 hover:-translate-y-0.5',
    outline:
      'border border-border-medium text-warm-ivory hover:border-champagne hover:bg-champagne/5',
    ghost:
      'text-champagne hover:text-warm-ivory bg-transparent hover:bg-transparent',
  }[variant] || '';

  const sizeClasses = {
    sm: 'text-[0.72rem] px-4 py-2',
    md: 'text-[0.8rem] px-7 py-3.5',
    lg: 'text-[0.85rem] px-9 py-4',
  }[size] || 'text-[0.8rem] px-7 py-3.5';

  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`;

  if (to) {
    return (
      <Link ref={ref} to={to} className={combinedClasses} {...props}>
        <span>{children}</span>
        {Icon && <Icon size={size === 'sm' ? 14 : 16} className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />}
      </Link>
    );
  }

  return (
    <button ref={ref} className={combinedClasses} disabled={disabled} {...props}>
      <span>{children}</span>
      {Icon && <Icon size={size === 'sm' ? 14 : 16} className="shrink-0" />}
    </button>
  );
});

Button.displayName = 'Button';
