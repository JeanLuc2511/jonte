import type { ModelDef } from './types';

export const MODELS: ModelDef[] = [
  {
    id: 'mini',
    name: 'Mini',
    blurb: 'Flacher Würfel, niedrige Plattform – für die Kleinsten.',
    base: { w: 2, d: 2 },
    levelHeights: ['short'], // ~50 cm Plattform
    platformAt: 1,
    slide: { side: 'front', fromLevel: 1 },
  },
  {
    id: 'wuerfel',
    name: 'Kletterwürfel',
    blurb: 'Klassischer Würfel mit Plattform und kurzer Rutsche.',
    base: { w: 2, d: 2 },
    levelHeights: ['long', 'short'], // ~150 cm Plattform
    platformAt: 2,
    slide: { side: 'front', fromLevel: 2 },
  },
  {
    id: 'turm',
    name: 'Turm',
    blurb: 'Höherer Turm mit längerer Rutsche.',
    base: { w: 2, d: 2 },
    levelHeights: ['long', 'short', 'short'], // ~200 cm Plattform
    platformAt: 3,
    slide: { side: 'front', fromLevel: 3 },
  },
  {
    id: 'pool',
    name: 'Pool-Rutsche',
    blurb: 'Plattform auf Poolrand-Höhe, Rutsche zeigt zum Pool.',
    base: { w: 2, d: 2 },
    levelHeights: ['long', 'short'], // an Poolrand anpassen
    platformAt: 2,
    slide: { side: 'front', fromLevel: 2 },
  },
];

export const DEFAULT_MODEL_ID = MODELS[0].id;

export function modelById(id: string | null | undefined): ModelDef | undefined {
  return MODELS.find((m) => m.id === id);
}
