import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../context/authStore';

const QUALITY_MAP = {
  strong:   { label: 'Strong',   cls: 'badge-green' },
  moderate: { label: 'Moderate', cls: 'badge-amber' },
  weak:     { label: 'Weak',     cls: 'badge-red'   },
};

export default function DebateView() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [debate, setDebate]     = useState(null);
  const [argsA,  setArgsA]      = useState([]);
  const [argsB,  setArgsB]      = useState([]);
  const [loading, setLoading]   = useState(true);
  const [sideChosen, setSideChosen] = useState(null); // 'A' | 'B' | null
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ claim: '', content: '', sources: '' });

  const fetchAll = async () => {
    try {
      const [dr, ar] = await Promise.all([
        api.get(`/debates/${id}`),
        api.get(`/arguments?debateId=${id}`),
      ]);
      setDebate(dr.data.debate);
      setSideChosen(dr.data.debate.userVote || null);
      const all = ar.data.arguments || [];
      setArgsA(all.filter(a => a.side === 'A'));
      setArgsB(all.filter(a => a.side === 'B'));
    } catch { toast.error('Failed to load debate'); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [id]);

  const castVote = async (side) => {
    if (!user) return toast.error('Sign in to vote');
    try {
      const { data } = await api.post(`/debates/${id}/vote`, { side });
      setSideChosen(side);
      setDebate(prev => ({ ...prev, sideA: data.sideA, sideB: data.sideB, totalVotes: data.totalVotes, votesHidden: false }));
      toast.success(`You're on Side ${side}!`);
    } catch (e) { toast.error(e.response?.data?.message || 'Vote failed'); }
  };

  const submitArg = async () => {
    if (!form.claim.trim())   return toast.error('Claim is required');
    if (!form.content.trim()) return toast.error('Explanation is required');
    setSubmitting(true);
    try {
      const sources = form.sources.split('\n').map(s => s.trim()).filter(Boolean);
      const { data } = await api.post('/arguments', {
        debateId: id, side: sideChosen, claim: form.claim, content: form.content, sources,
      });
      if (sideChosen === 'A') setArgsA(p => [data.argument, ...p]);
      else setArgsB(p => [data.argument, ...p]);
      setForm({ claim: '', content: '', sources: '' });
      setShowForm(false);
      toast.success('Argument posted!');
      // Refetch to get updated scores
      const dr = await api.get(`/debates/${id}`);
      setDebate(dr.data.debate);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to post'); }
    setSubmitting(false);
  };

  const factCheck = async (argId, verdict) => {
    if (!user) return toast.error('Sign in to fact-check');
    try {
      const { data } = await api.post(`/arguments/${argId}/factcheck`, { verdict });
      const update = arr => arr.map(a => a._id === argId ? { ...a, factScore: data.factScore, factChecks: data.factChecks, qualityTier: data.qualityTier } : a);
      setArgsA(update); setArgsB(update);
      toast.success(verdict === 'correct' ? '✓ Marked correct' : '✗ Marked false');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const hasPosted = user && [...argsA, ...argsB].some(a => a.author?._id === user._id || a.author === user._id);

  if (loading) return (
    <div style={{ paddingTop: '8rem', textAlign: 'center', color: 'var(--muted)' }}>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: 48, letterSpacing: 3, color: '#1A5EFF', animation: 'sbsFadeIn 1s infinite alternate' }}>Loading</div>
    </div>
  );

  if (!debate) return <div style={{ paddingTop: '8rem', textAlign: 'center', color: 'var(--muted)' }}>Debate not found.</div>;

  const totalA = debate.sideA?.voteCount ?? null;
  const totalB = debate.sideB?.voteCount ?? null;
  const totalV = debate.totalVotes || 0;
  const pctA = totalV > 0 && totalA !== null ? Math.round((totalA / totalV) * 100) : null;
  const pctB = totalV > 0 && totalB !== null ? Math.round((totalB / totalV) * 100) : null;

  return (
    <div style={{ paddingTop: '4.5rem', minHeight: '100vh' }}>
      <style>{`
        .dv-hero { padding:3rem 2rem 0; position:relative; overflow:hidden; }
        .dv-glow-a { position:absolute; top:0; left:0; width:45%; height:100%; background:radial-gradient(ellipse at 0% 50%, rgba(26,94,255,0.07) 0%, transparent 70%); pointer-events:none; }
        .dv-glow-b { position:absolute; top:0; right:0; width:45%; height:100%; background:radial-gradient(ellipse at 100% 50%, rgba(255,107,26,0.07) 0%, transparent 70%); pointer-events:none; }
        .dv-title { font-family:'DM Serif Display',serif; font-size:clamp(22px,3.5vw,38px); line-height:1.3; max-width:760px; margin:1rem 0 1.5rem; }
        .vote-cards { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:rgba(255,255,255,0.07); border-radius:16px; overflow:hidden; margin:2rem 0; max-width:660px; }
        .vote-card { padding:1.75rem; cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden; border:none; text-align:left; font-family:'Outfit',sans-serif; }
        .vote-card-a { background:rgba(26,94,255,0.06); }
        .vote-card-b { background:rgba(255,107,26,0.06); }
        .vote-card-a:hover:not(:disabled) { background:rgba(26,94,255,0.12); }
        .vote-card-b:hover:not(:disabled) { background:rgba(255,107,26,0.12); }
        .vote-card.chosen-a { background:rgba(26,94,255,0.18); box-shadow:inset 0 0 0 1.5px #1A5EFF; }
        .vote-card.chosen-b { background:rgba(255,107,26,0.18); box-shadow:inset 0 0 0 1.5px #FF6B1A; }
        .vote-side-label { font-size:10px; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:8px; }
        .vote-side-title { font-size:16px; font-weight:500; color:#F2F0FA; margin-bottom:8px; }
        .vote-side-desc { font-size:12px; color:rgba(242,240,250,0.45); line-height:1.6; }
        .vote-pct { font-family:'Bebas Neue',sans-serif; font-size:36px; margin-top:12px; letter-spacing:2px; }
        .arena { display:grid; grid-template-columns:1fr 44px 1fr; gap:0; align-items:start; }
        .arena-col { display:flex; flex-direction:column; gap:10px; }
        .arena-col-a { padding-right:22px; }
        .arena-col-b { padding-left:22px; }
        .arena-sep { display:flex; flex-direction:column; align-items:center; padding-top:4px; gap:4px; }
        .arena-sep-dot { width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,0.08); }
        .arena-sep-line { width:0.5px; flex:1; min-height:300px; background:rgba(255,255,255,0.07); }
        .arg-card {
          background:#0F0F18; border:0.5px solid rgba(255,255,255,0.07);
          border-radius:12px; padding:1.25rem; position:relative; overflow:hidden;
        }
        .arg-card::before { content:''; position:absolute; top:0; left:0; width:3px; height:100%; border-radius:3px 0 0 3px; }
        .arg-card.side-a::before { background:#1A5EFF; }
        .arg-card.side-b::before { background:#FF6B1A; }
        .arg-claim { font-size:13px; font-weight:500; line-height:1.45; margin-bottom:8px; color:#F2F0FA; }
        .arg-body  { font-size:12px; color:rgba(242,240,250,0.5); line-height:1.65; margin-bottom:10px; }
        .arg-footer { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .arg-sources { margin-top:8px; display:flex; flex-direction:column; gap:3px; }
        .arg-source-link { font-size:10px; color:#1A5EFF; text-decoration:none; word-break:break-all; }
        .arg-source-link:hover { text-decoration:underline; }
        .fc-btns { display:flex; gap:4px; margin-left:auto; }
        .fc-btn { font-size:10px; padding:3px 8px; border-radius:6px; border:0.5px solid; cursor:pointer; font-family:'Outfit',sans-serif; transition:all 0.15s; }
        .fc-btn-correct { background:rgba(34,217,107,0.08); color:#22D96B; border-color:rgba(34,217,107,0.2); }
        .fc-btn-correct:hover { background:rgba(34,217,107,0.16); }
        .fc-btn-false   { background:rgba(255,64,64,0.08);  color:#FF4040; border-color:rgba(255,64,64,0.2); }
        .fc-btn-false:hover { background:rgba(255,64,64,0.16); }
        .fc-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .arg-author { font-size:10px; color:rgba(242,240,250,0.25); }
        .score-panel { background:#0F0F18; border:0.5px solid rgba(255,255,255,0.07); border-radius:16px; padding:2rem; margin:2rem 0; }
        .score-row { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
        .score-side-lbl { font-size:12px; font-weight:500; width:48px; flex-shrink:0; }
        .score-track { flex:1; height:6px; background:rgba(255,255,255,0.06); border-radius:99px; overflow:hidden; }
        .score-fill-a { height:100%; background:linear-gradient(90deg,#0F3BCC,#1A5EFF); border-radius:99px; transition:width 1s cubic-bezier(0.16,1,0.3,1); }
        .score-fill-b { height:100%; background:linear-gradient(90deg,#CC4A0F,#FF6B1A); border-radius:99px; transition:width 1s cubic-bezier(0.16,1,0.3,1); }
        .score-num { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:1px; width:40px; text-align:right; }
        .form-panel { background:#0F0F18; border:0.5px solid rgba(255,255,255,0.07); border-radius:16px; padding:2rem; margin-bottom:2rem; }
        .form-grid { display:grid; gap:1rem; }
        .col-header { display:flex; align-items:center; gap:8px; margin-bottom:16px; }
        .col-header-dot { width:8px; height:8px; border-radius:50%; }
        .col-header-label { font-size:11px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; }
        .anti-bias-note { background:rgba(255,176,32,0.07); border:0.5px solid rgba(255,176,32,0.15); border-radius:10px; padding:12px 14px; font-size:12px; color:rgba(255,176,32,0.8); line-height:1.6; margin-bottom:1.5rem; }
        @media(max-width:768px) {
          .arena { grid-template-columns:1fr; }
          .arena-sep { display:none; }
          .arena-col-a,.arena-col-b { padding:0; }
          .vote-cards { grid-template-columns:1fr; }
        }
      `}</style>

      {/* Hero */}
      <div className="dv-hero">
        <div className="dv-glow-a" /><div className="dv-glow-b" />
        <div className="container-sm">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/debates" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>← Debates</Link>
            {debate.topic && <span className="badge badge-muted">{debate.topic.icon} {debate.topic.name}</span>}
            <span className="badge" style={{ background: debate.status === 'open' ? 'rgba(34,217,107,0.1)' : 'rgba(255,64,64,0.1)', color: debate.status === 'open' ? '#22D96B' : '#FF4040', border: `0.5px solid ${debate.status === 'open' ? 'rgba(34,217,107,0.2)' : 'rgba(255,64,64,0.2)'}` }}>
              {debate.status}
            </span>
          </div>
          <h1 className="dv-title">{debate.title}</h1>
          {debate.description && <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75, maxWidth: 640, marginBottom: '1.5rem' }}>{debate.description}</p>}

          {/* VOTE CARDS */}
          {debate.status === 'open' && (
            <>
              {debate.votesHidden && !sideChosen && (
                <div className="anti-bias-note">
                  ◑ Vote counts are hidden until you choose a side — this prevents anchoring bias. Pick your position first.
                </div>
              )}
              <div className="vote-cards">
                {[['A', debate.sideA, '#1A5EFF', pctA], ['B', debate.sideB, '#FF6B1A', pctB]].map(([s, side, color, pct]) => (
                  <button key={s} className={`vote-card vote-card-${s.toLowerCase()}${sideChosen === s ? ` chosen-${s.toLowerCase()}` : ''}`}
                    onClick={() => castVote(s)} disabled={!user}>
                    <div className="vote-side-label" style={{ color }}>{sideChosen === s ? '✓ ' : ''}Side {s}</div>
                    <div className="vote-side-title">{side?.label}</div>
                    {side?.description && <div className="vote-side-desc">{side.description}</div>}
                    {pct !== null && <div className="vote-pct" style={{ color }}>{pct}%</div>}
                    {pct === null && sideChosen && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>{side?.voteCount ?? 0} votes</div>}
                  </button>
                ))}
              </div>
              {!user && <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: '1.5rem' }}>
                <Link to="/login" style={{ color: '#1A5EFF' }}>Sign in</Link> to vote and post arguments
              </p>}
            </>
          )}
        </div>
      </div>

      {/* Score panel */}
      <div className="container-sm" style={{ marginTop: '2rem' }}>
        <div className="score-panel">
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1.25rem' }}>Argument strength score</p>
          <div className="score-row">
            <span className="score-side-lbl text-a">Side A</span>
            <div className="score-track"><div className="score-fill-a" style={{ width: `${debate.strengthScoreA || 0}%` }} /></div>
            <span className="score-num text-a">{debate.strengthScoreA || 0}</span>
          </div>
          <div className="score-row">
            <span className="score-side-lbl text-b">Side B</span>
            <div className="score-track"><div className="score-fill-b" style={{ width: `${debate.strengthScoreB || 0}%` }} /></div>
            <span className="score-num text-b">{debate.strengthScoreB || 0}</span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: '0.75rem', fontStyle: 'italic', lineHeight: 1.6 }}>
            Score reflects logic clarity (30), evidence quality (30), and fact-check engagement (40). Not popularity.
          </p>
        </div>

        {/* Post argument form */}
        {user && sideChosen && debate.status === 'open' && !hasPosted && (
          <div className="form-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500 }}>Post your argument for <span style={{ color: sideChosen === 'A' ? '#1A5EFF' : '#FF6B1A' }}>Side {sideChosen}</span></p>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>One argument per debate. Make it count.</p>
              </div>
              <button className={`btn btn-sm ${sideChosen === 'A' ? 'btn-primary' : 'btn-orange'}`} onClick={() => setShowForm(s => !s)}>
                {showForm ? 'Cancel' : '+ Add argument'}
              </button>
            </div>
            <AnimatePresence>
              {showForm && (
                <motion.div className="form-grid" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div>
                    <label>Your claim <span style={{ color: 'var(--muted)' }}>(max 150 chars)</span></label>
                    <input value={form.claim} onChange={e => setForm(p => ({ ...p, claim: e.target.value }))} maxLength={150} placeholder="State your main point clearly and concisely…" />
                    <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>{form.claim.length}/150</p>
                  </div>
                  <div>
                    <label>Explanation</label>
                    <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} maxLength={2000} rows={5} placeholder="Explain your reasoning in detail. Strong arguments are logical, clear, and specific…" />
                  </div>
                  <div>
                    <label>Sources <span style={{ color: 'var(--muted)' }}>(optional — one URL per line)</span></label>
                    <textarea value={form.sources} onChange={e => setForm(p => ({ ...p, sources: e.target.value }))} rows={3} placeholder="https://example.com/article&#10;https://research.org/paper" style={{ fontFamily: 'monospace', fontSize: 12 }} />
                  </div>
                  <button className={`btn ${sideChosen === 'A' ? 'btn-primary' : 'btn-orange'}`} onClick={submitArg} disabled={submitting} style={{ justifySelf: 'start' }}>
                    {submitting ? 'Posting…' : 'Submit argument'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Argument arena */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>Arguments</p>
            <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{argsA.length + argsB.length} total</span>
          </div>

          {argsA.length === 0 && argsB.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: 40, marginBottom: '1rem' }}>◑</div>
              <p>No arguments yet. {user && sideChosen ? 'Be the first!' : 'Choose a side to participate.'}</p>
            </div>
          ) : (
            <div className="arena">
              <div className="arena-col arena-col-a">
                <div className="col-header">
                  <div className="col-header-dot" style={{ background: '#1A5EFF' }} />
                  <span className="col-header-label text-a">Side A — {debate.sideA?.label}</span>
                  <span className="badge badge-a" style={{ marginLeft: 'auto' }}>{argsA.length}</span>
                </div>
                {argsA.map((a, i) => <ArgCard key={a._id} arg={a} side="A" user={user} onFactCheck={factCheck} delay={i * 0.06} />)}
              </div>

              <div className="arena-sep">
                <div className="arena-sep-dot" /><div className="arena-sep-line" />
              </div>

              <div className="arena-col arena-col-b">
                <div className="col-header">
                  <div className="col-header-dot" style={{ background: '#FF6B1A' }} />
                  <span className="col-header-label text-b">Side B — {debate.sideB?.label}</span>
                  <span className="badge badge-b" style={{ marginLeft: 'auto' }}>{argsB.length}</span>
                </div>
                {argsB.map((a, i) => <ArgCard key={a._id} arg={a} side="B" user={user} onFactCheck={factCheck} delay={i * 0.06} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ArgCard({ arg, side, user, onFactCheck, delay }) {
  const qt = arg.qualityTier || 'moderate';
  const qm = QUALITY_MAP[qt] || QUALITY_MAP.moderate;
  const myFC = user ? arg.factChecks?.find(f => f.checkedBy === user._id || f.checkedBy?._id === user._id) : null;
  const isOwn = user && (arg.author?._id === user._id || arg.author === user._id);

  return (
    <motion.div className={`arg-card side-${side.toLowerCase()}`}
      initial={{ opacity: 0, x: side === 'A' ? -16 : 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}>
      <div className="arg-claim">{arg.claim}</div>
      <div className="arg-body">{arg.content}</div>
      {arg.sources?.length > 0 && (
        <div className="arg-sources">
          {arg.sources.map((s, i) => (
            <a key={i} href={s} target="_blank" rel="noopener noreferrer" className="arg-source-link">↗ {s}</a>
          ))}
        </div>
      )}
      <div className="arg-footer" style={{ marginTop: arg.sources?.length ? 10 : 0 }}>
        <span className={`badge ${qm.cls}`}>{qm.label}</span>
        <span className="arg-author">@{arg.author?.username || 'anon'}</span>
        {user && !isOwn && (
          <div className="fc-btns">
            <button className="fc-btn fc-btn-correct" title="Mark as well-reasoned / evidenced" onClick={() => onFactCheck(arg._id, 'correct')} disabled={myFC?.verdict === 'correct'}>
              ✓ {arg.factChecks?.filter(f => f.verdict === 'correct').length || 0}
            </button>
            <button className="fc-btn fc-btn-false" title="Mark as weak / unsupported" onClick={() => onFactCheck(arg._id, 'false')} disabled={myFC?.verdict === 'false'}>
              ✗ {arg.factChecks?.filter(f => f.verdict === 'false').length || 0}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
