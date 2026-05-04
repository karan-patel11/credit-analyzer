export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '-';
  return `${value}%`;
};

export const formatNumber = (value) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatRevenueRange = (min, max) => {
  const formatCompact = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };
  
  if (!min && !max) return '-';
  if (min && max) return `${formatCompact(min)}–${formatCompact(max)}`;
  if (min) return `${formatCompact(min)}+`;
  return `<${formatCompact(max)}`;
};
