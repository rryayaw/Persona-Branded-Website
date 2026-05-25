import { useEffect, useRef } from 'react';

const BASE_W = 1920;
const BASE_H = 1080;

function makeRand(seed) {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0xffffffff; };
}

function gaussianRand(rand) {
  const u = rand(), v = rand();
  return Math.sqrt(-2 * Math.log(u + 0.0001)) * Math.cos(2 * Math.PI * v);
}

const DOTS = [];
(function buildDots() {
  const rand = makeRand(42);
  const spacing = 28;
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

const SHARD_TUNE = {
  radialAmp:   14,
  radialSpeed: 0.0026,
  swayAmp:     3,
  swaySpeed:   0.0011,
  size:        1.2,   // multiplier on shard dimensions — 0.5 = half size, 2.0 = double
  count:       0,    // total number of shards
};

const SPOTLIGHTS = [
  { angle: -0.3,  speed:  0.00022, spread: 0.18, reach: 1.15, alpha: 0.07,  phase: 0,          originNX: 0.2 },
  { angle:  0.25, speed: -0.00018, spread: 0.15, reach: 1.2,  alpha: 0.065, phase: Math.PI,     originNX: 0.8 },
];

export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W, H, scale;
    let animId;

    const sc = (v) => v * scale;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      scale = Math.min(W / BASE_W, H / BASE_H);
    }
    resize();
    window.addEventListener('resize', resize);

    // Built after initial resize so sc() is valid for shard sizes
    const SHARDS = Array.from({ length: SHARD_TUNE.count }, (_, i) => {
      const rand = makeRand(i * 137 + 7);
      const spread = 0.28;
      const nx = Math.max(0.02, Math.min(0.98, 0.5 + gaussianRand(rand) * spread));
      const ny = Math.max(0.02, Math.min(0.98, 0.5 + gaussianRand(rand) * spread));
      const dx = 0.5 - nx;
      const dy = 0.5 - ny;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const dirAngle = Math.atan2(dy, dx);
      const edgeness = Math.min(1, dist / 0.4);
      const size = sc(((6 + edgeness * 18) + rand() * 14) * SHARD_TUNE.size);
      const tipLen   = size * (1.2 + rand() * 0.8);
      const baseHalf = size * (0.3 + rand() * 0.4);
      return {
        nx, ny, dirAngle, tipLen, baseHalf,
        rot:       rand() * 0.3 - 0.15,
        swayTilt:  0.06 + rand() * 0.08,
        alpha:     0.05 + rand() * 0.10,
        red:       rand() > 0.68,
        phase:     rand() * Math.PI * 2,
      };
    });

    function drawGrid() {
      ctx.save();
      ctx.globalAlpha = 0.025;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      const gapX = sc(120), gapY = sc(120);
      for (let x = 0; x < W; x += gapX) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += gapY) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.restore();
    }

    function drawCornerAccents() {
      ctx.save();
      ctx.fillStyle = '#d00010';
      const s1 = sc(90);
      ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.moveTo(W, 0); ctx.lineTo(W - s1, 0); ctx.lineTo(W, s1); ctx.closePath(); ctx.fill();
      const s2 = sc(50);
      ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(s2, H); ctx.lineTo(0, H - s2); ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    function drawShards(t) {
      ctx.save();
      SHARDS.forEach(s => {
        const inOut = Math.sin(t * SHARD_TUNE.radialSpeed + s.phase) * sc(SHARD_TUNE.radialAmp);
        const sway  = Math.sin(t * SHARD_TUNE.swaySpeed + s.phase * 1.7) * sc(SHARD_TUNE.swayAmp);
        const idx = Math.cos(s.dirAngle), idy = Math.sin(s.dirAngle);
        const px = -idy, py = idx;
        const cx = s.nx * W + idx * inOut + px * sway;
        const cy = s.ny * H + idy * inOut + py * sway;
        const pulse = 0.7 + 0.3 * Math.sin(t * 0.0007 + s.phase);
        const swayNorm = Math.sin(t * SHARD_TUNE.swaySpeed + s.phase * 1.7);
        const rot = s.dirAngle + s.rot + swayNorm * s.swayTilt;
        const tip = { x: Math.cos(rot) * s.tipLen, y: Math.sin(rot) * s.tipLen };
        const b1  = { x:  Math.cos(rot + Math.PI / 2) * s.baseHalf - Math.cos(rot) * s.baseHalf * 0.3,
                      y:  Math.sin(rot + Math.PI / 2) * s.baseHalf - Math.sin(rot) * s.baseHalf * 0.3 };
        const b2  = { x:  Math.cos(rot - Math.PI / 2) * s.baseHalf - Math.cos(rot) * s.baseHalf * 0.3,
                      y:  Math.sin(rot - Math.PI / 2) * s.baseHalf - Math.sin(rot) * s.baseHalf * 0.3 };
        ctx.save();
        ctx.globalAlpha = s.alpha * pulse;
        ctx.fillStyle = s.red ? '#d00010' : '#f5f0ea';
        ctx.beginPath();
        ctx.moveTo(cx + tip.x, cy + tip.y);
        ctx.lineTo(cx + b1.x,  cy + b1.y);
        ctx.lineTo(cx + b2.x,  cy + b2.y);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = s.alpha * pulse * 0.5;
        ctx.strokeStyle = s.red ? '#d00010' : '#f5f0ea';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.restore();
      });
      ctx.restore();
    }

    function drawSpotlights(t) {
      SPOTLIGHTS.forEach(sp => {
        const sweep = Math.sin(t * sp.speed + sp.phase) * 0.55;
        const centerAngle = Math.PI / 2 + sweep;
        const ox = sp.originNX * W;
        const oy = -sc(10);
        const reach = sp.reach * H;
        const flicker = 0.85 + 0.15 * Math.sin(t * 0.013 + sp.phase * 3.7);
        const alpha = sp.alpha * flicker;
        const lx = ox + Math.cos(centerAngle - sp.spread) * reach;
        const ly = oy + Math.sin(centerAngle - sp.spread) * reach;
        const rx = ox + Math.cos(centerAngle + sp.spread) * reach;
        const ry = oy + Math.sin(centerAngle + sp.spread) * reach;
        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, reach);
        grad.addColorStop(0,    `rgba(255,255,255,${alpha * 2.2})`);
        grad.addColorStop(0.35, `rgba(255,255,255,${alpha})`);
        grad.addColorStop(1,    'rgba(255,255,255,0)');
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(ox, oy); ctx.lineTo(lx, ly); ctx.lineTo(rx, ry);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.globalCompositeOperation = 'screen';
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

    function draw() {
      const t = performance.now();

      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, W, H);

      drawGrid();

      ctx.save();
      DOTS.forEach(d => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.001 + d.phase);
        ctx.globalAlpha = 0.025 + pulse * 0.035;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(d.nx * W, d.ny * H, sc(d.radius), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      SLASHES.forEach(s => {
        ctx.save();
        ctx.globalAlpha = s.opacity;
        ctx.fillStyle = '#d00010';
        ctx.translate(s.nx * W, -H * 0.2);
        ctx.transform(1, 0, Math.tan(s.skew * Math.PI / 180), 1, 0, 0);
        ctx.fillRect(0, 0, s.nw * W, H * 1.4);
        ctx.restore();
      });

      drawShards(t);
      drawSpotlights(t);
      drawCornerAccents();

      animId = requestAnimationFrame(draw);
    }

    document.fonts.ready.then(() => { animId = requestAnimationFrame(draw); });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100vw', zIndex: 0 }}
    />
  );
}
