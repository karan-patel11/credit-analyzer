import React from 'react';
import RiskGauge from './RiskGauge';
import { AlertTriangleIcon, CheckIcon, XIcon, RefreshIcon, ChevronDownIcon } from '../../utils/icons';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const CreditMemo = ({ result, onReset }) => {
  if (!result) return null;

  const getDecisionStyles = () => {
    switch (result.decision) {
      case 'APPROVE':
        return {
          bg: 'bg-[var(--status-approve-subtle)]',
          border: 'border-[var(--status-approve)]',
          text: 'text-[var(--status-approve)]',
          icon: <CheckIcon className="h-5 w-5 text-[var(--status-approve)]" />
        };
      case 'REVIEW':
        return {
          bg: 'bg-[var(--status-review-subtle)]',
          border: 'border-[var(--status-review)]',
          text: 'text-[var(--status-review)]',
          icon: <AlertTriangleIcon className="h-5 w-5 text-[var(--status-review)]" />
        };
      case 'DECLINE':
      default:
        return {
          bg: 'bg-[var(--status-decline-subtle)]',
          border: 'border-[var(--status-decline)]',
          text: 'text-[var(--status-decline)]',
          icon: <XIcon className="h-5 w-5 text-[var(--status-decline)]" />
        };
    }
  };

  const decisionStyles = getDecisionStyles();

  return (
    <div className="flex flex-col h-full overflow-y-auto animate-fade-in pr-2">
      
      {/* Decision Banner */}
      <div className={`mb-6 flex flex-col rounded-[12px] border p-5 ${decisionStyles.bg} ${decisionStyles.border}`}>
        <div className="flex items-center space-x-3 mb-2">
          {decisionStyles.icon}
          <div>
            <h2 className={`text-[16px] font-bold tracking-wide ${decisionStyles.text}`}>
              {result.decision === 'REVIEW' ? 'NEEDS REVIEW' : result.decision}
            </h2>
            <div className="text-[13px] text-[var(--text-secondary)]">{result.confidence}</div>
          </div>
        </div>
        <div className={`text-[13px] font-medium ${decisionStyles.text}`}>
          Merchant Onboarding Recommendation: {result.decision} for KAPS marketplace
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 mb-8">
        {/* Risk Gauge */}
        <div className="flex shrink-0 flex-col items-center justify-center rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-card)] p-6 xl:w-[240px]">
          <h3 className="mb-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Risk Score</h3>
          <RiskGauge score={result.score} />
        </div>

        {/* Financial Metrics */}
        <div className="flex-1">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Financial Metrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricCard label="Total Deposits" value={formatCurrency(result.metrics?.totalDeposits)} />
            <MetricCard label="Total Withdrawals" value={formatCurrency(result.metrics?.totalWithdrawals)} />
            <MetricCard label="Avg Balance" value={formatCurrency(result.metrics?.avgBalance)} />
            <MetricCard label="Min Balance" value={formatCurrency(result.metrics?.minBalance)} 
              isWarning={result.metrics?.minBalance < 0} 
            />
            <MetricCard label="Overdraft Count" value={result.metrics?.overdraftCount} 
              isWarning={result.metrics?.overdraftCount > 0}
            />
            
            <div className="rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3">
              <div className="mb-1 text-[11px] text-[var(--text-tertiary)]">Cash Flow Trend</div>
              <div className="flex items-center space-x-1">
                <span className="text-[16px] font-semibold font-mono-num text-[var(--text-primary)]">
                  {result.metrics?.cashFlowTrend === 'up' ? 'Positive' : 'Negative'}
                </span>
                {result.metrics?.cashFlowTrend === 'up' ? (
                  <span className="text-[var(--status-approve)]">↑</span>
                ) : (
                  <span className="text-[var(--status-decline)]">↓</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Memo Narrative */}
      <div className="mb-8">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Credit Memo</h3>
        <div className="rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <p className="text-[13px] leading-[1.7] text-[var(--text-primary)]">
            {result.memo}
          </p>
        </div>
      </div>

      {/* Flags & Concerns */}
      {result.flags && result.flags.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Flags & Concerns</h3>
          <div className="space-y-2">
            {result.flags.map((flag, idx) => (
              <div key={idx} className="flex items-start space-x-3 rounded-[12px] border border-[rgba(234,179,8,0.2)] bg-[var(--status-review-subtle)] p-3">
                <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--status-review)]" />
                <span className="text-[13px] text-[var(--text-primary)]">{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto border-t border-[var(--border-default)] pt-6">
        <button
          onClick={onReset}
          className="tempo-button tempo-button-subtle h-[40px] min-h-0 px-4"
        >
          <RefreshIcon className="w-4 h-4" />
          <span className="text-[13px] font-medium">Run Another Analysis</span>
        </button>
      </div>

    </div>
  );
};

const MetricCard = ({ label, value, isWarning = false }) => (
  <div className={`rounded-[12px] border bg-[var(--bg-secondary)] p-3 transition-colors-fast
    ${isWarning ? 'border-[rgba(239,68,68,0.25)]' : 'border-[var(--border-default)]'}`}
  >
    <div className="mb-1 truncate text-[11px] text-[var(--text-tertiary)]" title={label}>{label}</div>
    <div className={`text-[16px] font-semibold font-mono-num truncate 
      ${isWarning ? 'text-[var(--status-decline)]' : 'text-[var(--text-primary)]'}`} title={value}>
      {value}
    </div>
  </div>
);

export default CreditMemo;
