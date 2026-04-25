import { useEffect, useRef } from 'react';

export default function Cursor() {
  const dot  = useRef(null);
  const ring = useRef(null);
  const mx = useRef(0), my = useRef(0);
  const rx = useRef(0), ry = useRef(0);
  const raf = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      mx.current = e.clientX;
      my.current = e.clientY;
      if (dot.current) {
        dot.current.style.left = e.clientX + 'px';
        dot.current.style.top  = e.clientY + 'px';
      }
    };

    const animate = () => {
      rx.current += (mx.current - rx.current) * 0.1;
      ry.current += (my.current - ry.current) * 0.1;
      if (ring.current) {
        ring.current.style.left = rx.current + 'px';
        ring.current.style.top  = ry.current + 'px';
      }
      raf.current = requestAnimationFrame(animate);
    };

    const onEnter = () => { if (ring.current) ring.current.classList.add('hover'); };
    const onLeave = () => { if (ring.current) ring.current.classList.remove('hover'); };

    document.addEventListener('mousemove', onMove);
    document.querySelectorAll('a,button,[data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    raf.current = requestAnimationFrame(animate);
    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <style>{`
        @media (pointer: coarse) { #sbs-cursor, #sbs-ring { display: none; } }
        #sbs-cursor {
          position: fixed; width: 8px; height: 8px;
          background: #F2F0FA; border-radius: 50%;
          pointer-events: none; z-index: 99999;
          transform: translate(-50%,-50%);
          mix-blend-mode: difference; transition: opacity 0.2s;
        }
        #sbs-ring {
          position: fixed; width: 36px; height: 36px;
          border: 1px solid rgba(242,240,250,0.25);
          border-radius: 50%; pointer-events: none; z-index: 99998;
          transform: translate(-50%,-50%);
          transition: width 0.25s, height 0.25s, border-color 0.25s;
        }
        #sbs-ring.hover { width: 56px; height: 56px; border-color: rgba(26,94,255,0.6); }
      `}</style>
      <div id="sbs-cursor" ref={dot} />
      <div id="sbs-ring"   ref={ring} />
    </>
  );
}
