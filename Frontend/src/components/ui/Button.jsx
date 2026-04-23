import React from 'react';
import { Loader2Icon } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg dark:focus:ring-offset-brand-dark disabled:pointer-events-none disabled:opacity-50';

  const variants = {
    primary:
      'bg-brand-navy text-brand-cream hover:-translate-y-0.5 hover:bg-purple-700 focus:ring-brand-navy shadow-soft',
    secondary:
      'bg-brand-mist text-brand-navy hover:-translate-y-0.5 hover:bg-blue-300 focus:ring-brand-mist shadow-soft',
    outline:
      'border border-brand-mist/70 bg-white/50 text-brand-navy hover:bg-brand-cream/80 dark:border-brand-mist/20 dark:bg-brand-surface/45 dark:text-brand-cream dark:hover:bg-brand-surface-hover focus:ring-brand-mist',
    ghost:
      'bg-transparent text-brand-navy hover:bg-brand-cream/70 dark:text-brand-cream dark:hover:bg-brand-surface-hover focus:ring-brand-mist',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 shadow-soft'
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}
