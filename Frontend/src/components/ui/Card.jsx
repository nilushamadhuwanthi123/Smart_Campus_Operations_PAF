import React from 'react';

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`theme-surface overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`border-b border-brand-sand/55 px-6 py-4 dark:border-brand-mist/15 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div
      className={`border-t border-brand-sand/55 bg-brand-cream/35 px-6 py-4 dark:border-brand-mist/15 dark:bg-brand-surface/45 ${className}`}
    >
      {children}
    </div>
  );
}
