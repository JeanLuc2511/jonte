import type { Metadata } from "next";
import { Garage } from "@/components/mein-camp/Garage";

export const metadata: Metadata = { title: "Meine Garage" };

export default function Seite() {
  return <Garage />;
}
