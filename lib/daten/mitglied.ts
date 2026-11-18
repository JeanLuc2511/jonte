import { ABO } from "@/lib/daten/abo";
import { PHASEN } from "@/lib/daten/phasen";
import { plusTage } from "@/lib/datum";
import type { KontoZustand, PhasenId, Werkzeugwunsch } from "@/lib/types";

export const KONTO_VERSION = 1;

const zeit = (heute: string, tage: number, uhr = "10:00") => `${plusTage(heute, tage)}T${uhr}:00`;

/**
 * Das Beispiel-Mitglied der Demo: Jule mit aktivem Abo, zwei Fahrzeugen und einem Projekt
 * mitten in der Elektrik-Phase. Alle Daten sind relativ zu „heute", damit die Demo lebendig bleibt.
 * Später liefert das Backend diesen Zustand pro Konto.
 */
export function beispielKonto(heute: string): KontoZustand {
  const geplant = Object.fromEntries(PHASEN.map((p) => [p.id, p.budgetRichtwert])) as Record<PhasenId, number>;
  geplant.elektrik = 1500;

  return {
    version: KONTO_VERSION,
    seedTag: heute,
    mitglied: {
      id: "m-jule", vorname: "Jule", nachname: "Hartmann", email: "jule@beispiel.de", telefon: "0170 000 00 00",
      instagram: "@frieda.rollt", rolle: "mitglied", dabeiSeit: plusTage(heute, -72),
      abo: { status: "aktiv", preisProMonat: ABO.preisProMonat, seit: plusTage(heute, -72), naechsteAbbuchung: plusTage(heute, 12) },
    },
    fahrzeuge: [
      {
        id: "f-frieda", spitzname: "Frieda", typ: "sprinter", hsn: "1313", tsn: "GBW",
        hersteller: "Mercedes-Benz", modell: "Sprinter 316 CDI", motor: "2.1 l Diesel (OM 651)", leistungKw: 120, kraftstoff: "Diesel",
        baujahr: 2017, radstand: "L2", dachhoehe: "H2", laengeM: 5.9, hoeheM: 2.6, schiebetuer: "rechts", fenster: "teilweise",
        ausbaustand: "elektrik", farbe: "#EED5C7", quelle: "fahrzeugschein",
      },
      {
        id: "f-emil", spitzname: "Emil", typ: "ducato", hsn: "4136", tsn: "BGT",
        hersteller: "Fiat", modell: "Ducato 35 2.3 Multijet", motor: "2.3 l Multijet", leistungKw: 96, kraftstoff: "Diesel",
        baujahr: 2012, radstand: "L4", dachhoehe: "H2", laengeM: 6.4, hoeheM: 2.6, schiebetuer: "rechts", fenster: "keine",
        ausbaustand: "leer", farbe: "#9DB4D6", quelle: "hsn-tsn",
      },
    ],
    aktivesFahrzeugId: "f-frieda",
    projekte: [
      {
        id: "pr-frieda", fahrzeugId: "f-frieda", titel: "Frieda wird ein Zuhause", aktivePhase: "elektrik", oeffentlich: true,
        erledigt: { planung: [0, 1, 2, 3, 4], daemmung: [0, 1, 2, 3, 4, 5], elektrik: [0, 1] },
        budgetGeplant: geplant,
        budget: [
          { id: "b1", phase: "planung", datum: plusTage(heute, -60), haendler: "Camp & Camper · Beratung", betrag: 79, quelle: "shop" },
          { id: "b2", phase: "daemmung", datum: plusTage(heute, -38), haendler: "Camp & Camper Fachshop", betrag: 454, quelle: "shop", positionen: [{ name: "4 × Kautschuk-Dämmung 19 mm", betrag: 316 }, { name: "Kautschuk-Dämmung 10 mm", betrag: 49 }, { name: "Leisten-Set", betrag: 89 }] },
          { id: "b3", phase: "daemmung", datum: plusTage(heute, -31), haendler: "Camp & Camper Fachshop", betrag: 389, quelle: "shop", positionen: [{ name: "Bodenplatte CNC-gefräst", betrag: 389 }] },
          { id: "b4", phase: "daemmung", datum: plusTage(heute, -29), haendler: "Baumarkt am Ring", betrag: 62.8, quelle: "beleg", positionen: [{ name: "Sprühkleber, 3 Dosen", betrag: 35.7 }, { name: "Schrauben 4 × 40", betrag: 12.6 }, { name: "Entfetter", betrag: 14.5 }] },
          { id: "b5", phase: "elektrik", datum: plusTage(heute, -9), haendler: "Camp & Camper Fachshop", betrag: 678, quelle: "shop", positionen: [{ name: "LiFePO4-Akku 100 Ah", betrag: 549 }, { name: "Kabelsatz Bordnetz", betrag: 129 }] },
          { id: "b6", phase: "elektrik", datum: plusTage(heute, -4), haendler: "Kleinanzeigen", betrag: 45, quelle: "manuell", positionen: [{ name: "Gebrauchter Sicherungskasten", betrag: 45 }] },
        ],
        tagebuch: [
          { id: "t5", phase: "elektrik", datum: plusTage(heute, -2), titel: "Kabel, Kabel, Kabel", text: "Leerrohre liegen, die ersten 40 Meter sind drin. Jede Leitung an beiden Enden beschriftet – Sebs Tipp aus dem Workshop.", fotos: ["motiv:kabel", "motiv:plan"] },
          { id: "t4", phase: "elektrik", datum: plusTage(heute, -8), titel: "Schaltplan steht", text: "Drei Abende gezeichnet, einmal mit Seb durchgegangen. Der Ladebooster wandert unter den Beifahrersitz.", fotos: ["motiv:plan"] },
          { id: "t3", phase: "daemmung", datum: plusTage(heute, -27), titel: "Boden ist drin", text: "Die gefräste Platte hat auf Anhieb gepasst. Zum ersten Mal sieht es nach Raum aus.", fotos: ["motiv:boden"] },
          { id: "t2", phase: "daemmung", datum: plusTage(heute, -35), titel: "Vier Rollen später", text: "Dach und Wände sind beklebt. Die Andruckrolle von der Werkzeugwand ist Gold wert.", fotos: ["motiv:daemmung", "motiv:daemmung2"] },
          { id: "t1", phase: "planung", datum: plusTage(heute, -58), titel: "Tag eins: leerer Kasten", text: "Grundriss mit Malerkrepp auf den Boden geklebt und zwei Stunden darin gesessen.", fotos: ["motiv:leer"] },
        ],
      },
      {
        id: "pr-emil", fahrzeugId: "f-emil", titel: "Emil – das nächste Projekt", aktivePhase: "planung", oeffentlich: false,
        erledigt: { planung: [0] }, budgetGeplant: { ...geplant, elektrik: 1400 }, budget: [], tagebuch: [],
      },
    ],
    buchungen: [
      { id: "bu-1", leistung: "bucht", titel: "Werkstattbucht 1", buchtId: "b1", von: plusTage(heute, -3), bis: plusTage(heute, 4), fahrzeugId: "f-frieda", summe: 469 },
      { id: "bu-2", leistung: "workshop", titel: "Workshop: Solar aufs Dach", von: plusTage(heute, 46), bis: plusTage(heute, 46), uhrzeit: "10:00", summe: 149 },
    ],
    support: [
      { id: "s1", von: "mitglied", zeit: zeit(heute, -8, "19:12"), text: "Hi Seb, reicht für den Ladebooster 16 mm² bei 4 m Leitungslänge? Der Schaltplan hängt im Bautagebuch." },
      { id: "s2", von: "seb", zeit: zeit(heute, -8, "20:03"), text: "Hab ihn mir angesehen, sieht sauber aus. Bei 30 A und 4 m passt 16 mm², der Spannungsfall liegt unter 2 %. Sicherung an beiden Enden nicht vergessen." },
      { id: "s3", von: "mitglied", zeit: zeit(heute, -2, "17:40"), text: "Läuft. Kabel sind drin, morgen kommt der Booster." },
      { id: "s4", von: "seb", zeit: zeit(heute, -2, "18:05"), text: "Stark. Wenn du am Verteiler bist, sag Bescheid – dann schau ich in der Bucht kurz drüber." },
    ],
    events: [
      { id: "e1", titel: "Grillabend vor dem Rolltor", beschreibung: "Jeder bringt was mit, der Grill steht. Vans dürfen besichtigt werden.", datum: plusTage(heute, 5), von: "18:00", bis: "22:00", ort: "Vor dem Rolltor", maxPersonen: 30, angemeldet: 1, verantwortlich: "Malte", status: "vorgeschlagen", vomCamp: false, vorgeschlagenVon: "Malte", ichDabei: false },
      { id: "e2", titel: "Elektrik-Stammtisch", beschreibung: "Schaltpläne auf den Tisch. Seb und zwei alte Hasen schauen drüber.", datum: plusTage(heute, 9), von: "19:00", bis: "21:00", ort: "Lounge & Planungstisch", maxPersonen: 12, angemeldet: 9, verantwortlich: "Seb", status: "freigegeben", vomCamp: true, ichDabei: false },
      { id: "e3", titel: "Van-Kino in der Halle", beschreibung: "Leinwand an die Hallenwand, Stühle aus der Lounge, ein Roadmovie.", datum: plusTage(heute, 17), von: "20:00", bis: "22:30", ort: "Fahrgasse in der Halle", maxPersonen: 25, angemeldet: 7, verantwortlich: "Jule", status: "freigegeben", vomCamp: false, vorgeschlagenVon: "Jule", ichDabei: true },
      { id: "e4", titel: "Reste-Flohmarkt", beschreibung: "Übrige Dämmung, Leisten, Kabelreste: tauschen statt wegwerfen.", datum: plusTage(heute, 24), von: "11:00", bis: "14:00", ort: "Fahrgasse in der Halle", maxPersonen: 40, angemeldet: 6, verantwortlich: "Seb", status: "freigegeben", vomCamp: true, ichDabei: false },
    ],
    hilfe: [
      { id: "h1", art: "gesuch", titel: "Wer hilft mir Samstag beim Dachfenster?", text: "Zwei Hände zum Halten und jemand, der schon mal geschnitten hat. Kaffee und Kuchen gehen auf mich.", wann: "Samstag, ab 10 Uhr", von: "Henrik", fahrzeug: "Transit L3H3", antworten: 2, eigener: false },
      { id: "h2", art: "angebot", titel: "Ich nähe Polsterbezüge", text: "Habe eine Industrienähmaschine zu Hause. Stoff bringst du mit, ich nähe gegen ein Abendessen.", wann: "nach Absprache", von: "Svenja", fahrzeug: "Crafter L3H3", antworten: 4, eigener: false },
      { id: "h3", art: "gesuch", titel: "Bodenplatte zu zweit reinheben", text: "Die Platte für den Ducato ist allein nicht zu schaffen. Zehn Minuten reichen.", wann: "Donnerstag gegen 17 Uhr", von: "Pia & Jonas", fahrzeug: "Jumper L3H2", antworten: 1, eigener: false },
      { id: "h4", art: "angebot", titel: "Schaltplan gegenlesen", text: "Hab meinen gerade fertig und mit Seb besprochen. Ich schaue gern über deinen drüber – ohne Gewähr.", wann: "abends in Bucht 1", von: "Jule", fahrzeug: "Sprinter L2H2", antworten: 1, eigener: true },
    ],
    werkzeugwuensche: [
      { id: "w1", mitgliedId: "m-jule", mitgliedName: "Jule", werkzeug: "Akku-Blindnietmutternsetzer", begruendung: "Mit der Handzange brauche ich für 40 Nietmuttern einen halben Tag.", datum: plusTage(heute, -20), status: "gekauft" },
      { id: "w2", mitgliedId: "m-jule", mitgliedName: "Jule", werkzeug: "Kabel-Einziehspirale 15 m", begruendung: "Für die Leitungen durch die Holme zum Dach.", datum: plusTage(heute, -5), status: "offen" },
    ],
    benachrichtigungen: [
      { id: "n1", zeit: zeit(heute, -1, "09:15"), titel: "Dein Wunsch ist da!", text: "Der Akku-Blindnietmutternsetzer hängt jetzt an der Werkzeugwand.", link: "/mein-camp/werkzeugwuensche", gelesen: false },
      { id: "n2", zeit: zeit(heute, -2, "18:05"), titel: "Seb hat geantwortet", text: "„Wenn du am Verteiler bist, sag Bescheid …“", link: "/mein-camp/support", gelesen: false },
      { id: "n3", zeit: zeit(heute, -4, "12:00"), titel: "Dein Event ist freigegeben", text: "„Van-Kino in der Halle“ findet statt und steht im Kalender.", link: "/mein-camp/community", gelesen: true },
    ],
    ereignisse: [],
  };
}

/**
 * Wünsche anderer Mitglieder. In der Oberfläche nie sichtbar (kein Voting) –
 * sie fließen nur in Sebs Auswertung im Cockpit ein (lib/services/cockpit.ts).
 */
export function andereWuensche(heute: string): Werkzeugwunsch[] {
  const w = (id: string, name: string, werkzeug: string, tage: number, begruendung: string): Werkzeugwunsch => ({
    id, mitgliedId: `m-${name.toLowerCase()}`, mitgliedName: name, werkzeug, begruendung, datum: plusTage(heute, tage), status: "offen",
  });
  return [
    w("wx1", "Henrik", "Kabel-Einziehspirale 15 m", -12, "Dachkabel durch die Holme."),
    w("wx2", "Okan", "Kabel-Einziehspirale 15 m", -3, "Solarleitung nach hinten ziehen."),
    w("wx3", "Svenja", "Bördelgerät für Kupferrohr", -18, "Für die Wasserleitungen."),
    w("wx4", "Malte", "Zweite Tauchsäge", -7, "Samstags ist die eine immer belegt."),
    w("wx5", "Pia", "Zweite Tauchsäge", -2, "Warte regelmäßig eine Stunde."),
    w("wx6", "Merle", "Zweite Tauchsäge", -1, "Dito."),
  ];
}
