import { useCallback, useEffect, useState } from 'react';

import Loading from './components/Loading.jsx';
import TransitionWipe from './components/TransitionWipe.jsx';
import Navbar from './components/Navbar.jsx';
import SectionNav from './components/SectionNav.jsx';
import HeroSection from './components/HeroSection.jsx';
import GamesSection from './components/GamesSection.jsx';
import CharactersSection from './components/CharactersSection.jsx';
import MusicSection from './components/MusicSection.jsx';
import NewsSection from './components/NewsSection.jsx';
import { bgm } from './bgm.js';

function AppContent() {
  return (
    <>
    <Navbar />
    <div className="flex min-h-screen pt-[68px]">
      <aside className="w-[200px] shrink-0 bg-wire-pink opacity-0" />
      <main className="relative flex-1 bg-transparent">
        <SectionNav />
        <HeroSection />
        <GamesSection />
        <CharactersSection />
        <MusicSection />
        <NewsSection />
      </main>
      <aside className="w-[200px] shrink-0 bg-wire-pink opacity-0" />
    </div>
    </>
  );
}

const MIN_MS = 2500;  // minimum time to show the loading screen
const MAX_MS = 20000; // hard cap so a stuck/missing asset can't hang forever

// Heavy assets the main page renders only AFTER loading ends — preload them
// up front so the site is actually ready when the wipe reveals it.
const PRELOAD_IMAGES = [
  '/logo.png', '/logo-p5.png', '/city_background.jpg',
  '/assets/graphic-1.png',
  '/assets/rating-teen.svg', '/assets/logo-ps.svg', '/assets/logo-xbox.svg', '/assets/logo-steam.svg',
  '/assets/icon-mail.png', '/assets/icon-music.png', '/assets/icon-sound.png',
  '/assets/promo5-1.jpg', '/assets/promo4-1.avif', '/assets/promo3-1.avif',
  '/assets/title-persona5.png', '/assets/title-persona4.webp', '/assets/title-persona3.webp',
  '/assets/tv-games.png', '/assets/titlebox.png',
  '/assets/charbg-p5.png', '/assets/charbg-p4.jpg', '/assets/charbg-p3.jpg',
  '/assets/char-p5.png', '/assets/char-p4.png', '/assets/char-p3.png',
  '/assets/bigchar-p5.png', '/assets/bigchar-p4.png', '/assets/bigchar-p3.png',
];

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}

// stage: 'loading' -> 'transitioning' -> 'app'
export default function App() {
  const [stage, setStage] = useState('loading');

  useEffect(() => {
    let cancelled  = false;
    let advanced   = false;
    let minDone    = false;
    let assetsDone = false;

    function tryAdvance() {
      if (cancelled || advanced || !minDone || !assetsDone) return;
      advanced = true;
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
      setStage('transitioning');
    }

    // Minimum display time so the loading animation always plays
    const minTimer = setTimeout(() => { minDone = true; tryAdvance(); }, MIN_MS);
    // Safety cap: never wait longer than this even if an asset never resolves
    const maxTimer = setTimeout(() => { assetsDone = true; tryAdvance(); }, MAX_MS);

    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    const bgmReady = new Promise((resolve) => {
      if (bgm.readyState >= 4) return resolve();
      bgm.addEventListener('canplaythrough', resolve, { once: true });
      bgm.addEventListener('error', resolve, { once: true });
    });

    // Done when every image + the fonts + enough buffered audio are ready
    Promise.all([
      ...PRELOAD_IMAGES.map(preloadImage),
      fontsReady,
      bgmReady,
    ]).then(() => { assetsDone = true; tryAdvance(); });

    return () => {
      cancelled = true;
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, []);

  const handleTransitionComplete = useCallback(() => setStage('app'), []);

  return (
    <>
      {/* Standalone loading screen */}
      {stage === 'loading' && <Loading />}

      {/* App is the base layer once we leave loading — the wipe reveals it */}
      {stage !== 'loading' && <AppContent />}

      {/* Lightning wipe: Loading sits on top, clipped away from the bottom up */}
      {stage === 'transitioning' && (
        <TransitionWipe onComplete={handleTransitionComplete}>
          <Loading skipFade />
        </TransitionWipe>
      )}
    </>
  );
}
