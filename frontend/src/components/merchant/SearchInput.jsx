import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, XIcon } from '../../utils/icons';
import { useDebounce } from '../../hooks/useDebounce';
import { useAppContext } from '../../context/AppContext';
import { useApi } from '../../hooks/useApi';
import { autocompleteResults as mockAutocomplete } from '../../data/mockData';
import Badge from '../shared/Badge';

const SearchInput = ({ onSelect, onSearch }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const debouncedQuery = useDebounce(query, 200);
  const { demoMode } = useAppContext();
  const { request, loading } = useApi();
  const wrapperRef = useRef(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length >= 2) {
        if (demoMode) {
          // Mock data simulation
          const lowerQuery = debouncedQuery.toLowerCase();
          const results = Object.keys(mockAutocomplete).find(k => lowerQuery.includes(k) || k.includes(lowerQuery))
            ? mockAutocomplete[Object.keys(mockAutocomplete).find(k => lowerQuery.includes(k) || k.includes(lowerQuery))]
            : [];
          setSuggestions(results || []);
          setShowSuggestions(true);
        } else {
          try {
            const data = await request(`/merchants/autocomplete?q=${encodeURIComponent(debouncedQuery)}`);
            setSuggestions(data?.results || []);
            setShowSuggestions(true);
          } catch (e) {
            setSuggestions([]);
          }
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      
      // Also notify parent of search query
      onSearch(debouncedQuery);
    };

    fetchSuggestions();
  }, [debouncedQuery, demoMode, request]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch('');
  };

  const handleSelect = (merchant) => {
    setQuery(merchant.name);
    setShowSuggestions(false);
    if (onSelect) onSelect(merchant);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className={`relative flex items-center border-b transition-colors ${isFocused ? 'border-[var(--text-primary)]' : 'border-[var(--border-default)] hover:border-[var(--border-hover)]'}`}>
        <SearchIcon className="ml-0 shrink-0 text-[var(--text-tertiary)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder="Search merchants..."
          className="w-full bg-transparent border-none px-3 py-3 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none"
        />
        {query && (
          <button 
            onClick={handleClear}
            className="mr-0 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] animate-fade-in"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-card)] animate-slide-down">
          <ul className="max-h-[320px] overflow-y-auto py-1">
            {suggestions.map((merchant, idx) => (
              <li 
                key={merchant.id || idx}
                onClick={() => handleSelect(merchant)}
                className="flex h-[44px] cursor-pointer items-center justify-between px-4 transition-colors-fast hover:bg-[var(--bg-card-hover)] animate-fade-in"
                style={{ animationDelay: `${idx * 30}ms`, animationFillMode: 'both' }}
              >
                <span className="mr-2 truncate text-[13px] text-[var(--text-primary)]">{merchant.name}</span>
                <Badge className="shrink-0" color={
                  merchant.industry === 'Retail' ? 'blue' :
                  merchant.industry === 'Tech' ? 'purple' :
                  merchant.industry === 'Restaurant' ? 'amber' :
                  merchant.industry === 'Healthcare' ? 'green' : 'cyan'
                }>
                  {merchant.industry}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
