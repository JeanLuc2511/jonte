# CLAUDE.md — Projekt „Jonte"

> Bauplan für Claude Code. Ziel: aus dieser Datei heraus eine fertige, teilbare Web-App
> bauen, in ein neues Git-Repo legen und auf Vercel veröffentlichen.

---

## 1. Auftrag in einem Satz

**Jonte** ist eine visuelle, kindgerecht-einfache Schritt-für-Schritt-Aufbauanleitung für ein
**QUADRO-Klettergerüst** (Steck-Baukasten aus Rohren, Verbindern und Platten). Der Nutzer dreht
das Gerüst in 3D mit dem Finger und klickt sich durch den Aufbau — bei jedem Schritt **leuchten
genau die Teile auf, die neu dazukommen**. Es gibt **4 fertige Modelle**, jeweils mit Rutsche.

Die App soll mit Familie geteilt werden (Schwester), darf öffentlich sein.

---

## 2. Definition of Done

- [ ] Lauffähige Web-App, mobil-first (wird vor allem am Handy benutzt, beim Aufbauen im Garten).
- [ ] 4 auswählbare Modelle, jedes mit Rutsche, jedes mit Schritt-für-Schritt-Aufbau in 3D.
- [ ] 3D drehbar (1 Finger) und zoombar (2 Finger / Mausrad).
- [ ] Pro Schritt: Titel + Teileliste (wie viele Verbinder / welche Rohre) + kurzer Hinweis.
- [ ] Neue Teile des aktuellen Schritts werden hervorgehoben (Glow), Vorheriges bleibt sichtbar.
- [ ] Eigenes Git-Repo, sauberer erster Commit-Verlauf.
- [ ] Deployed auf Vercel, Projektname `jonte` → erreichbar unter `jonte.vercel.app` (siehe §12).
- [ ] README mit Kurzbeschreibung + „so teilst du den Link".

---

## 3. Tech-Stack

Passend zum bestehenden Setup des Nutzers (Next.js/Vercel-Erfahrung), bewusst schlank gehalten —
**kein Backend, keine Datenbank, kein Login nötig** (reine Client-App):

- **Next.js** (App Router, TypeScript)
- **react-three-fiber** + **@react-three/drei** (3D; `drei` liefert `OrbitControls`, Touch inklusive)
- **Tailwind CSS** (UI)
- Deployment: **Vercel**
- Keine `localStorage`-Pflicht; Modellauswahl/Schritt im React-State halten (URL-Query optional, z. B. `?modell=turm`, damit ein geteilter Link direkt ein Modell öffnet).

---

## 4. Das QUADRO-Teilesystem (die „Logik")

### Bauteile
- **Verbinder (Knoten):** schwarze Steckknoten an den Gitterpunkten. Verschiedene Bauformen
  (gerade Muffe, 90°-Ecke, T-Stück, Schräg-/Winkelstück). Für die App reicht **ein generisches
  Knoten-Objekt** pro Gitterpunkt — die reale Bauform ergibt sich daraus, wie viele Rohre dort
  zusammentreffen.
- **Rohre:** zwei Längen — **lang** (`long`) und **kurz** (`short`, ≈ halbe Länge). Farben:
  rot, blau, gelb, grün (im echten Set bunt gemischt). Kurze Rohre = halbe Etagenhöhe / halbes Feld.
- **Platten:** flache Kunststoffplatten (blau/gelb), bilden die **Plattform** zum Stehen/Sitzen.
- **Rutsche:** ein Kunststoff-Rutschenkörper, wird oben an einer Plattformkante eingehängt und
  läuft schräg nach unten.

### Raster / Koordinaten
Würfelgitter mit Integer-Koordinaten `[i, j, k]`:
- `i` = Breite (X), `j` = Tiefe (Z), `k` = Ebene/Höhe (Y).
- **1 Feld in i/j = ein langes Rohr.** Die Höhe einer Etage `k→k+1` kann pro Etage `long` oder
  `short` sein (so lassen sich Plattformhöhen fein einstellen, z. B. an einen Poolrand anpassen).
- Maße in cm sind über Konstanten anpassbar:
  ```ts
  export const TUBE_LONG_CM = 100;  // langes Rohr (Schätzung – bei Bedarf nachmessen)
  export const TUBE_SHORT_CM = 50;  // kurzes Rohr
  ```
  Die App rechnet damit die echte Plattform-/Gesamthöhe aus und zeigt sie an.

---

## 5. Aufbaulogik (Reihenfolge der Schritte)

Immer **von unten nach oben, Ebene für Ebene** — das ist die Reihenfolge, bei der man beim echten
Aufbau nicht durcheinanderkommt:

1. **Grundrahmen** flach auf den Boden legen (alle Knoten + alle waagerechten Rohre auf `k=0`).
   Hinweis: erst prüfen, ob die Ecken rechtwinklig sind.
2. Für jede Etage `e` (0 … H-1):
   - **Senkrechte Rohre** `e → e+1` (auf jeden Knoten ein Steher, oben neuer Knoten).
   - **Waagerechter Rahmen** auf Ebene `e+1` schließen → macht alles steif.
3. **Plattform-Platten** auf die `platformAt`-Ebene legen.
4. **Rutsche** an der Plattformkante einhängen, unten satt aufsetzen.

Jeder dieser Punkte ist ein **eigener Schritt** in der App. Teile bekommen einen `step`-Index;
sichtbar ist alles mit `step ≤ aktuellerSchritt`, hervorgehoben wird `step === aktuellerSchritt`.

---

## 6. Datenmodell (TypeScript)

```ts
export type Coord = [number, number, number]; // [i, j, k]
export type TubeLen = 'long' | 'short';
export type Side = 'front' | 'back' | 'left' | 'right';

export interface ModelDef {
  id: string;
  name: string;
  blurb: string;            // ein Satz Beschreibung für die Auswahl
  base: { w: number; d: number };     // Felder in Breite/Tiefe
  levelHeights: TubeLen[];  // Höhe je Etage, von unten nach oben (Länge = Anzahl Etagen H)
  platformAt: number;       // Ebene k, auf der die Plattform-Platten liegen
  slide: { side: Side; fromLevel: number } | null;
}

export type PartType = 'node' | 'tube' | 'plate' | 'slide';

export interface Part {
  type: PartType;
  step: number;             // an welchem Schritt das Teil erscheint
  a?: Coord; b?: Coord;     // tube: von/bis; node/plate: a = Position
  color?: number;           // tube/plate
  len?: TubeLen;            // tube
  side?: Side;              // slide
}

export interface Step { kicker: string; title: string; hint: string; }

export interface BuiltModel { parts: Part[]; steps: Step[]; totalHeightCm: number; }
```

---

## 7. Modell-Generator (direkt verwendbar)

Framework-unabhängige Logik (Referenz – funktioniert genau wie der vom Nutzer freigegebene
Prototyp, erweitert um variable Etagenhöhen + Plattform):

```ts
import { TUBE_LONG_CM, TUBE_SHORT_CM } from './constants';

const TUBE_COLORS = [0xe2231a, 0x0061b0, 0xffc60b, 0x00963f]; // rot, blau, gelb, grün
export const COLOR_NAME: Record<number,string> =
  {0xe2231a:'rot',0x0061b0:'blau',0xffc60b:'gelb',0x00963f:'grün'};

const colorFor = (i:number,j:number,k:number,d:number) =>
  TUBE_COLORS[(i*7 + j*5 + k*3 + d*11) % 4];

export function buildModel(m: ModelDef): BuiltModel {
  const parts: Part[] = [];
  const steps: Step[] = [];
  const { w, d } = m.base;
  const H = m.levelHeights.length;

  // Step 0: Grundrahmen
  let s = 0;
  for (let i=0;i<=w;i++) for (let j=0;j<=d;j++) parts.push({type:'node',step:s,a:[i,j,0]});
  for (let j=0;j<=d;j++) for (let i=0;i<w;i++)
    parts.push({type:'tube',step:s,a:[i,j,0],b:[i+1,j,0],color:colorFor(i,j,0,0),len:'long'});
  for (let i=0;i<=w;i++) for (let j=0;j<d;j++)
    parts.push({type:'tube',step:s,a:[i,j,0],b:[i,j+1,0],color:colorFor(i,j,0,1),len:'long'});
  steps.push({kicker:'Grundrahmen', title:'Grundrahmen flach auf den Boden legen',
    hint:'Erst das ganze Bodenquadrat legen und prüfen, ob die Ecken rechtwinklig sind.'});

  for (let e=0;e<H;e++){
    const len = m.levelHeights[e];
    // senkrechte Rohre + obere Knoten
    s++;
    for (let i=0;i<=w;i++) for (let j=0;j<=d;j++){
      parts.push({type:'node',step:s,a:[i,j,e+1]});
      parts.push({type:'tube',step:s,a:[i,j,e],b:[i,j,e+1],color:colorFor(i,j,e,2),len});
    }
    steps.push({kicker:`Etage ${e+1}`, title:'Senkrechte Rohre nach oben',
      hint:'Auf jeden Verbinder ein senkrechtes Rohr, oben den nächsten Verbinder.'});
    // waagerechter Rahmen
    s++;
    for (let j=0;j<=d;j++) for (let i=0;i<w;i++)
      parts.push({type:'tube',step:s,a:[i,j,e+1],b:[i+1,j,e+1],color:colorFor(i,j,e+1,0),len:'long'});
    for (let i=0;i<=w;i++) for (let j=0;j<d;j++)
      parts.push({type:'tube',step:s,a:[i,j,e+1],b:[i,j+1,e+1],color:colorFor(i,j,e+1,1),len:'long'});
    steps.push({kicker:`Ebene ${e+1}`, title:'Waagerechten Rahmen schließen',
      hint:'Die Etage rundherum verbinden — das macht das Gerüst steif.'});
  }

  // Plattform-Platten
  s++;
  for (let i=0;i<w;i++) for (let j=0;j<d;j++)
    parts.push({type:'plate',step:s,a:[i,j,m.platformAt],color:0x0061b0});
  steps.push({kicker:'Plattform', title:'Platten als Plattform einlegen',
    hint:'Platten auf die Ebene legen, auf der gestanden/gesessen wird.'});

  // Rutsche
  if (m.slide){
    s++;
    parts.push({type:'slide',step:s,side:m.slide.side});
    steps.push({kicker:'Rutsche', title:'Rutsche an der Plattformkante einhängen',
      hint:'Oben einhängen, unten satt aufsetzen lassen.'});
  }

  // Gesamthöhe
  const totalHeightCm = m.levelHeights.reduce(
    (sum,l)=> sum + (l==='long'?TUBE_LONG_CM:TUBE_SHORT_CM), 0);

  return { parts, steps, totalHeightCm };
}
```

**3D-Umsetzung mit react-three-fiber:**
- Rohr = Zylinder zwischen `a` und `b` (Y-Position der Ebene = kumulierte Summe der `levelHeights`
  in cm, auf eine Szenen-Einheit normiert; lange Etage länger als kurze).
- Knoten = kleiner dunkler Würfel.
- Platte = flache Box, deckt ein Feld.
- Rutsche = schräge „Bahn" (flache Box + zwei seitliche Leisten), von der `platformAt`-Kante der
  gewählten `side` schräg zum Boden.
- Hervorhebung aktueller Schritt: `emissive` warmes Orange (`0xff8a1e`) + leichtes Pulsieren;
  schon gebaute Teile leicht abgedunkelt.
- `OrbitControls` aus `@react-three/drei` (Touch + Maus). Auto-Rotate als Toggle.

---

## 8. Die 4 Gerüste (Presets, jeweils MIT Rutsche)

Größenordnung wie auf den Fotos des Nutzers (langes Rohr ≈ 1 m, kurzes ≈ 0,5 m). Alle mit
2×2-Feld-Grundfläche für sicheren Stand; sie unterscheiden sich in der Höhe.

```ts
export const MODELS: ModelDef[] = [
  {
    id: 'mini',
    name: 'Mini',
    blurb: 'Flacher Würfel, niedrige Plattform – für die Kleinsten.',
    base: { w: 2, d: 2 },
    levelHeights: ['short'],            // ~50 cm Plattform
    platformAt: 1,
    slide: { side: 'front', fromLevel: 1 },
  },
  {
    id: 'wuerfel',
    name: 'Kletterwürfel',
    blurb: 'Klassischer Würfel mit Plattform und kurzer Rutsche.',
    base: { w: 2, d: 2 },
    levelHeights: ['long', 'short'],    // ~150 cm Plattform
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
    levelHeights: ['long', 'short'],    // an Poolrand anpassen (siehe Hinweis)
    platformAt: 2,
    slide: { side: 'front', fromLevel: 2 },
  },
];
```

> **Hinweis am „Pool"-Modell:** Die Plattformhöhe sollte zur tatsächlichen Poolrandhöhe passen.
> Diese ist je nach Becken unterschiedlich; per `levelHeights` (long/short kombinieren) einstellen.
> In der UI die ausgerechnete `totalHeightCm` anzeigen, damit der Nutzer abgleichen kann.

---

## 9. App-Funktionen / UI

- **Startbildschirm:** 4 Modell-Kacheln (Name + `blurb` + kleine Vorschau). Auswahl öffnet den
  3D-Aufbau. Aktuelles Modell in der URL (`?modell=turm`), damit ein geteilter Link es direkt öffnet.
- **Aufbau-Screen:**
  - Großer 3D-Canvas (drehen/zoomen).
  - Untere Leiste: Fortschrittsbalken, ◀/▶, Schritt-Titel, Teileliste (Chips: „9× Verbinder",
    „12× Rohr blau" …), Schritt-Hinweis.
  - Kopf: Auto-Drehen-Toggle, Ansicht-Reset, zurück zur Auswahl.
  - Anzeige der ausgerechneten Plattform-/Gesamthöhe in cm.
- **Teilen:** Button „Link teilen" (Web Share API mit Fallback „Link kopiert").
- **Sicherheitshinweis:** dezent im Footer bzw. einmalig beim ersten Start:
  *„Aufbau und Belastungstest durch Erwachsene. In der Nähe von Wasser immer Aufsicht."*

---

## 10. Design / Branding

- Name: **Jonte**.
- Anmutung: dunkler „Werkbank"-Hintergrund (`#15171c`), darauf die knalligen QUADRO-Primärfarben
  (rot `#e2231a`, blau `#0061b0`, gelb `#ffc60b`, grün `#00963f`) – Spielzeug auf dunklem Tisch.
- Akzentfarbe für aktive Aktion/Schritt: Orange `#ff8a1e`.
- Klare, kräftige Sans-Headlines, große Touch-Flächen (≥ 44 px), ruhiges UI.
- Quality-Floor: responsive bis Handy, sichtbarer Tastatur-Fokus, `prefers-reduced-motion` respektieren
  (dann Auto-Rotation + Puls aus).

---

## 11. Aufgabenliste für Claude Code

> Reihenfolge. Auth bei GitHub/Vercel macht der Nutzer im jeweiligen Tool/Browser-Login.

1. **Scaffold:** `npx create-next-app@latest jonte --ts --tailwind --app --eslint`.
2. **Pakete:** `npm i three @react-three/fiber @react-three/drei`.
3. **Code:** `lib/constants.ts`, `lib/quadro.ts` (Generator aus §7), `lib/models.ts` (Presets aus §8),
   Komponenten `Scene`, `StepBar`, `ModelPicker`; Seiten `app/page.tsx` (Auswahl) und
   `app/build/page.tsx` (3D-Aufbau, liest `?modell=`).
4. **README.md:** Kurzbeschreibung + „Link teilen" erklären.
5. **Git:** `git init`, sinnvolle Commits (Scaffold → Logik → UI → Modelle → Polish).
6. **GitHub:** neues **öffentliches** Repo `jonte` anlegen (z. B. via `gh repo create jonte --public --source=. --push`).
7. **Vercel:** Projekt **`jonte`** verknüpfen und deployen (`vercel link` → `vercel --prod`),
   oder Repo in Vercel importieren. Ergebnis: `https://jonte.vercel.app`.
8. **Smoke-Test:** alle 4 Modelle durchklicken, am Handy drehen/zoomen, geteilten Link mit
   `?modell=…` prüfen.

---

## 12. Offene Punkte / Annahmen

- **Domain:** Vercel vergibt standardmäßig `<projektname>.vercel.app`, also **`jonte.vercel.app`**.
  Eine echte eigene Domain wäre `jonte.app` und müsste separat registriert und in Vercel als
  Custom Domain verbunden werden – dann ggf. als `app.jonte.app` o. Ä. Bitte beim Nutzer
  bestätigen, welche Variante gewünscht ist, bevor eine kostenpflichtige Domain angelegt wird.
- **Rohrlängen in cm** (`TUBE_LONG_CM`, `TUBE_SHORT_CM`) sind Schätzwerte – bei Gelegenheit
  nachmessen und in `lib/constants.ts` korrigieren; alle Höhenangaben passen sich automatisch an.
- **Plattformhöhe „Pool"-Modell** an den realen Poolrand anpassen (siehe §8).
