import type { Leistung } from "@/lib/types";

/** Buchbare Leistungen. Preise sind Beispiele. */
export const LEISTUNGEN: Leistung[] = [
  {
    id: "bucht",
    name: "Werkstattbucht",
    kurz: "Dein Platz in der Halle – tageweise oder für den ganzen Ausbau.",
    preisText: "ab 69 € / Tag",
    preis: 69,
    einheit: "Tag",
    punkte: ["Strom, Licht, Druckluft", "Werkzeug für Mitglieder inklusive", "Sonst Werkzeugpauschale 10 € pro Tag"],
  },
  {
    id: "workshop",
    name: "Workshop",
    kurz: "Ein Thema, ein Tag, kleine Gruppe. Findet statt, sobald genug dabei sind.",
    preisText: "ab 89 €",
    preis: 89,
    einheit: "Platz",
    punkte: ["Kleine Gruppen", "Üben am echten Fahrzeug", "Zahlung erst bei Zusage"],
  },
  {
    id: "beratung",
    name: "Ausbau-Beratung",
    kurz: "60 Minuten mit jemandem, der es schon ein paar Mal gebaut hat.",
    preisText: "79 € / 60 Min.",
    preis: 79,
    einheit: "Termin",
    punkte: ["Grundriss & Reihenfolge", "Elektrik- und Gasplanung", "Materialliste zum Mitnehmen"],
  },
  {
    id: "gaspruefung",
    name: "Gasprüfung",
    kurz: "Prüfung deiner Flüssiggasanlage nach G 607 – direkt am Prüfplatz in der Halle.",
    preisText: "59 €",
    preis: 59,
    einheit: "Prüfung",
    punkte: ["Durch anerkannte Sachkundige", "Prüfbescheinigung & Plakette", "Feste Prüftage im Monat"],
  },
];

export const ZEITFENSTER = ["9:00", "11:00", "14:00", "16:30"];
