import { ABO, EVENT_ORDNUNG } from "@/lib/daten/abo";
import { FAQ } from "@/lib/daten/faq";
import { WERKZEUGE, ZONEN } from "@/lib/daten/halle";
import { LEISTUNGEN } from "@/lib/daten/leistungen";
import { andereWuensche } from "@/lib/daten/mitglied";
import { PHASEN } from "@/lib/daten/phasen";
import { PROJEKTE } from "@/lib/daten/projekte";
import { RECHTSSEITEN } from "@/lib/daten/rechtliches";
import { SITE } from "@/lib/daten/site";
import { TEXTE } from "@/lib/daten/texte";
import { beispielWorkshops } from "@/lib/daten/workshops";
import { formatLang, plusTage, tageInklusive } from "@/lib/datum";
import type {
  Anfrage, CampZustand, FahrzeugId, HallenBuchung, MitgliedAkte, PhasenId, Preise, SupportFall, SupportNachricht, WorkshopTeilnehmer,
} from "@/lib/types";

export const CAMP_VERSION = 1;

export const PREISE: Preise = {
  preisProMonat: ABO.preisProMonat,
  werkzeugpauschaleProTag: ABO.werkzeugpauschaleProTag,
  stundenpreis: 14,
  wochenrabatt: 0.15,
  shopRabatt: ABO.shopRabatt,
  buchungsfensterTage: { ...ABO.buchungsfensterTage },
};

/* ---------- Buchungen: relativ zu „heute", damit die Demo lebendig bleibt ---------- */

type B = [id: string, bucht: string, von: number, bis: number, spitzname: string, modell: string, typ: FahrzeugId, farbe: string, kunde: string, mitgliedId: string | null, quelle: HallenBuchung["quelle"], phase: string, instagram?: string];

const BUCHUNGEN: B[] = [
  // Heute sind genau zwei Werkstattbuchten belegt: B1 (Jule) und B2 (Anna & Malte)
  ["bu-1", "b1", -3, 4, "Frieda", "Sprinter L2H2", "sprinter", "#EED5C7", "Jule Hartmann", "m-jule", "online", "Elektrik", "@frieda.rollt"],
  ["bu-10", "b2", -2, 6, "Der Dicke", "Ducato L3H2", "ducato", "#FFFCF3", "Anna & Malte Brinkmann", "m-malte", "online", "Möbelbau", "@derdicke.unterwegs"],
  ["bu-11", "b3", 2, 4, "Mücke", "Boxer L2H2", "ducato", "#F2B36B", "Tom Ahlers", null, "telefon", "Solar & Ladebooster"],
  ["bu-12", "b5", 3, 12, "Brummer", "Daily L4H3", "daily", "#B9A6E0", "Okan & Lea Demir", "m-okan", "online", "Elektrik & Wasser", "@brummer.on.tour"],
  ["bu-13", "b6", 2, 12, "Greta", "Sprinter 4×4 L3H2", "sprinter", "#A9B08A", "Familie Brandt", null, "walk-in", "Komplettausbau, Woche 2"],
  ["bu-14", "b1", 9, 15, "Lotte", "Transit L3H3", "transit", "#8FB8A8", "Henrik Voss", "m-henrik", "online", "Fenster & Dachhaube"],
  ["bu-15", "b2", 12, 20, "Nordlicht", "Crafter L3H3", "crafter", "#9DB4D6", "Svenja Kock", "m-svenja", "online", "Feinschliff"],
  ["bu-16", "b3", 10, 13, "Kalle", "Jumper L3H2", "ducato", "#C9C2B8", "Pia & Jonas Lenz", "m-pia", "online", "Bodenplatte & Dämmung"],
  ["bu-17", "b4", 9, 11, "Paul", "Transit L2H2", "transit", "#D98C7A", "Merle Siebert", "m-merle", "telefon", "Küchenblock"],
  // Vergangene Buchungen – für Auslastung und Umsatz
  ["bu-20", "b2", -27, -18, "Mücke", "Boxer L2H2", "ducato", "#F2B36B", "Tom Ahlers", null, "telefon", "Dämmung"],
  ["bu-21", "b5", -24, -8, "Brummer", "Daily L4H3", "daily", "#B9A6E0", "Okan & Lea Demir", "m-okan", "online", "Dämmung"],
  ["bu-22", "b3", -20, -12, "Nordlicht", "Crafter L3H3", "crafter", "#9DB4D6", "Svenja Kock", "m-svenja", "online", "Möbelbau"],
  ["bu-23", "b4", -16, -9, "Paul", "Transit L2H2", "transit", "#D98C7A", "Merle Siebert", "m-merle", "online", "Elektrik"],
  ["bu-24", "b1", -14, -6, "Lotte", "Transit L3H3", "transit", "#8FB8A8", "Henrik Voss", "m-henrik", "online", "Planung & Rohbau"],
  ["bu-25", "b6", -12, -5, "Kalle", "Jumper L3H2", "ducato", "#C9C2B8", "Pia & Jonas Lenz", "m-pia", "walk-in", "Rohbau"],
];

function buchungen(heute: string): HallenBuchung[] {
  return BUCHUNGEN.map(([id, buchtId, von, bis, spitzname, modell, typ, farbe, kunde, mitgliedId, quelle, phase, instagram]) => {
    const v = plusTage(heute, von);
    const b = plusTage(heute, bis);
    const tage = tageInklusive(v, b);
    const preis = ZONEN.find((z) => z.id === buchtId)?.bucht?.preisProTag ?? 69;
    return {
      id, buchtId, von: v, bis: b, status: "bestaetigt", quelle, mitgliedId: mitgliedId ?? undefined,
      kunde: { name: kunde, email: `${kunde.split(" ")[0].toLowerCase()}@beispiel.de`, telefon: "0170 000 00 00" },
      fahrzeug: { spitzname, modell, typ, farbe }, phase, instagram,
      summe: Math.round(preis * tage * (tage >= 7 ? 1 - PREISE.wochenrabatt : 1)),
    };
  });
}

/* ---------- Konten (außer dem Beispiel-Mitglied Jule) ---------- */

function akten(heute: string): MitgliedAkte[] {
  const a = (
    id: string, vorname: string, nachname: string, rolle: "konto" | "mitglied", abo: "keins" | "aktiv" | "pausiert" | "gekuendigt", seitTage: number,
    fahrzeug: [string, string, string], phase: PhasenId, eintraege: number, anzahl: number, letzte?: number,
  ): MitgliedAkte => ({
    mitglied: {
      id, vorname, nachname, email: `${vorname.toLowerCase()}@beispiel.de`, telefon: "0170 000 00 00", rolle, dabeiSeit: plusTage(heute, -seitTage),
      abo: {
        status: abo, preisProMonat: PREISE.preisProMonat, seit: abo === "keins" ? undefined : plusTage(heute, -seitTage),
        naechsteAbbuchung: abo === "aktiv" ? plusTage(heute, 9) : undefined,
        pausiertBis: abo === "pausiert" ? plusTage(heute, 64) : undefined,
        endetAm: abo === "gekuendigt" ? plusTage(heute, 12) : undefined,
      },
    },
    fahrzeuge: [{ spitzname: fahrzeug[0], modell: fahrzeug[1], farbe: fahrzeug[2] }],
    projekt: { titel: `${fahrzeug[0]} wird ausgebaut`, phase, eintraege, oeffentlich: eintraege > 2, fotos: eintraege > 0 ? ["motiv:boden", "motiv:kabel", "motiv:daemmung"].slice(0, Math.min(3, eintraege)) : [] },
    buchungen: anzahl, letzteBuchung: letzte === undefined ? undefined : plusTage(heute, letzte),
  });
  return [
    a("m-malte", "Malte", "Brinkmann", "mitglied", "aktiv", 96, ["Der Dicke", "Ducato L3H2", "#FFFCF3"], "moebel", 9, 3, -2),
    a("m-svenja", "Svenja", "Kock", "mitglied", "aktiv", 140, ["Nordlicht", "Crafter L3H3", "#9DB4D6"], "finish", 14, 5, -20),
    a("m-okan", "Okan", "Demir", "mitglied", "aktiv", 61, ["Brummer", "Daily L4H3", "#B9A6E0"], "elektrik", 6, 2, -24),
    a("m-lars", "Lars", "Petersen", "mitglied", "pausiert", 180, ["Wal", "Sprinter L3H2", "#C9C2B8"], "daemmung", 3, 2, -75),
    a("m-merle", "Merle", "Siebert", "mitglied", "gekuendigt", 120, ["Paul", "Transit L2H2", "#D98C7A"], "finish", 11, 4, -16),
    a("m-henrik", "Henrik", "Voss", "konto", "keins", 33, ["Lotte", "Transit L3H3", "#8FB8A8"], "daemmung", 2, 1, -14),
    a("m-pia", "Pia", "Lenz", "konto", "keins", 21, ["Kalle", "Jumper L3H2", "#C9C2B8"], "planung", 0, 1, -12),
  ];
}

/* ---------- Support-Postfach ---------- */

function support(heute: string): SupportFall[] {
  const t = (tage: number, uhr: string) => `${plusTage(heute, tage)}T${uhr}:00`;
  const n = (id: string, von: SupportNachricht["von"], zeit: string, text: string, mehr: Partial<SupportNachricht> = {}): SupportNachricht => ({ id, von, zeit, text, ...mehr });
  const ebenGerade = new Date(Date.now() - 9 * 60_000).toISOString();
  return [
    {
      mitgliedId: "m-malte",
      nachrichten: [
        n("x1", "mitglied", t(-3, "18:20"), "Seb, die Hängeschränke: Reichen Einnietmuttern M6 im Holm oder besser durchschrauben?"),
        n("x2", "seb", t(-3, "18:52"), "M6 im Holm reicht, wenn du vier Stück pro Schrank setzt. Nimm die mit Rändel, die drehen nicht mit."),
        n("x3", "system", ebenGerade, "Hilferuf aus Werkstattbucht 2: Malte kommt nicht weiter.", { art: "hilferuf", buchtId: "b2", erledigt: false }),
      ],
    },
    {
      mitgliedId: "m-svenja",
      nachrichten: [
        n("y1", "mitglied", t(-6, "09:10"), "Die Dieselheizung zieht beim Start 10 A. Passt das zu meiner 15-A-Sicherung?"),
        n("y2", "seb", t(-6, "10:02"), "Ja, das ist der Glühstift beim Start. Im Betrieb liegt sie bei 1 bis 2 A. 15 A passt."),
        n("y3", "mitglied", t(-1, "20:41"), "Noch was fürs Finish: Womit dichte ich die Fuge am Dachfenster-Innenrahmen ab, ohne dass es schmiert?"),
        n("y4", "system", t(-1, "20:45"), `Video-Termin angefragt: ${formatLang(plusTage(heute, 2))}, 16:30 Uhr.`, { art: "videotermin" }),
      ],
    },
    {
      mitgliedId: "m-okan",
      nachrichten: [
        n("z1", "mitglied", t(-9, "12:30"), "300 Ah Lithium und nur 200 Wp Solar – lohnt ein zweites Modul?"),
        n("z2", "seb", t(-9, "14:05"), "Für Vollzeit ja. Plan gleich die Kabel für 400 Wp, dann musst du später nicht noch mal ans Dach."),
      ],
    },
  ];
}

/* ---------- Warteliste & Kontakt ---------- */

function anfragen(heute: string): Anfrage[] {
  const z = (tage: number, uhr: string) => `${plusTage(heute, tage)}T${uhr}:00`;
  return [
    { id: "a1", art: "warteliste", zeit: z(0, "08:14"), name: "Nora", email: "nora@beispiel.de", telefon: "0171 000 00 00", status: "neu", angaben: { Fahrzeug: "Crafter / TGE", Stand: "Fahrzeug steht da, bald geht’s los", Interessen: "Werkstattbucht mieten, Workshops", Start: "In 1 bis 3 Monaten", Quelle: "Instagram", Herausforderung: "Ich traue mich nicht ans Dachfenster." } },
    { id: "a2", art: "warteliste", zeit: z(-1, "21:37"), name: "Kemal", email: "kemal@beispiel.de", status: "neu", angaben: { Fahrzeug: "Ducato / Boxer / Jumper", Stand: "Ich bin mittendrin", Interessen: "Werkstattbucht mieten, Gasprüfung", Start: "Sofort", Quelle: "Empfehlung", Herausforderung: "Mir fehlt ein trockener Platz für den Winter." } },
    { id: "a3", art: "warteliste", zeit: z(-4, "11:02"), name: "Insa", email: "insa@beispiel.de", status: "kontaktiert", angaben: { Fahrzeug: "Noch keins", Stand: "Ich träume noch", Interessen: "Beratung, Workshops", Start: "Später", Quelle: "Google" } },
    { id: "a4", art: "warteliste", zeit: z(-9, "17:45"), name: "Bastian", email: "bastian@beispiel.de", telefon: "0172 000 00 00", status: "erledigt", angaben: { Fahrzeug: "Sprinter", Stand: "Ich plane gerade", Interessen: "Werkstattbucht mieten, Material aus dem Fachshop", Start: "In 3 bis 6 Monaten", Quelle: "An der Halle vorbeigefahren" } },
    { id: "a5", art: "kontakt", zeit: z(-2, "14:20"), name: "Fahrschule Hansen", email: "hansen@beispiel.de", status: "kontaktiert", angaben: { Nachricht: "Können wir die Halle an einem Samstag für einen Firmen-Workshop mieten?" } },
    { id: "a6", art: "kontakt", zeit: z(-11, "10:05"), name: "Ole", email: "ole@beispiel.de", status: "erledigt", angaben: { Nachricht: "Passt ein Daily mit 3,10 m Höhe durchs Rolltor?" } },
  ];
}

const TEILNEHMER = ["Nora", "Kemal", "Insa", "Ole", "Malte", "Svenja", "Okan", "Pia", "Henrik", "Merle", "Lea", "Jonas"];

/** Der Ausgangszustand des Camps für die Demo. Später kommt er aus dem Backend. */
export function beispielCamp(heute: string): CampZustand {
  return {
    version: CAMP_VERSION,
    seedTag: heute,
    zonen: ZONEN,
    werkzeuge: WERKZEUGE,
    preise: PREISE,
    buchungen: buchungen(heute),
    sperrzeiten: [{ id: "sp-1", buchtIds: ["b3"], von: plusTage(heute, 16), bis: plusTage(heute, 17), grund: "Bodenbeschichtung ausbessern" }],
    workshops: beispielWorkshops(heute).map((w) => ({
      ...w, absagefristTage: 7,
      teilnehmer: TEILNEHMER.slice(0, w.angemeldet).map((name): WorkshopTeilnehmer => ({ name, email: `${name.toLowerCase()}@beispiel.de`, telefon: "0170 000 00 00" })),
    })),
    leistungen: LEISTUNGEN,
    mitglieder: akten(heute),
    notizen: { "m-malte": "Baut sehr sauber. Fragt lieber einmal zu viel – gern Zeit nehmen.", "m-lars": "Pausiert über den Winter, will im März weitermachen." },
    support: support(heute),
    autoAntwort: true,
    wuensche: andereWuensche(heute),
    wunschStatus: {},
    anfragen: anfragen(heute),
    medien: [
      { id: "med-1", name: "Halle, Blick vom Rolltor", quelle: "motiv:leer", kategorie: "halle", datum: plusTage(heute, -20), aufWebsite: false },
      { id: "med-2", name: "Werkzeugwand", quelle: "motiv:plan", kategorie: "halle", datum: plusTage(heute, -20), aufWebsite: false },
      { id: "med-3", name: "Elektrik-Workshop", quelle: "motiv:kabel", kategorie: "workshop", datum: plusTage(heute, -12), aufWebsite: false },
    ],
    texte: { ...TEXTE },
    faq: FAQ,
    kontakt: {
      email: SITE.email, telefon: SITE.telefon, oeffnungszeiten: SITE.oeffnungszeiten.map((o) => ({ ...o })),
      hinweise: ["Rolltor 3,50 m hoch – auch für Hochdächer mit Dachhaube.", "Parkplätze für dein Alltagsauto direkt vor der Halle.", "Noch kein Fahrzeug? Komm trotzdem vorbei und schau dir die Halle an."],
    },
    rechtliches: RECHTSSEITEN.map((r) => ({ slug: r.slug, titel: r.titel, intro: r.intro, abschnitte: r.abschnitte.map((a) => ({ ...a })) })),
    eventOrdnung: [...EVENT_ORDNUNG],
    phasen: PHASEN,
    projekte: PROJEKTE,
    ausgeblendet: [],
    shop: [
      { nummer: "#1042", kunde: "Jule Hartmann", datum: plusTage(heute, -1), summe: 351, status: "offen", lieferungAnBucht: "Werkstattbucht 1" },
      { nummer: "#1041", kunde: "Malte Brinkmann", datum: plusTage(heute, -1), summe: 595, status: "offen", lieferungAnBucht: "Werkstattbucht 2" },
      { nummer: "#1040", kunde: "Tom Ahlers", datum: plusTage(heute, -2), summe: 169, status: "abholbereit" },
      { nummer: "#1039", kunde: "Nora Winkler", datum: plusTage(heute, -3), summe: 79, status: "versendet" },
      { nummer: "#1038", kunde: "Okan Demir", datum: plusTage(heute, -4), summe: 1098, status: "abholbereit", lieferungAnBucht: "Werkstattbucht 5 XL" },
    ],
  };
}
