import React from 'react';
import FileUpload from './FileUpload';
import { demoScenarios } from '../../data/mockData';
import { AlertTriangleIcon } from '../../utils/icons';

const ApplicationForm = ({ formData, setFormData, onAnalyze, isAnalyzing }) => {
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDemoLoad = (scenarioKey) => {
    const scenario = demoScenarios[scenarioKey];
    setFormData({
      businessName: scenario.businessName,
      industry: scenario.industry,
      annualRevenue: scenario.annualRevenue.toString(),
      loanAmount: scenario.loanAmount.toString(),
      file: { name: scenario.file, size: 45000, type: 'text/csv' } // Mock file object
    });
  };

  const isFormValid = () => {
    return (
      formData.businessName.trim() !== '' &&
      formData.industry.trim() !== '' &&
      formData.annualRevenue !== '' &&
      formData.loanAmount !== '' &&
      formData.file !== null
    );
  };

  const revNum = Number(formData.annualRevenue) || 0;
  const loanNum = Number(formData.loanAmount) || 0;
  const showWarning = revNum > 0 && loanNum > (revNum * 2);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="mb-1 text-[16px] font-normal tracking-[-0.03em] text-[var(--text-primary)]">Merchant Onboarding Review</h2>
        <p className="mb-2 text-[13px] text-[var(--text-secondary)]">Evaluate a business for onboarding to the KAPS marketplace. Upload bank statements to generate a financial risk assessment.</p>
        <p className="text-[12px] italic text-[var(--text-tertiary)]">This tool assesses whether a business meets KAPS AI&apos;s merchant risk and financial health requirements for marketplace inclusion.</p>
      </div>

      <form className="flex-1 space-y-4" onSubmit={(e) => { e.preventDefault(); onAnalyze(); }}>
        <div>
          <label className="tempo-label">Business Name</label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            className="tempo-input"
            placeholder="e.g. Acme Corp"
            disabled={isAnalyzing}
          />
        </div>

        <div>
          <label className="tempo-label">Industry</label>
          <input
            type="text"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="tempo-input"
            placeholder="e.g. Tech"
            disabled={isAnalyzing}
          />
        </div>

        <div>
          <label className="tempo-label">Annual Revenue</label>
          <div className="tempo-input-shell">
            <span className="absolute left-0 top-0 text-[var(--text-tertiary)]">$</span>
            <input
              type="number"
              name="annualRevenue"
              value={formData.annualRevenue}
              onChange={handleChange}
              className="tempo-input pl-4 font-mono-num"
              placeholder="0"
              disabled={isAnalyzing}
            />
          </div>
        </div>

        <div>
          <label className="tempo-label">Loan Amount</label>
          <div className="tempo-input-shell">
            <span className="absolute left-0 top-0 text-[var(--text-tertiary)]">$</span>
            <input
              type="number"
              name="loanAmount"
              value={formData.loanAmount}
              onChange={handleChange}
              className="tempo-input pl-4 font-mono-num"
              placeholder="0"
              disabled={isAnalyzing}
            />
          </div>
          {showWarning && (
            <div className="mt-2 flex items-center text-[11px] text-[var(--status-review)]">
              <AlertTriangleIcon className="w-3 h-3 mr-1" />
              <span>High loan-to-revenue ratio</span>
            </div>
          )}
        </div>

        <FileUpload 
          file={formData.file} 
          setFile={(file) => setFormData(prev => ({ ...prev, file }))} 
        />

        {/* Quick Demo Row */}
        <div className="pt-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Quick Demo</div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => handleDemoLoad('strong')} className="h-[32px] rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-card)] px-3 text-[12px] text-[var(--text-secondary)] transition-all-fast hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]">Strong Business ✓</button>
            <button type="button" onClick={() => handleDemoLoad('borderline')} className="h-[32px] rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-card)] px-3 text-[12px] text-[var(--text-secondary)] transition-all-fast hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]">Borderline ~</button>
            <button type="button" onClick={() => handleDemoLoad('weak')} className="h-[32px] rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-card)] px-3 text-[12px] text-[var(--text-secondary)] transition-all-fast hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]">Weak ✗</button>
            <button type="button" onClick={() => handleDemoLoad('seasonal')} className="h-[32px] rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-card)] px-3 text-[12px] text-[var(--text-secondary)] transition-all-fast hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]">Seasonal ?</button>
          </div>
        </div>

        <div className="pt-6 mt-auto">
          <button
            type="submit"
            disabled={!isFormValid() || isAnalyzing}
            className={`flex h-[44px] w-full items-center justify-center rounded-[8px] border text-[14px] font-medium transition-all-fast
              ${!isFormValid() || isAnalyzing 
                ? 'cursor-not-allowed border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-tertiary)]' 
                : 'border-[var(--accent)] bg-[var(--accent)] text-white hover:border-[#222222] hover:bg-[#222222]'
              }`}
          >
            {isAnalyzing ? (
              <div className="flex items-center space-x-2">
                <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing...</span>
              </div>
            ) : (
              'Analyze'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;
