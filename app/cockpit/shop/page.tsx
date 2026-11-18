import type { Metadata } from "next";
import { Shop } from "@/components/cockpit/Shop";

export const metadata: Metadata = { title: "Shop" };

export default function Seite() {
  return <Shop />;
}
