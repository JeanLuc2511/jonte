// Maße des QUADRO-Systems. Schätzwerte – bei Gelegenheit nachmessen und hier
// korrigieren; alle Höhenangaben in der App passen sich dann automatisch an.
export const TUBE_LONG_CM = 100; // langes Rohr
export const TUBE_SHORT_CM = 50; // kurzes Rohr (≈ halbe Länge)

// Szenen-Einheiten: 1 langes Rohr = 1 Einheit, ein kurzes = 0,5 Einheiten.
// Daraus ergeben sich Feldbreite (immer 1) und Etagenhöhen (1 bzw. 0,5).
export const UNIT_LONG = 1;
export const UNIT_SHORT = 0.5;

// Farbwelt (QUADRO-Primärfarben + Werkbank-Look).
export const PALETTE = {
  bg: '#15171c',
  panel: '#1d2027',
  line: '#2a2e37',
  accent: '#ff8a1e',
  text: '#f4f5f7',
  muted: '#9aa0ad',
  red: 0xe2231a,
  blue: 0x0061b0,
  yellow: 0xffc60b,
  green: 0x00963f,
} as const;
