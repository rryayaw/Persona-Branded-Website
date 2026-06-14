import { useEffect, useRef, useState } from 'react';
import SectionDivider from './SectionDivider.jsx';

// ── Tunables ──
const INCLINE_DEG = -20; // incline of the background text bands (set to -60 for a literal 60°)
const BG_GREY     = '#242424';
const LINE_GREY   = '#5e5e5e';

// Images live in /assets/news#.png, mapped by content (news5/news6 are the
// unused trailer alternatives, so the gameplay item uses news7).
const NEWS_ITEMS = [
  { id: 1,  img: '/assets/news1.png',  game: 'Persona 6',        tag: 'Announcement',     accent: '#2fbf71', title: 'Persona 6 Officially Announced',
    description: 'Atlus has officially announced Persona 6, the next mainline entry in the Persona series. The game will feature an all-new cast, a brand-new story, and a fresh setting while continuing the blend of daily life simulation and supernatural adventure that defines the franchise. More details will be shared at a later date.' },
  { id: 2,  img: '/assets/news2.png',  game: 'Persona 6',        tag: 'Update',           accent: '#2fbf71', title: 'New Persona 6 Information Coming After Persona 4 Revival',
    description: 'Persona Studio Director Kazuhisa Wada has confirmed that additional information regarding Persona 6 will be revealed following the release of Persona 4 Revival. The development team remains hard at work on the project and looks forward to sharing more of its progress in the future. Fans are encouraged to stay tuned for upcoming announcements.' },
  { id: 3,  img: '/assets/news3.png',  game: 'Persona 4 Remake', tag: 'Announcement',     accent: '#f2c200', title: 'Persona 4 Remake Officially Revealed',
    description: 'Atlus has officially unveiled a remake of Persona 4, bringing the beloved mystery adventure to modern platforms. The project features updated visuals, enhanced animations, and gameplay improvements while preserving the charm of the original experience.' },
  { id: 4,  img: '/assets/news4.png',  game: 'Persona 4 Remake', tag: 'Developer Message', accent: '#f2c200', title: 'Revisit Inaba Once More',
    description: 'The development team is excited to revisit the world of Persona 4 and bring the experience to a new generation of players. While preserving the spirit of the original game, Persona 4 Revival seeks to enhance its presentation and accessibility on modern platforms. The team thanks fans for their continued support and enthusiasm.' },
  { id: 5,  img: '/assets/news7.png',  game: 'Persona 4 Remake', tag: 'Trailer',          accent: '#f2c200', title: 'First Gameplay Footage Showcased',
    description: 'The latest trailer offers a glimpse into the reimagined town of Inaba, featuring updated character models, modernized environments, and enhanced battle sequences. Fans quickly noticed several visual references to iconic scenes from the original game.' },
  { id: 6,  img: '/assets/news8.png',  game: 'Persona 3 Reload', tag: 'Patch',            accent: '#1e6edc', title: 'Version 1.1.0 Released',
    description: 'A new update for Persona 3 Reload is now available across all platforms. The patch includes performance optimizations, bug fixes, and several quality-of-life improvements requested by the community.' },
  { id: 7,  img: '/assets/news9.png',  game: 'Persona 3 Reload', tag: 'DLC',              accent: '#1e6edc', title: 'Episode Aigis Launches Next Month',
    description: 'Atlus has confirmed the release date for Episode Aigis, the highly anticipated story expansion for Persona 3 Reload. Players will continue the journey through new story chapters, battles, and character interactions.' },
  { id: 8,  img: '/assets/news10.png', game: 'Persona 3 Reload', tag: 'Milestone',        accent: '#1e6edc', title: 'Persona 3 Reload Becomes the Fastest-Selling Atlus Game',
    description: 'Persona 3 Reload continues to perform strongly worldwide, reaching another impressive sales milestone. Atlus thanked players for their support and celebrated the achievement with commemorative artwork.' },
  { id: 9,  img: '/assets/news11.png', game: 'Persona 5 Royal',  tag: 'Spotlight',        accent: '#d00010', title: 'The Lasting Impact of Persona 5 Royal',
    description: 'Years after its release, Persona 5 Royal continues to attract new players thanks to its stylish presentation, memorable cast, and engaging social systems. The game remains one of Atlus\' most successful titles to date.' },
  { id: 10, img: '/assets/news12.png', game: 'Persona 5 Royal',  tag: 'Community',         accent: '#d00010', title: 'Favorite Phantom Thief Poll Results Revealed',
    description: 'Thousands of fans participated in a recent community poll to determine the most popular member of the Phantom Thieves. The results sparked lively discussions and friendly debates across social media platforms.' },
];

function Marquee({ text, dir, fontSize, repeat, dur, mt = 0 }) {
  const seg = text.repeat(repeat);
  return (
    <div style={{ overflow: 'hidden', width: '100%', marginTop: mt }}>
      <div
        style={{
          display: 'inline-flex', whiteSpace: 'nowrap',
          animation: `${dir === 'left' ? 'news-left' : 'news-right'} ${dur}s linear infinite`,
        }}
      >
        {[0, 1].map((k) => (
          <span key={k} style={{ fontFamily: "'Teko', sans-serif", fontWeight: 700, fontSize, lineHeight: 1, color: LINE_GREY }}>
            {seg}
          </span>
        ))}
      </div>
    </div>
  );
}

function Band({ topPct, dir }) {
  return (
    <div
      style={{
        position: 'absolute', top: `${topPct}%`, left: '50%',
        width: '170vw', transform: `translateX(-50%) rotate(${INCLINE_DEG}deg)`,
        transformOrigin: 'center', pointerEvents: 'none',
      }}
    >
      <Marquee text="S.E.E.S. " dir={dir} fontSize="210px" repeat={16} dur={380} />
      <Marquee text="NEWS " dir={dir} fontSize="66px" repeat={30} dur={125} mt={-50} />
    </div>
  );
}

function NewsCard({ item, onClick }) {
  return (
    <div className="news-card" onClick={onClick} style={{ '--accent': item.accent }}>
      <img src={item.img} alt="" draggable={false} style={{ width: '100%', height: 'auto', display: 'block' }} />
      <div style={{ padding: '12px 14px 16px' }}>
        <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: item.accent }}>
          <strong style={{ fontWeight: 900 }}>[ {item.tag} ]</strong>
          <span style={{ fontWeight: 600, opacity: 0.85 }}> {item.game}</span>
        </div>
        <h3 className="font-teko" style={{ marginTop: 3, fontSize: 23, fontWeight: 700, lineHeight: 1.05, color: '#0d0d0d', textTransform: 'uppercase' }}>
          {item.title}
        </h3>
        <p
          style={{
            marginTop: 6, fontSize: 13, lineHeight: 1.5, color: '#333',
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}
        >
          {item.description}
        </p>
      </div>
    </div>
  );
}

function NewsModal({ item, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.82)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex', width: '100%', maxWidth: 1000, maxHeight: '82vh',
          background: '#f5f0ea', boxShadow: `10px 10px 0 ${item.accent}`, overflow: 'hidden',
        }}
      >
        <div style={{ width: '48%', flexShrink: 0, background: '#000' }}>
          <img src={item.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ flex: 1, padding: '32px 34px', overflowY: 'auto', position: 'relative' }}>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ position: 'absolute', top: 14, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 28, lineHeight: 1, color: '#0d0d0d' }}
          >
            ×
          </button>
          <div className="font-teko" style={{ fontSize: 15, letterSpacing: 2, textTransform: 'uppercase', color: item.accent }}>
            <strong style={{ fontWeight: 900 }}>[ {item.tag} ]</strong>
            <span style={{ fontWeight: 600, opacity: 0.85 }}> {item.game}</span>
          </div>
          <h2 className="font-teko" style={{ fontSize: 42, fontWeight: 700, lineHeight: 1, textTransform: 'uppercase', color: '#0d0d0d', marginTop: 4 }}>
            {item.title}
          </h2>
          <div style={{ height: 3, width: 90, background: item.accent, margin: '14px 0 16px' }} />
          <p style={{ fontSize: 15, lineHeight: 1.7, color: '#222' }}>{item.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function NewsSection() {
  const [selected, setSelected] = useState(null);
  // 'left' = waiting below (slides in from left), 'in' = visible,
  // 'right' = scrolled past (slides out to the right)
  const [pos, setPos] = useState('left');
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setPos('in');
      else setPos(e.boundingClientRect.top < 0 ? 'right' : 'left');
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="news" className="relative flex min-h-screen flex-col items-center px-10 pb-24 pt-[100px]">
      <SectionDivider />
      <style>{`
        @keyframes news-left  { from { transform: translateX(0); }     to { transform: translateX(-50%); } }
        @keyframes news-right { from { transform: translateX(-50%); }  to { transform: translateX(0); } }
        .news-card {
          break-inside: avoid;
          margin-bottom: 18px;
          background: #f5f0ea;
          box-shadow: 5px 5px 0 #000;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .news-card:hover {
          transform: translate(-2px, -3px);
          box-shadow: 8px 9px 0 var(--accent, #d00010);
        }
      `}</style>

      {/* Background: inclined scrolling text bands */}
      <div
        style={{
          position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100vw', zIndex: 0, overflow: 'hidden', background: BG_GREY,
        }}
      >
        <Band topPct={16} dir="left" />
        <Band topPct={47} dir="right" />
        <Band topPct={78} dir="left" />
      </div>

      {/* Heading — slides in/out with the section */}
      <h2
        className="font-teko relative z-10 mb-8 text-[64px] font-bold uppercase italic leading-none text-white"
        style={{
          textShadow: '4px 4px 0 #d00010',
          transform: pos === 'in' ? 'translateX(0)' : pos === 'right' ? 'translateX(160%)' : 'translateX(-160%)',
          opacity: pos === 'in' ? 1 : 0,
          transition: 'transform 0.6s cubic-bezier(0.5, 0, 0.2, 1), opacity 0.45s ease',
        }}
      >
        Latest News
      </h2>

      {/* 5-column masonry of cards */}
      <div className="relative z-10 w-full max-w-[1200px]" style={{ columnCount: 5, columnGap: '18px' }}>
        {NEWS_ITEMS.map((item) => (
          <NewsCard key={item.id} item={item} onClick={() => setSelected(item)} />
        ))}
      </div>

      {selected && <NewsModal item={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
