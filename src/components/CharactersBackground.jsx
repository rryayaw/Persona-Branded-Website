import { useEffect, useRef } from 'react';

const BASE_W = 1920;
const BASE_H = 1080;

// index 0 = P5 (helicopter), 1 = P4 (sparkle), 2 = P3 (wind)
const BGS = [
  '/assets/charbg-p5.png',
  '/assets/charbg-p4.jpg',
  '/assets/charbg-p3.jpg',
];
const EFFECT = [0, 1, 2];

function makeRand(seed) {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0xffffffff; };
}

// Effect 0: helicopter spotlights (P5)
const SPOTLIGHTS = [
  { speed:  0.00022, spread: 0.18, reach: 1.15, alpha: 0.08,  phase: 0,        originNX: 0.2 },
  { speed: -0.00018, spread: 0.15, reach: 1.2,  alpha: 0.075, phase: Math.PI,  originNX: 0.8 },
];

// Effect 1: drifting star sparkles (P4)
const PARTICLES = Array.from({ length: 80 }, (_, i) => {
  const rand = makeRand(i * 53 + 11);
  const ang = rand() * Math.PI * 2;
  const spd = 0.00002 + rand() * 0.00006;
  return {
    nx: rand(), ny: rand(),
    vx: Math.cos(ang) * spd,
    vy: Math.sin(ang) * spd,
    size: 1.4 + rand() * 3.2,
    phase: rand() * Math.PI * 2,
    twinkle: 0.6 + rand() * 1.6,
  };
});

// Effect 2: wind streaks (P3)
const WIND = Array.from({ length: 46 }, (_, i) => {
  const rand = makeRand(i * 71 + 5);
  return {
    ny:      rand(),
    speed:   0.00018 + rand() * 0.00042, // fraction of width per ms
    len:     0.10 + rand() * 0.22,
    thick:   0.6 + rand() * 1.8,
    opacity: 0.05 + rand() * 0.14,
    wobAmp:  0.004 + rand() * 0.018,
    wobSpd:  0.0008 + rand() * 0.002,
    phase:   rand() * Math.PI * 2,
  };
});

export default function CharactersBackground({ activeIndex = 0 }) {
  const canvasRef = useRef(null);
  const targetRef = useRef(activeIndex);

  useEffect(() => { targetRef.current = activeIndex; }, [activeIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W, H, scale, animId;
    const sc = (v) => v * scale;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      scale = Math.min(W / BASE_W, H / BASE_H);
    }
    resize();
    window.addEventListener('resize', resize);

    const intensity = [0, 0, 0];
    const part = PARTICLES.map(p => ({ x: p.nx, y: p.ny }));
    const wind = WIND.map(w => ({ x: Math.random() })); // live x positions

    // Effect 0
    function drawSpotlights(t, k) {
      if (k <= 0.001) return;
      SPOTLIGHTS.forEach(sp => {
        const sweep = Math.sin(t * sp.speed + sp.phase) * 0.55;
        const centerAngle = Math.PI / 2 + sweep;
        const ox = sp.originNX * W;
        const oy = -sc(10);
        const reach = sp.reach * H;
        const flicker = 0.85 + 0.15 * Math.sin(t * 0.013 + sp.phase * 3.7);
        const alpha = sp.alpha * flicker * k;
        const lx = ox + Math.cos(centerAngle - sp.spread) * reach;
        const ly = oy + Math.sin(centerAngle - sp.spread) * reach;
        const rx = ox + Math.cos(centerAngle + sp.spread) * reach;
        const ry = oy + Math.sin(centerAngle + sp.spread) * reach;
        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, reach);
        grad.addColorStop(0,    `rgba(255,255,255,${alpha * 2.2})`);
        grad.addColorStop(0.35, `rgba(255,255,255,${alpha})`);
        grad.addColorStop(1,    'rgba(255,255,255,0)');
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.moveTo(ox, oy); ctx.lineTo(lx, ly); ctx.lineTo(rx, ry); ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      });
    }

    // Effect 1
    function drawParticles(t, k) {
      if (k <= 0.001) return;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      PARTICLES.forEach((p, i) => {
        const st = part[i];
        st.x += p.vx; st.y += p.vy;
        if (st.x < -0.02) st.x = 1.02; if (st.x > 1.02) st.x = -0.02;
        if (st.y < -0.02) st.y = 1.02; if (st.y > 1.02) st.y = -0.02;
        const tw = 0.45 + 0.55 * Math.sin(t * 0.002 * p.twinkle + p.phase);
        const a = tw * k * 0.9;
        const cx = st.x * W, cy = st.y * H;
        const len = sc(p.size) * (1 + tw * 1.4);
        ctx.globalAlpha = a;
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, len * 2.2);
        glow.addColorStop(0, 'rgba(255,225,140,0.9)');
        glow.addColorStop(1, 'rgba(255,225,140,0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(cx, cy, len * 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,240,190,1)';
        ctx.beginPath();
        ctx.moveTo(cx, cy - len);
        ctx.lineTo(cx + len * 0.22, cy);
        ctx.lineTo(cx, cy + len);
        ctx.lineTo(cx - len * 0.22, cy);
        ctx.closePath(); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - len, cy);
        ctx.lineTo(cx, cy + len * 0.22);
        ctx.lineTo(cx + len, cy);
        ctx.lineTo(cx, cy - len * 0.22);
        ctx.closePath(); ctx.fill();
      });
      ctx.restore();
    }

    // Effect 2: wind
    let lastT = performance.now();
    function drawWind(t, k, dt) {
      if (k <= 0.001) return;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.lineCap = 'round';
      WIND.forEach((w, i) => {
        const st = wind[i];
        st.x += w.speed * dt;
        if (st.x > 1 + w.len) st.x = -w.len;
        const y = (w.ny + Math.sin(t * w.wobSpd + w.phase) * w.wobAmp) * H;
        const x0 = st.x * W;
        const x1 = (st.x + w.len) * W;
        const grad = ctx.createLinearGradient(x0, y, x1, y);
        grad.addColorStop(0,   'rgba(205,228,255,0)');
        grad.addColorStop(0.5, `rgba(205,228,255,${w.opacity * k})`);
        grad.addColorStop(1,   'rgba(205,228,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = w.thick;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.stroke();
      });
      ctx.restore();
    }

    function draw() {
      const t = performance.now();
      const dt = Math.min(t - lastT, 50);
      lastT = t;
      const target = targetRef.current;

      for (let i = 0; i < 3; i++) {
        const goal = EFFECT[target] === i ? 1 : 0;
        intensity[i] += (goal - intensity[i]) * 0.045;
      }

      ctx.clearRect(0, 0, W, H);
      drawWind(t, intensity[2], dt);
      drawParticles(t, intensity[1]);
      drawSpotlights(t, intensity[0]);

      animId = requestAnimationFrame(draw);
    }
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100vw', zIndex: 0, overflow: 'hidden', background: '#000',
      }}
    >
      {BGS.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          draggable={false}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: i === activeIndex ? 1 : 0,
            transition: 'opacity 0.7s ease',
          }}
        />
      ))}
      {/* Darken all backgrounds */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.66)', pointerEvents: 'none' }} />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
    </div>
  );
}
