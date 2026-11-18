import type { PhasenVorlage } from "@/lib/types";

/**
 * Sebs Vorlagen für den Projekt-Planer: Phasen mit Checkliste, Stückliste und Budget-Richtwert.
 * `produktId` verweist auf `lib/daten/produkte.ts` (später Shopify).
 */
export const PHASEN: PhasenVorlage[] = [
  {
    id: "planung", name: "Planung", kurz: "Grundriss, Gewicht, Reihenfolge",
    checkliste: ["Grundriss auf dem Boden abgeklebt", "Gewichte überschlagen (Zuladung prüfen)", "Fensterpositionen festgelegt", "Elektrik-Bedarf aufgeschrieben", "Ausbau-Beratung gemacht"],
    stueckliste: [{ name: "Malerkrepp & Pappe für Schablonen", menge: 1, preis: 12 }],
    budgetRichtwert: 150,
  },
  {
    id: "daemmung", name: "Dämmung", kurz: "Blech, Holme, Unterkonstruktion",
    checkliste: ["Blech entfettet und trocken", "Flächen mit 19 mm beklebt", "Holme und Radkästen mit 10 mm", "Hohlräume gefüllt", "Unterkonstruktion verschraubt", "Bodenplatte eingelegt"],
    stueckliste: [
      { produktId: "p-1001", name: "Kautschuk-Dämmung 19 mm", menge: 4 },
      { produktId: "p-1002", name: "Kautschuk-Dämmung 10 mm", menge: 1 },
      { produktId: "p-1006", name: "Leisten-Set Unterkonstruktion", menge: 1 },
      { produktId: "p-1003", name: "Bodenplatte CNC-gefräst", menge: 1 },
    ],
    budgetRichtwert: 900,
  },
  {
    id: "elektrik", name: "Elektrik", kurz: "Kabel ziehen, bevor die Wände zu sind",
    checkliste: ["Schaltplan gezeichnet", "Leerrohre und Kabel verlegt", "Batterie und Sicherungsverteiler montiert", "Ladebooster angeschlossen", "Solar aufs Dach, Dachdurchführung dicht", "Alle Verbraucher getestet"],
    stueckliste: [
      { produktId: "p-1007", name: "LiFePO4-Akku 100 Ah", menge: 1 },
      { produktId: "p-1008", name: "Ladebooster 30 A", menge: 1 },
      { produktId: "p-1009", name: "Solarmodul 200 Wp", menge: 1 },
      { produktId: "p-1010", name: "Kabelsatz Bordnetz", menge: 1 },
    ],
    budgetRichtwert: 1400,
  },
  {
    id: "wasser-gas", name: "Wasser & Gas", kurz: "Tank, Pumpe, Gaskasten, Prüfung",
    checkliste: ["Frischwassertank befestigt", "Pumpe und Leitungen dicht", "Gaskasten mit Bodenentlüftung", "Gasleitungen vom Fachbetrieb verlegt", "Gasprüfung G 607 bestanden"],
    stueckliste: [
      { produktId: "p-1016", name: "Frischwassertank 70 l", menge: 1 },
      { produktId: "p-1017", name: "Druckwasserpumpe", menge: 1 },
      { produktId: "p-1018", name: "Gaskasten 2 × 5 kg", menge: 1 },
    ],
    budgetRichtwert: 800,
  },
  {
    id: "moebel", name: "Möbel", kurz: "Bett, Küche, Schränke",
    checkliste: ["Konturen abgenommen", "Bett gebaut und verschraubt", "Küchenblock steht", "Hängeschränke montiert", "Alles rüttelfest gesichert"],
    stueckliste: [
      { produktId: "p-1005", name: "Pappelsperrholz 15 mm HPL", menge: 5 },
      { produktId: "p-1020", name: "Einnietmuttern-Set M6", menge: 1 },
      { produktId: "p-1021", name: "Airline-Zurrschiene 2 m", menge: 2 },
    ],
    budgetRichtwert: 1200,
  },
  {
    id: "finish", name: "Finish", kurz: "Verkleiden, dichten, wiegen",
    checkliste: ["Wand- und Deckenverkleidung fertig", "Fugen und Kanten abgedichtet", "Fahrzeug gewogen", "Umschreibung zum Wohnmobil geklärt", "Erste Probenacht"],
    stueckliste: [{ produktId: "p-1019", name: "Karosserie-Dichtkleber", menge: 3 }],
    budgetRichtwert: 400,
  },
];

export const phase = (id: string) => PHASEN.find((p) => p.id === id);
