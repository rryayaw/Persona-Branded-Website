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

function AppContent() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-[200px] shrink-0 bg-wire-pink" />
      <main className="relative flex-1 bg-white">
        <Navbar />
        <SectionNav />
        <HeroSection />
        <GamesSection />
        <CharactersSection />
        <MusicSection />
        <NewsSection />
      </main>
      <aside className="w-[200px] shrink-0 bg-wire-pink" />
    </div>
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
          <Loading />
        </TransitionWipe>
      )}
    </>
  );
}
