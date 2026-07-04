import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import axios from 'axios';

export default function ProtocolNexus() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, orders, setOrders, backendUrl, authHeaders } = useAppContext();

  const [order, setOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null);

  useEffect(() => {
    // Find local discussion or order context
    const currentOrder = orders.find(o => String(o.orderId) === String(orderId));
    if (currentOrder) {
      setOrder(currentOrder);
    } else {
      // Fallback
      axios.get(`${backendUrl}/api/orders/${orderId}`, authHeaders)
        .then(res => setOrder(res.data))
        .catch(() => null);
    }
    setLoading(false);
  }, [orderId, orders, backendUrl, authHeaders]);

  useEffect(() => {
    if (!order) return;
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/orders/${orderId}/messages`, authHeaders);
        if (data.success) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [orderId, order, backendUrl, authHeaders]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !order) return;
    const text = input.trim();
    setInput('');

    // Append user message immediately
    const tempMsg = {
      id: Date.now().toString(),
      senderId: user?.id || 'me',
      senderName: user?.name || 'Me',
      text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const { data } = await axios.post(`${backendUrl}/api/orders/${orderId}/messages`, { text }, authHeaders);
      if (data.success) {
        // Update messages with backend response if any
        if (data.nexusAlert) {
          // If contract sealed, update order status
          setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: 'Contract Sealed', nexusAlert: data.nexusAlert } : o));
          setOrder(prev => prev ? { ...prev, status: 'Contract Sealed', nexusAlert: data.nexusAlert } : null);
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleConfirmOrder = () => {
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: 'Completed' } : o));
    setOrder(prev => prev ? { ...prev, status: 'Completed' } : null);
    alert('Contract confirmed and archived on the blockchain ledger.');
  };

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center h-[60vh] font-mono text-zinc-500 text-sm">
        CONNECTING SECURE CHANNEL PROTOCOL...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-160px)]">

      {/* Left Spec/Status Panel */}
      <div className="lg:col-span-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">// ACTIVE LOGISTICS PORT</div>
            <h2 className="text-xl font-bold text-zinc-100 mt-1">{order.listingTitle || order.title}</h2>
            <p className="text-xs text-zinc-500 mt-1">Sourced from: {order.seller || order.contributorName || 'Eco Supplier'}</p>
          </div>

          <div className="border-t border-zinc-800 pt-4 space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-600">Material Weight:</span>
              <span className="text-zinc-300">{order.weightKg || order.quantity || 100} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Base Bid Offer:</span>
              <span className="text-zinc-300">${(order.price || order.pricePerKg || 0).toFixed(2)}/kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Secure Status:</span>
              <span className="text-emerald-400 font-bold">{order.status}</span>
            </div>
          </div>

          {order.nexusAlert && (
            <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {order.nexusAlert.type}
              </div>
              <p className="text-[10px] font-mono text-zinc-400 leading-relaxed">{order.nexusAlert.details}</p>
              <div className="text-[9px] font-mono text-zinc-500 bg-zinc-950/40 p-2 rounded overflow-x-auto">
                Hash: {order.nexusAlert.hash}
              </div>
            </div>
          )}
        </div>

        {order.status === 'Contract Sealed' && (
          <button
            onClick={handleConfirmOrder}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono text-xs font-bold uppercase rounded-xl transition-all"
          >
            CONFIRM STRUCTURAL AGREEMENT
          </button>
        )}
      </div>

      {/* Right Secure Chat Container */}
      <div className="lg:col-span-8 bg-zinc-900/20 border border-zinc-800 rounded-2xl flex flex-col justify-between overflow-hidden">
        {/* Messages Port */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
              Secure Negotiation Session Initialized
            </span>
          </div>

          {messages.map((msg, i) => {
            const isMe = msg.senderId === user?.id || msg.senderId === 'me';
            return (
              <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-3.5 rounded-2xl ${
                  isMe
                    ? 'bg-emerald-600/90 text-white rounded-br-sm shadow-[0_4px_12px_rgba(16,185,129,0.15)]'
                    : 'bg-zinc-800 text-zinc-200 rounded-bl-sm border border-zinc-700/50'
                }`}>
                  <div className="text-[9px] font-mono text-zinc-400 mb-1 flex items-center gap-1.5">
                    <span>{msg.senderName}</span>
                    <span>•</span>
                    <span>{new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.text || msg.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input Dock */}
        <form onSubmit={handleSend} className="border-t border-zinc-800 p-4 bg-zinc-950/40 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Negotiate freight, price, or timing. Nexus will auto-seal agreements."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-mono text-xs font-bold uppercase rounded-xl transition-all"
          >
            Transmit
          </button>
        </form>
      </div>

    </div>
  );
}
