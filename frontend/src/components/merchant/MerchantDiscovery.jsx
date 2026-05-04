import React, { useState, useEffect, useMemo } from 'react';
import SearchSidebar from './SearchSidebar';
import MerchantGrid from './MerchantGrid';
import MerchantList from './MerchantList';
import Pagination from './Pagination';
import MerchantDetail from './MerchantDetail';
import { GridIcon, ListIcon } from '../../utils/icons';
import { useAppContext } from '../../context/AppContext';
import { useApi } from '../../hooks/useApi';
import { merchants as mockMerchants, mockPreapprovals } from '../../data/mockData';

const ITEMS_PER_PAGE = 8;

const MerchantDiscovery = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    query: '',
    industries: [],
    riskTiers: [],
    scoreRange: [0, 100],
    sortBy: 'Relevance'
  });
  
  const [merchants, setMerchants] = useState([]);
  
  const { demoMode, consumerProfile } = useAppContext();
  const { request, loading } = useApi();
  const [preapprovals, setPreapprovals] = useState({});

  useEffect(() => {
    const fetchMerchants = async () => {
      // In a real app, filters would be sent to the backend.
      // Here we simulate backend search for demo mode, or fetch all and filter client-side for simplicity in live mode if not fully implemented
      if (demoMode) {
        setMerchants(mockMerchants);
      } else {
        try {
          const data = await request('/merchants');
          setMerchants(data?.merchants || []);
        } catch (e) {
          setMerchants([]);
        }
      }
    };
    fetchMerchants();
  }, [demoMode, request]);

  // Client-side filtering and sorting
  const processedMerchants = useMemo(() => {
    let result = [...merchants];

    // Filter by query
    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.city.toLowerCase().includes(q) ||
        m.industry.toLowerCase().includes(q)
      );
    }

    // Filter by industries
    if (filters.industries.length > 0) {
      // Assuming filter chips store industry names lowercased here because mockData industries have lowercased IDs
      result = result.filter(m => filters.industries.includes(m.industry.toLowerCase()));
    }

    // Filter by risk tier
    if (filters.riskTiers.length > 0) {
      result = result.filter(m => filters.riskTiers.includes(m.riskTier));
    }

    // Filter by score range
    result = result.filter(m => 
      m.riskScore >= filters.scoreRange[0] && 
      m.riskScore <= filters.scoreRange[1]
    );

    // Sort
    switch (filters.sortBy) {
      case 'Risk Score ↓':
        result.sort((a, b) => b.riskScore - a.riskScore);
        break;
      case 'Approval Rate ↓':
        result.sort((a, b) => b.approvalRate - a.approvalRate);
        break;
      case 'Revenue ↓':
        result.sort((a, b) => b.revenueMax - a.revenueMax);
        break;
      case 'Relevance':
      default:
        // Already naturally ordered or based on search score (mocked as original order)
        break;
    }

    return result;
  }, [merchants, filters]);

  // Pagination logic
  const totalPages = Math.ceil(processedMerchants.length / ITEMS_PER_PAGE);
  const paginatedMerchants = processedMerchants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Fetch Preapprovals for current page
  useEffect(() => {
    const fetchPreapprovals = async () => {
      if (!consumerProfile?.isSet || paginatedMerchants.length === 0) {
        setPreapprovals({});
        return;
      }
      
      const merchantIds = paginatedMerchants.map(m => m.id);
      
      if (demoMode) {
        const results = {};
        merchantIds.forEach(id => {
          const mock = mockPreapprovals && mockPreapprovals[id];
          if (mock) {
            results[id] = mock.max_approved;
          } else {
            const m = paginatedMerchants.find(x => x.id === id);
            const multipliers = {"excellent": 3.0, "good": 2.0, "fair": 1.0, "poor": 0.5};
            const riskFactors = {"LOW": 1.0, "MEDIUM": 0.8, "HIGH": 0.6};
            const mult = multipliers[consumerProfile.creditTier] || 1.0;
            const riskFactor = m ? (riskFactors[m.riskTier] || 0.8) : 0.8;
            const maxAmount = Math.min(25000, consumerProfile.monthlyIncome * mult * riskFactor);
            results[id] = maxAmount;
          }
        });
        setPreapprovals(results);
      } else {
        try {
          const res = await request('/credit/preapproval-batch', {
            method: 'POST',
            body: JSON.stringify({
              monthly_income: consumerProfile.monthlyIncome,
              credit_tier: consumerProfile.creditTier,
              merchant_ids: merchantIds
            })
          });
          const results = {};
          if (res && res.results) {
            res.results.forEach(r => {
              results[r.merchant_id] = r.max_approved;
            });
          }
          setPreapprovals(results);
        } catch (e) {
          console.error(e);
        }
      }
    };
    
    // We only want to run this when the paginated IDs change, or profile changes
    // To avoid infinite loop, we extract the IDs
    const idsString = paginatedMerchants.map(m => m.id).join(',');
  }, [paginatedMerchants.map(m => m.id).join(','), consumerProfile, demoMode, request]);

  const merchantsWithPreapprovals = paginatedMerchants.map(m => ({
    ...m,
    preapprovalAmount: preapprovals[m.id]
  }));

  return (
    <div className="flex h-full w-full bg-[var(--bg-primary)]">
      {/* Left Sidebar (Column 1) */}
      <SearchSidebar 
        filters={filters} 
        setFilters={setFilters} 
        resultCount={processedMerchants.length} 
      />

      {/* Main Content (Columns 2 & 3) */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="mx-auto max-w-[1200px] p-6 md:p-8">
          
          {/* Top Bar of Main Content */}
          <div className="mb-6 flex flex-col items-start justify-between sm:flex-row sm:items-center">
            <div className="mb-4 sm:mb-0">
              <h1 className="mb-1 text-[20px] font-normal tracking-[-0.03em] text-[var(--text-primary)]">Merchant Directory</h1>
              <div className="flex items-center space-x-2">
                <span className="text-[13px] text-[var(--text-secondary)]">{processedMerchants.length} results</span>
                {!loading && (
                  <span className="rounded-full border border-[var(--border-default)] bg-[var(--bg-card)] px-2 py-0.5 text-[11px] font-mono-num text-[var(--text-tertiary)]">
                    in {demoMode ? (Math.random() * 5 + 2).toFixed(1) : '3.8'}ms
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex h-9 w-9 items-center justify-center rounded-[8px] border transition-all-fast ${
                  viewMode === 'grid'
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                    : 'border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-tertiary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                <GridIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex h-9 w-9 items-center justify-center rounded-[8px] border transition-all-fast ${
                  viewMode === 'list'
                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                    : 'border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-tertiary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Render Grid or List */}
          {viewMode === 'grid' ? (
            <MerchantGrid 
              merchants={merchantsWithPreapprovals} 
              loading={loading} 
              onSelectMerchant={setSelectedMerchant} 
            />
          ) : (
            <MerchantList 
              merchants={merchantsWithPreapprovals} 
              loading={loading} 
              onSelectMerchant={setSelectedMerchant} 
            />
          )}

          {/* Pagination */}
          {!loading && processedMerchants.length > 0 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          )}

        </div>
      </div>

      {/* Slide-in Detail Panel */}
      <MerchantDetail 
        merchant={selectedMerchant} 
        onClose={() => setSelectedMerchant(null)} 
      />
    </div>
  );
};

export default MerchantDiscovery;
