import React from 'react';
import MerchantCard from './MerchantCard';
import Skeleton from '../shared/Skeleton';

const MerchantGrid = ({ merchants, loading, onSelectMerchant }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex h-[180px] flex-col justify-between rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
            <div>
              <div className="flex justify-between mb-4">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-1/3 mb-4" />
              <Skeleton className="h-2 w-full mb-4" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-8 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!merchants || merchants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--text-tertiary)]">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)]">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="mb-1 font-medium text-[var(--text-primary)]">No merchants found</h3>
        <p className="text-[13px]">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {merchants.map((merchant) => (
        <MerchantCard 
          key={merchant.id} 
          merchant={merchant} 
          onClick={onSelectMerchant}
        />
      ))}
    </div>
  );
};

export default MerchantGrid;
