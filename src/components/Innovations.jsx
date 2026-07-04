import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Innovations() {
  const [activeTab, setActiveTab] = useState('All');
  const categories = ['All', '3D Printing', 'Industrial Design', 'Architecture'];

  const projects = [
    { id: 1, title: "Recycled PET Filament Matrix v1.4", cat: "3D Printing", img: "https://ud-machine.com/wp-content/uploads/2024/12/How-Can-3D-Printers-Support-the-Use-of-Recycled-Plastic.webp", desc: "Open-source extrusion configuration to convert beverage bottles into high-tensile 1.75mm filament." },
    { id: 2, title: "Monobloc Modular Chair", cat: "Industrial Design", img: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=800", desc: "Injection-molded seating crafted from agricultural utility barrels." },
    { id: 3, title: "Acoustic Wall Panels", cat: "Architecture", img: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=800", desc: "Architectural geometric panels engineered with high porosity for sound absorption." },
    { id: 4, title: "Reinforced Geogrid Mesh", cat: "3D Printing", img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800", desc: "High-tensile reinforcement mesh for civil engineering produced from reclaimed nylon." },
    { id: 5, title: "Pavement Binder Additive", cat: "Architecture", img: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800", desc: "Bitumen-additive derived from mixed-stream polymer waste, increasing surface durability." },
    { id: 6, title: "Fluid Containment Unit", cat: "Industrial Design", img: "https://www.shutterstock.com/image-photo/stacked-intermediate-bulk-containers-store-260nw-2692014615.jpg", desc: "Precision-engineered spill containment systems utilizing reinforced secondary-life plastics." }
  ];

  const filtered = activeTab === 'All' ? projects : projects.filter(p => p.cat === activeTab);

  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Rectangle: Now has a permanent, deep green glow */}
        <div className="mt-12 bg-zinc-50 border border-emerald-500/30 p-16 rounded-[2.5rem] mb-16 shadow-[0_0_50px_-10px_rgba(5,150,105,0.4)]">
          <div className="max-w-3xl">
            <h1 className="text-7xl font-extrabold tracking-tighter text-zinc-950 mb-8 leading-[0.9]">
              Innovation <br /> Showcase Matrix
            </h1>
            <p className="text-xl text-zinc-600 font-medium leading-relaxed">
              Explore high-value objects, open hardware blueprints, and physical components generated exclusively from materials diverted using the REPLAST protocol.
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-10 mb-16">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveTab(cat)} className={`text-sm font-bold uppercase tracking-[0.2em] transition-all ${activeTab === cat ? 'text-emerald-600' : 'text-zinc-400 hover:text-zinc-900'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Project Grid: Keeps the hover interaction as requested */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => (
              <motion.div 
                key={p.id} 
                layout 
                className="group bg-white rounded-3xl border border-zinc-100 p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_0_50px_-5px_rgba(5,150,105,0.4)] hover:border-emerald-600/50"
              >
                <div className="h-64 bg-zinc-100 rounded-2xl overflow-hidden mb-6">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="px-3 pb-3">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">{p.cat}</div>
                  <h3 className="text-xl font-bold text-zinc-950 mb-3">{p.title}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
