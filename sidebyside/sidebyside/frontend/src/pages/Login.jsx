import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../context/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Fill in all fields');
    const res = await login(form.email, form.password);
    if (res.ok) { toast.success('Welcome back!'); navigate('/debates'); }
    else toast.error(res.error || 'Login failed');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <style>{`
        .auth-glow-a { position:fixed; top:0; left:0; width:50%; height:100%; background:radial-gradient(ellipse at 0% 30%, rgba(26,94,255,0.07) 0%, transparent 60%); pointer-events:none; }
        .auth-glow-b { position:fixed; top:0; right:0; width:50%; height:100%; background:radial-gradient(ellipse at 100% 70%, rgba(255,107,26,0.07) 0%, transparent 60%); pointer-events:none; }
        .auth-panel { background:#0F0F18; border:0.5px solid rgba(255,255,255,0.08); border-radius:20px; padding:2.5rem; width:100%; max-width:420px; position:relative; z-index:1; }
        .auth-logo { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:2px; text-align:center; margin-bottom:0.5rem; }
        .auth-logo .la { color:#1A5EFF; } .auth-logo .sep { color:rgba(255,255,255,0.15); } .auth-logo .lb { color:#FF6B1A; }
        .auth-subtitle { font-size:13px; color:rgba(242,240,250,0.4); text-align:center; margin-bottom:2.5rem; }
        .auth-field { margin-bottom:1.25rem; }
        .auth-divider { display:flex; align-items:center; gap:1rem; margin:1.5rem 0; }
        .auth-divider-line { flex:1; height:0.5px; background:rgba(255,255,255,0.07); }
        .auth-divider-text { font-size:11px; color:rgba(242,240,250,0.25); }
        .auth-bottom { text-align:center; margin-top:1.5rem; font-size:13px; color:rgba(242,240,250,0.4); }
        .auth-bottom a { color:#1A5EFF; text-decoration:none; }
        .auth-bottom a:hover { text-decoration:underline; }
        input.auth-input { background:rgba(255,255,255,0.04); border:0.5px solid rgba(255,255,255,0.09); border-radius:10px; padding:12px 16px; font-size:14px; color:#F2F0FA; font-family:'Outfit',sans-serif; width:100%; outline:none; transition:border-color 0.2s; }
        input.auth-input:focus { border-color:#1A5EFF; background:rgba(26,94,255,0.04); }
        input.auth-input::placeholder { color:rgba(242,240,250,0.2); }
      `}</style>

      <div className="auth-glow-a" /><div className="auth-glow-b" />

      <motion.div className="auth-panel" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="auth-logo">
          <span className="la">Side</span><span className="sep">/</span><span className="lb">Side</span>
        </div>
        <p className="auth-subtitle">See both sides. Think better.</p>

        <form onSubmit={submit}>
          <div className="auth-field">
            <label>Email</label>
            <input className="auth-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input className="auth-input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => set('password', e.target.value)} autoComplete="current-password" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '13px', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line" /><span className="auth-divider-text">or</span><div className="auth-divider-line" />
        </div>

        <div className="auth-bottom">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </motion.div>
    </div>
  );
}
