export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[90vh] flex-col items-center justify-center gap-8 border-b border-wire-border px-10 pb-20 pt-[60px] text-center"
    >
      <div className="absolute inset-x-[60px] bottom-20 top-10 z-[1] flex items-center justify-center rounded-xl bg-[#e8e8e8] text-base text-wire-text">
        Big graphic as a background
      </div>

      <div className="absolute inset-x-10 bottom-10 z-[2] flex items-end justify-between gap-6">
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
