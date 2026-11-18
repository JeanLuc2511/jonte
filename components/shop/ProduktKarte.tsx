import Link from "next/link";
import { fahrzeugName } from "@/lib/daten/fahrzeuge";
import type { Produkt } from "@/lib/types";
import { InDenWarenkorb } from "./InDenWarenkorb";
import { Preis } from "./Preis";
import { ProduktGrafik } from "./ProduktGrafik";

export const passendText = (p: Produkt) =>
  p.passend === "universal" ? "Passt in jeden Kastenwagen" : `Für ${p.passend.map(fahrzeugName).join(", ")}`;

export function ProduktKarte({ p }: { p: Produkt }) {
  return (
    <article className="karte flex h-full flex-col">
      <Link href={`/shop/${p.handle}`} className="relative block" tabIndex={-1} aria-hidden="true">
        <ProduktGrafik kategorie={p.kategorie} nummer={p.id.replace("p-", "")} />
        {p.badge && (
          <span className="absolute bottom-3 left-3 rounded-full border border-pflaume bg-gelb px-3 py-1 font-condensed text-[12px] font-bold uppercase tracking-wide text-pflaume">
            {p.badge}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-[22px] leading-tight text-display">
          <Link href={`/shop/${p.handle}`} className="underline-offset-4 hover:underline">{p.titel}</Link>
        </h3>
        <p className="mt-2 text-[15px] text-muted">{p.kurz}</p>
        <p className="mt-3 font-condensed text-[13px] font-semibold uppercase tracking-wide text-accent">{passendText(p)}</p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
          <p>
            <Preis betrag={p.preis} />
            {p.einheit && <span className="block text-[12px] text-muted">{p.einheit}</span>}
          </p>
          <InDenWarenkorb produktId={p.id} titel={p.titel} />
        </div>
      </div>
    </article>
  );
}
