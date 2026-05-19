export default function GamesSection() {
  return (
    <section
      id="games"
      className="flex min-h-screen flex-col items-center justify-center gap-10 border-b border-wire-border px-10 pb-20 pt-[60px]"
    >
      <div className="flex w-full max-w-[700px] items-center gap-4">
        <button className="h-8 w-8 shrink-0 rounded-full bg-wire-block text-sm text-wire-text-dark">
          ‹
        </button>

        <div className="flex flex-1 items-center justify-center rounded-xl bg-wire-block p-4 text-center text-[13px] text-wire-text aspect-[4/3]">
          the game displayed
          <br />
          arrows for image scrolling
        </div>

        <div className="flex w-[240px] shrink-0 flex-col gap-3">
          <div className="flex h-[72px] items-center justify-center rounded-lg bg-wire-block text-[13px] text-wire-text-dark">
            title
          </div>
          <div className="flex min-h-[160px] flex-1 items-center justify-center rounded-lg bg-wire-block text-[13px] text-wire-text">
            description
          </div>
        </div>

        <button className="h-8 w-8 shrink-0 rounded-full bg-wire-block text-sm text-wire-text-dark">
          ›
        </button>
      </div>

      <div className="flex gap-2">
        <button className="rounded-lg bg-wire-block px-6 py-2 text-[13px] text-wire-text-dark">
          game 1
        </button>
        <button className="rounded-lg bg-wire-block px-6 py-2 text-[13px] text-wire-text-dark">
          game 2
        </button>
        <button className="rounded-lg bg-wire-block px-6 py-2 text-[13px] text-wire-text-dark">
          game 3
        </button>
      </div>
    </section>
  );
}
