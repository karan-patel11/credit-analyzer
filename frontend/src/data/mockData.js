export const industries = [
  { id: 'retail', name: 'Retail', count: 52 },
  { id: 'tech', name: 'Tech', count: 48 },
  { id: 'restaurant', name: 'Restaurant', count: 35 },
  { id: 'healthcare', name: 'Healthcare', count: 24 },
  { id: 'construction', name: 'Construction', count: 18 },
  { id: 'services', name: 'Services', count: 12 },
];

export const merchants = [
  { id: 'm1', name: 'Apex Retail', industry: 'Retail', city: 'Chicago', state: 'IL', riskScore: 82, approvalRate: 88, revenueMin: 1200000, revenueMax: 5000000, riskTier: 'LOW', applications: 124 },
  { id: 'm2', name: 'Quantum Tech', industry: 'Tech', city: 'San Jose', state: 'CA', riskScore: 91, approvalRate: 94, revenueMin: 5000000, revenueMax: 10000000, riskTier: 'LOW', applications: 45 },
  { id: 'm3', name: 'Bistro 88', industry: 'Restaurant', city: 'New York', state: 'NY', riskScore: 45, approvalRate: 32, revenueMin: 500000, revenueMax: 1200000, riskTier: 'HIGH', applications: 89 },
  { id: 'm4', name: 'HealthFirst Clinic', industry: 'Healthcare', city: 'Austin', state: 'TX', riskScore: 78, approvalRate: 82, revenueMin: 2000000, revenueMax: 5000000, riskTier: 'LOW', applications: 32 },
  { id: 'm5', name: 'BuildRight Construction', industry: 'Construction', city: 'Denver', state: 'CO', riskScore: 56, approvalRate: 50, revenueMin: 1200000, revenueMax: 2000000, riskTier: 'MEDIUM', applications: 76 },
  { id: 'm6', name: 'CleanSweep Services', industry: 'Services', city: 'Miami', state: 'FL', riskScore: 68, approvalRate: 70, revenueMin: 800000, revenueMax: 1500000, riskTier: 'MEDIUM', applications: 112 },
  { id: 'm7', name: 'Urban Outfitters Local', industry: 'Retail', city: 'Seattle', state: 'WA', riskScore: 74, approvalRate: 78, revenueMin: 1500000, revenueMax: 3000000, riskTier: 'LOW', applications: 201 },
  { id: 'm8', name: 'DataSync Solutions', industry: 'Tech', city: 'Boston', state: 'MA', riskScore: 88, approvalRate: 90, revenueMin: 3000000, revenueMax: 8000000, riskTier: 'LOW', applications: 56 },
  { id: 'm9', name: 'Sizzling Wok', industry: 'Restaurant', city: 'Portland', state: 'OR', riskScore: 38, approvalRate: 25, revenueMin: 300000, revenueMax: 800000, riskTier: 'HIGH', applications: 145 },
  { id: 'm10', name: 'Wellness Center', industry: 'Healthcare', city: 'Phoenix', state: 'AZ', riskScore: 85, approvalRate: 86, revenueMin: 2500000, revenueMax: 6000000, riskTier: 'LOW', applications: 42 },
  { id: 'm11', name: 'Solid Foundation Pros', industry: 'Construction', city: 'Dallas', state: 'TX', riskScore: 62, approvalRate: 60, revenueMin: 1800000, revenueMax: 3500000, riskTier: 'MEDIUM', applications: 88 },
  { id: 'm12', name: 'Elite Pet Grooming', industry: 'Services', city: 'Atlanta', state: 'GA', riskScore: 71, approvalRate: 75, revenueMin: 600000, revenueMax: 1200000, riskTier: 'LOW', applications: 156 },
  { id: 'm13', name: 'Fresh Market', industry: 'Retail', city: 'Charlotte', state: 'NC', riskScore: 79, approvalRate: 84, revenueMin: 4000000, revenueMax: 9000000, riskTier: 'LOW', applications: 320 },
  { id: 'm14', name: 'CloudNet Inc', industry: 'Tech', city: 'San Francisco', state: 'CA', riskScore: 95, approvalRate: 98, revenueMin: 10000000, revenueMax: 25000000, riskTier: 'LOW', applications: 24 },
  { id: 'm15', name: 'Taco Fiesta', industry: 'Restaurant', city: 'San Diego', state: 'CA', riskScore: 52, approvalRate: 45, revenueMin: 700000, revenueMax: 1500000, riskTier: 'MEDIUM', applications: 210 },
  { id: 'm16', name: 'Smile Dental', industry: 'Healthcare', city: 'Columbus', state: 'OH', riskScore: 81, approvalRate: 85, revenueMin: 1500000, revenueMax: 3000000, riskTier: 'LOW', applications: 65 },
  { id: 'm17', name: 'IronClad Builders', industry: 'Construction', city: 'Detroit', state: 'MI', riskScore: 42, approvalRate: 30, revenueMin: 900000, revenueMax: 1800000, riskTier: 'HIGH', applications: 54 },
  { id: 'm18', name: 'Quick Fix Auto', industry: 'Services', city: 'Houston', state: 'TX', riskScore: 65, approvalRate: 68, revenueMin: 1200000, revenueMax: 2500000, riskTier: 'MEDIUM', applications: 178 },
  { id: 'm19', name: 'TechGear Shop', industry: 'Retail', city: 'Raleigh', state: 'NC', riskScore: 76, approvalRate: 80, revenueMin: 2000000, revenueMax: 4500000, riskTier: 'LOW', applications: 134 },
  { id: 'm20', name: 'Innovate AI', industry: 'Tech', city: 'Austin', state: 'TX', riskScore: 89, approvalRate: 92, revenueMin: 5000000, revenueMax: 12000000, riskTier: 'LOW', applications: 38 },
];

export const autocompleteResults = {
  're': [merchants[0], merchants[6], merchants[12]],
  'tech': [merchants[1], merchants[7], merchants[13], merchants[19]],
  'res': [merchants[2], merchants[8], merchants[14]],
};

export const demoScenarios = {
  'strong': {
    businessName: 'Quantum Tech',
    industry: 'Tech',
    annualRevenue: 8500000,
    loanAmount: 500000,
    file: 'quantum_tech_q3.csv',
    result: {
      decision: 'APPROVE',
      score: 91,
      confidence: 'High Confidence',
      metrics: {
        totalDeposits: 2450000,
        totalWithdrawals: 1980000,
        avgBalance: 520000,
        minBalance: 310000,
        overdraftCount: 0,
        cashFlowTrend: 'up'
      },
      memo: 'The applicant exhibits extremely strong financial health. Revenue trends are consistently upward month-over-month. The requested loan amount represents a very safe loan-to-revenue ratio (<10%). Operating margins appear robust, and there are no signs of cash flow stress. Approval is highly recommended.',
      flags: []
    }
  },
  'borderline': {
    businessName: 'BuildRight Construction',
    industry: 'Construction',
    annualRevenue: 1500000,
    loanAmount: 300000,
    file: 'buildright_ytd.csv',
    result: {
      decision: 'REVIEW',
      score: 56,
      confidence: 'Medium Confidence',
      metrics: {
        totalDeposits: 380000,
        totalWithdrawals: 365000,
        avgBalance: 42000,
        minBalance: 5000,
        overdraftCount: 2,
        cashFlowTrend: 'down'
      },
      memo: 'The applicant shows adequate total revenue but concerning cash flow volatility. The requested loan amount ($300k) is 20% of stated annual revenue, which is borderline for the construction industry. There are recent signs of liquidity pressure, including 2 minor overdrafts in the past 90 days. Manual underwriting review is required to verify upcoming project pipeline.',
      flags: [
        '2 overdraft events detected in the last 90 days',
        'Average daily balance has decreased 15% month-over-month',
        'High concentration of revenue from a single payer (42%)'
      ]
    }
  },
  'weak': {
    businessName: 'Sizzling Wok',
    industry: 'Restaurant',
    annualRevenue: 500000,
    loanAmount: 250000,
    file: 'sizzling_wok_statements.csv',
    result: {
      decision: 'DECLINE',
      score: 38,
      confidence: 'High Confidence',
      metrics: {
        totalDeposits: 110000,
        totalWithdrawals: 125000,
        avgBalance: 8500,
        minBalance: -1200,
        overdraftCount: 8,
        cashFlowTrend: 'down'
      },
      memo: 'The applicant demonstrates severe liquidity issues. Current cash flow is negative, with withdrawals exceeding deposits over the observed period. The requested loan amount ($250k) represents 50% of annualized revenue, which is an unacceptably high burden for a restaurant. The account shows chronic overdraft behavior.',
      flags: [
        '8 overdraft events in the last 90 days',
        'Negative net cash flow trend',
        'Loan-to-revenue ratio exceeds maximum threshold (50% > 20%)',
        'Average daily balance is critically low'
      ]
    }
  },
  'seasonal': {
    businessName: 'Frosty Treats Inc',
    industry: 'Retail',
    annualRevenue: 900000,
    loanAmount: 100000,
    file: 'frosty_treats_annual.csv',
    result: {
      decision: 'REVIEW',
      score: 64,
      confidence: 'Medium Confidence',
      metrics: {
        totalDeposits: 225000,
        totalWithdrawals: 210000,
        avgBalance: 65000,
        minBalance: 12000,
        overdraftCount: 0,
        cashFlowTrend: 'up'
      },
      memo: 'The applicant exhibits extreme seasonal revenue fluctuations typical of a summer-focused retail business. While overall annualized metrics are acceptable, cash flow drops significantly during winter months. The current liquidity is strong enough to service the debt, but the underwriter should ensure the repayment schedule aligns with their cash flow cycle.',
      flags: [
        'High revenue variance month-to-month (seasonal pattern)',
        'Q1 revenue is 80% lower than Q3 revenue'
      ]
    }
  }
};

// Simulate network delay
export const simulateDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms + Math.random() * 200));

// Pre-approval amounts for mock merchants
export const mockPreapprovals = {
  m1: { merchant_id: 'm1', merchant_name: "Apex Retail", risk_tier: "LOW", max_approved: 10000 },
  m2: { merchant_id: 'm2', merchant_name: "Quantum Tech", risk_tier: "LOW", max_approved: 10000 },
  m3: { merchant_id: 'm3', merchant_name: "Bistro 88", risk_tier: "HIGH", max_approved: 6000 },
  m4: { merchant_id: 'm4', merchant_name: "HealthFirst Clinic", risk_tier: "LOW", max_approved: 10000 },
  m5: { merchant_id: 'm5', merchant_name: "BuildRight Construction", risk_tier: "MEDIUM", max_approved: 8000 }
  // MerchantDiscovery handles fallback dynamically based on riskTier for missing ones
};

// Credit check responses for different scenarios
export const mockCreditChecks = {
  approved: {
    decision: "APPROVED",
    risk_score: 78,
    max_approved_amount: 10000,
    requested_amount: 1500,
    debt_to_income_ratio: 0.16,
    merchant_name: "Apex Retail",
    merchant_industry: "Retail",
    merchant_risk_tier: "LOW",
    payment_plans: [
      { label: "Pay in 4", months: 4, monthly_payment: 375.00, apr: 0.0, total_cost: 1500.00 },
      { label: "Pay in 6", months: 6, monthly_payment: 258.33, apr: 10.0, total_cost: 1549.98 },
      { label: "Pay in 12", months: 12, monthly_payment: 134.58, apr: 15.0, total_cost: 1614.96 }
    ],
    decision_factors: [
      "Debt-to-income ratio: 16% (healthy, below 36% threshold)",
      "Credit tier: Good (670-749 range)",
      "Merchant risk: Low (high approval rate history)",
      "Purchase amount ($1,500) within pre-approved limit ($10,000)"
    ]
  },
  review: {
    decision: "REVIEW",
    risk_score: 52,
    max_approved_amount: 4000,
    requested_amount: 3800,
    debt_to_income_ratio: 0.39,
    merchant_name: "BuildRight Construction",
    merchant_industry: "Construction",
    merchant_risk_tier: "MEDIUM",
    payment_plans: [], // generated dynamically in component
    decision_factors: [
      "Debt-to-income ratio: 39% (elevated, caution advised)",
      "Credit tier: Good (670-749 range)",
      "Purchase amount ($3,800) within pre-approved limit ($4,000)",
      "Elevated DTI — approved with reduced term options"
    ]
  },
  declined: {
    decision: "DECLINED",
    risk_score: 28,
    max_approved_amount: 2500,
    requested_amount: 5000,
    debt_to_income_ratio: 0.48,
    merchant_name: "Bistro 88",
    merchant_industry: "Restaurant",
    merchant_risk_tier: "HIGH",
    payment_plans: [],
    decision_factors: [
      "Debt-to-income ratio: 48% (exceeds 43% safe lending threshold)",
      "Purchase amount ($5,000) exceeds pre-approved limit ($2,500)",
      "Insufficient debt capacity for requested amount"
    ]
  }
};

// Default consumer profile for demo mode
export const mockConsumerProfile = {
  monthlyIncome: 5000,
  monthlyDebt: 800,
  creditTier: "good",
  isSet: true
};
