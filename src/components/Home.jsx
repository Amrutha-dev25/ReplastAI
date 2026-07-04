import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const METRICS = [
  { value: '42,800+ T',  label: 'Aggregated Sourcing Volume',         detail: 'Cross-border routed polymer assets' },
  { value: '1,240+',     label: 'Verified Ecosystem Counterparties',  detail: 'Vetted industrial suppliers & buyers' },
  { value: '0% Leakage', label: 'Matched Supply Stream Integrity',    detail: 'End-to-end transparent chain of custody' },
];

const STEPS = [
  {
    id: '01', title: 'Intelligent Counterparty Matching', tagline: 'SUPPLY CHAIN MATRIX ALIGNMENT',
    description: 'Our platform matches buyer manufacturing criteria directly with certified recycling processors, cutting broker markup.',
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=1200',
    accent: 'border-l-emerald-500',
  },
  {
    id: '02', title: 'Ledger-Backed Specification Audits', tagline: 'CHEMICAL & DENSITY DATA VALIDATION',
    description: 'Melt Flow Indexes and contamination margins are locked in prior to allocation mapping, ensuring total buyer compliance.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200',
    accent: 'border-l-sky-500',
  },
  {
    id: '03', title: 'Optimized Settlement Pipeline', tagline: 'JUST-IN-TIME LOGISTICS ROUTING',
    description: 'Our automated routing engine manages multi-node dispatch logs, moving materials from seller beds to buyer silos.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200',
    accent: 'border-l-teal-500',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [activeStep,      setActiveStep]      = useState(0);
  const [selectedPortal,  setSelectedPortal]  = useState('supply');

  return (
    <div className="bg-zinc-50 text-zinc-800 h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth selection:bg-emerald-100 selection:text-emerald-900">

      {/* ── PAGE 1: Hero ─────────────────────────────────────────────────── */}
      <section className="relative w-full h-screen snap-start flex items-center justify-center py-6 px-4 md:px-6 overflow-hidden bg-zinc-50">
        <div className="absolute inset-0 max-w-6xl mx-auto h-[90%] rounded-3xl opacity-60 pointer-events-none">
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('https://img.pikbest.com/wp/202343/plastic-bags-blue-trash-bag-abstract-texture-of-crumpled-film-background_9973796.jpg!bw800')` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 via-transparent to-zinc-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-50 via-transparent to-zinc-50" />
        </div>

        <div className="relative max-w-4xl mx-auto flex flex-col items-center text-center space-y-8 z-10 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-zinc-200 rounded-full text-xs font-semibold tracking-wide text-zinc-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Next Generation Circular Polymer Sourcing Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.15] text-zinc-900">
            Trading High Purity Recycled Plastics with Absolute Ledger Certainty.
          </h1>
          <p className="text-sm md:text-base text-zinc-600 max-w-2xl">
            Connecting verified industrial suppliers with enterprise manufacturing innovators. Access highly homogenized, lab-analyzed polymer feedstocks with zero composition drift.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all">
              Deploy Supply Node
            </button>
            <button onClick={() => navigate('/marketplace')} className="w-full sm:w-auto px-8 py-3.5 bg-white border border-zinc-300 text-zinc-800 text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm hover:bg-zinc-50 transition-all">
              Access Procurement Hub
            </button>
          </div>
        </div>
      </section>

      {/* ── PAGE 2: Ecosystem Framework ──────────────────────────────────── */}
      <section className="w-full h-screen snap-start bg-zinc-100 flex flex-col justify-center items-center py-4 px-6 md:px-12 overflow-hidden">
        <div className="max-w-7xl w-full mx-auto space-y-5 z-30">

          {/* Metrics */}
          <div className="w-full p-4 md:p-5 bg-white border border-zinc-200/60 shadow-sm rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-zinc-200/80">
              {METRICS.map((m, i) => (
                <div key={i} className="pt-2 md:pt-0 md:px-6 first:pl-0 space-y-0.5 text-center md:text-left group">
                  <div className="text-xl lg:text-2xl font-black tracking-tight text-zinc-900 group-hover:text-emerald-600 transition-colors">{m.value}</div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{m.label}</div>
                  <div className="text-[10px] text-zinc-400 leading-tight">{m.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1 text-center lg:text-left">
                <h2 className="text-xl md:text-3xl font-black tracking-tight text-zinc-950">Ecosystem Connection Framework</h2>
                <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-bold">Bridging industrial supply pipelines with technical manufacturing nodes</p>
              </div>
              <div className="space-y-2.5">
                {STEPS.map((step, index) => {
                  const isActive = activeStep === index;
                  return (
                    <div
                      key={index}
                      onMouseEnter={() => setActiveStep(index)}
                      onClick={() => setActiveStep(index)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-500 cursor-pointer flex gap-4 bg-white ${
                        isActive
                          ? `${step.accent} border-zinc-200 shadow-[0_20px_45px_rgba(0,0,0,0.06)] -translate-y-0.5 lg:translate-x-2.5`
                          : 'border-transparent opacity-60 hover:opacity-95 shadow-sm'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg font-black text-xs flex items-center justify-center shrink-0 transition-all ${
                        isActive ? 'bg-zinc-950 text-white' : 'bg-zinc-200/70 text-zinc-500'
                      }`}>
                        {step.id}
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <span className="block text-[8px] font-bold tracking-widest text-zinc-400 uppercase">{step.tagline}</span>
                        <h3 className="text-sm font-black text-zinc-900">{step.title}</h3>
                        <div className={`grid transition-all duration-500 overflow-hidden ${isActive ? 'grid-rows-[1fr] opacity-100 pt-0.5' : 'grid-rows-[0fr] opacity-0'}`}>
                          <p className="text-[11px] text-zinc-600 leading-relaxed overflow-hidden">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-5 h-[380px] relative w-full rounded-3xl overflow-hidden">
              {STEPS.map((step, index) => (
                <div key={index} className={`absolute inset-0 transition-all duration-1000 ease-out ${activeStep === index ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
                  <img src={step.image} alt={step.title} className="w-full h-full object-cover rounded-3xl" />
                  <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-zinc-100 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-zinc-100 to-transparent pointer-events-none" />
                  <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-zinc-100 via-zinc-100/10 to-transparent pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PAGE 3: Portal Selection ─────────────────────────────────────── */}
      <section className="w-full h-screen snap-start bg-zinc-100 flex flex-col justify-center p-8 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={selectedPortal === 'supply'
              ? 'https://recedebioplastics.com/wp-content/uploads/2023/04/recede-bioplastics-pppp.jpg'
              : 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1600'}
            alt="Portal Background"
            className="w-full h-full object-cover opacity-60 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[0.5px]" />
        </div>

        <div className="relative z-20 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {[
            { key: 'supply', label: 'Material Supply Stream', tag: 'Channel Endpoint 01', color: 'emerald' },
            { key: 'demand', label: 'Enterprise Fulfillment Hub', tag: 'Channel Endpoint 02', color: 'sky' },
          ].map(({ key, label, tag, color }) => (
            <button
              key={key}
              onClick={() => setSelectedPortal(key)}
              className={`group text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                selectedPortal === key
                  ? `bg-white border-${color}-500 shadow-[0_15px_30px_rgba(0,0,0,0.06)] scale-[1.01]`
                  : 'bg-white/95 backdrop-blur-sm border-zinc-200/80 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="space-y-1">
                <span className={`block text-[9px] font-black tracking-widest uppercase ${selectedPortal === key ? `text-${color}-600` : 'text-zinc-400'}`}>{tag}</span>
                <h4 className="text-sm font-black text-zinc-900 tracking-tight">{label}</h4>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedPortal === key ? `bg-${color}-600 text-white` : 'bg-zinc-200/80 text-zinc-500 group-hover:translate-x-1'}`}>
                <svg className="w-5 h-5 stroke-current fill-none" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <div className="relative z-20 max-w-4xl mx-auto w-full py-6">
          <div className="w-full bg-white/95 backdrop-blur-md border border-zinc-200/80 p-8 md:p-12 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.06)] min-h-[355px] flex flex-col justify-center">
            {selectedPortal === 'supply' ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-[10px] font-extrabold tracking-widest text-emerald-700 uppercase bg-emerald-50 inline-block px-2.5 py-1 rounded-md border border-emerald-200/40">
                    Active Channel: Supply Logistics Terminal
                  </div>
                  <h3 className="text-2xl md:text-4xl font-black tracking-tight text-zinc-900 leading-tight">
                    Liquidate Recycled Feedstock Volume at Scale
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-zinc-600 max-w-2xl leading-relaxed">
                  Offload industrial polymers, crushed bales, and technical regranulates directly to contract-ready manufacturing enterprises.
                </p>
                <div className="w-full h-px bg-zinc-200" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-600 font-medium">
                  {['Verified enterprise procurement','Automated spec compliance ledgers','Real-time demand matching'].map(f => (
                    <div key={f} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{f}</div>
                  ))}
                </div>
                <button onClick={() => navigate('/login')} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all">
                  Initialize Supply Stream
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-[10px] font-extrabold tracking-widest text-sky-700 uppercase bg-sky-50 inline-block px-2.5 py-1 rounded-md border border-sky-200/40">
                    Active Channel: Procurement Hub
                  </div>
                  <h3 className="text-2xl md:text-4xl font-black tracking-tight text-zinc-900 leading-tight">
                    Secure High Purity Technical Polymers
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-zinc-600 max-w-2xl leading-relaxed">
                  Filter raw network streams by laboratory purity rates, melt index requirements, and verified shipping routes.
                </p>
                <div className="w-full h-px bg-zinc-200" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-600 font-medium">
                  {['Compound variants (r-LDPE, PP)','Lab-backed composition data','Just-in-time routing'].map(f => (
                    <div key={f} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sky-500" />{f}</div>
                  ))}
                </div>
                <button onClick={() => navigate('/marketplace')} className="px-6 py-3 bg-zinc-900 hover:bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all">
                  Open Procurement Hub
                </button>
              </div>
            )}
          </div>
        </div>

      </section>
    </div>
  );
}
