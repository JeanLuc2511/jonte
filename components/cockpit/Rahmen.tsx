"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { offeneHilferufe, unbeantwortet, wunschAuswertung } from "@/lib/camp/auswertung";
import { setAlsSeb, useAdmin } from "@/lib/camp/store";
import { darf, type Recht } from "@/lib/rechte";
import {
  IconChat, IconEuro, IconFenster, IconHalle, IconKalender, IconKonto, IconKorb, IconLeute, IconListe, IconMenue, IconSchloss, IconWerkzeug, IconZu,
} from "../Icons";
import { useCockpit } from "./Teile";

const NAV: { href: string; label: string; kurz: string; icon: typeof IconChat; recht: Recht; zahl?: string }[] = [
  { href: "/cockpit", label: "Heute in der Halle", kurz: "Heute", icon: IconHalle, recht: "cockpit" },
  { href: "/cockpit/support", label: "Support-Postfach", kurz: "Support", icon: IconChat, recht: "support.antworten", zahl: "support" },
  { href: "/cockpit/buchungen", label: "Buchungen", kurz: "Buchungen", icon: IconKalender, recht: "buchungen.verwalten" },
  { href: "/cockpit/halle", label: "Halle & Preise", kurz: "Halle", icon: IconFenster, recht: "halle.pflegen" },
  { href: "/cockpit/workshops", label: "Workshops & Events", kurz: "Workshops", icon: IconLeute, recht: "workshops.verwalten", zahl: "events" },
  { href: "/cockpit/mitglieder", label: "Mitglieder & Abos", kurz: "Mitglieder", icon: IconKonto, recht: "mitglieder.sehen" },
  { href: "/cockpit/werkzeug", label: "Werkzeugwünsche", kurz: "Wünsche", icon: IconWerkzeug, recht: "werkzeug.auswertung", zahl: "wuensche" },
  { href: "/cockpit/inhalte", label: "Inhalte & Medien", kurz: "Inhalte", icon: IconListe, recht: "inhalte.pflegen" },
  { href: "/cockpit/anfragen", label: "Warteliste & Anfragen", kurz: "Anfragen", icon: IconEuro, recht: "anfragen.verwalten", zahl: "anfragen" },
  { href: "/cockpit/shop", label: "Shop", kurz: "Shop", icon: IconKorb, recht: "shop.ueberblick" },
];

export function CockpitRahmen({ children }: { children: React.ReactNode }) {
  const pfad = usePathname();
  const admin = useAdmin();
  const c = useCockpit();
  const [mehr, setMehr] = useState<string | null>(null);

  if (admin === null || !c) return <div className="seite py-24 text-muted" aria-busy="true">Cockpit wird geladen …</div>;

  if (!admin) {
    return (
      <section className="buehne">
        <div className="seite py-16 lg:py-24">
          <IconSchloss width={40} height={40} />
          <p className="eyebrow mt-6">Camp-Cockpit</p>
          <h1 className="display-xl mt-6">Nur fürs Camp-Team</h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Hier hat Seb alles im Blick, was in der Halle, auf der Website und im Mitgliederbereich passiert, und pflegt alle Inhalte selbst. Der Zugang braucht die Rolle Admin. In der Demo gibt es dafür einen Schalter.
          </p>
          <button type="button" className="btn btn-primary mt-8" onClick={() => setAlsSeb(true)}>Als Seb ansehen</button>
        </div>
      </section>
    );
  }

  const rolle = "admin" as const;
  const zahlen: Record<string, number> = {
    support: offeneHilferufe(c.faelle).length + c.faelle.filter(unbeantwortet).length,
    events: c.konto.events.filter((e) => e.status === "vorgeschlagen").length,
    wuensche: wunschAuswertung(c.camp, c.konto).filter((g) => g.status === "neu").length,
    anfragen: c.camp.anfragen.filter((a) => a.status === "neu").length,
  };
  const eintraege = NAV.filter((n) => darf(rolle, n.recht));
  const aktiv = (href: string) => (href === "/cockpit" ? pfad === href : pfad.startsWith(href));
  const offen = mehr === pfad;
  const punkt = (n: (typeof NAV)[number]) => {
    const z = n.zahl ? zahlen[n.zahl] : 0;
    return z > 0 ? <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gelb px-1 font-condensed text-[12px] font-bold text-pflaume" aria-label={`${z} offen`}>{z}</span> : null;
  };

  return (
    <div className="seite grid gap-8 pb-28 pt-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 lg:py-10">
      {/* Seitenleiste ab Laptop */}
      <aside className="max-lg:hidden lg:sticky lg:top-32 lg:self-start">
        <div className="karte p-4">
          <p className="heading-s">Seb</p>
          <p className="label mt-1 text-accent">Camp-Team · Admin</p>
        </div>
        <nav aria-label="Cockpit" className="mt-4">
          <ul>
            {eintraege.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={aktiv(n.href) ? "page" : undefined} className={`flex min-h-11 items-center gap-3 border-b border-line px-2 py-2.5 font-condensed text-[15px] font-semibold uppercase tracking-[0.06em] hover:text-display ${aktiv(n.href) ? "bg-surface-strong text-display" : ""}`}>
                  <n.icon width={20} height={20} className="shrink-0" />
                  <span className="flex-1">{n.label}</span>
                  {punkt(n)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="min-w-0">{children}</div>

      {/* Tablet und Handy: Leiste unten, mit dem Daumen erreichbar */}
      <nav aria-label="Cockpit" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-dunkel lg:hidden">
        {offen && (
          <ul className="grid max-h-[60dvh] grid-cols-2 gap-px overflow-y-auto border-b border-line bg-line sm:grid-cols-3">
            {eintraege.map((n) => (
              <li key={n.href}>
                <Link href={n.href} onClick={() => setMehr(null)} className={`flex min-h-14 items-center gap-3 bg-dunkel px-4 font-condensed text-[15px] font-semibold uppercase tracking-[0.06em] ${aktiv(n.href) ? "text-display" : ""}`}>
                  <n.icon width={20} height={20} className="shrink-0" /><span className="flex-1">{n.label}</span>{punkt(n)}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <ul className="mx-auto grid max-w-2xl grid-cols-4">
          {eintraege.slice(0, 3).map((n) => (
            <li key={n.href}>
              <Link href={n.href} aria-current={aktiv(n.href) ? "page" : undefined} onClick={() => setMehr(null)} className={`relative flex min-h-16 flex-col items-center justify-center gap-1 font-condensed text-[12px] font-bold uppercase tracking-[0.08em] ${aktiv(n.href) && !offen ? "text-display" : "text-muted"}`}>
                <n.icon width={22} height={22} />{n.kurz}
                <span className="absolute right-[22%] top-2">{punkt(n)}</span>
              </Link>
            </li>
          ))}
          <li>
            <button type="button" aria-expanded={offen} onClick={() => setMehr(offen ? null : pfad)} className={`relative flex min-h-16 w-full flex-col items-center justify-center gap-1 font-condensed text-[12px] font-bold uppercase tracking-[0.08em] ${offen || !eintraege.slice(0, 3).some((n) => aktiv(n.href)) ? "text-display" : "text-muted"}`}>
              {offen ? <IconZu width={22} height={22} /> : <IconMenue width={22} height={22} />}Mehr
              {!offen && zahlen.events + zahlen.wuensche + zahlen.anfragen > 0 && <span className="absolute right-[26%] top-3 h-2.5 w-2.5 rounded-full bg-gelb" aria-label="Offenes in weiteren Bereichen" />}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
