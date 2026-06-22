import type { Part } from './types';

export type ChipTone = 'node' | 'long' | 'short' | 'plate' | 'slide';

export interface Chip {
  key: string;
  label: string;
  count: number;
  tone: ChipTone;
  colors: number[]; // vorkommende Rohrfarben (kleine Deko-Punkte)
}

function summarize(parts: Part[]): Chip[] {
  let node = 0;
  let plate = 0;
  let slide = 0;
  let long = 0;
  let short = 0;
  const longColors = new Set<number>();
  const shortColors = new Set<number>();

  for (const p of parts) {
    if (p.type === 'node') node++;
    else if (p.type === 'plate') plate++;
    else if (p.type === 'slide') slide++;
    else if (p.type === 'tube') {
      if (p.len === 'short') {
        short++;
        if (p.color != null) shortColors.add(p.color);
      } else {
        long++;
        if (p.color != null) longColors.add(p.color);
      }
    }
  }

  const chips: Chip[] = [];
  if (node) chips.push({ key: 'node', label: 'Verbinder', count: node, tone: 'node', colors: [] });
  if (long) chips.push({ key: 'long', label: 'Rohr lang', count: long, tone: 'long', colors: [...longColors] });
  if (short) chips.push({ key: 'short', label: 'Rohr kurz', count: short, tone: 'short', colors: [...shortColors] });
  if (plate) chips.push({ key: 'plate', label: 'Platte', count: plate, tone: 'plate', colors: [] });
  if (slide) chips.push({ key: 'slide', label: 'Rutsche', count: slide, tone: 'slide', colors: [] });
  return chips;
}

/** Teile, die in genau diesem Schritt neu dazukommen. */
export function stepInventory(parts: Part[], step: number): Chip[] {
  return summarize(parts.filter((p) => p.step === step));
}

/** Gesamtes Material für das ganze Modell. */
export function totalInventory(parts: Part[]): Chip[] {
  return summarize(parts);
}
