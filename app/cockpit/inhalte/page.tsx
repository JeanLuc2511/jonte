import type { Metadata } from "next";
import { Inhalte } from "@/components/cockpit/Inhalte";
import { getProdukte } from "@/lib/services/shop";

export const metadata: Metadata = { title: "Inhalte & Medien" };

export default async function Seite() {
  const produkte = await getProdukte();
  return <Inhalte produkte={produkte.map((p) => ({ id: p.id, titel: p.titel }))} />;
}
