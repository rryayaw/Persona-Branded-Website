const LINKS = [
  { href: '#hero', label: 'section selector 1' },
  { href: '#games', label: 'section selector 2' },
  { href: '#characters', label: 'section selector 3' },
  { href: '#music', label: 'section selector 4' },
  { href: '#news', label: 'section selector 5' },
];

export default function SectionNav() {
  return (
    <div className="fixed right-[152px] top-1/2 z-[99] flex -translate-y-1/2 flex-col gap-2">
      {LINKS.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className="block whitespace-nowrap rounded-lg bg-wire-block px-3.5 py-[7px] text-[11px] text-wire-text-dark no-underline transition-colors hover:bg-wire-block-dark"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
