export type Coord = [number, number, number]; // [i, j, k] = [Breite, Tiefe, Ebene]
export type TubeLen = 'long' | 'short';
export type Side = 'front' | 'back' | 'left' | 'right';
export type Dir = 'px' | 'nx' | 'py' | 'ny' | 'pz' | 'nz';

export interface ModelDef {
  id: string;
  name: string;
  blurb: string; // ein Satz für die Auswahl
  base: { w: number; d: number }; // Felder in Breite/Tiefe
  levelHeights: TubeLen[]; // Höhe je Etage, von unten nach oben (Länge = Anzahl Etagen H)
  platformAt: number; // Ebene k, auf der die Plattform-Platten liegen
  slide: { side: Side; fromLevel: number; segments?: number } | null;
}

/** Ein einzelner Stab (Rohr), der in genau einem Schritt gesetzt wird. */
export interface Rod {
  step: number;
  a: Coord;
  b: Coord;
  color: number;
  len: TubeLen;
  orient: 'horizontal' | 'vertical';
  section: string; // Bauabschnitt (Boden, Etage 1, …)
}

/** Ein Verbinder/Knoten an einem Gitterpunkt, klassifiziert nach Sockel-Richtungen. */
export interface Connector {
  key: string; // "i,j,k"
  pos: Coord;
  dirs: Dir[]; // Richtungen der Sockel
  sockets: number;
  name: string; // z. B. "Eck-Verbinder"
  step: number; // Schritt des ersten Auftauchens
}

export interface PlatePart {
  step: number;
  a: Coord;
  color: number;
  section: string;
}

export interface SlideSeg {
  step: number;
  kind: 'head' | 'chute';
  section: string;
}

export type StepKind = 'rod' | 'plate' | 'slide';

export interface Step {
  index: number;
  kind: StepKind;
  ref: number; // Index in rods / plates / slide
  section: string; // Kicker
  title: string;
  hint: string;
}

export interface BuiltModel {
  rods: Rod[];
  connectors: Connector[];
  plates: PlatePart[];
  slide: SlideSeg[];
  steps: Step[];
  sections: string[]; // Reihenfolge der Bauabschnitte
  totalHeightCm: number;
  platformHeightCm: number;
}
