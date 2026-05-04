import React, { useEffect, useState, useRef } from 'react';
import Badge from '../shared/Badge';
import { formatPercentage, formatRevenueRange, formatCurrency } from '../../utils/formatters';
import { ArrowRightIcon, CheckIcon } from '../../utils/icons';
import { useAppContext } from '../../context/AppContext';

const MerchantCard = ({ merchant, onClick }) => {
  const [barWidth, setBarWidth] = useState(0);
  const cardRef = useRef(null);
  const { consumerProfile, setIsConsumerProfileOpen } = useAppContext();

  useEffect(() => {
    // Animate the bar width on mount using Intersection Observer so it animates when it comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setBarWidth(merchant.riskScore), 100);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [merchant.riskScore]);

  // Determine colors based on risk score
  const getScoreColorClass = (score) => {
    if (score >= 70) return 'bg-[#10B981]'; // Green
    if (score >= 40) return 'bg-[#F59E0B]'; // Amber
    return 'bg-[#EF4444]'; // Red
  };

  const getScoreTextColorClass = (score) => {
    if (score >= 70) return 'text-[#10B981]';
    if (score >= 40) return 'text-[#F59E0B]';
    return 'text-[#EF4444]';
  };

  return (
    <div 
      ref={cardRef}
      className="tempo-card tempo-card-hover group cursor-pointer overflow-hidden p-0"
      onClick={() => onClick(merchant)}
    >
      <div className="flex h-full flex-col p-6">
        {/* Row 1: Name and Industry */}
        <div className="flex justify-between items-start mb-1">
          <h3 className="mr-2 truncate text-[14px] font-medium text-[var(--text-primary)]" title={merchant.name}>
            {merchant.name}
          </h3>
          <Badge className="shrink-0" color={
            merchant.industry === 'Retail' ? 'blue' :
            merchant.industry === 'Tech' ? 'purple' :
            merchant.industry === 'Restaurant' ? 'amber' :
            merchant.industry === 'Healthcare' ? 'green' : 'cyan'
          }>
            {merchant.industry}
          </Badge>
        </div>

        {/* Row 2: Location */}
        <div className="mb-3 text-[12px] text-[var(--text-secondary)]">
          {merchant.city}, {merchant.state}
        </div>

        {/* Row 2.5: Pre-Approval Badge */}
        <div className="mb-4 h-[24px] flex items-center">
          {consumerProfile?.isSet ? (
            merchant.preapprovalAmount !== undefined ? (
              merchant.preapprovalAmount >= 500 ? (
                <div className="flex items-center rounded-full border border-[rgba(34,197,94,0.2)] bg-[var(--status-approve-subtle)] px-3 py-1 text-[var(--status-approve)]">
                  <CheckIcon className="w-3.5 h-3.5 mr-1" />
                  <span className="text-[12px] font-medium">Pre-approved up to {formatCurrency(merchant.preapprovalAmount)}</span>
                </div>
              ) : merchant.preapprovalAmount > 100 ? (
                <div className="flex items-center rounded-full border border-[rgba(234,179,8,0.2)] bg-[var(--status-review-subtle)] px-3 py-1 text-[var(--status-review)]">
                  <span className="text-[12px] font-medium">Limited approval ({formatCurrency(merchant.preapprovalAmount)})</span>
                </div>
              ) : (
                <div className="flex items-center rounded-full border border-[rgba(239,68,68,0.2)] bg-[var(--status-decline-subtle)] px-3 py-1 text-[var(--status-decline)]">
                  <span className="text-[12px] font-medium">Not eligible</span>
                </div>
              )
            ) : (
              <div className="flex items-center px-2 py-1 text-[var(--text-tertiary)]">
                <span className="text-[12px]">Checking offers...</span>
              </div>
            )
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsConsumerProfileOpen(true); }}
              className="flex items-center text-[12px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] group/profile"
            >
              Set profile for credit offers <ArrowRightIcon className="w-3 h-3 ml-1 group-hover/profile:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Row 3: Risk Score Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-end mb-1">
            <span className="text-[11px] text-[var(--text-tertiary)]">Risk Score</span>
            <span className={`text-[13px] font-semibold font-mono-num ${getScoreTextColorClass(merchant.riskScore)}`}>
              {merchant.riskScore}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded bg-[var(--border-default)]">
            <div 
              className={`h-full rounded transition-all duration-600 ease-out ${getScoreColorClass(merchant.riskScore)}`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </div>

        {/* Row 4: Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="mb-0.5 text-[11px] text-[var(--text-tertiary)]">Approval Rate</div>
            <div className="text-[14px] font-medium text-[var(--text-primary)]">
              {formatPercentage(merchant.approvalRate)}
            </div>
          </div>
          <div>
            <div className="mb-0.5 text-[11px] text-[var(--text-tertiary)]">Revenue</div>
            <div className="text-[13px] text-[var(--text-secondary)]">
              {formatRevenueRange(merchant.revenueMin, merchant.revenueMax)}
            </div>
          </div>
        </div>

        {/* Row 5: Action Link */}
        <div className="mt-auto flex items-center justify-between border-t border-[var(--border-default)] pt-3">
          <span className="flex items-center text-[13px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
            View Details <ArrowRightIcon className="w-3.5 h-3.5 ml-1 inline" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default MerchantCard;
