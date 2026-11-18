"use client";

/**
 * MITGLIEDER-ADAPTER  →  später: eigenes Backend (dieselben Endpunkte nutzt die App)
 *
 * Jede Funktion steht für einen späteren API-Aufruf. In der Demo ändert sie den Konto-Zustand
 * im Browser und meldet ein Ereignis (→ n8n, Cockpit). Zum Andocken werden die Funktionskörper
 * durch `fetch` gegen das Backend ersetzt; Signaturen und Ereignisse bleiben.
 */
import { ABO } from "@/lib/daten/abo";
import { PHASEN } from "@/lib/daten/phasen";
import { beispielKonto } from "@/lib/daten/mitglied";
import { isoHeute, plusTage, vonIso, toIso } from "@/lib/datum";
import { getKonto, neueId, resetKonto, setKonto } from "@/lib/mein-camp/store";
import { darf, wirksameRolle, type Recht } from "@/lib/rechte";
import type {
  Ausbauprojekt, Benachrichtigung, BudgetEintrag, CampEvent, GaragenFahrzeug, HilfeEintrag,
  KontoZustand, MeineBuchung, PhasenId, Rolle, SupportNachricht, TagebuchEintrag,
} from "@/lib/types";
import { melde } from "./ereignisse";

const jetzt = () => new Date().toISOString();

function pruefe(recht: Recht) {
  const z = getKonto();
  if (!darf(wirksameRolle(z, isoHeute()), recht)) throw new Error(`Kein Recht: ${recht}`);
}

function benachrichtige(z: KontoZustand, titel: string, text: string, link?: string): KontoZustand {
  const n: Benachrichtigung = { id: neueId("n"), zeit: jetzt(), titel, text, link, gelesen: false };
  return { ...z, benachrichtigungen: [n, ...z.benachrichtigungen] };
}

const monatsende = (iso: string) => {
  const d = vonIso(iso);
  return toIso(new Date(d.getFullYear(), d.getMonth() + 1, 0, 12));
};

/* ---------- Demo: Ansicht wechseln ---------- */

/** Schaltet die Demo zwischen Gast, kostenlosem Konto und Mitglied um. */
export function demoAnsicht(rolle: Exclude<Rolle, "admin">) {
  const heute = isoHeute();
  setKonto((z) => ({
    ...z,
    mitglied: {
      ...z.mitglied, rolle,
      abo: rolle === "mitglied"
        ? { status: "aktiv", preisProMonat: ABO.preisProMonat, seit: z.mitglied.abo.seit ?? heute, naechsteAbbuchung: plusTage(heute, 12) }
        : { status: "keins", preisProMonat: ABO.preisProMonat },
    },
  }));
}

export function demoZuruecksetzen() {
  resetKonto();
}

/* ---------- Konto & Abo ---------- */

export function kontoAnlegen(daten: { vorname: string; email: string }) {
  setKonto((z) => ({
    ...beispielKonto(isoHeute()),
    mitglied: { ...z.mitglied, ...daten, nachname: "", rolle: "konto", dabeiSeit: isoHeute(), abo: { status: "keins", preisProMonat: ABO.preisProMonat } },
    fahrzeuge: [], aktivesFahrzeugId: null, projekte: [], buchungen: [], support: [], werkzeugwuensche: [], benachrichtigungen: [],
  }));
  melde("konto.angelegt", { email: daten.email });
}

export function aboAbschliessen() {
  const heute = isoHeute();
  setKonto((z) => ({
    ...z, mitglied: { ...z.mitglied, rolle: "mitglied", abo: { status: "aktiv", preisProMonat: ABO.preisProMonat, seit: heute, naechsteAbbuchung: plusTage(heute, 30) } },
  }));
  melde("abo.abgeschlossen", { preisProMonat: ABO.preisProMonat });
}

export function aboPausieren(monate: number) {
  const bis = plusTage(isoHeute(), monate * 30);
  setKonto((z) => ({ ...z, mitglied: { ...z.mitglied, abo: { ...z.mitglied.abo, status: "pausiert", pausiertBis: bis, naechsteAbbuchung: bis } } }));
  melde("abo.pausiert", { monate, pausiertBis: bis });
}

export function aboFortsetzen() {
  setKonto((z) => ({
    ...z, mitglied: { ...z.mitglied, rolle: "mitglied", abo: { ...z.mitglied.abo, status: "aktiv", pausiertBis: undefined, endetAm: undefined, naechsteAbbuchung: plusTage(isoHeute(), 30) } },
  }));
  melde("abo.fortgesetzt");
}

/** Kündigung zum Monatsende. Das kostenlose Konto und alle Projektdaten bleiben erhalten. */
export function aboKuendigen(grund?: string) {
  const endet = monatsende(isoHeute());
  setKonto((z) => ({ ...z, mitglied: { ...z.mitglied, abo: { ...z.mitglied.abo, status: "gekuendigt", endetAm: endet, pausiertBis: undefined } } }));
  melde("abo.gekuendigt", { endetAm: endet, grund });
}

/* ---------- Meine Garage ---------- */

export function fahrzeugAnlegen(f: Omit<GaragenFahrzeug, "id">): string {
  pruefe("garage");
  const id = neueId("f");
  const geplant = Object.fromEntries(PHASEN.map((p) => [p.id, p.budgetRichtwert])) as Record<PhasenId, number>;
  const start: PhasenId = f.ausbaustand === "leer" || f.ausbaustand === "fertig" ? "planung" : f.ausbaustand;
  const projekt: Ausbauprojekt = {
    id: neueId("pr"), fahrzeugId: id, titel: `${f.spitzname} wird ausgebaut`, aktivePhase: start,
    oeffentlich: false, erledigt: {}, budgetGeplant: geplant, budget: [], tagebuch: [],
  };
  setKonto((z) => ({
    ...z, fahrzeuge: [...z.fahrzeuge, { ...f, id }], aktivesFahrzeugId: z.aktivesFahrzeugId ?? id, projekte: [...z.projekte, projekt],
  }));
  melde("fahrzeug.angelegt", { hersteller: f.hersteller, modell: f.modell, typ: f.typ, quelle: f.quelle });
  return id;
}

export function fahrzeugAktivieren(id: string) {
  setKonto((z) => ({ ...z, aktivesFahrzeugId: id }));
}

export function fahrzeugEntfernen(id: string) {
  setKonto((z) => {
    const fahrzeuge = z.fahrzeuge.filter((f) => f.id !== id);
    return {
      ...z, fahrzeuge, projekte: z.projekte.filter((p) => p.fahrzeugId !== id),
      aktivesFahrzeugId: z.aktivesFahrzeugId === id ? fahrzeuge[0]?.id ?? null : z.aktivesFahrzeugId,
    };
  });
  melde("fahrzeug.entfernt", { id });
}

/* ---------- Projekt-Planer & Bautagebuch ---------- */

function aendereProjekt(projektId: string, f: (p: Ausbauprojekt) => Ausbauprojekt) {
  pruefe("projekt");
  setKonto((z) => ({ ...z, projekte: z.projekte.map((p) => (p.id === projektId ? f(p) : p)) }));
}

export function checklisteUmschalten(projektId: string, phase: PhasenId, index: number) {
  aendereProjekt(projektId, (p) => {
    const alt = p.erledigt[phase] ?? [];
    return { ...p, erledigt: { ...p.erledigt, [phase]: alt.includes(index) ? alt.filter((i) => i !== index) : [...alt, index] } };
  });
}

export function phaseSetzen(projektId: string, phase: PhasenId) {
  aendereProjekt(projektId, (p) => ({ ...p, aktivePhase: phase }));
  const p = getKonto().projekte.find((x) => x.id === projektId);
  setKonto((z) => ({ ...z, fahrzeuge: z.fahrzeuge.map((f) => (f.id === p?.fahrzeugId ? { ...f, ausbaustand: phase } : f)) }));
  melde("projekt.phase", { projektId, phase });
}

/** Der Privat-Knopf wirkt sofort: Das Projekt verschwindet aus der Community-Galerie. */
export function sichtbarkeitSetzen(projektId: string, oeffentlich: boolean) {
  aendereProjekt(projektId, (p) => ({ ...p, oeffentlich }));
  melde("projekt.sichtbarkeit", { projektId, oeffentlich });
}

export function budgetGeplantSetzen(projektId: string, phase: PhasenId, betrag: number) {
  aendereProjekt(projektId, (p) => ({ ...p, budgetGeplant: { ...p.budgetGeplant, [phase]: Math.max(0, betrag) } }));
}

export function budgetEintragen(projektId: string, eintrag: Omit<BudgetEintrag, "id">) {
  aendereProjekt(projektId, (p) => ({ ...p, budget: [{ ...eintrag, id: neueId("b") }, ...p.budget] }));
}

export function budgetLoeschen(projektId: string, id: string) {
  aendereProjekt(projektId, (p) => ({ ...p, budget: p.budget.filter((b) => b.id !== id) }));
}

export function tagebuchSchreiben(projektId: string, eintrag: Omit<TagebuchEintrag, "id">) {
  aendereProjekt(projektId, (p) => ({ ...p, tagebuch: [{ ...eintrag, id: neueId("t") }, ...p.tagebuch] }));
  melde("projekt.tagebuch", { projektId, phase: eintrag.phase, fotos: eintrag.fotos.length });
}

export function tagebuchLoeschen(projektId: string, id: string) {
  aendereProjekt(projektId, (p) => ({ ...p, tagebuch: p.tagebuch.filter((t) => t.id !== id) }));
}

/** Stückliste einer Phase wurde in den Warenkorb gelegt (der Kauf selbst läuft über den Shop). */
export function stuecklisteBestellt(projektId: string, phase: PhasenId, anBucht: string | null) {
  melde("projekt.bestellung", { projektId, phase, lieferungAnBucht: anBucht });
}

/* ---------- Buchungen ---------- */

export function buchungMerken(b: Omit<MeineBuchung, "id">) {
  setKonto((z) => ({ ...z, buchungen: [...z.buchungen, { ...b, id: neueId("bu") }] }));
  melde("buchung.angefragt", { leistung: b.leistung, von: b.von, bis: b.bis, buchtId: b.buchtId });
}

/** Die Buchung, die heute läuft – Voraussetzung für den „Ich komm nicht weiter"-Knopf. */
export function laufendeBuchung(z: KontoZustand, heute: string): MeineBuchung | undefined {
  return z.buchungen.find((b) => b.leistung === "bucht" && b.von <= heute && b.bis >= heute);
}

/* ---------- Support von Seb ---------- */

const GRENZE = /\b(gas|gasanlage|gasleitung|230\s?v|landstrom|wechselrichter|fi-?schalter|netzspannung)\b/i;
export const istGrenzthema = (text: string) => GRENZE.test(text);

const ANTWORTEN = [
  "Gute Frage. Schick mir gern noch ein Foto von der Stelle, dann sehe ich, wie es bei dir aussieht.",
  "Das kriegen wir hin. Ich schau mir dein Bautagebuch an und melde mich gleich mit einem Vorschlag.",
  "Kenn ich. Bei deinem Fahrzeug ist da ein Holm im Weg – ich zeig dir morgen in der Bucht, wie du drum herum kommst.",
];

function sebAntwortet(text: string, art: SupportNachricht["art"] = "nachricht") {
  const gesendet = Date.now();
  window.setTimeout(() => {
    const n: SupportNachricht = { id: neueId("s"), von: "seb", zeit: jetzt(), text, art };
    setKonto((z) => benachrichtige({ ...z, support: [...z.support, n] }, "Seb hat geantwortet", `„${text.slice(0, 60)}${text.length > 60 ? " …" : ""}“`, "/mein-camp/support"));
    // Bearbeitungszeit wird im Hintergrund mitgeschrieben (Auswertung im Cockpit).
    melde("support.beantwortet", { bearbeitungszeitSek: Math.round((Date.now() - gesendet) / 1000), simuliert: true }, "admin");
  }, 2200);
}

export function supportSenden(text: string, foto?: string) {
  pruefe("support");
  const z = getKonto();
  const projekt = z.projekte.find((p) => p.fahrzeugId === z.aktivesFahrzeugId);
  const grenze = istGrenzthema(text);
  const neu: SupportNachricht[] = [{ id: neueId("s"), von: "mitglied", zeit: jetzt(), text, foto, art: "nachricht" }];
  if (grenze) {
    neu.push({
      id: neueId("s"), von: "system", zeit: jetzt(), art: "grenze",
      text: "Gas und 230 V klären wir nicht aus der Ferne. Buch dafür eine Beratung vor Ort oder einen Platz in der Halle – dann schauen wir gemeinsam drauf.",
    });
  }
  setKonto((alt) => ({ ...alt, support: [...alt.support, ...neu] }));
  // Seb sieht sofort Fahrzeug, Phase und bisherige Bilder – der Kontext geht mit.
  melde("support.nachricht", { fahrzeugId: z.aktivesFahrzeugId, phase: projekt?.aktivePhase, mitFoto: Boolean(foto), grenzthema: grenze });
  if (!grenze) sebAntwortet(ANTWORTEN[z.support.length % ANTWORTEN.length]);
}

export function hilferuf() {
  pruefe("support");
  const z = getKonto();
  const b = laufendeBuchung(z, isoHeute());
  if (!b) return;
  const n: SupportNachricht = { id: neueId("s"), von: "system", zeit: jetzt(), art: "hilferuf", text: `Hilferuf aus ${b.titel} ist bei Seb angekommen.` };
  setKonto((alt) => ({ ...alt, support: [...alt.support, n] }));
  melde("support.hilferuf", { buchtId: b.buchtId, fahrzeugId: b.fahrzeugId });
  sebAntwortet("Hab’s gesehen. Ich bin in fünf Minuten bei dir in der Bucht.");
}

export function videoterminBuchen(datum: string, uhrzeit: string) {
  pruefe("support");
  const n: SupportNachricht = { id: neueId("s"), von: "system", zeit: jetzt(), art: "videotermin", text: `Video-Termin angefragt: ${datum}, ${uhrzeit} Uhr. Seb bestätigt dir den Termin.` };
  setKonto((alt) => ({ ...alt, support: [...alt.support, n] }));
  melde("support.videotermin", { datum, uhrzeit });
}

/* ---------- Community: Events & Hilfe-Börse ---------- */

export function eventVorschlagen(e: Pick<CampEvent, "titel" | "beschreibung" | "datum" | "von" | "bis" | "ort" | "maxPersonen">) {
  pruefe("events.vorschlagen");
  const z = getKonto();
  const event: CampEvent = {
    ...e, id: neueId("e"), angemeldet: 1, verantwortlich: z.mitglied.vorname, status: "vorgeschlagen",
    vomCamp: false, vorgeschlagenVon: z.mitglied.vorname, ichDabei: true,
  };
  setKonto((alt) => ({ ...alt, events: [...alt.events, event] }));
  melde("event.vorgeschlagen", { eventId: event.id, titel: e.titel, datum: e.datum, von: e.von, bis: e.bis, ort: e.ort, maxPersonen: e.maxPersonen });
}

export function eventTeilnahme(eventId: string, dabei: boolean) {
  pruefe("events.teilnehmen");
  setKonto((z) => ({
    ...z,
    events: z.events.map((e) => {
      if (e.id !== eventId || e.ichDabei === dabei) return e;
      if (dabei && e.angemeldet >= e.maxPersonen) return e;
      return { ...e, ichDabei: dabei, angemeldet: e.angemeldet + (dabei ? 1 : -1) };
    }),
  }));
  melde(dabei ? "event.angemeldet" : "event.abgemeldet", { eventId });
}

export function hilfeEintragen(h: Pick<HilfeEintrag, "art" | "titel" | "text" | "wann">) {
  pruefe("hilfeboerse");
  const z = getKonto();
  const f = z.fahrzeuge.find((x) => x.id === z.aktivesFahrzeugId);
  const eintrag: HilfeEintrag = { ...h, id: neueId("h"), von: z.mitglied.vorname, fahrzeug: f ? `${f.modell.split(" ")[0]} ${f.radstand ?? ""}${f.dachhoehe ?? ""}`.trim() : undefined, antworten: 0, eigener: true };
  setKonto((alt) => ({ ...alt, hilfe: [eintrag, ...alt.hilfe] }));
  melde("hilfe.eintrag", { art: h.art, titel: h.titel });
}

export function hilfeAntworten(id: string) {
  pruefe("hilfeboerse");
  setKonto((z) => ({ ...z, hilfe: z.hilfe.map((h) => (h.id === id ? { ...h, antworten: h.antworten + 1 } : h)) }));
  melde("hilfe.antwort", { hilfeId: id });
}

export function hilfeLoeschen(id: string) {
  setKonto((z) => ({ ...z, hilfe: z.hilfe.filter((h) => h.id !== id) }));
}

/* ---------- Werkzeugwünsche ---------- */

/** Wünsche sind nicht öffentlich: Sie gehen nur an Seb, es gibt kein Voting. */
export function werkzeugWuenschen(werkzeug: string, begruendung: string) {
  pruefe("werkzeug.wuenschen");
  const z = getKonto();
  setKonto((alt) => ({
    ...alt,
    werkzeugwuensche: [{ id: neueId("w"), mitgliedId: z.mitglied.id, mitgliedName: z.mitglied.vorname, werkzeug, begruendung, datum: isoHeute(), status: "offen" }, ...alt.werkzeugwuensche],
  }));
  melde("werkzeug.gewuenscht", { werkzeug, begruendung });
}

/* ---------- Benachrichtigungen ---------- */

export function benachrichtigungenGelesen() {
  setKonto((z) => ({ ...z, benachrichtigungen: z.benachrichtigungen.map((n) => ({ ...n, gelesen: true })) }));
}

export { benachrichtige as _benachrichtige };
