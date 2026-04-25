import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../lib/api';

const fallbackTopics = [
  { _id: 'technology-ai', name: 'Technology & AI', icon: '⬡' },
  { _id: 'politics-policy', name: 'Politics & Policy', icon: '◎' },
  { _id: 'science-health', name: 'Science & Health', icon: '◈' },
  { _id: 'society-culture', name: 'Society & Culture', icon: '◑' },
  { _id: 'economics', name: 'Economics', icon: '◇' },
  { _id: 'philosophy-ethics', name: 'Philosophy & Ethics', icon: '⚖' },
  { _id: 'other', name: 'Other', icon: '•' },
];

export default function CreateDebate() {
  const navigate = useNavigate();
  const [topics, setTopics]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState(1); // 1: basics, 2: sides, 3: settings
  const [form, setForm] = useState({
    title: '', description: '', topicId: '',
    sideA: { label: '', description: '' },
    sideB: { label: '', description: '' },
    tags: '', hideVotesUntilSided: true, closesAfterDays: 7,
  });

  useEffect(() => {
    api.get('/topics').then(r => setTopics(r.data.topics || [])).catch(() => {});
  }, []);

  const availableTopics = topics.length ? topics : fallbackTopics;

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const setSide = (s, key, val) => setForm(p => ({ ...p, [`side${s}`]: { ...p[`side${s}`], [key]: val } }));

  const validate = () => {
    if (step === 1) {
      if (!form.title.trim() || form.title.length < 10) { toast.error('Title must be at least 10 characters'); return false; }
      if (!form.description.trim()) { toast.error('Description is required'); return false; }
      if (!form.topicId) { toast.error('Select a topic'); return false; }
    }
    if (step === 2) {
      if (!form.sideA.label.trim()) { toast.error('Side A label required'); return false; }
      if (!form.sideB.label.trim()) { toast.error('Side B label required'); return false; }
    }
    return true;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const { data } = await api.post('/debates', {
        title: form.title, description: form.description,
        topicId: form.topicId,
        sideA: form.sideA, sideB: form.sideB,
        tags, hideVotesUntilSided: form.hideVotesUntilSided,
        closesAfterDays: form.closesAfterDays,
      });
      toast.success('Debate created!');
      navigate(`/debates/${data.debate._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create');
    }
    setLoading(false);
  };

  const steps = ['Basics', 'Sides', 'Settings'];

  return (
    <div style={{ paddingTop: '5rem', minHeight: '100vh', padding: '6rem 2rem 4rem' }}>
      <style>{`
        .create-wrap { max-width: 680px; margin: 0 auto; }
        .step-bar { display:flex; align-items:center; gap:0; margin-bottom:3rem; }
        .step-item { display:flex; align-items:center; gap:8px; }
        .step-dot { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:600; transition:all 0.3s; flex-shrink:0; }
        .step-dot.done   { background:#1A5EFF; color:#fff; }
        .step-dot.active { background:rgba(26,94,255,0.15); color:#1A5EFF; border:1px solid #1A5EFF; }
        .step-dot.todo   { background:rgba(255,255,255,0.05); color:rgba(242,240,250,0.3); border:0.5px solid rgba(255,255,255,0.1); }
        .step-label { font-size:12px; font-weight:500; }
        .step-label.active { color:#F2F0FA; }
        .step-label.todo   { color:rgba(242,240,250,0.3); }
        .step-label.done   { color:rgba(242,240,250,0.5); }
        .step-line { flex:1; height:0.5px; background:rgba(255,255,255,0.08); margin:0 12px; }
        .create-panel { background:#0F0F18; border:0.5px solid rgba(255,255,255,0.07); border-radius:20px; padding:2.5rem; }
        .form-group { margin-bottom:1.5rem; }
        .hint { font-size:11px; color:rgba(242,240,250,0.3); margin-top:5px; }
        .side-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        .side-panel { border-radius:14px; padding:1.5rem; }
        .side-panel-a { background:rgba(26,94,255,0.06); border:0.5px solid rgba(26,94,255,0.18); }
        .side-panel-b { background:rgba(255,107,26,0.06); border:0.5px solid rgba(255,107,26,0.18); }
        .side-panel label { font-size:10px; }
        .side-panel input { background:rgba(255,255,255,0.05); }
        .side-panel-a input:focus { border-color:#1A5EFF; }
        .side-panel-b input:focus { border-color:#FF6B1A; }
        .toggle-row { display:flex; align-items:center; justify-content:space-between; padding:1rem 1.25rem; background:rgba(255,255,255,0.03); border:0.5px solid rgba(255,255,255,0.07); border-radius:10px; margin-bottom:1rem; }
        .toggle-label { font-size:13px; color:#F2F0FA; }
        .toggle-sub { font-size:11px; color:rgba(242,240,250,0.4); margin-top:2px; }
        .toggle-switch { width:40px; height:22px; border-radius:99px; position:relative; cursor:pointer; transition:background 0.2s; border:none; flex-shrink:0; }
        .toggle-switch.on  { background:#1A5EFF; }
        .toggle-switch.off { background:rgba(255,255,255,0.1); }
        .toggle-knob { position:absolute; top:3px; width:16px; height:16px; background:#fff; border-radius:50%; transition:left 0.2s; }
        .toggle-switch.on  .toggle-knob { left:21px; }
        .toggle-switch.off .toggle-knob { left:3px; }
        .days-select { display:flex; gap:8px; flex-wrap:wrap; }
        .day-btn { padding:6px 14px; border-radius:8px; font-size:13px; cursor:pointer; border:0.5px solid rgba(255,255,255,0.1); background:transparent; color:rgba(242,240,250,0.5); font-family:'Outfit',sans-serif; transition:all 0.15s; }
        .day-btn.active { background:rgba(26,94,255,0.15); border-color:#1A5EFF; color:#F2F0FA; }
        .create-footer { display:flex; justify-content:space-between; align-items:center; margin-top:2.5rem; }
        .preview-title { font-family:'DM Serif Display',serif; font-size:20px; line-height:1.4; color:#F2F0FA; margin:1rem 0; }
        @media(max-width:560px) { .side-grid { grid-template-columns:1fr; } }
      `}</style>

      <div className="create-wrap">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>New debate</p>
          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(36px,6vw,64px)', letterSpacing: 3, marginBottom: '2.5rem' }}>
            Create a <span style={{ color: '#1A5EFF' }}>debate</span>
          </h1>

          {/* Step bar */}
          <div className="step-bar">
            {steps.map((s, i) => {
              const n = i + 1;
              const state = n < step ? 'done' : n === step ? 'active' : 'todo';
              return (
                <div key={s} className="step-item" style={{ flex: i < steps.length - 1 ? '1' : 'none' }}>
                  <div className={`step-dot ${state}`}>{n < step ? '✓' : n}</div>
                  <span className={`step-label ${state}`}>{s}</span>
                  {i < steps.length - 1 && <div className="step-line" />}
                </div>
              );
            })}
          </div>

          <div className="create-panel">
            {/* STEP 1: BASICS */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="form-group">
                  <label>Debate question *</label>
                  <input value={form.title} onChange={e => set('title', e.target.value)}
                    placeholder="Should social media platforms be liable for misinformation?" maxLength={200} />
                  <p className="hint">Make it a clear question or statement. Min 10 characters.</p>
                </div>
                <div className="form-group">
                  <label>Context / Description *</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)}
                    rows={4} placeholder="Give context for this debate. What's the background? Why does it matter?" maxLength={2000} />
                </div>
                <div className="form-group">
                  <label>Topic *</label>
                  <select value={form.topicId} onChange={e => set('topicId', e.target.value)}>
                    <option value="">Select a topic…</option>
                    {availableTopics.map(t => <option key={t._id} value={t._id}>{t.icon} {t.name}</option>)}
                  </select>
                  {!topics.length && <p className="hint">Default topic suggestions are shown until the backend topic list loads.</p>}
                </div>
                <div className="form-group">
                  <label>Tags <span style={{ color: 'var(--muted)' }}>(comma separated)</span></label>
                  <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="AI, regulation, free speech" />
                </div>
              </motion.div>
            )}

            {/* STEP 2: SIDES */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  Define the two positions. Side A is always <span style={{ color: '#1A5EFF' }}>blue</span>, Side B is always <span style={{ color: '#FF6B1A' }}>orange</span>. Neither color implies good or bad.
                </p>
                {form.title && <div className="preview-title">{form.title}</div>}
                <div className="side-grid">
                  <div className="side-panel side-panel-a">
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#1A5EFF', marginBottom: '1rem' }}>Side A</div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label>Position label *</label>
                      <input value={form.sideA.label} onChange={e => setSide('A', 'label', e.target.value)} placeholder="Yes, hold them liable" maxLength={60} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Short description</label>
                      <input value={form.sideA.description} onChange={e => setSide('A', 'description', e.target.value)} placeholder="Optional brief description…" maxLength={300} />
                    </div>
                  </div>
                  <div className="side-panel side-panel-b">
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#FF6B1A', marginBottom: '1rem' }}>Side B</div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label>Position label *</label>
                      <input value={form.sideB.label} onChange={e => setSide('B', 'label', e.target.value)} placeholder="No, free speech at risk" maxLength={60} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Short description</label>
                      <input value={form.sideB.description} onChange={e => setSide('B', 'description', e.target.value)} placeholder="Optional brief description…" maxLength={300} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SETTINGS */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="toggle-row">
                  <div>
                    <div className="toggle-label">Hide vote counts until user picks a side</div>
                    <div className="toggle-sub">Prevents anchoring bias — users see counts only after voting</div>
                  </div>
                  <button className={`toggle-switch ${form.hideVotesUntilSided ? 'on' : 'off'}`}
                    onClick={() => set('hideVotesUntilSided', !form.hideVotesUntilSided)}>
                    <div className="toggle-knob" />
                  </button>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ marginBottom: '0.75rem' }}>Close debate after</label>
                  <div className="days-select">
                    {[3, 7, 14, 30, 0].map(d => (
                      <button key={d} className={`day-btn${form.closesAfterDays === d ? ' active' : ''}`}
                        onClick={() => set('closesAfterDays', d)}>
                        {d === 0 ? 'Never' : `${d} days`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '1.25rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>Summary</div>
                  <div style={{ fontSize: 14, color: '#F2F0FA', marginBottom: '0.75rem', fontFamily: 'DM Serif Display', lineHeight: 1.4 }}>{form.title}</div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-a">{form.sideA.label || 'Side A'}</span>
                    <span className="badge badge-b">{form.sideB.label || 'Side B'}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {availableTopics.find(t => t._id === form.topicId)?.name || '—'} ·{' '}
                    {form.closesAfterDays === 0 ? 'Never closes' : `Closes in ${form.closesAfterDays} days`} ·{' '}
                    {form.hideVotesUntilSided ? 'Anti-bias mode on' : 'Votes visible'}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="create-footer">
              <div>
                {step > 1 && <button className="btn btn-ghost" onClick={back}>← Back</button>}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {step < 3
                  ? <button className="btn btn-primary" onClick={next}>Continue →</button>
                  : <button className="btn btn-primary" onClick={submit} disabled={loading}>
                      {loading ? 'Creating…' : 'Launch debate →'}
                    </button>
                }
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
