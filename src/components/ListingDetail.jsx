import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext.jsx';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl, token, authHeaders } = useAppContext();

  const [listing,    setListing]    = useState(null);
  const [pickupDate, setPickupDate] = useState('');
  const [message,    setMessage]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  useEffect(() => {
    axios.get(`${backendUrl}/api/listings/list`)
      .then(res => {
        if (res.data.success) {
          setListing(res.data.listings.find(l => l._id === id) ?? null);
        }
      })
      .catch(err => console.error('Failed to fetch listing:', err));
  }, [id, backendUrl]);

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!token) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${backendUrl}/api/requests/submit`,
        { listingId: id, proposedPickupDate: pickupDate, message },
        authHeaders
      );
      if (res.data.success) {
        setSubmitted(true);
        setTimeout(() => navigate('/marketplace'), 2000);
      }
    } catch {
      alert('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!listing) {
    return (
      <div className="p-6 text-xs font-mono text-zinc-500 text-center pt-24">
        // Mapping manifest data...
      </div>
    );
  }

  const imageUrl = listing.images?.[0] || 'https://via.placeholder.com/600x400?text=No+Image';

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">

      {/* Left: image + specs */}
      <div className="space-y-4">
        <div className="aspect-video bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover" />
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-2 font-mono text-xs">
          {[
            ['Resin Designation', listing.plasticType],
            ['Structural Grading', listing.condition],
            ['Net Volume Scale',   `${listing.weightKg} kg`],
            ['Location Origin',    listing.location],
            ['AI Sorting Confidence', listing.confidence ? `${(listing.confidence * 100).toFixed(1)}%` : '95.0%'],
            ['Recyclability Class', listing.recyclability || 'High'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-zinc-500">{label}:</span>
              <span className="text-zinc-200">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: title + request form */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">{listing.title}</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">{listing.description}</p>
        </div>

        {submitted ? (
          <div className="bg-emerald-950/40 border border-emerald-500/30 p-6 rounded-2xl text-center font-mono text-sm text-emerald-400">
            ✅ Procurement reservation logged. Redirecting...
          </div>
        ) : (
          <form onSubmit={handleRequest} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">// Procurement Terminal</h3>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Target Pickup Handoff Window</label>
              <input
                type="date" required value={pickupDate} onChange={e => setPickupDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Processing Notes / Offer Intent</label>
              <textarea
                rows={3} value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Specify processing intent..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit" disabled={submitting}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-zinc-950 text-xs font-mono font-bold uppercase rounded transition-colors shadow-[0_0_20px_rgba(16,185,129,0.1)]"
            >
              {submitting ? 'Submitting...' : 'Dispatch Reservation Request'}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
