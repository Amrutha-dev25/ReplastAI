import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext.jsx';

export default function Marketplace() {
  const { isAuthenticated, orders, setOrders, backendUrl, authHeaders } = useAppContext();
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const TYPES = ['PET (1)', 'HDPE (2)', 'PVC (3)', 'LDPE (4)', 'PP (5)', 'PS (6)', 'Other (7)'];

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/listings/list`, authHeaders);
        if (data.success) {
          setListings(data.listings);
        }
      } catch (err) {
        console.error('Failed to fetch listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [backendUrl, authHeaders]);

  const handleMessage = (item) => {
    const existing = orders.find(o => String(o.id) === String(item._id || item.id));
    if (existing) {
      navigate(`/nexus/${existing.orderId}`);
      return;
    }
    const newOrder = { 
      ...item, 
      id: item._id || item.id,
      orderId: `msg_${item._id || item.id}_${Date.now()}`, 
      status: 'Discussion' 
    };
    setOrders(prev => [...prev, newOrder]);
    navigate(`/nexus/${newOrder.orderId}`);
  };

  const handlePurchase = (item) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const qty = prompt('Enter quantity (kg):');
    if (!qty || isNaN(qty)) return;
    const newOrder = { 
      ...item, 
      id: item._id || item.id,
      orderId: Date.now().toString(), 
      quantity: qty, 
      status: 'Pending Payment' 
    };
    setOrders(prev => [...prev, newOrder]);
    navigate(`/nexus/${newOrder.orderId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 pt-12 px-10 pb-10 flex items-center justify-center">
        <div className="text-zinc-500 font-mono text-sm">INITIALIZING MARKETPLACE...</div>
      </div>
    );
  }

  const filtered = selectedType
    ? listings.filter(l => l.plasticType.startsWith(selectedType.split(' ')[0]))
    : [];

  return (
    <div className="min-h-screen bg-zinc-50 pt-12 px-10 pb-10">
      <h1 className="text-3xl font-bold mb-8 text-zinc-900">Procurement Hub</h1>

      {!selectedType ? (
        <div className="grid grid-cols-2 gap-6 max-w-xl">
          {TYPES.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className="p-10 border-2 border-emerald-500 rounded-2xl bg-white hover:bg-emerald-50 text-left transition-colors"
            >
              <h2 className="text-2xl font-bold text-zinc-900">{type}</h2>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <button onClick={() => setSelectedType(null)} className="underline text-zinc-600 font-bold text-sm">
            ← Back to Materials
          </button>

          {filtered.length === 0 && (
            <p className="text-zinc-500 font-mono text-sm">No listings found for this type.</p>
          )}

          {filtered.map(item => (
            <div key={item._id || item.id} className="p-6 border border-zinc-200 rounded-2xl flex gap-6 bg-white shadow-sm hover:shadow-md transition-shadow">
              <img src={item.images?.[0] || item.image} alt={item.title} className="w-32 h-32 object-cover rounded-xl border" />
              <div className="flex-1">
                <h3 className="font-bold text-xl text-zinc-900">
                  {item.title}
                </h3>
                <p className="text-sm text-emerald-600 font-medium">Owner: {item.contributorId?.name || item.seller} • {item.location}</p>
                <p className="text-sm text-zinc-600 italic mt-2">"{item.description}"</p>
                <p className="text-lg font-black mt-2 text-zinc-900">${(item.price || item.pricePerKg || 0).toFixed(2)}/kg</p>
                <p className="text-xs text-zinc-500 mt-1">Weight: {item.weightKg || item.quantity} kg</p>
                <p className="text-xs text-zinc-500">Condition: {item.condition}</p>
                <p className="text-xs text-zinc-500">
                  Status:{' '}
                  <span className={`font-bold uppercase ${
                    item.status === 'Available'
                      ? 'text-emerald-600'
                      : item.status === 'Reserved'
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }`}>
                    {item.status}
                  </span>
                </p>
              </div>
              <div className="flex flex-col gap-2 justify-center">
                {item.status === 'Available' ? (
                  <>
                    <button
                      onClick={() => handleMessage(item)}
                      className="px-6 py-2 border border-zinc-300 rounded-lg font-bold text-sm hover:bg-zinc-50 transition-colors"
                    >
                      MESSAGE
                    </button>
                    <button
                      onClick={() => handlePurchase(item)}
                      className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors"
                    >
                      PURCHASE
                    </button>
                  </>
                ) : (
                  <span className={`px-4 py-2 rounded-lg text-center font-bold font-mono text-xs border uppercase ${
                    item.status === 'Reserved'
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'bg-rose-50 border-rose-200 text-rose-650'
                  }`}>
                    {item.status === 'Reserved' ? 'Reserved 🔒' : 'Sold Out 🚫'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
