import { useState } from 'react';

const FONTS = [
  { css: "'Teko', sans-serif",        weight: '700' },
  { css: "'Cooper Black', serif",      weight: '400' },
  { css: "Clarendon, Georgia, serif", weight: '700' },
];

const LABEL = 'BUY NOW';
const SIZE  = '1.7rem';

// Assign fonts evenly across non-space letters
let _fi = 0;
const LETTERS = LABEL.split('').map(ch => {
  if (ch === ' ') return { isSpace: true };
  return { ch, font: FONTS[(_fi++) % FONTS.length] };
});

export default function PurchaseLink() {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <style>{`
        @keyframes pur-jelly {
          0%   { transform: scale(1.25,1)   skewX(20deg)  translateY(3px)  rotateX(40deg)  rotateY(10deg)  rotateZ(-10deg); }
          50%  { transform: scale(1.25,1.1) skewX(-15deg) translateY(-2px) translateZ(-30px); }
          100% { transform: scale(1.25,1)   skewX(20deg)  translateY(3px)  rotateX(-40deg) rotateY(-10deg) rotateZ(-15deg); }
        }
        @keyframes pur-tilt {
          0%   { transform: scale(1)    rotate(-7deg); }
          50%  { transform: scale(1.5)  rotate(-7deg); }
          100% { transform: scale(1.15) rotate(-7deg); }
        }
      `}</style>

      <a
        href="https://store.steampowered.com/curator/36333614/sale/persona"
        target="_blank"
        rel="noopener noreferrer"
        style={{ position: 'relative', display: 'inline-block', textDecoration: 'none', cursor: 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Jelly shape — behind text, visible on hover */}
        <div
          style={{
            position: 'absolute',
            inset: '0px -3px',
            filter: 'sepia(50%) saturate(3)',
            transform: 'rotate(-6deg)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.08s linear',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.8, overflow: 'hidden', transformOrigin: 'center',
            animation: hovered ? 'pur-jelly 0.45s 0.08s linear infinite' : 'none',
          }}>
            <svg viewBox="0 0 108.1 47" preserveAspectRatio="none" width="100%" height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}>
              <polygon fill="#FF0000" points="29.5,8.5 150.7,0 108.1,32.7 3.1,47" />
            </svg>
          </div>
          <div style={{
            mixBlendMode: 'screen',
            position: 'absolute', inset: 0, overflow: 'hidden', transformOrigin: 'center',
            animation: hovered ? 'pur-jelly 0.4s 0.05s linear infinite' : 'none',
          }}>
            <svg viewBox="0 0 108.1 47" preserveAspectRatio="none" width="100%" height="100%"
              style={{ position: 'absolute', top: 0, left: 0 }}>
              <polygon fill="#00FFFF" points="0.3,17 125.1,0 68.8,45.6 24.3,39" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'inline-flex', alignItems: 'baseline',
          padding: '3px 10px 5px',
          animation: hovered ? 'pur-tilt 0.15s ease forwards' : 'none',
        }}>
          {LETTERS.map((l, i) => {
            if (l.isSpace) return <span key={i} style={{ display: 'inline-block', width: '0.4em' }} />;
            return (
              <span key={i} style={{
                fontFamily: l.font.css,
                fontWeight: l.font.weight,
                fontSize: SIZE,
                display: 'inline-block',
                lineHeight: 1,
                textTransform: 'uppercase',
                userSelect: 'none',
                WebkitTextStroke: '3px #0d0d0d',
                paintOrder: 'stroke fill',
                WebkitTextFillColor: '#f5f0ea',
              }}>
                {l.ch}
              </span>
            );
          })}
        </div>
      </a>
    </>
  );
}
