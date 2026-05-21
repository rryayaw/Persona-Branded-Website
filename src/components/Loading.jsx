import { useEffect, useRef } from 'react';
import LoadingText from './LoadingText.jsx';

//glows sesuai dgn the background (only correct for unadjusted resolution on websites on dekstop)
const RED_GLOWS = [
  { w: 80, h: 80, left: '-1%', top: '65%', delay: '0s' },
  { w: 80, h: 80, left: '4%', top: '58%', delay: '-0.9s' },
  { w: 110, h: 110, left: '17%', top: '77%', delay: '-1.7s' },
  { w: 110, h: 110, right: '2%', top: '30%', delay: '-2.5s' },
  { w: 110, h: 110, right: '14%', top: '43%', delay: '-0.4s' },
  { w: 110, h: 110, right: '9%', top: '65%', delay: '-3.1s' },
  { w: 110, h: 110, right: '16%', bottom: '-6%', delay: '-1.3s' },
  { w: 52, h: 52, right: '36%', top: '33%', delay: '-2.0s' },
  { w: 52, h: 52, right: '32%', top: '37%', delay: '-3.4s' },
  { w: 52, h: 52, right: '25%', top: '34%', delay: '-0.7s' },
  { w: 40, h: 40, right: '31%', top: '32%', delay: '-2.8s' },
];

export default function Loading() {
  const sceneRef = useRef(null);
  const lightningRef = useRef(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const lightning = lightningRef.current;
    if (!scene || !lightning) return;

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const pending = new Set();
    let cancelled = false;

    const track = (fn, ms) => {
      const id = setTimeout(() => {
        pending.delete(id);
        if (!cancelled) fn();
      }, ms);
      pending.add(id);
      return id;
    };

    function spawnRipple(x, y) {
      if (cancelled) return;
      const r = document.createElement('div');
      r.className = 'ripple';
      const size = Math.random() * 14 + 5;
      r.style.cssText = `left:${x - size / 2}px;top:${y}px;width:${size}px;height:${size * 0.3}px;animation-duration:${Math.random() * 0.4 + 0.65}s;`;
      r.addEventListener('animationend', () => r.remove(), { once: true });
      scene.appendChild(r);
    }

    function spawnDrop() {
      if (cancelled) return;
      const drop = document.createElement('div');
      drop.className = 'drop';
      const x = Math.random() * (W() + 100) - 50;
      const height = Math.random() * 55 + 18;
      const width = Math.random() * 1 + 1;
      const duration = Math.random() * 0.3 + 0.48;
      const delay = Math.random() * 0.15;
      const dist = H() + height + 10;
      const opacity = Math.random() * 0.35 + 0.35;
      drop.style.cssText = `left:${x}px;height:${height}px;width:${width}px;--dist:${dist}px;animation-duration:${duration}s;animation-delay:${delay}s;opacity:${opacity};`;
      drop.addEventListener(
        'animationend',
        () => {
          spawnRipple(x, H() - 20 + Math.random() * 15);
          drop.remove();
        },
        { once: true }
      );
      scene.appendChild(drop);
    }

    const rainInterval = setInterval(() => {
      for (let i = 0; i < 3; i++) spawnDrop();
    }, 65);

    function strikeLightning() {
      if (cancelled) return;
      lightning.style.opacity = '1';
      track(() => (lightning.style.opacity = '0'), 60);
      track(() => (lightning.style.opacity = '0.75'), 100);
      track(() => (lightning.style.opacity = '0'), 145);
      track(() => (lightning.style.opacity = '0.3'), 190);
      track(() => (lightning.style.opacity = '0'), 260);

      scene.classList.remove('scene-shake');
      void scene.offsetHeight;
      scene.classList.add('scene-shake');

      for (let i = 0; i < 30; i++) track(spawnDrop, i * 12);
    }

    function scheduleLightning() {
      track(() => {
        strikeLightning();
        scheduleLightning();
      }, Math.random() * 18000 + 10000);
    }

    track(() => {
      strikeLightning();
      scheduleLightning();
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(rainInterval);
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0a0a0a]">
      <div ref={sceneRef} className="fixed inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-top bg-no-repeat"
          style={{
            backgroundImage: "url('/city_background.jpg')",
            filter: 'brightness(0.72) contrast(1.05)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(5,10,20,0.2) 0%, rgba(5,10,20,0.05) 50%, rgba(5,10,20,0.5) 100%)',
          }}
        />
        <div className="fog fog-a" />
        <div className="fog fog-b" />

        {RED_GLOWS.map((g, i) => (
          <div
            key={i}
            className="red-glow"
            style={{
              width: g.w,
              height: g.h,
              left: g.left,
              right: g.right,
              top: g.top,
              bottom: g.bottom,
              animationDelay: g.delay,
            }}
          />
        ))}
      </div>

      <div className="fixed bottom-15 left-15 z-20 pointer-events-none">
        <LoadingText />
      </div>

      <div
        ref={lightningRef}
        className="fixed inset-0 z-10 pointer-events-none opacity-0"
        style={{ background: 'rgba(200,225,255,0.85)', transition: 'opacity 0.04s ease-out' }}
      />
    </div>
  );
}
