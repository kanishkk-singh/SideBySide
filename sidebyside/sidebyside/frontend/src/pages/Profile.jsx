import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../lib/api';
import useAuthStore from '../context/authStore';

export default function Profile() {
  const { username } = useParams();
  const { user: me }  = useAuthStore();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [bio, setBio]           = useState('');
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/users/${username}`)
      .then(r => { setProfile(r.data); setBio(r.data.user.bio || ''); })
      .catch(() => toast.error('User not found'))
      .finally(() => setLoading(false));
  }, [username]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.patch('/users/me', { bio });
      setProfile(p => ({ ...p, user: { ...p.user, bio } }));
      setEditing(false);
      toast.success('Profile updated');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  if (loading) return (
    <div style={{ paddingTop: '8rem', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Bebas Neue', fontSize: 40, letterSpacing: 3 }}>
      Loading
    </div>
  );

  if (!profile) return (
    <div style={{ paddingTop: '8rem', textAlign: 'center', color: 'var(--muted)' }}>
      User not found. <Link to="/debates" style={{ color: '#1A5EFF' }}>Back to debates</Link>
    </div>
  );

  const { user, recentDebates = [], recentArguments = [] } = profile;
  const isMe = me?._id === user._id || me?.username === user.username;

  const repColor = user.reputation >= 100 ? '#22D96B' : user.reputation >= 0 ? '#FFB020' : '#FF4040';

  return (
    <div style={{ paddingTop: '5rem', minHeight: '100vh' }}>
      <style>{`
        .profile-hero { padding:3.5rem 2rem 0; position:relative; overflow:hidden; }
        .profile-hero-glow { position:absolute; top:0; left:0; right:0; height:240px; background:linear-gradient(180deg, rgba(26,94,255,0.06) 0%, transparent 100%); pointer-events:none; }
        .profile-avatar { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,#1A5EFF,#FF6B1A); display:flex; align-items:center; justify-content:center; font-family:'Bebas Neue',sans-serif; font-size:28px; color:#fff; letter-spacing:1px; border:2px solid rgba(255,255,255,0.1); flex-shrink:0; }
        .profile-layout { display:grid; grid-template-columns:300px 1fr; gap:2rem; padding:2rem; max-width:1100px; margin:0 auto; }
        .profile-sidebar { position:sticky; top:5.5rem; height:fit-content; }
        .profile-card { background:#0F0F18; border:0.5px solid rgba(255,255,255,0.07); border-radius:16px; padding:1.75rem; margin-bottom:1rem; }
        .stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:rgba(255,255,255,0.07); border-radius:12px; overflow:hidden; margin-top:1.25rem; }
        .stat-cell { background:#0F0F18; padding:1rem; text-align:center; }
        .stat-num { font-family:'Bebas Neue',sans-serif; font-size:32px; letter-spacing:2px; line-height:1; }
        .stat-lbl { font-size:10px; font-weight:500; letter-spacing:0.12em; text-transform:uppercase; color:rgba(242,240,250,0.35); margin-top:3px; }
        .activity-card { background:#0F0F18; border:0.5px solid rgba(255,255,255,0.07); border-radius:14px; padding:1.25rem; margin-bottom:10px; text-decoration:none; display:block; transition:all 0.15s; }
        .activity-card:hover { border-color:rgba(255,255,255,0.14); background:#13131E; }
        .activity-label { font-size:10px; font-weight:500; letter-spacing:0.15em; text-transform:uppercase; color:rgba(242,240,250,0.3); margin-bottom:6px; }
        .activity-title { font-size:14px; color:#F2F0FA; line-height:1.4; }
        .bio-area { width:100%; background:rgba(255,255,255,0.04); border:0.5px solid rgba(26,94,255,0.3); border-radius:10px; padding:10px 14px; font-size:13px; color:#F2F0FA; font-family:'Outfit',sans-serif; resize:vertical; min-height:80px; outline:none; }
        @media(max-width:768px) { .profile-layout { grid-template-columns:1fr; } .profile-sidebar { position:static; } }
      `}</style>

      <div className="profile-hero">
        <div className="profile-hero-glow" />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="profile-avatar">{user.username[0].toUpperCase()}</div>
            <div>
              <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(28px,5vw,52px)', letterSpacing: 3, lineHeight: 1 }}>
                {user.username}
              </h1>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
                {user.role !== 'user' && (
                  <span className="badge badge-a">{user.role}</span>
                )}
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Joined {new Date(user.createdAt).toLocaleDateString('en', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-layout">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-card">
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>About</div>

            {editing ? (
              <>
                <textarea className="bio-area" value={bio} onChange={e => setBio(e.target.value)} maxLength={300} placeholder="Tell others about yourself…" />
                <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setBio(user.bio || ''); }}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: user.bio ? 'var(--text)' : 'var(--muted)', lineHeight: 1.7 }}>
                  {user.bio || 'No bio yet.'}
                </p>
                {isMe && (
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: '1rem' }} onClick={() => setEditing(true)}>Edit bio</button>
                )}
              </>
            )}

            <div className="stat-grid">
              <div className="stat-cell">
                <div className="stat-num" style={{ color: '#1A5EFF' }}>{user.debatesCreated}</div>
                <div className="stat-lbl">Debates</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num" style={{ color: '#FF6B1A' }}>{user.argumentsPosted}</div>
                <div className="stat-lbl">Arguments</div>
              </div>
              <div className="stat-cell" style={{ gridColumn: '1/-1' }}>
                <div className="stat-num" style={{ color: repColor }}>{user.reputation >= 0 ? '+' : ''}{user.reputation}</div>
                <div className="stat-lbl">Reputation</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main>
          {recentDebates.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>
                Recent debates
              </div>
              {recentDebates.map(d => (
                <Link key={d._id} to={`/debates/${d._id}`} className="activity-card">
                  <div className="activity-label">{d.topic?.icon} {d.topic?.name}</div>
                  <div className="activity-title">{d.title}</div>
                </Link>
              ))}
            </motion.div>
          )}

          {recentArguments.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginTop: '2rem' }}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>
                Recent arguments
              </div>
              {recentArguments.map(a => (
                <Link key={a._id} to={`/debates/${a.debate?._id || a.debate}`} className="activity-card">
                  <div className="activity-label">
                    <span className={`badge badge-${a.side === 'A' ? 'a' : 'b'}`} style={{ marginRight: 6 }}>Side {a.side}</span>
                    {a.debate?.title}
                  </div>
                  <div className="activity-title">{a.claim}</div>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>
                    {a.content?.slice(0, 120)}{a.content?.length > 120 ? '…' : ''}
                  </p>
                </Link>
              ))}
            </motion.div>
          )}

          {recentDebates.length === 0 && recentArguments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: 40, marginBottom: '1rem' }}>◑</div>
              <p>No activity yet.</p>
              {isMe && <Link to="/debates" className="btn btn-primary btn-sm" style={{ marginTop: '1.25rem' }}>Explore debates</Link>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
