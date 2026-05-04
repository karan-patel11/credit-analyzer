import React from 'react';
import { GITHUB_URL, LINKEDIN_URL, PORTFOLIO_URL } from '../../utils/constants';

const howItWorksItems = [
  {
    number: '01',
    title: 'Search and Discover',
    description:
      'Relevance-ranked merchant search with personalized results and Redis-cached autocomplete under 1ms.'
  },
  {
    number: '02',
    title: 'See Your Pre-Approval',
    description:
      'Set your profile once and see personalized purchasing power at every merchant instantly.'
  },
  {
    number: '03',
    title: 'Instant Credit Decision',
    description:
      'Enter a purchase amount and get approved with flexible payment plans in milliseconds.'
  },
  {
    number: '04',
    title: 'Merchant Onboarding',
    description:
      'Businesses join the marketplace through an AI-powered financial review and risk assessment.'
  }
];

const featureItems = [
  {
    number: '01',
    title: 'Relevance-ranked search',
    description:
      'Weighted scoring combines name match, industry fit, popularity and approval history.'
  },
  {
    number: '02',
    title: 'Real-time pre-approval',
    description:
      'Personalized credit limits at every merchant with no hard credit pulls.'
  },
  {
    number: '03',
    title: 'Deterministic scoring',
    description:
      'Every decision is explainable and consistent. No black-box logic.'
  },
  {
    number: '04',
    title: 'Flexible payment plans',
    description:
      'Pay in 4 at 0% APR. Or choose 6, 12, or 24 month plans with real amortization.'
  },
  {
    number: '05',
    title: 'AI merchant review',
    description:
      'CSV pipeline with cash flow analysis, risk scoring, and LLM-generated credit memos.'
  },
  {
    number: '06',
    title: 'Sub-5ms search latency',
    description:
      'Redis-cached queries with MySQL-backed filtering across 600+ merchants.'
  },
  {
    number: '07',
    title: 'Production infrastructure',
    description:
      '53 tests at 90% coverage. Docker, Kubernetes with autoscaling.'
  }
];

const techItems = [
  'Python',
  'FastAPI',
  'MySQL',
  'Redis',
  'React',
  'Docker',
  'Kubernetes',
  'Pydantic',
  'Groq',
  'Helm'
];

const architectureServices = ['Search Service', 'Credit Engine', 'Merchant Onboard'];

const SpiralVisual = () => {
  const rings = Array.from({ length: 20 }, (_, index) => {
    const progress = index / 19;
    const cy = 82 + index * 22;
    const rx = 42 + Math.sin(progress * Math.PI) * 72;
    const ry = 12 + Math.cos(progress * Math.PI * 1.2) * 2;
    const rotation = -22 + index * 7;
    const opacity = 0.3 + progress * 0.5;
    const xOffset = Math.sin(index * 0.38) * 26;

    return {
      id: `ring-${index}`,
      cy,
      rx,
      ry,
      rotation,
      opacity,
      xOffset
    };
  });

  return (
    <div className="relative flex w-full items-center justify-center">
      <div className="absolute h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.05),transparent_68%)]" />
      <svg
        viewBox="0 0 400 600"
        className="relative h-[260px] w-full max-w-[260px] md:h-[420px] md:max-w-[340px] lg:h-[600px] lg:max-w-[400px]"
        aria-hidden="true"
      >
        <g className="origin-center animate-hero-spiral">
          {rings.map((ring) => (
            <ellipse
              key={ring.id}
              cx={200 + ring.xOffset}
              cy={ring.cy}
              rx={ring.rx}
              ry={ring.ry}
              fill="none"
              stroke="#CCCCCC"
              strokeWidth="1"
              opacity={ring.opacity}
              transform={`rotate(${ring.rotation} ${200 + ring.xOffset} ${ring.cy})`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

const SectionTitle = ({ children }) => (
  <h2 className="mb-16 text-left text-[34px] font-normal leading-none tracking-[-0.03em] text-[var(--text-primary)] md:text-[40px]">
    {children}
  </h2>
);

const NumberedRows = ({ items }) => (
  <div className="border-y border-[var(--border-default)]">
    {items.map((item) => (
      <div
        key={item.number}
        className="group border-b border-[var(--border-default)] px-0 py-10 transition-colors duration-200 last:border-b-0 hover:bg-[var(--bg-card)]"
      >
        <div className="flex flex-col gap-5 md:flex-row md:gap-20">
          <div className="w-10 shrink-0 font-mono-num text-[14px] text-[var(--text-muted)]">
            {item.number}
          </div>
          <div>
            <div className="font-sans text-[21px] font-medium text-[var(--text-primary)] md:text-[22px]">
              {item.title}
            </div>
            <p className="mt-2 max-w-[720px] text-[15px] leading-7 text-[var(--text-secondary)]">
              {item.description}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ArchitectureBox = ({ children }) => (
  <div className="rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-card)] px-5 py-3 text-[14px] text-[var(--text-primary)]">
    {children}
  </div>
);

const FooterColumn = ({ title, links }) => (
  <div className="min-w-[160px]">
    <div className="mb-5 text-[13px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
      {title}
    </div>
    <div className="space-y-3">
      {links.map((link) =>
        link.onClick ? (
          <button
            key={link.label}
            type="button"
            onClick={link.onClick}
            className="block text-left text-[14px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            {link.label}
          </button>
        ) : (
          <a
            key={link.label}
            href={link.href}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
            className="block text-[14px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            {link.label}
          </a>
        )
      )}
    </div>
  </div>
);

const LandingPage = ({ onLaunch }) => {
  const marqueeText = techItems.join(' · ');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-[var(--border-default)] bg-[var(--bg-primary)]">
        <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between px-6 md:px-10 xl:px-20">
          <div className="font-display text-[20px] font-medium text-[var(--text-primary)]">KAPS</div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={onLaunch}
              className="inline-flex h-[42px] items-center justify-center rounded-[6px] bg-[#0A0A0A] px-[22px] text-[14px] font-medium text-white transition-colors hover:bg-[#222222]"
            >
              Launch Platform
            </button>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              GitHub →
            </a>
          </div>
        </div>
      </header>

      <section className="min-h-screen border-b border-[var(--border-default)] pt-16">
        <div className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-[1440px] grid-cols-1 items-center gap-12 px-6 py-16 md:px-10 lg:grid-cols-[55%_45%] lg:gap-0 lg:px-20">
          <div className="flex flex-col justify-center lg:pr-10">
            <div className="mb-8 text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              KAPS AI
            </div>
            <h1 className="max-w-[580px] text-[48px] font-normal leading-[1.05] tracking-[-0.02em] text-[var(--text-primary)] md:text-[60px] xl:text-[68px]">
              The intelligent marketplace for consumer credit
            </h1>
            <p className="mt-7 max-w-[460px] text-[17px] leading-[1.6] text-[var(--text-secondary)]">
              Search merchants. See your pre-approval. Get instant credit decisions with flexible payment plans.
            </p>

            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
              <button
                type="button"
                onClick={onLaunch}
                className="inline-flex h-[50px] items-center justify-center rounded-[8px] bg-[#0A0A0A] px-7 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-[#222222]"
              >
                Launch Platform
              </button>
              <a
                href="#how-it-works"
                className="text-[15px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                See it in action →
              </a>
            </div>

            <div className="mt-16 text-[13px] text-[var(--text-muted)]">
              600+ Merchants · Sub-5ms Search · 90% Test Coverage
            </div>
          </div>

          <div className="flex justify-center">
            <SpiralVisual />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[var(--bg-primary)] px-6 py-[96px] md:px-10 lg:px-20 xl:py-[120px]">
        <div className="mx-auto max-w-[1280px]">
          <SectionTitle>How it works</SectionTitle>
          <NumberedRows items={howItWorksItems} />
        </div>
      </section>

      <section className="bg-[var(--bg-primary)] px-6 py-[96px] md:px-10 lg:px-20 xl:py-[120px]">
        <div className="mx-auto max-w-[1280px]">
          <SectionTitle>Designed for real-world credit</SectionTitle>
          <NumberedRows items={featureItems} />
        </div>
      </section>

      <section className="bg-[var(--bg-secondary)] py-12">
        <div className="mx-auto max-w-[1440px] px-6 text-center md:px-10 lg:px-20">
          <div className="mb-6 text-[13px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
            Built with
          </div>
        </div>
        <div className="group overflow-hidden">
          <div className="animate-tempo-marquee flex w-max gap-16 whitespace-nowrap px-6 text-[15px] text-[var(--text-tertiary)] group-hover:[animation-play-state:paused] md:px-10 lg:px-20">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center gap-16">
                {marqueeText.split(' · ').map((item) => (
                  <span key={`${copy}-${item}`}>{item}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="architecture" className="bg-[var(--bg-primary)] px-6 py-[96px] md:px-10 lg:px-20 xl:py-[120px]">
        <div className="mx-auto max-w-[1280px]">
          <SectionTitle>System architecture</SectionTitle>

          <div className="space-y-6 text-left">
            <div className="flex flex-wrap items-center gap-3 text-[var(--text-muted)]">
              <ArchitectureBox>Consumer Browser</ArchitectureBox>
              <span aria-hidden="true">→</span>
              <ArchitectureBox>React Frontend</ArchitectureBox>
              <span aria-hidden="true">→</span>
              <ArchitectureBox>FastAPI Backend</ArchitectureBox>
            </div>

            <div className="flex flex-wrap items-start gap-3 text-[var(--text-muted)]">
              <span className="pt-3" aria-hidden="true">→</span>
              <div className="flex flex-wrap gap-3">
                {architectureServices.map((service) => (
                  <ArchitectureBox key={service}>{service}</ArchitectureBox>
                ))}
              </div>
              <span className="pt-3" aria-hidden="true">→</span>
              <ArchitectureBox>MySQL 8.0</ArchitectureBox>
              <span className="pt-3" aria-hidden="true">→</span>
              <ArchitectureBox>Redis 7.0</ArchitectureBox>
            </div>
          </div>

          <p className="mt-8 text-[14px] text-[var(--text-muted)]">
            Deployed with Docker Compose locally. Kubernetes in production with HPA autoscaling.
          </p>
        </div>
      </section>

      <footer className="border-t border-[var(--border-default)] bg-[var(--bg-secondary)] px-6 py-16 md:px-10 lg:px-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-12 lg:flex-row">
            <div>
              <div className="font-display text-[24px] font-medium text-[var(--text-primary)]">KAPS</div>
              <div className="mt-3 text-[14px] text-[var(--text-secondary)]">Built by Karan Patel</div>
            </div>

            <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
              <FooterColumn
                title="Platform"
                links={[
                  { label: 'Launch App', onClick: onLaunch },
                  { label: 'Merchant Search', href: '#how-it-works' },
                  { label: 'Credit Check', href: '#architecture' },
                  { label: 'Merchant Onboarding', href: '#architecture' }
                ]}
              />
              <FooterColumn
                title="Code"
                links={[
                  {
                    label: 'GitHub',
                    href: GITHUB_URL,
                    external: true
                  },
                  { label: 'Architecture', href: '#architecture' },
                  { label: 'Test Coverage', href: '#how-it-works' }
                ]}
              />
              <FooterColumn
                title="Connect"
                links={[
                  {
                    label: 'LinkedIn',
                    href: LINKEDIN_URL,
                    external: true
                  },
                  {
                    label: 'Portfolio',
                    href: PORTFOLIO_URL,
                    external: true
                  }
                ]}
              />
            </div>
          </div>

          <div className="mt-12 border-t border-[var(--border-default)] pt-6 text-[13px] text-[var(--text-muted)]">
            © 2026 KAPS AI. Python · FastAPI · MySQL · Redis · Kubernetes
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
