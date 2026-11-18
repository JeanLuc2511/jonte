/**
 * BUCHUNGS-ADAPTER  →  später: eigenes Buchungs-Backend mit Verwaltung
 *
 * Werkstattbuchten, Workshops, Beratung und Gasprüfung laufen über diese Funktionen.
 * Website, Mitgliederbereich und App nutzen später dieselben Endpunkte:
 *   getHalle()            → GET  /halle            (Zonen, Werkzeug)
 *   getBelegung(von,bis)  → GET  /belegung         (belegte Buchten + Fahrzeuge)
 *   getWorkshops()        → GET  /workshops        (Termine, Anmeldestand)
 *   sendeBuchung()        → POST /buchungen        (Gast oder Konto)
 * Basis-URL: BUCHUNG_API_URL in `.env.example`.
 */
import { WERKZEUGE, ZONEN } from "@/lib/daten/halle";
import { LEISTUNGEN } from "@/lib/daten/leistungen";
import { beispielWorkshops } from "@/lib/daten/workshops";
import { isoHeute, tageInklusive, ueberschneidet } from "@/lib/datum";
import type {
  Belegung, BuchungsAnfrage, BuchungsBestaetigung, CampZustand, Workshop, WorkshopStatus, Zone,
} from "@/lib/types";

export async function getHalle() {
  return { zonen: ZONEN, werkzeuge: WERKZEUGE };
}

export async function getLeistungen() {
  return LEISTUNGEN;
}

/**
 * Belegung der Werkstattbuchten aus Buchungen und Sperrzeiten des Camps.
 * Später: Abfrage ans Backend für den Zeitraum.
 */
export function belegungAus(camp: Pick<CampZustand, "buchungen" | "sperrzeiten">): Belegung[] {
  const gebucht: Belegung[] = camp.buchungen.filter((b) => b.status === "bestaetigt").map((b) => ({
    id: b.id, buchtId: b.buchtId, von: b.von, bis: b.bis,
    fahrzeug: { spitzname: b.fahrzeug.spitzname, modell: b.fahrzeug.modell, typ: b.fahrzeug.typ === "anderes" ? "sprinter" : b.fahrzeug.typ, farbe: b.fahrzeug.farbe },
    crew: b.kunde.name.split(" ")[0] + (b.kunde.name.includes("&") ? ` & ${b.kunde.name.split("& ")[1].split(" ")[0]}` : ""),
    phase: b.phase ?? "", instagram: b.instagram,
  }));
  const gesperrt: Belegung[] = camp.sperrzeiten.flatMap((s) => s.buchtIds.map((buchtId) => ({
    id: `${s.id}-${buchtId}`, buchtId, von: s.von, bis: s.bis, gesperrt: s.grund,
    fahrzeug: { spitzname: "gesperrt", modell: "", typ: "sprinter" as const, farbe: "#A38879" }, crew: "", phase: s.grund,
  })));
  return [...gebucht, ...gesperrt];
}

export async function getWorkshops(heute: string = isoHeute()): Promise<Workshop[]> {
  return beispielWorkshops(heute);
}

/* ---------- Regeln (liegen später im Backend, hier für die Demo) ---------- */

export function belegungImZeitraum(belegung: Belegung[], von: string, bis: string): Belegung[] {
  return belegung.filter((b) => ueberschneidet(b.von, b.bis, von, bis));
}

export function freieBuchten(zonen: Zone[], belegung: Belegung[], von: string, bis: string): Zone[] {
  const belegt = new Set(belegungImZeitraum(belegung, von, bis).map((b) => b.buchtId));
  return zonen.filter((z) => z.typ === "bucht" && !belegt.has(z.id));
}

export const STUNDENPREIS = 14;
export const WOCHENRABATT = 0.15;

/** Preis einer Werkstattbucht: ab 7 Tagen günstiger (Beispiel-Regel, Rabatt pflegbar im Cockpit). */
export function buchtPreis(preisProTag: number, von: string, bis: string, wochenrabatt: number = WOCHENRABATT) {
  const tage = tageInklusive(von, bis);
  const rabatt = tage >= 7 && wochenrabatt > 0;
  const summe = Math.round(preisProTag * tage * (rabatt ? 1 - wochenrabatt : 1));
  return { tage, summe, rabatt };
}

export function workshopStatus(w: Workshop): WorkshopStatus {
  if (w.abgesagt) return "ausgebucht";
  if (w.angemeldet >= w.maxTeilnehmer) return "ausgebucht";
  if (w.angemeldet >= w.minTeilnehmer) return "findet-statt";
  return "offen";
}

export function workshopText(w: Workshop): string {
  const status = workshopStatus(w);
  if (w.abgesagt) return "Abgesagt";
  if (status === "ausgebucht") return "Ausgebucht";
  if (status === "findet-statt") {
    const frei = w.maxTeilnehmer - w.angemeldet;
    return `Findet statt · noch ${frei} ${frei === 1 ? "Platz" : "Plätze"}`;
  }
  const fehlen = w.minTeilnehmer - w.angemeldet;
  return `Noch ${fehlen} bis zum Start`;
}

export async function sendeBuchung(anfrage: BuchungsAnfrage): Promise<BuchungsBestaetigung> {
  void anfrage;
  const nummer = `CC-${Math.floor(10000 + Math.random() * 89999)}`;
  return { nummer, demo: true };
}
