import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import axios from 'axios';

const NAV_LINKS = [
  { name: 'Find Materials', path: '/marketplace' },
  { name: 'Innovations',    path: '/innovations' },
  { name: 'Learn',          path: '/learn' },
  { name: 'Certificates',   path: '/certificates' },
  { name: 'Contact',        path: '/contact' },
];

export default function Navbar({ setShowLogin }) {
  const { isAuthenticated, user, logout, backendUrl, authHeaders } = useAppContext();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/notifications/list`, {
          headers: { ...authHeaders.headers, 'Content-Type': 'application/json' },
          data: JSON.stringify({ userId: user?.id || user?._id })
        });
        if (res.data.success) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch {}
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, backendUrl, authHeaders]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${backendUrl}/api/notifications/read-all`, { userId: user?.id || user?._id }, authHeaders);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true, isRead: true })));
    } catch {}
  };

  const deleteNotification = async (notifId) => {
    try {
      await axios.delete(`${backendUrl}/api/notifications/${notifId}`);
      setNotifications(prev => {
        const filtered = prev.filter(n => (n._id || n.id) !== notifId);
        const unread = filtered.filter(n => !n.isRead && !n.read).length;
        setUnreadCount(unread);
        return filtered;
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleNotificationClick = async (n) => {
    const notifId = n._id || n.id;
    try {
      // Mark as read in backend
      await axios.put(`${backendUrl}/api/notifications/${notifId}/read`);
      
      // Update local state
      setNotifications(prev => prev.map(item => {
        if ((item._id || item.id) === notifId) {
          return { ...item, read: true, isRead: true };
        }
        return item;
      }));
      setUnreadCount(prev => Math.max(0, prev - (n.isRead || n.read ? 0 : 1)));

      // Close dropdown
      setShowNotifications(false);

      // Navigate correctly
      if (n.orderId) {
        navigate(`/nexus/${n.orderId}`);
      } else if (n.type === 'request') {
        navigate('/order-fulfillment');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Failed to process notification click:", err);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-[100] bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10 px-8 h-16 flex items-center justify-between">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-3">
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-emerald-500 fill-current">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span className="font-bold tracking-[0.3em] text-sm text-white uppercase">REPLAST</span>
      </Link>

      {/* Nav links */}
      <div className="hidden lg:flex items-center gap-8">
        {NAV_LINKS.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-[10px] font-medium uppercase tracking-[0.2em] transition-all ${
              location.pathname === link.path
                ? 'text-emerald-400'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Auth controls */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            {/* AI Assistant link */}
            <button
              onClick={() => navigate('/ai-assistant')}
              className="text-[10px] font-mono uppercase tracking-wider text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
            >
              🤖 AI
            </button>

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-8 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-[200]">
                  <div className="p-3 border-b border-zinc-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-200">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-[10px] text-emerald-400 hover:text-emerald-300 cursor-pointer">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-xs text-zinc-500 text-center">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map(n => {
                        const isUnread = !n.read && !n.isRead;
                        return (
                          <div
                            key={n._id || n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 border-b border-zinc-800/50 hover:bg-zinc-800/50 cursor-pointer transition-colors flex justify-between items-start gap-2 ${
                              isUnread ? 'bg-zinc-800/30 font-medium' : ''
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-zinc-200">{n.title}</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5 break-words line-clamp-2">{n.message}</p>
                              <p className="text-[9px] text-zinc-600 mt-1">
                                {new Date(n.createdAt || Date.now()).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(n._id || n.id);
                              }}
                              className="text-zinc-600 hover:text-rose-400 p-1 text-[11px] font-bold rounded hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                              title="Delete notification"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              👤 {user?.name?.split(' ')[0] || 'Dashboard'}
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 border border-zinc-700 hover:border-rose-800 text-zinc-400 hover:text-rose-400 font-mono text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
            >
              Exit
            </button>
          </>
        ) : (
          <button
            onClick={() => typeof setShowLogin === 'function' && setShowLogin(true)}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono text-[10px] uppercase tracking-wider rounded-lg font-bold transition-all cursor-pointer"
          >
            Sign In
          </button>
        )}
      </div>

    </nav>
  );
}
