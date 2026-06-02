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

const bgm = new Audio('/assets/audio/bgm-song1-lastSuprise.mp3');
bgm.loop = true;
bgm.volume = 0.2;
bgm.preload = 'auto';

const tryPlay = () => { if (bgm.paused) bgm.play().catch(() => {}); };


// play when enough of audio buffered
bgm.addEventListener('canplaythrough', tryPlay, { once: true });

['click', 'keydown', 'pointerdown'].forEach(evt =>
  window.addEventListener(evt, tryPlay, { once: true, passive: true })
);

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

const MIN_MS = 5000; // minimum time to show the loading screen

// stage: 'loading' -> 'transitioning' -> 'app'
export default function App() {
  const [stage, setStage] = useState('loading');

  useEffect(() => {
    let minDone   = false;
    let assetsDone = false;

    function tryAdvance() {
      if (minDone && assetsDone) setStage('transitioning');
    }

    // Minimum display time so the loading animation always plays
    const minTimer = setTimeout(() => { minDone = true; tryAdvance(); }, MIN_MS);

    //fire this when all resources r fully fetched
    if (document.readyState === 'complete') {
      assetsDone = true;
    } else {
      window.addEventListener('load', () => { assetsDone = true; tryAdvance(); }, { once: true });
    }

    // Fonts on top of window.load, just to be safe
    document.fonts.ready.then(() => { assetsDone = true; tryAdvance(); });

    return () => clearTimeout(minTimer);
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
