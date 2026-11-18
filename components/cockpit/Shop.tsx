"use client";

import { euro, formatLang } from "@/lib/datum";
import { Beispiel } from "../Bausteine";
import { CKopf, Kachel, useCockpit } from "./Teile";

const STATUS = { offen: "Offen", abholbereit: "Abholbereit", versendet: "Versendet" } as const;

/** Nur ein Überblick: Produkte, Lager und Bestellungen pflegt Seb im Shopify-Admin. */
export function Shop() {
  const c = useCockpit();
  if (!c) return null;
  const { shop } = c.camp;
  const offen = shop.filter((b) => b.status === "offen");
  const anBucht = shop.filter((b) => b.lieferungAnBucht && b.status !== "versendet");
  return (
    <>
      <CKopf titel="Shop" aktion={<a href="https://admin.shopify.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Zum Shopify-Admin</a>}>
        <p>Produkte, Lager und Bestellungen pflegst du im Shopify-Admin. Hier siehst du nur, was für die Halle wichtig ist. <Beispiel>Beispielbestellungen</Beispiel></p>
      </CKopf>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Kachel label="Offene Bestellungen" wert={offen.length} hinweis={euro(offen.reduce((s, b) => s + b.summe, 0))} />
        <Kachel label="Lieferungen an die Bucht" wert={anBucht.length} hinweis="Material bereitstellen" />
        <Kachel label="Abholbereit am Empfang" wert={shop.filter((b) => b.status === "abholbereit" && !b.lieferungAnBucht).length} />
      </div>
      <h2 className="heading-m">An die Werkstattbucht zu liefern</h2>
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {anBucht.map((b) => (
          <li key={b.nummer} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <span><strong className="font-semibold">{b.lieferungAnBucht}</strong> · {b.kunde}<span className="block text-[15px] text-muted">Bestellung {b.nummer} · {formatLang(b.datum)} · {euro(b.summe)}</span></span>
            <span className={`badge ${b.status === "abholbereit" ? "badge-live" : ""}`}>{b.status === "abholbereit" ? "Steht bereit" : "Noch packen"}</span>
          </li>
        ))}
        {anBucht.length === 0 && <li className="py-3 text-muted">Gerade nichts.</li>}
      </ul>
      <h2 className="heading-m mt-8">Letzte Bestellungen</h2>
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {shop.map((b) => (
          <li key={b.nummer} className="flex flex-wrap items-center justify-between gap-3 py-3 text-[15px]">
            <span><strong className="font-semibold">{b.nummer}</strong> · {b.kunde} <span className="text-muted">· {formatLang(b.datum)}</span></span>
            <span className="flex items-center gap-4"><span className="text-muted">{STATUS[b.status]}</span><span className="w-20 text-right font-semibold">{euro(b.summe)}</span></span>
          </li>
        ))}
      </ul>
    </>
  );
}
