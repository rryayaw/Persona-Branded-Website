import { useEffect, useRef } from 'react';

//tunables for the loading text
const TEXT = 'LOADING...';
const BOXES = ['plain', 'plain', 'box-w', 'plain', 'plain', 'box-w', 'plain', 'plain', 'plain', 'plain'];
const SIZES = [5.2, 3.8, 5.3, 4.4, 5.8, 3.5, 4.9, 3.2, 4.1, 3.0];
const BASE_ROTS = [-4, 3, -2, 5, -6, 2, -3, 7, -5, 4];
const CREAM = '#f5f0ea';
const INK = '#0d0d0d';

const UP_Y = -16;
const DOWN_Y = 4;
const TICK_MS = 120;
const PAUSE_MS = 2000;
const NEIGHBOR_FALLOFF = 0.45;

export default function LoadingText() {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    wrap.innerHTML = '';
    const wrapEls = [];

    TEXT.split('').forEach((ch, i) => {
      const box = BOXES[i];
      const size = SIZES[i];

      if (box === 'box-w' && (i === 2 || i === 5)) {
        const outer = document.createElement('div');
        outer.className = 'letter-a-wrap';

        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = ch;
        span.style.fontSize = size + 'rem';
        span.style.color = INK;
        span.style.fontStyle = 'italic';

        outer.appendChild(span);
        wrap.appendChild(outer);
        wrapEls.push(outer);
      } else {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = ch;
        span.style.fontSize = size + 'rem';
        span.style.color = CREAM;
        span.style.background = INK;
        span.style.padding = '0 3px';
        span.style.position = 'relative';
        span.style.top = '0.12em';

        if (i === 1) {
          span.style.display = 'inline-block';

          const whiteRect = document.createElement('span');
          whiteRect.style.cssText = `
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -58%);
            width: 0.28em;
            height: 0.48em;
            background: ${CREAM};
            pointer-events: none;
            z-index: 1;
          `;
          span.appendChild(whiteRect);

          const star = document.createElement('span');
          star.textContent = '★';
          star.style.cssText = `
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -54%) scale(0.52) rotate(10deg);
            color: ${INK};
            font-size: ${size}rem;
            line-height: 1;
            pointer-events: none;
            z-index: 2;
          `;
          span.appendChild(star);
        }

        wrap.appendChild(span);
        wrapEls.push(span);
      }
    });

    const LEN = wrapEls.length;

    function applyTransform(idx, y, extraRot) {
      const el = wrapEls[idx];
      const rot = BASE_ROTS[idx] + extraRot;
      if (idx === 2 || idx === 5) {
        el.style.transform = `translateY(${y}px) rotate(${rot}deg) skewX(-12deg)`;
      } else if (idx === 6) {
        el.style.transform = `translateY(${y}px) rotate(${rot}deg) scaleY(0.65)`;
      } else {
        el.style.transform = `translateY(${y}px) rotate(${rot}deg)`;
      }
    }

    function setRest() {
      for (let i = 0; i < LEN; i++) applyTransform(i, DOWN_Y, 1);
    }

    let tickTimer = null;
    let pauseTimer = null;
    let cancelled = false;

    function runWave() {
      let step = 0;
      function tick() {
        if (cancelled) return;
        if (step < LEN) {
          for (let i = 0; i < LEN; i++) {
            const dist = Math.abs(i - step);
            if (dist === 0) applyTransform(i, UP_Y, -2);
            else if (dist === 1) applyTransform(i, UP_Y * NEIGHBOR_FALLOFF, 0);
            else applyTransform(i, DOWN_Y, 1);
          }
          step++;
          tickTimer = setTimeout(tick, TICK_MS);
        } else {
          setRest();
          pauseTimer = setTimeout(runWave, PAUSE_MS);
        }
      }
      tick();
    }

    setRest();
    runWave();

    return () => {
      cancelled = true;
      if (tickTimer) clearTimeout(tickTimer);
      if (pauseTimer) clearTimeout(pauseTimer);
    };
  }, []);

  return <div ref={wrapRef} className="loading-cluster" />;
}
