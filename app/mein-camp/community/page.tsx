import type { Metadata } from "next";
import { Community } from "@/components/mein-camp/Community";

export const metadata: Metadata = { title: "Community" };

export default function Seite() {
  return <Community />;
}
