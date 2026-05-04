import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../../utils/icons';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Simple logic to show a few pages around current
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="mt-8 flex flex-col items-center space-y-4">
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex h-9 items-center rounded-[8px] border border-transparent px-4 text-[13px] font-medium text-[var(--text-secondary)] transition-colors-fast hover:border-[var(--border-default)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Previous
        </button>

        <div className="mx-2 flex items-center space-x-1">
          {getPageNumbers().map((page, idx) => (
            <React.Fragment key={idx}>
              {page === '...' ? (
                <span className="w-8 text-center text-[var(--text-tertiary)]">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page)}
                  className={`flex h-9 w-9 items-center justify-center rounded-[8px] border text-[13px] font-medium transition-all-fast
                    ${currentPage === page 
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white' 
                      : 'border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex h-9 items-center rounded-[8px] border border-transparent px-4 text-[13px] font-medium text-[var(--text-secondary)] transition-colors-fast hover:border-[var(--border-default)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      <div className="text-[12px] text-[var(--text-tertiary)]">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
