import { useEffect, useState } from 'react';

export default function Navbar() {
  // true while the hero section is the section in view
  const [inHero, setInHero] = useState(true);

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
    <nav className="sticky top-0 z-[100] flex items-center justify-between border-b border-wire-border bg-neutral-800 px-6 py-3">
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
          src="/p5_logo.png"
          alt="Persona 5"
          draggable={false}
          className={`pointer-events-none absolute left-0 top-1/2 h-9 -translate-y-1/2 h-[50px] object-contain transition-all duration-700 ease-out ${
            inHero ? 'scale-100 opacity-0' : 'scale-100 opacity-100'
          }`}
        />
      </div>

      <div className="flex items-center gap-2.5">
        <button className="rounded-full bg-wire-block px-5 py-2 text-[13px] text-wire-text-dark">
          Purchase now
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-wire-block">
          <img src="/assets/icon_music.png" alt="Music" className="h-9 w-9 object-contain" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-wire-block">
          <img src="/assets/icon_sound.png" alt="Sound" className="h-8 w-8 object-contain" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-wire-block">
          <img src="/assets/icon_mail.png" alt="Mail" className="h-9 w-9 object-contain" />
        </button>
      </div>
    </nav>
  );
}
