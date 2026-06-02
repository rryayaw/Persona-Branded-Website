import { useEffect, useRef, useState } from 'react';
import GamesBackground from './GamesBackground.jsx';

// ── Game data ──────────────────────────────────────────────
const GAMES = [
  {
    id: 'p5r',
    name: 'Persona 5 Royal',
    title: '/assets/title-persona5.png',
    color: '#d00010',
    images: [
      '/assets/promo5-1.jpg',
      'https://placehold.co/1280x720/1a1a1a/d00010?text=Persona+5+Royal',
      'https://placehold.co/1280x720/d00010/ffffff?text=Persona+5+Royal',
    ],
    description:
      'Don the mask and take Tokyo by storm. As the Phantom Thieves of Hearts, infiltrate the twisted desires of corrupt adults and steal their distorted treasures. The definitive edition adds a new semester, a new confidant, and a brand-new palace.',
  },
  {
    id: 'p4g',
    name: 'Persona 4 Golden',
    title: '/assets/title-persona4.webp',
    color: '#f2c200',
    images: [
      '/assets/promo4-1.avif',
      'https://placehold.co/1280x720/1a1a1a/f2c200?text=Persona+4+Golden',
      'https://placehold.co/1280x720/f2c200/000000?text=Persona+4+Golden',
    ],
    description:
      'A foggy town, a string of murders, and a TV world only you can enter. Spend a year in rural Inaba uncovering the truth with your friends, balancing high-school life with dungeon-crawling. Golden adds new social links, scenes, and an epilogue.',
  },
  {
    id: 'p3r',
    name: 'Persona 3 Reload',
    title: '/assets/title-persona3.webp',
    titleScale: 1.45,
    color: '#1e6edc',
    images: [
      '/assets/promo3-1.avif',
      'https://placehold.co/1280x720/1a1a1a/1e6edc?text=Persona+3+Reload',
      'https://placehold.co/1280x720/1e6edc/ffffff?text=Persona+3+Reload',
    ],
    description:
      'Embrace your fate during the Dark Hour. Wield your Evoker, summon your Persona, and ascend Tartarus alongside SEES to confront the mystery of the Shadows. A full-scale remake of the game that started the modern Persona era.',
  },
];

// ── Screen rectangle inside tv-games.png (fractions of frame) ──
const SCREEN = { left: '11%', top: '10.5%', width: '63%', height: '71%' };

const TV_ON_MS  = 800; // first 0.8s of tv.mp4
const TV_OFF_MS = 550; // length of custom collapse

// ── SFX via Web Audio ──────────────────────────────────────
// Routed through a splitter→merger so the (left-only) source is
// duplicated to BOTH ears, with a gain stage for extra loudness.
const TV_ON_SRC  = '/assets/audio/tv-on.mp3';
const TV_OFF_SRC = '/assets/audio/tv-off.mp3';

let _actx = null;
const _bufs = {};
function _ctx() {
  if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
  return _actx;
}
function loadBuffer(url) {
  if (_bufs[url]) return _bufs[url];
  _bufs[url] = fetch(url).then(r => r.arrayBuffer()).then(a => _ctx().decodeAudioData(a));
  return _bufs[url];
}
[TV_ON_SRC, TV_OFF_SRC].forEach(loadBuffer); // warm cache

function playSfx(url, volume = 3.0) {
  loadBuffer(url).then(buf => {
    const ctx = _ctx();
    if (ctx.state === 'suspended') ctx.resume();
    const src = ctx.createBufferSource(); src.buffer = buf;

    // Down-mix source to a single (averaged) mono channel...
    const mono = ctx.createGain();
    mono.channelCount = 1;
    mono.channelCountMode = 'explicit';
    mono.channelInterpretation = 'speakers';

    // ...then a stereo gain re-broadcasts that mono to BOTH ears + boosts volume.
    const gain = ctx.createGain();
    gain.gain.value = volume;

    src.connect(mono);
    mono.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }).catch(() => {});
}

export default function GamesSection() {
  const [gameIndex, setGameIndex] = useState(0);
  const [imgIndex, setImgIndex]   = useState(0);
  const [tvState, setTvState]     = useState('off'); // 'off' | 'turning-on' | 'on' | 'turning-off'
  const [flick, setFlick]         = useState(false);
  const [visible, setVisible]     = useState(false);

  const game = GAMES[gameIndex];

  const sectionRef = useRef(null);
  const videoRef   = useRef(null);
  const stateRef   = useRef('off');
  const onTimer    = useRef(null);
  const offTimer   = useRef(null);
  const flickTimer = useRef(null);

  const setState = (s) => { stateRef.current = s; setTvState(s); };

  // ── Turn-on / turn-off sequences ──────────────────────────
  function turnOn() {
    if (stateRef.current === 'on' || stateRef.current === 'turning-on') return;
    clearTimeout(offTimer.current);
    setState('turning-on');
    playSfx(TV_ON_SRC);
    const v = videoRef.current;
    if (v) {
      try { v.currentTime = 0; v.muted = true; v.play().catch(() => {}); } catch { /* noop */ }
    }
    clearTimeout(onTimer.current);
    onTimer.current = setTimeout(() => {
      if (v) v.pause();
      setState('on');
    }, TV_ON_MS);
  }

  function turnOff() {
    if (stateRef.current === 'off' || stateRef.current === 'turning-off') return;
    clearTimeout(onTimer.current);
    setState('turning-off');
    playSfx(TV_OFF_SRC);
    clearTimeout(offTimer.current);
    offTimer.current = setTimeout(() => setState('off'), TV_OFF_MS);
  }

  // ── Visibility drives power ───────────────────────────────
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.45) { setVisible(true); turnOn(); }
        else { setVisible(false); turnOff(); }
      },
      { threshold: [0, 0.45, 1] }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(onTimer.current);
      clearTimeout(offTimer.current);
      clearTimeout(flickTimer.current);
    };
  }, []);

  // ── Brief CRT flicker on any image/game change ────────────
  function flicker() {
    setFlick(true);
    clearTimeout(flickTimer.current);
    flickTimer.current = setTimeout(() => setFlick(false), 160);
  }

  // ── Auto-advance to next game every 10s while visible ─────
  // Timer resets whenever gameIndex changes (incl. manual picks).
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      setGameIndex(i => (i + 1) % GAMES.length);
      setImgIndex(0);
      flicker();
    }, 10000);
    return () => clearTimeout(t);
  }, [gameIndex, visible]);

  function prevImg() { setImgIndex(i => (i - 1 + game.images.length) % game.images.length); flicker(); }
  function nextImg() { setImgIndex(i => (i + 1) % game.images.length); flicker(); }
  function pickGame(idx) {
    if (idx === gameIndex) return;
    setGameIndex(idx);
    setImgIndex(0);
    flicker();
  }

  const showImage = tvState === 'on' || tvState === 'turning-off';
  const showVideo = tvState === 'turning-on';

  return (
    <section
      ref={sectionRef}
      id="games"
      className="relative flex min-h-screen flex-col items-center justify-center gap-12 px-10 pb-20 pt-[80px]"
    >
      <style>{`
        @keyframes crt-off {
          0%   { transform: scale(1, 1);      filter: brightness(1);  opacity: 1; }
          45%  { transform: scale(1.04, 0.02); filter: brightness(3);  opacity: 1; }
          70%  { transform: scale(0.18, 0.012);filter: brightness(6);  opacity: 1; }
          100% { transform: scale(0, 0);       filter: brightness(8);  opacity: 0; }
        }
        @keyframes crt-roll {
          0%   { top: -30%; }
          100% { top: 130%; }
        }
        @keyframes crt-flick {
          0%,100% { filter: brightness(1) contrast(1.1) saturate(1.2); transform: translateX(0); }
          25%     { filter: brightness(1.8) contrast(1.3); transform: translateX(-1px); }
          50%     { filter: brightness(0.6); transform: translateX(1px); }
          75%     { filter: brightness(1.5); transform: translateX(-1px); }
        }
        .crt-img {
          filter: brightness(1.05) contrast(1.1) saturate(1.25);
        }
        .crt-img.flick { animation: crt-flick 0.16s steps(2) 1; }
        .crt-collapse { animation: crt-off ${TV_OFF_MS}ms cubic-bezier(0.4,0,0.6,1) forwards; transform-origin: center; }
        .crt-scan {
          position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(
            to bottom,
            rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px,
            rgba(0,0,0,0.16) 3px, rgba(0,0,0,0.16) 4px
          );
          mix-blend-mode: multiply;
        }
        .crt-roll-bar {
          position: absolute; left: 0; right: 0; height: 22%;
          background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 100%);
          animation: crt-roll 7s linear infinite; pointer-events: none;
        }
      `}</style>

      <GamesBackground activeIndex={gameIndex} />

      {/* ── Main row ── */}
      <div className="relative z-10 flex w-full max-w-[1100px] items-center justify-center gap-2">
        {/* Prev arrow */}
        <ArrowButton dir="left" color={game.color} onClick={prevImg} />

        {/* TV */}
        <div className="relative shrink-0" style={{ width: 'min(56vw, 620px)', aspectRatio: '1165 / 855' }}>
          {/* Ground shadow — elliptical cast shadow beneath the set */}
          <div
            style={{
              position: 'absolute', bottom: '-26px', left: '50%', transform: 'translateX(-50%)',
              width: '74%', height: '34px', zIndex: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0) 72%)',
              filter: 'blur(6px)',
            }}
          />
          {/* Screen sits behind the bezel PNG */}
          <div
            className="absolute overflow-hidden"
            style={{
              left: SCREEN.left, top: SCREEN.top, width: SCREEN.width, height: SCREEN.height,
              background: '#000',
              borderRadius: '10px / 14px',
              boxShadow: 'inset 0 0 55px rgba(0,0,0,0.9)',
            }}
          >
            {/* Collapsing wrapper (image + scanlines) */}
            <div
              className={tvState === 'turning-off' ? 'crt-collapse' : ''}
              style={{ position: 'absolute', inset: 0, opacity: showImage ? 1 : 0 }}
            >
              {GAMES.map((g, gi) =>
                g.images.map((src, ii) => {
                  const isCur = gi === gameIndex && ii === imgIndex;
                  return (
                    <img
                      key={`${gi}-${ii}`}
                      src={src}
                      alt={g.name}
                      draggable={false}
                      className={`crt-img ${flick && isCur ? 'flick' : ''}`}
                      style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                        objectFit: 'cover',
                        opacity: isCur && showImage ? 1 : 0,
                        transition: 'opacity 0.18s linear',
                      }}
                    />
                  );
                })
              )}
              <div className="crt-roll-bar" />
              <div className="crt-scan" />
              {/* Dark overlay — dims the bright screen */}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.34)', pointerEvents: 'none' }} />
            </div>

            {/* Turn-on video */}
            <video
              ref={videoRef}
              src="/assets/tv.mp4"
              muted
              playsInline
              preload="auto"
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover',
                display: showVideo ? 'block' : 'none',
              }}
            />
          </div>

          {/* Bezel frame on top */}
          <img
            src="/assets/tv-games.png"
            alt=""
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full select-none"
            style={{ zIndex: 2, filter: 'brightness(0.7)' }}
          />
        </div>

        {/* Next arrow — right of the TV */}
        <ArrowButton dir="right" color={game.color} onClick={nextImg} />

        {/* Title n description */}
        <div className="flex w-[340px] shrink-0 flex-col gap-5">
          <div className="flex h-[150px] items-center">
            <img
              src={game.title}
              alt={game.name}
              draggable={false}
              className="w-auto object-contain"
              style={{ maxHeight: `${130 * (game.titleScale || 1)}px`, filter: 'drop-shadow(2px 2px 0 rgba(0,0,0,0.8))' }}
            />
          </div>

          {/* Description card */}
          <div
            style={{
              background: game.color,
              clipPath: 'polygon(0 0, calc(100% - 44px) 0, 100% 44px, 100% 100%, 0 100%)',
              padding: '3px',
              transition: 'background 0.4s ease',
            }}
          >
            <div
              style={{
                background: '#0a0a0a',
                clipPath: 'polygon(0 0, calc(100% - 42px) 0, 100% 42px, 100% 100%, 0 100%)',
                padding: '22px 16px',
              }}
            >
              <p className="text-[13px] leading-[1.65] text-white">{game.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Game switcher ── */}
      <div className="relative z-10 flex gap-4">
        {GAMES.map((g, i) => {
          const active = i === gameIndex;
          return (
            <button
              key={g.id}
              onClick={() => pickGame(i)}
              className="font-teko text-[20px] font-bold uppercase tracking-wide transition-all duration-200"
              style={{
                color: active ? '#fff' : '#bbb',
                background: active ? g.color : 'rgba(20,20,20,0.85)',
                border: `2px solid ${active ? g.color : '#444'}`,
                padding: '6px 22px',
                clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)',
                transform: active ? 'translateY(-2px)' : 'none',
                boxShadow: active ? `3px 3px 0 rgba(0,0,0,0.6)` : 'none',
              }}
            >
              {g.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ── Arrow button (P5 style) ────────────────────────────────
function ArrowButton({ dir, color, onClick }) {
  const [hover, setHover] = useState(false);
  const left = dir === 'left';
  const tri = left
    ? { borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderRight: `13px solid ${hover ? '#0a0a0a' : '#fff'}` }
    : { borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: `13px solid ${hover ? '#0a0a0a' : '#fff'}` };
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative z-10 flex h-14 w-12 shrink-0 items-center justify-center"
      style={{
        background: hover ? color : 'rgba(10,10,10,0.85)',
        border: `2.5px solid ${color}`,
        transform: `skewX(${left ? '' : '-'}9deg)`,
        boxShadow: '2px 2px 0 rgba(0,0,0,0.6)',
        transition: 'background 0.15s ease',
      }}
      aria-label={left ? 'Previous image' : 'Next image'}
    >
      <span style={{ display: 'block', width: 0, height: 0, transform: `skewX(${left ? '-' : ''}9deg)`, ...tri }} />
    </button>
  );
}
