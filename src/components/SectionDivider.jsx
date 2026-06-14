// Full-bleed P5-style divider pinned to the top of a section to separate it
// from the one above. Accent line + diagonal hazard stripes over black.
export default function SectionDivider({ accent = '#d00010' }) {
  return (
    <div
      style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100vw', zIndex: 12, pointerEvents: 'none',
      }}
    >
      <div style={{ height: 5, background: accent }} />
      <div
        style={{
          height: 26, background: '#0a0a0a', overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
        }}
      >
        <div
          style={{
            width: '100%', height: '100%', opacity: 0.55,
            background: `repeating-linear-gradient(135deg, ${accent} 0 16px, transparent 16px 40px)`,
          }}
        />
      </div>
    </div>
  );
}
