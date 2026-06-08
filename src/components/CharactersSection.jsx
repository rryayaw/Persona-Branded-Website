import { useEffect, useRef, useState } from 'react';
import CharactersBackground from './CharactersBackground.jsx';
import CharacterSelector from './CharacterSelector.jsx';
import CharName from './CharName.jsx';

// One per background (P5 / P4 / P3). pSize/pPos frame the selector head crop.
const CHARS = [
  {
    id: 'p5', name: 'J0kER', accent: '#d00010', variant: 'mix',
    img: '/assets/char-p5.png', bigImg: '/assets/bigchar-p5.png',
    affiliation: 'Phantom Thieves of Hearts',
    desc: 'The charismatic transfer student and leader of the Phantom Thieves. A wild card who can wield countless Personas, he steals the corrupt hearts of a rotten world.',
    pSize: '250%', pPos: '48% 2%',
  },
  {
    id: 'p4', name: 'Narukami', accent: '#f2c200', variant: 'p4',
    img: '/assets/char-p4.png', bigImg: '/assets/bigchar-p4.png',
    affiliation: 'Investigation Team',
    desc: 'A composed transfer student who binds the Investigation Team together. Calm under pressure, he sees through the fog to drag the truth of Inaba into the light.',
    pSize: '230%', pPos: '50% 4%',
  },
  {
    id: 'p3', name: 'Makoto', accent: '#1e6edc', variant: 'teko',
    img: '/assets/char-p3.png', bigImg: '/assets/bigchar-p3.png',
    affiliation: 'S.E.E.S.',
    desc: 'The quiet leader who awakens to his Persona during the Dark Hour. Armed with his Evoker, he guides SEES up Tartarus to face the mystery of the Shadows.',
    pSize: '205%', pPos: '40% 1%',
  },
];

const OUT_MS = 360; // exit (slide-right) duration before swapping

export default function CharactersSection() {
  const [activeIndex, setActiveIndex]   = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [phase, setPhase]               = useState('in'); // 'in' | 'out'
  const outTimer = useRef(null);

  // When the selection changes, slide the current one out, then swap + slide in
  useEffect(() => {
    if (activeIndex === displayIndex) return;
    setPhase('out');
    clearTimeout(outTimer.current);
    outTimer.current = setTimeout(() => {
      setDisplayIndex(activeIndex);
      setPhase('in');
    }, OUT_MS);
    return () => clearTimeout(outTimer.current);
  }, [activeIndex, displayIndex]);

  const c = CHARS[displayIndex];
  const cls = (inClass) => (phase === 'out' ? 'cd-out' : inClass);

  return (
    <section
      id="characters"
      className="relative flex min-h-screen flex-col items-center justify-center px-10 pb-20 pt-[80px]"
    >
      <CharactersBackground activeIndex={activeIndex} />

      <style>{`
        @keyframes cd-slide-in {
          from { transform: translateX(-170px); opacity: 0; }
          to   { transform: translateX(0);       opacity: 1; }
        }
        @keyframes cd-slide-out {
          from { transform: translateX(0);      opacity: 1; }
          to   { transform: translateX(170px);  opacity: 0; }
        }
        .cd-in-big  { animation: cd-slide-in 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .cd-in-char { animation: cd-slide-in 0.55s cubic-bezier(0.22,1,0.36,1) 0.24s both; }
        .cd-in-info { animation: cd-slide-in 0.50s ease-out 0.40s both; }
        .cd-out     { animation: cd-slide-out 0.34s cubic-bezier(0.5,0,0.75,0) both; }
      `}</style>

      {/* Character art — anchored to the section bottom so bigchar reaches the edge */}
      <div
        key={`art-${displayIndex}`}
        className="absolute bottom-0 z-[8]"
        style={{ right: '7%', width: 500, height: '88%' }}
      >
        {/* bigchar — dimmed alt-art silhouette backdrop */}
        <img
          src={c.bigImg}
          alt=""
          draggable={false}
          className={`${cls('cd-in-big')} pointer-events-none absolute bottom-0 select-none`}
          style={{
            right: '90px',
            height: '100%',
            width: 'auto',
            maxWidth: 'none',
            zIndex: 1,
            opacity: 0.55,
            filter: `grayscale(0.55) brightness(0.5) contrast(1.1) drop-shadow(10px 5px 0 ${c.accent})`,
          }}
        />

        {/* char — main vivid character with accent glow */}
        <img
          src={c.img}
          alt={c.name}
          draggable={false}
          className={`${cls('cd-in-char')} pointer-events-none absolute bottom-0 select-none`}
          style={{
            right: '60px',
            height: '90%',
            width: 'auto',
            maxWidth: 'none',
            zIndex: 2,
            filter: `drop-shadow(3px 5px 6px rgba(0,0,0,0.6)) drop-shadow(0 0 48px ${c.accent}bb)`,
          }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-[1200px] items-center gap-12">
        {/* Selectors */}
        <CharacterSelector chars={CHARS} activeIndex={activeIndex} onSelect={setActiveIndex} />

        {/* Name + affiliation + description */}
        <div key={`info-${displayIndex}`} className={`${cls('cd-in-info')} w-[360px]`}>
          <div className="mb-2">
            <CharName
              text={c.affiliation}
              variant={c.variant}
              accent={c.accent}
              size={22}
              caps
              color={c.variant === 'teko' ? c.accent : undefined}
            />
          </div>
          {c.variant === 'mix' ? (
            <div
              style={{
                display: 'inline-block',
                backgroundImage: 'url(/assets/titlebox.png)',
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                padding: '3px 52px 9px 60px',
              }}
            >
              <CharName text={c.name} variant={c.variant} accent={c.accent} size={70} />
            </div>
          ) : (
            <CharName
              text={c.name}
              variant={c.variant}
              accent={c.accent}
              size={c.variant === 'p4' ? 64 : 78}
              caps={c.variant === 'teko'}
            />
          )}
          <div className="my-4 h-[3px] w-[120px]" style={{ background: c.accent }} />
          <p className="text-[13.5px] leading-[1.7] text-white">{c.desc}</p>
        </div>
      </div>
    </section>
  );
}
