import React from 'react';

const CTAFooter = ({ onLaunch }) => {
  return (
    <section id="cta" className="w-full h-[50vh] min-h-[400px] flex flex-col justify-center items-center bg-gradient-to-b from-[#111827] to-[#0B1120] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2563EB]/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="relative z-10 text-center px-6">
        <h2 className="text-[32px] font-semibold text-[#F1F5F9] mb-4">Ready to explore?</h2>
        <p className="text-[16px] text-[#94A3B8] max-w-[500px] mx-auto mb-10">
          Launch the platform and experience intelligent credit decisioning firsthand.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button 
            onClick={onLaunch}
            className="h-[44px] w-[180px] bg-[#2563EB] hover:bg-[#3B82F6] hover:scale-[1.02] active:scale-95 text-white rounded transition-all flex items-center justify-center font-medium"
          >
            Launch Platform →
          </button>
          <a 
            href="https://github.com/karan-patel11/credit-analyzer" 
            target="_blank" 
            rel="noopener noreferrer"
            className="h-[44px] w-[180px] bg-transparent border border-[#334155] text-[#F1F5F9] hover:border-[#64748B] hover:bg-[#1F2937] active:scale-95 rounded transition-all flex items-center justify-center font-medium"
          >
            View on GitHub
          </a>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-[13px] text-[#64748B] mb-4">Built by Karan Patel</p>
          <div className="flex space-x-6 mb-12">
            <a href="https://github.com/karan-patel11" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#F1F5F9] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
            <a href="https://linkedin.com/in/patelkaran11" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#F1F5F9] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a href="https://patelkaran.tech" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#F1F5F9] transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </a>
          </div>
          
          <div className="text-[11px] text-[#475569] tracking-wider">
            KAPS AI · 2026 · Python · FastAPI · MySQL · Redis · Kubernetes
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTAFooter;
