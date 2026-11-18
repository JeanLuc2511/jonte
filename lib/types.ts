/**
 * Gemeinsame Datentypen für Website, späteren Mitgliederbereich und App.
 * Die Formen sind bewusst an die Zielsysteme angelehnt (Shopify Storefront API,
 * eigenes Buchungs-Backend), damit Beispieldaten ohne Umbau ersetzt werden können.
 */

/* ---------- Fahrzeuge ---------- */

export type FahrzeugId = "sprinter" | "crafter" | "ducato" | "transit" | "daily";

export interface Fahrzeug {
  id: FahrzeugId;
  name: string;
  /** Baugleiche Modelle / Zusatz, z. B. „Boxer · Jumper" */
  zusatz?: string;
  hersteller: string;
}

/* ---------- Halle ---------- */

export type ZonenTyp = "bucht" | "werkbank" | "station" | "bereich";

export interface Zone {
  id: string;
  typ: ZonenTyp;
  /** Kurzlabel im Plan, z. B. „B1" */
  kurz: string;
  name: string;
  beschreibung: string;
  /** Lage im Hallenplan (viewBox 1200 × 760) */
  x: number;
  y: number;
  w: number;
  h: number;
  ausstattung?: string[];
  /** Nur Werkstattbuchten */
  bucht?: {
    groesse: "Standard" | "XL";
    maxLaengeM: number;
    preisProTag: number;
    ausrichtung: "hoch" | "quer";
  };
  hinweis?: string;
}

export type WerkzeugKategorie =
  | "Sägen & Trennen"
  | "Bohren & Schrauben"
  | "Schleifen & Fräsen"
  | "Elektrik"
  | "Metall & Karosserie"
  | "Kleben & Dichten"
  | "Messen & Prüfen"
  | "Hilfsmittel";

export interface Werkzeug {
  id: string;
  name: string;
  kategorie: WerkzeugKategorie;
  /** Zone, in der das Werkzeug liegt */
  zoneId: string;
  anzahl: number;
  /** Nutzung erst nach kurzer Einweisung */
  einweisung?: boolean;
  /** Foto aus der Medienbibliothek (Data-URL in der Demo, später Bild-URL) */
  foto?: string;
}

/* ---------- Buchungen ---------- */

export interface Belegung {
  id: string;
  buchtId: string;
  /** ISO-Datum (YYYY-MM-DD), inklusive */
  von: string;
  /** ISO-Datum (YYYY-MM-DD), inklusive */
  bis: string;
  fahrzeug: {
    spitzname: string;
    modell: string;
    typ: FahrzeugId;
    farbe: string;
  };
  crew: string;
  phase: string;
  instagram?: string;
  /** Sperrzeit statt Buchung (Urlaub, Wartung, Event) */
  gesperrt?: string;
}

export type LeistungId = "bucht" | "workshop" | "beratung" | "gaspruefung";

export interface Leistung {
  id: LeistungId;
  name: string;
  kurz: string;
  preisText: string;
  preis: number;
  einheit: string;
  punkte: string[];
}

export interface BuchungsAnfrage {
  leistung: LeistungId;
  /** Bucht-ID oder Workshop-ID */
  objektId?: string;
  von: string;
  bis?: string;
  uhrzeit?: string;
  kontakt: {
    vorname: string;
    nachname: string;
    email: string;
    telefon?: string;
    fahrzeug?: string;
  };
  /** Gastbuchung ohne Konto */
  alsGast: boolean;
}

export interface BuchungsBestaetigung {
  nummer: string;
  demo: boolean;
}

/* ---------- Workshops ---------- */

export interface Workshop {
  id: string;
  titel: string;
  kurz: string;
  beschreibung: string;
  /** ISO-Datum */
  datum: string;
  zeit: string;
  dauer: string;
  preis: number;
  minTeilnehmer: number;
  maxTeilnehmer: number;
  angemeldet: number;
  level: "Einsteiger" | "Fortgeschritten";
  leitung: string;
  inhalte: string[];
  /** Bis so viele Tage vorher muss die Mindestzahl erreicht sein */
  absagefristTage?: number;
  abgesagt?: boolean;
  teilnehmer?: WorkshopTeilnehmer[];
  /** ID eines Bildes aus der Medienbibliothek */
  bild?: string;
}

export interface WorkshopTeilnehmer {
  name: string;
  email: string;
  telefon?: string;
}

export type WorkshopStatus = "offen" | "findet-statt" | "ausgebucht";

/* ---------- Shop (angelehnt an Shopify Storefront API) ---------- */

export type ProduktKategorie =
  | "Dämmung"
  | "Elektrik"
  | "Fenster & Lüftung"
  | "Möbelbau & Holz"
  | "Wasser & Gas"
  | "Befestigen & Dichten";

export interface Produkt {
  /** entspricht später der Shopify-Produkt-ID bzw. Variant-ID */
  id: string;
  /** entspricht dem Shopify-Handle (URL) */
  handle: string;
  titel: string;
  kategorie: ProduktKategorie;
  kurz: string;
  beschreibung: string;
  preis: number;
  einheit?: string;
  /** Passende Fahrzeuge; „universal" passt in jeden Kastenwagen */
  passend: FahrzeugId[] | "universal";
  details: string[];
  abholbar: boolean;
  badge?: string;
}

export interface WarenkorbZeile {
  produktId: string;
  menge: number;
}

/* ---------- Community ---------- */

export interface Projekt {
  id: string;
  titel: string;
  crew: string;
  fahrzeug: string;
  typ: FahrzeugId;
  farbe: string;
  status: "Fertig" | "Im Bau";
  dauer: string;
  zitat: string;
  highlights: string[];
  instagram: string;
  /** In der Demo zeigen alle Links auf instagram.com – später das echte Profil */
  instagramUrl: string;
  /** Vom Camp-Team ausgeblendet (z. B. sichtbare Kennzeichen) */
  ausgeblendet?: boolean;
}

/* ---------- FAQ ---------- */

export interface FaqGruppe {
  titel: string;
  fragen: { frage: string; antwort: string }[];
}

/* ---------- Formulare ---------- */

export type FormularId = "warteliste" | "kontakt";

export interface FormularAntwort {
  ok: boolean;
  /** true, solange kein n8n-Webhook konfiguriert ist */
  demo?: boolean;
  fehler?: string;
}

/* ====================================================================== */
/*  MITGLIEDERBEREICH – Datenmodell für Website, App und Sebs Cockpit      */
/* ====================================================================== */

/** Kontostufe eines Besuchers. `admin` ist Seb bzw. das Camp-Team (Cockpit). */
export type Rolle = "gast" | "konto" | "mitglied" | "admin";

export type AboStatus = "keins" | "aktiv" | "pausiert" | "gekuendigt";

export interface Abo {
  status: AboStatus;
  preisProMonat: number;
  seit?: string;
  /** nächste Abbuchung bzw. Ende der Laufzeit nach Kündigung */
  naechsteAbbuchung?: string;
  pausiertBis?: string;
  endetAm?: string;
}

export interface Mitglied {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon?: string;
  instagram?: string;
  /** Gespeicherte Stufe; die wirksame Rolle ergibt sich zusammen mit dem Abo (siehe lib/rechte.ts) */
  rolle: Rolle;
  dabeiSeit: string;
  abo: Abo;
}

export type PhasenId = "planung" | "daemmung" | "elektrik" | "wasser-gas" | "moebel" | "finish";

export interface GaragenFahrzeug {
  id: string;
  spitzname: string;
  /** Zuordnung für Fachshop und Buchung; „anderes" = keine fahrzeugspezifischen Teile */
  typ: FahrzeugId | "anderes";
  /** Schlüsselnummern aus dem Fahrzeugschein (Felder 2.1 und 2.2); leer bei manueller Eingabe */
  hsn?: string;
  tsn?: string;
  hersteller: string;
  modell: string;
  motor?: string;
  leistungKw?: number;
  kraftstoff?: string;
  /** Zusatzfragen – stehen nicht in den KBA-Daten */
  baujahr?: number;
  radstand?: string;
  dachhoehe?: string;
  laengeM: number;
  hoeheM?: number;
  schiebetuer?: "rechts" | "links" | "beide" | "keine";
  fenster?: "keine" | "teilweise" | "rundum";
  ausbaustand: PhasenId | "leer" | "fertig";
  farbe: string;
  quelle: "hsn-tsn" | "fahrzeugschein" | "manuell";
}

/** Antwort der Fahrzeugdaten-Abfrage (KBA-Liste oder externe Schnittstelle, über n8n) */
export interface Fahrzeugdaten {
  gefunden: boolean;
  hsn?: string;
  tsn?: string;
  hersteller?: string;
  modell?: string;
  motor?: string;
  leistungKw?: number;
  kraftstoff?: string;
  typ?: FahrzeugId | "anderes";
  demo?: boolean;
}

export interface PhasenVorlage {
  id: PhasenId;
  name: string;
  kurz: string;
  checkliste: string[];
  /** Material der Phase; `produktId` verweist auf den Fachshop */
  stueckliste: { produktId?: string; name: string; menge: number; preis?: number }[];
  budgetRichtwert: number;
}

export interface BudgetEintrag {
  id: string;
  phase: PhasenId;
  datum: string;
  haendler: string;
  betrag: number;
  /** shop = automatisch aus dem Fachshop, beleg = per Foto ausgelesen, manuell = von Hand */
  quelle: "shop" | "beleg" | "manuell";
  positionen?: { name: string; betrag: number }[];
}

export interface TagebuchEintrag {
  id: string;
  phase: PhasenId;
  datum: string;
  titel: string;
  text: string;
  /** Data-URLs (Demo) bzw. später Bild-URLs aus dem EU-Speicher; `motiv:*` = gezeichnetes Beispielbild */
  fotos: string[];
}

export interface Ausbauprojekt {
  id: string;
  fahrzeugId: string;
  titel: string;
  aktivePhase: PhasenId;
  /** öffentlich = erscheint in der Community-Galerie; Budget und Belege bleiben immer privat */
  oeffentlich: boolean;
  /** erledigte Checklisten-Punkte je Phase (Index in der Vorlage) */
  erledigt: Partial<Record<PhasenId, number[]>>;
  budgetGeplant: Record<PhasenId, number>;
  budget: BudgetEintrag[];
  tagebuch: TagebuchEintrag[];
}

export interface MeineBuchung {
  id: string;
  leistung: LeistungId;
  titel: string;
  buchtId?: string;
  von: string;
  bis: string;
  uhrzeit?: string;
  fahrzeugId?: string;
  summe: number;
}

export interface SupportNachricht {
  id: string;
  von: "mitglied" | "seb" | "system";
  text: string;
  /** ISO-Zeitstempel */
  zeit: string;
  foto?: string;
  art?: "nachricht" | "hilferuf" | "videotermin" | "grenze";
  /** Hilferuf: aus welcher Werkstattbucht, und ob Seb ihn erledigt hat */
  buchtId?: string;
  erledigt?: boolean;
}

export type EventStatus = "vorgeschlagen" | "freigegeben" | "abgelehnt";

export interface CampEvent {
  id: string;
  titel: string;
  beschreibung: string;
  datum: string;
  von: string;
  bis: string;
  ort: string;
  maxPersonen: number;
  angemeldet: number;
  verantwortlich: string;
  status: EventStatus;
  /** Sebs eigene Events brauchen keine Freigabe */
  vomCamp: boolean;
  vorgeschlagenVon?: string;
  ichDabei: boolean;
  /** Kurze Begründung von Seb bei Freigabe oder Ablehnung */
  begruendung?: string;
}

export interface HilfeEintrag {
  id: string;
  art: "gesuch" | "angebot";
  titel: string;
  text: string;
  wann: string;
  von: string;
  fahrzeug?: string;
  antworten: number;
  eigener: boolean;
}

export interface Werkzeugwunsch {
  id: string;
  mitgliedId: string;
  mitgliedName: string;
  werkzeug: string;
  begruendung: string;
  datum: string;
  status: "offen" | "gekauft";
}

export interface Benachrichtigung {
  id: string;
  zeit: string;
  titel: string;
  text: string;
  link?: string;
  gelesen: boolean;
}

/* ---------- Ereignisse: alles, was Mitglieder tun, landet bei Seb ---------- */

export type EreignisTyp =
  | "konto.angelegt"
  | "abo.abgeschlossen" | "abo.pausiert" | "abo.fortgesetzt" | "abo.gekuendigt"
  | "fahrzeug.angelegt" | "fahrzeug.entfernt"
  | "projekt.phase" | "projekt.sichtbarkeit" | "projekt.tagebuch" | "projekt.bestellung"
  | "buchung.angefragt"
  | "support.nachricht" | "support.hilferuf" | "support.videotermin" | "support.beantwortet"
  | "event.vorgeschlagen" | "event.freigegeben" | "event.abgelehnt" | "event.angemeldet" | "event.abgemeldet"
  | "hilfe.eintrag" | "hilfe.antwort"
  | "werkzeug.gewuenscht" | "werkzeug.gekauft" | "werkzeug.status" | "werkzeug.angelegt"
  // Cockpit (Camp-Team)
  | "buchung.angelegt" | "buchung.verschoben" | "buchung.storniert"
  | "sperrzeit.gesetzt" | "sperrzeit.entfernt"
  | "halle.geaendert" | "preise.geaendert"
  | "workshop.angelegt" | "workshop.geaendert" | "workshop.abgesagt" | "workshop.reserviert"
  | "event.geaendert"
  | "mitglied.notiz"
  | "inhalt.geaendert" | "medium.hochgeladen" | "medium.entfernt"
  | "projekt.ausgeblendet"
  | "anfrage.eingegangen" | "anfrage.status";

export interface Ereignis {
  id: string;
  typ: EreignisTyp;
  /** ISO-Zeitstempel */
  zeit: string;
  akteur: { id: string; name: string; rolle: Rolle };
  daten: Record<string, unknown>;
}

/** Kompletter Zustand eines Kontos – so liefert ihn später das Backend an Website und App. */
export interface KontoZustand {
  version: number;
  /** Tag, an dem die Beispieldaten erzeugt wurden */
  seedTag: string;
  mitglied: Mitglied;
  fahrzeuge: GaragenFahrzeug[];
  aktivesFahrzeugId: string | null;
  projekte: Ausbauprojekt[];
  buchungen: MeineBuchung[];
  support: SupportNachricht[];
  events: CampEvent[];
  hilfe: HilfeEintrag[];
  werkzeugwuensche: Werkzeugwunsch[];
  benachrichtigungen: Benachrichtigung[];
  ereignisse: Ereignis[];
}

export interface BelegAnalyse {
  ok: boolean;
  haendler?: string;
  datum?: string;
  betrag?: number;
  positionen?: { name: string; betrag: number }[];
  demo?: boolean;
  fehler?: string;
}

export interface ScheinAnalyse {
  ok: boolean;
  hsn?: string;
  tsn?: string;
  demo?: boolean;
  fehler?: string;
}

/* ====================================================================== */
/*  CAMP-COCKPIT – alles, was Seb pflegt und sieht                         */
/* ====================================================================== */

export type BuchungsQuelle = "online" | "telefon" | "walk-in";

/** Eine Buchung einer Werkstattbucht, wie sie das Buchungs-Backend führt. */
export interface HallenBuchung {
  id: string;
  buchtId: string;
  von: string;
  bis: string;
  status: "bestaetigt" | "storniert";
  quelle: BuchungsQuelle;
  /** leer bei Gästen ohne Konto */
  mitgliedId?: string;
  kunde: { name: string; email?: string; telefon?: string };
  fahrzeug: { spitzname: string; modell: string; typ: FahrzeugId | "anderes"; farbe: string };
  phase?: string;
  instagram?: string;
  summe: number;
  notiz?: string;
}

export interface Sperrzeit {
  id: string;
  buchtIds: string[];
  von: string;
  bis: string;
  grund: string;
}

export interface Preise {
  preisProMonat: number;
  werkzeugpauschaleProTag: number;
  stundenpreis: number;
  /** Rabatt ab 7 Tagen, als Anteil (0,15 = 15 %) */
  wochenrabatt: number;
  shopRabatt: number;
  buchungsfensterTage: { standard: number; mitglied: number };
}

export type WunschStatus = "neu" | "geprueft" | "gekauft" | "abgelehnt";

/** Was Seb zu einem Konto sieht. Für das Beispiel-Mitglied wird die Akte live aus dessen Konto gebaut. */
export interface MitgliedAkte {
  mitglied: Mitglied;
  fahrzeuge: { spitzname: string; modell: string; farbe: string }[];
  projekt?: { titel: string; phase: PhasenId; eintraege: number; oeffentlich: boolean; fotos: string[] };
  buchungen: number;
  letzteBuchung?: string;
}

export interface SupportFall {
  mitgliedId: string;
  nachrichten: SupportNachricht[];
}

export type AnfrageStatus = "neu" | "kontaktiert" | "erledigt";

export interface Anfrage {
  id: string;
  art: "warteliste" | "kontakt";
  /** ISO-Zeitstempel */
  zeit: string;
  name: string;
  email: string;
  telefon?: string;
  status: AnfrageStatus;
  /** Antworten des Formulars (Frage → Antwort) */
  angaben: Record<string, string>;
}

export type MedienKategorie = "halle" | "galerie" | "workshop" | "werkzeug" | "sonstiges";

export interface Medium {
  id: string;
  name: string;
  /** Data-URL in der Demo, später URL im EU-Dateispeicher; `motiv:*` = gezeichnetes Beispielbild */
  quelle: string;
  kategorie: MedienKategorie;
  datum: string;
  /** Hallenfotos mit Haken erscheinen auf der Werkstatt-Seite */
  aufWebsite: boolean;
}

export interface Rechtsseite {
  slug: string;
  titel: string;
  intro: string;
  abschnitte: { titel: string; text: string }[];
}

export interface KontaktDaten {
  email: string;
  telefon: string;
  oeffnungszeiten: { tage: string; zeit: string }[];
  hinweise: string[];
}

export interface ShopBestellung {
  nummer: string;
  kunde: string;
  datum: string;
  summe: number;
  status: "offen" | "abholbereit" | "versendet";
  lieferungAnBucht?: string;
}

/**
 * Der gemeinsame Datenstand des Camps: Halle, Buchungen, Workshops, Inhalte, Konten.
 * Website und Mitgliederbereich lesen ihn, das Cockpit ändert ihn.
 * Später liefert ihn das Backend (Vorschlag im Plan: Supabase, Region EU).
 */
export interface CampZustand {
  version: number;
  seedTag: string;
  zonen: Zone[];
  werkzeuge: Werkzeug[];
  preise: Preise;
  buchungen: HallenBuchung[];
  sperrzeiten: Sperrzeit[];
  workshops: Workshop[];
  leistungen: Leistung[];
  /** Konten außer dem Beispiel-Mitglied der Demo */
  mitglieder: MitgliedAkte[];
  /** Interne Notizen von Seb je Mitglied-ID */
  notizen: Record<string, string>;
  support: SupportFall[];
  /** Simulierte Antworten von Seb im Mitglieder-Chat (nur Demo) */
  autoAntwort: boolean;
  /** Wünsche der anderen Mitglieder; die des Beispiel-Mitglieds liegen in dessen Konto */
  wuensche: Werkzeugwunsch[];
  wunschStatus: Record<string, WunschStatus>;
  anfragen: Anfrage[];
  medien: Medium[];
  texte: Record<string, string>;
  faq: FaqGruppe[];
  kontakt: KontaktDaten;
  rechtliches: Rechtsseite[];
  eventOrdnung: string[];
  phasen: PhasenVorlage[];
  projekte: Projekt[];
  /** IDs ausgeblendeter Mitglieder-Projekte (Projekt-ID aus dem Konto) */
  ausgeblendet: string[];
  shop: ShopBestellung[];
}
