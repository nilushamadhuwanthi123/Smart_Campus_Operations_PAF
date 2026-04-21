import React from 'react';

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-brand-cream text-brand-navy dark:bg-brand-surface-hover dark:text-brand-cream',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    warning: 'bg-brand-sand/70 text-brand-navy dark:bg-indigo-900/40 dark:text-brand-sand',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-brand-navy dark:bg-blue-900/30 dark:text-brand-mist'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  let variant = 'default';

  switch (status) {
    case 'APPROVED':
    case 'RESOLVED':
    case 'CLOSED':
    case 'ACTIVE':
      variant = 'success';
      break;
    case 'PENDING':
    case 'IN_PROGRESS':
    case 'MAINTENANCE':
      variant = 'warning';
      break;
    case 'REJECTED':
    case 'CANCELLED':
    case 'OUT_OF_SERVICE':
    case 'CRITICAL':
    case 'HIGH':
      variant = 'danger';
      break;
    case 'OPEN':
    case 'LOW':
    case 'MEDIUM':
      variant = 'info';
      break;
  }

  return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>;
}
