import React, { useState, useEffect } from 'react';
import { XIcon } from '../../utils/icons';
import { useAppContext } from '../../context/AppContext';

const ConsumerProfile = ({ isOpen, onClose }) => {
  const { consumerProfile, setConsumerProfile } = useAppContext();
  
  // Local state for the form
  const [income, setIncome] = useState('');
  const [debt, setDebt] = useState('');
  const [creditTier, setCreditTier] = useState('good');
  
  // Sync with context when opened
  useEffect(() => {
    if (isOpen) {
      setIncome(consumerProfile.monthlyIncome || '');
      setDebt(consumerProfile.monthlyDebt !== undefined ? consumerProfile.monthlyDebt : '');
      setCreditTier(consumerProfile.creditTier || 'good');
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, consumerProfile]);

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    setConsumerProfile({
      monthlyIncome: Number(income) || 0,
      monthlyDebt: Number(debt) || 0,
      creditTier,
      isSet: true
    });
    handleClose();
  };

  const tiers = [
    { id: 'excellent', label: 'Excellent', range: '750+' },
    { id: 'good', label: 'Good', range: '670-749' },
    { id: 'fair', label: 'Fair', range: '580-669' },
    { id: 'poor', label: 'Poor', range: '<580' }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 backdrop-blur-sm
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleClose}
      />

      {/* Slide-in Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[360px] flex-col border-l border-[var(--border-default)] bg-[var(--bg-primary)] transition-transform duration-200 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-secondary)] p-6">
          <div>
            <h2 className="mb-1 text-[16px] font-normal tracking-[-0.03em] text-[var(--text-primary)]">Your Financial Profile</h2>
            <p className="text-[13px] text-[var(--text-secondary)]">Set your profile to see personalized credit offers across all merchants</p>
          </div>
          <button 
            onClick={handleClose}
            className="shrink-0 -mr-2 rounded-[8px] p-2 text-[var(--text-tertiary)] transition-colors-fast hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div>
            <label className="tempo-label">Monthly Income</label>
            <div className="tempo-input-shell">
              <span className="absolute left-0 top-0 text-[var(--text-tertiary)]">$</span>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="5,000"
                className="tempo-input pl-4"
              />
            </div>
          </div>

          <div>
            <label className="tempo-label">Monthly Debt Payments</label>
            <div className="tempo-input-shell mb-1">
              <span className="absolute left-0 top-0 text-[var(--text-tertiary)]">$</span>
              <input
                type="number"
                value={debt}
                onChange={(e) => setDebt(e.target.value)}
                placeholder="800"
                className="tempo-input pl-4"
              />
            </div>
            <p className="text-[12px] text-[var(--text-tertiary)]">Include rent, car, loans, minimum credit card payments</p>
          </div>

          <div>
            <label className="tempo-label">Credit Score Range</label>
            <div className="grid grid-cols-2 gap-3">
              {tiers.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setCreditTier(tier.id)}
                  className={`flex flex-col items-start rounded-[12px] border p-3 text-left transition-all ${
                    creditTier === tier.id 
                      ? 'border-[var(--text-primary)] bg-[var(--accent-subtle)]' 
                      : 'border-[var(--border-default)] bg-[var(--bg-card)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <span className={`mb-0.5 text-[13px] font-medium ${creditTier === tier.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>
                    {tier.label}
                  </span>
                  <span className={`text-[12px] ${creditTier === tier.id ? 'text-[var(--text-secondary)]' : 'text-[var(--text-tertiary)]'}`}>
                    {tier.range}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border-default)] bg-[var(--bg-secondary)] p-6">
          <button 
            onClick={handleSave}
            disabled={!income || !debt}
            className="tempo-button mb-3 w-full"
          >
            Save Profile
          </button>
          <p className="text-center text-[11px] text-[var(--text-tertiary)]">
            Your data stays in your browser. Nothing is stored on our servers.
          </p>
        </div>
      </div>
    </>
  );
};

export default ConsumerProfile;
