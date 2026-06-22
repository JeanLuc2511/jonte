import { TUBE_LONG_CM, TUBE_SHORT_CM, UNIT_LONG, UNIT_SHORT } from './constants';
import type { BuiltModel, ModelDef, Part, Step, TubeLen } from './types';

// rot, blau, gelb, grün
const TUBE_COLORS = [0xe2231a, 0x0061b0, 0xffc60b, 0x00963f];

export const COLOR_NAME: Record<number, string> = {
  0xe2231a: 'rot',
  0x0061b0: 'blau',
  0xffc60b: 'gelb',
  0x00963f: 'grün',
};

// Deterministische, bunt gemischte Farbverteilung (wie im echten Set).
const colorFor = (i: number, j: number, k: number, d: number) =>
  TUBE_COLORS[(i * 7 + j * 5 + k * 3 + d * 11) % 4];

/** Höhe der Ebene k in Szenen-Einheiten (langes Rohr = 1, kurzes = 0,5). */
export function levelToY(levelHeights: TubeLen[], k: number): number {
  let y = 0;
  for (let e = 0; e < k && e < levelHeights.length; e++) {
    y += levelHeights[e] === 'long' ? UNIT_LONG : UNIT_SHORT;
  }
  return y;
}

/** Höhe der Ebene k in Zentimetern. */
export function levelToCm(levelHeights: TubeLen[], k: number): number {
  let cm = 0;
  for (let e = 0; e < k && e < levelHeights.length; e++) {
    cm += levelHeights[e] === 'long' ? TUBE_LONG_CM : TUBE_SHORT_CM;
  }
  return cm;
}

export function buildModel(m: ModelDef): BuiltModel {
  const parts: Part[] = [];
  const steps: Step[] = [];
  const { w, d } = m.base;
  const H = m.levelHeights.length;

  // Schritt 0: Grundrahmen flach auf den Boden
  let s = 0;
  for (let i = 0; i <= w; i++) for (let j = 0; j <= d; j++) parts.push({ type: 'node', step: s, a: [i, j, 0] });
  for (let j = 0; j <= d; j++)
    for (let i = 0; i < w; i++)
      parts.push({ type: 'tube', step: s, a: [i, j, 0], b: [i + 1, j, 0], color: colorFor(i, j, 0, 0), len: 'long' });
  for (let i = 0; i <= w; i++)
    for (let j = 0; j < d; j++)
      parts.push({ type: 'tube', step: s, a: [i, j, 0], b: [i, j + 1, 0], color: colorFor(i, j, 0, 1), len: 'long' });
  steps.push({
    kicker: 'Grundrahmen',
    title: 'Grundrahmen flach auf den Boden legen',
    hint: 'Erst das ganze Bodenquadrat legen und prüfen, ob die Ecken rechtwinklig sind.',
  });

  for (let e = 0; e < H; e++) {
    const len = m.levelHeights[e];
    // senkrechte Rohre + obere Knoten
    s++;
    for (let i = 0; i <= w; i++)
      for (let j = 0; j <= d; j++) {
        parts.push({ type: 'node', step: s, a: [i, j, e + 1] });
        parts.push({ type: 'tube', step: s, a: [i, j, e], b: [i, j, e + 1], color: colorFor(i, j, e, 2), len });
      }
    steps.push({
      kicker: `Etage ${e + 1}`,
      title: 'Senkrechte Rohre nach oben stecken',
      hint: 'Auf jeden Verbinder ein senkrechtes Rohr, oben den nächsten Verbinder aufsetzen.',
    });
    // waagerechter Rahmen auf Ebene e+1
    s++;
    for (let j = 0; j <= d; j++)
      for (let i = 0; i < w; i++)
        parts.push({ type: 'tube', step: s, a: [i, j, e + 1], b: [i + 1, j, e + 1], color: colorFor(i, j, e + 1, 0), len: 'long' });
    for (let i = 0; i <= w; i++)
      for (let j = 0; j < d; j++)
        parts.push({ type: 'tube', step: s, a: [i, j, e + 1], b: [i, j + 1, e + 1], color: colorFor(i, j, e + 1, 1), len: 'long' });
    steps.push({
      kicker: `Ebene ${e + 1}`,
      title: 'Waagerechten Rahmen schließen',
      hint: 'Die Etage rundherum verbinden — das macht das Gerüst steif.',
    });
  }

  // Plattform-Platten
  s++;
  for (let i = 0; i < w; i++)
    for (let j = 0; j < d; j++) parts.push({ type: 'plate', step: s, a: [i, j, m.platformAt], color: 0x0061b0 });
  steps.push({
    kicker: 'Plattform',
    title: 'Platten als Plattform einlegen',
    hint: 'Platten auf die Ebene legen, auf der gestanden und gesessen wird.',
  });

  // Rutsche
  if (m.slide) {
    s++;
    parts.push({ type: 'slide', step: s, side: m.slide.side });
    steps.push({
      kicker: 'Rutsche',
      title: 'Rutsche an der Plattformkante einhängen',
      hint: 'Oben einhängen, unten satt auf den Boden aufsetzen lassen.',
    });
  }

  return {
    parts,
    steps,
    totalHeightCm: levelToCm(m.levelHeights, H),
    platformHeightCm: levelToCm(m.levelHeights, m.platformAt),
  };
}
