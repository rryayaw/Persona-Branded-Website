import { useEffect, useRef } from 'react';

const FONTS = [
  { css: "'Teko', sans-serif",          weight: '700' },
  { css: "'Cooper Black', serif",        weight: '400' },
  { css: "Clarendon, Georgia, serif",   weight: '700' },
];

const NAV_ITEMS = [
  { href: '#hero',       label: 'Hero' },
  { href: '#games',      label: 'Games' },
  { href: '#characters', label: 'Characters' },
  { href: '#music',      label: 'Music', overrides: { boxes: { 2: 'box-b' } } },
  { href: '#news',       label: 'News',  overrides: { sizeMult: { 1: 0.72, 2: 0.72 } } },
];

// Tunables
const TUNE = {
  // Arc geometry
  containerW:  460,    // px — width of the arc bounding box
  containerH:  480,    // px — height of the arc bounding box
  arcOffset:   220,    // px — how far the arc center sits BEYOND the right edge of the container
  radius:      440,    // px — arc radius (larger = flatter arc)
  arcStart:    -21,    // deg — angle of first item (negative = above center)
  arcEnd:       21,    // deg — angle of last item  (positive = below center)
  tilt:         0.75,  // multiplier — how much each item tilts with the arc (0 = no tilt)

  // Letter sizing & chaos
  baseSizeRem:  2.6,   // rem — base font size for letters
  sizeVariance: 1.4,   // rem — ± random variance on top of base size
  minSizeRem:   1.8,   // rem — minimum letter size
  idleNudgeY:   7,     // px — max vertical nudge in idle state
  idleNudgeR:   4,     // deg — max rotation nudge in idle state
  hoverNudgeY:  13,    // px — max vertical nudge on hover
  hoverNudgeR:  8,     // deg — max rotation nudge on hover

  // Wave (active state)
  waveSpeed:    0.055, // wave scroll speed per frame
  waveAmp:      0.12,  // wave amplitude as fraction of letter height
  waveMidline:  0.50,  // wave midline position as fraction of letter height (0=top, 1=bottom)
  waveFreq:     1.8,   // wave frequency multiplier
  transitionMs: 280,   // ms — hover→idle interpolation duration on activation

  // Canvas padding
  nudgePad:     16,    // px — extra canvas padding to accommodate letter nudges
  boxPad:       4,     // px — horizontal padding inside box-style letters

  // Position
  rightEdge:    115,   // px — distance from the right edge of the viewport (increase = move left)
};

// Seeded random helpers
function makeRand(seed) {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0xffffffff; };
}
function genNudges(len, rand, yRange, rRange) {
  return Array.from({ length: len }, () => ({
    y: (rand() - 0.5) * yRange,
    r: (rand() - 0.5) * rRange,
  }));
}
function genSizes(len, rand) {
  return Array.from({ length: len }, () =>
    Math.max(TUNE.minSizeRem, TUNE.baseSizeRem + (rand() - 0.5) * TUNE.sizeVariance));
}
function genFonts(len, rand) {
  // Build a balanced array (each font appears floor(len/3) or ceil(len/3) times) then shuffle
  const arr = Array.from({ length: len }, (_, i) => FONTS[i % FONTS.length]);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function genBoxes(len, rand) {
  return Array.from({ length: len }, () => {
    const v = rand();
    if (v < 0.30) return 'box-w';
    if (v < 0.52) return 'box-b';
    return 'plain';
  });
}

// Letter style applier
function applyLetterStyle(span, boxType) {
  if (boxType === 'box-w') {
    span.style.color      = '#0d0d0d';
    span.style.background = '#f5f0ea';
    span.style.padding    = '0 2px';
    span.style.outline    = '';
  } else if (boxType === 'box-b') {
    span.style.color      = '#f5f0ea';
    span.style.background = '#0d0d0d';
    span.style.padding    = '0 2px';
    span.style.outline    = '2.5px solid #f5f0ea';
  } else {
    span.style.color      = '#f5f0ea';
    span.style.background = 'transparent';
    span.style.padding    = '0';
    span.style.outline    = '';
  }
}

export default function SectionNav() {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ul = wrap.querySelector('ul');

    const TOTAL      = NAV_ITEMS.length;
    const CONT_W     = TUNE.containerW;
    const CONT_H     = TUNE.containerH;
    const ARC_CX     = CONT_W + TUNE.arcOffset;
    const ARC_CY     = CONT_H / 2;
    const R          = TUNE.radius;
    const ARC_START  = TUNE.arcStart;
    const ARC_END    = TUNE.arcEnd;
    const DPR        = window.devicePixelRatio || 1;

    const itemData   = [];
    const liEls      = [];
    let   cancelled  = false;
    let   scrollIo   = null;

    document.fonts.ready.then(() => {
      if (cancelled) return;

      NAV_ITEMS.forEach(({ href, label, overrides = {} }, idx) => {
        const len  = label.length;
        const seed = label.split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), idx * 13);

        const d = {
          label, href,
          idleNudges:  genNudges(len, makeRand(seed),       TUNE.idleNudgeY,  TUNE.idleNudgeR),
          hoverNudges: genNudges(len, makeRand(seed + 777), TUNE.hoverNudgeY, TUNE.hoverNudgeR),
          idleBoxes:   genBoxes(len,  makeRand(seed + 111)),
          hoverBoxes:  genBoxes(len,  makeRand(seed + 222)),
          idleSizes:   genSizes(len,  makeRand(seed + 333)),
          hoverSizes:  genSizes(len,  makeRand(seed + 444)),
          idleFonts:   genFonts(len,  makeRand(seed + 555)),
          _raf: null, active: false,
        };
        itemData.push(d);

        // Apply per-letter overrides
        if (overrides.boxes)    Object.entries(overrides.boxes).forEach(([i, v]) => { d.idleBoxes[+i] = v; });
        if (overrides.sizeMult) Object.entries(overrides.sizeMult).forEach(([i, v]) => { d.idleSizes[+i] *= v; });

        // li element
        const li = document.createElement('li');
        Object.assign(li.style, {
          position: 'absolute', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px',
          pointerEvents: 'auto',
        });

        // Arc position
        const t        = TOTAL === 1 ? 0.5 : idx / (TOTAL - 1);
        const angleDeg = ARC_START + t * (ARC_END - ARC_START);
        const angleRad = angleDeg * Math.PI / 180;
        li.style.left            = (ARC_CX - R * Math.cos(angleRad)) + 'px';
        li.style.top             = (ARC_CY + R * Math.sin(angleRad) - 28) + 'px';
        li.style.transform       = `rotate(${angleDeg * TUNE.tilt}deg)`;
        li.style.transformOrigin = 'left center';

        // Arrow
        const arrow = document.createElement('span');
        Object.assign(arrow.style, {
          color: '#d00010', fontSize: '1rem', lineHeight: '1',
          opacity: '0', transform: 'scaleX(0)', transformOrigin: 'left center',
          transition: 'opacity 0.12s, transform 0.15s cubic-bezier(0.34,1.56,0.64,1)',
          flexShrink: '0',
        });
        arrow.textContent = '▶';
        li.appendChild(arrow);
        d.arrow = arrow;

        // HTML word
        const wordDiv = document.createElement('div');
        Object.assign(wordDiv.style, { display: 'inline-flex', alignItems: 'flex-end', lineHeight: '1' });

        const spans = label.split('').map((ch, i) => {
          const span = document.createElement('span');
          span.textContent = ch;
          Object.assign(span.style, {
            fontFamily: d.idleFonts[i].css, fontWeight: d.idleFonts[i].weight,
            display: 'inline-block', lineHeight: '1', textTransform: 'uppercase',
            transition: 'color 0.12s ease, background 0.12s ease, font-size 0.15s cubic-bezier(0.34,1.56,0.64,1)',
            fontSize: `${d.idleSizes[i]}rem`,
            transform: `translateY(${d.idleNudges[i].y}px) rotate(${d.idleNudges[i].r}deg)`,
          });
          applyLetterStyle(span, d.idleBoxes[i]);
          wordDiv.appendChild(span);
          return span;
        });
        d.spans   = spans;
        d.wordDiv = wordDiv;
        li.appendChild(wordDiv);

        // Canvas word
        const canvas = document.createElement('canvas');
        Object.assign(canvas.style, { display: 'none', imageRendering: 'pixelated' });
        li.appendChild(canvas);
        d.canvas = canvas;

        ul.appendChild(li);
        liEls.push(li);

        // Hover
        li.addEventListener('mouseenter', () => {
          if (d.active) return;
          spans.forEach((s, i) => {
            applyLetterStyle(s, d.hoverBoxes[i]);
            s.style.fontSize  = `${d.hoverSizes[i]}rem`;
            s.style.transform = `translateY(${d.hoverNudges[i].y}px) rotate(${d.hoverNudges[i].r}deg)`;
          });
          arrow.style.opacity   = '1';
          arrow.style.transform = 'scaleX(1)';
        });
        li.addEventListener('mouseleave', () => {
          if (d.active) return;
          spans.forEach((s, i) => {
            applyLetterStyle(s, d.idleBoxes[i]);
            s.style.fontSize  = `${d.idleSizes[i]}rem`;
            s.style.transform = `translateY(${d.idleNudges[i].y}px) rotate(${d.idleNudges[i].r}deg)`;
          });
          arrow.style.opacity   = '0';
          arrow.style.transform = 'scaleX(0)';
        });

        // Click
        li.addEventListener('click', () => {
          const target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: 'smooth' });

          // deactivate all others
          itemData.forEach((od, oi) => {
            if (oi === idx) return;
            if (od._raf) { cancelAnimationFrame(od._raf); od._raf = null; }
            od.active           = false;
            od.wordDiv.style.display = 'inline-flex';
            od.canvas.style.display  = 'none';
            od.arrow.style.opacity   = '0';
            od.arrow.style.transform = 'scaleX(0)';
            od.spans.forEach((s, si) => {
              applyLetterStyle(s, od.idleBoxes[si]);
              s.style.fontSize  = `${od.idleSizes[si]}rem`;
              s.style.transform = `translateY(${od.idleNudges[si].y}px) rotate(${od.idleNudges[si].r}deg)`;
            });
          });

          // snapshot current visual state for smooth transition
          const fromState = spans.map(s => {
            const tr    = s.style.transform;
            const yMatch = tr.match(/translateY\(([\d.-]+)px\)/);
            const rMatch = tr.match(/rotate\(([\d.-]+)deg\)/);
            return {
              y:    yMatch ? parseFloat(yMatch[1]) : 0,
              r:    rMatch ? parseFloat(rMatch[1]) : 0,
              size: parseFloat(s.style.fontSize) || 3,
            };
          });

          d.active              = true;
          d.wordDiv.style.display = 'none';
          d.canvas.style.display  = 'inline-block';
          arrow.style.opacity     = '1';
          arrow.style.transform   = 'scaleX(1)';
          startWave(idx, fromState);
        });
      });

      // activate first item on load
      activateItem(0);

      // Scroll spy
      // Deterministic: the active section is whichever one straddles the
      // viewport's vertical center. Avoids IntersectionObserver edge cases
      // where a tall/overflowing child desyncs the intersecting set.
      const sectionEls = NAV_ITEMS.map(item => document.querySelector(item.href));
      let rafPending = false;

      function pick() {
        rafPending = false;
        const center = window.innerHeight / 2;

        let chosen = -1;
        for (let i = 0; i < sectionEls.length; i++) {
          const el = sectionEls[i];
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (r.top <= center && r.bottom > center) { chosen = i; break; }
        }
        // Fallback (very top/bottom of page): nearest section edge to center
        if (chosen === -1) {
          let best = Infinity;
          sectionEls.forEach((el, i) => {
            if (!el) return;
            const r = el.getBoundingClientRect();
            const d = Math.min(Math.abs(r.top - center), Math.abs(r.bottom - center));
            if (d < best) { best = d; chosen = i; }
          });
        }
        if (chosen === -1) return;

        activateItem(chosen);
        // tuck the nav when in games section so user can read game description
        const tuck = NAV_ITEMS[chosen].href === '#games';
        wrap.style.transform = tuck
          ? 'translateX(120%) translateY(-50%)'
          : 'translateY(-50%)';
      }

      function onScroll() {
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(pick);
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      pick();

      scrollIo = {
        disconnect() {
          window.removeEventListener('scroll', onScroll);
          window.removeEventListener('resize', onScroll);
        },
      };
    });

    // Activate helper
    function activateItem(idx) {
      const d = itemData[idx];
      if (!d || d.active) return;
      // deactivate all others
      itemData.forEach((od, oi) => {
        if (oi === idx) return;
        if (od._raf) { cancelAnimationFrame(od._raf); od._raf = null; }
        od.active                = false;
        od.wordDiv.style.display = 'inline-flex';
        od.canvas.style.display  = 'none';
        od.arrow.style.opacity   = '0';
        od.arrow.style.transform = 'scaleX(0)';
        od.spans.forEach((s, si) => {
          applyLetterStyle(s, od.idleBoxes[si]);
          s.style.fontSize  = `${od.idleSizes[si]}rem`;
          s.style.transform = `translateY(${od.idleNudges[si].y}px) rotate(${od.idleNudges[si].r}deg)`;
        });
      });
      d.active                = true;
      d.wordDiv.style.display = 'none';
      d.canvas.style.display  = 'inline-block';
      d.arrow.style.opacity   = '1';
      d.arrow.style.transform = 'scaleX(1)';
      startWave(idx);
    }

    // Wave canvas renderer
    function startWave(idx, fromState) {
      const d      = itemData[idx];
      const canvas = d.canvas;
      const label  = d.label;

      const PX         = 16;
      const PAD        = TUNE.boxPad;
      const NUDGE_PAD  = TUNE.nudgePad;
      const TRANS_MS   = TUNE.transitionMs;
      const startTime  = performance.now();
      let   waveOffset = 0;

      const mc   = document.createElement('canvas');
      mc.width   = 1200; mc.height = 200;
      const mctx = mc.getContext('2d');

      const ease = t => 1 - Math.pow(1 - t, 3);

      const idleLetters = label.split('').map((ch, i) => ({
        ch: ch.toUpperCase(),
        fs: d.idleSizes[i] * PX,
        nudgeY: d.idleNudges[i].y,
        nudgeR: d.idleNudges[i].r,
        box:    d.idleBoxes[i],
        font:   d.idleFonts[i],
      }));

      const from = fromState
        ? fromState.map(f => ({ y: f.y, r: f.r, size: f.size }))
        : idleLetters.map(l => ({ y: l.nudgeY, r: l.nudgeR, size: l.fs / PX }));

      function frame() {
        if (!d.active) return;

        const elapsed = performance.now() - startTime;
        const tt      = ease(Math.min(elapsed / TRANS_MS, 1));

        const fLetters = idleLetters.map((target, i) => ({
          ...target,
          nudgeY: from[i].y + (target.nudgeY - from[i].y) * tt,
          nudgeR: from[i].r + (target.nudgeR - from[i].r) * tt,
          fs:     (from[i].size + (target.fs / PX - from[i].size) * tt) * PX,
        }));

        const fMetrics = fLetters.map(l => {
          mctx.font     = `${l.font.weight} ${l.fs}px ${l.font.css}`;
          const m       = mctx.measureText(l.ch);
          const ascent  = m.actualBoundingBoxAscent  || l.fs * 0.78;
          const descent = m.actualBoundingBoxDescent || l.fs * 0.12;
          const boxW    = l.box !== 'plain' ? m.width + PAD * 2 : m.width;
          return { boxW, ascent, descent };
        });

        const maxAsc  = Math.max(...fMetrics.map(m => m.ascent))  + NUDGE_PAD;
        const maxDesc = Math.max(...fMetrics.map(m => m.descent)) + NUDGE_PAD;
        const fH      = Math.ceil(maxAsc + maxDesc);
        const fW      = Math.ceil(fMetrics.reduce((s, m) => s + m.boxW, 0)) + 4;
        const fBase   = maxAsc;

        if (canvas.width !== fW * DPR || canvas.height !== fH * DPR) {
          canvas.width        = fW * DPR;
          canvas.height       = fH * DPR;
          canvas.style.width  = fW + 'px';
          canvas.style.height = fH + 'px';
        }

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(DPR, DPR);

        const xPos = [];
        let x = 2;
        fMetrics.forEach(m => { xPos.push(x); x += m.boxW; });

        function drawPass(colorPlain, colorBoxW, colorBoxB, outlineColor) {
          fLetters.forEach((l, i) => {
            const fm    = fMetrics[i];
            const textX = l.box !== 'plain' ? xPos[i] + PAD : xPos[i];
            const textY = fBase + l.nudgeY;
            ctx.save();
            const cx = xPos[i] + fm.boxW / 2, cy = fBase - fm.ascent / 2;
            ctx.translate(cx, cy);
            ctx.rotate(l.nudgeR * Math.PI / 180);
            ctx.translate(-cx, -cy);
            ctx.font         = `${l.font.weight} ${l.fs}px ${l.font.css}`;
            ctx.textBaseline = 'alphabetic';
            if (l.box === 'box-w') {
              ctx.fillStyle = colorBoxW;
              ctx.fillRect(xPos[i], textY - fm.ascent, fm.boxW, fm.ascent + fm.descent);
              ctx.fillStyle = '#0d0d0d';
            } else if (l.box === 'box-b') {
              ctx.fillStyle = '#0d0d0d';
              ctx.fillRect(xPos[i], textY - fm.ascent, fm.boxW, fm.ascent + fm.descent);
              ctx.strokeStyle = outlineColor; ctx.lineWidth = 2;
              ctx.strokeRect(xPos[i]+1, textY-fm.ascent+1, fm.boxW-2, fm.ascent+fm.descent-2);
              ctx.fillStyle = colorBoxB;
            } else {
              ctx.fillStyle = colorPlain;
            }
            ctx.fillText(l.ch, textX, textY);
            ctx.restore();
          });
        }

        // Pass 1: all white
        drawPass('#f5f0ea', '#f5f0ea', '#f5f0ea', '#f5f0ea');

        // Pass 2: red wave clip from bottom
        const amp    = fH * TUNE.waveAmp;
        const mid    = fH * TUNE.waveMidline;
        const freq   = (Math.PI * 2) / fW * TUNE.waveFreq;
        ctx.save();
        ctx.beginPath();
        for (let px = 0; px <= fW; px++) {
          const wy = mid + Math.sin(px * freq + waveOffset) * amp;
          px === 0 ? ctx.moveTo(px, wy) : ctx.lineTo(px, wy);
        }
        ctx.lineTo(fW, fH); ctx.lineTo(0, fH); ctx.closePath(); ctx.clip();
        drawPass('#d00010', '#d00010', '#d00010', '#d00010');
        ctx.restore();

        ctx.restore();
        waveOffset += TUNE.waveSpeed;
        d._raf = requestAnimationFrame(frame);
      }

      d._raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelled = true;
      if (scrollIo) scrollIo.disconnect();
      itemData.forEach(d => { if (d._raf) cancelAnimationFrame(d._raf); });
      ul.innerHTML = '';
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{ position: 'fixed', right: TUNE.rightEdge, top: '50%', transform: 'translateY(-50%)', zIndex: 99, pointerEvents: 'none', transition: 'transform 0.55s cubic-bezier(0.5, 0, 0.2, 1)' }}
    >
      <ul style={{ listStyle: 'none', width: TUNE.containerW, height: TUNE.containerH, position: 'relative', pointerEvents: 'none' }} />
    </div>
  );
}
