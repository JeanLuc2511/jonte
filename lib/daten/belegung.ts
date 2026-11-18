import type { Belegung } from "@/lib/types";
import { plusTage } from "@/lib/datum";

/**
 * Beispiel-Belegung der Werkstattbuchten. Die Zeiträume sind relativ zu „heute"
 * (in Tagen) notiert, damit die Demo an jedem Tag lebendig aussieht.
 * Später liefert das Buchungs-Backend echte Datumswerte.
 */
const VORLAGE = [
  { buchtId: "b1", von: -3, bis: 4, spitzname: "Frieda", modell: "Sprinter L2H2", typ: "sprinter", farbe: "#EED5C7", crew: "Jule", phase: "Elektrik", instagram: "@frieda.rollt" },
  { buchtId: "b1", von: 9, bis: 15, spitzname: "Lotte", modell: "Transit L3H3", typ: "transit", farbe: "#8FB8A8", crew: "Henrik", phase: "Fenster & Dachhaube" },
  { buchtId: "b2", von: 1, bis: 6, spitzname: "Der Dicke", modell: "Ducato L3H2", typ: "ducato", farbe: "#FFFCF3", crew: "Anna & Malte", phase: "Möbelbau", instagram: "@derdicke.unterwegs" },
  { buchtId: "b2", von: 12, bis: 20, spitzname: "Nordlicht", modell: "Crafter L3H3", typ: "crafter", farbe: "#9DB4D6", crew: "Svenja", phase: "Elektrik" },
  { buchtId: "b3", von: -1, bis: 1, spitzname: "Mücke", modell: "Boxer L2H2", typ: "ducato", farbe: "#F2B36B", crew: "Tom", phase: "Solar & Ladebooster" },
  { buchtId: "b3", von: 10, bis: 13, spitzname: "Kalle", modell: "Jumper L3H2", typ: "ducato", farbe: "#C9C2B8", crew: "Pia & Jonas", phase: "Bodenplatte & Dämmung" },
  { buchtId: "b4", von: 9, bis: 11, spitzname: "Paul", modell: "Transit L2H2", typ: "transit", farbe: "#D98C7A", crew: "Merle", phase: "Küchenblock" },
  { buchtId: "b5", von: -6, bis: 10, spitzname: "Brummer", modell: "Daily L4H3", typ: "daily", farbe: "#B9A6E0", crew: "Okan & Lea", phase: "Elektrik & Wasser", instagram: "@brummer.on.tour" },
  { buchtId: "b6", von: 2, bis: 12, spitzname: "Greta", modell: "Sprinter 4×4 L3H2", typ: "sprinter", farbe: "#A9B08A", crew: "Familie Brandt", phase: "Komplettausbau, Woche 2" },
] as const;

export function beispielBelegung(heute: string): Belegung[] {
  return VORLAGE.map((v, i) => ({
    id: `beispiel-${i + 1}`,
    buchtId: v.buchtId,
    von: plusTage(heute, v.von),
    bis: plusTage(heute, v.bis),
    fahrzeug: { spitzname: v.spitzname, modell: v.modell, typ: v.typ, farbe: v.farbe },
    crew: v.crew,
    phase: v.phase,
    instagram: "instagram" in v ? v.instagram : undefined,
  }));
}
