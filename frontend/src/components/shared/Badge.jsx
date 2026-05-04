import React from 'react';

const Badge = ({ children, color = 'blue', className = '' }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
      case 'approve':
      case 'low':
        return 'border border-[rgba(34,197,94,0.2)] bg-[var(--status-approve-subtle)] text-[var(--status-approve)]';
      case 'amber':
      case 'review':
      case 'medium':
        return 'border border-[rgba(234,179,8,0.2)] bg-[var(--status-review-subtle)] text-[var(--status-review)]';
      case 'red':
      case 'decline':
      case 'high':
        return 'border border-[rgba(239,68,68,0.2)] bg-[var(--status-decline-subtle)] text-[var(--status-decline)]';
      case 'purple':
      case 'cyan':
      case 'blue':
      default:
        return 'border border-[var(--border-default)] bg-[var(--accent-subtle)] text-[var(--text-secondary)]';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${getColorClasses()} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
