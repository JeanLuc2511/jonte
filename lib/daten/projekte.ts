import type { Projekt } from "@/lib/types";

/**
 * Beispielprojekte. Die Instagram-Namen sind erfunden und verlinken in der Demo
 * nur auf instagram.com – später steht hier das echte Profil.
 */
const IG = "https://www.instagram.com/";

export const PROJEKTE: Projekt[] = [
  {
    id: "frieda", titel: "Frieda", crew: "Jule", fahrzeug: "Sprinter L2H2, Baujahr 2017", typ: "sprinter", farbe: "#EED5C7",
    status: "Im Bau", dauer: "Elektrik, seit 10 Wochen dabei",
    zitat: "Ich hatte vorher noch nie eine Stichsäge in der Hand. Jetzt hat Frieda zwei Fenster.",
    highlights: ["Erstes Projekt", "Festbett quer", "Solar 200 Wp"], instagram: "@frieda.rollt", instagramUrl: IG,
  },
  {
    id: "der-dicke", titel: "Der Dicke", crew: "Anna & Malte", fahrzeug: "Ducato L3H2, Baujahr 2019", typ: "ducato", farbe: "#FFFCF3",
    status: "Im Bau", dauer: "Möbelbau, Woche 5",
    zitat: "Zu Hause hätten wir auf der Straße gebaut. Hier steht er trocken und die Kreissäge ist zehn Schritte weg.",
    highlights: ["Längsbetten", "Nasszelle", "Gasheizung"], instagram: "@derdicke.unterwegs", instagramUrl: IG,
  },
  {
    id: "brummer", titel: "Brummer", crew: "Okan & Lea", fahrzeug: "Daily L4H3, Baujahr 2015", typ: "daily", farbe: "#B9A6E0",
    status: "Im Bau", dauer: "Elektrik & Wasser, Woche 7",
    zitat: "Ein Ex-Paketwagen mit 400.000 Kilometern. Jetzt wird er unser Zuhause für ein Jahr.",
    highlights: ["Vollzeit-Van", "300 Ah Lithium", "Arbeitsplatz für zwei"], instagram: "@brummer.on.tour", instagramUrl: IG,
  },
  {
    id: "nordlicht", titel: "Nordlicht", crew: "Svenja", fahrzeug: "Crafter L3H3, Baujahr 2020", typ: "crafter", farbe: "#9DB4D6",
    status: "Fertig", dauer: "9 Wochen, abends und am Wochenende",
    zitat: "Den Elektrik-Workshop habe ich zweimal gemacht. Beim zweiten Mal habe ich den Schaltplan selbst gezeichnet.",
    highlights: ["Wintertauglich", "Dieselheizung", "Hubbett"], instagram: "@nordlicht.van", instagramUrl: IG,
  },
  {
    id: "paul", titel: "Paul", crew: "Merle", fahrzeug: "Transit L2H2, Baujahr 2016", typ: "transit", farbe: "#D98C7A",
    status: "Fertig", dauer: "14 Tage am Stück",
    zitat: "Zwei Wochen Urlaub genommen, eine Werkstattbucht gebucht, mit fertigem Camper rausgefahren.",
    highlights: ["Budget-Ausbau", "Modulmöbel", "Ohne Gas"], instagram: "@paul.packt.aus", instagramUrl: IG,
  },
  {
    id: "greta", titel: "Greta", crew: "Familie Brandt", fahrzeug: "Sprinter 4×4 L3H2, Baujahr 2021", typ: "sprinter", farbe: "#A9B08A",
    status: "Im Bau", dauer: "Komplettausbau, Woche 2",
    zitat: "Die Kinder sitzen in der Lounge und malen Grundrisse. Wir bauen drei davon nicht.",
    highlights: ["Vier Schlafplätze", "Zwei Gurtsitze hinten", "Dachträger"], instagram: "@greta.vier.mal.vier", instagramUrl: IG,
  },
];
