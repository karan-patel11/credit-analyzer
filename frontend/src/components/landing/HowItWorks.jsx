import React, { useState, useEffect } from 'react';
import StepVisual from './StepVisual';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const stepsData = [
  {
    num: 1,
    title: "Find merchants instantly",
    body: "Search by name, industry, or location. Our relevance engine ranks results using weighted scoring across name match, industry fit, merchant popularity, and approval history.",
    pills: ["Elasticsearch-style ranking", "Redis-cached autocomplete", "Sub-5ms P95"]
  },
  {
    num: 2,
    title: "Personalized credit at every merchant",
    body: "Set your financial profile once. Instantly see how much you're approved for at every merchant in the marketplace. No hard credit checks, no waiting.",
    pills: ["Real-time DTI calculation", "Risk-adjusted limits", "Stateless computation"]
  },
  {
    num: 3,
    title: "Know in milliseconds",
    body: "Enter your purchase amount and get an instant decision with flexible payment plans. Our scoring engine evaluates debt-to-income ratio, credit tier, and merchant risk in real-time.",
    pills: ["Deterministic scoring", "4 payment plan options", "0% APR Pay-in-4"]
  },
  {
    num: 4,
    title: "Powering the marketplace",
    body: "Behind every trusted merchant is a thorough financial review. Our multi-stage pipeline analyzes bank statements, scores risk factors, and generates AI-powered credit memos for onboarding decisions.",
    pills: ["Multi-agent pipeline", "LLM narrative generation", "Deterministic risk scoring"]
  }
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [ref, isVisible] = useScrollReveal({ threshold: 0.3 });

  useEffect(() => {
    if (!autoAdvance || !isVisible) return;
    
    const interval = setInterval(() => {
      setActiveStep(prev => prev === 4 ? 1 : prev + 1);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [autoAdvance, isVisible]);

  const handleStepClick = (stepNum) => {
    setActiveStep(stepNum);
    setAutoAdvance(false);
  };

  const currentData = stepsData[activeStep - 1];

  return (
    <section id="how-it-works" className="w-full py-24 bg-[#0B1120] border-t border-[#1E293B]">
      <div 
        ref={ref}
        className={`max-w-[1000px] mx-auto px-6 md:px-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="text-center mb-16">
          <h2 className="text-[28px] font-semibold text-[#F1F5F9] mb-3">How KAPS AI Works</h2>
          <p className="text-[14px] text-[#94A3B8]">From search to checkout in four steps</p>
        </div>

        {/* Stepper Bar */}
        <div className="relative mb-16 flex justify-between items-center max-w-[600px] mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#1E293B] -z-10 -translate-y-1/2"></div>
          
          {stepsData.map((step) => {
            const isActive = activeStep === step.num;
            const isPast = activeStep > step.num;
            
            return (
              <button
                key={step.num}
                onClick={() => handleStepClick(step.num)}
                className={`relative flex items-center justify-center w-8 h-8 rounded-full bg-[#0B1120] transition-all duration-300 outline-none focus:outline-none
                  ${isActive ? 'border-2 border-[#2563EB]' : isPast ? 'border-2 border-[#10B981]' : 'border-2 border-[#1E293B]'}`}
              >
                {isActive ? (
                  <div className="w-3 h-3 rounded-full bg-[#2563EB]"></div>
                ) : isPast ? (
                  <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-[12px] text-[#64748B] font-medium">{step.num}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Layout */}
        <div className="flex flex-col md:flex-row gap-12 items-center h-[350px]">
          {/* Left side: Visuals */}
          <div className="w-full md:w-1/2 h-[300px] flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[#2563EB]/5 rounded-xl blur-2xl"></div>
            <div className="relative w-full h-full max-w-[400px]">
              <StepVisual step={activeStep} />
            </div>
          </div>

          {/* Right side: Description */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="text-[14px] text-[#2563EB] font-bold tracking-wider uppercase mb-2">Step {currentData.num}</div>
            <h3 className="text-[24px] md:text-[28px] font-semibold text-[#F1F5F9] mb-4">
              {currentData.title}
            </h3>
            <p className="text-[15px] text-[#94A3B8] leading-relaxed mb-6">
              {currentData.body}
            </p>
            <div className="flex flex-wrap gap-2">
              {currentData.pills.map((pill, idx) => (
                <div key={idx} className="px-3 py-1 bg-[#1F2937] border border-[#334155] rounded-full text-[12px] text-[#F1F5F9] font-medium">
                  {pill}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
