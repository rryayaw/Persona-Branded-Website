// Per-character title/affiliation styling.
//   variant 'mix'  → Joker: per-letter mix of the 3 SectionNav fonts
//   variant 'p4'   → Narukami: layered P4G outline (white fill, orange + black
//                    nested outlines, offset black backdrop), Clarendon italic
//   variant 'teko' → Makoto: Teko all-caps, white fill, blurry black drop shadow

const MIX_FONTS = [
  "'Teko', sans-serif",
  "'Cooper Black', serif",
  "Clarendon, Georgia, serif",
];

export default function CharName({ text, variant = 'teko', accent = '#d00010', size = 78, caps = false, color }) {
  const display = caps ? text.toUpperCase() : text;

  // ── Narukami / P4G layered outline ──
  if (variant === 'p4') {
    const outer = Math.max(2.4, size * 0.135); // outer black outline
    const mid   = Math.max(1.4, size * 0.075); // orange outline
    const inner = Math.max(0.6, size * 0.018); // thin black edge on white
    const off   = Math.max(2,   size * 0.07);  // backdrop offset
    const base = {
      position: 'absolute', left: 0, top: 0, margin: 0,
      fontFamily: "Clarendon, Georgia, serif", fontWeight: 700, fontStyle: 'italic',
      fontSize: size, lineHeight: 1, whiteSpace: 'nowrap',
    };
    return (
      <span style={{ position: 'relative', display: 'inline-block', lineHeight: 1 }}>
        {/* offset solid-black backdrop */}
        <span aria-hidden style={{ ...base, transform: `translate(${off}px, ${off}px)`,
          WebkitTextStroke: `${outer}px #0d0d0d`, WebkitTextFillColor: '#0d0d0d', paintOrder: 'stroke fill' }}>{display}</span>
        {/* black outer outline */}
        <span aria-hidden style={{ ...base, WebkitTextStroke: `${outer}px #0d0d0d`, WebkitTextFillColor: 'transparent', paintOrder: 'stroke' }}>{display}</span>
        {/* orangier-yellow outline */}
        <span aria-hidden style={{ ...base, WebkitTextStroke: `${mid}px #e8920e`, WebkitTextFillColor: 'transparent', paintOrder: 'stroke' }}>{display}</span>
        {/* white fill (in-flow, sizes the box) */}
        <span style={{ position: 'relative', fontFamily: "Clarendon, Georgia, serif", fontWeight: 700, fontStyle: 'italic',
          fontSize: size, lineHeight: 1, color: '#f5f0ea', WebkitTextStroke: `${inner}px #0d0d0d`, paintOrder: 'stroke fill' }}>{display}</span>
      </span>
    );
  }

  // ── Joker / 3-font ransom mix ──
  if (variant === 'mix') {
    const sh     = Math.max(3, size * 0.06);
    const stroke = Math.max(2, size * 0.07);
    return (
      <span style={{ display: 'inline-flex', alignItems: 'baseline', flexWrap: 'nowrap', whiteSpace: 'nowrap', lineHeight: 1 }}>
        {display.split('').map((ch, i) =>
          ch === ' '
            ? <span key={i} style={{ width: '0.3em', display: 'inline-block' }} />
            : <span key={i} style={{
                fontFamily: MIX_FONTS[i % MIX_FONTS.length], fontWeight: 700,
                fontSize: size, lineHeight: 1,
                WebkitTextStroke: `${stroke}px #0d0d0d`,
                paintOrder: 'stroke fill',
                WebkitTextFillColor: '#f5f0ea',
                textShadow: `${sh}px ${sh}px 0 ${accent}`,
              }}>{ch}</span>
        )}
      </span>
    );
  }

  // ── Makoto / Teko caps + blurry shadow (default) ──
  return (
    <span style={{
      fontFamily: "'Teko', sans-serif", fontWeight: 700, textTransform: 'uppercase',
      fontSize: size, lineHeight: 1, color: color || '#f5f0ea',
      textShadow: `${Math.max(2, size * 0.04)}px ${Math.max(3, size * 0.06)}px ${Math.max(4, size * 0.11)}px rgba(0,0,0,0.92)`,
    }}>{display}</span>
  );
}
