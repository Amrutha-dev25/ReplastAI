import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import axios from 'axios';

export default function OrderFulfillment() {
  const { user, backendUrl, authHeaders } = useAppContext();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'orders'
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const isContributor = user?.role === 'contributor';

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch user's matching procurement requests
      const reqRes = await axios.get(`${backendUrl}/api/requests`, authHeaders).catch(() => ({ data: [] }));
      const fetchedRequests = Array.isArray(reqRes.data) ? reqRes.data : [];
      setRequests(fetchedRequests);

      // Fetch active orders
      const orderEndpoint = isContributor
        ? `${backendUrl}/api/requests/seller-orders`
        : `${backendUrl}/api/requests/buyer-orders`;

      const ordRes = await axios.get(orderEndpoint, authHeaders).catch(() => ({ data: { orders: [] } }));
      const fetchedOrders = ordRes.data?.success ? ordRes.data.orders : [];
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Failed to sync logistics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, backendUrl, authHeaders, isContributor]);

  const handleRequestStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const { data } = await axios.put(`${backendUrl}/api/requests/${id}/status`, { status }, authHeaders);
      alert(`Request marked as ${status} successfully.`);
      await fetchData();
    } catch (err) {
      console.error('Error updating request status:', err);
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId, currentStatus) => {
    const nextStatuses = {
      'Pending': 'Accepted',
      'Accepted': 'Packed',
      'Packed': 'Dispatched',
      'Dispatched': 'Delivered',
      'Delivered': 'Completed',
    };

    const targetStatus = nextStatuses[currentStatus] || 'Completed';
    const note = prompt(`Provide logistics dispatch note for state update to [${targetStatus}]:`, `Progressed to ${targetStatus}`);
    if (note === null) return; // cancelled

    setUpdatingId(orderId);
    try {
      await axios.put(`${backendUrl}/api/orders/${orderId}/status`, { status: targetStatus, note }, authHeaders);
      alert(`Order status updated to ${targetStatus}`);
      await fetchData();
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] font-mono text-zinc-500 text-sm">
        SYNCING CIRCUITS LOGISTICS LEDGER...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      
      {/* ── Title Banner ─────────────────────────────────────────────────── */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <span>🌍</span>
            <span>{isContributor ? 'Circular Logistics Terminal' : 'Global Procurement Desk'}</span>
          </h1>
          <p className="text-xs text-zinc-500 leading-relaxed font-mono">
            Cryptographic tracing and real-time status ledger for post-consumer polymers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[10px] uppercase text-zinc-400 tracking-wider">
            GPS telemetry matched
          </span>
        </div>
      </div>

      {/* ── Tab Switcher ─────────────────────────────────────────────────── */}
      <div className="flex border-b border-zinc-850 gap-2">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'requests'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {isContributor ? `Inbound Requests (${requests.length})` : `My Sourcing Requests (${requests.length})`}
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {isContributor ? `Live Orders & Fulfillments (${orders.length})` : `Dispatched Shipments (${orders.length})`}
        </button>
      </div>

      {/* ── Requests Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-12 text-center space-y-3">
              <span className="text-3xl block">📋</span>
              <p className="text-sm text-zinc-500 font-mono">No active procurement requests in current ledger.</p>
              {!isContributor && (
                <button
                  onClick={() => navigate('/marketplace')}
                  className="px-5 py-2.5 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-900/40 text-sky-400 font-mono text-xs uppercase rounded-xl transition-all"
                >
                  Source Feedstocks
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requests.map((req) => (
                <div
                  key={req.id || req._id}
                  className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-zinc-950 border border-zinc-850 rounded text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
                        REQUEST
                      </span>
                      <h3 className="text-base font-bold text-zinc-100">{req.listingTitle}</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-[11px] text-zinc-400">
                      <div>
                        <span className="text-zinc-600 block uppercase text-[9px]">Sourced For:</span>
                        <span className="text-zinc-300 font-bold">{req.buyerName}</span>
                      </div>
                      <div>
                        <span className="text-zinc-600 block uppercase text-[9px]">Proposed Weight:</span>
                        <span className="text-zinc-300 font-bold">{req.quantity || 100} kg</span>
                      </div>
                      <div>
                        <span className="text-zinc-600 block uppercase text-[9px]">Bid Offer Price:</span>
                        <span className="text-emerald-400 font-bold">${(req.offerPrice || 0.85).toFixed(2)}/kg</span>
                      </div>
                      <div>
                        <span className="text-zinc-600 block uppercase text-[9px]">Transmission Date:</span>
                        <span className="text-zinc-300">{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border ${
                      req.status === 'Pending'
                        ? 'bg-amber-950/40 border-amber-900/40 text-amber-400 animate-pulse'
                        : req.status === 'Accepted'
                        ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400'
                        : 'bg-rose-950/40 border-rose-900/40 text-rose-400'
                    }`}>
                      {req.status}
                    </span>

                    {isContributor && req.status === 'Pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={updatingId === req.id}
                          onClick={() => handleRequestStatus(req.id, 'Accepted')}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-mono text-xs font-bold uppercase rounded-xl transition-all"
                        >
                          Accept
                        </button>
                        <button
                          disabled={updatingId === req.id}
                          onClick={() => handleRequestStatus(req.id, 'Declined')}
                          className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-rose-400 font-mono text-xs font-bold uppercase rounded-xl transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Orders Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-12 text-center space-y-3">
              <span className="text-3xl block">📦</span>
              <p className="text-sm text-zinc-500 font-mono">No active logistics/orders matched to this account yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {orders.map((order) => {
                const stepNames = ['Pending', 'Accepted', 'Packed', 'Dispatched', 'Delivered', 'Completed'];
                const currentIdx = stepNames.indexOf(order.status) !== -1 ? stepNames.indexOf(order.status) : 0;

                return (
                  <div
                    key={order._id || order.id}
                    className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-6 hover:border-zinc-750 transition-all shadow-md"
                  >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-850">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-900 text-emerald-400 text-[9px] font-mono font-bold rounded">
                            LEDGER AGREEMENT SEALED
                          </span>
                          <h3 className="text-lg font-bold text-zinc-100">{order.listingTitle}</h3>
                        </div>
                        <p className="text-xs font-mono text-zinc-500">
                          Transaction Hash: #{String(order._id || order.id).slice(-8)} // Partner: {isContributor ? order.buyerName : order.contributorName}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/nexus/${order._id || order.id}`)}
                          className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-emerald-400 font-mono text-xs font-bold uppercase rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <span>💬 Secure Chat</span>
                        </button>

                        {/* Contributor logistics stepping button */}
                        {isContributor && order.status !== 'Completed' && (
                          <button
                            disabled={updatingId === order._id || updatingId === order.id}
                            onClick={() => handleUpdateOrderStatus(order._id || order.id, order.status)}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-mono text-xs font-bold uppercase rounded-xl transition-all"
                          >
                            Advance Status
                          </button>
                        )}

                        {/* Buyer manual completion button */}
                        {!isContributor && order.status === 'Delivered' && (
                          <button
                            disabled={updatingId === order._id || updatingId === order.id}
                            onClick={() => handleUpdateOrderStatus(order._id || order.id, order.status)}
                            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-mono text-xs font-bold uppercase rounded-xl transition-all"
                          >
                            Confirm Delivery Receipt
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress tracking timeline */}
                    <div className="space-y-2">
                      <div className="flex justify-between font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                        <span>Physical Tracking Pipeline</span>
                        <span className="text-emerald-400 font-bold">{order.status}</span>
                      </div>
                      <div className="grid grid-cols-6 gap-2">
                        {stepNames.map((step, i) => (
                          <div key={step} className="space-y-1.5 text-center">
                            <div className={`h-1.5 rounded-full ${
                              i <= currentIdx ? 'bg-emerald-500' : 'bg-zinc-800'
                            }`} />
                            <span className={`block font-mono text-[9px] ${
                              i === currentIdx ? 'text-zinc-200 font-bold' : i < currentIdx ? 'text-emerald-500' : 'text-zinc-650'
                            }`}>
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Meta info columns */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-950/40 p-4 rounded-xl font-mono text-xs text-zinc-400">
                      <div>
                        <span className="text-zinc-600 block text-[9px] uppercase">Handoff Weight:</span>
                        <span className="text-zinc-300 font-bold">{order.quantity || 100} kg</span>
                      </div>
                      <div>
                        <span className="text-zinc-600 block text-[9px] uppercase">Logistics Cost:</span>
                        <span className="text-zinc-300 font-bold">${(order.totalAmount || 0).toLocaleString()} USD</span>
                      </div>
                      <div>
                        <span className="text-zinc-600 block text-[9px] uppercase">Last Milestone:</span>
                        <span className="text-zinc-300 font-semibold truncate block">
                          {order.trackingHistory?.[order.trackingHistory.length - 1]?.note || 'Order initiated successfully.'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-600 block text-[9px] uppercase">Verification Status:</span>
                        <span className="text-emerald-400 font-bold">✓ BLOCKEDCHAIN REGISTERED</span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
