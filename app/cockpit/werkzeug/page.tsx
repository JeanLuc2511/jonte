import type { Metadata } from "next";
import { Werkzeug } from "@/components/cockpit/Werkzeug";

export const metadata: Metadata = { title: "Werkzeugwünsche" };

export default function Seite() {
  return <Werkzeug />;
}
