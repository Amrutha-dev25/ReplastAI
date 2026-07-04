import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext.jsx';

// ── Subcomponents ─────────────────────────────────────────────────────────────

function StatCard({ icon, title, desc, badge, onClick, accentColor = 'emerald' }) {
  return (
    <div
      onClick={onClick}
      className={`${onClick ? 'cursor-pointer' : ''} group relative bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-4 transition-all duration-300 hover:-translate-y-1 hover:border-${accentColor}-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.12)]`}
    >
      <div className={`w-10 h-10 rounded-xl bg-${accentColor}-950/30 border border-${accentColor}-900/40 flex items-center justify-center text-sm group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className={`text-base font-bold text-zinc-100 group-hover:text-${accentColor}-400 transition-colors`}>{title}</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
      </div>
      {badge != null && (
        <div className={`text-2xl font-mono font-bold text-${accentColor}-400`}>{badge}</div>
      )}
      {onClick && (
        <div className={`flex items-center gap-1.5 font-mono text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors`}>
          <span>Open</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </div>
      )}
    </div>
  );
}

// ── Graph data (static visual — swap with real data later) ───────────────────
const GRAPH_MONTHS = [
  { month: 'Jan', volume: 200 },
  { month: 'Feb', volume: 450 },
  { month: 'Mar', volume: 300 },
  { month: 'Apr', volume: 750 },
  { month: 'May', volume: 600 },
  { month: 'Jun', volume: 1100 },
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout, backendUrl, authHeaders } = useAppContext();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    myListings: [],
    pendingRequests: [],
    acceptedRequests: [],
    orders: [],
    completedOrders: [],
    revenue: 0,
    plasticSold: 0,
    monthlySales: [],
    recentNotifications: [],
    recentMessages: [],
  });
  const [buyerStats, setBuyerStats] = useState({
    allRequests: [],
    pendingRequests: [],
    acceptedRequests: [],
    acceptedOrders: [],
    currentOrders: [],
    completedOrders: [],
    plasticPurchased: 0,
    co2Saved: 0,
    requestedProducts: [],
    recentNotifications: [],
    recentMessages: [],
  });
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState(null);

  const fetchStats = async () => {
    if (!user) return;
    try {
      if (user.role === 'contributor') {
        const res = await axios.get(`${backendUrl}/api/seller/dashboard-stats`, authHeaders);
        if (res.data?.success) {
          setStats(res.data);
        }
      } else {
        const res = await axios.get(`${backendUrl}/api/buyer/dashboard-stats`, authHeaders);
        if (res.data?.success) {
          setBuyerStats(res.data);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user, backendUrl, authHeaders]);

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing from the registry?')) return;
    try {
      const res = await axios.delete(`${backendUrl}/api/listings/${id}`, authHeaders);
      if (res.data) {
        await fetchStats();
      }
    } catch (err) {
      console.error('Delete listing error:', err);
      alert('Failed to delete listing.');
    }
  };

  const handleUpdateListing = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${backendUrl}/api/listings/${editingListing._id}`, {
        title: editingListing.title,
        quantity: Number(editingListing.weightKg),
        pricePerKg: Number(editingListing.price),
        location: editingListing.location,
        description: editingListing.description,
        plasticType: editingListing.plasticType,
        condition: editingListing.condition,
      }, authHeaders);
      if (res.data) {
        await fetchStats();
        setEditingListing(null);
      }
    } catch (err) {
      console.error('Update listing error:', err);
      alert('Failed to update listing.');
    }
  };

  const isContributor = user?.role === 'contributor';
  const accent = isContributor ? 'emerald' : 'sky';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] font-mono text-zinc-500 text-sm">
        INITIALIZING DASHBOARD...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">

      {/* ── Profile card ─────────────────────────────────────────────────── */}
      <div className={`bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-${accent}-400 text-lg`}>
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full bg-${accent}-400 animate-pulse`} />
              <span className={`font-mono text-[10px] tracking-widest text-${accent}-400 font-bold uppercase`}>
                {isContributor ? 'SUPPLY NODE ACTIVE' : 'PROCUREMENT PORTAL ONLINE'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-zinc-100">{user?.name ?? 'Authorized User'}</h2>
            <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              Network Class: {user?.role}
            </p>
          </div>
        </div>

        <button
          onClick={() => { logout(); navigate('/'); }}
          className="px-5 py-2.5 bg-zinc-900/60 hover:bg-rose-950/20 border border-zinc-800 hover:border-rose-900/40 text-zinc-400 hover:text-rose-400 font-mono text-xs font-bold uppercase rounded-xl tracking-wider active:scale-95 transition-all"
        >
          Exit Control Hub
        </button>
      </div>

      {/* ── Contributor view ─────────────────────────────────────────────── */}
      {isContributor ? (
        <>
          {/* ── Summary Bento Grid ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
            {/* Revenue & Plastic Sold */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">// Financials</span>
                <span className="text-xl">💰</span>
              </div>
              <div>
                <span className="text-zinc-400 text-xs font-mono block">REVENUE</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">${stats.revenue.toFixed(2)}</span>
              </div>
              <div className="border-t border-zinc-850 pt-2 flex justify-between text-[11px] font-mono text-zinc-500">
                <span>PLASTIC SOLD:</span>
                <span className="text-zinc-300 font-bold">{stats.plasticSold.toLocaleString()} kg</span>
              </div>
            </div>

            {/* My Listings */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">// Inventory</span>
                <span className="text-xl">📋</span>
              </div>
              <div>
                <span className="text-zinc-400 text-xs font-mono block">MY LISTINGS</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">{stats.myListings.length}</span>
              </div>
              <div className="border-t border-zinc-850 pt-2 flex justify-between text-[11px] font-mono text-zinc-500">
                <span>REGISTRY CLOUD:</span>
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </div>
            </div>

            {/* Inbound Requests */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">// Inbound</span>
                <span className="text-xl">📥</span>
              </div>
              <div>
                <span className="text-zinc-400 text-xs font-mono block">PENDING REQUESTS</span>
                <span className="text-2xl font-bold font-mono text-amber-400">{stats.pendingRequests.length}</span>
              </div>
              <div className="border-t border-zinc-850 pt-2 flex justify-between text-[11px] font-mono text-zinc-500">
                <span>ACCEPTED:</span>
                <span className="text-zinc-300 font-bold">{stats.acceptedRequests.length} Approved</span>
              </div>
            </div>

            {/* Orders */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">// Logistics</span>
                <span className="text-xl">📦</span>
              </div>
              <div>
                <span className="text-zinc-400 text-xs font-mono block">ORDERS</span>
                <span className="text-2xl font-bold font-mono text-sky-400">{stats.orders.length}</span>
              </div>
              <div className="border-t border-zinc-850 pt-2 flex justify-between text-[11px] font-mono text-zinc-500">
                <span>COMPLETED ORDERS:</span>
                <span className="text-zinc-300 font-bold">{stats.completedOrders.length} Sealed</span>
              </div>
            </div>
          </div>

          {/* ── Main Bento Panel Layout ──────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left/Middle Column (2/3) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* My Listings Inventory Table */}
              <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100">My Material Stream Registry</h3>
                    <p className="text-xs text-zinc-500">Active feedstocks published in the circular economy marketplace.</p>
                  </div>
                  <button
                    onClick={() => navigate('/upload-material')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono text-xs font-bold uppercase rounded-xl transition-all"
                  >
                    + Launch Stream
                  </button>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {stats.myListings.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-950/40 border border-zinc-850 rounded-xl">
                      <p className="text-xs font-mono text-zinc-500">No active materials detected on your registry node.</p>
                    </div>
                  ) : (
                    stats.myListings.map(item => (
                      <div key={item._id || item.id} className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono">
                        <div className="truncate min-w-0 flex-1 space-y-1">
                          <div className="text-zinc-200 truncate font-bold text-sm">{item.title}</div>
                          <div className="text-zinc-400 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                            <span>Weight: <strong className="text-emerald-400">{item.weightKg || item.quantity} kg</strong></span>
                            <span className="text-zinc-600">|</span>
                            <span>Melt: <strong>{item.plasticType}</strong></span>
                            <span className="text-zinc-600">|</span>
                            <span>Rate: <strong>${(item.price || item.pricePerKg || 0).toFixed(2)}/kg</strong></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                          <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase border ${
                            item.status === 'Available'
                              ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                          }`}>
                            {item.status === 'Available' ? 'In Stock' : item.status}
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setEditingListing({
                                _id: item._id || item.id,
                                title: item.title,
                                weightKg: item.weightKg || item.quantity,
                                price: item.price || item.pricePerKg || 0,
                                location: item.location,
                                description: item.description || '',
                                plasticType: item.plasticType,
                                condition: item.condition || 'Sorted Cleaned'
                              })}
                              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-emerald-400 rounded-lg transition-colors"
                              title="Edit Registry Entry"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteListing(item._id || item.id)}
                              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-rose-400 rounded-lg transition-colors"
                              title="Delete Registry Entry"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Monthly Sales Trend Visual */}
              <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-lg">
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Monthly Sales Volume & Revenue</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Aggregated post-consumer feedstock transactions handled by this node.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                    {stats.monthlySales.map(item => {
                      const maxVal = Math.max(...stats.monthlySales.map(m => m.volume || 100), 1000);
                      const heightPercent = Math.min(100, Math.max(10, ((item.volume || 0) / maxVal) * 100));
                      
                      return (
                        <div key={item.month} className="bg-zinc-950/60 border border-zinc-850 rounded-xl p-3 flex flex-col justify-between items-center text-center space-y-3 font-mono">
                          <span className="text-zinc-400 font-bold text-xs">{item.month}</span>
                          <div className="w-full bg-zinc-900 h-16 rounded-lg flex items-end overflow-hidden px-1">
                            <div 
                              className="w-full bg-emerald-500 rounded-t-md transition-all duration-500" 
                              style={{ height: `${heightPercent}%` }}
                            />
                          </div>
                          <div className="space-y-0.5">
                            <span className="block text-[10px] text-zinc-300 font-bold">{item.volume.toLocaleString()} kg</span>
                            <span className="block text-[9px] text-emerald-400 font-semibold">${item.revenue.toFixed(0)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Live Orders & Active Fulfillments table */}
              <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100">Fulfillment & Order Ledger</h3>
                    <p className="text-xs text-zinc-500">Live shipping tracking and contract agreements for active deals.</p>
                  </div>
                  <button
                    onClick={() => navigate('/order-fulfillment')}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-mono text-xs font-bold uppercase rounded-xl transition-all"
                  >
                    Logistics Desk
                  </button>
                </div>

                <div className="space-y-3">
                  {stats.orders.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-950/40 border border-zinc-850 rounded-xl">
                      <p className="text-xs font-mono text-zinc-500">No active fulfillments or orders matched to this account yet.</p>
                    </div>
                  ) : (
                    <div className="border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-850 font-mono text-xs">
                      {stats.orders.map((order, i) => (
                        <div key={order._id || order.id || i} className="p-4 bg-zinc-950/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-zinc-900/30 transition-all">
                          <div>
                            <div className="text-zinc-200 font-bold text-sm">{order.listingTitle}</div>
                            <div className="text-[10px] text-zinc-500 mt-1 flex flex-wrap gap-x-2">
                              <span>ID: #{String(order._id || order.id).slice(-8)}</span>
                              <span>|</span>
                              <span>Partner: <strong>{order.buyerName}</strong></span>
                              <span>|</span>
                              <span>Amount: <strong>${(order.totalAmount || 0).toLocaleString()} USD</strong></span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 self-end sm:self-auto">
                            <span className="text-zinc-300 font-bold">{order.quantity || 100} kg</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                              order.status === 'Completed'
                                ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400'
                                : order.status === 'Dispatched'
                                ? 'bg-sky-950/40 border-sky-900/50 text-sky-400 animate-pulse'
                                : 'bg-amber-950/40 border-amber-900/50 text-amber-400'
                            }`}>
                              {order.status}
                            </span>
                            <button
                              onClick={() => navigate(`/nexus/${order._id || order.id}`)}
                              className="p-1 px-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-emerald-400 rounded-lg transition-all"
                            >
                              Chat 💬
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column (1/3) */}
            <div className="space-y-8">
              
              {/* Recent Notifications */}
              <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
                  <h3 className="text-sm font-bold text-zinc-200">Recent Notifications</h3>
                  <span className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-900 text-emerald-400 text-[9px] font-mono rounded">
                    REALTIME
                  </span>
                </div>

                <div className="space-y-3">
                  {stats.recentNotifications.length === 0 ? (
                    <p className="text-xs font-mono text-zinc-600 text-center py-4">No recent notifications detected.</p>
                  ) : (
                    stats.recentNotifications.map(n => (
                      <div key={n.id || n._id} className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] font-bold text-emerald-400 uppercase tracking-widest">{n.type}</span>
                          <span className="text-[9px] font-mono text-zinc-500">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <h4 className="font-bold text-zinc-200">{n.title}</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Messages (Secure Chat Logs) */}
              <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
                  <h3 className="text-sm font-bold text-zinc-200">Recent Chat Messages</h3>
                  <span className="px-2 py-0.5 bg-sky-950/40 border border-sky-900 text-sky-400 text-[9px] font-mono rounded">
                    NEXUS
                  </span>
                </div>

                <div className="space-y-3">
                  {stats.recentMessages.length === 0 ? (
                    <p className="text-xs font-mono text-zinc-600 text-center py-4">No recent messages in the secure log.</p>
                  ) : (
                    stats.recentMessages.map(m => (
                      <div key={m.id || m._id} className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl space-y-1 text-xs font-mono">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-sky-400">{m.senderName}</span>
                          <span className="text-[9px] text-zinc-500">{new Date(m.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] text-zinc-300 italic">"{m.text}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        </>
      ) : (
        /* ── Innovator view ────────────────────────────────────────────── */
        <>
          {/* ── Summary Bento Grid ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
            {/* Plastic Purchased & CO₂ Saved */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">// Environmental Impact</span>
                <span className="text-xl">🌿</span>
              </div>
              <div>
                <span className="text-zinc-400 text-xs font-mono block">PLASTIC PURCHASED</span>
                <span className="text-2xl font-bold font-mono text-sky-400">{(buyerStats.plasticPurchased || 0).toLocaleString()} kg</span>
              </div>
              <div className="border-t border-zinc-850 pt-2 flex justify-between text-[11px] font-mono text-zinc-500">
                <span>CO₂ EMISSIONS SAVED:</span>
                <span className="text-emerald-400 font-bold">{(buyerStats.co2Saved || 0).toLocaleString()} kg</span>
              </div>
            </div>

            {/* Requested Products */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">// Procurement Sourcing</span>
                <span className="text-xl">🛒</span>
              </div>
              <div>
                <span className="text-zinc-400 text-xs font-mono block">REQUESTED PRODUCTS</span>
                <span className="text-2xl font-bold font-mono text-sky-400">{(buyerStats.requestedProducts || []).length}</span>
              </div>
              <div className="border-t border-zinc-850 pt-2 flex justify-between text-[11px] font-mono text-zinc-500">
                <span>TOTAL OFFERS SUBMITTED:</span>
                <span className="text-zinc-300 font-bold">{(buyerStats.allRequests || []).length}</span>
              </div>
            </div>

            {/* Pending Requests */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">// Negotiations</span>
                <span className="text-xl">⏳</span>
              </div>
              <div>
                <span className="text-zinc-400 text-xs font-mono block">PENDING REQUESTS</span>
                <span className="text-2xl font-bold font-mono text-amber-400">{(buyerStats.pendingRequests || []).length}</span>
              </div>
              <div className="border-t border-zinc-850 pt-2 flex justify-between text-[11px] font-mono text-zinc-500">
                <span>AWAITING APPROVAL:</span>
                <span className="text-zinc-300 font-bold">{(buyerStats.pendingRequests || []).length} pending</span>
              </div>
            </div>

            {/* Completed Orders */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">// Completed Deals</span>
                <span className="text-xl">✅</span>
              </div>
              <div>
                <span className="text-zinc-400 text-xs font-mono block">COMPLETED ORDERS</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">{(buyerStats.completedOrders || []).length}</span>
              </div>
              <div className="border-t border-zinc-850 pt-2 flex justify-between text-[11px] font-mono text-zinc-500">
                <span>ACTIVE TRANSACTIONS:</span>
                <span className="text-sky-400 font-bold">{(buyerStats.currentOrders || []).length} In-Flight</span>
              </div>
            </div>
          </div>

          {/* ── Main Bento Panel Layout ──────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-8 animate-fade-in">
              
              {/* Requested Products and Procurement Requests Table */}
              <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100">Requested Products & Bids</h3>
                    <p className="text-xs text-zinc-500">Material feedstock listings currently targeted for circular acquisition.</p>
                  </div>
                  <button
                    onClick={() => navigate('/marketplace')}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-mono text-xs font-bold uppercase rounded-xl transition-all"
                  >
                    Explore Marketplace
                  </button>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {(!buyerStats.requestedProducts || buyerStats.requestedProducts.length === 0) ? (
                    <div className="p-8 text-center bg-zinc-950/40 border border-zinc-850 rounded-xl">
                      <p className="text-xs font-mono text-zinc-500">No requested feedstocks or active bids found.</p>
                    </div>
                  ) : (
                    buyerStats.requestedProducts.map(item => (
                      <div key={item.id} className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono">
                        <div className="truncate min-w-0 flex-1 space-y-1">
                          <div className="text-zinc-200 truncate font-bold text-sm">{item.title}</div>
                          <div className="text-zinc-400 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                            <span>Sourcing: <strong className="text-sky-400">{item.quantity} kg</strong></span>
                            <span className="text-zinc-600">|</span>
                            <span>Offer price: <strong>${item.offerPrice.toFixed(2)}/kg</strong></span>
                            <span className="text-zinc-600">|</span>
                            <span>Sourced: <strong>{new Date(item.createdAt).toLocaleDateString()}</strong></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                          <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase border ${
                            item.status === 'Pending'
                              ? 'bg-amber-950/40 border-amber-900/50 text-amber-400'
                              : item.status === 'Accepted'
                              ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Order Ledger split into sections (Accepted, Current, Completed) */}
              <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-lg">
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Fulfillment & Order Desk</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Track your contracts, accepted supply orders, active freight, and finished shipments.</p>
                </div>

                {/* Section A: Accepted Orders (Contracts initialization stage) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold font-mono text-sky-400 uppercase tracking-wider flex items-center gap-2">
                    <span>🟢</span> Accepted Orders (Awaiting Dispatch)
                  </h4>
                  {(!buyerStats.acceptedOrders || buyerStats.acceptedOrders.length === 0) ? (
                    <p className="text-xs font-mono text-zinc-600 italic pl-4">No pending dispatches.</p>
                  ) : (
                    <div className="border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-850 font-mono text-xs">
                      {buyerStats.acceptedOrders.map((order, i) => (
                        <div key={order.id || i} className="p-3 bg-zinc-950/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <div className="text-zinc-200 font-bold">{order.listingTitle}</div>
                            <div className="text-[10px] text-zinc-500 mt-1">ID: #{String(order.id).slice(-8)} | Supplier: {order.seller}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-300 font-bold">{order.quantity} kg</span>
                            <button
                              onClick={() => navigate(`/nexus/${order.id}`)}
                              className="p-1 px-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-sky-400 rounded-md transition-all text-[11px]"
                            >
                              Nexus Chat 💬
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section B: Current Orders (In Transit / Packing) */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <span>⚡</span> Current Orders (Active Shipments)
                  </h4>
                  {(!buyerStats.currentOrders || buyerStats.currentOrders.length === 0) ? (
                    <p className="text-xs font-mono text-zinc-600 italic pl-4">No active shipments in progress.</p>
                  ) : (
                    <div className="border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-850 font-mono text-xs">
                      {buyerStats.currentOrders.map((order, i) => (
                        <div key={order.id || i} className="p-3 bg-zinc-950/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <div className="text-zinc-200 font-semibold">{order.listingTitle}</div>
                            <div className="text-[10px] text-zinc-500 mt-1">ID: #{String(order.id).slice(-8)} | Status: <strong className="text-amber-400">{order.status}</strong></div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-300 font-bold">{order.quantity} kg</span>
                            <button
                              onClick={() => navigate(`/nexus/${order.id}`)}
                              className="p-1 px-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-sky-400 rounded-md transition-all text-[11px]"
                            >
                              Track & Chat 💬
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section C: Completed Orders */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <span>🏆</span> Completed Orders (Sealed Transactions)
                  </h4>
                  {(!buyerStats.completedOrders || buyerStats.completedOrders.length === 0) ? (
                    <p className="text-xs font-mono text-zinc-600 italic pl-4">No completed orders on this node yet.</p>
                  ) : (
                    <div className="border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-850 font-mono text-xs">
                      {buyerStats.completedOrders.map((order, i) => (
                        <div key={order.id || i} className="p-3 bg-zinc-950/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <div className="text-zinc-200 font-semibold">{order.listingTitle}</div>
                            <div className="text-[10px] text-zinc-500 mt-1">ID: #{String(order.id).slice(-8)} | Cost: ${(order.totalAmount || 0).toLocaleString()} USD</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-400 font-bold">{order.quantity} kg</span>
                            <span className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 rounded text-[9px] font-bold uppercase">
                              Delivered
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Right Column (1/3) */}
            <div className="space-y-8 animate-fade-in">
              
              {/* Recent Notifications */}
              <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
                  <h3 className="text-sm font-bold text-zinc-200">Recent Notifications</h3>
                  <span className="px-2 py-0.5 bg-sky-950/40 border border-sky-900 text-sky-400 text-[9px] font-mono rounded">
                    REALTIME
                  </span>
                </div>

                <div className="space-y-3">
                  {(!buyerStats.recentNotifications || buyerStats.recentNotifications.length === 0) ? (
                    <p className="text-xs font-mono text-zinc-600 text-center py-4">No recent notifications detected.</p>
                  ) : (
                    buyerStats.recentNotifications.map(n => (
                      <div key={n.id || n._id} className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] font-bold text-sky-400 uppercase tracking-widest">{n.type}</span>
                          <span className="text-[9px] font-mono text-zinc-500">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <h4 className="font-bold text-zinc-200">{n.title}</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Messages (Secure Chat Logs) */}
              <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-lg">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
                  <h3 className="text-sm font-bold text-zinc-200">Recent Chat Messages</h3>
                  <span className="px-2 py-0.5 bg-sky-950/40 border border-sky-900 text-sky-400 text-[9px] font-mono rounded">
                    NEXUS
                  </span>
                </div>

                <div className="space-y-3">
                  {(!buyerStats.recentMessages || buyerStats.recentMessages.length === 0) ? (
                    <p className="text-xs font-mono text-zinc-600 text-center py-4">No recent messages in the secure log.</p>
                  ) : (
                    buyerStats.recentMessages.map(m => (
                      <div key={m.id || m._id} className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-xl space-y-1 text-xs font-mono">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-sky-400">{m.senderName}</span>
                          <span className="text-[9px] text-zinc-500">{new Date(m.timestamp).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[11px] text-zinc-300 italic">"{m.text}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        </>
      )}

      {/* ── Edit Listing Modal Overlay ─────────────────────────────────────── */}
      {editingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setEditingListing(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 font-bold text-lg font-mono"
            >
              ×
            </button>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-zinc-100">Edit Supply Registry</h2>
              <p className="text-xs text-zinc-500">Update parameters for this material stream instantly.</p>
            </div>

            <form onSubmit={handleUpdateListing} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Stream Title</label>
                <input
                  type="text" required
                  value={editingListing.title}
                  onChange={e => setEditingListing(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Melt Designation</label>
                  <select
                    value={editingListing.plasticType}
                    onChange={e => setEditingListing(prev => ({ ...prev, plasticType: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PET (Type 1)">PET (Type 1)</option>
                    <option value="HDPE (Type 2)">HDPE (Type 2)</option>
                    <option value="PVC (Type 3)">PVC (Type 3)</option>
                    <option value="LDPE (Type 4)">LDPE (Type 4)</option>
                    <option value="PP (Type 5)">PP (Type 5)</option>
                    <option value="PS (Type 6)">PS (Type 6)</option>
                    <option value="Other (Type 7)">Other (Type 7)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Structural Grading</label>
                  <input
                    type="text" required
                    value={editingListing.condition}
                    onChange={e => setEditingListing(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Weight (kg)</label>
                  <input
                    type="number" required
                    value={editingListing.weightKg}
                    onChange={e => setEditingListing(prev => ({ ...prev, weightKg: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Price ($/kg)</label>
                  <input
                    type="number" step="0.01" required
                    value={editingListing.price}
                    onChange={e => setEditingListing(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Origin / Warehouse Location</label>
                <input
                  type="text" required
                  value={editingListing.location}
                  onChange={e => setEditingListing(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingListing.description}
                  onChange={e => setEditingListing(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-300 font-mono text-xs font-bold uppercase rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono text-xs font-bold uppercase rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  Apply Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
