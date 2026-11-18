"use client";

/**
 * Konto-Zustand im Browser (localStorage) – steht in der Demo für das spätere Backend.
 * Komponenten lesen über `useKonto()`, ändern aber nur über `lib/services/mitglieder.ts`.
 * Auf dem Server und beim ersten Rendern ist der Zustand `null` (noch nicht geladen).
 */
import { useSyncExternalStore } from "react";
import { KONTO_VERSION, beispielKonto } from "@/lib/daten/mitglied";
import { isoHeute, tageInklusive } from "@/lib/datum";
import { wirksameRolle } from "@/lib/rechte";
import type { KontoZustand } from "@/lib/types";

const KEY = "cc-mein-camp";
/** Nach so vielen Tagen werden unveränderte Beispieldaten aufgefrischt, damit Termine nicht veralten. */
const FRISCH_TAGE = 3;

let zustand: KontoZustand | null = null;
const hoerer = new Set<() => void>();

function laden(): KontoZustand {
  if (zustand) return zustand;
  const heute = isoHeute();
  try {
    const roh = window.localStorage.getItem(KEY);
    if (roh) {
      const z = JSON.parse(roh) as KontoZustand;
      if (z.version === KONTO_VERSION && tageInklusive(z.seedTag, heute) <= FRISCH_TAGE + 1) return (zustand = z);
    }
  } catch {
    /* kein Speicher verfügbar – die Demo läuft dann nur für diese Sitzung */
  }
  return (zustand = beispielKonto(heute));
}

export function getKonto(): KontoZustand {
  return laden();
}

export function setKonto(aendern: (alt: KontoZustand) => KontoZustand) {
  zustand = aendern(laden());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(zustand));
  } catch {
    /* z. B. Speicher voll durch Fotos – Zustand bleibt für die Sitzung erhalten */
  }
  hoerer.forEach((h) => h());
}

export function resetKonto() {
  zustand = beispielKonto(isoHeute());
  try {
    window.localStorage.removeItem(KEY);
  } catch { /* egal */ }
  hoerer.forEach((h) => h());
}

const subscribe = (h: () => void) => {
  hoerer.add(h);
  return () => {
    hoerer.delete(h);
  };
};

/** Zustand des Kontos oder `null`, solange noch nicht geladen. */
export function useKonto(): KontoZustand | null {
  return useSyncExternalStore(subscribe, laden, () => null);
}

/** Wirksame Rolle (berücksichtigt pausiertes/gekündigtes Abo) oder `null`, solange nicht geladen. */
export function useRolle() {
  const z = useKonto();
  return z ? wirksameRolle(z, isoHeute()) : null;
}

export const neueId = (praefix: string) => `${praefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
