import type { Metadata } from "next";
import { Support } from "@/components/cockpit/Support";

export const metadata: Metadata = { title: "Support-Postfach" };

export default function Seite() {
  return <Support />;
}
