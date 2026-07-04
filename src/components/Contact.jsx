import React from 'react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header - Elevated, Glowing Rectangle */}
        <div className="mt-12 bg-zinc-50 border border-emerald-500/30 p-16 rounded-[2.5rem] mb-20 shadow-[0_0_50px_-10px_rgba(5,150,105,0.4)]">
          <h1 className="text-6xl font-extrabold tracking-tighter text-zinc-950 mb-6">Contact the Protocol</h1>
          <p className="text-xl text-zinc-600 max-w-2xl">
            Direct communication lines for material stream verification, design hub partnerships, and logistical integration.
          </p>
        </div>

        {/* Contact Layout */}
        <div className="grid md:grid-cols-2 gap-16">
          
          {/* Inquiry Form */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-zinc-950">Send an Inquiry</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Organization Name</label>
                <input type="text" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Message Body</label>
                <textarea rows="4" className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 focus:border-emerald-500 outline-none transition-all"></textarea>
              </div>
              <button className="bg-zinc-950 text-white font-bold py-4 px-8 rounded-xl hover:bg-emerald-600 transition-all">
                INITIATE TRANSMISSION
              </button>
            </form>
          </div>

          {/* Operational Info */}
          <div className="bg-zinc-900 text-white p-12 rounded-[2.5rem]">
            <h2 className="text-2xl font-bold mb-8 text-emerald-400">Operational Hub</h2>
            <div className="space-y-6">
              <div>
                <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Global Logistics</h4>
                <p className="font-semibold">Replast HQ, Sector 7-B, Industrial District</p>
              </div>
              <div>
                <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Digital Access</h4>
                <p className="font-semibold">network@replast.protocol</p>
              </div>
              <div>
                <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Protocol Hours</h4>
                <p className="font-semibold">24/7 Automated Verification</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
