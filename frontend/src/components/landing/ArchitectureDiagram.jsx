import React from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const ArchNode = ({ x, y, width, height, title, subtitle, desc, delay, isVisible }) => (
  <g 
    className={`group cursor-pointer transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
    style={{ transitionDelay: `${delay}ms`, transform: isVisible ? 'translateY(0)' : 'translateY(-20px)' }}
  >
    {/* Box */}
    <rect x={x} y={y} width={width} height={height} rx="8" fill="#111827" stroke="#1E293B" strokeWidth="2" className="transition-all duration-300 group-hover:stroke-[#2563EB] group-hover:shadow-[0_0_15px_rgba(37,99,235,0.3)]" />
    
    {/* Text */}
    <text x={x + width/2} y={y + height/2 - 5} textAnchor="middle" fill="#F1F5F9" fontSize="14" fontWeight="bold">{title}</text>
    <text x={x + width/2} y={y + height/2 + 12} textAnchor="middle" fill="#94A3B8" fontSize="12">{subtitle}</text>
    
    {/* Tooltip */}
    <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
      <rect x={x + width/2 - 120} y={y - 50} width="240" height="36" rx="6" fill="#1F2937" stroke="#334155" strokeWidth="1" />
      <text x={x + width/2} y={y - 28} textAnchor="middle" fill="#F1F5F9" fontSize="11">{desc}</text>
    </g>
  </g>
);

const ArchLine = ({ x1, y1, x2, y2, delay, isVisible, hasArrow = true }) => (
  <g className={`transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: `${delay}ms` }}>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth="2" className="group-hover:stroke-[#2563EB] group-hover:animate-pulse" />
    {hasArrow && (
      <polygon points={`${x2},${y2} ${x2-5},${y2-8} ${x2+5},${y2-8}`} fill="#334155" />
    )}
  </g>
);

const ArchitectureDiagram = () => {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.2 });

  return (
    <section id="architecture" className="w-full py-24 bg-[#0B1120] border-t border-[#1E293B]">
      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-[28px] font-semibold text-[#F1F5F9]">System Architecture</h2>
          <p className="text-[14px] text-[#94A3B8] mt-2">End-to-end request flow</p>
        </div>

        <div ref={ref} className="w-full overflow-x-auto flex justify-center pb-10">
          <svg width="800" height="600" viewBox="0 0 800 600" className="min-w-[600px]">
            
            {/* Level 1: Consumer */}
            <ArchNode x={320} y={20} width={160} height={60} title="Consumer" subtitle="Browser / Client" desc="Initiates search or checkout" delay={0} isVisible={isVisible} />
            <ArchLine x1={400} y1={80} x2={400} y2={120} delay={150} isVisible={isVisible} />

            {/* Level 2: Frontend */}
            <ArchNode x={320} y={120} width={160} height={60} title="React Frontend" subtitle="SPA / Vite" desc="Dark-mode Buy Now Pay Later interface with Demo/Live modes" delay={300} isVisible={isVisible} />
            <ArchLine x1={400} y1={180} x2={400} y2={220} delay={450} isVisible={isVisible} />
            <text x={410} y={205} fill="#64748B" fontSize="12" className={`transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '450ms' }}>REST API</text>

            {/* Level 3: Backend */}
            <ArchNode x={280} y={220} width={240} height={60} title="FastAPI Backend" subtitle="Python 3.11+" desc="12 async endpoints with Pydantic v2 validation" delay={600} isVisible={isVisible} />
            
            {/* Lines to Services */}
            <ArchLine x1={320} y1={280} x2={200} y2={320} delay={750} isVisible={isVisible} />
            <ArchLine x1={400} y1={280} x2={400} y2={320} delay={750} isVisible={isVisible} />
            <ArchLine x1={480} y1={280} x2={600} y2={320} delay={750} isVisible={isVisible} />

            {/* Level 4: Services */}
            <ArchNode x={120} y={320} width={160} height={60} title="Search Service" subtitle="Ranking & Retrieval" desc="Relevance-ranked search with weighted scoring" delay={900} isVisible={isVisible} />
            <ArchNode x={320} y={320} width={160} height={60} title="Credit Engine" subtitle="Decision & Pricing" desc="Real-time DTI-based scoring, amortization" delay={900} isVisible={isVisible} />
            <ArchNode x={520} y={320} width={160} height={60} title="Merchant Onboard" subtitle="Risk & Analysis" desc="CSV pipeline → risk scoring → LLM memo" delay={900} isVisible={isVisible} />

            {/* Lines to Database */}
            <ArchLine x1={200} y1={380} x2={200} y2={420} delay={1050} isVisible={isVisible} />
            <ArchLine x1={400} y1={380} x2={400} y2={420} delay={1050} isVisible={isVisible} />
            <ArchLine x1={600} y1={380} x2={600} y2={420} delay={1050} isVisible={isVisible} />

            {/* Level 5: Database */}
            <ArchNode x={160} y={420} width={480} height={60} title="MySQL Database" subtitle="Relational Storage" desc="Merchants, applications, search logs — 600+ seeded records" delay={1200} isVisible={isVisible} />

            {/* Line to Redis */}
            <ArchLine x1={400} y1={480} x2={400} y2={520} delay={1350} isVisible={isVisible} />

            {/* Level 6: Cache */}
            <ArchNode x={320} y={520} width={160} height={60} title="Redis" subtitle="In-memory Cache" desc="Query cache (5min TTL), autocomplete, rate limiting" delay={1500} isVisible={isVisible} />

          </svg>
        </div>
      </div>
    </section>
  );
};

export default ArchitectureDiagram;
