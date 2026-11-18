"use client";

/**
 * Warenkorb im Browser (localStorage). Später ersetzt durch den Shopify-Cart
 * (`cartCreate` / `cartLinesAdd`); die Hook-Schnittstelle bleibt gleich.
 */
import { useSyncExternalStore } from "react";
import type { WarenkorbZeile } from "@/lib/types";

const KEY = "cc-warenkorb";
const LEER: WarenkorbZeile[] = [];
let zeilen: WarenkorbZeile[] = LEER;
let geladen = false;
const hoerer = new Set<() => void>();

function laden() {
  if (geladen || typeof window === "undefined") return;
  geladen = true;
  try {
    const roh = window.localStorage.getItem(KEY);
    if (roh) zeilen = JSON.parse(roh) as WarenkorbZeile[];
  } catch {
    /* privater Modus o. Ä. – Warenkorb bleibt leer */
  }
}

function setze(neu: WarenkorbZeile[]) {
  zeilen = neu;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(neu));
  } catch {
    /* ohne Speicher funktioniert der Warenkorb für diese Sitzung trotzdem */
  }
  hoerer.forEach((h) => h());
}

/* Lieferwunsch: Bestellung direkt an die gebuchte Werkstattbucht (später Shopify-Cart-Attribut). */
const KEY_LIEFERUNG = "cc-lieferung";
let lieferung: string | null = null;
let lieferungGeladen = false;
function ladeLieferung() {
  if (lieferungGeladen || typeof window === "undefined") return;
  lieferungGeladen = true;
  try { lieferung = window.localStorage.getItem(KEY_LIEFERUNG); } catch { /* egal */ }
}

export const warenkorb = {
  lieferung(ziel: string | null) {
    lieferung = ziel;
    lieferungGeladen = true;
    try {
      if (ziel) window.localStorage.setItem(KEY_LIEFERUNG, ziel);
      else window.localStorage.removeItem(KEY_LIEFERUNG);
    } catch { /* egal */ }
    hoerer.forEach((h) => h());
  },
  hinzu(produktId: string, menge = 1) {
    laden();
    const vorhanden = zeilen.find((z) => z.produktId === produktId);
    setze(
      vorhanden
        ? zeilen.map((z) => (z.produktId === produktId ? { ...z, menge: z.menge + menge } : z))
        : [...zeilen, { produktId, menge }],
    );
  },
  menge(produktId: string, menge: number) {
    setze(
      menge <= 0
        ? zeilen.filter((z) => z.produktId !== produktId)
        : zeilen.map((z) => (z.produktId === produktId ? { ...z, menge } : z)),
    );
  },
  leeren() {
    setze([]);
  },
};

const subscribe = (h: () => void) => {
  hoerer.add(h);
  return () => {
    hoerer.delete(h);
  };
};

export function useWarenkorb() {
  const aktuelle = useSyncExternalStore(
    subscribe,
    () => {
      laden();
      return zeilen;
    },
    () => LEER,
  );
  const lieferziel = useSyncExternalStore(subscribe, () => { ladeLieferung(); return lieferung; }, () => null);
  const anzahl = aktuelle.reduce((summe, z) => summe + z.menge, 0);
  return { zeilen: aktuelle, anzahl, lieferziel };
}

/** „Heute" als ISO-Datum – auf dem Server `null`, damit nichts auseinanderläuft. */
const nie = () => () => {};
export function useHeute(): string | null {
  return useSyncExternalStore(
    nie,
    () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },
    () => null,
  );
}
