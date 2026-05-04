import React from 'react';
import { RISK_TIERS } from '../../utils/constants';

const RiskTierToggle = ({ selected = [], onChange }) => {
  const toggleTier = (tier) => {
    if (selected.includes(tier)) {
      onChange(selected.filter(t => t !== tier));
    } else {
      onChange([...selected, tier]);
    }
  };

  const tiers = [
    { id: RISK_TIERS.LOW, label: 'LOW', activeClass: 'border-[rgba(34,197,94,0.25)] bg-[var(--status-approve-subtle)] text-[var(--status-approve)]' },
    { id: RISK_TIERS.MEDIUM, label: 'MEDIUM', activeClass: 'border-[rgba(234,179,8,0.25)] bg-[var(--status-review-subtle)] text-[var(--status-review)]' },
    { id: RISK_TIERS.HIGH, label: 'HIGH', activeClass: 'border-[rgba(239,68,68,0.25)] bg-[var(--status-decline-subtle)] text-[var(--status-decline)]' },
  ];

  return (
    <div className="flex space-x-2">
      {tiers.map((tier) => {
        const isSelected = selected.includes(tier.id);
        
        return (
          <button
            key={tier.id}
            onClick={() => toggleTier(tier.id)}
            className={`
              h-[32px] flex-1 rounded-[8px] border text-[11px] font-medium uppercase tracking-[0.18em] transition-all-fast
              ${isSelected 
                ? tier.activeClass 
                : 'border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
              }
            `}
          >
            {tier.label}
          </button>
        );
      })}
    </div>
  );
};

export default RiskTierToggle;
