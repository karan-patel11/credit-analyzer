import React, { useEffect, useState } from 'react';

const StepVisual = ({ step }) => {
  const [typedText, setTypedText] = useState('');
  
  useEffect(() => {
    if (step === 1) {
      setTypedText('');
      const text = 'electronics';
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setTypedText(prev => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 80);
      return () => clearInterval(interval);
    }
  }, [step]);

  return (
    <div className="w-full h-full bg-[#0B1120] border border-[#1E293B] rounded-xl p-4 flex flex-col relative overflow-hidden shadow-2xl">
      {/* Search Header Mockup */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex-1 bg-[#1F2937] h-8 rounded border border-[#334155] flex items-center px-3 relative">
          <svg className="w-4 h-4 text-[#64748B] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[#F1F5F9] text-[13px] font-mono">{step === 1 ? typedText : 'electronics'}</span>
          {step === 1 && typedText.length < 11 && <span className="w-[2px] h-4 bg-[#2563EB] animate-pulse ml-0.5"></span>}
        </div>
      </div>

      {/* Grid Mockup */}
      <div className="flex-1 grid grid-cols-2 gap-3 relative">
        {/* Step 1 & 2 Cards */}
        {[1, 2, 3, 4].map(idx => (
          <div key={idx} className={`bg-[#111827] border border-[#1E293B] rounded-lg p-3 flex flex-col transition-all duration-500
            ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: step === 1 ? `${800 + idx * 100}ms` : '0ms' }}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="w-16 h-3 bg-[#334155] rounded"></div>
              <div className="w-8 h-3 bg-[#10B981]/20 rounded"></div>
            </div>
            <div className="w-12 h-2 bg-[#1E293B] rounded mb-3"></div>
            
            {/* Step 2: Pre-approval badges slide down */}
            <div className="mt-auto h-6">
              <div className={`flex items-center justify-center bg-[#10B981]/10 text-[#10B981] text-[10px] py-1 rounded transition-all duration-500
                ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
                style={{ transitionDelay: step === 2 ? `${idx * 150}ms` : '0ms' }}
              >
                Pre-approved ${idx === 1 ? '2,400' : idx === 2 ? '1,800' : idx === 3 ? '4,500' : '1,200'}
              </div>
            </div>
          </div>
        ))}

        {/* Step 3: Merchant Detail Overlay */}
        <div className={`absolute top-0 right-0 w-[80%] h-full bg-[#111827] border-l border-[#1E293B] shadow-[-10px_0_20px_rgba(0,0,0,0.5)] p-4 transition-transform duration-500 z-10
          ${step >= 3 ? 'translate-x-0' : 'translate-x-[120%]'}`}
        >
          <div className="w-full h-4 bg-[#334155] rounded mb-4"></div>
          <div className="w-full h-8 bg-[#1F2937] border border-[#3B82F6] rounded flex items-center px-2 mb-4">
            <span className="text-[#F1F5F9] text-[12px]">$1,500</span>
          </div>
          <div className="w-full py-1.5 bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-center text-[10px] rounded mb-4">
            APPROVED ✓
          </div>
          <div className="flex space-x-2 overflow-hidden">
            <div className="w-1/2 h-16 border border-[#3B82F6] bg-[#3B82F6]/10 rounded flex flex-col justify-center items-center">
              <span className="text-[10px] text-[#94A3B8]">Pay in 4</span>
              <span className="text-[14px] text-[#F1F5F9] font-bold">$375</span>
            </div>
            <div className="w-1/2 h-16 border border-[#1E293B] bg-[#111827] rounded flex flex-col justify-center items-center">
              <span className="text-[10px] text-[#94A3B8]">Pay in 6</span>
              <span className="text-[14px] text-[#F1F5F9] font-bold">$258</span>
            </div>
          </div>
        </div>

        {/* Step 4: Merchant Onboarding Overlay */}
        <div className={`absolute inset-0 bg-[#0B1120] p-4 transition-opacity duration-500 z-20 flex flex-col
          ${step === 4 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          <div className="border border-dashed border-[#3B82F6] bg-[#3B82F6]/5 rounded-lg h-24 mb-4 flex items-center justify-center flex-col relative overflow-hidden">
            <svg className="w-6 h-6 text-[#3B82F6] mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-[10px] text-[#2563EB]">bank_statements.csv</span>
            <div className="absolute bottom-0 left-0 h-1 bg-[#2563EB] animate-pulse" style={{width: '100%'}}></div>
          </div>
          <div className="flex space-x-1 mb-4">
            <div className="h-1 flex-1 bg-[#10B981] rounded"></div>
            <div className="h-1 flex-1 bg-[#10B981] rounded"></div>
            <div className="h-1 flex-1 bg-[#10B981] rounded"></div>
            <div className="h-1 flex-1 bg-[#10B981] rounded"></div>
          </div>
          <div className="bg-[#111827] border-l-2 border-[#10B981] p-3 rounded-r flex-1">
            <div className="text-[12px] text-[#10B981] font-bold mb-1">APPROVED</div>
            <div className="w-full h-2 bg-[#334155] rounded mb-1"></div>
            <div className="w-4/5 h-2 bg-[#334155] rounded mb-1"></div>
            <div className="w-full h-2 bg-[#334155] rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepVisual;
