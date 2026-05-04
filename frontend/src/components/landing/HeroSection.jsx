import React, { useEffect, useState } from 'react';
import HeroScene from './HeroScene';

const StatBox = ({ label, value }) => {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  const suffix = value.replace(/[0-9]/g, '');

  useEffect(() => {
    let startTime = null;
    const duration = 1500;
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // easeOutExpo
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeOut * numericValue));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(numericValue);
      }
    };
    
    requestAnimationFrame(animate);
  }, [numericValue]);

  return (
    <div className="flex flex-col">
      <div className="text-[20px] font-bold text-[#F1F5F9] font-mono-num">{count}{suffix}</div>
      <div className="text-[12px] text-[#64748B]">{label}</div>
    </div>
  );
};

const HeroSection = ({ onLaunch }) => {
  const handleWatchDemo = () => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative h-[100vh] w-full flex flex-col md:flex-row overflow-hidden bg-[#0B1120]">
      {/* Left side: Text Content (55%) */}
      <div className="w-full md:w-[55%] h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 z-10 pt-16 md:pt-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120] to-transparent">
        <div className="animate-fade-in-up" style={{ animationDuration: '0.8s' }}>
          <div className="text-[14px] uppercase tracking-[0.15em] text-[#2563EB] font-semibold mb-4">
            KAPS AI
          </div>
          
          <h1 className="text-[40px] md:text-[48px] font-bold text-[#F1F5F9] leading-[1.1] mb-6">
            The Intelligent Buy Now, Pay Later<br />Marketplace
          </h1>
          
          <p className="text-[16px] text-[#94A3B8] leading-[1.6] max-w-[520px] mb-6">
            Connecting consumers to merchants with real-time credit intelligence. Know exactly what you can afford before you shop.
          </p>

          <ul className="text-[14px] text-[#94A3B8] max-w-[520px] mb-10 space-y-2">
            <li className="flex items-start"><span className="text-[#2563EB] mr-2 mt-0.5">✓</span> <span><strong>Discover Merchants:</strong> Search and filter top merchants by industry and risk score.</span></li>
            <li className="flex items-start"><span className="text-[#2563EB] mr-2 mt-0.5">✓</span> <span><strong>Instant Credit Analysis:</strong> Get real-time AI-driven credit decisions based on your financial profile.</span></li>
            <li className="flex items-start"><span className="text-[#2563EB] mr-2 mt-0.5">✓</span> <span><strong>Smart Payment Plans:</strong> View clear, personalized installment plans at point-of-sale.</span></li>
          </ul>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button 
              onClick={onLaunch}
              className="h-[44px] w-[180px] bg-[#2563EB] hover:bg-[#3B82F6] hover:scale-[1.02] active:scale-95 text-white rounded transition-all flex items-center justify-center font-medium"
            >
              Launch Platform →
            </button>
            <button 
              onClick={handleWatchDemo}
              className="h-[44px] w-[180px] bg-transparent border border-[#2563EB] text-[#2563EB] hover:bg-[rgba(37,99,235,0.1)] active:scale-95 rounded transition-all flex items-center justify-center font-medium"
            >
              Watch Demo
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <StatBox value="600+" label="Merchants" />
            <div className="w-[1px] h-8 bg-[#1E293B] hidden sm:block"></div>
            <StatBox value="12" label="Industries" />
            <div className="w-[1px] h-8 bg-[#1E293B] hidden sm:block"></div>
            <StatBox value="5ms" label="Search P95" />
          </div>
        </div>
      </div>

      {/* Right side: 3D Scene (45%) */}
      <div className="absolute right-0 top-0 w-full md:w-[60%] h-[50vh] md:h-full opacity-40 md:opacity-100 -z-0">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0B1120] pointer-events-none z-10 md:w-[20%]"></div>
        <HeroScene />
      </div>
    </section>
  );
};

export default HeroSection;
