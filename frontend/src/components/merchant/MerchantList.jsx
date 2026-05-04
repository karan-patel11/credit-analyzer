import React from 'react';
import Badge from '../shared/Badge';
import Skeleton from '../shared/Skeleton';
import { formatPercentage, formatRevenueRange } from '../../utils/formatters';
import { ArrowRightIcon } from '../../utils/icons';

const MerchantList = ({ merchants, loading, onSelectMerchant }) => {
  const getScoreColorClass = (score) => {
    if (score >= 70) return 'bg-[#10B981]';
    if (score >= 40) return 'bg-[#F59E0B]';
    return 'bg-[#EF4444]';
  };

  const getScoreTextColorClass = (score) => {
    if (score >= 70) return 'text-[#10B981]';
    if (score >= 40) return 'text-[#F59E0B]';
    return 'text-[#EF4444]';
  };

  if (loading) {
    return (
      <div className="w-full overflow-hidden rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="h-10 border-b border-[var(--border-default)] bg-[var(--bg-secondary)]"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex h-16 items-center gap-4 border-b border-[var(--border-default)] px-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!merchants || merchants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--text-tertiary)]">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)]">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="mb-1 font-medium text-[var(--text-primary)]">No merchants found</h3>
        <p className="text-[13px]">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-card)]">
      <table className="w-full text-left text-[13px]">
        <thead className="sticky top-0 z-10 border-b border-[var(--border-default)] bg-[var(--bg-secondary)] text-[11px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
          <tr>
            <th className="py-3 px-4 font-semibold">Name</th>
            <th className="py-3 px-4 font-semibold">Industry</th>
            <th className="py-3 px-4 font-semibold">Location</th>
            <th className="py-3 px-4 font-semibold w-40">Risk Score</th>
            <th className="py-3 px-4 font-semibold text-right">Approval %</th>
            <th className="py-3 px-4 font-semibold">Revenue</th>
            <th className="py-3 px-4 font-semibold w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-default)]">
          {merchants.map((merchant, idx) => (
            <tr 
              key={merchant.id}
              onClick={() => onSelectMerchant(merchant)}
              className={`h-[64px] cursor-pointer transition-colors-fast group
                ${idx % 2 === 0 ? 'bg-[var(--bg-card)]' : 'bg-[var(--bg-secondary)]'} 
                hover:bg-[var(--bg-card-hover)]`}
            >
              <td className="py-3 px-4 font-medium text-[var(--text-primary)]">{merchant.name}</td>
              <td className="py-3 px-4">
                <Badge color={
                  merchant.industry === 'Retail' ? 'blue' :
                  merchant.industry === 'Tech' ? 'purple' :
                  merchant.industry === 'Restaurant' ? 'amber' :
                  merchant.industry === 'Healthcare' ? 'green' : 'cyan'
                }>
                  {merchant.industry}
                </Badge>
              </td>
              <td className="py-3 px-4 text-[var(--text-secondary)]">{merchant.city}, {merchant.state}</td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <div className="h-1 w-full overflow-hidden rounded bg-[var(--border-default)]">
                    <div 
                      className={`h-full rounded ${getScoreColorClass(merchant.riskScore)}`}
                      style={{ width: `${merchant.riskScore}%` }}
                    />
                  </div>
                  <span className={`font-mono-num font-semibold ${getScoreTextColorClass(merchant.riskScore)} w-6 text-right`}>
                    {merchant.riskScore}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 text-right font-mono-num font-medium text-[var(--text-primary)]">
                {formatPercentage(merchant.approvalRate)}
              </td>
              <td className="py-3 px-4 text-[var(--text-secondary)]">
                {formatRevenueRange(merchant.revenueMin, merchant.revenueMax)}
              </td>
              <td className="py-3 px-4 text-center">
                <ArrowRightIcon className="h-4 w-4 text-[var(--text-tertiary)] opacity-0 transition-colors-fast group-hover:opacity-100 group-hover:text-[var(--text-primary)]" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MerchantList;
