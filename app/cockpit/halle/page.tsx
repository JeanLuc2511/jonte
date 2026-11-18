import type { Metadata } from "next";
import { Halle } from "@/components/cockpit/Halle";

export const metadata: Metadata = { title: "Halle & Preise" };

export default function Seite() {
  return <Halle />;
}
