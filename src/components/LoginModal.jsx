import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext.jsx';

const VIEWS = { SIGN_IN: 'Sign In', REGISTER: 'Register Node', FORGOT: 'Forgot Password' };

export default function LoginModal({ setShowLogin }) {
  const { login, user, backendUrl } = useAppContext();
  const navigate = useNavigate();

  const [view, setView]               = useState(VIEWS.SIGN_IN);
  const [formData, setFormData]       = useState({ name: '', email: '', password: '', role: 'contributor' });
  const [recoveryEmail, setRecovery]  = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');

  // Already logged in → go to dashboard
  useEffect(() => {
    if (user) {
      if (typeof setShowLogin === 'function') setShowLogin(false);
      navigate('/dashboard');
    }
  }, [user, navigate, setShowLogin]);

  const closeModal = () => {
    if (typeof setShowLogin === 'function') setShowLogin(false);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const isSignIn = view === VIEWS.SIGN_IN;
    const endpoint = isSignIn ? '/api/users/login' : '/api/users/register';
    const payload  = isSignIn
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const { data } = await axios.post(`${backendUrl}${endpoint}`, payload);
      if (data.token) {
        login(data.user, data.token);
        closeModal();
        navigate('/dashboard');
      } else {
        setError('Unexpected server response format.');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.error || err.response.data?.message || 'Invalid credentials.');
      } else if (err.request) {
        setError('Cannot reach server. Is the backend running?');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post(`${backendUrl}/api/users/forgot-password`, { email: recoveryEmail });
      setSuccess(data.message || 'If this email exists, a recovery link has been sent.');
      setView(VIEWS.SIGN_IN);
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.error || err.response.data?.message || 'Something went wrong.');
      } else if (err.request) {
        setError('Cannot reach server. Is the backend running?');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchView = (next) => {
    setView(next);
    setError('');
    setSuccess('');
  };

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let intervalId;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const characters = '01';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize) + 1;
    const drops = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#10b981';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (Math.random() > 0.98) {
          ctx.fillStyle = '#34d399';
        } else {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        }

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    intervalId = setInterval(draw, 33);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // We use a high-tech ambient green/matrix stream as background to avoid local .mp4 compilation errors on build
  const loginBgVideo = "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-green-binary-code-42261-large.mp4";

  // ── Input class ─────────────────────────────────────────────────────────────
  const inputCls = 'w-full bg-emerald-950/40 border border-emerald-800/60 focus:border-emerald-400 rounded-xl p-3 text-emerald-100 placeholder-emerald-700/60 focus:outline-none transition-all text-xs font-mono';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">

      {/* ── Background video & canvas fallback ───────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-0 opacity-40" />
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-25 z-10"
          src={loginBgVideo}
        />
        <div className="absolute inset-0 opacity-20 z-20" style={{
          backgroundImage: `linear-gradient(to right, rgba(16,185,129,0.08) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(16,185,129,0.08) 1px, transparent 1px)`,
          backgroundSize: '45px 45px',
          animation: 'matrixDrift 30s linear infinite',
        }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black z-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] z-30" />
      </div>

      {/* ── Click-outside overlay ─────────────────────────────────────────── */}
      <div onClick={closeModal} className="absolute inset-0 z-10 cursor-pointer" />

      {/* ── Modal card ───────────────────────────────────────────────────── */}
      <div className="relative z-20 w-full max-w-md bg-[#020804] border border-emerald-500/30 rounded-2xl p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <span className="inline-block px-2 py-0.5 bg-emerald-900/40 border border-emerald-500/30 rounded text-[9px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
            REPLAST ECOSYSTEM GATEWAY
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-emerald-50">
            {view === VIEWS.SIGN_IN  && 'Access Control Room'}
            {view === VIEWS.REGISTER && 'Register Supply Node'}
            {view === VIEWS.FORGOT   && 'Recover Access Key'}
          </h2>
          <p className="text-xs text-emerald-300/70">
            {view === VIEWS.SIGN_IN  && 'Deploy credentials to connect to your materials desk.'}
            {view === VIEWS.REGISTER && 'Initialize your facility profile onto the ledger.'}
            {view === VIEWS.FORGOT   && 'Request a cryptographically signed recovery payload.'}
          </p>
        </div>

        {/* Alerts */}
        {error   && <div className="bg-rose-950/40 border border-rose-500/30 p-3 rounded-xl text-center font-mono text-[11px] text-rose-300">⚠️ {error}</div>}
        {success && <div className="bg-emerald-950/50 border border-emerald-500/40 p-3 rounded-xl text-center font-mono text-[11px] text-emerald-400">{success}</div>}

        {/* ── Sign In / Register form ──────────────────────────────────── */}
        {view !== VIEWS.FORGOT ? (
          <form onSubmit={handleAuth} className="space-y-4">

            {view === VIEWS.REGISTER && (
              <div className="space-y-1">
                <label className="text-emerald-400/70 text-[10px] uppercase tracking-wider font-mono block">Enterprise Full Name</label>
                <input name="name" type="text" required value={formData.name} onChange={handleChange}
                  placeholder="e.g., GreenCycle Industries" className={inputCls} />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-emerald-400/70 text-[10px] uppercase tracking-wider font-mono block">Network Email</label>
              <input name="email" type="email" required value={formData.email} onChange={handleChange}
                placeholder="operator@facility.com" className={inputCls} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-emerald-400/70 text-[10px] uppercase tracking-wider font-mono block">Password</label>
                {view === VIEWS.SIGN_IN && (
                  <button type="button" onClick={() => switchView(VIEWS.FORGOT)}
                    className="text-[10px] text-emerald-400/60 hover:text-emerald-300 transition-colors font-mono cursor-pointer">
                    Forgot Password?
                  </button>
                )}
              </div>
              <input name="password" type="password" required value={formData.password} onChange={handleChange}
                placeholder="••••••••••••" className={inputCls} />
            </div>

            {view === VIEWS.REGISTER && (
              <div className="space-y-1">
                <label className="text-emerald-400/70 text-[10px] uppercase tracking-wider font-mono block">Operational Role</label>
                <select name="role" value={formData.role} onChange={handleChange}
                  className="w-full bg-emerald-950/60 border border-emerald-800/60 focus:border-emerald-400 rounded-xl p-3 text-emerald-200 focus:outline-none cursor-pointer text-xs font-mono">
                  <option value="contributor">Contributor — Industrial Scrap Seller</option>
                  <option value="procurement">Procurement — Material Buyer</option>
                </select>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-zinc-950 font-bold uppercase rounded-xl tracking-wider shadow-[0_4px_20px_rgba(16,185,129,0.3)] active:scale-[0.98] transition-all text-xs font-mono cursor-pointer">
              {loading ? 'Verifying...' : view}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 border-t border-emerald-800/40" />
              <span className="text-[9px] text-emerald-500/60 uppercase tracking-widest font-mono font-bold">OR</span>
              <div className="flex-1 border-t border-emerald-800/40" />
            </div>

            {/* Google */}
            <button type="button" onClick={() => alert('Google OAuth coming soon.')}
              className="w-full py-3 border border-emerald-800/60 hover:border-emerald-500 bg-emerald-950/20 hover:bg-emerald-950/60 rounded-xl flex items-center justify-center gap-2.5 text-emerald-300 hover:text-emerald-100 font-bold tracking-wide active:scale-[0.98] transition-all text-xs font-mono cursor-pointer">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#10B981" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 14.98 1 12 1 7.35 1 3.37 3.63 1.39 7.46l3.82 2.96c.92-2.75 3.51-4.38 6.79-4.38z"/>
                <path fill="#34D399" d="M23.45 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.42c-.28 1.44-1.09 2.66-2.32 3.49l3.61 2.8c2.11-1.95 3.34-4.82 3.34-8.16z"/>
                <path fill="#059669" d="M5.21 10.42c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.39 4.88C.5 6.66 0 8.65 0 10.75s.5 4.09 1.39 5.87l3.82-2.96z"/>
                <path fill="#047857" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.61-2.8c-1.1.74-2.5 1.18-4.35 1.18-3.28 0-5.87-2.14-6.79-5.14L1.39 16.3C3.37 20.13 7.35 23 12 23z"/>
              </svg>
              Continue via Google
            </button>

          </form>
        ) : (
          /* ── Forgot password form ──────────────────────────────────── */
          <form onSubmit={handleForgot} className="space-y-4">
            <div className="space-y-1">
              <label className="text-emerald-400/70 text-[10px] uppercase tracking-wider font-mono block">Your Email Address</label>
              <input type="email" required value={recoveryEmail} onChange={e => setRecovery(e.target.value)}
                placeholder="operator@facility.com" className={inputCls} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-zinc-950 font-bold uppercase rounded-xl tracking-wider active:scale-[0.98] transition-all text-xs font-mono cursor-pointer">
              {loading ? 'Sending...' : 'Request Recovery Link'}
            </button>
            <button type="button" onClick={() => switchView(VIEWS.SIGN_IN)}
              className="w-full text-center text-emerald-400/60 hover:text-emerald-300 text-xs font-mono transition-colors cursor-pointer">
              ← Return to Gateway
            </button>
          </form>
        )}

        {/* Toggle sign in / register */}
        {view !== VIEWS.FORGOT && (
          <div className="text-center pt-2 border-t border-emerald-800/40">
            <button onClick={() => switchView(view === VIEWS.SIGN_IN ? VIEWS.REGISTER : VIEWS.SIGN_IN)}
              className="text-xs text-emerald-400/70 hover:text-emerald-300 font-mono tracking-wide transition-colors cursor-pointer">
              {view === VIEWS.SIGN_IN
                ? 'New Facility? Establish Fresh Node Connection →'
                : 'Existing Operator? Return to Security Portal →'}
            </button>
          </div>
        )}

      </div>

      <style>{`
        @keyframes matrixDrift {
          0%   { background-position: 0px 0px; }
          100% { background-position: 45px 90px; }
        }
      `}</style>
    </div>
  );
}
