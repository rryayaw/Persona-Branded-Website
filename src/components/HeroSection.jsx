import { useEffect, useState } from 'react';
import HeroBackground from './HeroBackground.jsx';
import GlassShards from './GlassShards.jsx';

const POP_DURATION = 1200; // ms delay before graphic animates in

export default function HeroSection() {
  const [popped, setPopped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPopped(true), POP_DURATION);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="hero"
      className="relative flex min-h-[90vh] flex-col items-center justify-center gap-8 border-b border-wire-border px-10 pb-20 pt-[60px] text-center bg-transparent"
    >
      <style>{`
        @keyframes graphic-pop {
          0%   { transform: scale(0.45) rotate(-8deg) translateY(80px); opacity: 0; }
          60%  { transform: scale(1.42) rotate(1deg) translateY(-8px); opacity: 1; }
          80%  { transform: scale(1.38) rotate(-1deg) translateY(4px); }
          100% { transform: scale(1.4) rotate(0deg) translateY(0px); opacity: 1; }
        }
        @keyframes graphic-hover {
          0%, 100% { transform: scale(1.4) translateY(0px) rotate(0deg); }
          50%       { transform: scale(1.4) translateY(-14px) rotate(0.6deg); }
        }
        .graphic-pop {
          animation:
            graphic-pop  1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
            graphic-hover 4s ease-in-out 0.85s infinite;
        }
      `}</style>

      <HeroBackground />
      <GlassShards />
      <img
        src="/assets/graphic-1.png"
        alt=""
        draggable={false}
        className={`absolute inset-x-[60px] bottom-20 top-10 z-[1] h-[calc(100%-120px)] w-[calc(100%-120px)] object-contain ${popped ? 'graphic-pop' : 'opacity-0'}`}
        style={{ filter: 'drop-shadow(3px 3px 0 #FF0000)' }}
      />

      <div className="absolute inset-x-10 bottom-10 z-[3] flex items-end justify-between gap-6">
        <div className="h-[70px] w-[100px] rounded-lg bg-wire-block" />

        <div className="absolute left-1/2 w-[360px] -translate-x-1/2 text-center">
          <p className="text-[13px] leading-[1.7] text-wire-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <div className="mt-4 text-center text-xl text-wire-block-dark">▼</div>
        </div>

        <div className="flex h-[70px] w-[200px] items-center justify-center rounded-lg bg-wire-block text-[13px] text-wire-text-dark">
          Available on
        </div>
      </div>
    </section>
  );
}
