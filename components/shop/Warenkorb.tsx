"use client";

import { usePreise } from "@/lib/camp/store";
import Link from "next/link";
import { useState } from "react";
import { euro, isoHeute } from "@/lib/datum";
import { getKonto, useRolle } from "@/lib/mein-camp/store";
import { darf } from "@/lib/rechte";
import { budgetEintragen } from "@/lib/services/mitglieder";
import { starteCheckout } from "@/lib/services/shop";
import type { Produkt } from "@/lib/types";
import { useWarenkorb, warenkorb } from "@/lib/warenkorb";
import { Beispiel } from "../Bausteine";
import { IconMinus, IconPlus } from "../Icons";
import { ProduktGrafik } from "./ProduktGrafik";

export function Warenkorb({ produkte }: { produkte: Produkt[] }) {
  const ABO = usePreise();
  const { zeilen, lieferziel } = useWarenkorb();
  const rolle = useRolle();
  const [hinweis, setHinweis] = useState<null | "demo" | "budget">(null);
  const posten = zeilen
    .map((z) => ({ ...z, produkt: produkte.find((p) => p.id === z.produktId) }))
    .filter((z): z is typeof z & { produkt: Produkt } => Boolean(z.produkt));
  const zwischen = posten.reduce((s, z) => s + z.produkt.preis * z.menge, 0);
  const rabatt = rolle && darf(rolle, "shop.rabatt") ? Math.round(zwischen * ABO.shopRabatt * 100) / 100 : 0;
  const summe = zwischen - rabatt;

  if (posten.length === 0 && !hinweis) {
    return (
      <div className="karte p-8 text-center">
        <h2 className="heading-m">Noch nichts drin</h2>
        <p className="mx-auto mt-3 max-w-md text-muted">Such dir im Fachshop aus, was dein Ausbau braucht. Am besten filterst du gleich nach deinem Fahrzeug.</p>
        <Link href="/shop" className="btn btn-primary mt-6">Zum Fachshop</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <ul className="divide-y divide-line border-y border-line">
        {posten.map(({ produkt: p, menge }) => (
          <li key={p.id} className="flex gap-4 py-4">
            <div className="w-24 shrink-0 sm:w-32"><ProduktGrafik kategorie={p.kategorie} nummer="" /></div>
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link href={`/shop/${p.handle}`} className="font-display text-xl leading-tight text-display underline-offset-4 hover:underline">{p.titel}</Link>
                <p className="text-[14px] text-muted">{euro(p.preis)}{p.einheit ? ` · ${p.einheit}` : ""}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-line-strong">
                  <button type="button" className="flex h-11 w-11 items-center justify-center hover:bg-surface-strong" aria-label={`Menge von ${p.titel} verringern`} onClick={() => warenkorb.menge(p.id, menge - 1)}>
                    <IconMinus width={18} height={18} />
                  </button>
                  <span className="w-8 text-center font-semibold" aria-live="polite">{menge}</span>
                  <button type="button" className="flex h-11 w-11 items-center justify-center hover:bg-surface-strong" aria-label={`Menge von ${p.titel} erhöhen`} onClick={() => warenkorb.menge(p.id, menge + 1)}>
                    <IconPlus width={18} height={18} />
                  </button>
                </div>
                <span className="w-20 text-right font-semibold">{euro(p.preis * menge)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="buehne self-start p-6">
        <h2 className="heading-m">Zusammenfassung</h2>
        <dl className="mt-4 space-y-2">
          <div className="flex justify-between"><dt>Zwischensumme</dt><dd className="font-semibold">{euro(zwischen)}</dd></div>
          {rabatt > 0 && <div className="flex justify-between"><dt>Mitgliederrabatt 10 %</dt><dd className="font-semibold">− {euro(rabatt)}</dd></div>}
          <div className="flex justify-between gap-4 text-muted"><dt>{lieferziel ? `Lieferung an ${lieferziel}` : "Abholung in der Halle"}</dt><dd className="shrink-0">0 €</dd></div>
          <div className="flex justify-between border-t border-line pt-3 text-lg"><dt className="font-semibold">Gesamt</dt><dd className="font-display text-3xl">{euro(summe)}</dd></div>
        </dl>
        <p className="mt-1 text-[13px] text-muted">inkl. MwSt. · <Beispiel>Beispielpreise</Beispiel></p>
        <button
          type="button" className="btn btn-primary mt-6 w-full"
          onClick={async () => {
            const ergebnis = await starteCheckout(zeilen);
            if (ergebnis.checkoutUrl) { window.location.href = ergebnis.checkoutUrl; return; }
            // Demo: Der Kauf wird wie nach einem echten Shopify-Checkout ins Projekt-Budget eingetragen.
            const z = rolle && rolle !== "gast" ? getKonto() : null;
            const projekt = z?.projekte.find((p) => p.fahrzeugId === z.aktivesFahrzeugId);
            if (projekt && posten.length > 0) {
              budgetEintragen(projekt.id, {
                phase: projekt.aktivePhase, datum: isoHeute(), haendler: "Camp & Camper Fachshop", betrag: summe, quelle: "shop",
                positionen: posten.map((p) => ({ name: `${p.menge} × ${p.produkt.titel}`, betrag: Math.round(p.produkt.preis * p.menge * (rabatt > 0 ? 1 - ABO.shopRabatt : 1) * 100) / 100 })),
              });
              warenkorb.leeren();
              warenkorb.lieferung(null);
              setHinweis("budget");
            } else setHinweis("demo");
          }}
        >
          Zur Kasse
        </button>
        {hinweis && (
          <p className="einblenden mt-4 border border-line p-3 text-[15px]" role="status">
            Hier endet die Demo. Später geht es an dieser Stelle in den sicheren Checkout von Shopify – mit allen Zahlungsarten.
            {hinweis === "budget" && <> Der Betrag steht jetzt automatisch in deinem <Link href="/mein-camp/projekt" className="font-semibold underline underline-offset-4">Projekt-Budget</Link>.</>}
          </p>
        )}
        <button type="button" className="btn btn-ghost mt-2 w-full" onClick={() => warenkorb.leeren()}>Warenkorb leeren</button>
      </aside>
    </div>
  );
}
