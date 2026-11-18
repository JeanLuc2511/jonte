/**
 * Stammdaten der Seite. Alles mit `beispiel: true` bzw. dem Kommentar „Beispiel"
 * ist ein Platzhalter und wird vor dem echten Start ersetzt.
 */
export const SITE = {
  name: "Camp & Camper",
  claim: "Die DIY-Mietwerkstatt für deinen Camper-Ausbau",
  beschreibung:
    "Camp & Camper ist die DIY-Mietwerkstatt für Camper-Selbstausbau in Münster: Werkstattbucht mieten, Werkzeug nutzen, Workshops besuchen, Material im Fachshop holen.",
  /** Bildmarke aus dem Designsystem (gelbe Scheibe mit Bus). */
  logo: "/logo.png",
  adresse: {
    strasse: "Rudolf-Diesel-Straße 20",
    plz: "48157",
    ort: "Münster",
  },
  // Beispiel-Kontaktdaten
  email: "hallo@campundcamper.example",
  telefon: "0251 000 00 00",
  instagram: { handle: "@campundcamper", url: "https://www.instagram.com/" },
  // Beispiel-Öffnungszeiten
  oeffnungszeiten: [
    { tage: "Montag – Freitag", zeit: "8 – 20 Uhr" },
    { tage: "Samstag", zeit: "9 – 18 Uhr" },
    { tage: "Sonntag", zeit: "Ruhetag" },
  ],
  status: "In Gründung – Eröffnung in Planung",
} as const;

export const NAVIGATION = [
  { href: "/werkstatt", label: "Werkstatt" },
  { href: "/workshops", label: "Workshops" },
  { href: "/shop", label: "Fachshop" },
  { href: "/community", label: "Community" },
  { href: "/faq", label: "FAQ" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

export const KONTO_VORTEILE = [
  { titel: "Meine Garage", text: "Fahrzeug einmal anlegen – Shop und Buchung zeigen nur noch, was passt." },
  { titel: "Projekt-Planer", text: "Phasen, Checklisten von Seb, Stückliste und Budget an einem Ort." },
  { titel: "Bautagebuch", text: "Halte fest, was du geschafft hast – und zeig es, wenn du magst, in der Community." },
  { titel: "Events und Hilfe-Börse", text: "Grillabend, Stammtisch, vier Hände fürs Dachfenster." },
  { titel: "Als Mitglied noch mehr", text: "Werkzeug inklusive, Support von Seb, früher buchen, 10 % im Fachshop." },
] as const;
