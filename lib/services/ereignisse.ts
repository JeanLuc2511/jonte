"use client";

/**
 * EREIGNISSE  →  n8n (Benachrichtigungen, Auswertung, Buchhaltung/CRM) und Sebs Cockpit
 *
 * Jede Aktion im Mitgliederbereich erzeugt ein Ereignis. Es wird
 *   1. im Konto-Zustand protokolliert (liest später das Cockpit) und
 *   2. an `/api/ereignisse` geschickt; die Route leitet es an den passenden n8n-Webhook weiter.
 * Ohne konfigurierten Webhook wird die Zustellung simuliert.
 */
import { getKonto, neueId, setKonto } from "@/lib/mein-camp/store";
import { isoHeute } from "@/lib/datum";
import { wirksameRolle } from "@/lib/rechte";
import type { Ereignis, EreignisTyp, Rolle } from "@/lib/types";

export function melde(typ: EreignisTyp, daten: Record<string, unknown> = {}, alsRolle?: Rolle): Ereignis {
  const z = getKonto();
  const ereignis: Ereignis = {
    id: neueId("ev"),
    typ,
    zeit: new Date().toISOString(),
    akteur: alsRolle === "admin"
      ? { id: "admin-seb", name: "Seb", rolle: "admin" }
      : { id: z.mitglied.id, name: z.mitglied.vorname, rolle: wirksameRolle(z, isoHeute()) },
    daten,
  };
  setKonto((alt) => ({ ...alt, ereignisse: [ereignis, ...alt.ereignisse].slice(0, 200) }));
  // Zustellung im Hintergrund; ein Fehler darf die Oberfläche nie blockieren.
  void fetch("/api/ereignisse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ereignis),
    keepalive: true,
  }).catch(() => undefined);
  return ereignis;
}
