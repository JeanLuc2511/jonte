"use client";

/**
 * COCKPIT-ADAPTER  →  später: Backend (Vorschlag im Plan: Supabase, Region EU)
 *
 * Alles, was Seb im Camp-Cockpit tut. Jede Funktion steht für einen späteren API-Aufruf,
 * verlangt ein Admin-Recht (lib/rechte.ts) und erzeugt ein Ereignis (→ n8n benachrichtigt
 * Mitglieder und Seb). In der Demo ändert sie den Camp-Zustand im Browser – und, wo es das
 * Beispiel-Mitglied betrifft, dessen Konto. Deshalb wirken Änderungen sofort auf Website
 * und Mitgliederbereich. Zum Andocken werden nur die Funktionskörper ersetzt.
 */
import { getCamp, istAdmin, resetCamp, setCamp } from "@/lib/camp/store";
import { konflikt, wunschAuswertung } from "@/lib/camp/auswertung";
import { formatLang, formatZeitraum, isoHeute, plusTage, toIso, vonIso } from "@/lib/datum";
import { getKonto, neueId, setKonto } from "@/lib/mein-camp/store";
import { darf, type Recht } from "@/lib/rechte";
import type {
  CampEvent, CampZustand, EreignisTyp, FaqGruppe, HallenBuchung, KontaktDaten, KontoZustand, Leistung, Medium,
  PhasenVorlage, Preise, Rechtsseite, Sperrzeit, SupportNachricht, Werkzeug, Workshop, WunschStatus, Zone, AnfrageStatus,
} from "@/lib/types";
import { melde } from "./ereignisse";
import { _benachrichtige as benachrichtige } from "./mitglieder";

function pruefe(recht: Recht) {
  if (!istAdmin() || !darf("admin", recht)) throw new Error(`Kein Admin-Recht: ${recht}`);
}
const ereignis = (typ: EreignisTyp, daten: Record<string, unknown> = {}) => melde(typ, daten, "admin");
const jetzt = () => new Date().toISOString();
const istBeispielMitglied = (id?: string) => Boolean(id) && id === getKonto().mitglied.id;
const anMitglied = (titel: string, text: string, link: string, aendern: (z: KontoZustand) => KontoZustand = (z) => z) =>
  setKonto((z) => benachrichtige(aendern(z), titel, text, link));

/* ====================== 1. Buchungen und Halle ====================== */

export type BuchungsEingabe = Omit<HallenBuchung, "id" | "status">;

/** Buchung anlegen – auch für Leute ohne Konto (Telefon, Walk-in). Gibt bei Konflikt den Grund zurück. */
export function buchungAnlegen(b: BuchungsEingabe): string | null {
  pruefe("buchungen.verwalten");
  const grund = konflikt(getCamp(), b.buchtId, b.von, b.bis);
  if (grund) return grund;
  const id = neueId("bu");
  setCamp((c) => ({ ...c, buchungen: [...c.buchungen, { ...b, id, status: "bestaetigt" }] }));
  ereignis("buchung.angelegt", { buchungId: id, buchtId: b.buchtId, von: b.von, bis: b.bis, quelle: b.quelle, kunde: b.kunde.name });
  return null;
}

export function buchungVerschieben(id: string, neu: { buchtId: string; von: string; bis: string }): string | null {
  pruefe("buchungen.verwalten");
  const camp = getCamp();
  const alt = camp.buchungen.find((b) => b.id === id);
  if (!alt) return "Buchung nicht gefunden.";
  if (neu.bis < neu.von) return "Das Ende liegt vor dem Anfang.";
  const grund = konflikt(camp, neu.buchtId, neu.von, neu.bis, id);
  if (grund) return grund;
  const bucht = camp.zonen.find((z) => z.id === neu.buchtId)?.name ?? neu.buchtId;
  setCamp((c) => ({ ...c, buchungen: c.buchungen.map((b) => (b.id === id ? { ...b, ...neu } : b)) }));
  if (istBeispielMitglied(alt.mitgliedId)) {
    anMitglied("Deine Buchung wurde verschoben", `Neu: ${bucht}, ${formatZeitraum(neu.von, neu.bis)}.`, "/mein-camp",
      (z) => ({ ...z, buchungen: z.buchungen.map((b) => (b.id === id ? { ...b, ...neu, titel: bucht } : b)) }));
  }
  ereignis("buchung.verschoben", { buchungId: id, ...neu, mitgliedId: alt.mitgliedId });
  return null;
}

export function buchungStornieren(id: string) {
  pruefe("buchungen.verwalten");
  const alt = getCamp().buchungen.find((b) => b.id === id);
  if (!alt) return;
  setCamp((c) => ({ ...c, buchungen: c.buchungen.map((b) => (b.id === id ? { ...b, status: "storniert" } : b)) }));
  if (istBeispielMitglied(alt.mitgliedId)) {
    anMitglied("Deine Buchung wurde storniert", `${formatZeitraum(alt.von, alt.bis)} – melde dich, wenn du einen neuen Termin brauchst.`, "/mein-camp",
      (z) => ({ ...z, buchungen: z.buchungen.filter((b) => b.id !== id) }));
  }
  ereignis("buchung.storniert", { buchungId: id, mitgliedId: alt.mitgliedId, kunde: alt.kunde.name });
}

export function sperrzeitSetzen(s: Omit<Sperrzeit, "id">): string | null {
  pruefe("buchungen.verwalten");
  if (!s.buchtIds.length) return "Wähl mindestens eine Werkstattbucht.";
  if (s.bis < s.von) return "Das Ende liegt vor dem Anfang.";
  const camp = getCamp();
  const belegt = s.buchtIds.map((b) => camp.buchungen.find((x) => x.status === "bestaetigt" && x.buchtId === b && x.von <= s.bis && x.bis >= s.von)).find(Boolean);
  if (belegt) return `In dem Zeitraum gibt es schon eine Buchung (${belegt.fahrzeug.spitzname}). Verschieb oder storniere sie zuerst.`;
  setCamp((c) => ({ ...c, sperrzeiten: [...c.sperrzeiten, { ...s, id: neueId("sp") }] }));
  ereignis("sperrzeit.gesetzt", { ...s });
  return null;
}

export function sperrzeitEntfernen(id: string) {
  pruefe("buchungen.verwalten");
  setCamp((c) => ({ ...c, sperrzeiten: c.sperrzeiten.filter((s) => s.id !== id) }));
  ereignis("sperrzeit.entfernt", { id });
}

/** Werkstattbucht, Werkbank oder Station anlegen bzw. ändern (Maße, Ausstattung, Preis, Lage im Plan). */
export function zoneSpeichern(zone: Zone) {
  pruefe("halle.pflegen");
  setCamp((c) => ({ ...c, zonen: c.zonen.some((z) => z.id === zone.id) ? c.zonen.map((z) => (z.id === zone.id ? zone : z)) : [...c.zonen, zone] }));
  ereignis("halle.geaendert", { zoneId: zone.id, name: zone.name });
}

export function zoneEntfernen(id: string): string | null {
  pruefe("halle.pflegen");
  const camp = getCamp();
  if (camp.buchungen.some((b) => b.buchtId === id && b.status === "bestaetigt" && b.bis >= isoHeute())) return "Für diese Werkstattbucht gibt es noch Buchungen.";
  setCamp((c) => ({ ...c, zonen: c.zonen.filter((z) => z.id !== id), werkzeuge: c.werkzeuge.filter((w) => w.zoneId !== id) }));
  ereignis("halle.geaendert", { zoneId: id, entfernt: true });
  return null;
}

/** Werkzeug anlegen oder ändern – neues Werkzeug direkt mit Foto. */
export function werkzeugSpeichern(w: Omit<Werkzeug, "id"> & { id?: string }) {
  pruefe("halle.pflegen");
  const id = w.id ?? neueId("wz");
  setCamp((c) => ({ ...c, werkzeuge: w.id ? c.werkzeuge.map((x) => (x.id === id ? { ...w, id } : x)) : [{ ...w, id }, ...c.werkzeuge] }));
  ereignis(w.id ? "halle.geaendert" : "werkzeug.angelegt", { werkzeugId: id, name: w.name, zoneId: w.zoneId, mitFoto: Boolean(w.foto) });
}

export function werkzeugEntfernen(id: string) {
  pruefe("halle.pflegen");
  setCamp((c) => ({ ...c, werkzeuge: c.werkzeuge.filter((w) => w.id !== id) }));
  ereignis("halle.geaendert", { werkzeugId: id, entfernt: true });
}

export function preiseSpeichern(preise: Preise) {
  pruefe("preise.pflegen");
  setCamp((c) => ({ ...c, preise }));
  ereignis("preise.geaendert", { ...preise });
}

/* ====================== 2. Workshops und Events ====================== */

export function workshopSpeichern(w: Omit<Workshop, "id"> & { id?: string }) {
  pruefe("workshops.verwalten");
  const id = w.id ?? neueId("ws");
  setCamp((c) => ({ ...c, workshops: w.id ? c.workshops.map((x) => (x.id === id ? { ...w, id } : x)) : [...c.workshops, { ...w, id }] }));
  ereignis(w.id ? "workshop.geaendert" : "workshop.angelegt", { workshopId: id, titel: w.titel, datum: w.datum });
}

/** Workshop absagen: Alle Angemeldeten bekommen automatisch eine Nachricht, niemand zahlt. */
export function workshopAbsagen(id: string, grund: string) {
  pruefe("workshops.verwalten");
  const w = getCamp().workshops.find((x) => x.id === id);
  if (!w) return;
  setCamp((c) => ({ ...c, workshops: c.workshops.map((x) => (x.id === id ? { ...x, abgesagt: true } : x)) }));
  const k = getKonto();
  if (k.buchungen.some((b) => b.leistung === "workshop" && b.titel.includes(w.titel))) {
    anMitglied("Workshop abgesagt", `„${w.titel}“ am ${formatLang(w.datum)} findet nicht statt. ${grund} Du zahlst nichts.`, "/workshops",
      (z) => ({ ...z, buchungen: z.buchungen.filter((b) => !(b.leistung === "workshop" && b.titel.includes(w.titel))) }));
  }
  ereignis("workshop.abgesagt", { workshopId: id, titel: w.titel, grund, benachrichtigt: (w.teilnehmer ?? []).map((t) => t.email) });
}

/** Seb prüft nur, ob der Zeitpunkt passt, und gibt von Hand frei. Freigegebene Events sind fix. */
export function eventEntscheiden(eventId: string, freigeben: boolean, begruendung = "") {
  pruefe("events.freigeben");
  const event = getKonto().events.find((e) => e.id === eventId);
  if (!event) return;
  const eigenes = event.vorgeschlagenVon === getKonto().mitglied.vorname;
  setKonto((z) => {
    const neu: KontoZustand = { ...z, events: z.events.map((e) => (e.id === eventId ? { ...e, status: freigeben ? "freigegeben" : "abgelehnt", begruendung: begruendung || undefined } : e)) };
    if (eigenes) {
      return benachrichtige(neu, freigeben ? "Dein Event ist freigegeben" : "Dein Event passt leider nicht",
        `„${event.titel}“ ${freigeben ? "findet statt und steht im Kalender." : "kann so nicht stattfinden."}${begruendung ? ` Seb: ${begruendung}` : ""}`, "/mein-camp/community");
    }
    return freigeben ? benachrichtige(neu, "Neues Event im Camp", `„${event.titel}“ am ${formatLang(event.datum)}, ${event.von} Uhr.`, "/mein-camp/community") : neu;
  });
  ereignis(freigeben ? "event.freigegeben" : "event.abgelehnt", { eventId, titel: event.titel, begruendung });
}

/** Seb legt ein eigenes Event an oder ändert eines – ohne Freigabe, ohne Mindestteilnehmerzahl. */
export function eventSpeichern(e: Pick<CampEvent, "titel" | "beschreibung" | "datum" | "von" | "bis" | "ort" | "maxPersonen"> & { id?: string }) {
  pruefe("events.freigeben");
  const id = e.id ?? neueId("e");
  setKonto((z) => ({
    ...z,
    events: e.id
      ? z.events.map((x) => (x.id === id ? { ...x, ...e, id } : x))
      : [...z.events, { ...e, id, angemeldet: 0, verantwortlich: "Seb", status: "freigegeben", vomCamp: true, ichDabei: false }],
  }));
  ereignis(e.id ? "event.geaendert" : "event.freigegeben", { eventId: id, titel: e.titel, vomCamp: true });
}

export function eventOrdnungSpeichern(regeln: string[]) {
  pruefe("inhalte.pflegen");
  setCamp((c) => ({ ...c, eventOrdnung: regeln.map((r) => r.trim()).filter(Boolean) }));
  ereignis("inhalt.geaendert", { bereich: "event-ordnung" });
}

/* ====================== 3. Mitglieder und Abos ====================== */

export function notizSpeichern(mitgliedId: string, text: string) {
  pruefe("mitglieder.sehen");
  setCamp((c) => ({ ...c, notizen: { ...c.notizen, [mitgliedId]: text } }));
  ereignis("mitglied.notiz", { mitgliedId });
}

const monatsende = () => {
  const d = vonIso(isoHeute());
  return toIso(new Date(d.getFullYear(), d.getMonth() + 1, 0, 12));
};

/** Abo von Hand pausieren, fortsetzen oder beenden – z. B. auf Zuruf in der Halle. */
export function aboVonHand(mitgliedId: string, aktion: "pausieren" | "fortsetzen" | "beenden") {
  pruefe("abos.verwalten");
  const heute = isoHeute();
  const neu = (abo: KontoZustand["mitglied"]["abo"]) =>
    aktion === "pausieren" ? { ...abo, status: "pausiert" as const, pausiertBis: plusTage(heute, 60), naechsteAbbuchung: plusTage(heute, 60) }
      : aktion === "fortsetzen" ? { ...abo, status: "aktiv" as const, pausiertBis: undefined, endetAm: undefined, naechsteAbbuchung: plusTage(heute, 30) }
        : { ...abo, status: "gekuendigt" as const, pausiertBis: undefined, endetAm: monatsende() };
  if (istBeispielMitglied(mitgliedId)) {
    const text = aktion === "pausieren" ? "Seb hat dein Abo für 60 Tage pausiert." : aktion === "fortsetzen" ? "Dein Abo läuft wieder." : `Dein Abo endet am ${formatLang(monatsende())}. Dein kostenloses Konto bleibt.`;
    anMitglied("Änderung an deinem Abo", text, "/mein-camp/mitgliedschaft", (z) => ({ ...z, mitglied: { ...z.mitglied, abo: neu(z.mitglied.abo) } }));
  } else {
    setCamp((c) => ({ ...c, mitglieder: c.mitglieder.map((a) => (a.mitglied.id === mitgliedId ? { ...a, mitglied: { ...a.mitglied, abo: neu(a.mitglied.abo) } } : a)) }));
  }
  ereignis(aktion === "pausieren" ? "abo.pausiert" : aktion === "fortsetzen" ? "abo.fortgesetzt" : "abo.gekuendigt", { mitgliedId, vonHand: true });
}

/* ====================== 4. Support-Postfach ====================== */

function inVerlauf(mitgliedId: string, aendern: (n: SupportNachricht[]) => SupportNachricht[], hinweis?: string) {
  if (istBeispielMitglied(mitgliedId)) {
    setKonto((z) => {
      const neu = { ...z, support: aendern(z.support) };
      return hinweis ? benachrichtige(neu, "Seb hat geantwortet", `„${hinweis.slice(0, 60)}${hinweis.length > 60 ? " …" : ""}“`, "/mein-camp/support") : neu;
    });
  } else {
    setCamp((c) => ({ ...c, support: c.support.map((f) => (f.mitgliedId === mitgliedId ? { ...f, nachrichten: aendern(f.nachrichten) } : f)) }));
  }
}

function verlauf(mitgliedId: string): SupportNachricht[] {
  return istBeispielMitglied(mitgliedId) ? getKonto().support : getCamp().support.find((f) => f.mitgliedId === mitgliedId)?.nachrichten ?? [];
}

export function supportAntworten(mitgliedId: string, text: string, foto?: string) {
  pruefe("support.antworten");
  const letzteFrage = [...verlauf(mitgliedId)].reverse().find((n) => n.von === "mitglied");
  inVerlauf(mitgliedId, (n) => [...n, { id: neueId("s"), von: "seb", zeit: jetzt(), text, foto, art: "nachricht" }], text);
  ereignis("support.beantwortet", { mitgliedId, bearbeitungszeitSek: letzteFrage ? Math.round((Date.now() - new Date(letzteFrage.zeit).getTime()) / 1000) : null });
}

/** Hilferuf aus der Halle übernehmen: Das Mitglied sieht sofort, dass Seb kommt. */
export function hilferufErledigen(mitgliedId: string, nachrichtId: string) {
  pruefe("support.antworten");
  const ruf = verlauf(mitgliedId).find((n) => n.id === nachrichtId);
  const text = "Hab’s gesehen. Ich bin gleich bei dir in der Bucht.";
  inVerlauf(mitgliedId, (n) => [...n.map((x) => (x.id === nachrichtId ? { ...x, erledigt: true } : x)), { id: neueId("s"), von: "seb", zeit: jetzt(), text, art: "nachricht" }], text);
  ereignis("support.beantwortet", { mitgliedId, hilferuf: true, buchtId: ruf?.buchtId, bearbeitungszeitSek: ruf ? Math.round((Date.now() - new Date(ruf.zeit).getTime()) / 1000) : null });
}

/** Nur Demo: simulierte Antworten von Seb im Mitglieder-Chat an- oder abschalten. */
export function autoAntwortSetzen(an: boolean) {
  pruefe("support.antworten");
  setCamp((c) => ({ ...c, autoAntwort: an }));
}

/* ====================== 5. Werkzeugwünsche ====================== */

/** Status je Werkzeug. „Gekauft" löst „Dein Wunsch ist da!" an alle Wünschenden aus. */
export function wunschStatusSetzen(werkzeug: string, status: WunschStatus) {
  pruefe(status === "gekauft" ? "werkzeug.kaufen" : "werkzeug.auswertung");
  if (status === "gekauft") return werkzeugGekauft(werkzeug);
  setCamp((c) => ({ ...c, wunschStatus: { ...c.wunschStatus, [werkzeug]: status } }));
  ereignis("werkzeug.status", { werkzeug, status });
}

export function werkzeugGekauft(werkzeug: string) {
  pruefe("werkzeug.kaufen");
  const gruppe = wunschAuswertung(getCamp(), getKonto()).find((g) => g.werkzeug === werkzeug);
  const empfaenger = [...new Set((gruppe?.wuensche ?? []).filter((w) => w.status === "offen").map((w) => w.mitgliedId))];
  setCamp((c) => ({
    ...c, wunschStatus: { ...c.wunschStatus, [werkzeug]: "gekauft" },
    wuensche: c.wuensche.map((w) => (w.werkzeug === werkzeug ? { ...w, status: "gekauft" } : w)),
  }));
  setKonto((z) => {
    const betroffen = z.werkzeugwuensche.some((w) => w.werkzeug === werkzeug && w.status === "offen");
    const neu: KontoZustand = { ...z, werkzeugwuensche: z.werkzeugwuensche.map((w) => (w.werkzeug === werkzeug ? { ...w, status: "gekauft" } : w)) };
    return betroffen ? benachrichtige(neu, "Dein Wunsch ist da!", `${werkzeug} gibt es jetzt in der Halle.`, "/mein-camp/werkzeugwuensche") : neu;
  });
  ereignis("werkzeug.gekauft", { werkzeug, benachrichtigt: empfaenger });
}

/* ====================== 6. Inhalte und Medien ====================== */

function inhalt<K extends keyof CampZustand>(feld: K, wert: CampZustand[K], bereich: string) {
  pruefe("inhalte.pflegen");
  setCamp((c) => ({ ...c, [feld]: wert }));
  ereignis("inhalt.geaendert", { bereich });
}

export const texteSpeichern = (texte: Record<string, string>) => inhalt("texte", { ...getCamp().texte, ...texte }, "texte");
export const faqSpeichern = (faq: FaqGruppe[]) => inhalt("faq", faq, "faq");
export const leistungenSpeichern = (l: Leistung[]) => inhalt("leistungen", l, "leistungen");
export const kontaktSpeichern = (k: KontaktDaten) => inhalt("kontakt", k, "kontakt");
export const rechtsseiteSpeichern = (seite: Rechtsseite) =>
  inhalt("rechtliches", getCamp().rechtliches.map((r) => (r.slug === seite.slug ? seite : r)), `rechtliches/${seite.slug}`);
export const phaseSpeichern = (vorlage: PhasenVorlage) =>
  inhalt("phasen", getCamp().phasen.map((p) => (p.id === vorlage.id ? vorlage : p)), `phasen/${vorlage.id}`);

/** Foto in die Medienbibliothek legen. Später: Upload in den EU-Dateispeicher, hier steht dann die URL. */
export function mediumHochladen(m: Pick<Medium, "name" | "quelle" | "kategorie">): string {
  pruefe("inhalte.pflegen");
  const id = neueId("med");
  setCamp((c) => ({ ...c, medien: [{ ...m, id, datum: isoHeute(), aufWebsite: m.kategorie === "halle" }, ...c.medien] }));
  ereignis("medium.hochgeladen", { mediumId: id, name: m.name, kategorie: m.kategorie });
  return id;
}

export function mediumAendern(id: string, neu: Partial<Pick<Medium, "name" | "kategorie" | "aufWebsite">>) {
  pruefe("inhalte.pflegen");
  setCamp((c) => ({ ...c, medien: c.medien.map((m) => (m.id === id ? { ...m, ...neu } : m)) }));
}

export function mediumEntfernen(id: string) {
  pruefe("inhalte.pflegen");
  setCamp((c) => ({
    ...c, medien: c.medien.filter((m) => m.id !== id),
    workshops: c.workshops.map((w) => (w.bild === id ? { ...w, bild: undefined } : w)),
  }));
  ereignis("medium.entfernt", { mediumId: id });
}

/** Öffentliches Projekt in der Community-Galerie ausblenden (z. B. sichtbare Kennzeichen) oder wieder zeigen. */
export function projektAusblenden(projektId: string, aus: boolean, grund = "") {
  pruefe("inhalte.pflegen");
  const eigenes = getKonto().projekte.find((p) => p.id === projektId);
  setCamp((c) => ({
    ...c,
    projekte: c.projekte.map((p) => (p.id === projektId ? { ...p, ausgeblendet: aus } : p)),
    ausgeblendet: eigenes ? (aus ? [...new Set([...c.ausgeblendet, projektId])] : c.ausgeblendet.filter((x) => x !== projektId)) : c.ausgeblendet,
  }));
  if (eigenes) {
    anMitglied(aus ? "Dein Projekt ist vorerst ausgeblendet" : "Dein Projekt ist wieder sichtbar",
      aus ? `Bitte prüf deine Fotos${grund ? `: ${grund}` : " auf Kennzeichen und Gesichter"}. Danach schalten wir es wieder frei.` : "Es steht wieder in der Community-Galerie.", "/mein-camp/projekt");
  }
  ereignis("projekt.ausgeblendet", { projektId, ausgeblendet: aus, grund });
}

/* ====================== 7. Warteliste und Anfragen ====================== */

export function anfrageStatusSetzen(id: string, status: AnfrageStatus) {
  pruefe("anfragen.verwalten");
  setCamp((c) => ({ ...c, anfragen: c.anfragen.map((a) => (a.id === id ? { ...a, status } : a)) }));
  ereignis("anfrage.status", { anfrageId: id, status });
}

/* ====================== Demo ====================== */

export function cockpitZuruecksetzen() {
  resetCamp();
}
