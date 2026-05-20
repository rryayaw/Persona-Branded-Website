import { useEffect, useRef } from 'react';

// Tunables: js adjust as needed
const DURATION = 1300;     // ms for the full wipe
const JAG_SEGMENTS = 3;    // segments along the bolt → 2–3 sharp edges
const STROKE_LEFT = 28;    // band thickness at the upper-left end (px)
const STROKE_RIGHT = 40;   // band thickness at the lower-right end (px)
const JAG_MAG = 11;        // jag amplitude, in % of viewport height

function makeJagProfile(segments) {
  const profile = [];
  let dir = Math.random() < 0.5 ? 1 : -1;
  for (let i = 0; i <= segments; i++) {
    profile.push(dir * (JAG_MAG - 2 + Math.random() * 4)); // ~9–13%
    dir = -dir;
  }
  return profile;
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function LightningWipe({ onComplete, children }) {
  const clipRef = useRef(null);
  const lineRef = useRef(null);
  const jagRef = useRef();
  if (!jagRef.current) jagRef.current = makeJagProfile(JAG_SEGMENTS);

  useEffect(() => {
    const clipEl = clipRef.current;
    const lineEl = lineRef.current;
    if (!clipEl) return;

    const jag = jagRef.current;
    let raf;
    let start;
    let done = false;

    const frame = (t) => {
      if (start === undefined) start = t;
      const raw = Math.min((t - start) / DURATION, 1);
      const p = easeInOut(raw);

      const W = window.innerWidth;
      const H = window.innerHeight;
      const L = Math.hypot(W, H);

      // Bolt runs along the screen diagonal "\" (top-left → bottom-right);
      // it sweeps along its normal n (up-right), so it advances face-on.
      const dx = W / L, dy = H / L;          // unit vector along the bolt
      const nx = H / L, ny = -W / L;         // unit normal (sweep direction)
      const cx = W / 2, cy = H / 2;          // screen centre

      const S = L * 0.62;                    // half-length of bolt (overshoots screen)
      const OFF = (W * H) / L + 200;         // sweep amplitude (fully off-screen each end)
      const center = OFF * (2 * p - 1);      // bolt offset along n: −OFF → +OFF

      // jag perturbation (px) at normalised position along the bolt
      const jagAt = (u) => (jag[Math.round(u * JAG_SEGMENTS)] / 100) * H;

      // point on the bolt at step i, pushed extra px along the normal
      const pt = (i, push) => {
        const u = i / JAG_SEGMENTS;
        const s = -S + u * 2 * S;
        const off = center + jagAt(u) + push;
        return { x: cx + s * dx + off * nx, y: cy + s * dy + off * ny };
      };

      const BIG = L * 2;
      const ring = [];
      for (let i = 0; i <= JAG_SEGMENTS; i++) ring.push(pt(i, 0));
      const a = pt(JAG_SEGMENTS, 0);
      const b = pt(0, 0);
      ring.push({ x: a.x + BIG * nx, y: a.y + BIG * ny });
      ring.push({ x: b.x + BIG * nx, y: b.y + BIG * ny });
      clipEl.style.clipPath =
        'polygon(' +
        ring
          .map((q) => `${((q.x / W) * 100).toFixed(2)}% ${((q.y / H) * 100).toFixed(2)}%`)
          .join(', ') +
        ')';

      if (lineEl) {
        const thick = (u) => STROKE_LEFT + u * (STROKE_RIGHT - STROKE_LEFT);
        let d = '';
        for (let i = 0; i <= JAG_SEGMENTS; i++) {
          const q = pt(i, thick(i / JAG_SEGMENTS)); // outer edge, pushed into loading
          d += (i === 0 ? 'M' : 'L') + q.x.toFixed(1) + ',' + q.y.toFixed(1) + ' ';
        }
        for (let i = JAG_SEGMENTS; i >= 0; i--) {
          const q = pt(i, -2); // inner edge, just past the reveal boundary
          d += 'L' + q.x.toFixed(1) + ',' + q.y.toFixed(1) + ' ';
        }
        lineEl.setAttribute('d', d + 'Z');
      }

      if (raw < 1) {
        raf = requestAnimationFrame(frame);
      } else if (!done) {
        done = true;
        onComplete();
      }
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return (
    <>
      <div
        ref={clipRef}
        className="fixed inset-0"
        style={{
          zIndex: 200,
          transform: 'translateZ(0)',
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        }}
      >
        {children}
      </div>

      <svg
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 201, width: '100vw', height: '100vh' }}
        preserveAspectRatio="none"
      >
        <path ref={lineRef} d="" fill="#ffffff" stroke="none" />
      </svg>
    </>
  );
}
