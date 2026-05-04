const LOCAL_API_FALLBACK = 'http://localhost:' + '8000';

export const API_BASE_URL = import.meta.env.VITE_API_URL || LOCAL_API_FALLBACK;
export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
export const GITHUB_URL = 'https://github.com/karan-patel11/credit-analyzer';
export const LINKEDIN_URL = 'https://linkedin.com/in/patelkaran11';
export const PORTFOLIO_URL = 'https://patelkaran.tech';

export const RISK_TIERS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

export const TABS = {
  MERCHANT_DISCOVERY: 'MERCHANT_DISCOVERY',
  CREDIT_ANALYSIS: 'CREDIT_ANALYSIS'
};
