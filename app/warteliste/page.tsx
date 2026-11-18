import type { Metadata } from "next";
import { Warteliste } from "@/components/Warteliste";

export const metadata: Metadata = {
  title: "Warteliste",
  description: "Trag dich in die Warteliste ein und sichere dir eine der ersten Werkstattbuchten bei Camp & Camper in Münster.",
};

export default function WartelisteSeite() {
  return <Warteliste />;
}
