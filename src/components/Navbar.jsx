export default function Navbar() {
  return (
    <nav className="sticky top-0 z-[100] flex items-center justify-between border-b border-wire-border bg-white px-6 py-3">
      <div className="h-11 w-[120px] rounded-lg bg-wire-block" />

      <div className="flex items-center gap-2.5">
        <button className="rounded-full bg-wire-block px-5 py-2 text-[13px] text-wire-text-dark">
          Purchase now
        </button>
        <button className="h-9 w-9 rounded-full bg-wire-block" />
        <button className="h-9 w-9 rounded-full bg-wire-block" />
        <button className="h-9 w-9 rounded-full bg-wire-block" />
      </div>
    </nav>
  );
}
