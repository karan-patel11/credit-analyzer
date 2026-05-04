import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { TABS } from '../../utils/constants';
import { DocumentSearchIcon, AlertTriangleIcon, StorefrontIcon } from '../../utils/icons';
import { formatCurrency } from '../../utils/formatters';
import ConsumerProfile from '../consumer/ConsumerProfile';

const TopBar = () => {
  const { activeTab, setActiveTab, demoMode, setDemoMode, healthStatus, consumerProfile, setIsConsumerProfileOpen, isConsumerProfileOpen, setShowLanding } = useAppContext();

  // Determine system status
  const isHealthy = healthStatus.api && healthStatus.mysql && healthStatus.redis;
  
  // Show error banner if backend is down in live mode
  const showOfflineBanner = !demoMode && !isHealthy;

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center border-b border-[var(--border-default)] bg-[var(--bg-primary)] px-4 md:px-6">
        {/* Left: Brand */}
        <div className="flex w-[260px] shrink-0 items-center gap-4">
          <div className="font-display text-[18px] font-medium text-[var(--text-primary)]">KAPS</div>
          <button
            onClick={() => setShowLanding(true)}
            className="text-[13px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            ← Overview
          </button>
        </div>

        {/* Center: Tabs */}
        <div className="flex h-full flex-1 items-center justify-center">
          <div className="flex h-full items-stretch gap-8">
            <button
              onClick={() => setActiveTab(TABS.MERCHANT_DISCOVERY)}
              className={`tempo-tab ${activeTab === TABS.MERCHANT_DISCOVERY ? 'tempo-tab-active' : ''}`}
            >
              <DocumentSearchIcon className="w-[18px] h-[18px]" />
              <span>Merchant Discovery</span>
            </button>
            <button
              onClick={() => setActiveTab(TABS.CREDIT_ANALYSIS)}
              className={`tempo-tab ${activeTab === TABS.CREDIT_ANALYSIS ? 'tempo-tab-active' : ''}`}
            >
              <StorefrontIcon className="w-[18px] h-[18px]" />
              <span>Merchant Onboarding</span>
            </button>
          </div>
        </div>

        {/* Right: Status & Toggles */}
        <div className="flex w-[380px] shrink-0 items-center justify-end gap-5">
          
          <div className="flex items-center">
            {consumerProfile?.isSet ? (
              <button 
                onClick={() => setIsConsumerProfileOpen(true)}
                className="tempo-status-pill border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]"
              >
                <span className="text-[var(--status-approve)]">●</span>
                <span>{formatCurrency(consumerProfile.monthlyIncome).replace('.00', '')}/mo · {consumerProfile.creditTier.charAt(0).toUpperCase() + consumerProfile.creditTier.slice(1)}</span>
              </button>
            ) : (
              <button 
                onClick={() => setIsConsumerProfileOpen(true)}
                className="tempo-link text-[12px]"
              >
                Set Profile →
              </button>
            )}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <div className={`h-2 w-2 rounded-full ${isHealthy ? 'bg-[var(--status-approve)] animate-pulse-status' : 'bg-[var(--status-review)]'}`}></div>
            <span className="text-[12px] text-[var(--text-secondary)]">
              {isHealthy ? 'All Systems Operational' : 'Degraded'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[12px] ${!demoMode ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>Live</span>
            <button 
              onClick={() => setDemoMode(!demoMode)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full border transition-colors-fast focus:outline-none focus:ring-2 focus:ring-black/10 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] ${
                demoMode
                  ? 'border-[var(--border-hover)] bg-[var(--bg-secondary)]'
                  : 'border-[var(--accent)] bg-[var(--accent)]'
              }`}
              role="switch"
              aria-checked={demoMode}
            >
              <span className="sr-only">Toggle demo mode</span>
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform-spring ${demoMode ? 'translate-x-[18px] bg-[var(--accent)]' : 'translate-x-[4px] bg-[var(--bg-primary)]'}`}
              />
            </button>
            <span className={`text-[12px] ${demoMode ? 'font-medium text-[var(--status-review)]' : 'text-[var(--text-tertiary)]'}`}>Demo</span>
          </div>
        </div>
      </header>

      {/* Offline Banner below TopBar */}
      {showOfflineBanner && (
        <div className="fixed left-0 right-0 top-16 z-30 flex items-center justify-between border-b border-[rgba(220,38,38,0.18)] bg-[var(--status-decline-subtle)] px-6 py-2 animate-slide-down">
          <div className="flex items-center space-x-2 text-[var(--status-decline)]">
            <AlertTriangleIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Backend connection unavailable. Real-time data is paused.</span>
          </div>
          <button 
            onClick={() => setDemoMode(true)}
            className="tempo-button h-8 min-h-0 px-3 text-[13px]"
          >
            Switch to Demo Mode
          </button>
        </div>
      )}

      {/* Persistent DEMO badge if demo mode is on */}
      {demoMode && (
        <div className="fixed top-[64px] right-4 z-50 pointer-events-none animate-fade-in">
          <div className="rounded-full border border-[rgba(202,138,4,0.16)] bg-[var(--status-review-subtle)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--status-review)]">
            Demo Mode Active
          </div>
        </div>
      )}

      {/* Consumer Profile Drawer */}
      <ConsumerProfile 
        isOpen={isConsumerProfileOpen} 
        onClose={() => setIsConsumerProfileOpen(false)} 
      />
    </>
  );
};

export default TopBar;
