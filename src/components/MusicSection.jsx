const SONGS = [1, 2, 3, 4, 5];

export default function MusicSection() {
  return (
    <section
      id="music"
      className="mx-auto flex min-h-screen w-full max-w-[800px] flex-col justify-center gap-6 border-b border-wire-border px-10 pb-20 pt-[60px]"
    >
      <div>
        <div className="text-[15px] text-wire-text">Now playing:</div>
        <div className="mt-1 text-4xl text-wire-text-dark">Song 2</div>
      </div>

      <div className="mt-3 flex flex-col gap-3.5">
        {SONGS.map((n) => (
          <div key={n} className="flex items-center gap-4">
            <div className="h-11 w-11 shrink-0 rounded-full bg-wire-block" />
            <div className="flex h-[60px] flex-1 items-center rounded-lg bg-wire-block px-5 text-sm text-wire-text-dark">
              song selector {n}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
