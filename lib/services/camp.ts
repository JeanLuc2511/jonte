"use client";

/**
 * CAMP-ADAPTER (öffentliche Seite)  →  später: Buchungs-Backend
 *
 * Was Besucher und Mitglieder auslösen und was danach in Sebs Cockpit auftaucht:
 * neue Buchungen, Workshop-Reservierungen, Wartelisten- und Kontaktanfragen.
 * In der Demo landet es im Camp-Zustand des Browsers; später sind es API-Aufrufe.
 */
import { getCamp, setCamp } from "@/lib/camp/store";
import { neueId } from "@/lib/mein-camp/store";
import type { Anfrage, HallenBuchung, WorkshopTeilnehmer } from "@/lib/types";
import { melde } from "./ereignisse";

export function buchungEingegangen(b: Omit<HallenBuchung, "id" | "status">, id: string = neueId("bu")): string {
  setCamp((c) => ({ ...c, buchungen: [...c.buchungen, { ...b, id, status: "bestaetigt" }] }));
  return id;
}

export function workshopReserviert(workshopId: string, teilnehmer: WorkshopTeilnehmer) {
  const w = getCamp().workshops.find((x) => x.id === workshopId);
  if (!w || w.abgesagt || w.angemeldet >= w.maxTeilnehmer) return;
  setCamp((c) => ({
    ...c,
    workshops: c.workshops.map((x) => (x.id === workshopId ? { ...x, angemeldet: x.angemeldet + 1, teilnehmer: [...(x.teilnehmer ?? []), teilnehmer] } : x)),
  }));
  melde("workshop.reserviert", { workshopId, titel: w.titel, angemeldet: w.angemeldet + 1, minTeilnehmer: w.minTeilnehmer });
}

export function anfrageEingegangen(a: Pick<Anfrage, "art" | "name" | "email" | "telefon" | "angaben">) {
  setCamp((c) => ({ ...c, anfragen: [{ ...a, id: neueId("a"), zeit: new Date().toISOString(), status: "neu" }, ...c.anfragen] }));
  melde("anfrage.eingegangen", { art: a.art });
}
