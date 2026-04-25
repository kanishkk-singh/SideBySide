import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

export default function Debates() {
  const [debates, setDebates] = useState([]);
  const [topics, setTopics]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [params, setParams]   = useSearchParams();

  const topic  = params.get('topic') || '';
  const sort   = params.get('sort')  || 'createdAt';
  const search = params.get('search')|| '';
  const page   = Number(params.get('page') || 1);

  const fetchDebates = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ limit: 12, sort, page, ...(topic && { topic }), ...(search && { search }) });
      const { data } = await api.get(`/debates?${q}`);
      setDebates(data.debates || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  }, [topic, sort, search, page]);

  useEffect(() => {
    api.get('/topics').then(r => setTopics(r.data.topics || [])).catch(() => {});
    fetchDebates();
  }, [fetchDebates]);

  const set = (key, val) => {
    const np = new URLSearchParams(params);
    if (val) np.set(key, val); else np.delete(key);
    np.delete('page');
    setParams(np);
  };

  return (
    <div style={{ paddingTop: '5rem', minHeight: '100vh' }}>
      <style>{`
        .debates-hero { padding:4rem 2rem 2rem; border-bottom:0.5px solid rgba(255,255,255,0.07); }
        .debates-layout { display:grid; grid-template-columns:220px 1fr; gap:2rem; padding:2rem; max-width:1200px; margin:0 auto; }
        .debates-sidebar { position:sticky; top:5rem; height:fit-content; }
        .sidebar-section { margin-bottom:2rem; }
        .sidebar-title { font-size:10px; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; color:rgba(242,240,250,0.35); margin-bottom:0.75rem; }
        .sidebar-item { display:block; padding:8px 12px; border-radius:8px; font-size:13px; color:rgba(242,240,250,0.55); cursor:pointer; transition:all 0.15s; border:none; background:transparent; font-family:'Outfit',sans-serif; width:100%; text-align:left; }
        .sidebar-item:hover, .sidebar-item.active { background:rgba(255,255,255,0.05); color:#F2F0FA; }
        .sidebar-item.active { color:#1A5EFF; }
        .debates-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:1rem; }
        .debate-card {
          background:#0F0F18; border:0.5px solid rgba(255,255,255,0.07);
          border-radius:14px; padding:1.5rem; transition:all 0.2s;
          text-decoration:none; display:flex; flex-direction:column; gap:1rem;
          cursor:pointer;
        }
        .debate-card:hover { border-color:rgba(255,255,255,0.14); transform:translateY(-2px); background:#13131E; }
        .dc-topic { font-size:10px; font-weight:500; letter-spacing:0.15em; text-transform:uppercase; color:rgba(242,240,250,0.3); }
        .dc-title { font-family:'DM Serif Display',serif; font-size:17px; line-height:1.4; color:#F2F0FA; flex:1; }
        .dc-sides { display:flex; gap:6px; flex-wrap:wrap; }
        .dc-meta { display:flex; align-items:center; justify-content:space-between; }
        .dc-scores { display:flex; flex-direction:column; gap:5px; margin-top:4px; }
        .dc-score-row { display:flex; align-items:center; gap:8px; }
        .dc-score-label { font-size:10px; font-weight:500; width:10px; }
        .dc-score-track { flex:1; height:3px; background:rgba(255,255,255,0.06); border-radius:99px; overflow:hidden; }
        .dc-score-fill-a { height:100%; background:#1A5EFF; border-radius:99px; }
        .dc-score-fill-b { height:100%; background:#FF6B1A; border-radius:99px; }
        .dc-score-num { font-size:10px; color:rgba(242,240,250,0.35); width:20px; text-align:right; }
        .search-input { background:rgba(255,255,255,0.04); border:0.5px solid rgba(255,255,255,0.08); border-radius:99px; padding:9px 16px; font-size:13px; color:#F2F0FA; font-family:'Outfit',sans-serif; outline:none; width:260px; }
        .search-input:focus { border-color:rgba(26,94,255,0.4); }
        .search-input::placeholder { color:rgba(242,240,250,0.25); }
        .sort-tabs { display:flex; gap:4px; }
        .sort-tab { padding:6px 14px; border-radius:99px; font-size:12px; font-weight:400; cursor:pointer; border:0.5px solid transparent; transition:all 0.15s; font-family:'Outfit',sans-serif; background:transparent; color:rgba(242,240,250,0.45); }
        .sort-tab.active { background:rgba(255,255,255,0.07); color:#F2F0FA; border-color:rgba(255,255,255,0.1); }
        .debates-toolbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem; }
        .status-dot { width:6px; height:6px; border-radius:50%; background:#22D96B; display:inline-block; margin-right:5px; }
        @media(max-width:768px) { .debates-layout { grid-template-columns:1fr; } .debates-sidebar { position:static; } }
      `}</style>

      <div className="debates-hero">
        <div className="container">
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.5rem' }}>Browse</p>
          <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(40px,6vw,72px)', letterSpacing: 3, marginBottom: '1.5rem' }}>
            All <span style={{ color: '#1A5EFF' }}>debates</span>
          </h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input className="search-input" placeholder="Search debates..." defaultValue={search}
              onKeyDown={e => { if (e.key === 'Enter') set('search', e.target.value); }} />
            <div className="sort-tabs">
              {[['createdAt','Latest'],['hot','Hot'],['votes','Most voted']].map(([v,l]) => (
                <button key={v} className={`sort-tab${sort===v?' active':''}`} onClick={() => set('sort', v)}>{l}</button>
              ))}
            </div>
            <Link to="/create" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>+ New debate</Link>
          </div>
        </div>
      </div>

      <div className="debates-layout">
        {/* Sidebar */}
        <aside className="debates-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">Topics</div>
            <button className={`sidebar-item${!topic?' active':''}`} onClick={() => set('topic', '')}>All topics</button>
            {topics.map(t => (
              <button key={t._id} className={`sidebar-item${topic===t._id?' active':''}`} onClick={() => set('topic', t._id)}>
                <span style={{ marginRight: 6 }}>{t.icon}</span>{t.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main>
          <div className="debates-toolbar">
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              {loading ? 'Loading...' : `${total} debate${total !== 1 ? 's' : ''}`}
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ background: '#0F0F18', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.5rem', height: 200, opacity: 0.5 }} />
              ))}
            </div>
          ) : debates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: 48, marginBottom: '1rem' }}>◈</div>
              <p>No debates found. <Link to="/create" style={{ color: '#1A5EFF' }}>Start one?</Link></p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="debates-grid">
                {debates.map((d, i) => (
                  <motion.div key={d._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link to={`/debates/${d._id}`} className="debate-card">
                      <div className="dc-topic">
                        <span className="status-dot" style={{ background: d.status === 'open' ? '#22D96B' : '#FF4040' }} />
                        {d.topic?.name || 'General'}
                      </div>
                      <div className="dc-title">{d.title}</div>
                      <div className="dc-sides">
                        <span className="badge badge-a">{d.sideA?.label}</span>
                        <span className="badge badge-b">{d.sideB?.label}</span>
                      </div>
                      <div className="dc-scores">
                        <div className="dc-score-row">
                          <span className="dc-score-label text-a">A</span>
                          <div className="dc-score-track"><div className="dc-score-fill-a" style={{ width: `${d.strengthScoreA || 0}%` }} /></div>
                          <span className="dc-score-num">{d.strengthScoreA || 0}</span>
                        </div>
                        <div className="dc-score-row">
                          <span className="dc-score-label text-b">B</span>
                          <div className="dc-score-track"><div className="dc-score-fill-b" style={{ width: `${d.strengthScoreB || 0}%` }} /></div>
                          <span className="dc-score-num">{d.strengthScoreB || 0}</span>
                        </div>
                      </div>
                      <div className="dc-meta">
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{d.totalArguments} arguments · {d.totalVotes ?? '—'} votes</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{d.creator?.username}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}

          {/* Pagination */}
          {total > 12 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              {page > 1 && <button className="btn btn-ghost btn-sm" onClick={() => set('page', page - 1)}>← Prev</button>}
              <span style={{ fontSize: 13, color: 'var(--muted)', padding: '7px 12px' }}>Page {page}</span>
              {debates.length === 12 && <button className="btn btn-ghost btn-sm" onClick={() => set('page', page + 1)}>Next →</button>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
