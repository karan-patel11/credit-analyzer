import React from 'react';

const FilterChips = ({ options = [], selected = [], onChange }) => {
  const toggleSelection = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter(item => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1">
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        
        return (
          <button
            key={option.id}
            onClick={() => toggleSelection(option.id)}
            className={`
              flex h-[32px] items-center space-x-1 rounded-[8px] border px-3 text-[12px] font-medium transition-all-fast
              ${isSelected 
                ? 'border-[var(--text-primary)] bg-[var(--accent-subtle)] text-[var(--text-primary)]' 
                : 'border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
              }
            `}
          >
            <span>{option.name}</span>
            {option.count !== undefined && (
              <span className={`ml-1 text-[10px] ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                ({option.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FilterChips;
