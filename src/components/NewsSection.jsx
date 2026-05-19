const NEWS = [1, 2, 3, 4, 5];

export default function NewsSection() {
  return (
    <section
      id="news"
      className="mx-auto flex min-h-screen w-full max-w-[800px] flex-col justify-center gap-7 px-10 pb-20 pt-[60px]"
    >
      <div className="text-[44px] font-bold tracking-[4px] text-wire-text-dark">NEWS</div>

      <div className="flex items-stretch gap-5">
        <div className="min-h-[300px] flex-1 rounded-xl bg-wire-block p-7">
          <div className="mb-4 text-base italic text-wire-text-dark">news title</div>
          <p className="text-center text-[13px] leading-[1.8] text-wire-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>

        <div className="flex w-[280px] shrink-0 flex-col gap-2.5">
          {NEWS.map((n) => (
            <div
              key={n}
              className="flex h-[54px] cursor-pointer items-center rounded-lg bg-wire-block px-5 text-sm text-wire-text-dark"
            >
              news {n}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
