import { useEffect, useRef } from 'react';

const RADIUS   = 360;
const SIZE     = 0.8;
const SWAY     = 4;
const SWAY_SPD = 0.3;
const NUM      = 15;
const DELAY    = 1000; // ms before shards launch

function makeTriangle(len, wid)  { return [[-len*0.55,0],[len*0.45,wid*0.5],[len*0.45,-wid*0.5]]; }
function makeDiamond(len, wid)   { return [[-len*0.45,0],[len*0.1,wid*0.5],[len*0.55,0],[len*0.1,-wid*0.5]]; }
function makeKite(len, wid)      { return [[-len*0.45,0],[len*0.15,wid*0.55],[len*0.55,0],[len*0.15,-wid*0.55]]; }
function makeTrapezoid(len, wid) { return [[-len*0.35,wid*0.2],[-len*0.35,-wid*0.2],[len*0.45,-wid*0.5],[len*0.45,wid*0.5]]; }
function makeShard(len, wid) {
  const r = (a, b) => a + Math.random() * (b - a);
  return [
    [-len*0.45, r(-wid*0.1, wid*0.1)],
    [len*0.15,  wid*0.5],
    [len*r(0.4, 0.55), r(-wid*0.05, wid*0.15)],
    [len*0.15, -wid*0.5],
  ];
}

const SHAPES = [makeTriangle, makeDiamond, makeKite, makeTrapezoid, makeShard];

function r(a, b) { return a + Math.random() * (b - a); }
function easeOutExpo(t)     { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function easeInOutCubic(t)  { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2; }

export default function GlassShards() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const shards = Array.from({ length: NUM }, (_, i) => {
      const angle = (i / NUM) * Math.PI * 2 + r(-0.08, 0.08);
      const shapeFn = SHAPES[Math.floor(r(0, SHAPES.length))];
      return {
        angle,
        restDistBase:  r(0.7, 1.3),
        lenBase:       r(60, 115),
        widBase:       r(24, 52),
        ptsBase:       shapeFn(1, 1),
        hue:           r(175, 225),
        alpha:         r(0.6, 0.88),
        hoverT:        r(0, Math.PI * 2),
        hoverSpeed:    r(0.005, 0.011),
        hoverAmpBase:  r(0.07, 0.16),
        swayT:         r(0, Math.PI * 2),
        swaySpeedBase: r(0.0012, 0.0032),
        swayAmpBase:   r(0.5, 1.5),
        launchDur:     r(550, 1100),
        launched:      false,
        hovering:      false,
        launchStart:   null,
        hoverPhaseStart: null,
      };
    });

    function drawShard(s, cx, cy, now) {
      if (!s.launched) { s.launched = true; s.launchStart = now; }

      const age       = now - s.launchStart;
      const restDist  = RADIUS * s.restDistBase;
      const hoverAmp  = restDist * s.hoverAmpBase;
      const swayAmp   = s.swayAmpBase * SWAY;
      const swaySpeed = s.swaySpeedBase * SWAY_SPD;
      const len = s.lenBase * SIZE;
      const wid = s.widBase * SIZE;

      s.hoverT += s.hoverSpeed;
      s.swayT  += swaySpeed;

      let dist, sway;
      if (age < s.launchDur) {
        dist = easeOutExpo(age / s.launchDur) * restDist;
        sway = 0;
      } else {
        if (!s.hovering) { s.hovering = true; s.hoverPhaseStart = now; }
        const blend = easeInOutCubic(Math.min(1, (now - s.hoverPhaseStart) / 1600));
        dist = restDist * (1 - blend) + (restDist + Math.sin(s.hoverT) * hoverAmp) * blend;
        sway = blend * Math.sin(s.swayT) * swayAmp;
      }

      const perp = s.angle + Math.PI / 2;
      const x = cx + Math.cos(s.angle) * dist + Math.cos(perp) * sway;
      const y = cy + Math.sin(s.angle) * dist + Math.sin(perp) * sway;
      const alpha = s.alpha * Math.min(1, age / 100);
      const pts = s.ptsBase.map(p => [p[0] * len, p[1] * wid]);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(s.angle);

      const minX = Math.min(...pts.map(p => p[0]));
      const maxX = Math.max(...pts.map(p => p[0]));
      const grad = ctx.createLinearGradient(minX, 0, maxX, 0);
      grad.addColorStop(0,    `hsla(${s.hue},90%,96%,${alpha})`);
      grad.addColorStop(0.35, `hsla(${s.hue+15},80%,88%,${alpha*0.95})`);
      grad.addColorStop(0.7,  `hsla(${s.hue-10},65%,65%,${alpha*0.75})`);
      grad.addColorStop(1,    `hsla(${s.hue},55%,40%,${alpha*0.5})`);

      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      ctx.lineTo(pts[1][0], pts[1][1]);
      ctx.strokeStyle = `hsla(${s.hue+20},100%,98%,${alpha*0.9})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.strokeStyle = `hsla(${s.hue},80%,85%,${alpha*0.5})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();

      ctx.restore();
    }

    let animId;
    let loopStart = null;
    function loop(now) {
      if (loopStart === null) loopStart = now;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      if (now - loopStart >= DELAY)
        for (const s of shards) drawShard(s, W / 2, H / 2, now);
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2,}}
    />
  );
}
