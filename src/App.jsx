import { useEffect, useState } from 'react';
import Loading from './components/Loading.jsx';
import Navbar from './components/Navbar.jsx';
import SectionNav from './components/SectionNav.jsx';
import HeroSection from './components/HeroSection.jsx';
import GamesSection from './components/GamesSection.jsx';
import CharactersSection from './components/CharactersSection.jsx';
import MusicSection from './components/MusicSection.jsx';
import NewsSection from './components/NewsSection.jsx';

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 5000);
    return () => clearTimeout(t);
  }, []);

  if (booting) return <Loading />;

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
