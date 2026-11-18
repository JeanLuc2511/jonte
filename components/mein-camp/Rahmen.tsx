"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ROLLEN_NAME, darf, type Recht } from "@/lib/rechte";
import { useKonto, useRolle } from "@/lib/mein-camp/store";
import { demoAnsicht, kontoAnlegen } from "@/lib/services/mitglieder";
import { IconChat, IconEuro, IconHalle, IconKonto, IconLeute, IconListe, IconSchloss, IconStern, IconWerkzeug } from "../Icons";
import { VanSeite } from "../Van";
import { StufenVergleich } from "./Teile";

const NAV: { href: string; label: string; icon: typeof IconChat; recht?: Recht }[] = [
  { href: "/mein-camp", label: "Übersicht", icon: IconHalle },
  { href: "/mein-camp/garage", label: "Meine Garage", icon: IconKonto },
  { href: "/mein-camp/projekt", label: "Projekt", icon: IconListe },
  { href: "/mein-camp/support", label: "Support von Seb", icon: IconChat, recht: "support" },
  { href: "/mein-camp/community", label: "Community", icon: IconLeute },
  { href: "/mein-camp/werkzeugwuensche", label: "Werkzeugwünsche", icon: IconWerkzeug, recht: "werkzeug.wuenschen" },
  { href: "/mein-camp/mitgliedschaft", label: "Mitgliedschaft", icon: IconStern },
];

export function Rahmen({ children }: { children: React.ReactNode }) {
  const pfad = usePathname();
  const z = useKonto();
  const rolle = useRolle();

  if (!z || !rolle) {
    return <div className="seite py-24 text-muted" aria-busy="true">Mein Camp wird geladen …</div>;
  }
  if (rolle === "gast") return <Einladung />;

  const fahrzeug = z.fahrzeuge.find((f) => f.id === z.aktivesFahrzeugId);
  const ungelesen = z.benachrichtigungen.filter((n) => !n.gelesen).length;

  return (
    <div className="seite grid gap-8 py-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12 lg:py-12">
      <aside className="min-w-0 lg:sticky lg:top-32 lg:self-start">
        <div className="karte flex items-center gap-4 p-4 max-lg:hidden">
          <div className="w-20 shrink-0">{fahrzeug ? <VanSeite farbe={fahrzeug.farbe} className="w-full" /> : <IconKonto width={40} height={40} />}</div>
          <div className="min-w-0">
            <p className="heading-s truncate">{z.mitglied.vorname}</p>
            <p className="label mt-1 text-accent">{ROLLEN_NAME[rolle]}</p>
          </div>
        </div>
        <nav aria-label="Mein Camp" className="lg:mt-4">
          <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:-mx-10 md:px-10 lg:mx-0 lg:flex-col lg:gap-0 lg:px-0">
            {NAV.map((n) => {
              const aktiv = n.href === "/mein-camp" ? pfad === n.href : pfad.startsWith(n.href);
              const gesperrt = n.recht && !darf(rolle, n.recht);
              return (
                <li key={n.href} className="shrink-0">
                  <Link
                    href={n.href} aria-current={aktiv ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-3 whitespace-nowrap border px-3 font-condensed text-[15px] font-semibold uppercase tracking-[0.06em] transition-colors lg:border-0 lg:border-b lg:border-line lg:px-2 lg:py-3 ${aktiv ? "border-line-strong bg-surface-strong text-display" : "border-line text-ink hover:text-display"}`}
                  >
                    <n.icon width={20} height={20} className="shrink-0 max-lg:hidden" />
                    <span className="flex-1">{n.label}</span>
                    {gesperrt && <IconSchloss width={16} height={16} className="text-muted" aria-label="nur für Mitglieder" />}
                    {n.href === "/mein-camp" && ungelesen > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gelb px-1 text-[12px] font-bold text-pflaume" aria-label={`${ungelesen} neue Nachrichten`}>{ungelesen}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {rolle === "konto" && (
          <Link href="/mein-camp/mitgliedschaft" className="mt-4 flex items-center gap-3 border border-line-strong p-3 text-[15px] hover:bg-surface-strong max-lg:hidden">
            <IconEuro className="shrink-0 text-display" />
            <span>Werkzeug inklusive und Support von Seb: <strong className="text-display">Mitglied werden</strong></span>
          </Link>
        )}
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Was Gäste sehen: Konto anlegen oder das Beispiel-Mitglied ansehen. */
function Einladung() {
  const [vorname, setVorname] = useState("");
  const [email, setEmail] = useState("");
  const gueltig = vorname.trim() && /^\S+@\S+\.\S+$/.test(email);
  return (
    <>
      <section className="buehne">
        <div className="seite grid gap-10 py-14 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:py-20">
          <div>
            <p className="eyebrow">Mein Camp</p>
            <h1 className="display-xl mt-6">Dein Ausbau an einem Ort</h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              Fahrzeug anlegen, Projekt planen, Bautagebuch führen, Hilfe finden und zu Events kommen. Das Konto ist kostenlos. Als Mitglied ist das Werkzeug inklusive und Seb hilft dir persönlich.
            </p>
            <ul className="mt-6 space-y-2 text-lg">
              {["Meine Garage: Der Shop zeigt nur, was in dein Fahrzeug passt", "Projekt-Planer mit Checklisten, Stückliste und Budget", "Events und Hilfe-Börse der Community"].map((t) => (
                <li key={t} className="flex gap-3"><span aria-hidden="true">–</span>{t}</li>
              ))}
            </ul>
          </div>
          <form
            className="self-start border border-line-strong p-6"
            onSubmit={(e) => { e.preventDefault(); if (gueltig) kontoAnlegen({ vorname: vorname.trim(), email }); }}
          >
            <h2 className="heading-m">Kostenloses Konto anlegen</h2>
            <label className="mt-5 block"><span className="feld-label">Vorname</span>
              <input className="feld" value={vorname} onChange={(e) => setVorname(e.target.value)} autoComplete="given-name" />
            </label>
            <label className="mt-4 block"><span className="feld-label">E-Mail</span>
              <input className="feld" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </label>
            <button type="submit" className="btn btn-primary mt-6 w-full" disabled={!gueltig}>Konto anlegen</button>
            <p className="mt-3 text-[14px] text-muted">Demo: Es wird nichts verschickt, das Konto lebt nur in deinem Browser.</p>
            <button type="button" className="btn btn-outline mt-5 w-full" onClick={() => demoAnsicht("mitglied")}>Beispiel-Mitglied ansehen</button>
          </form>
        </div>
      </section>
      <section className="seite abschnitt">
        <h2 className="heading-l mb-6">Drei Stufen, klar getrennt</h2>
        <StufenVergleich aktuelle="gast" />
      </section>
    </>
  );
}
