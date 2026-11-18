import type { Metadata } from "next";
import { Mitglieder } from "@/components/cockpit/Mitglieder";

export const metadata: Metadata = { title: "Mitglieder & Abos" };

export default function Seite() {
  return <Mitglieder />;
}
