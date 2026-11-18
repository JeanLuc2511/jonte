import type { Metadata } from "next";
import { Buchungen } from "@/components/cockpit/Buchungen";

export const metadata: Metadata = { title: "Buchungen" };

export default function Seite() {
  return <Buchungen />;
}
