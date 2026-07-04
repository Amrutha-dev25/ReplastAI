import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-zinc-900 border-t border-zinc-800 py-16 px-8 md:px-16 text-zinc-400 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-start">

        {/* Left */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">REPLAST DIGITAL PLATFORMS</h4>
          <div className="text-xs space-y-1 text-zinc-500 leading-relaxed">
            <p>Global Exchange Node Stream 12</p>
            <p>Technical Polymer Asset Distribution Hub</p>
            <p>Registration Identity: REG-02886960307</p>
          </div>
        </div>

        {/* Center */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-emerald-600/40 animate-spin [animation-duration:20s] absolute" />
            <div className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center bg-zinc-950 font-mono text-sm font-black text-emerald-400">
              R
            </div>
          </div>
          <div className="text-center">
            <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-300">REPLAST GROUP</span>
            <span className="text-[10px] text-zinc-500 block mt-1">Global Procurement Agreement Node</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col md:items-end space-y-4 text-xs">
          <div className="flex items-center gap-6 text-zinc-400">
            <a href="#privacy" className="hover:text-emerald-400 transition-colors">Privacy Framework</a>
            <span className="text-zinc-700">|</span>
            <a href="#cookies" className="hover:text-emerald-400 transition-colors">Cookie Governance</a>
          </div>
          <p className="text-[11px] text-zinc-600 md:text-right max-w-xs leading-normal">
            System network structures are subject to technical evaluation and operational guidelines managed by regional compliance clusters.
          </p>
        </div>

      </div>
    </footer>
  );
}
