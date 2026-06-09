import { useEffect, useRef } from 'react';

const BASE_W = 1920;
const BASE_H = 1080;

// Per-game accent colors (index matches GAMES order in GamesSection)
//  0 = P5 Royal (red), 1 = P4 Golden (yellow), 2 = P3 Reload (blue)
const GAME_RGB = [
  [208, 0, 16],
  [242, 194, 0],
  [30, 110, 220],
];
// Effect per game: 0 = spotlights, 1 = particles, 2 = wave
const GAME_EFFECT = [0, 1, 2];

function makeRand(seed) {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0xffffffff; };
}

// Halftone dot grid
const DOTS = [];
(function buildDots() {
  const rand = makeRand(42);
  const spacing = 30;
  const cols = Math.ceil(BASE_W / spacing) + 2;
  const rows = Math.ceil(BASE_H / spacing) + 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      DOTS.push({
        nx: (c * spacing) / BASE_W,
        ny: (r * spacing) / BASE_H,
        phase: rand() * Math.PI * 2,
        radius: 0.8 + rand() * 0.8,
      });
    }
  }
})();

const SLASHES = [
  { nx: 0.12,  nw: 0.095, opacity: 0.10, skew: -12 },
  { nx: 0.185, nw: 0.028, opacity: 0.06, skew: -12 },
  { nx: 0.72,  nw: 0.055, opacity: 0.05, skew: -12 },
  { nx: 0.78,  nw: 0.018, opacity: 0.04, skew: -12 },
];

const SPOTLIGHTS = [
  { speed:  0.00022, spread: 0.18, reach: 1.15, alpha: 0.08,  phase: 0,        originNX: 0.2 },
  { speed: -0.00018, spread: 0.15, reach: 1.2,  alpha: 0.075, phase: Math.PI,  originNX: 0.8 },
];

// Star/sparkle particles for P4 Golden
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

export default function GamesBackground({ activeIndex = 0 }) {
  const canvasRef = useRef(null);
  const targetRef = useRef(activeIndex);

  useEffect(() => { targetRef.current = activeIndex; }, [activeIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W, H, scale, animId;
    const sc = (v) => v * scale;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      scale = Math.min(W / BASE_W, H / BASE_H);
    }
    resize();
    window.addEventListener('resize', resize);

    // Live, smoothly-interpolated state
    const intensity = [0, 0, 0];            // per-effect 0..1
    const curColor  = [...GAME_RGB[targetRef.current]];
    const part = PARTICLES.map(p => ({ x: p.nx, y: p.ny }));

    function drawBase() {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, W, H);

      // faint color wash from the bottom
      const [r, g, b] = curColor;
      const wash = ctx.createRadialGradient(W * 0.5, H * 1.05, 0, W * 0.5, H * 1.05, H * 1.1);
      wash.addColorStop(0, `rgba(${r},${g},${b},0.16)`);
      wash.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, W, H);
    }

    function drawGrid() {
      ctx.save();
      ctx.globalAlpha = 0.025;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      const gap = sc(120);
      for (let x = 0; x < W; x += gap) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += gap) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.restore();
    }

    function drawDots(t) {
      ctx.save();
      DOTS.forEach(d => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.001 + d.phase);
        ctx.globalAlpha = 0.02 + pulse * 0.03;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(d.nx * W, d.ny * H, sc(d.radius), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    function drawSlashes() {
      const [r, g, b] = curColor;
      SLASHES.forEach(s => {
        ctx.save();
        ctx.globalAlpha = s.opacity;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.translate(s.nx * W, -H * 0.2);
        ctx.transform(1, 0, Math.tan(s.skew * Math.PI / 180), 1, 0, 0);
        ctx.fillRect(0, 0, s.nw * W, H * 1.4);
        ctx.restore();
      });
    }

    // Effect 0: helicopter spotlights (P5)
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
        ctx.beginPath();
        ctx.arc(ox, oy + sc(4), sc(6), 0, Math.PI * 2);
        const srcGrad = ctx.createRadialGradient(ox, oy + sc(4), 0, ox, oy + sc(4), sc(6));
        srcGrad.addColorStop(0, `rgba(255,255,255,${alpha * 4})`);
        srcGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = srcGrad;
        ctx.fill();
        ctx.restore();
      });
    }

    // Effect 1: drifting star particles (P4)
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
        // glow
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, len * 2.2);
        glow.addColorStop(0, 'rgba(255,225,140,0.9)');
        glow.addColorStop(1, 'rgba(255,225,140,0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(cx, cy, len * 2.2, 0, Math.PI * 2); ctx.fill();
        // 4-point sparkle
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

    // Effect 2: sliding wave band (P3)
    function drawWave(t, k) {
      if (k <= 0.001) return;
      const [r, g, b] = curColor;
      // slides up & out: when inactive (k→0) the band is lifted off the top
      const slide = (1 - k) * -H * 0.55;
      ctx.save();
      ctx.translate(0, slide);
      const bands = [
        { baseY: 0.72, amp: 0.05, freq: 1.6, spd: 0.0009, a: 0.16 },
        { baseY: 0.80, amp: 0.07, freq: 1.1, spd: 0.0006, a: 0.12 },
        { baseY: 0.88, amp: 0.045, freq: 2.2, spd: 0.0013, a: 0.10 },
      ];
      bands.forEach((bd, bi) => {
        ctx.beginPath();
        ctx.moveTo(0, H);
        const yBase = bd.baseY * H;
        const amp = bd.amp * H;
        for (let x = 0; x <= W; x += 12) {
          const y = yBase + Math.sin((x / W) * Math.PI * 2 * bd.freq + t * bd.spd + bi) * amp;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, yBase - amp, 0, H);
        grad.addColorStop(0, `rgba(${r},${g},${b},${bd.a * k})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      });
      ctx.restore();
    }

    function draw() {
      const t = performance.now();
      const target = targetRef.current;

      // ease intensities + color toward target
      for (let i = 0; i < 3; i++) {
        const goal = GAME_EFFECT[target] === i ? 1 : 0;
        intensity[i] += (goal - intensity[i]) * 0.045;
      }
      const goalColor = GAME_RGB[target];
      for (let i = 0; i < 3; i++) curColor[i] += (goalColor[i] - curColor[i]) * 0.05;

      drawBase();
      drawGrid();
      drawDots(t);
      drawSlashes();
      drawWave(t, intensity[2]);
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
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100vw', zIndex: 0,
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, #000 12px)',
        maskImage: 'linear-gradient(to bottom, transparent 0px, #000 12px)',
      }}
    />
  );
}
