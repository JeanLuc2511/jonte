import type { Metadata } from "next";
import { CockpitRahmen } from "@/components/cockpit/Rahmen";

export const metadata: Metadata = {
  title: { default: "Camp-Cockpit", template: "%s · Camp-Cockpit" },
  description: "Sebs Verwaltungsbereich: Halle, Buchungen, Workshops, Mitglieder, Support und Inhalte.",
};

export default function CockpitLayout({ children }: { children: React.ReactNode }) {
  return <CockpitRahmen>{children}</CockpitRahmen>;
}
