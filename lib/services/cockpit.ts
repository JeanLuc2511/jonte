"use client";

/**
 * COCKPIT-INFRASTRUKTUR  →  später: Sebs Oberfläche (am besten in der App)
 *
 * Hier liegt nur das Fundament: Admin-Aktionen und Auswertungen auf demselben Datenmodell,
 * das auch Website und App nutzen. Eine Oberfläche gibt es bewusst noch nicht.
 * Jede Aktion verlangt ein Admin-Recht (lib/rechte.ts) und erzeugt ein Ereignis.
 *
 * In der Demo rufen zwei kleine „So sieht es aus, wenn Seb …"-Schalter diese Funktionen auf,
 * damit sich Freigabe und „Dein Wunsch ist da!" vorführen lassen.
 */
import { andereWuensche } from "@/lib/daten/mitglied";
import { isoHeute } from "@/lib/datum";
import { getKonto, setKonto } from "@/lib/mein-camp/store";
import { darf, type Recht } from "@/lib/rechte";
import type { CampEvent, Ereignis, KontoZustand, Werkzeugwunsch } from "@/lib/types";
import { melde } from "./ereignisse";
import { _benachrichtige as benachrichtige } from "./mitglieder";

const ADMIN = "admin" as const;
function pruefe(recht: Recht) {
  if (!darf(ADMIN, recht)) throw new Error(`Kein Admin-Recht: ${recht}`);
}

/* ---------- Aktionen ---------- */

/** Seb prüft nur, ob der Zeitpunkt passt, und gibt von Hand frei. Freigegebene Events sind fix. */
export function eventEntscheiden(eventId: string, freigeben: boolean) {
  pruefe("events.freigeben");
  const event = getKonto().events.find((e) => e.id === eventId);
  if (!event) return;
  setKonto((z) => {
    const neu: KontoZustand = { ...z, events: z.events.map((e) => (e.id === eventId ? { ...e, status: freigeben ? "freigegeben" : "abgelehnt" } : e)) };
    return benachrichtige(
      neu,
      freigeben ? "Dein Event ist freigegeben" : "Dein Event passt leider nicht",
      freigeben ? `„${event.titel}“ findet statt und steht jetzt im Kalender der Community.` : `„${event.titel}“ kollidiert mit dem Hallenbetrieb. Schlag gern einen anderen Termin vor.`,
      "/mein-camp/community",
    );
  });
  melde(freigeben ? "event.freigegeben" : "event.abgelehnt", { eventId, titel: event.titel }, ADMIN);
}

/** Seb legt ein eigenes Event an – ohne Freigabe, ohne Mindestteilnehmerzahl. */
export function eventAnlegen(e: Pick<CampEvent, "titel" | "beschreibung" | "datum" | "von" | "bis" | "ort" | "maxPersonen">) {
  pruefe("events.freigeben");
  const id = `e-${Date.now().toString(36)}`;
  setKonto((z) => ({ ...z, events: [...z.events, { ...e, id, angemeldet: 0, verantwortlich: "Seb", status: "freigegeben", vomCamp: true, ichDabei: false }] }));
  melde("event.freigegeben", { eventId: id, titel: e.titel, vomCamp: true }, ADMIN);
}

/** Werkzeug wurde gekauft: Alle, die es sich gewünscht haben, bekommen „Dein Wunsch ist da!". */
export function werkzeugGekauft(werkzeug: string) {
  pruefe("werkzeug.kaufen");
  const empfaenger = alleWuensche().filter((w) => w.werkzeug === werkzeug && w.status === "offen").map((w) => w.mitgliedId);
  setKonto((z) => {
    const betroffen = z.werkzeugwuensche.some((w) => w.werkzeug === werkzeug && w.status === "offen");
    const neu: KontoZustand = { ...z, werkzeugwuensche: z.werkzeugwuensche.map((w) => (w.werkzeug === werkzeug ? { ...w, status: "gekauft" } : w)) };
    return betroffen ? benachrichtige(neu, "Dein Wunsch ist da!", `${werkzeug} gibt es jetzt in der Halle.`, "/mein-camp/werkzeugwuensche") : neu;
  });
  melde("werkzeug.gekauft", { werkzeug, benachrichtigt: [...new Set(empfaenger)] }, ADMIN);
}

/* ---------- Auswertungen ---------- */

function alleWuensche(): Werkzeugwunsch[] {
  return [...getKonto().werkzeugwuensche, ...andereWuensche(isoHeute())];
}

/** Welche Werkzeuge wie oft gewünscht wurden, von wem und wann. */
export function werkzeugAuswertung() {
  pruefe("werkzeug.auswertung");
  const gruppen = new Map<string, Werkzeugwunsch[]>();
  for (const w of alleWuensche()) gruppen.set(w.werkzeug, [...(gruppen.get(w.werkzeug) ?? []), w]);
  return [...gruppen.entries()]
    .map(([werkzeug, wuensche]) => ({
      werkzeug, anzahl: wuensche.length, offen: wuensche.some((w) => w.status === "offen"),
      von: wuensche.map((w) => ({ name: w.mitgliedName, datum: w.datum, begruendung: w.begruendung })),
    }))
    .sort((a, b) => b.anzahl - a.anzahl);
}

/** Events, die auf Sebs Freigabe warten. */
export function offeneFreigaben(): CampEvent[] {
  pruefe("events.freigeben");
  return getKonto().events.filter((e) => e.status === "vorgeschlagen");
}

/** Support im Hintergrund messen: Anzahl der Anfragen und Bearbeitungszeit. */
export function supportKennzahlen() {
  pruefe("support.antworten");
  const ev = getKonto().ereignisse;
  const zeiten = ev.filter((e) => e.typ === "support.beantwortet").map((e) => Number(e.daten.bearbeitungszeitSek) || 0);
  return {
    anfragen: ev.filter((e) => e.typ === "support.nachricht").length,
    hilferufe: ev.filter((e) => e.typ === "support.hilferuf").length,
    videotermine: ev.filter((e) => e.typ === "support.videotermin").length,
    mittlereBearbeitungszeitSek: zeiten.length ? Math.round(zeiten.reduce((a, b) => a + b, 0) / zeiten.length) : null,
  };
}

/** Alles, was Mitglieder tun – neueste zuerst. */
export function ereignisProtokoll(): Ereignis[] {
  pruefe("ereignisse.sehen");
  return getKonto().ereignisse;
}
