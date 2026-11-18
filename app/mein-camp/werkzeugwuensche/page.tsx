import type { Metadata } from "next";
import { Werkzeugwuensche } from "@/components/mein-camp/Werkzeugwuensche";

export const metadata: Metadata = { title: "Werkzeugwünsche" };

export default function Seite() {
  return <Werkzeugwuensche />;
}
