import React from 'react';

export default function Certificates() {
  return (
    <div className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header - Elevated, Glowing Rectangle */}
        <div className="bg-zinc-50 border border-emerald-500/30 p-16 rounded-[2.5rem] mb-20 shadow-[0_0_50px_-10px_rgba(5,150,105,0.4)]">
          <h1 className="text-6xl font-extrabold tracking-tighter text-zinc-950 mb-6">REPLAST Integrity</h1>
          <p className="text-xl text-zinc-600 max-w-2xl">
            We are the primary digital architecture connecting verified structural scrap streams with industrial designers. Our mission is to transform opaque waste management into a transparent, high-value asset economy.
          </p>
        </div>

        {/* Company Mission Statement */}
        <div className="mb-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-zinc-950 mb-6">What We Do</h2>
            <p className="text-zinc-600 leading-relaxed">
              REPLAST acts as the essential verification layer between waste collectors and product innovators. By providing real-time data on material quality, location, and structural integrity, we ensure that recycled materials are not just "reused," but engineered for high-performance industrial applications.
            </p>
          </div>
          <div className="bg-zinc-950 p-8 rounded-3xl">
            <h3 className="text-emerald-400 font-bold mb-4 uppercase tracking-widest text-sm">Our Impact</h3>
            <p className="text-zinc-300">We replace traditional "black-box" recycling with an open-access directory, reducing carbon overhead and ensuring 100% material traceability from source to product.</p>
          </div>
        </div>

        {/* Certificates Section */}
        <h2 className="text-3xl font-bold text-zinc-950 mb-12">Verified Transaction Certificates</h2>
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Dummy Certificate 1 */}
          <div className="border border-zinc-200 p-8 rounded-3xl hover:border-emerald-500/50 transition-all hover:shadow-[0_0_30px_rgba(5,150,105,0.1)]">
            <div className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em] mb-4">Verification #RP-99201</div>
            <h3 className="text-xl font-bold mb-2">Structural Polymer Chain-of-Custody</h3>
            <p className="text-sm text-zinc-500 mb-6">Certifies that 500kg of HDPE (Type 2) was successfully transferred from a verified municipal collector to the Apex Design Lab.</p>
            <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
              <span>Status: Authenticated</span>
              <span className="text-emerald-600">Verified by REPLAST</span>
            </div>
          </div>

          {/* Dummy Certificate 2 */}
          <div className="border border-zinc-200 p-8 rounded-3xl hover:border-emerald-500/50 transition-all hover:shadow-[0_0_30px_rgba(5,150,105,0.1)]">
            <div className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em] mb-4">Verification #RP-44312</div>
            <h3 className="text-xl font-bold mb-2">Logistics & Emission Offset Log</h3>
            <p className="text-sm text-zinc-500 mb-6">Certifies that transportation logistics were optimized via the REPLAST regional mapping protocol, saving 42kg of CO2 emissions.</p>
            <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
              <span>Status: Offset Approved</span>
              <span className="text-emerald-600">Verified by REPLAST</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
