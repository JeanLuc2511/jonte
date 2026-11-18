import type { Metadata } from "next";
import { Mitgliedschaft } from "@/components/mein-camp/Mitgliedschaft";

export const metadata: Metadata = { title: "Mitgliedschaft" };

export default function Seite() {
  return <Mitgliedschaft />;
}
