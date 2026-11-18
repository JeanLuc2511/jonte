/** Platzhalter für die Rechtstexte. Die echten Texte kommen von Seb bzw. einer Kanzlei. */
export const RECHTSSEITEN = [
  {
    slug: "impressum", titel: "Impressum",
    intro: "Hier steht später das vollständige Impressum nach § 5 DDG.",
    abschnitte: [
      { titel: "Anbieter", text: "Camp & Camper (in Gründung)\nRudolf-Diesel-Straße 20\n48157 Münster" },
      { titel: "Vertreten durch", text: "Wird ergänzt, sobald die Gesellschaft gegründet ist." },
      { titel: "Kontakt", text: "E-Mail und Telefon werden ergänzt." },
      { titel: "Umsatzsteuer-ID & Register", text: "Wird ergänzt." },
    ],
  },
  {
    slug: "datenschutz", titel: "Datenschutz",
    intro: "Hier steht später die Datenschutzerklärung. Diese Punkte muss sie für diese Website abdecken:",
    abschnitte: [
      { titel: "Verantwortlicher", text: "Camp & Camper, Rudolf-Diesel-Straße 20, 48157 Münster." },
      { titel: "Hosting", text: "Die Website wird bei Vercel gehostet. Schriften sind lokal eingebunden, es werden keine Google Fonts nachgeladen." },
      { titel: "Formulare", text: "Warteliste und Kontaktformular übermitteln die eingegebenen Daten an unser Automatisierungssystem (n8n). Rechtsgrundlage ist deine Einwilligung." },
      { titel: "Shop & Buchung", text: "Bestellungen laufen später über Shopify, Buchungen über unser eigenes Buchungssystem. Die Abschnitte dazu werden ergänzt." },
      { titel: "Deine Rechte", text: "Auskunft, Berichtigung, Löschung, Widerruf deiner Einwilligung – wird ausformuliert." },
    ],
  },
  {
    slug: "agb", titel: "AGB",
    intro: "Hier stehen später die Allgemeinen Geschäftsbedingungen für Werkstattbucht, Workshops, Beratung, Gasprüfung und Fachshop.",
    abschnitte: [
      { titel: "Buchung & Zahlung", text: "Wird ergänzt." },
      { titel: "Storno & Umbuchung", text: "Wird ergänzt. Die FAQ zeigt den geplanten Rahmen." },
      { titel: "Workshops & Mindestteilnehmerzahl", text: "Wird ergänzt." },
      { titel: "Haftung", text: "Wird ergänzt." },
    ],
  },
  {
    slug: "widerruf", titel: "Widerruf",
    intro: "Hier stehen später Widerrufsbelehrung und Muster-Widerrufsformular für Bestellungen im Fachshop.",
    abschnitte: [
      { titel: "Widerrufsrecht", text: "Wird ergänzt." },
      { titel: "Ausnahmen", text: "Zuschnitte und individuell gefertigte Teile – wird ergänzt." },
      { titel: "Muster-Widerrufsformular", text: "Wird ergänzt." },
    ],
  },
  {
    slug: "werkstattordnung", titel: "Werkstattordnung",
    intro: "Die Spielregeln in der Halle. Hier steht später die verbindliche Fassung, das ist der geplante Rahmen:",
    abschnitte: [
      { titel: "Sicherheit zuerst", text: "Feste Schuhe, Schutzbrille an den Maschinen, Gehörschutz beim Sägen und Flexen." },
      { titel: "Einweisung", text: "Tischkreissäge, Oberfräse und Schweißgerät nutzt du erst nach einer kurzen Einweisung." },
      { titel: "Werkzeug", text: "Nehmen, nutzen, zurückhängen. Werkzeug bleibt in der Halle." },
      { titel: "Ordnung", text: "Abends ist deine Werkstattbucht besenrein, Reste kommen in die richtige Tonne." },
      { titel: "Miteinander", text: "Fragen ist erwünscht, Helfen auch. Musik in Zimmerlautstärke." },
    ],
  },
] as const;
