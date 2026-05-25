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

// Play as soon as enough audio is buffered
bgm.addEventListener('canplaythrough', tryPlay, { once: true });

// Fallback: any user gesture (covers click, touch, keyboard)
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

// stage: 'loading' → 'transitioning' → 'app'
export default function App() {
  const [stage, setStage] = useState('loading');

  useEffect(() => {
    const t = setTimeout(() => setStage('transitioning'), 5000);
    return () => clearTimeout(t);
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
