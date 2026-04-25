import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

/* ── tiny hook for intersection ── */
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
};

const FadeUp = ({ children, delay = 0, className = '' }) => {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.7s ${delay}s ease, transform 0.7s ${delay}s ease`,
    }}>{children}</div>
  );
};

export default function Home() {
  const [debates, setDebates] = useState([]);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);

  useEffect(() => {
    api.get('/debates?limit=3&sort=hot').then(r => setDebates(r.data.debates || [])).catch(() => {});
  }, []);

  return (
    <div style={{ paddingTop: 0 }}>
      <style>{`
        .home-hero {
          min-height: 100vh; display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          position:relative; overflow:hidden; padding:7rem 2rem 4rem;
          text-align:center;
        }
        .hero-glow-a {
          position:absolute; top:-10%; left:-15%; width:60%; height:120%;
          background:radial-gradient(ellipse at 30% 50%, rgba(26,94,255,0.11) 0%, transparent 65%);
          pointer-events:none;
        }
        .hero-glow-b {
          position:absolute; top:-10%; right:-15%; width:60%; height:120%;
          background:radial-gradient(ellipse at 70% 50%, rgba(255,107,26,0.11) 0%, transparent 65%);
          pointer-events:none;
        }
        .hero-grid {
          position:absolute; inset:0; pointer-events:none;
          background-image: linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px);
          background-size:72px 72px;
          mask-image:radial-gradient(ellipse at center, black 15%, transparent 72%);
        }
        .hero-eyebrow {
          font-size:11px; font-weight:500; letter-spacing:0.22em; text-transform:uppercase;
          color:rgba(242,240,250,0.4); margin-bottom:2rem;
          animation: sbsFadeUp 0.8s 0.1s ease both;
        }
        .hero-title {
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(72px,13vw,152px);
          line-height:0.88; letter-spacing:5px;
          animation: sbsFadeUp 0.9s 0.3s ease both;
        }
        .hero-title .ht-a { color:#1A5EFF; display:block; }
        .hero-title .ht-by {
          font-family:'DM Serif Display',serif; font-size:0.25em;
          font-style:italic; letter-spacing:0.15em; color:rgba(242,240,250,0.35);
          display:block; margin:0.4em 0 0.15em;
        }
        .hero-title .ht-b { color:#FF6B1A; display:block; }
        .hero-line {
          width:100%; max-width:560px; height:1px; margin:2rem auto;
          background:linear-gradient(90deg,transparent,#1A5EFF,#FF6B1A,transparent);
          animation: sbsFadeIn 1s 0.9s ease both;
        }
        .hero-tagline {
          font-size:clamp(14px,1.8vw,18px); color:rgba(242,240,250,0.5);
          max-width:380px; line-height:1.75; font-weight:300;
          animation: sbsFadeUp 0.8s 1.1s ease both;
        }
        .hero-ctas {
          display:flex; gap:1rem; margin-top:3rem; justify-content:center; flex-wrap:wrap;
          animation: sbsFadeUp 0.8s 1.3s ease both;
        }
        .hero-scroll {
          position:absolute; bottom:2.5rem; display:flex; flex-direction:column;
          align-items:center; gap:8px;
          animation: sbsFadeIn 1s 2s ease both;
        }
        .hero-scroll span { font-size:9px; letter-spacing:0.22em; text-transform:uppercase; color:rgba(242,240,250,0.3); }
        .hero-scroll-line { width:1px; height:44px; background:linear-gradient(180deg,rgba(242,240,250,0.3),transparent); animation:scrollPulse 2.2s infinite; }

        /* Marquee */
        .marquee-wrap { overflow:hidden; border-top:0.5px solid rgba(255,255,255,0.07); border-bottom:0.5px solid rgba(255,255,255,0.07); padding:1.25rem 0; }
        .marquee-track { display:flex; gap:2.5rem; width:max-content; animation:marqueeX 28s linear infinite; }
        .marquee-item { font-family:'Bebas Neue',sans-serif; font-size:16px; letter-spacing:3px; color:rgba(242,240,250,0.3); white-space:nowrap; display:flex; align-items:center; gap:1rem; }
        .mq-dot { width:5px; height:5px; border-radius:50%; }

        /* Split section */
        .split-section { display:grid; grid-template-columns:1fr 1fr; min-height:80vh; }
        .split-half { padding:6rem 4rem; display:flex; flex-direction:column; justify-content:center; position:relative; overflow:hidden; transition:background 0.4s; }
        .split-half-a { border-right:0.5px solid rgba(255,255,255,0.06); }
        .split-half-a:hover { background:rgba(26,94,255,0.04); }
        .split-half-b:hover { background:rgba(255,107,26,0.04); }
        .split-big { font-family:'Bebas Neue',sans-serif; font-size:clamp(56px,8vw,100px); line-height:1; letter-spacing:3px; }
        .split-body { font-size:15px; color:rgba(242,240,250,0.5); line-height:1.8; max-width:360px; margin-top:1.25rem; }

        /* Feature cards */
        .feature-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0; background:rgba(255,255,255,0.06); border:0.5px solid rgba(255,255,255,0.07); border-radius:18px; overflow:hidden; }
        .feat-card { background:#0F0F18; padding:2.25rem 2rem; position:relative; overflow:hidden; border-right:0.5px solid rgba(255,255,255,0.06); border-bottom:0.5px solid rgba(255,255,255,0.06); transition:background 0.2s; }
        .feat-card:hover { background:#16161F; }
        .feat-card:nth-child(3n) { border-right:none; }
        .feat-card:nth-last-child(-n+3) { border-bottom:none; }
        .feat-num { position:absolute; top:1.5rem; right:1.5rem; font-family:'Bebas Neue',sans-serif; font-size:56px; color:rgba(255,255,255,0.025); line-height:1; }
        .feat-icon { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:16px; margin-bottom:1.25rem; border:0.5px solid; }
        .feat-icon-a { background:rgba(26,94,255,0.1); border-color:rgba(26,94,255,0.2); }
        .feat-icon-b { background:rgba(255,107,26,0.1); border-color:rgba(255,107,26,0.2); }
        .feat-icon-n { background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.08); }
        .feat-title { font-size:15px; font-weight:500; margin-bottom:0.6rem; color:#F2F0FA; }
        .feat-desc { font-size:13px; color:rgba(242,240,250,0.45); line-height:1.7; }

        /* Hot debates */
        .debate-card-home {
          background:#0F0F18; border:0.5px solid rgba(255,255,255,0.07);
          border-radius:16px; padding:1.5rem; transition:all 0.2s;
          cursor:pointer; text-decoration:none; display:block;
        }
        .debate-card-home:hover { border-color:rgba(255,255,255,0.14); transform:translateY(-2px); }
        .dch-topic { font-size:10px; font-weight:500; letter-spacing:0.15em; text-transform:uppercase; color:rgba(242,240,250,0.35); margin-bottom:0.75rem; }
        .dch-title { font-family:'DM Serif Display',serif; font-size:18px; line-height:1.4; color:#F2F0FA; margin-bottom:1.25rem; }
        .dch-sides { display:flex; gap:6px; margin-bottom:1rem; flex-wrap:wrap; }
        .dch-bar { display:flex; gap:8px; align-items:center; margin-top:auto; }
        .dch-bar-track { flex:1; height:3px; background:rgba(255,255,255,0.06); border-radius:99px; overflow:hidden; }
        .dch-fill-a { height:100%; background:#1A5EFF; border-radius:99px; }
        .dch-fill-b { height:100%; background:#FF6B1A; border-radius:99px; float:right; }
        .dch-count { font-size:11px; color:rgba(242,240,250,0.35); }

        /* CTA */
        .home-cta { padding:10rem 2rem; text-align:center; position:relative; overflow:hidden; border-top:0.5px solid rgba(255,255,255,0.07); }
        .home-cta-glow { position:absolute; inset:0; pointer-events:none; background:radial-gradient(ellipse at 50% 80%, rgba(26,94,255,0.07) 0%, transparent 60%); }
        .cta-big { font-family:'Bebas Neue',sans-serif; font-size:clamp(44px,8vw,100px); letter-spacing:4px; line-height:1; margin-bottom:1.5rem; }

        @keyframes sbsFadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
        @keyframes sbsFadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes scrollPulse { 0%,100% { opacity:0.2; } 50% { opacity:0.8; } }
        @keyframes marqueeX { to { transform:translateX(-50%); } }

        @media(max-width:768px) {
          .split-section { grid-template-columns:1fr; }
          .split-half { padding:4rem 2rem; }
          .feature-grid { grid-template-columns:1fr; }
          .feat-card:nth-child(n) { border-right:none; }
        }
      `}</style>

      {/* HERO */}
      <motion.section className="home-hero" style={{ y: heroY }}>
        <div className="hero-glow-a" />
        <div className="hero-glow-b" />
        <div className="hero-grid" />

        <p className="hero-eyebrow">Structured debate platform</p>
        <h1 className="hero-title">
          <span className="ht-a">SIDE</span>
          <span className="ht-by">by</span>
          <span className="ht-b">SIDE</span>
        </h1>
        <div className="hero-line" />
        <p className="hero-tagline">See both sides. Think better.</p>
        <div className="hero-ctas">
          <Link to="/debates" className="btn btn-primary" style={{ fontSize: 15, padding: '13px 30px' }}>Explore debates</Link>
          <Link to="/register" className="btn btn-ghost" style={{ fontSize: 15, padding: '13px 30px' }}>Join the discussion</Link>
        </div>
        <div className="hero-scroll">
          <span>scroll</span>
          <div className="hero-scroll-line" />
        </div>
      </motion.section>

      {/* MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            ['Critical thinking', 'Structured debate', 'No bias', 'Evidence-based', 'Argument scoring', 'Two perspectives', 'Decision support', 'No winners declared'].map((t, j) => (
              <div key={`${i}-${j}`} className="marquee-item">
                <div className="mq-dot" style={{ background: j % 2 === 0 ? '#1A5EFF' : '#FF6B1A' }} />
                {t}
              </div>
            ))
          ))}
        </div>
      </div>

      {/* SPLIT */}
      <section className="split-section">
        <div className="split-half split-half-a">
          <FadeUp>
            <span className="badge badge-a" style={{ marginBottom: '1.25rem' }}>Side A</span>
            <div className="split-big text-a">Every argument needs a claim.</div>
            <p className="split-body">Side A contributors build structured arguments — Claim, Explanation, Evidence. No opinions without reasoning.</p>
          </FadeUp>
        </div>
        <div className="split-half split-half-b">
          <FadeUp delay={0.15}>
            <span className="badge badge-b" style={{ marginBottom: '1.25rem' }}>Side B</span>
            <div className="split-big text-b">The other side gets equal weight.</div>
            <p className="split-body">Side B gets identical structure, identical scoring, identical visibility. Only reasoning quality differs — never design.</p>
          </FadeUp>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '8rem 2rem' }}>
        <div className="container">
          <FadeUp><p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center', marginBottom: '0.75rem' }}>The system</p></FadeUp>
          <FadeUp delay={0.1}><h2 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(40px,6vw,72px)', letterSpacing: 3, textAlign: 'center', marginBottom: '4rem' }}>How it works</h2></FadeUp>
          <FadeUp delay={0.2}>
            <div className="feature-grid">
              {FEATURES.map((f, i) => (
                <div key={i} className="feat-card">
                  <span className="feat-num">0{i + 1}</span>
                  <div className={`feat-icon feat-icon-${f.ic}`}>{f.icon}</div>
                  <div className="feat-title">{f.title}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* HOT DEBATES */}
      {debates.length > 0 && (
        <section style={{ padding: '0 2rem 8rem' }}>
          <div className="container">
            <FadeUp><p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.75rem' }}>Trending now</p></FadeUp>
            <FadeUp delay={0.1}><h2 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(36px,5vw,60px)', letterSpacing: 3, marginBottom: '2.5rem' }}>Hot debates</h2></FadeUp>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
              {debates.map((d, i) => (
                <FadeUp key={d._id} delay={i * 0.1}>
                  <Link to={`/debates/${d._id}`} className="debate-card-home">
                    <div className="dch-topic">{d.topic?.name || 'General'}</div>
                    <div className="dch-title">{d.title}</div>
                    <div className="dch-sides">
                      <span className="badge badge-a">{d.sideA?.label}</span>
                      <span className="badge badge-b">{d.sideB?.label}</span>
                    </div>
                    <div className="dch-bar">
                      <div className="dch-bar-track">
                        <div className="dch-fill-a" style={{ width: `${d.strengthScoreA || 50}%` }} />
                      </div>
                      <span className="dch-count">{d.totalArguments} args</span>
                    </div>
                  </Link>
                </FadeUp>
              ))}
            </div>
            <FadeUp delay={0.3}>
              <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                <Link to="/debates" className="btn btn-ghost">View all debates →</Link>
              </div>
            </FadeUp>
          </div>
        </section>
      )}

      {/* COLOR LEGEND */}
      <section style={{ padding: '0 2rem 8rem' }}>
        <div className="container-sm">
          <FadeUp>
            <div style={{ background: '#0F0F18', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <p style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 2, marginBottom: '1.5rem' }}>Color semantics</p>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>Every color on SideBySide carries a specific, intentional meaning. Nothing is decorative.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { color: '#1A5EFF', label: 'Blue = Side A always' },
                    { color: '#FF6B1A', label: 'Orange = Side B always' },
                    { color: '#22D96B', label: 'Green = argument is strong' },
                    { color: '#FFB020', label: 'Amber = argument is moderate' },
                    { color: '#FF4040', label: 'Red = argument is weak' },
                  ].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--muted)' }}>
                      <div style={{ width: 24, height: 6, borderRadius: 99, background: color, flexShrink: 0 }} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(26,94,255,0.08)', border: '0.5px solid rgba(26,94,255,0.2)', borderRadius: 12, padding: '1.25rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1A5EFF', marginBottom: 6 }}>No winner declared</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65 }}>SideBySide scores argument quality — not truth. The conclusion is always yours to reach.</div>
                </div>
                <div style={{ background: 'rgba(255,107,26,0.08)', border: '0.5px solid rgba(255,107,26,0.2)', borderRadius: 12, padding: '1.25rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FF6B1A', marginBottom: 6 }}>No popularity votes</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65 }}>Arguments are scored on logic, evidence, and fact-checks — never on how many people liked them.</div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div className="home-cta-glow" />
        <FadeUp><p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem' }}>Ready to think?</p></FadeUp>
        <FadeUp delay={0.1}>
          <div className="cta-big">
            <span style={{ color: '#1A5EFF' }}>SEE</span> BOTH<br />
            <span style={{ color: '#FF6B1A' }}>THINK</span> BETTER
          </div>
        </FadeUp>
        <FadeUp delay={0.2}><p style={{ fontSize: 16, color: 'var(--muted)', marginBottom: '2.5rem' }}>Join structured debates. Contribute quality arguments. Reach your own conclusions.</p></FadeUp>
        <FadeUp delay={0.3}>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ fontSize: 15, padding: '13px 32px' }}>Get started free</Link>
            <Link to="/debates" className="btn btn-ghost" style={{ fontSize: 15, padding: '13px 32px' }}>Browse debates</Link>
          </div>
        </FadeUp>
      </section>

      <footer style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)', padding: '2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 2 }}>
          <span style={{ color: '#1A5EFF' }}>Side</span>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>/</span>
          <span style={{ color: '#FF6B1A' }}>Side</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>© 2025 SideBySide — See both sides.</p>
      </footer>
    </div>
  );
}

const FEATURES = [
  { icon: '⚖', ic: 'a', title: 'Structured arguments only', desc: 'Every contribution has a Claim, Explanation, and optional Evidence — making it comparable and evaluable.' },
  { icon: '◑', ic: 'b', title: 'Visual side-by-side layout', desc: 'Blue vs Orange. Both sides displayed with identical visual weight, challenging you to read both.' },
  { icon: '◈', ic: 'n', title: 'Argument strength scoring', desc: 'Arguments scored on logical clarity, evidence presence, and fact-checks — never popularity.' },
  { icon: '⬡', ic: 'a', title: 'No winners declared', desc: 'The platform tells you which side argued better. The conclusion is always yours to reach.' },
  { icon: '◎', ic: 'b', title: 'Anti-algorithm design', desc: 'No engagement-optimized feeds. Topics organized by debate quality, not virality.' },
  { icon: '◇', ic: 'n', title: 'Strict color semantics', desc: 'Blue = A. Orange = B. Green/Red = quality only. Color is never decorative here.' },
];
