import React from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const Card = ({ icon, title, body, stat, accentClass, delay }) => {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.2 });

  return (
    <div 
      ref={ref}
      className={`flex-1 min-w-[280px] bg-[#162032] border border-[#1E293B] rounded-xl p-8 flex flex-col transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`w-10 h-10 mb-6 ${accentClass} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-[18px] font-semibold text-[#F1F5F9] mb-3">{title}</h3>
      <p className="text-[14px] text-[#94A3B8] leading-relaxed mb-8 flex-1">{body}</p>
      <div className={`mt-auto text-[13px] font-mono-num font-medium ${accentClass}`}>
        {stat}
      </div>
    </div>
  );
};

const ValueProps = () => {
  return (
    <section id="value-props" className="w-full py-24 bg-[#111827]">
      <div className="max-w-[1100px] mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          <Card 
            delay={0}
            accentClass="text-[#2563EB]"
            title="Know Before You Shop"
            body="See your personalized pre-approval amount at every merchant. No hard credit pulls, no surprises. Search, compare, and shop with confidence."
            stat="Pre-approval in <1ms"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            }
          />
          <Card 
            delay={150}
            accentClass="text-[#8B5CF6]"
            title="Grow Your Customer Base"
            body="Join the KAPS marketplace and reach credit-ready consumers. Our risk engine evaluates merchant health so consumers shop with trust."
            stat="600+ merchants onboarded"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
              </svg>
            }
          />
          <Card 
            delay={300}
            accentClass="text-[#06B6D4]"
            title="Intelligent Risk Decisions"
            body="Real-time credit scoring powered by deterministic financial logic — no black-box AI. Every decision is explainable, auditable, and consistent."
            stat="90% test coverage"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
