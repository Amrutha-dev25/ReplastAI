import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  Navigate,
  useNavigate
} from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  BarChart3,
  Award,
  Lightbulb,
  MessageSquare,
  Mail,
  Bell,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import axios from "axios";

import { AppProvider, useAppContext } from "./context/AppContext";
import Home from "./components/Home";
import Marketplace from "./components/Marketplace";
import ListingDetail from "./components/ListingDetail";
import UploadMaterial from "./components/UploadMaterial";
import Dashboard from "./components/Dashboard";
import OrderFulfillment from "./components/OrderFulfillment";
import ProtocolNexus from "./components/ProtocolNexus";
import AiAssistant from "./components/AiAssistant";
import Learn from "./components/Learn";
import Certificates from "./components/Certificates";
import Innovations from "./components/Innovations";
import Contact from "./components/Contact";
import Auth from "./components/Auth";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";

// ── App Content Wrapper ──────────────────────────────────────────────────────
function AppContent() {
  const { isAuthenticated, user, login, logout, backendUrl, authHeaders } = useAppContext();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Poll Notifications
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/notifications`, authHeaders);
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated, backendUrl, authHeaders]);

  const markNotificationsAsRead = async () => {
    try {
      await axios.post(`${backendUrl}/api/notifications/read`, {}, authHeaders);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased selection:bg-emerald-500/25 selection:text-emerald-400">
      
      {/* ── Navigation Header ─────────────────────────────────────────────── */}
      <Navbar setShowLogin={setShowLogin} />
      
      {/* Spacer for fixed Navbar */}
      <div className="h-16" />

      {/* ── Main Workspace ────────────────────────────────────────────────── */}
      <main className="flex-1 bg-zinc-950">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/upload-material"
            element={isAuthenticated ? <UploadMaterial /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/order-fulfillment"
            element={isAuthenticated ? <OrderFulfillment /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/nexus/:orderId"
            element={isAuthenticated ? <ProtocolNexus /> : <Navigate to="/login" replace />}
          />

          {/* General Information Pages */}
          <Route path="/innovations" element={<Innovations />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/assistant" element={<AiAssistant />} />
          <Route path="/ai-assistant" element={<AiAssistant />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Authentication View */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginModal setShowLogin={() => navigate('/')} />
              )
            }
          />
          
          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* ── Sticky Footer ─────────────────────────────────────────────────── */}
      <Footer />

      {/* Conditionally render LoginModal overlay */}
      {showLogin && !isAuthenticated && (
        <LoginModal setShowLogin={setShowLogin} />
      )}
      
    </div>
  );
}

// ── Root Entry with Providers ────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}
