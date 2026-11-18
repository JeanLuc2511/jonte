"use client";

import { useCamp } from "@/lib/camp/store";
import { TEXTE, type TextSchluessel } from "@/lib/daten/texte";

/** Pflegbarer Text: zeigt, was Seb im Cockpit eingetragen hat, sonst den Standardtext. */
export function T({ k }: { k: TextSchluessel }) {
  const camp = useCamp();
  return <>{camp?.texte[k] ?? TEXTE[k]}</>;
}
