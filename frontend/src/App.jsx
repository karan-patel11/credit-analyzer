import React, { Suspense } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import LandingPage from './components/landing/LandingPage';
import { useHealth } from './hooks/useHealth';
import ErrorBoundary from './components/shared/ErrorBoundary';
import TopBar from './components/layout/TopBar';
import StatsFooter from './components/layout/StatsFooter';
import MerchantDiscovery from './components/merchant/MerchantDiscovery';
import CreditAnalysis from './components/credit/CreditAnalysis';
import { TABS } from './utils/constants';

// Main content wrapper to handle health polling and tab switching
const AppContent = () => {
  useHealth(); // Initialize health polling
  const { activeTab } = useAppContext();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <TopBar />
      
      {/* Main Content Area - padded for fixed topbar and footer */}
      <main className="mt-16 mb-[48px] flex flex-1 flex-col overflow-hidden">
        <ErrorBoundary>
          <div className={`flex-1 transition-opacity duration-200 ${activeTab === TABS.MERCHANT_DISCOVERY ? 'opacity-100' : 'hidden opacity-0'}`}>
            <MerchantDiscovery />
          </div>
          <div className={`flex-1 transition-opacity duration-200 ${activeTab === TABS.CREDIT_ANALYSIS ? 'opacity-100' : 'hidden opacity-0'}`}>
            <CreditAnalysis />
          </div>
        </ErrorBoundary>
      </main>

      <StatsFooter />
    </div>
  );
};

const AppRouter = () => {
  const { showLanding, setShowLanding } = useAppContext();
  
  if (showLanding) {
    return <LandingPage onLaunch={() => setShowLanding(false)} />;
  }
  
  return <AppContent />;
};

function App() {
  return (
    <AppProvider>
      <Suspense fallback={<div className="min-h-screen bg-[var(--bg-primary)]" />}>
        <AppRouter />
      </Suspense>
    </AppProvider>
  );
}

export default App;
