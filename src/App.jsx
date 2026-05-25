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

// Module-level singleton — survives StrictMode double-invoke and React remountsx
const bgm = new Audio('/assets/audio/bgm-song1-lastSuprise.mp3');
bgm.loop = true;
bgm.volume = 0.2;
bgm.preload = 'auto';

function AppContent() {
  return (
    <>
    <Navbar />
    <div className="flex min-h-screen pt-[68px]">
      <aside className="w-[200px] shrink-0 bg-wire-pink" />
      <main className="relative flex-1 bg-white">
        <SectionNav />
        <HeroSection />
        <GamesSection />
        <CharactersSection />
        <MusicSection />
        <NewsSection />
      </main>
      <aside className="w-[200px] shrink-0 bg-wire-pink" />
    </div>
    </>
  );
}

// stage: 'loading' → 'transitioning' → 'app'
export default function App() {
  const [stage, setStage] = useState('loading');
  useEffect(() => {
    const play = () => bgm.play().catch(() => {});

    play();

    // Fallback: start on first interaction if autoplay was blocked
    const onInteract = () => {
      if (bgm.paused) play();
      window.removeEventListener('click', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
    window.addEventListener('click', onInteract);
    window.addEventListener('keydown', onInteract);

    return () => {
      window.removeEventListener('click', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, []);

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
          <Loading />
        </TransitionWipe>
      )}
    </>
  );
}
