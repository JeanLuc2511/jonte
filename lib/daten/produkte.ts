import type { Produkt } from "@/lib/types";

/**
 * Beispiel-Sortiment des Fachshops. Später kommen diese Daten aus Shopify
 * (Storefront API); `handle` und `id` entsprechen dann den Shopify-Feldern,
 * `passend` wird über Produkt-Tags oder Metafelder gepflegt.
 */
export const PRODUKTE: Produkt[] = [
  {
    id: "p-1001", handle: "kautschuk-daemmung-19mm", titel: "Kautschuk-Dämmung 19 mm, selbstklebend",
    kategorie: "Dämmung", kurz: "Die Standard-Dämmung fürs Blech. Geschlossenzellig, nimmt kein Wasser auf.",
    beschreibung: "Selbstklebende Dämmmatte für Wände, Dach und Türen. Lässt sich mit dem Cutter schneiden und folgt Sicken und Rundungen.",
    preis: 79, einheit: "Rolle · 6 m²", passend: "universal",
    details: ["Stärke 19 mm", "Rolle 6 × 1 m", "Temperaturbeständig bis 85 °C"], abholbar: true, badge: "Meistgekauft",
  },
  {
    id: "p-1002", handle: "daemmung-holme-10mm", titel: "Kautschuk-Dämmung 10 mm für Holme",
    kategorie: "Dämmung", kurz: "Dünne Matte für Holme, Radkästen und alles, wo es eng wird.",
    beschreibung: "Die dünne Schwester der 19-mm-Matte. Für Holme, Radkästen und Schiebetür.",
    preis: 49, einheit: "Rolle · 6 m²", passend: "universal",
    details: ["Stärke 10 mm", "Rolle 6 × 1 m", "Selbstklebend"], abholbar: true,
  },
  {
    id: "p-1003", handle: "bodenplatte-sprinter-crafter-l2", titel: "Bodenplatte CNC-gefräst, Sprinter / Crafter L2",
    kategorie: "Möbelbau & Holz", kurz: "Passgenau gefräste Siebdruckplatte – reinlegen, verschrauben, fertig.",
    beschreibung: "Zweiteilige Bodenplatte aus 12 mm Siebdruck, auf die Bodenkontur gefräst. Mit Aussparungen für Radkästen und Zurrpunkte.",
    preis: 389, einheit: "Set", passend: ["sprinter", "crafter"],
    details: ["12 mm Birke Siebdruck", "Zweiteilig, mit Nut und Feder", "Nur Abholung in der Halle"], abholbar: true, badge: "Passgenau",
  },
  {
    id: "p-1004", handle: "bodenplatte-ducato-l3", titel: "Bodenplatte CNC-gefräst, Ducato / Boxer / Jumper L3",
    kategorie: "Möbelbau & Holz", kurz: "Für den 5,99-m-Kastenwagen, passend auf die Bodenkontur gefräst.",
    beschreibung: "Zweiteilige Bodenplatte aus 12 mm Siebdruck mit Aussparungen für Radkästen und Trittstufe.",
    preis: 369, einheit: "Set", passend: ["ducato"],
    details: ["12 mm Birke Siebdruck", "Zweiteilig", "Nur Abholung in der Halle"], abholbar: true, badge: "Passgenau",
  },
  {
    id: "p-1005", handle: "pappelsperrholz-15mm", titel: "Pappelsperrholz 15 mm, HPL-beschichtet",
    kategorie: "Möbelbau & Holz", kurz: "Leicht, stabil, abwischbar. Der Klassiker für Möbel im Camper.",
    beschreibung: "Leichtbauplatte mit beidseitiger HPL-Schicht. Zuschnitt auf Wunsch direkt in der Holzwerkstatt.",
    preis: 119, einheit: "Platte · 250 × 122 cm", passend: "universal",
    details: ["ca. 6,5 kg/m²", "Dekor Weiß matt", "Zuschnitt vor Ort möglich"], abholbar: true,
  },
  {
    id: "p-1006", handle: "unterkonstruktion-leisten", titel: "Leisten-Set für die Unterkonstruktion",
    kategorie: "Möbelbau & Holz", kurz: "Gehobelte Fichtenleisten, gebündelt für einen kompletten Kastenwagen.",
    beschreibung: "Trocken gelagert und gerade ausgesucht. Reicht für Boden, Wände und Decke eines L2/L3.",
    preis: 89, einheit: "Bund · 24 Stück", passend: "universal",
    details: ["24 × 44 mm, 2,5 m", "Gehobelt, gefast", "Kammergetrocknet"], abholbar: true,
  },
  {
    id: "p-1007", handle: "lifepo4-100ah", titel: "LiFePO4-Akku 100 Ah mit Bluetooth",
    kategorie: "Elektrik", kurz: "Das Herz deiner Bordelektrik. Leicht, zyklenfest, per App im Blick.",
    beschreibung: "Lithium-Eisenphosphat-Batterie mit integriertem Batteriemanagement und Heizfunktion für Wintercamper.",
    preis: 549, passend: "universal",
    details: ["12,8 V / 100 Ah", "BMS mit 100 A Dauerstrom", "Bluetooth-Überwachung"], abholbar: true,
  },
  {
    id: "p-1008", handle: "ladebooster-30a", titel: "Ladebooster 30 A",
    kategorie: "Elektrik", kurz: "Lädt die Aufbaubatterie während der Fahrt – Pflicht bei modernen Lichtmaschinen.",
    beschreibung: "DC-DC-Wandler für Fahrzeuge mit intelligenter Lichtmaschine (Euro 6). Mit Ladeprofil für LiFePO4.",
    preis: 219, passend: ["sprinter", "crafter", "ducato", "transit", "daily"],
    details: ["12 V / 30 A", "Für Euro-6-Lichtmaschinen", "Passiv gekühlt"], abholbar: true,
  },
  {
    id: "p-1009", handle: "solarmodul-200wp", titel: "Solarmodul 200 Wp, schwarz",
    kategorie: "Elektrik", kurz: "Monokristallines Modul, flach genug für jedes Hochdach.",
    beschreibung: "Rahmenmodul mit hoher Ausbeute bei wenig Licht. Dazu passend: Halter-Set zum Kleben.",
    preis: 169, passend: "universal",
    details: ["200 Wp, monokristallin", "148 × 67 cm", "Inkl. 1 m Anschlusskabel"], abholbar: true,
  },
  {
    id: "p-1010", handle: "kabelsatz-bordnetz", titel: "Kabelsatz Bordnetz, vorkonfektioniert",
    kategorie: "Elektrik", kurz: "Batteriekabel mit verpressten Kabelschuhen, Sicherungen und Verteiler.",
    beschreibung: "Die dicken Leitungen fertig verpresst: Batterie, Booster, Sicherungsverteiler. Spart die Hydraulikzange.",
    preis: 129, einheit: "Set", passend: "universal",
    details: ["35 mm² und 16 mm²", "Mega- und Midi-Sicherungen", "12-fach-Verteiler"], abholbar: true, badge: "Camp-Set",
  },
  {
    id: "p-1011", handle: "dachhaube-ventilator-40x40", titel: "Dachhaube mit Ventilator, 40 × 40 cm",
    kategorie: "Fenster & Lüftung", kurz: "Zieht warme Luft raus und frische rein – auch bei Regen.",
    beschreibung: "Dachlüfter mit zehn Stufen, Regensensor und Fernbedienung. Passt in den Standardausschnitt.",
    preis: 329, passend: "universal",
    details: ["Ausschnitt 40 × 40 cm", "Zu- und Abluft", "12 V, ca. 0,2 – 4 A"], abholbar: true,
  },
  {
    id: "p-1012", handle: "einbaurahmen-dachhaube-sprinter", titel: "Einbaurahmen Dachhaube, Sprinter / Crafter",
    kategorie: "Fenster & Lüftung", kurz: "Gleicht die Dachsicken aus, damit die Haube plan und dicht sitzt.",
    beschreibung: "Passgenauer Adapterrahmen für 40 × 40 cm zwischen den Dachsicken.",
    preis: 59, passend: ["sprinter", "crafter"],
    details: ["Für 40 × 40 cm", "UV-beständig", "Inkl. Klebeanleitung"], abholbar: true, badge: "Passgenau",
  },
  {
    id: "p-1013", handle: "einbaurahmen-dachhaube-ducato", titel: "Einbaurahmen Dachhaube, Ducato / Boxer / Jumper",
    kategorie: "Fenster & Lüftung", kurz: "Der Adapter für die Sicken im Ducato-Dach.",
    beschreibung: "Passgenauer Adapterrahmen für 40 × 40 cm, für Fahrzeuge ab Baujahr 2006.",
    preis: 55, passend: ["ducato"],
    details: ["Für 40 × 40 cm", "Ab Baujahr 2006", "Inkl. Klebeanleitung"], abholbar: true, badge: "Passgenau",
  },
  {
    id: "p-1014", handle: "ausstellfenster-90x45", titel: "Ausstellfenster 90 × 45 cm mit Rollo",
    kategorie: "Fenster & Lüftung", kurz: "Doppelverglast, mit Verdunklung und Fliegengitter im Innenrahmen.",
    beschreibung: "Aufstellbares Seitenfenster für Wandstärken von 26 bis 46 mm.",
    preis: 419, passend: "universal",
    details: ["Ausschnitt 90 × 45 cm", "Acryl-Doppelverglasung", "Kombirollo im Innenrahmen"], abholbar: true,
  },
  {
    id: "p-1015", handle: "seitenfenster-transit-schiebetuer", titel: "Echtglas-Schiebefenster, Transit Schiebetür",
    kategorie: "Fenster & Lüftung", kurz: "Getöntes Karosseriefenster zum Einkleben, mit Schiebeteil.",
    beschreibung: "Fahrzeugspezifisches Klebefenster für die Schiebetür rechts, inklusive Kantenschutz.",
    preis: 289, passend: ["transit"],
    details: ["Schiebetür rechts", "Privacy-Tönung", "Inkl. Kantenschutz"], abholbar: true, badge: "Passgenau",
  },
  {
    id: "p-1016", handle: "frischwassertank-70l", titel: "Frischwassertank 70 l, Radkasten-Form",
    kategorie: "Wasser & Gas", kurz: "Nutzt den Platz über dem Radkasten, der sonst verloren geht.",
    beschreibung: "Formtank mit Revisionsöffnung und vormontierten Anschlüssen.",
    preis: 149, passend: ["ducato", "sprinter", "crafter"],
    details: ["70 Liter", "Lebensmittelecht", "Anschlüsse vormontiert"], abholbar: true,
  },
  {
    id: "p-1017", handle: "druckwasserpumpe", titel: "Druckwasserpumpe 11 l/min",
    kategorie: "Wasser & Gas", kurz: "Leise Membranpumpe für Küche und Dusche.",
    beschreibung: "Selbstansaugend, trockenlaufsicher, mit Druckschalter.",
    preis: 99, passend: "universal",
    details: ["12 V", "11 l/min, 2,8 bar", "Inkl. Vorfilter"], abholbar: true,
  },
  {
    id: "p-1018", handle: "gaskasten-2x5kg", titel: "Gaskasten für 2 × 5 kg",
    kategorie: "Wasser & Gas", kurz: "Dichter Kasten mit Bodenentlüftung – so will ihn die Gasprüfung sehen.",
    beschreibung: "Pulverbeschichteter Stahlkasten mit Türdichtung, Flaschenhalter und Bodenentlüftung.",
    preis: 239, passend: "universal",
    details: ["Für 2 × 5-kg-Flaschen", "Bodenentlüftung 100 cm²", "Passend zur G 607"], abholbar: true,
  },
  {
    id: "p-1019", handle: "karosserie-dichtkleber", titel: "Karosserie-Dichtkleber, schwarz",
    kategorie: "Befestigen & Dichten", kurz: "Für Fenster, Dachhauben und Solarhalter. Bleibt elastisch, hält dauerhaft.",
    beschreibung: "Einkomponentiger Kleb- und Dichtstoff. Den passenden Primer gibt es direkt dazu.",
    preis: 16.9, einheit: "Kartusche · 300 ml", passend: "universal",
    details: ["UV-beständig", "Überlackierbar", "Primer separat"], abholbar: true,
  },
  {
    id: "p-1020", handle: "einnietmuttern-set-m6", titel: "Einnietmuttern-Set M6, Stahl verzinkt",
    kategorie: "Befestigen & Dichten", kurz: "Feste Gewinde im Blech, ohne zu schweißen.",
    beschreibung: "100 Einnietmuttern mit passendem Bohrer. Die Zange dazu hängt an der Werkzeugwand.",
    preis: 24.9, einheit: "Set · 100 Stück", passend: "universal",
    details: ["M6, Flachkopf", "Klemmbereich 0,5 – 3 mm", "Inkl. Bohrer 9 mm"], abholbar: true,
  },
  {
    id: "p-1021", handle: "airline-schiene-2m", titel: "Airline-Zurrschiene 2 m",
    kategorie: "Befestigen & Dichten", kurz: "Für Betten, Sitze und alles, was im Zweifel halten muss.",
    beschreibung: "Aluminium-Zurrschiene, halbrund, zum Aufschrauben oder Einlassen.",
    preis: 39, passend: "universal",
    details: ["Aluminium eloxiert", "Länge 2 m", "Fittinge separat"], abholbar: true,
  },
  {
    id: "p-1022", handle: "verkleidung-radkasten-daily", titel: "Radkasten-Verkleidung, Daily",
    kategorie: "Möbelbau & Holz", kurz: "Vorgefertigte Kästen aus Pappelsperrholz für die Zwillingsreifen-Radkästen.",
    beschreibung: "Bausatz zum Verleimen, auf die großen Radkästen des Daily mit Zwillingsbereifung angepasst.",
    preis: 179, einheit: "Paar", passend: ["daily"],
    details: ["9 mm Pappelsperrholz", "Bausatz, gefräst", "Für Zwillingsbereifung"], abholbar: true, badge: "Passgenau",
  },
];

export const PRODUKT_KATEGORIEN = [
  "Dämmung", "Elektrik", "Fenster & Lüftung", "Möbelbau & Holz", "Wasser & Gas", "Befestigen & Dichten",
] as const;
