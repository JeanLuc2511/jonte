import type { Fahrzeugdaten } from "@/lib/types";

/**
 * Beispiel-Auszug für die Fahrzeugdaten-Abfrage über HSN/TSN.
 * Die Kombinationen sind Demo-Werte, kein echter KBA-Auszug. Später liefert n8n die Daten
 * aus dem KBA-Verzeichnis oder einer kommerziellen Schnittstelle.
 */
export const KBA_BEISPIELE: Record<string, Omit<Fahrzeugdaten, "gefunden">> = {
  "1313/GBW": { hersteller: "Mercedes-Benz", modell: "Sprinter 316 CDI", motor: "2.1 l Diesel (OM 651)", leistungKw: 120, kraftstoff: "Diesel", typ: "sprinter" },
  "0603/CFX": { hersteller: "Volkswagen", modell: "Crafter 35 2.0 TDI", motor: "2.0 l TDI", leistungKw: 103, kraftstoff: "Diesel", typ: "crafter" },
  "4136/BGT": { hersteller: "Fiat", modell: "Ducato 35 2.3 Multijet", motor: "2.3 l Multijet", leistungKw: 96, kraftstoff: "Diesel", typ: "ducato" },
  "3003/BLK": { hersteller: "Peugeot", modell: "Boxer 335 BlueHDi", motor: "2.2 l BlueHDi", leistungKw: 103, kraftstoff: "Diesel", typ: "ducato" },
  "8566/BVQ": { hersteller: "Ford", modell: "Transit 350 2.0 EcoBlue", motor: "2.0 l EcoBlue", leistungKw: 96, kraftstoff: "Diesel", typ: "transit" },
  "4116/AEY": { hersteller: "Iveco", modell: "Daily 35 S 16", motor: "2.3 l Diesel", leistungKw: 115, kraftstoff: "Diesel", typ: "daily" },
};

/** Das liest die simulierte Bildanalyse aus einem Fahrzeugschein-Foto. */
export const BEISPIEL_SCHEIN = { hsn: "4136", tsn: "BGT" };

/** Das liest die simulierte Bildanalyse aus einem Beleg-Foto. */
export const BEISPIEL_BELEG = {
  haendler: "Elektro-Großhandel Münster",
  betrag: 86.4,
  positionen: [
    { name: "Aderleitung H07V-K 6 mm², 25 m", betrag: 38.9 },
    { name: "Aderendhülsen-Sortiment", betrag: 14.5 },
    { name: "Wellrohr 16 mm, 25 m", betrag: 19.0 },
    { name: "Kabelschuhe M8, 20 Stück", betrag: 14.0 },
  ],
};

export const RADSTAENDE = ["L1", "L2", "L3", "L4", "L5"];
export const DACHHOEHEN = ["H1", "H2", "H3"];
/** Faustwerte für Länge und Höhe – nur als Vorbelegung der Zusatzfragen */
export const LAENGE_M: Record<string, number> = { L1: 5.0, L2: 5.4, L3: 6.0, L4: 6.4, L5: 7.4 };
export const HOEHE_M: Record<string, number> = { H1: 2.3, H2: 2.6, H3: 2.9 };
