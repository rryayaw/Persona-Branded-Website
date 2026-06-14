import { useEffect, useRef, useState } from 'react';
import { bgm, SONGS, getSongIndex, setSong, togglePlay, getAnalyser } from '../bgm.js';
import SectionDivider from './SectionDivider.jsx';

const AUTO_SPEED      = 1.5; // degrees per frame while playing (~4s / rev @60fps)
const SECONDS_PER_REV = 6;   // audio seconds scrubbed per full manual rotation

export default function MusicSection() {
  const [songIndex, setSongIndex] = useState(getSongIndex());
  const [playing, setPlaying]     = useState(!bgm.paused);
  const [hover, setHover]         = useState(-1);
  const [scrubbing, setScrubbing] = useState(false);

  const vinylRef     = useRef(null);
  const rotationRef  = useRef(0);
  const draggingRef  = useRef(false);
  const lastAngleRef = useRef(0);
  const playingRef   = useRef(playing);
  const bgCanvasRef  = useRef(null);
  const accentRef    = useRef(SONGS[songIndex].accent);

  accentRef.current = SONGS[songIndex].accent;

  useEffect(() => { playingRef.current = playing; }, [playing]);

  // Track play/pause to spin/stop the record
  useEffect(() => {
    const onPlay  = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    bgm.addEventListener('play', onPlay);
    bgm.addEventListener('pause', onPause);
    setPlaying(!bgm.paused);
    return () => {
      bgm.removeEventListener('play', onPlay);
      bgm.removeEventListener('pause', onPause);
    };
  }, []);

  // Single rotation driver: auto-spin while playing, manual while dragging
  useEffect(() => {
    let raf;
    const loop = () => {
      if (!draggingRef.current && playingRef.current) rotationRef.current += AUTO_SPEED;
      if (vinylRef.current) vinylRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Background waveform (live audio analyser, idle sine until it's available)
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf, phase = 0;
    let buf = null;
    let fbuf = null;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const analyser = getAnalyser();
      const color = accentRef.current;

      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 24;
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';

      ctx.beginPath();
      if (analyser) {
        if (!buf || buf.length !== analyser.fftSize) buf = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(buf);
        const n = buf.length;
        for (let i = 0; i < n; i++) {
          const x = (i / (n - 1)) * w;
          const v = (buf[i] - 128) / 128;       // -1..1
          const y = h / 2 + v * (h * 0.34);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
      } else {
        for (let x = 0; x <= w; x += 4) {
          const y = h / 2 + Math.sin(x * 0.012 + phase) * (h * 0.05);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
      }
      ctx.globalAlpha = 0.4;
      ctx.stroke();

      // faint mirrored fill under the wave
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      ctx.globalAlpha = 0.06;
      ctx.shadowBlur = 0;
      ctx.fill();
      ctx.restore();

      // Frequency-bar equalizer rising from the bottom edge
      ctx.save();
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      const BARS = 72;
      const bw = w / BARS;
      for (let i = 0; i < BARS; i++) {
        let v;
        if (analyser) {
          if (!fbuf || fbuf.length !== analyser.frequencyBinCount) fbuf = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(fbuf);
          const idx = Math.floor((i / BARS) * (fbuf.length * 0.7));
          v = fbuf[idx] / 255;
        } else {
          v = 0.12 + 0.10 * (0.5 + 0.5 * Math.sin(phase * 2 + i * 0.5));
        }
        const bh = v * h * 0.22;
        ctx.globalAlpha = 0.10 + v * 0.22;
        ctx.fillRect(i * bw + bw * 0.2, h - bh, bw * 0.6, bh);
      }
      ctx.restore();

      phase += 0.03;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  function pick(i) {
    setSong(i);
    setSongIndex(i);
  }

  // ── Drag-to-scrub ──
  function angleFromEvent(e) {
    const rect = vinylRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
  }
  function onPointerDown(e) {
    draggingRef.current = true;
    lastAngleRef.current = angleFromEvent(e);
    setScrubbing(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e) {
    if (!draggingRef.current) return;
    const a = angleFromEvent(e);
    let d = a - lastAngleRef.current;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    lastAngleRef.current = a;
    rotationRef.current += d;
    if (isFinite(bgm.duration) && bgm.duration > 0) {
      const dt = (d / 360) * SECONDS_PER_REV;
      bgm.currentTime = Math.min(Math.max(bgm.currentTime + dt, 0), bgm.duration - 0.05);
    }
  }
  function onPointerUp(e) {
    draggingRef.current = false;
    setScrubbing(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }

  const current = SONGS[songIndex];
  const spinning = playing || scrubbing;

  return (
    <section
      id="music"
      className="relative flex min-h-screen flex-col items-center justify-center gap-4 px-10 pb-20 pt-[80px]"
    >
      <style>{`@keyframes vinyl-none {}`}</style>

      <SectionDivider />

      {/* Live waveform background (full-bleed) */}
      <div
        style={{
          position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100vw', zIndex: 0, overflow: 'hidden', pointerEvents: 'none',
        }}
      >
        <canvas ref={bgCanvasRef} style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="relative z-10 flex w-full max-w-[1100px] items-center justify-center gap-20">
        {/* Record player */}
        <div className="relative shrink-0" style={{ width: 380, height: 380 }}>
          <div
            ref={vinylRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background:
                'repeating-radial-gradient(circle at center, #111 0px, #111 2px, #1c1c1c 3px, #1c1c1c 4px)',
              boxShadow: '0 18px 40px rgba(0,0,0,0.7), inset 0 0 60px rgba(0,0,0,0.9)',
              cursor: scrubbing ? 'grabbing' : 'grab',
              touchAction: 'none',
              willChange: 'transform',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none',
              background: 'conic-gradient(from 0deg, rgba(255,255,255,0.06), rgba(255,255,255,0) 90deg, rgba(255,255,255,0.06) 180deg, rgba(255,255,255,0) 270deg, rgba(255,255,255,0.06) 360deg)',
            }} />
            <div
              style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 150, height: 150, borderRadius: '50%',
                background: current.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 0 0 3px rgba(0,0,0,0.35)',
                padding: 22, pointerEvents: 'none',
              }}
            >
              <img
                src={current.logo}
                alt={current.game}
                draggable={false}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(1px 1px 0 rgba(0,0,0,0.5))' }}
              />
              <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 12, height: 12, borderRadius: '50%', background: '#0a0a0a' }} />
            </div>
          </div>

          {/* Tonearm */}
          <div
            style={{
              position: 'absolute', top: -14, right: -6, width: 150, height: 150,
              transformOrigin: '90% 10%',
              transform: spinning ? 'rotate(22deg)' : 'rotate(-2deg)',
              transition: 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)',
              pointerEvents: 'none',
            }}
          >
            <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: '#cfcfcf', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'absolute', top: 16, right: 16, width: 6, height: 120, background: 'linear-gradient(#e8e8e8,#9a9a9a)', borderRadius: 3, transform: 'rotate(35deg)', transformOrigin: 'top right' }} />
          </div>
        </div>

        {/* Song list */}
        <div className="flex-1">
          <h2 className="mb-1 flex items-end leading-none" style={{ fontStyle: 'italic' }}>
            {'Soundtrack'.toUpperCase().split('').map((ch, i) => {
              const special = ch === 'S' || ch === 'T';
              return special ? (
                <span
                  key={i}
                  style={{
                    fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700,
                    fontSize: '86px', lineHeight: 0.9,
                    background: '#f5f0ea', color: '#0d0d0d',
                    padding: '0 6px', margin: '0 3px',
                    display: 'inline-block',
                    boxShadow: '4px 4px 0 #d00010',
                  }}
                >
                  {ch}
                </span>
              ) : (
                <span
                  key={i}
                  style={{
                    fontFamily: "'Teko', sans-serif", fontWeight: 700,
                    fontSize: '46px', lineHeight: 1, color: '#f5f0ea',
                    textShadow: '3px 3px 0 #d00010',
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </h2>
          <div className="mb-5 h-[3px] w-[90px] bg-[#d00010]" />

          <ul className="flex flex-col gap-2">
            {SONGS.map((s, i) => {
              const selected = i === songIndex;
              const isHover  = i === hover;
              return (
                <li key={s.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => pick(i)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') pick(i); }}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(-1)}
                    className="flex w-full cursor-pointer items-center gap-4 px-4 py-3 text-left transition-all duration-200"
                    style={{
                      background: selected ? 'rgba(20,20,20,0.92)' : isHover ? 'rgba(20,20,20,0.6)' : 'transparent',
                      borderLeft: `4px solid ${selected ? s.accent : isHover ? '#555' : 'transparent'}`,
                      transform: selected ? 'translateX(6px)' : isHover ? 'translateX(3px)' : 'none',
                    }}
                  >
                    {/* Icon slot */}
                    <span className="flex h-7 w-9 shrink-0 items-center justify-center">
                      {selected ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                          aria-label={playing ? 'Pause' : 'Play'}
                          className="flex h-7 w-9 items-center justify-center"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {playing ? (
                            <span style={{ display: 'flex', gap: 4 }}>
                              <span style={{ width: 5, height: 18, background: s.accent, borderRadius: 1 }} />
                              <span style={{ width: 5, height: 18, background: s.accent, borderRadius: 1 }} />
                            </span>
                          ) : (
                            <span style={{ color: s.accent, fontSize: 16, lineHeight: 1 }}>▶</span>
                          )}
                        </button>
                      ) : isHover ? (
                        <span style={{ color: s.accent, fontSize: 16, lineHeight: 1 }}>▶</span>
                      ) : (
                        <span className="font-teko text-[20px] font-bold text-white/40">{i + 1}</span>
                      )}
                    </span>

                    <span className="flex flex-1 flex-col leading-tight">
                      <span className="font-teko text-[26px] font-bold uppercase leading-none" style={{ color: selected ? '#fff' : '#cfcfcf' }}>
                        {s.title}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: s.accent }}>
                        {s.game}
                      </span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
