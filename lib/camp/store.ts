"use client";

/**
 * Camp-Zustand im Browser (localStorage) – steht in der Demo für das spätere Backend.
 * Website und Mitgliederbereich lesen ihn über die Hooks unten, das Cockpit ändert ihn
 * ausschließlich über `lib/services/cockpit.ts`. Auf dem Server ist der Zustand `null`;
 * Komponenten zeigen dann die Beispieldaten, die ihnen die Seite mitgibt.
 */
import { useSyncExternalStore } from "react";
import { CAMP_VERSION, PREISE, beispielCamp } from "@/lib/daten/camp";
import { PHASEN } from "@/lib/daten/phasen";
import { isoHeute, tageInklusive } from "@/lib/datum";
import type { CampZustand, Preise } from "@/lib/types";

const KEY = "cc-camp";
const KEY_ANSICHT = "cc-ansicht";
const FRISCH_TAGE = 3;

let zustand: CampZustand | null = null;
let alsSeb: boolean | null = null;
const hoerer = new Set<() => void>();
const melden = () => hoerer.forEach((h) => h());

function laden(): CampZustand {
  if (zustand) return zustand;
  const heute = isoHeute();
  try {
    const roh = window.localStorage.getItem(KEY);
    if (roh) {
      const z = JSON.parse(roh) as CampZustand;
      if (z.version === CAMP_VERSION && tageInklusive(z.seedTag, heute) <= FRISCH_TAGE + 1) return (zustand = z);
    }
  } catch { /* kein Speicher – die Demo läuft dann nur für diese Sitzung */ }
  return (zustand = beispielCamp(heute));
}

export const getCamp = (): CampZustand => laden();

export function setCamp(aendern: (alt: CampZustand) => CampZustand) {
  zustand = aendern(laden());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(zustand));
  } catch { /* z. B. Speicher voll durch Fotos – der Zustand bleibt für die Sitzung erhalten */ }
  melden();
}

export function resetCamp() {
  zustand = beispielCamp(isoHeute());
  try { window.localStorage.removeItem(KEY); } catch { /* egal */ }
  melden();
}

let verbunden = false;
function subscribe(h: () => void) {
  hoerer.add(h);
  // Zweites Fenster im selben Browser: Änderungen aus dem Cockpit kommen sofort an.
  if (!verbunden && typeof window !== "undefined") {
    verbunden = true;
    window.addEventListener("storage", (e) => {
      if (e.key === KEY) { zustand = null; melden(); }
      if (e.key === KEY_ANSICHT) { alsSeb = null; melden(); }
    });
  }
  return () => { hoerer.delete(h); };
}

/** Camp-Zustand oder `null`, solange noch nicht geladen (Server, erstes Rendern). */
export function useCamp(): CampZustand | null {
  return useSyncExternalStore(subscribe, laden, () => null);
}

export function usePreise(): Preise & { lohntAbTagen: number } {
  const p = useCamp()?.preise ?? PREISE;
  return { ...p, lohntAbTagen: Math.ceil(p.preisProMonat / Math.max(1, p.werkzeugpauschaleProTag)) };
}

export const usePhasen = () => useCamp()?.phasen ?? PHASEN;

/* ---------- Demo: „Als Seb ansehen" (ersetzt später das Login mit der Rolle Admin) ---------- */

function ladeAnsicht(): boolean {
  if (alsSeb === null) {
    try { alsSeb = window.localStorage.getItem(KEY_ANSICHT) === "seb"; } catch { alsSeb = false; }
  }
  return alsSeb;
}

export function setAlsSeb(an: boolean) {
  alsSeb = an;
  try {
    if (an) window.localStorage.setItem(KEY_ANSICHT, "seb");
    else window.localStorage.removeItem(KEY_ANSICHT);
  } catch { /* egal */ }
  melden();
}

export const istAdmin = () => ladeAnsicht();

/** `true`, wenn die Demo gerade als Seb (Rolle Admin) angesehen wird; `null`, solange nicht geladen. */
export function useAdmin(): boolean | null {
  return useSyncExternalStore(subscribe, ladeAnsicht, () => null);
}
