import React, { useState, useEffect } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const MetricNumber = ({ endValue, label, isVisible }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!isVisible) return;
    
    let startTime = null;
    const duration = 2000;
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * endValue));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };
    
    requestAnimationFrame(animate);
  }, [endValue, isVisible]);
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="text-[24px] font-bold text-[#2563EB] font-mono-num mb-1">
        {count}{endValue > 100 && endValue % 10 === 0 ? '+' : ''}
        {endValue === 90 ? '%' : ''}
      </div>
      <div className="text-[12px] text-[#64748B] uppercase tracking-wider font-semibold">{label}</div>
    </div>
  );
};

const OrbitNode = ({ cx, cy, label, color, description, delay }) => {
  return (
    <g className="group cursor-pointer" style={{ animationDelay: `${delay}s` }}>
      <circle cx={cx} cy={cy} r="16" fill="#111827" stroke={color} strokeWidth="2" className="transition-all duration-300 group-hover:scale-[1.3] origin-center" style={{ transformOrigin: `${cx}px ${cy}px` }} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#F1F5F9" fontSize="7" fontWeight="bold" className="pointer-events-none transition-all duration-300 group-hover:scale-[1.3] origin-center" style={{ transformOrigin: `${cx}px ${cy}px` }}>{label}</text>
      
      {/* Tooltip (SVG based) */}
      <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <rect x={cx - 75} y={cy - 45} width="150" height="24" rx="4" fill="#1F2937" stroke="#334155" strokeWidth="1" />
        <text x={cx} y={cy - 33} textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="normal">{description}</text>
      </g>
    </g>
  );
};

const TechStackOrbit = () => {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.2 });

  return (
    <section id="tech-stack" className="w-full py-24 bg-[#111827]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[28px] font-semibold text-[#F1F5F9]">Built for Scale</h2>
        </div>

        <div className="flex flex-col items-center justify-center">
          {/* Orbit Animation Container */}
          <div className="relative w-[340px] h-[340px] md:w-[400px] md:h-[400px] mb-16">
            <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
              
              {/* Outer Ring (Infra) */}
              <g className="animate-spin-slow" style={{ animationDuration: '60s', transformOrigin: 'center' }}>
                <circle cx="200" cy="200" r="160" fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                {/* Reverse spin for nodes so text stays upright */}
                <g className="animate-spin-slow-reverse" style={{ animationDuration: '60s', transformOrigin: '200px 40px' }}>
                  <OrbitNode cx="200" cy="40" label="K8s" color="#326CE5" description="13 production manifests with HPA autoscaling" delay={0} />
                </g>
                <g className="animate-spin-slow-reverse" style={{ animationDuration: '60s', transformOrigin: '360px 200px' }}>
                  <OrbitNode cx="360" cy="200" label="Docker" color="#2496ED" description="4-service containerized deployment" delay={0} />
                </g>
                <g className="animate-spin-slow-reverse" style={{ animationDuration: '60s', transformOrigin: '200px 360px' }}>
                  <OrbitNode cx="200" cy="360" label="GH Actions" color="#2088FF" description="CI/CD pipeline with pytest coverage" delay={0} />
                </g>
                <g className="animate-spin-slow-reverse" style={{ animationDuration: '60s', transformOrigin: '40px 200px' }}>
                  <OrbitNode cx="40" cy="200" label="Helm" color="#0F1689" description="Package management for deployments" delay={0} />
                </g>
              </g>

              {/* Middle Ring (Data) */}
              <g className="animate-spin-slow-reverse" style={{ animationDuration: '45s', transformOrigin: 'center' }}>
                <circle cx="200" cy="200" r="110" fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                <g className="animate-spin-slow" style={{ animationDuration: '45s', transformOrigin: '200px 90px' }}>
                  <OrbitNode cx="200" cy="90" label="MySQL" color="#4479A1" description="600+ merchant records with relational data modeling" delay={0} />
                </g>
                <g className="animate-spin-slow" style={{ animationDuration: '45s', transformOrigin: '295px 255px' }}>
                  <OrbitNode cx="295" cy="255" label="Redis" color="#DC382D" description="Search caching, autocomplete, rate limiting" delay={0} />
                </g>
                <g className="animate-spin-slow" style={{ animationDuration: '45s', transformOrigin: '105px 255px' }}>
                  <OrbitNode cx="105" cy="255" label="SQLAlchemy" color="#D71F00" description="Async ORM for database interactions" delay={0} />
                </g>
              </g>

              {/* Inner Ring (Backend/App) */}
              <g className="animate-spin-slow" style={{ animationDuration: '30s', transformOrigin: 'center' }}>
                <circle cx="200" cy="200" r="60" fill="none" stroke="#1E293B" strokeWidth="1" strokeDasharray="4 4" />
                <g className="animate-spin-slow-reverse" style={{ animationDuration: '30s', transformOrigin: '200px 140px' }}>
                  <OrbitNode cx="200" cy="140" label="Python" color="#FFD43B" description="Core backend language — async services" delay={0} />
                </g>
                <g className="animate-spin-slow-reverse" style={{ animationDuration: '30s', transformOrigin: '252px 230px' }}>
                  <OrbitNode cx="252" cy="230" label="FastAPI" color="#009688" description="12 REST API endpoints with async support" delay={0} />
                </g>
                <g className="animate-spin-slow-reverse" style={{ animationDuration: '30s', transformOrigin: '148px 230px' }}>
                  <OrbitNode cx="148" cy="230" label="Pydantic" color="#E92063" description="Strict data validation and typing" delay={0} />
                </g>
              </g>

              {/* Center Node (KAPS) */}
              <g className="group cursor-pointer">
                <circle cx="200" cy="200" r="24" fill="#2563EB" />
                <text x="200" y="200" textAnchor="middle" dominantBaseline="central" fill="#FFFFFF" fontSize="10" fontWeight="bold" className="pointer-events-none">KAPS</text>
                <circle cx="200" cy="200" r="28" fill="none" stroke="#2563EB" strokeWidth="1" className="animate-ping" style={{ animationDuration: '3s' }} />
              </g>
            </svg>
          </div>

          {/* Metrics Bar */}
          <div ref={ref} className="w-full bg-[#0B1120] border border-[#1E293B] rounded-2xl p-6 shadow-xl">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-x divide-[#1E293B] divide-solid">
              <MetricNumber endValue={12} label="API Endpoints" isVisible={isVisible} />
              <MetricNumber endValue={53} label="Tests" isVisible={isVisible} />
              <MetricNumber endValue={90} label="Coverage" isVisible={isVisible} />
              <MetricNumber endValue={600} label="Merchants" isVisible={isVisible} />
              <MetricNumber endValue={13} label="K8s Manifests" isVisible={isVisible} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStackOrbit;
