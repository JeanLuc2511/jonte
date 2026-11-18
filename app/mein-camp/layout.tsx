import type { Metadata } from "next";
import { Rahmen } from "@/components/mein-camp/Rahmen";

export const metadata: Metadata = {
  title: { default: "Mein Camp", template: "%s · Mein Camp · Camp & Camper" },
  description: "Der Mitgliederbereich von Camp & Camper: Garage, Projekt-Planer, Bautagebuch, Support, Community und Mitgliedschaft.",
};

export default function MeinCampLayout({ children }: { children: React.ReactNode }) {
  return <Rahmen>{children}</Rahmen>;
}
