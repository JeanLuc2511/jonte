export type Coord = [number, number, number]; // [i, j, k] = [Breite, Tiefe, Ebene]
export type TubeLen = 'long' | 'short';
export type Side = 'front' | 'back' | 'left' | 'right';

export interface ModelDef {
  id: string;
  name: string;
  blurb: string; // ein Satz für die Auswahl
  base: { w: number; d: number }; // Felder in Breite/Tiefe
  levelHeights: TubeLen[]; // Höhe je Etage, von unten nach oben (Länge = Anzahl Etagen H)
  platformAt: number; // Ebene k, auf der die Plattform-Platten liegen
  slide: { side: Side; fromLevel: number } | null;
}

export type PartType = 'node' | 'tube' | 'plate' | 'slide';

export interface Part {
  type: PartType;
  step: number; // an welchem Schritt das Teil erscheint
  a?: Coord; // tube: von; node/plate: Position
  b?: Coord; // tube: bis
  color?: number; // tube/plate
  len?: TubeLen; // tube
  side?: Side; // slide
}

export interface Step {
  kicker: string;
  title: string;
  hint: string;
}

export interface BuiltModel {
  parts: Part[];
  steps: Step[];
  totalHeightCm: number; // Gesamthöhe des Gerüsts
  platformHeightCm: number; // Höhe der Plattform-Ebene über dem Boden
}
