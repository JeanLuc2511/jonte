/** Abo und Kontostufen. Alle Beträge sind Beispielwerte (im Plan als „offen" markiert). */
export const ABO = {
  preisProMonat: 39,
  werkzeugpauschaleProTag: 10,
  /** Rabatt im Fachshop für Mitglieder */
  shopRabatt: 0.1,
  /** So viele Tage im Voraus kann gebucht werden */
  buchungsfensterTage: { standard: 30, mitglied: 60 },
  /** Ab so vielen Hallentagen im Monat ist das Abo günstiger als die Werkzeugpauschale */
  lohntAbTagen: 4,
} as const;

export const STUFEN_VERGLEICH: { zeile: string; gast: string | boolean; konto: string | boolean; mitglied: string | boolean }[] = [
  { zeile: "Werkstattbucht buchen", gast: "+ Werkzeugpauschale", konto: "+ Werkzeugpauschale", mitglied: "Werkzeug inklusive" },
  { zeile: "Meine Garage, Projekt, Bautagebuch", gast: false, konto: true, mitglied: true },
  { zeile: "Events vorschlagen und teilnehmen", gast: false, konto: true, mitglied: true },
  { zeile: "Hilfe-Börse", gast: false, konto: true, mitglied: true },
  { zeile: "Support von Seb", gast: false, konto: false, mitglied: true },
  { zeile: "Früheres Buchungsfenster", gast: false, konto: false, mitglied: "60 statt 30 Tage" },
  { zeile: "Rabatt im Fachshop", gast: false, konto: false, mitglied: "10 %" },
  { zeile: "Werkzeug wünschen", gast: false, konto: false, mitglied: true },
];

export const EVENT_ORDNUNG = [
  "Maschinen sind aus, sobald das Event beginnt.",
  "Ruhezeiten: ab 22 Uhr draußen leise, um 23 Uhr ist Schluss.",
  "Alkohol nur, wenn kein Werkzeug mehr angefasst wird.",
  "Die verantwortliche Person bleibt bis zum Ende und schließt mit ab.",
];

export const EVENT_ORTE = ["Lounge & Planungstisch", "Vor dem Rolltor", "Fahrgasse in der Halle", "Holzwerkstatt"];
