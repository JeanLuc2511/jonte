import type { BuiltModel } from './types';

export type ChipTone = 'long' | 'short' | 'plate' | 'slide' | 'connector';

export interface Chip {
  key: string;
  label: string;
  count: number;
  tone: ChipTone;
  colors: number[]; // Rohr-/Plattenfarben als Punkte
  sub?: string; // z. B. "3 Sockel"
}

/** Was in genau diesem Schritt neu dazukommt (1 Stab/Platte/Segment + ggf. neue Verbinder). */
export function stepChips(built: BuiltModel, index: number): Chip[] {
  const step = built.steps[index];
  if (!step) return [];
  const chips: Chip[] = [];

  if (step.kind === 'rod') {
    const rod = built.rods[step.ref];
    chips.push({
      key: 'rod',
      label: rod.len === 'long' ? 'Rohr lang' : 'Rohr kurz',
      count: 1,
      tone: rod.len === 'long' ? 'long' : 'short',
      colors: [rod.color],
    });
  } else if (step.kind === 'plate') {
    const plate = built.plates[step.ref];
    chips.push({ key: 'plate', label: 'Platte', count: 1, tone: 'plate', colors: [plate.color] });
  } else {
    const seg = built.slide[step.ref];
    chips.push({
      key: 'slide',
      label: seg.kind === 'head' ? 'Rutschen-Kopfstück' : 'Rutschen-Bahn',
      count: 1,
      tone: 'slide',
      colors: [],
    });
  }

  // Verbinder, die in genau diesem Schritt zum ersten Mal gebraucht werden
  const newConns = built.connectors.filter((c) => c.step === index);
  const byName = new Map<string, { count: number; sockets: number }>();
  for (const c of newConns) {
    const e = byName.get(c.name) ?? { count: 0, sockets: c.sockets };
    e.count++;
    byName.set(c.name, e);
  }
  for (const [name, e] of byName) {
    chips.push({ key: `conn:${name}`, label: name, count: e.count, tone: 'connector', colors: [], sub: `${e.sockets} Sockel` });
  }

  return chips;
}

/** Gesamtes Material für das ganze Modell. */
export function totalChips(built: BuiltModel): Chip[] {
  const chips: Chip[] = [];

  let long = 0;
  let short = 0;
  const longColors = new Set<number>();
  const shortColors = new Set<number>();
  for (const r of built.rods) {
    if (r.len === 'long') {
      long++;
      longColors.add(r.color);
    } else {
      short++;
      shortColors.add(r.color);
    }
  }
  if (long) chips.push({ key: 'long', label: 'Rohr lang', count: long, tone: 'long', colors: [...longColors] });
  if (short) chips.push({ key: 'short', label: 'Rohr kurz', count: short, tone: 'short', colors: [...shortColors] });

  // Verbinder nach Bauform
  const byName = new Map<string, { count: number; sockets: number }>();
  for (const c of built.connectors) {
    const e = byName.get(c.name) ?? { count: 0, sockets: c.sockets };
    e.count++;
    byName.set(c.name, e);
  }
  [...byName.entries()]
    .sort((a, b) => a[1].sockets - b[1].sockets)
    .forEach(([name, e]) =>
      chips.push({ key: `conn:${name}`, label: name, count: e.count, tone: 'connector', colors: [], sub: `${e.sockets} Sockel` }),
    );

  if (built.plates.length) chips.push({ key: 'plate', label: 'Platte', count: built.plates.length, tone: 'plate', colors: [] });
  if (built.slide.length) chips.push({ key: 'slide', label: 'Rutschen-Segment', count: built.slide.length, tone: 'slide', colors: [] });

  return chips;
}
