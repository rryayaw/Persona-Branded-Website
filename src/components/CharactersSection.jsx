const CHARS = [1, 2, 3, 4, 5];

export default function CharactersSection() {
  return (
    <section
      id="characters"
      className="flex min-h-screen flex-col items-center justify-center gap-8 border-b border-wire-border px-10 pb-20 pt-[60px]"
    >
      <div className="flex w-full max-w-[800px] items-start gap-6">
        <div className="flex w-[180px] shrink-0 flex-col gap-3">
          {CHARS.map((n) => (
            <button
              key={n}
              className="rounded-lg bg-wire-block px-[18px] py-4 text-left text-[13px] text-wire-text-dark"
            >
              char selector {n}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-start gap-5">
          <div className="flex w-[200px] shrink-0 items-center justify-center rounded-lg bg-wire-block text-xs text-wire-text aspect-[3/4]">
            character
          </div>
          <div className="flex-1">
            <div className="mb-4 text-[40px] font-bold tracking-[2px] text-wire-text-dark">
              NAME
            </div>
            <p className="text-sm leading-[1.8] text-wire-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
