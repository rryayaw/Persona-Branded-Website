import { useState } from 'react';
import { playSound } from '../sfx.js';

const JELLY_KEYFRAMES = `
  @keyframes char-jelly {
    0%   { transform: scale(1.25,1)   skewX(20deg)  translateY(3px)  rotateX(40deg)  rotateY(10deg)  rotateZ(-10deg); }
    50%  { transform: scale(1.25,1.1) skewX(-15deg) translateY(-2px) translateZ(-30px); }
    100% { transform: scale(1.25,1)   skewX(20deg)  translateY(3px)  rotateX(-40deg) rotateY(-10deg) rotateZ(-15deg); }
  }
`;

const BOX_W = 270;
const BOX_H = 66;

export default function CharacterSelector({ chars, activeIndex, onSelect }) {
  return (
    <div className="flex flex-col gap-14">
      <style>{JELLY_KEYFRAMES}</style>
      {chars.map((c, i) => (
        <SelectorItem
          key={c.id}
          char={c}
          selected={i === activeIndex}
          onClick={() => { playSound('characterSelect'); onSelect(i); }}
        />
      ))}
    </div>
  );
}

function SelectorItem({ char, selected, onClick }) {
  const [hover, setHover] = useState(false);
  const active = selected;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'block',
        width: BOX_W,
        height: BOX_H,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        transform: active ? 'translateX(20px)' : hover ? 'translateX(8px)' : 'translateX(0)',
        transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* Moving cyan/red jelly shapes — only when selected */}
      <div
        style={{
          position: 'absolute', inset: '-8px -34px',
          filter: 'sepia(50%) saturate(3)',
          transform: 'rotate(-4deg)',
          opacity: active ? 1 : 0,
          transition: 'opacity 0.12s linear',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.85, overflow: 'hidden', transformOrigin: 'center',
          animation: active ? 'char-jelly 0.45s 0.08s linear infinite' : 'none',
        }}>
          <svg viewBox="0 0 108.1 47" preserveAspectRatio="none" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <polygon fill="#FF0000" points="29.5,8.5 150.7,0 108.1,32.7 3.1,47" />
          </svg>
        </div>
        <div style={{
          mixBlendMode: 'screen',
          position: 'absolute', inset: 0, overflow: 'hidden', transformOrigin: 'center',
          animation: active ? 'char-jelly 0.4s 0.05s linear infinite' : 'none',
        }}>
          <svg viewBox="0 0 108.1 47" preserveAspectRatio="none" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
            <polygon fill="#00FFFF" points="0.3,17 125.1,0 68.8,45.6 24.3,39" />
          </svg>
        </div>
      </div>

      {/* Black ransom box */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: '#0d0d0d',
          border: '2.5px solid #f5f0ea',
          boxShadow: '3px 3px 0 rgba(0,0,0,0.7)',
          clipPath: 'polygon(16px 0, 100% 0, calc(100% - 16px) 100%, 0 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          paddingRight: 22,
          opacity: active || hover ? 1 : 0.82,
          transition: 'opacity 0.2s ease',
        }}
      >
        <span style={{
          fontFamily: "'Teko', sans-serif", fontWeight: 700, fontSize: '1.7rem',
          textTransform: 'uppercase', color: '#f5f0ea', letterSpacing: '1px', lineHeight: 1,
          fontStyle: active ? 'italic' : 'normal',
          textShadow: active ? `3px 3px 0 ${char.accent || '#d00010'}` : 'none',
          transition: 'text-shadow 0.2s ease',
        }}>
          {char.name}
        </span>
      </div>

      {/* Character head popping out the left (cropped background window) */}
      <div
        style={{
          position: 'absolute', left: -16, bottom: 0, zIndex: 2,
          width: 96, height: BOX_H + 46,
          backgroundImage: `url(${char.img})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: char.pSize || '240%',
          backgroundPosition: char.pPos || '50% 4%',
          pointerEvents: 'none',
          filter: active
            ? 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'
            : 'grayscale(1) brightness(0.9) drop-shadow(2px 2px 3px rgba(0,0,0,0.7))',
          transform: active ? 'scale(1.24)' : 'scale(0.86)',
          transformOrigin: 'bottom left',
          transition: 'transform 0.28s cubic-bezier(0.34,1.56,0.64,1), filter 0.28s ease',
        }}
      />
    </button>
  );
}
