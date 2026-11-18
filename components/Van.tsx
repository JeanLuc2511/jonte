/** Illustrationen statt Fotos: Kastenwagen von der Seite und von oben. */

export function VanSeite({
  farbe = "#EED5C7", kontur = "#1E1409", className, lang = false,
}: { farbe?: string; kontur?: string; className?: string; lang?: boolean }) {
  const w = lang ? 360 : 320;
  const d = lang ? 40 : 0;
  return (
    <svg viewBox={`0 0 ${w} 140`} className={className} role="img" aria-label="Kastenwagen, Seitenansicht">
      <path
        d={`M18 26 Q18 16 28 16 H${206 + d} Q${218 + d} 16 ${226 + d} 26 L${258 + d} 62 L${294 + d} 70 Q${304 + d} 72 ${304 + d} 82 V106 Q${304 + d} 112 ${298 + d} 112 H24 Q18 112 18 106 Z`}
        fill={farbe} stroke={kontur} strokeWidth="3" strokeLinejoin="round"
      />
      <path d={`M${212 + d} 28 L${244 + d} 62 H${190 + d} V28 Z`} fill={kontur} opacity="0.82" />
      <path d={`M${180 + d} 20 V110`} stroke={kontur} strokeWidth="2" opacity="0.5" />
      <path d={`M${110 + d / 2} 20 V110`} stroke={kontur} strokeWidth="2" opacity="0.35" />
      <rect x={44} y={36} width={48 + d / 2} height={24} fill={kontur} opacity="0.82" />
      <path d={`M${166 + d} 70 h10`} stroke={kontur} strokeWidth="3" />
      <rect x={288 + d} y={80} width={16} height={8} fill="#FDE58B" stroke={kontur} strokeWidth="2" />
      <path d={`M18 96 H${304 + d}`} stroke={kontur} strokeWidth="2" opacity="0.35" />
      {[70, 248 + d].map((x) => (
        <g key={x}>
          <circle cx={x} cy={112} r={21} fill={kontur} />
          <circle cx={x} cy={112} r={9} fill={farbe} opacity="0.9" />
        </g>
      ))}
    </svg>
  );
}

/** Draufsicht für den Hallenplan. Gezeichnet mit Fahrtrichtung nach unten, Größe 100 × 220. */
export function VanOben({ farbe = "#EED5C7" }: { farbe?: string }) {
  const k = "#1E1409";
  return (
    <g>
      <rect x="2" y="150" width="8" height="12" fill={k} stroke={farbe} strokeWidth="1.5" />
      <rect x="90" y="150" width="8" height="12" fill={k} stroke={farbe} strokeWidth="1.5" />
      <path d="M10 8 Q10 2 16 2 H84 Q90 2 90 8 V190 Q90 216 50 218 Q10 216 10 190 Z" fill={farbe} stroke={k} strokeWidth="2" />
      <path d="M16 168 Q50 160 84 168 L80 190 Q50 184 20 190 Z" fill={k} opacity="0.82" />
      <rect x="18" y="12" width="64" height="134" fill="none" stroke={k} strokeWidth="1.5" opacity="0.35" />
      <rect x="36" y="44" width="28" height="28" fill="none" stroke={k} strokeWidth="1.5" opacity="0.5" />
      <path d="M18 6 H82" stroke={k} strokeWidth="2" opacity="0.5" />
    </g>
  );
}
