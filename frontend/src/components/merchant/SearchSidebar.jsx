import React, { useState, useEffect } from 'react';
import SearchInput from './SearchInput';
import FilterChips from './FilterChips';
import RiskTierToggle from './RiskTierToggle';
import ScoreRangeSlider from './ScoreRangeSlider';
import { ChevronDownIcon, ChevronRightIcon } from '../../utils/icons';
import { useAppContext } from '../../context/AppContext';
import { useApi } from '../../hooks/useApi';
import { industries as mockIndustries } from '../../data/mockData';

const Section = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[var(--border-default)] py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full group"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)] transition-colors-fast group-hover:text-[var(--text-primary)]">
          {title}
        </span>
        {isOpen ? (
          <ChevronDownIcon className="h-4 w-4 text-[var(--text-tertiary)]" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-[var(--text-tertiary)]" />
        )}
      </button>
      {isOpen && (
        <div className="mt-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

const SearchSidebar = ({ filters, setFilters, resultCount }) => {
  const { demoMode } = useAppContext();
  const { request } = useApi();
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    const fetchIndustries = async () => {
      if (demoMode) {
        setIndustries(mockIndustries);
        return;
      }
      try {
        const data = await request('/merchants/industries');
        const formattedIndustries = (data?.industries || []).map(ind => ({
          id: ind.industry,
          name: ind.industry,
          count: ind.merchant_count
        }));
        setIndustries(formattedIndustries);
      } catch (e) {
        setIndustries([]);
      }
    };
    fetchIndustries();
  }, [demoMode, request]);

  const handleReset = () => {
    setFilters({
      query: '',
      industries: [],
      riskTiers: [],
      scoreRange: [0, 100],
      sortBy: 'Relevance'
    });
  };

  const sortOptions = ['Relevance', 'Risk Score ↓', 'Approval Rate ↓', 'Revenue ↓'];

  return (
    <div className="hidden h-full w-[280px] shrink-0 flex-col overflow-y-auto border-r border-[var(--border-default)] bg-[var(--bg-card)] lg:flex">
      <div className="p-6 pb-2">
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">Filters</h2>
        <SearchInput 
          onSearch={(q) => setFilters(prev => ({ ...prev, query: q }))}
          onSelect={(merchant) => setFilters(prev => ({ ...prev, query: merchant.name }))}
        />
      </div>

      <div className="px-6 flex-1">
        <Section title="Industry">
          <FilterChips 
            options={industries} 
            selected={filters.industries} 
            onChange={(inds) => setFilters(prev => ({ ...prev, industries: inds }))} 
          />
        </Section>

        <Section title="Risk Tier">
          <RiskTierToggle 
            selected={filters.riskTiers}
            onChange={(tiers) => setFilters(prev => ({ ...prev, riskTiers: tiers }))}
          />
        </Section>

        <Section title="Score Range">
          <ScoreRangeSlider 
            min={0}
            max={100}
            onChange={(range) => setFilters(prev => ({ ...prev, scoreRange: range }))}
          />
        </Section>

        <Section title="Sort By">
          <div className="space-y-1">
            {sortOptions.map((opt) => (
              <label key={opt} className="flex items-center space-x-3 cursor-pointer group py-1">
                <div className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors-fast ${filters.sortBy === opt ? 'border-[var(--text-primary)]' : 'border-[var(--text-tertiary)] group-hover:border-[var(--text-secondary)]'}`}>
                  {filters.sortBy === opt && <div className="h-2 w-2 rounded-full bg-[var(--accent)]" />}
                </div>
                <span className={`text-[13px] transition-colors-fast ${filters.sortBy === opt ? 'font-medium text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                  {opt}
                </span>
                <input 
                  type="radio" 
                  name="sortBy" 
                  value={opt}
                  checked={filters.sortBy === opt}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="hidden" 
                />
              </label>
            ))}
          </div>
        </Section>
      </div>

      <div className="sticky bottom-0 flex items-center justify-between border-t border-[var(--border-default)] bg-[var(--bg-card)] p-6 pt-4">
        <span className="text-[12px] text-[var(--text-secondary)]">
          {resultCount} results
        </span>
        <button 
          onClick={handleReset}
          className="tempo-link text-[12px]"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default SearchSidebar;
