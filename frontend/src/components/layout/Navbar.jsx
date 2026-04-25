import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../context/authStore';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <style>{`
        .sbs-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 500;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 2.5rem;
          transition: background 0.35s, backdrop-filter 0.35s, border-color 0.35s;
          border-bottom: 0.5px solid transparent;
        }
        .sbs-nav.scrolled {
          background: rgba(8,8,14,0.88);
          backdrop-filter: blur(16px);
          border-bottom-color: rgba(255,255,255,0.07);
        }
        .nav-logo { font-family:'Bebas Neue',sans-serif; font-size:24px; letter-spacing:2px; text-decoration:none; display:flex; align-items:center; }
        .nav-logo .la { color:#1A5EFF; } .nav-logo .sep { color:rgba(255,255,255,0.2); margin:0 1px; } .nav-logo .lb { color:#FF6B1A; }
        .nav-links { display:flex; gap:2rem; align-items:center; }
        .nav-links a { font-size:13px; font-weight:400; color:rgba(242,240,250,0.5); text-decoration:none; transition:color 0.2s; letter-spacing:0.04em; }
        .nav-links a:hover, .nav-links a.active { color:#F2F0FA; }
        .nav-right { display:flex; gap:0.75rem; align-items:center; }
        .nav-avatar {
          width:32px; height:32px; border-radius:50%;
          background:linear-gradient(135deg,#1A5EFF,#FF6B1A);
          display:flex; align-items:center; justify-content:center;
          font-size:12px; font-weight:600; color:#fff; cursor:pointer;
          border:0.5px solid rgba(255,255,255,0.1);
        }
        .nav-user-menu {
          position:absolute; top:calc(100% + 8px); right:0;
          background:#1C1C28; border:0.5px solid rgba(255,255,255,0.1);
          border-radius:12px; padding:6px; min-width:160px;
          box-shadow:0 8px 32px rgba(0,0,0,0.4);
        }
        .nav-user-wrap { position:relative; }
        .nmu-item {
          display:block; padding:8px 12px; font-size:13px; color:rgba(242,240,250,0.7);
          border-radius:8px; cursor:pointer; text-decoration:none;
          transition:background 0.15s, color 0.15s; width:100%; text-align:left;
          background:transparent; border:none; font-family:'Outfit',sans-serif;
        }
        .nmu-item:hover { background:rgba(255,255,255,0.06); color:#F2F0FA; }
        .nmu-item.danger { color:#FF4040; }
        .nmu-item.danger:hover { background:rgba(255,64,64,0.08); }
        .nmu-divider { height:0.5px; background:rgba(255,255,255,0.07); margin:4px 0; }
        @media(max-width:640px) {
          .sbs-nav { padding:1rem 1.25rem; }
          .nav-links { display:none; }
        }
      `}</style>
      <nav className={`sbs-nav${scrolled ? ' scrolled' : ''}`}>
        <Link to="/" className="nav-logo">
          <span className="la">Side</span><span className="sep">/</span><span className="lb">Side</span>
        </Link>

        <div className="nav-links">
          <Link to="/debates" className={location.pathname.startsWith('/debates') ? 'active' : ''}>Explore</Link>
          {user && <Link to="/create">New Debate</Link>}
        </div>

        <div className="nav-right">
          {user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="nav-user-wrap">
      <div className="nav-avatar" onClick={() => setOpen(o => !o)}>
        {user.username?.[0]?.toUpperCase()}
      </div>
      {open && (
        <div className="nav-user-menu">
          <Link to={`/u/${user.username}`} className="nmu-item" onClick={() => setOpen(false)}>
            @{user.username}
          </Link>
          <div className="nmu-divider" />
          <button className="nmu-item danger" onClick={onLogout}>Sign out</button>
        </div>
      )}
    </div>
  );
}
