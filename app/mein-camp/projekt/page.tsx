import type { Metadata } from "next";
import { Projekt } from "@/components/mein-camp/Projekt";
import { getProdukte } from "@/lib/services/shop";

export const metadata: Metadata = { title: "Projekt" };

export default async function Seite() {
  return <Projekt produkte={await getProdukte()} />;
}
