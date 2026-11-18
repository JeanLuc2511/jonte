/**
 * Pflegbare Texte der Website. Seb ändert sie im Cockpit unter „Inhalte";
 * die Seiten zeigen sie über die Komponente <T k="…" /> an.
 */
export const TEXTE = {
  "start.eyebrow": "Mietwerkstatt Münster",
  "start.titel": "Bau deinen Camper selbst.",
  "start.text": "Bei uns bekommst du deine eigene Werkstattbucht – voll ausgestattet mit Profi-Werkzeug, Maschinen und Material direkt vor Ort. Du schraubst. Wir sind da, wenn du nicht weiterweißt.",
  "werkstatt.titel": "Schau dich in der Werkstatt um",
  "werkstatt.text": "Werkstattbuchten, Werkbänke, Holzwerkstatt, Metall-Ecke und eine Wand voller Spezialwerkzeug. Wähl deinen Zeitraum und sieh, welche Werkstattbucht frei ist und wer neben dir schraubt.",
  "workshops.titel": "Einmal zeigen lassen, dann selber machen",
  "workshops.text": "Ein Thema, ein Tag, eine kleine Runde am echten Fahrzeug. Jeder Workshop hat eine Mindestteilnehmerzahl – er findet statt, sobald genug Leute dabei sind.",
  "shop.titel": "Material, das wir selbst verbauen würden",
  "shop.text": "Kein Katalog mit zehntausend Teilen, sondern das, was im Ausbau wirklich gebraucht wird. Sag uns, was du fährst, und du siehst, was passt. Abholen kannst du alles direkt in der Halle.",
  "community.titel": "Jeder Camper hier hat einen Namen",
  "community.text": "Im Camp wird nebeneinander gebaut, gefachsimpelt und geholfen. Das sind die Projekte aus der Halle – und die Menschen dahinter.",
  "band.titel": "Sei dabei, wenn das Rolltor aufgeht",
  "band.text": "Trag dich in die Warteliste ein. Du erfährst als Erstes, wann es losgeht, und sicherst dir eine der ersten Werkstattbuchten.",
} as const;

export type TextSchluessel = keyof typeof TEXTE;

export const TEXT_GRUPPEN: { titel: string; felder: { k: TextSchluessel; label: string; lang?: boolean }[] }[] = [
  { titel: "Startseite", felder: [{ k: "start.eyebrow", label: "Zeile über der Headline" }, { k: "start.titel", label: "Headline" }, { k: "start.text", label: "Einleitung", lang: true }] },
  { titel: "Werkstatt", felder: [{ k: "werkstatt.titel", label: "Headline" }, { k: "werkstatt.text", label: "Einleitung", lang: true }] },
  { titel: "Workshops", felder: [{ k: "workshops.titel", label: "Headline" }, { k: "workshops.text", label: "Einleitung", lang: true }] },
  { titel: "Fachshop", felder: [{ k: "shop.titel", label: "Headline" }, { k: "shop.text", label: "Einleitung", lang: true }] },
  { titel: "Community", felder: [{ k: "community.titel", label: "Headline" }, { k: "community.text", label: "Einleitung", lang: true }] },
  { titel: "Band zur Warteliste", felder: [{ k: "band.titel", label: "Headline" }, { k: "band.text", label: "Text", lang: true }] },
];
