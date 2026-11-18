"use client";

import { ABO } from "@/lib/daten/abo";
import { euro } from "@/lib/datum";
import { useRolle } from "@/lib/mein-camp/store";
import { darf } from "@/lib/rechte";

/** Preis mit Mitgliederrabatt. Später liefert Shopify den Rabatt über Kundengruppen. */
export function Preis({ betrag, gross = false }: { betrag: number; gross?: boolean }) {
  const rolle = useRolle();
  const rabatt = rolle && darf(rolle, "shop.rabatt");
  const klasse = gross ? "font-display text-5xl text-display" : "text-lg font-semibold";
  if (!rabatt) return <span className={klasse}>{euro(betrag)}</span>;
  const neu = Math.round(betrag * (1 - ABO.shopRabatt) * 100) / 100;
  return (
    <span>
      <span className={klasse}>{euro(neu)}</span>{" "}
      <s className="text-[14px] text-muted">{euro(betrag)}</s>
      <span className="block font-condensed text-[12px] font-bold uppercase tracking-wider text-accent">Mitgliederpreis</span>
    </span>
  );
}
