"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAVIGATION } from "@/lib/daten/site";
import { useWarenkorb } from "@/lib/warenkorb";
import { IconKonto, IconKorb, IconMenue, IconZu } from "./Icons";
import { DemoSchalter } from "./mein-camp/DemoSchalter";
import { useKonto, useRolle } from "@/lib/mein-camp/store";
import { useAdmin } from "@/lib/camp/store";
import { Logo } from "./Logo";

export function Header() {
  const pfad = usePathname();
  const [offenAuf, setOffenAuf] = useState<string | null>(null);
  const offen = offenAuf === pfad;
  const { anzahl } = useWarenkorb();
  const konto = useKonto();
  const rolle = useRolle();
  const admin = useAdmin();
  // Die Warteliste ist ein ruhiger Vollbild-Dialog ohne Navigation.
  const schlicht = pfad === "/warteliste";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-dunkel">
      <div className="border-b border-line">
        <div className="seite flex min-h-10 items-center justify-between gap-3 py-1 font-condensed text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
          <p className="whitespace-nowrap">Vision-Demo <span className="max-xl:hidden">· Inhalte, Preise und Hallenplan sind Beispiele</span></p>
          <DemoSchalter />
        </div>
      </div>
      <div className="seite flex h-[68px] items-center justify-between gap-4">
        <Logo />
        {!schlicht && (
          <nav aria-label="Hauptnavigation" className="hidden items-center gap-7 lg:flex">
            {NAVIGATION.map((n) => {
              const aktiv = pfad.startsWith(n.href);
              return (
                <Link
                  key={n.href} href={n.href} aria-current={aktiv ? "page" : undefined}
                  className={`font-condensed text-[15px] font-semibold uppercase tracking-[0.1em] underline-offset-8 hover:text-display hover:underline ${aktiv ? "text-display underline" : "text-ink"}`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        )}
        <div className="flex items-center gap-2">
          {schlicht ? (
            <Link href="/" className="btn btn-ghost btn-klein">Zurück zur Seite</Link>
          ) : (
            <>
              <Link
                href="/warenkorb" aria-label={`Warenkorb, ${anzahl} Artikel`}
                className="relative flex h-11 w-11 items-center justify-center text-ink hover:text-display"
              >
                <IconKorb />
                {anzahl > 0 && (
                  <span className="absolute right-0 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gelb px-1 font-condensed text-[12px] font-bold text-pflaume">
                    {anzahl}
                  </span>
                )}
              </Link>
              {admin && (
                <Link href="/cockpit" className={`flex h-11 items-center px-2 font-condensed text-[15px] font-semibold uppercase tracking-[0.08em] hover:text-display ${pfad.startsWith("/cockpit") ? "text-display" : "text-ink"}`}>
                  Cockpit
                </Link>
              )}
              <Link
                href="/mein-camp" aria-label="Mein Camp"
                className={`flex h-11 items-center gap-2 px-2 font-condensed text-[15px] font-semibold uppercase tracking-[0.08em] hover:text-display ${pfad.startsWith("/mein-camp") ? "text-display" : "text-ink"}`}
              >
                <IconKonto />
                <span className="max-xl:hidden">{rolle && rolle !== "gast" && konto ? konto.mitglied.vorname : "Mein Camp"}</span>
              </Link>
              <Link href="/buchen" className="btn btn-primary btn-klein max-sm:hidden">Buchen</Link>
              <button
                type="button" className="flex h-11 w-11 items-center justify-center text-ink lg:hidden"
                aria-expanded={offen} aria-controls="mobil-menue"
                aria-label={offen ? "Menü schließen" : "Menü öffnen"}
                onClick={() => setOffenAuf(offen ? null : pfad)}
              >
                {offen ? <IconZu /> : <IconMenue />}
              </button>
            </>
          )}
        </div>
      </div>
      {offen && (
        <div id="mobil-menue" className="absolute inset-x-0 top-full h-[calc(100dvh-100%)] overflow-y-auto border-t border-line bg-dunkel lg:hidden">
          <nav aria-label="Hauptnavigation mobil" className="seite flex flex-col py-6">
            {NAVIGATION.map((n) => (
              <Link
                key={n.href} href={n.href} onClick={() => setOffenAuf(null)}
                className="border-b border-line py-4 font-display text-4xl uppercase text-display"
              >
                {n.label}
              </Link>
            ))}
            <Link href="/mein-camp" onClick={() => setOffenAuf(null)} className="border-b border-line py-4 font-display text-4xl uppercase text-display">
              Mein Camp
            </Link>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link href="/buchen" onClick={() => setOffenAuf(null)} className="btn btn-primary">Werkstattbucht buchen</Link>
              <Link href="/warteliste" onClick={() => setOffenAuf(null)} className="btn btn-outline">Zur Warteliste</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
