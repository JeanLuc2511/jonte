import { TUBE_LONG_CM, TUBE_SHORT_CM, UNIT_LONG, UNIT_SHORT } from './constants';
import type { BuiltModel, Connector, Coord, Dir, ModelDef, PlatePart, Rod, SlideSeg, Step, TubeLen } from './types';

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
  TUBE_COLORS[Math.abs(i * 7 + j * 5 + k * 3 + d * 11) % 4];

/** Höhe der Ebene k in Szenen-Einheiten (langes Rohr = 1, kurzes = 0,5). Bruch-k erlaubt (Treppe). */
export function levelToY(levelHeights: TubeLen[], k: number): number {
  const full = Math.floor(k);
  let y = 0;
  for (let e = 0; e < full && e < levelHeights.length; e++) {
    y += levelHeights[e] === 'long' ? UNIT_LONG : UNIT_SHORT;
  }
  const frac = k - full;
  if (frac > 0 && full < levelHeights.length) {
    y += frac * (levelHeights[full] === 'long' ? UNIT_LONG : UNIT_SHORT);
  }
  return y;
}

/** Höhe der Ebene k in Zentimetern. */
export function levelToCm(levelHeights: TubeLen[], k: number): number {
  const full = Math.floor(k);
  let cm = 0;
  for (let e = 0; e < full && e < levelHeights.length; e++) {
    cm += levelHeights[e] === 'long' ? TUBE_LONG_CM : TUBE_SHORT_CM;
  }
  const frac = k - full;
  if (frac > 0 && full < levelHeights.length) {
    cm += frac * (levelHeights[full] === 'long' ? TUBE_LONG_CM : TUBE_SHORT_CM);
  }
  return cm;
}

const keyOf = (c: Coord) => `${c[0]},${c[1]},${c[2]}`;

function dirBetween(a: Coord, b: Coord): Dir {
  if (b[0] !== a[0]) return b[0] > a[0] ? 'px' : 'nx';
  if (b[1] !== a[1]) return b[1] > a[1] ? 'pz' : 'nz';
  return b[2] > a[2] ? 'py' : 'ny';
}

const OPPOSITE: Record<Dir, Dir> = { px: 'nx', nx: 'px', py: 'ny', ny: 'py', pz: 'nz', nz: 'pz' };

/** Verbinder-Bauform aus den Sockel-Richtungen ableiten. */
export function classifyConnector(dirs: Dir[]): { sockets: number; name: string } {
  const has = (x: Dir) => dirs.includes(x);
  const sockets = dirs.length;
  const anyPair = (has('px') && has('nx')) || (has('py') && has('ny')) || (has('pz') && has('nz'));
  let name = 'Verbinder';
  switch (sockets) {
    case 1:
      name = 'Endstück';
      break;
    case 2:
      name = anyPair ? 'Gerade Muffe' : 'Winkel-Verbinder';
      break;
    case 3:
      name = anyPair ? 'T-Verbinder' : 'Eck-Verbinder';
      break;
    case 4:
      name = 'Kreuz-Verbinder';
      break;
    case 5:
      name = '5-Wege-Verbinder';
      break;
    default:
      name = '6-Wege-Knoten';
  }
  return { sockets, name };
}

export function buildModel(m: ModelDef): BuiltModel {
  const { w, d } = m.base;
  const H = m.levelHeights.length;

  const rods: Rod[] = [];
  const plates: PlatePart[] = [];
  const slide: SlideSeg[] = [];
  const steps: Step[] = [];
  const sections: string[] = [];
  const seenSection = new Set<string>();
  let step = 0;

  const useSection = (s: string) => {
    if (!seenSection.has(s)) {
      seenSection.add(s);
      sections.push(s);
    }
  };
  const lenWord = (len: TubeLen) => (len === 'long' ? 'langes' : 'kurzes');

  const addRod = (a: Coord, b: Coord, len: TubeLen, orient: 'horizontal' | 'vertical', section: string) => {
    const color = colorFor(a[0], a[1], a[2], orient === 'vertical' ? 2 : a[0] !== b[0] ? 0 : 1);
    const ref = rods.length;
    rods.push({ step, a, b, color, len, orient, section });
    useSection(section);
    steps.push({
      index: step,
      kind: 'rod',
      ref,
      section,
      title: `${orient === 'vertical' ? 'Senkrechtes' : 'Waagerechtes'} ${lenWord(len)} Rohr · ${COLOR_NAME[color]}`,
      hint:
        orient === 'vertical'
          ? 'Steck das Rohr senkrecht auf den unteren Verbinder; oben sitzt der nächste Verbinder.'
          : 'Verbinde die beiden Knoten waagerecht.',
    });
    step++;
  };

  const addPlate = (a: Coord, color: number, section: string) => {
    const ref = plates.length;
    plates.push({ step, a, color, section });
    useSection(section);
    steps.push({
      index: step,
      kind: 'plate',
      ref,
      section,
      title: 'Plattform-Platte einlegen',
      hint: 'Leg die Platte auf die Plattform-Ebene — sie rastet auf den Rohren ein.',
    });
    step++;
  };

  const addSlideSeg = (kind: SlideSeg['kind'], section: string) => {
    const ref = slide.length;
    slide.push({ step, kind, section });
    useSection(section);
    steps.push({
      index: step,
      kind: 'slide',
      ref,
      section,
      title: kind === 'head' ? 'Rutschen-Kopfstück einhängen' : 'Rutschen-Bahn anstecken',
      hint:
        kind === 'head'
          ? 'Häng das gebogene Kopfstück oben an die Plattformkante.'
          : 'Steck die gerade Bahn an und setz sie unten satt auf den Boden.',
    });
    step++;
  };

  if (m.id === 'aussichtsturm') {
    // ----- Maßgeschneiderter Aussichtsturm (QUADRO B0021) -----
    // Boden (Turm-Quadrat)
    const sB = 'Boden';
    for (let j = 0; j <= d; j++) for (let i = 0; i < w; i++) addRod([i, j, 0], [i + 1, j, 0], 'long', 'horizontal', sB);
    for (let i = 0; i <= w; i++) for (let j = 0; j < d; j++) addRod([i, j, 0], [i, j + 1, 0], 'long', 'horizontal', sB);

    // Rutschen-Basis: Boden 2 Felder nach vorn (j) verlängern
    const sBasis = 'Rutschen-Basis';
    const jEnd = d + 2;
    for (let i = 0; i <= w; i++) for (let j = d; j < jEnd; j++) addRod([i, j, 0], [i, j + 1, 0], 'long', 'horizontal', sBasis);
    for (let j = d + 1; j <= jEnd; j++) for (let i = 0; i < w; i++) addRod([i, j, 0], [i + 1, j, 0], 'long', 'horizontal', sBasis);

    // Zwei Kletter-Etagen (volles Gerüst) + Treppe an der rechten hinteren Kante
    const sT = 'Aufstieg';
    const isStair = (i: number, j: number) => i === w && (j === 0 || j === 1);
    for (let e = 0; e < 2; e++) {
      const len = m.levelHeights[e];
      const sE = `Etage ${e + 1}`;
      for (let i = 0; i <= w; i++)
        for (let j = 0; j <= d; j++) {
          if (isStair(i, j)) {
            // zwei kurze Rohre mit Zwischenknoten auf halber Höhe → Stufen-Pfosten
            addRod([i, j, e], [i, j, e + 0.5], 'short', 'vertical', sT);
            addRod([i, j, e + 0.5], [i, j, e + 1], 'short', 'vertical', sT);
          } else {
            addRod([i, j, e], [i, j, e + 1], len, 'vertical', sE);
          }
        }
      // Trittstufe auf halber Höhe zwischen den beiden Treppen-Pfosten
      addRod([w, 0, e + 0.5], [w, 1, e + 0.5], 'long', 'horizontal', sT);
      // waagerechter Rahmen (liefert zugleich die Tritte auf voller Höhe)
      for (let j = 0; j <= d; j++) for (let i = 0; i < w; i++) addRod([i, j, e + 1], [i + 1, j, e + 1], 'long', 'horizontal', sE);
      for (let i = 0; i <= w; i++) for (let j = 0; j < d; j++) addRod([i, j, e + 1], [i, j + 1, e + 1], 'long', 'horizontal', sE);
    }

    // Plattform (Ebene 2)
    const sP = 'Plattform';
    for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) addPlate([i, j, 2], (i + j) % 2 === 0 ? 0x0061b0 : 0xffc60b, sP);

    // Geländer (Ebene 2→3): nur Perimeter hinten + Seiten, vorne offen (zur Rutsche)
    const lenR = m.levelHeights[2] ?? 'short';
    const sG = 'Geländer';
    const posts: Array<[number, number]> = [
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
      [2, 1],
    ];
    for (const [i, j] of posts) addRod([i, j, 2], [i, j, 3], lenR, 'vertical', sG);
    addRod([0, 0, 3], [1, 0, 3], 'long', 'horizontal', sG);
    addRod([1, 0, 3], [2, 0, 3], 'long', 'horizontal', sG);
    addRod([0, 0, 3], [0, 1, 3], 'long', 'horizontal', sG);
    addRod([2, 0, 3], [2, 1, 3], 'long', 'horizontal', sG);

    // Modulare Rutsche
    const sR = 'Rutsche';
    addSlideSeg('head', sR);
    addSlideSeg('chute', sR);
  } else {
    // ----- Generischer Würfel-Aufbau -----
    const sBoden = 'Boden';
    for (let j = 0; j <= d; j++) for (let i = 0; i < w; i++) addRod([i, j, 0], [i + 1, j, 0], 'long', 'horizontal', sBoden);
    for (let i = 0; i <= w; i++) for (let j = 0; j < d; j++) addRod([i, j, 0], [i, j + 1, 0], 'long', 'horizontal', sBoden);

    for (let e = 0; e < H; e++) {
      const len = m.levelHeights[e];
      const sEtage = `Etage ${e + 1}`;
      for (let i = 0; i <= w; i++) for (let j = 0; j <= d; j++) addRod([i, j, e], [i, j, e + 1], len, 'vertical', sEtage);
      for (let j = 0; j <= d; j++) for (let i = 0; i < w; i++) addRod([i, j, e + 1], [i + 1, j, e + 1], 'long', 'horizontal', sEtage);
      for (let i = 0; i <= w; i++) for (let j = 0; j < d; j++) addRod([i, j, e + 1], [i, j + 1, e + 1], 'long', 'horizontal', sEtage);
    }

    const sPlat = 'Plattform';
    for (let i = 0; i < w; i++)
      for (let j = 0; j < d; j++) addPlate([i, j, m.platformAt], (i + j) % 2 === 0 ? 0x0061b0 : 0xffc60b, sPlat);

    if (m.slide) {
      const sR = 'Rutsche';
      const segCount = Math.max(1, m.slide.segments ?? 1);
      const kinds: SlideSeg['kind'][] = segCount >= 2 ? ['head'] : [];
      while (kinds.length < segCount) kinds.push('chute');
      for (const kind of kinds) addSlideSeg(kind, sR);
    }
  }

  // Verbinder aus allen Stäben ableiten
  const dirMap = new Map<string, Set<Dir>>();
  const firstStep = new Map<string, number>();
  for (const r of rods) {
    const ka = keyOf(r.a);
    const kb = keyOf(r.b);
    const dab = dirBetween(r.a, r.b);
    if (!dirMap.has(ka)) dirMap.set(ka, new Set());
    if (!dirMap.has(kb)) dirMap.set(kb, new Set());
    dirMap.get(ka)!.add(dab);
    dirMap.get(kb)!.add(OPPOSITE[dab]);
    if (!firstStep.has(ka) || r.step < firstStep.get(ka)!) firstStep.set(ka, r.step);
    if (!firstStep.has(kb) || r.step < firstStep.get(kb)!) firstStep.set(kb, r.step);
  }
  const connectors: Connector[] = [];
  for (const [key, set] of dirMap) {
    const dirs = [...set];
    const { sockets, name } = classifyConnector(dirs);
    const parts = key.split(',').map(Number);
    connectors.push({ key, pos: [parts[0], parts[1], parts[2]], dirs, sockets, name, step: firstStep.get(key) ?? 0 });
  }

  return {
    rods,
    connectors,
    plates,
    slide,
    steps,
    sections,
    totalHeightCm: levelToCm(m.levelHeights, H),
    platformHeightCm: levelToCm(m.levelHeights, m.platformAt),
  };
}
