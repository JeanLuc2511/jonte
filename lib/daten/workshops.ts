import type { Workshop } from "@/lib/types";
import { plusTage } from "@/lib/datum";

/** Beispiel-Workshops. `inTagen` wird relativ zu „heute" in ein Datum umgerechnet. */
const VORLAGE: (Omit<Workshop, "datum"> & { inTagen: number })[] = [
  {
    id: "elektrik-12v", inTagen: 11, titel: "12-Volt-Elektrik von null",
    kurz: "Von der Batterie bis zur Steckdose: Du planst und verkabelst ein komplettes Bordnetz am Übungsbrett.",
    beschreibung: "Kabelquerschnitte, Sicherungen, Ladebooster, Solar – einmal sauber erklärt und direkt selbst gecrimpt. Am Ende hast du einen Schaltplan für deinen eigenen Camper.",
    zeit: "10 – 17 Uhr", dauer: "1 Tag", preis: 149, minTeilnehmer: 4, maxTeilnehmer: 8, angemeldet: 5,
    level: "Einsteiger", leitung: "Seb & Elektro-Meisterin (Beispiel)",
    inhalte: ["Bordnetz planen", "Crimpen & Absichern", "Solar & Ladebooster", "Dein eigener Schaltplan"],
  },
  {
    id: "dachfenster", inTagen: 18, titel: "Loch ins Dach: Fenster & Dachhaube",
    kurz: "Der Schnitt, vor dem alle Respekt haben. Wir machen ihn gemeinsam – am Übungsblech und am echten Dach.",
    beschreibung: "Anzeichnen, Sägen, Entgraten, Rostschutz, Einbaurahmen, Dichten. Danach traust du dich an dein eigenes Fahrzeug.",
    zeit: "9 – 16 Uhr", dauer: "1 Tag", preis: 169, minTeilnehmer: 4, maxTeilnehmer: 6, angemeldet: 3,
    level: "Einsteiger", leitung: "Seb (Beispiel)",
    inhalte: ["Ausschnitt anzeichnen", "Sägen ohne Angst", "Rostschutz & Rahmen", "Dauerhaft dicht kleben"],
  },
  {
    id: "daemmen", inTagen: 25, titel: "Dämmen ohne Schimmel",
    kurz: "Welches Material wohin, was mit Hohlräumen passiert und warum eine Dampfsperre nicht immer hilft.",
    beschreibung: "Wir vergleichen Materialien an Mustern, dämmen eine echte Seitenwand und sprechen über Feuchtigkeit, Wärmebrücken und Gewicht.",
    zeit: "10 – 15 Uhr", dauer: "5 Stunden", preis: 89, minTeilnehmer: 5, maxTeilnehmer: 10, angemeldet: 2,
    level: "Einsteiger", leitung: "Seb (Beispiel)",
    inhalte: ["Materialvergleich", "Wärmebrücken finden", "Kleben an Blech", "Feuchtigkeit verstehen"],
  },
  {
    id: "moebelbau", inTagen: 32, titel: "Möbelbau für krumme Wände",
    kurz: "Im Kastenwagen ist nichts gerade. So nimmst du Konturen ab und baust Möbel, die trotzdem passen.",
    beschreibung: "Schablonen, Konturenlehre, leichte Plattenwerkstoffe, Verbindungen, die Rütteln aushalten. Du baust ein Hängeschrank-Modul zum Mitnehmen.",
    zeit: "9 – 17 Uhr", dauer: "1 Tag", preis: 189, minTeilnehmer: 4, maxTeilnehmer: 8, angemeldet: 8,
    level: "Fortgeschritten", leitung: "Tischlerin aus Münster (Beispiel)",
    inhalte: ["Konturen abnehmen", "Leichtbau-Platten", "Verbinder & Beschläge", "Eigenes Modul bauen"],
  },
  {
    id: "gas", inTagen: 39, titel: "Gasanlage verstehen",
    kurz: "Was du selbst vorbereiten darfst, was die Prüfung sehen will und wie ein sicherer Gaskasten aussieht.",
    beschreibung: "Theorie mit Anfassen: Gaskasten, Leitungsführung, Absperrventile, Belüftung. Mit Probedurchlauf einer G-607-Prüfung.",
    zeit: "17 – 20 Uhr", dauer: "3 Stunden", preis: 59, minTeilnehmer: 6, maxTeilnehmer: 12, angemeldet: 6,
    level: "Einsteiger", leitung: "Sachkundiger G 607 (Beispiel)",
    inhalte: ["Gaskasten & Belüftung", "Leitungen & Ventile", "Was geprüft wird", "Typische Fehler"],
  },
  {
    id: "solar", inTagen: 46, titel: "Solar aufs Dach",
    kurz: "Module auswählen, kleben oder schrauben, Kabel durchs Dach führen und den Laderegler anschließen.",
    beschreibung: "Wir montieren ein Modul auf einem Übungsdach, setzen eine Dachdurchführung und nehmen die Anlage in Betrieb.",
    zeit: "10 – 16 Uhr", dauer: "1 Tag", preis: 149, minTeilnehmer: 4, maxTeilnehmer: 8, angemeldet: 1,
    level: "Fortgeschritten", leitung: "Seb (Beispiel)",
    inhalte: ["Anlage auslegen", "Module befestigen", "Dachdurchführung", "Inbetriebnahme"],
  },
];

export function beispielWorkshops(heute: string): Workshop[] {
  return VORLAGE.map(({ inTagen, ...w }) => ({ ...w, datum: plusTage(heute, inTagen) }));
}
