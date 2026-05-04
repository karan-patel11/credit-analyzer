import React, { useEffect, useState } from 'react';

const RiskGauge = ({ score }) => {
  const [offset, setOffset] = useState(100);
  
  // Animate on mount
  useEffect(() => {
    // Small delay to ensure CSS animation triggers properly
    const timer = setTimeout(() => {
      setOffset(100 - score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getColorClass = () => {
    if (score >= 70) return 'stroke-[#10B981]';
    if (score >= 40) return 'stroke-[#F59E0B]';
    return 'stroke-[#EF4444]';
  };

  const getLabel = () => {
    if (score >= 70) return 'Low Risk';
    if (score >= 40) return 'Medium Risk';
    return 'High Risk';
  };

  // 160px diameter requested for Credit Analysis page
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[160px] h-[160px]">
        {/* Background track */}
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#1A1A1A"
            strokeWidth="12"
          />
          {/* Animated fill */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            className={`transition-all duration-800 ease-out ${getColorClass()}`}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (offset / 100)}
            style={{ 
              animation: 'dashoffset 800ms ease-out forwards',
              '--target-offset': circumference * ((100 - score) / 100)
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="leading-none text-[40px] font-bold font-mono-num text-[var(--text-primary)]">{score}</span>
          <span className="mt-1 text-[13px] font-medium text-[var(--text-secondary)]">{getLabel()}</span>
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;
