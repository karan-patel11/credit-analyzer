import React, { useState, useEffect } from 'react';

const sections = [
  { id: 'hero', label: 'Intro' },
  { id: 'value-props', label: 'Value' },
  { id: 'how-it-works', label: 'How it Works' },
  { id: 'tech-stack', label: 'Tech Stack' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'cta', label: 'Launch' }
];

const ScrollDots = () => {
  const [activeId, setActiveId] = useState('hero');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col space-y-3 pointer-events-auto">
      {sections.map(({ id, label }) => {
        const isActive = activeId === id;
        return (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="group relative flex items-center justify-end"
            aria-label={`Scroll to ${label}`}
          >
            <span className={`absolute right-6 px-2 py-1 bg-[#1F2937] text-[#F1F5F9] text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mr-2 pointer-events-none`}>
              {label}
            </span>
            <div 
              className={`rounded-full transition-all duration-300 ${isActive ? 'w-2 h-2 bg-[#2563EB]' : 'w-1.5 h-1.5 bg-[#475569] group-hover:bg-[#94A3B8]'}`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default ScrollDots;
