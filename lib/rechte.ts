/**
 * ROLLEN UND RECHTE – eine Quelle für Website, App und Sebs Cockpit.
 *
 * Die Matrix entspricht der Tabelle „Kontostufen" im Plan (docs/02-mitgliederbereich.md).
 * Die Oberfläche fragt nur `darf(rolle, recht)`; das Backend prüft später dieselben Rechte.
 */
import type { KontoZustand, Rolle } from "@/lib/types";

export type Recht =
  // alle
  | "bucht.buchen"
  // ab kostenlosem Konto
  | "garage" | "projekt" | "events.teilnehmen" | "events.vorschlagen" | "hilfeboerse"
  // nur Mitglieder (Abo)
  | "werkzeug.inklusive" | "support" | "buchung.frueher" | "shop.rabatt" | "werkzeug.wuenschen"
  // nur Admin (Cockpit)
  | "events.freigeben" | "support.antworten" | "werkzeug.auswertung" | "werkzeug.kaufen"
  | "mitglieder.sehen" | "ereignisse.sehen"
  // Camp-Cockpit
  | "cockpit" | "buchungen.verwalten" | "halle.pflegen" | "preise.pflegen" | "workshops.verwalten"
  | "abos.verwalten" | "inhalte.pflegen" | "anfragen.verwalten" | "shop.ueberblick";

const KONTO: Recht[] = ["bucht.buchen", "garage", "projekt", "events.teilnehmen", "events.vorschlagen", "hilfeboerse"];
const MITGLIED: Recht[] = [...KONTO, "werkzeug.inklusive", "support", "buchung.frueher", "shop.rabatt", "werkzeug.wuenschen"];
const ADMIN: Recht[] = [
  ...MITGLIED, "events.freigeben", "support.antworten", "werkzeug.auswertung", "werkzeug.kaufen",
  "mitglieder.sehen", "ereignisse.sehen",
  "cockpit", "buchungen.verwalten", "halle.pflegen", "preise.pflegen", "workshops.verwalten",
  "abos.verwalten", "inhalte.pflegen", "anfragen.verwalten", "shop.ueberblick",
];

/*
 * Weitere Rollen (z. B. „aushilfe") lassen sich hier ergänzen: Rolle in `lib/types.ts` aufnehmen und
 * unten eine eigene Rechte-Liste eintragen, etwa
 *   aushilfe: [...KONTO, "cockpit", "buchungen.verwalten", "support.antworten"]
 * Das Cockpit blendet Bereiche und Aktionen allein über `darf(rolle, recht)` ein und aus.
 */

export const RECHTE: Record<Rolle, readonly Recht[]> = {
  gast: ["bucht.buchen"],
  konto: KONTO,
  mitglied: MITGLIED,
  admin: ADMIN,
};

export const darf = (rolle: Rolle, recht: Recht) => RECHTE[rolle].includes(recht);

/**
 * Wirksame Rolle: Ein pausiertes oder beendetes Abo hat die Rechte des kostenlosen Kontos.
 * Wer gekündigt hat, behält die Abo-Vorteile bis zum Laufzeitende.
 */
export function wirksameRolle(z: Pick<KontoZustand, "mitglied">, heute: string): Rolle {
  const { rolle, abo } = z.mitglied;
  if (rolle !== "mitglied") return rolle;
  if (abo.status === "aktiv") return "mitglied";
  if (abo.status === "gekuendigt" && abo.endetAm && abo.endetAm >= heute) return "mitglied";
  return "konto";
}

export const ROLLEN_NAME: Record<Rolle, string> = {
  gast: "Gast", konto: "Kostenloses Konto", mitglied: "Mitglied", admin: "Camp-Team",
};
