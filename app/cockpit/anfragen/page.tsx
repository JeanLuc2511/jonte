import type { Metadata } from "next";
import { Anfragen } from "@/components/cockpit/Anfragen";

export const metadata: Metadata = { title: "Warteliste & Anfragen" };

export default function Seite() {
  return <Anfragen />;
}
