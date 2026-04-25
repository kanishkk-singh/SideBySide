import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../context/authStore';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) return toast.error('Fill in all fields');
    if (form.username.length < 3) return toast.error('Username must be at least 3 characters');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');

    const res = await register(form.username, form.email, form.password);
    if (res.ok) { toast.success('Account created! Welcome.'); navigate('/debates'); }
    else toast.error(res.error || 'Registration failed');
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6)  s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthColor = ['', '#FF4040', '#FFB020', '#FFB020', '#22D96B', '#22D96B'][strength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'][strength];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <style>{`
        .auth-glow-a { position:fixed; top:0; left:0; width:50%; height:100%; background:radial-gradient(ellipse at 0% 30%, rgba(26,94,255,0.07) 0%, transparent 60%); pointer-events:none; }
        .auth-glow-b { position:fixed; top:0; right:0; width:50%; height:100%; background:radial-gradient(ellipse at 100% 70%, rgba(255,107,26,0.07) 0%, transparent 60%); pointer-events:none; }
        .auth-panel { background:#0F0F18; border:0.5px solid rgba(255,255,255,0.08); border-radius:20px; padding:2.5rem; width:100%; max-width:440px; position:relative; z-index:1; }
        .auth-logo { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:2px; text-align:center; margin-bottom:0.5rem; }
        .auth-logo .la { color:#1A5EFF; } .auth-logo .sep { color:rgba(255,255,255,0.15); } .auth-logo .lb { color:#FF6B1A; }
        .auth-subtitle { font-size:13px; color:rgba(242,240,250,0.4); text-align:center; margin-bottom:2.5rem; }
        .auth-field { margin-bottom:1.25rem; }
        .strength-bar { height:3px; background:rgba(255,255,255,0.06); border-radius:99px; margin-top:6px; overflow:hidden; }
        .strength-fill { height:100%; border-radius:99px; transition:width 0.3s, background 0.3s; }
        .auth-perks { display:flex; flex-direction:column; gap:8px; margin-bottom:2rem; padding:1rem 1.25rem; background:rgba(255,255,255,0.03); border:0.5px solid rgba(255,255,255,0.07); border-radius:10px; }
        .auth-perk { display:flex; gap:10px; align-items:flex-start; font-size:12px; color:rgba(242,240,250,0.5); }
        .auth-perk-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; margin-top:5px; }
        .auth-bottom { text-align:center; margin-top:1.5rem; font-size:13px; color:rgba(242,240,250,0.4); }
        .auth-bottom a { color:#1A5EFF; text-decoration:none; }
        input.auth-input { background:rgba(255,255,255,0.04); border:0.5px solid rgba(255,255,255,0.09); border-radius:10px; padding:12px 16px; font-size:14px; color:#F2F0FA; font-family:'Outfit',sans-serif; width:100%; outline:none; transition:border-color 0.2s; }
        input.auth-input:focus { border-color:#1A5EFF; background:rgba(26,94,255,0.04); }
        input.auth-input::placeholder { color:rgba(242,240,250,0.2); }
      `}</style>

      <div className="auth-glow-a" /><div className="auth-glow-b" />

      <motion.div className="auth-panel" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="auth-logo">
          <span className="la">Side</span><span className="sep">/</span><span className="lb">Side</span>
        </div>
        <p className="auth-subtitle">Join the discussion. Think better.</p>

        <div className="auth-perks">
          {[
            { color: '#1A5EFF', text: 'Post structured arguments backed by evidence' },
            { color: '#FF6B1A', text: 'Fact-check others and earn reputation' },
            { color: '#22D96B', text: 'See argument quality scores — not popularity' },
          ].map(({ color, text }) => (
            <div key={text} className="auth-perk">
              <div className="auth-perk-dot" style={{ background: color }} />
              {text}
            </div>
          ))}
        </div>

        <form onSubmit={submit}>
          <div className="auth-field">
            <label>Username</label>
            <input className="auth-input" type="text" placeholder="thinker42" maxLength={30}
              value={form.username} onChange={e => set('username', e.target.value)} autoComplete="username" />
          </div>
          <div className="auth-field">
            <label>Email</label>
            <input className="auth-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input className="auth-input" type="password" placeholder="Min 6 characters"
              value={form.password} onChange={e => set('password', e.target.value)} autoComplete="new-password" />
            {form.password && (
              <>
                <div className="strength-bar">
                  <div className="strength-fill" style={{ width: `${(strength / 5) * 100}%`, background: strengthColor }} />
                </div>
                <p style={{ fontSize: 10, color: strengthColor, marginTop: 3 }}>{strengthLabel}</p>
              </>
            )}
          </div>
          <div className="auth-field">
            <label>Confirm password</label>
            <input className="auth-input" type="password" placeholder="Repeat password"
              value={form.confirm} onChange={e => set('confirm', e.target.value)} autoComplete="new-password"
              style={{ borderColor: form.confirm && form.confirm !== form.password ? '#FF4040' : undefined }} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '13px', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account →'}
          </button>
        </form>

        <div className="auth-bottom" style={{ marginTop: '1.5rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
