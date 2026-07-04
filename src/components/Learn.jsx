import React from 'react';

export default function Learn() {
  return (
    <div className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header - Consistent with previous "Elevated Rectangle" style */}
        <div className="bg-zinc-50 border border-emerald-500/30 p-16 rounded-[2.5rem] mb-20 shadow-[0_0_50px_-10px_rgba(5,150,105,0.4)]">
          <h1 className="text-6xl font-extrabold tracking-tighter text-zinc-950 mb-6">Understanding REPLAST</h1>
          <p className="text-xl text-zinc-600 max-w-2xl">
            A radical shift in reclamation. We bridge the gap between systemic waste and high-value design through transparent, open-access infrastructure.
          </p>
        </div>

        {/* Content Sections */}
        <div className="grid md:grid-cols-2 gap-16">
          
          {/* Section 1: The Problem & Solution */}
          <div>
            <h2 className="text-3xl font-bold text-zinc-950 mb-6">The Systemic Breakdown</h2>
            <p className="text-zinc-600 leading-relaxed mb-4">
              Traditional plastic reclamation fails due to systemic mislabeling and opaque delivery paths.
            </p>
            <p className="text-zinc-600 leading-relaxed">
              REPLAST resolves this by establishing an explicit, open-access directory that connects verified structural scrap streams directly with localized product design hubs.
            </p>
          </div>

          {/* Section 2: Core Polymers */}
          <div>
            <h2 className="text-3xl font-bold text-zinc-950 mb-6">Core Polymer Framework</h2>
            <p className="text-zinc-600 mb-6">We prioritize tracking these ultra-recyclable core polymers within our exchange framework:</p>
            <ul className="space-y-4">
              <li className="font-semibold text-zinc-900">PET (1) - Polyethylene Terephthalate</li>
              <li className="font-semibold text-zinc-900">HDPE (2) - High-Density Polyethylene</li>
              <li className="font-semibold text-zinc-900">LDPE (4) - Low-Density Polyethylene</li>
              <li className="font-semibold text-zinc-900">PP (5) - Polypropylene</li>
            </ul>
          </div>

        </div>

        {/* Section 3: Processing Guide */}
        <div className="mt-20 p-12 bg-zinc-950 rounded-3xl text-white">
          <h2 className="text-3xl font-bold mb-8">Verified Processing Protocol</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-emerald-400 mb-2">Decontaminate Inputs</h3>
              <p className="text-sm text-zinc-400">All material must undergo mechanical washing to eliminate biological materials or adhesives.</p>
            </div>
            <div>
              <h3 className="font-bold text-emerald-400 mb-2">Trace Location Logs</h3>
              <p className="text-sm text-zinc-400">Regional storage coordinates must be mapped accurately to optimize logistics and fuel consumption.</p>
            </div>
            <div>
              <h3 className="font-bold text-emerald-400 mb-2">Close Lifecycles</h3>
              <p className="text-sm text-zinc-400">Mark assets as "Collected" upon loading to push live updates to the innovation dashboard.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
