import React, { createContext, useContext, useState } from 'react';
import { IS_DEMO_MODE, TABS } from '../utils/constants';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState(TABS.MERCHANT_DISCOVERY);
  const defaultDemoMode = IS_DEMO_MODE || import.meta.env.PROD === true;
  const [demoModeState, setDemoModeState] = useState(() => {
    try {
      const saved = localStorage.getItem('kaps-demo-mode');
      if (saved !== null) return JSON.parse(saved);
      return defaultDemoMode;
    } catch {
      return defaultDemoMode;
    }
  });
  const [healthStatus, setHealthStatus] = useState({
    api: true,
    mysql: true,
    redis: true
  });

  const [showLanding, setShowLandingState] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('intro') === 'true') return true;
      return !localStorage.getItem('kaps_visited');
    } catch {
      return true;
    }
  });

  const setShowLanding = (show) => {
    setShowLandingState(show);
    if (!show) {
      localStorage.setItem('kaps_visited', 'true');
    }
  };

  const [consumerProfile, setConsumerProfileState] = useState(() => {
    try {
      const saved = localStorage.getItem('kaps_consumer_profile');
      return saved ? JSON.parse(saved) : { isSet: false };
    } catch {
      return { isSet: false };
    }
  });

  const [isConsumerProfileOpen, setIsConsumerProfileOpen] = useState(false);

  const setConsumerProfile = (profile) => {
    setConsumerProfileState(profile);
    localStorage.setItem('kaps_consumer_profile', JSON.stringify(profile));
  };

  const setDemoMode = (value) => {
    setDemoModeState((previous) => {
      const nextValue = typeof value === 'function' ? value(previous) : value;
      localStorage.setItem('kaps-demo-mode', JSON.stringify(nextValue));
      return nextValue;
    });
  };

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      demoMode: demoModeState,
      setDemoMode,
      healthStatus,
      setHealthStatus,
      consumerProfile,
      setConsumerProfile,
      isConsumerProfileOpen,
      setIsConsumerProfileOpen,
      showLanding,
      setShowLanding
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
