import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// ─── Context & Hook ───────────────────────────────────────────────────────────
const AppContext = createContext(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppContextProvider');
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppContextProvider({ children }) {
  const BACKEND_URL = window.location.origin;

  // ── Auth State ──────────────────────────────────────────────────────────────
  const [token, setToken] = useState(() => localStorage.getItem('replast_token') || '');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('replast_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // ── App State ───────────────────────────────────────────────────────────────
  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('replast_orders')) || [];
    } catch {
      return [];
    }
  });

  const [telemetry, setTelemetry] = useState({
    plasticDivertedKg: 2400,
    innovationsMade: 180,
    activeContributors: 95,
  });

  // ── Derived State ────────────────────────────────────────────────────────────
  const isAuthenticated = !!user && !!token;

  // ── Axios instance with auth header ─────────────────────────────────────────
  const authHeaders = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};

  // ── Persist: user ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      localStorage.setItem('replast_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('replast_user');
    }
  }, [user]);

  // ── Persist: token ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (token) {
      localStorage.setItem('replast_token', token);
    } else {
      localStorage.removeItem('replast_token');
    }
  }, [token]);

  // ── Persist: orders ──────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('replast_orders', JSON.stringify(orders));
  }, [orders]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const login = useCallback((userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken('');
    setOrders([]);
    localStorage.removeItem('replast_token');
    localStorage.removeItem('replast_user');
    localStorage.removeItem('replast_orders');
  }, []);

  const fetchTelemetry = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/sellers/telemetry`);
      if (data.success) setTelemetry(data.telemetry);
    } catch {
      // silently fall back to defaults — no console spam in production
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  // ── Value ────────────────────────────────────────────────────────────────────
  const value = {
    // config
    backendUrl: BACKEND_URL,
    // auth
    token,
    user,
    isAuthenticated,
    authHeaders,
    login,
    logout,
    // orders
    orders,
    setOrders,
    // telemetry
    telemetry,
    fetchTelemetry,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Compatibility exports
export { AppContextProvider as AppProvider };
