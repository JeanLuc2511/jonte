import type { Metadata } from "next";
import { Workshops } from "@/components/cockpit/Workshops";

export const metadata: Metadata = { title: "Workshops & Events" };

export default function Seite() {
  return <Workshops />;
}
