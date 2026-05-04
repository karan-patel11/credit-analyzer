import React, { useEffect, useState } from 'react';
import { XIcon, ExternalLinkIcon } from '../../utils/icons';
import Badge from '../shared/Badge';
import { formatPercentage, formatCurrency, formatNumber } from '../../utils/formatters';
import { useAppContext } from '../../context/AppContext';
import { useApi } from '../../hooks/useApi';
import { TABS } from '../../utils/constants';
import { mockCreditChecks } from '../../data/mockData';

const RiskGauge = ({ score }) => {
  const [offset, setOffset] = useState(100);
  
  useEffect(() => {
    // Start animation on mount
    setTimeout(() => {
      setOffset(100 - score);
    }, 100);
  }, [score]);

  const getColorClass = () => {
    if (score >= 70) return 'stroke-[#10B981]';
    if (score >= 40) return 'stroke-[#F59E0B]';
    return 'stroke-[#EF4444]';
  };

  const getLabel = () => {
    if (score >= 70) return 'Low Risk';
    if (score >= 40) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[120px] h-[120px]">
        {/* Background track */}
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="var(--border-default)"
            strokeWidth="8"
          />
          {/* Animated fill */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={`transition-all duration-800 ease-out ${getColorClass()}`}
            strokeDasharray="251.2"
            strokeDashoffset={251.2 * (offset / 100)}
            style={{ 
              animation: 'dashoffset 800ms ease-out forwards',
              '--target-offset': 251.2 * ((100 - score) / 100)
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[28px] font-bold font-mono-num text-[var(--text-primary)]">{score}</span>
        </div>
      </div>
      <div className="mt-2 text-[13px] font-medium text-[var(--text-secondary)]">{getLabel()}</div>
    </div>
  );
};

const MerchantDetail = ({ merchant, onClose }) => {
  const { setActiveTab, consumerProfile, setIsConsumerProfileOpen, demoMode } = useAppContext();
  const { request } = useApi();
  const [isOpen, setIsOpen] = useState(false);
  
  // Eligibility State
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);

  useEffect(() => {
    if (merchant) {
      setIsOpen(true);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [merchant]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 200); // Wait for exit animation
  };

  const handleAnalyze = () => {
    setActiveTab(TABS.CREDIT_ANALYSIS);
  };

  const handleCheckEligibility = async () => {
    if (!purchaseAmount || isNaN(purchaseAmount)) return;
    setIsChecking(true);
    
    const amount = Number(purchaseAmount);
    
    if (demoMode) {
      setTimeout(() => {
        let result;
        const preapproved = merchant.preapprovalAmount || 0;
        if (amount < preapproved * 0.8) {
          result = mockCreditChecks.approved;
        } else if (amount >= preapproved * 0.8 && amount <= preapproved * 1.2) {
          result = mockCreditChecks.review;
        } else {
          result = mockCreditChecks.declined;
        }
        
        // Generate plans dynamically if approved/review
        if (result.decision !== 'DECLINED') {
          const plans = [];
          plans.push({ label: 'Pay in 4', months: 4, monthly_payment: amount/4, apr: 0, total_cost: amount });
          
          const r6 = (10/100)/12;
          const m6 = amount * (r6 * (1 + r6)**6) / ((1 + r6)**6 - 1);
          plans.push({ label: 'Pay in 6', months: 6, monthly_payment: m6, apr: 10, total_cost: m6*6 });
          
          const r12 = (15/100)/12;
          const m12 = amount * (r12 * (1 + r12)**12) / ((1 + r12)**12 - 1);
          plans.push({ label: 'Pay in 12', months: 12, monthly_payment: m12, apr: 15, total_cost: m12*12 });
          
          if (amount > 1000 && result.decision === 'APPROVED') {
            const r24 = (20/100)/12;
            const m24 = amount * (r24 * (1 + r24)**24) / ((1 + r24)**24 - 1);
            plans.push({ label: 'Pay in 24', months: 24, monthly_payment: m24, apr: 20, total_cost: m24*24 });
          }
          result = { ...result, payment_plans: plans };
        }
        
        setEligibilityResult(result);
        setIsChecking(false);
      }, 400);
    } else {
      try {
        const data = await request('/credit/instant-check', {
          method: 'POST',
          body: JSON.stringify({
            monthly_income: consumerProfile.monthlyIncome,
            monthly_debt: consumerProfile.monthlyDebt,
            credit_tier: consumerProfile.creditTier,
            merchant_id: merchant.id,
            purchase_amount: amount
          })
        });
        setEligibilityResult(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsChecking(false);
      }
    }
  };

  const resetEligibility = () => {
    setEligibilityResult(null);
    setPurchaseAmount('');
    setSelectedPlanIndex(0);
  };

  if (!merchant) return null;

  const maxApp = merchant.preapprovalAmount || 0;
  const numAmount = Number(purchaseAmount) || 0;
  let hint = null;
  if (numAmount > 0 && maxApp > 0) {
    if (numAmount <= maxApp) {
      hint = { text: '✓ Within your pre-approved limit', color: 'text-[#10B981]' };
    } else if (numAmount <= maxApp * 1.5) {
      hint = { text: '⚠ Above pre-approved limit — may require review', color: 'text-[#F59E0B]' };
    } else {
      hint = { text: '✗ Significantly above your limit', color: 'text-[#EF4444]' };
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 backdrop-blur-sm
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleClose}
      />

      {/* Slide-in Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col border-l border-[var(--border-default)] bg-[var(--bg-primary)] transition-transform duration-200 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-secondary)] p-6">
          <div>
            <h2 className="mb-1 text-[20px] font-normal tracking-[-0.03em] text-[var(--text-primary)]">{merchant.name}</h2>
            <div className="flex items-center space-x-2 text-[13px] text-[var(--text-secondary)]">
              <Badge color="blue">{merchant.industry}</Badge>
              <span>•</span>
              <span>{merchant.city}, {merchant.state}</span>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="rounded-[8px] p-2 text-[var(--text-tertiary)] transition-colors-fast hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <section>
            <h3 className="mb-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Risk Profile</h3>
            <div className="flex flex-col items-center justify-center rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
              <RiskGauge score={merchant.riskScore} />
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Financial Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
                <div className="mb-1 text-[11px] text-[var(--text-tertiary)]">Total Applications</div>
                <div className="text-[16px] font-semibold text-[var(--text-primary)]">{formatNumber(merchant.applications)}</div>
              </div>
              <div className="rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
                <div className="mb-1 text-[11px] text-[var(--text-tertiary)]">Approval Rate</div>
                <div className="font-mono-num text-[16px] font-semibold text-[var(--text-primary)]">{formatPercentage(merchant.approvalRate)}</div>
              </div>
              <div className="col-span-2 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="mb-1 text-[11px] text-[var(--text-tertiary)]">Estimated Annual Revenue</div>
                    <div className="text-[16px] font-semibold text-[var(--text-primary)]">
                      {formatCurrency(merchant.revenueMin)} – {formatCurrency(merchant.revenueMax)}
                    </div>
                  </div>
                  <Badge color={merchant.riskTier === 'LOW' ? 'green' : merchant.riskTier === 'MEDIUM' ? 'amber' : 'red'}>
                    Tier: {merchant.riskTier}
                  </Badge>
                </div>
              </div>
            </div>
          </section>

          {merchant.applications > 0 && (
            <section>
              <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Recent Activity</h3>
              <div className="overflow-hidden rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-card)]">
                <div className="flex items-center justify-between border-b border-[var(--border-default)] p-3">
                  <span className="text-[13px] text-[var(--text-secondary)]">Last evaluation</span>
                  <span className="text-[13px] text-[var(--text-primary)]">2 days ago</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="text-[13px] text-[var(--text-secondary)]">Status</span>
                  <span className="flex items-center text-[13px] text-[var(--status-approve)]">
                    <div className="mr-2 h-1.5 w-1.5 rounded-full bg-[var(--status-approve)]"></div>
                    Approved
                  </span>
                </div>
              </div>
            </section>
          )}

          <hr className="border-[var(--border-default)]" />

          <section>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Check Your Eligibility</h3>
            
            {!consumerProfile?.isSet ? (
              <div className="rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-card)] p-6 text-center">
                <p className="mb-4 text-[13px] text-[var(--text-secondary)]">Set up your financial profile to check eligibility at this merchant.</p>
                <button 
                  onClick={() => setIsConsumerProfileOpen(true)}
                  className="tempo-button h-10 min-h-0 px-4 text-[13px]"
                >
                  Set Profile →
                </button>
              </div>
            ) : eligibilityResult ? (
              <div className="space-y-6">
                {/* Decision Banner */}
                <div className={`rounded-lg p-4 flex flex-col items-center justify-center text-center ${
                  eligibilityResult.decision === 'APPROVED' ? 'border border-[rgba(34,197,94,0.2)] bg-[var(--status-approve-subtle)]' :
                  eligibilityResult.decision === 'REVIEW' ? 'border border-[rgba(234,179,8,0.2)] bg-[var(--status-review-subtle)]' :
                  'border border-[rgba(239,68,68,0.2)] bg-[var(--status-decline-subtle)]'
                }`}>
                  <h4 className={`text-[18px] font-bold mb-1 ${
                    eligibilityResult.decision === 'APPROVED' ? 'text-[var(--status-approve)]' :
                    eligibilityResult.decision === 'REVIEW' ? 'text-[var(--status-review)]' :
                    'text-[var(--status-decline)]'
                  }`}>
                    {eligibilityResult.decision === 'APPROVED' ? "You're Approved! ✓" :
                     eligibilityResult.decision === 'REVIEW' ? "Approved with Conditions" :
                     "Not Approved"}
                  </h4>
                  <p className="text-[13px] text-[var(--text-secondary)]">Requested Amount: {formatCurrency(eligibilityResult.requested_amount)}</p>
                </div>

                {/* Payment Plans */}
                {eligibilityResult.payment_plans?.length > 0 && (
                  <div>
                    <h4 className="mb-3 text-[13px] font-medium text-[var(--text-primary)]">Payment Options</h4>
                    <div className="flex space-x-3 overflow-x-auto pb-2 snap-x">
                      {eligibilityResult.payment_plans.map((plan, idx) => (
                        <div 
                          key={plan.label}
                          onClick={() => setSelectedPlanIndex(idx)}
                          className={`w-[140px] shrink-0 cursor-pointer snap-center rounded-[12px] border p-4 transition-all ${
                            selectedPlanIndex === idx 
                              ? 'border-[var(--text-primary)] bg-[var(--accent-subtle)]' 
                              : 'border-[var(--border-default)] bg-[var(--bg-card)] hover:border-[var(--border-hover)]'
                          }`}
                        >
                          <div className="mb-2 text-[14px] font-semibold text-[var(--text-primary)]">{plan.label}</div>
                          <div className="mb-1 font-mono-num text-[20px] font-bold text-[var(--text-primary)]">
                            {formatCurrency(plan.monthly_payment)}<span className="font-sans text-[12px] text-[var(--text-secondary)]">/mo</span>
                          </div>
                          <div className={`mb-1 text-[12px] font-medium ${plan.apr === 0 ? 'text-[var(--status-approve)]' : 'text-[var(--text-tertiary)]'}`}>
                            {plan.apr}% APR
                          </div>
                          <div className="text-[11px] text-[var(--text-tertiary)]">
                            Total: {formatCurrency(plan.total_cost)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decision Factors */}
                <div className="rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
                  <h4 className="mb-4 text-[13px] font-medium text-[var(--text-primary)]">Decision Factors</h4>
                  <ul className="space-y-3">
                    {eligibilityResult.decision_factors.map((factor, i) => {
                      const lower = factor.toLowerCase();
                      let dotColor = 'bg-[var(--text-tertiary)]';
                      if (lower.includes('healthy') || lower.includes('within') || lower.includes('low (high')) dotColor = 'bg-[var(--status-approve)]';
                      else if (lower.includes('elevated') || lower.includes('caution')) dotColor = 'bg-[var(--status-review)]';
                      else if (lower.includes('exceeds') || lower.includes('insufficient') || lower.includes('poor')) dotColor = 'bg-[var(--status-decline)]';

                      return (
                        <li key={i} className="flex items-start">
                          <div className={`w-2 h-2 rounded-full mt-1.5 mr-3 shrink-0 ${dotColor}`} />
                          <span className="text-[13px] leading-relaxed text-[var(--text-secondary)]">{factor}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Risk Score */}
                <div className="flex justify-center mt-2">
                  <div className="text-center">
                    <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Transaction Score</div>
                    <RiskGauge score={eligibilityResult.risk_score} />
                  </div>
                </div>

                <button 
                  onClick={resetEligibility}
                  className="mt-2 w-full py-2 text-[13px] text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
                >
                  Try Another Amount
                </button>
              </div>
            ) : (
              <div className="rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
                {maxApp > 0 ? (
                  <div className="mb-5 text-center">
                    <div className="mb-1 text-[12px] text-[var(--text-secondary)]">Pre-approved up to</div>
                    <div className="text-[24px] font-bold text-[var(--status-approve)]">{formatCurrency(maxApp)}</div>
                  </div>
                ) : (
                  <div className="mb-5 text-center">
                    <div className="text-[12px] text-[var(--status-decline)]">Not eligible for pre-approval</div>
                  </div>
                )}
                
                <label className="tempo-label">How much do you want to spend?</label>
                <div className="tempo-input-shell mb-1">
                  <span className="absolute left-0 top-0 text-[var(--text-tertiary)]">$</span>
                  <input
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    placeholder="1,500"
                    className="tempo-input pl-4"
                  />
                </div>
                {hint && (
                  <p className={`text-[12px] mb-4 ${hint.color}`}>{hint.text}</p>
                )}
                {!hint && <div className="mb-4"></div>}

                <button 
                  onClick={handleCheckEligibility}
                  disabled={!purchaseAmount || isChecking}
                  className="tempo-button w-full disabled:opacity-40"
                >
                  {isChecking ? (
                    <span className="flex items-center">
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border border-white/30 border-t-white"></div>
                      Checking...
                    </span>
                  ) : (
                    'Check Eligibility'
                  )}
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[var(--border-default)] bg-[var(--bg-secondary)] p-6">
          <button 
            onClick={handleAnalyze}
            className="tempo-button w-full"
          >
            <span>Run Credit Analysis</span>
            <ExternalLinkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};

export default MerchantDetail;
