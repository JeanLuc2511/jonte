import type { Werkzeug, Zone } from "@/lib/types";

/**
 * Beispielhalle. Koordinaten beziehen sich auf den Hallenplan (viewBox 1200 × 760).
 * Sobald der echte Grundriss feststeht, werden nur diese Werte angepasst.
 */
export const HALLE = { breite: 1200, hoehe: 760, flaeche: "ca. 620 m²" };

const BUCHT_BASIS = ["Werkzeugwagen", "230 V / 16 A", "Druckluft", "LED-Arbeitslicht"];

export const ZONEN: Zone[] = [
  {
    id: "b1", typ: "bucht", kurz: "B1", name: "Werkstattbucht 1",
    beschreibung: "Standardbucht direkt am Rolltor – kurze Wege beim Rangieren und Ausladen.",
    x: 40, y: 40, w: 190, h: 300, ausstattung: BUCHT_BASIS,
    bucht: { groesse: "Standard", maxLaengeM: 6.0, preisProTag: 69, ausrichtung: "hoch" },
  },
  {
    id: "b2", typ: "bucht", kurz: "B2", name: "Werkstattbucht 2",
    beschreibung: "Standardbucht mit schwenkbarem Absaugarm – gut für Schleif- und Sägearbeiten am Fahrzeug.",
    x: 250, y: 40, w: 190, h: 300, ausstattung: [...BUCHT_BASIS, "Absaugarm"],
    bucht: { groesse: "Standard", maxLaengeM: 6.0, preisProTag: 69, ausrichtung: "hoch" },
  },
  {
    id: "b3", typ: "bucht", kurz: "B3", name: "Werkstattbucht 3",
    beschreibung: "Standardbucht in der Hallenmitte, Werkbänke und Werkzeugwand direkt gegenüber.",
    x: 460, y: 40, w: 190, h: 300, ausstattung: BUCHT_BASIS,
    bucht: { groesse: "Standard", maxLaengeM: 6.0, preisProTag: 69, ausrichtung: "hoch" },
  },
  {
    id: "b4", typ: "bucht", kurz: "B4", name: "Werkstattbucht 4",
    beschreibung: "Standardbucht neben der Holzwerkstatt – ideal für die Möbelbau-Phase.",
    x: 670, y: 40, w: 190, h: 300, ausstattung: [...BUCHT_BASIS, "Zuschnitt nebenan"],
    bucht: { groesse: "Standard", maxLaengeM: 6.0, preisProTag: 69, ausrichtung: "hoch" },
  },
  {
    id: "b5", typ: "bucht", kurz: "B5", name: "Werkstattbucht 5 XL",
    beschreibung: "XL-Bucht für lange Radstände und Hochdächer, mit Starkstrom.",
    x: 40, y: 450, w: 360, h: 125, ausstattung: [...BUCHT_BASIS, "400 V / 16 A", "Platz bis L5"],
    bucht: { groesse: "XL", maxLaengeM: 7.4, preisProTag: 85, ausrichtung: "quer" },
  },
  {
    id: "b6", typ: "bucht", kurz: "B6", name: "Werkstattbucht 6 XL",
    beschreibung: "XL-Bucht mit Rollgerüst – für Dachfenster, Dachhauben und Solar.",
    x: 40, y: 585, w: 360, h: 125, ausstattung: [...BUCHT_BASIS, "Rollgerüst fürs Dach", "Platz bis L5"],
    bucht: { groesse: "XL", maxLaengeM: 7.4, preisProTag: 85, ausrichtung: "quer" },
  },
  {
    id: "w1", typ: "werkbank", kurz: "W1", name: "Werkbank 1 · Holz",
    beschreibung: "Massive Hobelbank mit Vorder- und Hinterzange für alles, was eingespannt werden will.",
    x: 430, y: 460, w: 150, h: 70, ausstattung: ["Hobelbank 2 m", "Schraubstock", "Steckdosenleiste"],
  },
  {
    id: "w2", typ: "werkbank", kurz: "W2", name: "Werkbank 2 · Montage",
    beschreibung: "Große Montagefläche zum Vormontieren von Möbelmodulen, Schubladen und Klappen.",
    x: 430, y: 550, w: 150, h: 70, ausstattung: ["Lochrasterplatte", "Spannelemente", "Steckdosenleiste"],
  },
  {
    id: "w3", typ: "werkbank", kurz: "W3", name: "Werkbank 3 · Elektrik",
    beschreibung: "Der saubere Tisch: Löten, Crimpen, Kabelbäume vorbereiten und durchmessen.",
    x: 430, y: 640, w: 150, h: 70, ausstattung: ["ESD-Matte", "Labornetzteil", "Lupenleuchte"],
  },
  {
    id: "holz", typ: "station", kurz: "Holz", name: "Holzwerkstatt",
    beschreibung: "Zuschnitt und Kantenbearbeitung mit zentraler Absaugung. Hier werden aus Platten Möbel.",
    x: 890, y: 40, w: 270, h: 190, ausstattung: ["Zentrale Absaugung", "Plattenlager", "Gehörschutz & Brillen"],
    hinweis: "Tischkreissäge und Oberfräse nur nach kurzer Einweisung.",
  },
  {
    id: "metall", typ: "station", kurz: "Metall", name: "Metall-Ecke",
    beschreibung: "Bohren, Trennen, Schweißen – abgetrennt mit Funkenschutz.",
    x: 890, y: 250, w: 270, h: 150, ausstattung: ["Schweißvorhang", "Schraubstock", "Schutzausrüstung"],
    hinweis: "Schweißen nur nach Einweisung oder mit Nachweis.",
  },
  {
    id: "gas", typ: "station", kurz: "Gas", name: "Gas-Prüfplatz",
    beschreibung: "Hier wird deine Gasanlage nach G 607 geprüft. Prüftage sind buchbar.",
    x: 610, y: 460, w: 120, h: 160, ausstattung: ["Prüfplatz mit Abluft", "Feste Prüftage"],
    hinweis: "Prüfung nur durch anerkannte Sachkundige.",
  },
  {
    id: "reste", typ: "bereich", kurz: "Reste", name: "Reste & Recycling",
    beschreibung: "Holzreste zum Mitnehmen, getrennte Tonnen für Metall, Kartuschen und Verpackung.",
    x: 750, y: 460, w: 110, h: 160, ausstattung: ["Restekiste Holz", "Wertstofftrennung"],
  },
  {
    id: "wand", typ: "station", kurz: "Wand", name: "Werkzeugwand",
    beschreibung: "Spezialwerkzeug hängt hier, jedes mit eigenem Platz. Nehmen, nutzen, zurückhängen.",
    x: 610, y: 650, w: 250, h: 60, ausstattung: ["Schattenwand – du siehst sofort, was fehlt"],
    hinweis: "Werkzeug bleibt in der Halle – kein Verleih zum Mitnehmen.",
  },
  {
    id: "lounge", typ: "bereich", kurz: "Lounge", name: "Lounge & Planungstisch",
    beschreibung: "Kaffee, großer Tisch, Whiteboard und Materialmuster. Hier wird geplant, gefachsimpelt und Pause gemacht.",
    x: 890, y: 420, w: 270, h: 170, ausstattung: ["Kaffee & Wasser", "WLAN", "Musterwand Dämmung & Holz"],
  },
  {
    id: "shop", typ: "bereich", kurz: "Shop", name: "Empfang & Shop-Abholung",
    beschreibung: "Einchecken, Einweisung abholen und online bestelltes Material direkt aus dem Regal nehmen.",
    x: 890, y: 610, w: 270, h: 100, ausstattung: ["Abholregal Fachshop", "Verbrauchsmaterial vor Ort"],
  },
];

const jeBucht = (name: string, id: string, kategorie: Werkzeug["kategorie"]): Werkzeug => ({
  id, name, kategorie, zoneId: "buchten", anzahl: 6,
});

/** `zoneId: "buchten"` = liegt im Werkzeugwagen jeder Werkstattbucht. */
export const WERKZEUGE: Werkzeug[] = [
  jeBucht("Akkuschrauber mit 2 Akkus", "akkuschrauber", "Bohren & Schrauben"),
  jeBucht("Bit- und Bohrer-Set", "bitset", "Bohren & Schrauben"),
  jeBucht("Ratschenkasten 1/4″ + 1/2″", "ratsche", "Bohren & Schrauben"),
  jeBucht("Schraubzwingen-Set", "zwingen", "Hilfsmittel"),
  jeBucht("Maßband, Winkel, Wasserwaage", "messset", "Messen & Prüfen"),
  jeBucht("Cutter, Hammer, Zangen-Set", "handset", "Hilfsmittel"),
  jeBucht("Arbeitsleuchte & Kabeltrommel", "licht", "Hilfsmittel"),

  { id: "tks", name: "Tischkreissäge", kategorie: "Sägen & Trennen", zoneId: "holz", anzahl: 1, einweisung: true },
  { id: "kapp", name: "Kapp- und Zugsäge", kategorie: "Sägen & Trennen", zoneId: "holz", anzahl: 1 },
  { id: "tauch", name: "Tauchsäge mit Führungsschiene", kategorie: "Sägen & Trennen", zoneId: "holz", anzahl: 2 },
  { id: "stich", name: "Stichsäge", kategorie: "Sägen & Trennen", zoneId: "holz", anzahl: 3 },
  { id: "fraese", name: "Oberfräse mit Frästisch", kategorie: "Schleifen & Fräsen", zoneId: "holz", anzahl: 1, einweisung: true },
  { id: "kantenfraese", name: "Kantenfräse", kategorie: "Schleifen & Fräsen", zoneId: "holz", anzahl: 2 },
  { id: "exzenter", name: "Exzenterschleifer", kategorie: "Schleifen & Fräsen", zoneId: "holz", anzahl: 3 },
  { id: "duebel", name: "Dübelfräse", kategorie: "Schleifen & Fräsen", zoneId: "holz", anzahl: 1 },
  { id: "taschenloch", name: "Taschenloch-Bohrlehre", kategorie: "Bohren & Schrauben", zoneId: "holz", anzahl: 2 },

  { id: "schweiss", name: "MAG-Schweißgerät", kategorie: "Metall & Karosserie", zoneId: "metall", anzahl: 1, einweisung: true },
  { id: "flex", name: "Winkelschleifer 125 mm", kategorie: "Metall & Karosserie", zoneId: "metall", anzahl: 2 },
  { id: "standbohr", name: "Ständerbohrmaschine", kategorie: "Bohren & Schrauben", zoneId: "metall", anzahl: 1 },
  { id: "bandschleifer", name: "Bandschleifer Metall", kategorie: "Schleifen & Fräsen", zoneId: "metall", anzahl: 1 },
  { id: "metallsaege", name: "Metall-Kappsäge", kategorie: "Sägen & Trennen", zoneId: "metall", anzahl: 1, einweisung: true },

  { id: "lochsaege", name: "Lochsägen-Set bis 152 mm", kategorie: "Sägen & Trennen", zoneId: "wand", anzahl: 2 },
  { id: "karosseriesaege", name: "Karosserie-Stichsäge für Fensterausschnitte", kategorie: "Metall & Karosserie", zoneId: "wand", anzahl: 2 },
  { id: "knabber", name: "Blechknabber", kategorie: "Metall & Karosserie", zoneId: "wand", anzahl: 1 },
  { id: "nietmutter", name: "Nietmutternzange M4 – M10", kategorie: "Metall & Karosserie", zoneId: "wand", anzahl: 2 },
  { id: "multitool", name: "Multitool (oszillierend)", kategorie: "Sägen & Trennen", zoneId: "wand", anzahl: 2 },
  { id: "kartusche", name: "Akku-Kartuschenpresse", kategorie: "Kleben & Dichten", zoneId: "wand", anzahl: 3 },
  { id: "heissluft", name: "Heißluftgebläse", kategorie: "Kleben & Dichten", zoneId: "wand", anzahl: 2 },
  { id: "andruck", name: "Andruckrollen für Dämmung", kategorie: "Kleben & Dichten", zoneId: "wand", anzahl: 4 },
  { id: "drehmoment", name: "Drehmomentschlüssel", kategorie: "Messen & Prüfen", zoneId: "wand", anzahl: 2 },
  { id: "laser", name: "Kreuzlinienlaser", kategorie: "Messen & Prüfen", zoneId: "wand", anzahl: 1 },
  { id: "endoskop", name: "Endoskop-Kamera für Hohlräume", kategorie: "Messen & Prüfen", zoneId: "wand", anzahl: 1 },

  { id: "loet", name: "Lötstation", kategorie: "Elektrik", zoneId: "w3", anzahl: 2 },
  { id: "crimp", name: "Crimpzangen-Set (Aderendhülsen, Kabelschuhe)", kategorie: "Elektrik", zoneId: "w3", anzahl: 2 },
  { id: "hydraulik", name: "Hydraulische Presszange bis 70 mm²", kategorie: "Elektrik", zoneId: "w3", anzahl: 1 },
  { id: "multimeter", name: "Multimeter & Zangenamperemeter", kategorie: "Elektrik", zoneId: "w3", anzahl: 3 },
  { id: "abisolier", name: "Abisolierzangen", kategorie: "Elektrik", zoneId: "w3", anzahl: 3 },

  { id: "hobel", name: "Handhobel & Stemmeisen-Satz", kategorie: "Schleifen & Fräsen", zoneId: "w1", anzahl: 1 },
  { id: "japan", name: "Japansägen", kategorie: "Sägen & Trennen", zoneId: "w1", anzahl: 2 },
  { id: "korpus", name: "Korpuszwingen 1 m", kategorie: "Hilfsmittel", zoneId: "w2", anzahl: 6 },
  { id: "tacker", name: "Druckluft-Tacker", kategorie: "Hilfsmittel", zoneId: "w2", anzahl: 1 },

  { id: "leck", name: "Gas-Lecksuchgerät", kategorie: "Messen & Prüfen", zoneId: "gas", anzahl: 1, einweisung: true },
  { id: "manometer", name: "Prüfpumpe mit Manometer", kategorie: "Messen & Prüfen", zoneId: "gas", anzahl: 1, einweisung: true },

  { id: "geruest", name: "Rollgerüst fürs Dach", kategorie: "Hilfsmittel", zoneId: "b6", anzahl: 1 },
  { id: "saugheber", name: "Saugheber für Fenster", kategorie: "Hilfsmittel", zoneId: "shop", anzahl: 2 },
  { id: "sauger", name: "Werkstattsauger", kategorie: "Hilfsmittel", zoneId: "reste", anzahl: 3 },
];
