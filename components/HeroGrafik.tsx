/** Illustration für den Hero: ein Kastenwagen in der Werkstattbucht, gezeichnet statt fotografiert. */
export function HeroGrafik({ className }: { className?: string }) {
  const g = "#FDE58B";
  const k = "#1E1409";
  const sand = "#EED5C7";
  const holz = "#A38879";
  return (
    <svg viewBox="0 0 640 520" className={className} role="img" aria-label="Illustration: ein Kastenwagen steht in einer Werkstattbucht, an der Wand hängt Werkzeug">
      {/* Sonne der Marke */}
      <circle cx="430" cy="210" r="200" fill={g} />
      {/* Hallenwand mit Werkzeug */}
      <g stroke="#331654" strokeWidth="3" fill="none" strokeLinecap="square">
        <path d="M250 96h300" />
        <path d="M290 96v54M278 150h24" />
        <path d="M340 96v30l-12 26h24l-12-26" />
        <path d="M392 96v20M376 116h32v34h-32z" />
        <path d="M450 96v62M438 108h24" />
        <path d="M508 96v16M492 112h32l-6 40h-20z" />
      </g>
      {/* Boden */}
      <path d="M0 438H640" stroke={holz} strokeWidth="3" />
      <path d="M40 470H600" stroke={g} strokeWidth="4" strokeDasharray="26 16" />
      <text x="44" y="504" fontFamily="var(--font-condensed)" fontWeight="700" fontSize="15" letterSpacing="4" fill={holz}>WERKSTATTBUCHT 03</text>
      {/* Kastenwagen */}
      <g transform="translate(40 196) scale(1.62)">
        <path d="M18 26 Q18 16 28 16 H206 Q218 16 226 26 L258 62 L294 70 Q304 72 304 82 V106 Q304 112 298 112 H24 Q18 112 18 106 Z" fill={sand} stroke={k} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M212 28 L244 62 H190 V28 Z" fill={k} />
        <path d="M180 20 V110M110 20V110" stroke={k} strokeWidth="1.5" opacity="0.4" />
        {/* frisch gesägter Fensterausschnitt */}
        <rect x="42" y="34" width="52" height="28" fill="#7934C7" stroke={k} strokeWidth="2" />
        <path d="M42 34l52 28M94 34L42 62" stroke={k} strokeWidth="1" opacity="0.35" />
        {/* Dachhaube */}
        <rect x="120" y="8" width="34" height="8" fill={k} />
        <rect x="288" y="80" width="16" height="8" fill={g} stroke={k} strokeWidth="1.5" />
        <path d="M18 96H304" stroke={k} strokeWidth="1.5" opacity="0.3" />
        <path d="M166 70h10" stroke={k} strokeWidth="2.5" />
        {[70, 248].map((x) => (
          <g key={x}>
            <circle cx={x} cy="112" r="21" fill={k} />
            <circle cx={x} cy="112" r="9" fill={sand} />
          </g>
        ))}
      </g>
      {/* Werkzeugwagen */}
      <g stroke={k} strokeWidth="3">
        <rect x="556" y="366" width="64" height="62" fill="#7934C7" />
        <path d="M556 388h64M556 408h64" />
        <circle cx="568" cy="434" r="6" fill={k} /><circle cx="608" cy="434" r="6" fill={k} />
      </g>
    </svg>
  );
}
