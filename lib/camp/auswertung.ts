/**
 * Auswertungen fürs Cockpit – reine Funktionen auf dem gemeinsamen Datenmodell.
 * Später rechnet das Backend dieselben Zahlen; die Oberfläche bleibt gleich.
 */
import { plusTage, tageInklusive, ueberschneidet, vonIso, toIso } from "@/lib/datum";
import type {
  CampZustand, HallenBuchung, KontoZustand, MitgliedAkte, SupportFall, SupportNachricht, Werkzeugwunsch, WunschStatus,
} from "@/lib/types";

/** Akte des Beispiel-Mitglieds, live aus dessen Konto gebaut. */
export function akteAus(konto: KontoZustand): MitgliedAkte {
  const projekt = konto.projekte.find((p) => p.fahrzeugId === konto.aktivesFahrzeugId) ?? konto.projekte[0];
  const buchten = konto.buchungen.filter((b) => b.leistung === "bucht").sort((a, b) => b.von.localeCompare(a.von));
  return {
    mitglied: konto.mitglied,
    fahrzeuge: konto.fahrzeuge.map((f) => ({ spitzname: f.spitzname, modell: `${f.hersteller} ${f.modell}`, farbe: f.farbe })),
    projekt: projekt && {
      titel: projekt.titel, phase: projekt.aktivePhase, eintraege: projekt.tagebuch.length, oeffentlich: projekt.oeffentlich,
      fotos: projekt.tagebuch.flatMap((t) => t.fotos).slice(0, 4),
    },
    buchungen: konto.buchungen.length, letzteBuchung: buchten[0]?.von,
  };
}

/** Alle Konten: das Beispiel-Mitglied (sofern es ein Konto hat) plus die übrigen. */
export function alleAkten(camp: CampZustand, konto: KontoZustand): MitgliedAkte[] {
  return konto.mitglied.rolle === "gast" ? camp.mitglieder : [akteAus(konto), ...camp.mitglieder];
}

export function alleFaelle(camp: CampZustand, konto: KontoZustand): SupportFall[] {
  const eigener: SupportFall = { mitgliedId: konto.mitglied.id, nachrichten: konto.support };
  return [eigener, ...camp.support].filter((f) => f.nachrichten.length > 0);
}

export const letzteNachricht = (f: SupportFall) => f.nachrichten[f.nachrichten.length - 1];

/** Wartet auf Seb: Die letzte Nachricht im Verlauf stammt vom Mitglied. */
export function unbeantwortet(f: SupportFall): boolean {
  const chat = f.nachrichten.filter((n) => n.von !== "system");
  return chat.length > 0 && chat[chat.length - 1].von === "mitglied";
}

export function offeneHilferufe(faelle: SupportFall[]): { mitgliedId: string; nachricht: SupportNachricht }[] {
  return faelle.flatMap((f) => f.nachrichten.filter((n) => n.art === "hilferuf" && n.erledigt === false).map((nachricht) => ({ mitgliedId: f.mitgliedId, nachricht })));
}

export function videotermine(faelle: SupportFall[]) {
  return faelle.flatMap((f) => f.nachrichten.filter((n) => n.art === "videotermin").map((nachricht) => ({ mitgliedId: f.mitgliedId, nachricht })));
}

/** Support im Hintergrund messen: Anfragen und mittlere Zeit bis zu Sebs Antwort (Minuten). */
export function supportKennzahlen(faelle: SupportFall[]) {
  let anfragen = 0;
  const zeiten: number[] = [];
  for (const f of faelle) {
    const chat = f.nachrichten.filter((n) => n.von !== "system");
    chat.forEach((n, i) => {
      if (n.von !== "mitglied") return;
      anfragen++;
      const antwort = chat.slice(i + 1).find((x) => x.von === "seb");
      const davor = chat[i - 1];
      // nur die erste Nachricht einer Frage zählt für die Antwortzeit
      if (antwort && (!davor || davor.von === "seb")) zeiten.push((new Date(antwort.zeit).getTime() - new Date(n.zeit).getTime()) / 60_000);
    });
  }
  const mittel = zeiten.length ? Math.round(zeiten.reduce((a, b) => a + b, 0) / zeiten.length) : null;
  return { anfragen, mittlereAntwortzeitMin: mittel, wartend: faelle.filter(unbeantwortet).length };
}

export const dauerText = (min: number | null) =>
  min === null ? "–" : min < 60 ? `${Math.max(1, min)} Min.` : min < 1440 ? `${Math.round((min / 60) * 10) / 10} Std.`.replace(".", ",") : `${Math.round(min / 1440)} Tage`;

/** Welche Werkzeuge wie oft gewünscht wurden, von wem, wann und warum. */
export function wunschAuswertung(camp: CampZustand, konto: KontoZustand) {
  const alle: Werkzeugwunsch[] = [...konto.werkzeugwuensche, ...camp.wuensche];
  const gruppen = new Map<string, Werkzeugwunsch[]>();
  for (const w of alle) gruppen.set(w.werkzeug, [...(gruppen.get(w.werkzeug) ?? []), w]);
  return [...gruppen.entries()]
    .map(([werkzeug, wuensche]) => {
      const status: WunschStatus = camp.wunschStatus[werkzeug] ?? (wuensche.every((w) => w.status === "gekauft") ? "gekauft" : "neu");
      return { werkzeug, status, anzahl: wuensche.length, wuensche: [...wuensche].sort((a, b) => b.datum.localeCompare(a.datum)) };
    })
    .sort((a, b) => b.anzahl - a.anzahl);
}

const aktiv = (b: HallenBuchung) => b.status === "bestaetigt";

export function belegtAm(camp: CampZustand, tag: string): HallenBuchung[] {
  return camp.buchungen.filter((b) => aktiv(b) && b.von <= tag && b.bis >= tag);
}

/** Auslastung der Werkstattbuchten im Zeitraum als Anteil 0–1. */
export function auslastung(camp: CampZustand, von: string, bis: string): number {
  const buchten = camp.zonen.filter((z) => z.typ === "bucht").length;
  const tage = tageInklusive(von, bis);
  let belegt = 0;
  for (const b of camp.buchungen.filter(aktiv)) {
    if (!ueberschneidet(b.von, b.bis, von, bis)) continue;
    belegt += tageInklusive(b.von > von ? b.von : von, b.bis < bis ? b.bis : bis);
  }
  return buchten ? Math.min(1, belegt / (buchten * tage)) : 0;
}

export function wochenGrenzen(heute: string): [string, string] {
  const d = vonIso(heute);
  const montag = plusTage(heute, -((d.getDay() + 6) % 7));
  return [montag, plusTage(montag, 6)];
}

export function monatsGrenzen(heute: string): [string, string] {
  const d = vonIso(heute);
  return [toIso(new Date(d.getFullYear(), d.getMonth(), 1, 12)), toIso(new Date(d.getFullYear(), d.getMonth() + 1, 0, 12))];
}

/** Umsatz aus Buchungen, die im Zeitraum beginnen. */
export function umsatz(camp: CampZustand, von: string, bis: string): number {
  return camp.buchungen.filter((b) => aktiv(b) && b.von >= von && b.von <= bis).reduce((s, b) => s + b.summe, 0);
}

export function aboZahlen(akten: MitgliedAkte[]) {
  const z = { aktiv: 0, pausiert: 0, gekuendigt: 0, konto: 0 };
  for (const a of akten) {
    const s = a.mitglied.abo.status;
    if (a.mitglied.rolle === "mitglied" && s !== "keins") z[s]++;
    else z.konto++;
  }
  return z;
}

/** Gibt es im Zeitraum schon eine Buchung oder Sperrzeit in dieser Werkstattbucht? */
export function konflikt(camp: CampZustand, buchtId: string, von: string, bis: string, ohneId?: string): string | null {
  const b = camp.buchungen.find((x) => aktiv(x) && x.id !== ohneId && x.buchtId === buchtId && ueberschneidet(x.von, x.bis, von, bis));
  if (b) return `In dem Zeitraum steht schon ${b.fahrzeug.spitzname} (${b.kunde.name}) in dieser Werkstattbucht.`;
  const s = camp.sperrzeiten.find((x) => x.buchtIds.includes(buchtId) && ueberschneidet(x.von, x.bis, von, bis));
  return s ? `Die Werkstattbucht ist in dem Zeitraum gesperrt: ${s.grund}.` : null;
}

/** Export der Anfragen als CSV (Semikolon, für Excel). */
export function anfragenAlsCsv(camp: CampZustand): string {
  const spalten = [...new Set(camp.anfragen.flatMap((a) => Object.keys(a.angaben)))];
  const zelle = (t: string) => `"${String(t ?? "").replace(/"/g, '""')}"`;
  const kopf = ["Eingang", "Art", "Status", "Name", "E-Mail", "Telefon", ...spalten].map(zelle).join(";");
  const zeilen = camp.anfragen.map((a) => [a.zeit.slice(0, 16).replace("T", " "), a.art, a.status, a.name, a.email, a.telefon ?? "", ...spalten.map((s) => a.angaben[s] ?? "")].map(zelle).join(";"));
  return "﻿" + [kopf, ...zeilen].join("\r\n");
}
