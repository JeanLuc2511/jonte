import type { Fahrzeug } from "@/lib/types";

/** Die gängigen Basisfahrzeuge, auf die Shop und Werkstatt ausgelegt sind. */
export const FAHRZEUGE: Fahrzeug[] = [
  { id: "sprinter", name: "Sprinter", hersteller: "Mercedes-Benz" },
  { id: "crafter", name: "Crafter", zusatz: "MAN TGE", hersteller: "VW" },
  { id: "ducato", name: "Ducato", zusatz: "Boxer · Jumper", hersteller: "Fiat · Peugeot · Citroën" },
  { id: "transit", name: "Transit", hersteller: "Ford" },
  { id: "daily", name: "Daily", hersteller: "Iveco" },
];

export const fahrzeugName = (id: string) => {
  const f = FAHRZEUGE.find((x) => x.id === id);
  if (!f) return id;
  return f.id === "ducato" ? "Ducato / Boxer / Jumper" : f.name;
};
