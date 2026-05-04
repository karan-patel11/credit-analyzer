import React, { useState, useEffect, useRef } from 'react';

const ScoreRangeSlider = ({ min = 0, max = 100, onChange }) => {
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);
  const minValRef = useRef(min);
  const maxValRef = useRef(max);

  const getPercent = (value) => Math.round(((value - 0) / (100 - 0)) * 100);

  useEffect(() => {
    onChange([minVal, maxVal]);
  }, [minVal, maxVal]);

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), maxVal - 1);
    setMinVal(value);
    minValRef.current = value;
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), minVal + 1);
    setMaxVal(value);
    maxValRef.current = value;
  };

  return (
    <div className="w-full pt-4 pb-2">
      {/* Current values above thumbs */}
      <div className="relative mb-4 h-4 w-full">
        <div 
          className="absolute -translate-x-1/2 text-[11px] font-mono-num font-medium text-[var(--text-primary)] transition-all-fast"
          style={{ left: `${getPercent(minVal)}%` }}
        >
          {minVal}
        </div>
        <div 
          className="absolute -translate-x-1/2 text-[11px] font-mono-num font-medium text-[var(--text-primary)] transition-all-fast"
          style={{ left: `${getPercent(maxVal)}%` }}
        >
          {maxVal}
        </div>
      </div>

      <div className="relative h-[4px] w-full rounded bg-[var(--border-default)]">
        {/* Track Fill */}
        <div 
          className="absolute h-full rounded bg-[var(--accent)]"
          style={{ 
            left: `${getPercent(minVal)}%`, 
            width: `${getPercent(maxVal) - getPercent(minVal)}%` 
          }}
        ></div>

        {/* Min Input */}
        <input
          type="range"
          min="0"
          max="100"
          value={minVal}
          onChange={handleMinChange}
          className="absolute -top-[6px] h-0 w-full appearance-none pointer-events-none outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[var(--text-primary)] [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:cursor-pointer"
          style={{ zIndex: minVal > 100 - 10 ? 5 : 3 }}
        />

        {/* Max Input */}
        <input
          type="range"
          min="0"
          max="100"
          value={maxVal}
          onChange={handleMaxChange}
          className="absolute -top-[6px] h-0 w-full appearance-none pointer-events-none outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[var(--text-primary)] [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:cursor-pointer"
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Labels below */}
      <div className="mt-3 flex justify-between">
        <span className="text-[11px] text-[var(--text-tertiary)]">0</span>
        <span className="font-mono-num text-[12px] text-[var(--text-secondary)]">{minVal} - {maxVal}</span>
        <span className="text-[11px] text-[var(--text-tertiary)]">100</span>
      </div>
    </div>
  );
};

export default ScoreRangeSlider;
