import { useEffect, useState } from 'react';
import PurchaseLink from './PurchaseLink.jsx';
import { bgm, toggleMute } from '../bgm.js';
import { toggleSfxMute, isSfxMuted } from '../sfx.js';

export default function Navbar() {
  // true while the hero section is the section in view
  const [inHero, setInHero] = useState(true);
  const [muted, setMuted] = useState(bgm.muted);
  const [sfxMuted, setSfxMuted] = useState(isSfxMuted());

  useEffect(() => {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInHero(entry.intersectionRatio >= 0.5),
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between bg-black px-[210px] py-3 border-b-2 border-[#d00010]">
      {/* Logo slot to keep a fixed footprint in the nav; the big logo overflows it */}
      <div className="relative h-11 w-[210px]">
        {/* Big logo*/}
        <img
          src="/logo.png"
          alt="Persona 5"
          draggable={false}
          style={{
            //outline
            filter:
              'drop-shadow(0.5px 0 0 #000) drop-shadow(-0.5px 0 0 #000) drop-shadow(0 1px 0 #000) drop-shadow(0 -1px 0 #000) drop-shadow(0.5px 1px 0 #000) drop-shadow(-0.5px 1px 0 #000) drop-shadow(0.5px -1px 0 #000) drop-shadow(-0.5px -1px 0 #000)',
          }}
          className={`pointer-events-none absolute -left-7 -top-5 w-[210px] origin-top-left object-contain transition-all duration-500 ease-out ${
            inHero ? 'scale-100 opacity-100' : 'scale-60 opacity-0'
          }`}
        />
        {/* small logo*/}
        <img
          src="/logo-p5.png"
          alt="Persona 5"
          draggable={false}
          className={`pointer-events-none absolute left-0 top-1/2 h-9 -translate-y-1/2 h-[50px] object-contain transition-all duration-700 ease-out ${
            inHero ? 'scale-100 opacity-0' : 'scale-100 opacity-100'
          }`}
        />
      </div>

      <div className="flex items-center gap-8">
        <PurchaseLink />
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMuted(toggleMute())}
            aria-label={muted ? 'Unmute music' : 'Mute music'}
            aria-pressed={muted}
            className={`relative flex h-9 w-9 items-center justify-center rounded-full bg-wire-block transition ${muted ? 'ring-2 ring-[#d00010]' : ''}`}
          >
            <img
              src="/assets/icon-music.png"
              alt="Music"
              className={`h-9 w-9 object-contain transition-opacity ${muted ? 'opacity-40' : 'opacity-100'}`}
            />
            {muted && (
              <span className="pointer-events-none absolute h-[2px] w-7 rotate-45 rounded-full bg-[#d00010]" />
            )}
          </button>
          <button
            onClick={() => setSfxMuted(toggleSfxMute())}
            aria-label={sfxMuted ? 'Unmute sound effects' : 'Mute sound effects'}
            aria-pressed={sfxMuted}
            className={`relative flex h-9 w-9 items-center justify-center rounded-full bg-wire-block transition ${sfxMuted ? 'ring-2 ring-[#d00010]' : ''}`}
          >
            <img
              src="/assets/icon-sound.png"
              alt="Sound"
              className={`h-8 w-8 object-contain transition-opacity ${sfxMuted ? 'opacity-40' : 'opacity-100'}`}
            />
            {sfxMuted && (
              <span className="pointer-events-none absolute h-[2px] w-7 rotate-45 rounded-full bg-[#d00010]" />
            )}
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-wire-block">
            <img src="/assets/icon-mail.png" alt="Mail" className="h-9 w-9 object-contain" />
          </button>
        </div>
      </div>
    </nav>
  );
}
