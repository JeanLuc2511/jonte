"use client";

import Link from "next/link";
import {
  aboZahlen, auslastung, belegtAm, dauerText, monatsGrenzen, offeneHilferufe, supportKennzahlen, umsatz, unbeantwortet, wochenGrenzen, wunschAuswertung,
} from "@/lib/camp/auswertung";
import { euro, formatKurz, formatLang, plusTage } from "@/lib/datum";
import { belegungAus, belegungImZeitraum } from "@/lib/services/buchung";
import { hilferufErledigen } from "@/lib/services/cockpit";
import { Beispiel } from "../Bausteine";
import { IconPfeil } from "../Icons";
import { VanSeite } from "../Van";
import { Hallenplan } from "../werkstatt/Hallenplan";
import { CKopf, Kachel, useCockpit, vorMin } from "./Teile";

export function Uebersicht() {
  const c = useCockpit();
  if (!c) return null;
  const { camp, konto, heute, akten, faelle } = c;

  const buchten = camp.zonen.filter((z) => z.typ === "bucht");
  const heuteDa = belegtAm(camp, heute);
  const gesperrt = camp.sperrzeiten.filter((s) => s.von <= heute && s.bis >= heute).flatMap((s) => s.buchtIds);
  const rufe = offeneHilferufe(faelle);
  const name = (id: string) => akten.find((a) => a.mitglied.id === id)?.mitglied.vorname ?? "Mitglied";
  const wartend = faelle.filter(unbeantwortet);
  const vorschlaege = konto.events.filter((e) => e.status === "vorgeschlagen");
  const neueWuensche = wunschAuswertung(camp, konto).filter((g) => g.status === "neu");
  const neueAnfragen = camp.anfragen.filter((a) => a.status === "neu");
  const bald = plusTage(heute, 7);
  const termine = [
    ...camp.workshops.filter((w) => !w.abgesagt && w.datum >= heute && w.datum <= plusTage(heute, 14)).map((w) => ({ id: w.id, datum: w.datum, titel: w.titel, info: `Workshop · ${w.zeit} · ${w.angemeldet}/${w.maxTeilnehmer} dabei${w.angemeldet < w.minTeilnehmer ? ` · noch ${w.minTeilnehmer - w.angemeldet} bis zur Mindestzahl` : ""}`, href: "/cockpit/workshops" })),
    ...konto.events.filter((e) => e.status === "freigegeben" && e.datum >= heute && e.datum <= bald).map((e) => ({ id: e.id, datum: e.datum, titel: e.titel, info: `Event · ${e.von} Uhr · ${e.ort} · ${e.angemeldet}/${e.maxPersonen}`, href: "/cockpit/workshops" })),
  ].sort((a, b) => a.datum.localeCompare(b.datum));

  const [wVon, wBis] = wochenGrenzen(heute);
  const [mVon, mBis] = monatsGrenzen(heute);
  const aWoche = auslastung(camp, wVon, wBis);
  const aMonat = auslastung(camp, mVon, mBis);
  const abos = aboZahlen(akten);
  const support = supportKennzahlen(faelle);
  const anmeldungen = camp.workshops.filter((w) => !w.abgesagt && w.datum >= heute).reduce((s, w) => s + w.angemeldet, 0);

  const aufgaben = [
    { zahl: rufe.length, text: "Hilferufe aus der Halle", href: "/cockpit/support", dringend: true },
    { zahl: wartend.length, text: "Support-Nachrichten warten auf Antwort", href: "/cockpit/support" },
    { zahl: vorschlaege.length, text: vorschlaege.length === 1 ? `Event-Vorschlag zur Freigabe: ${vorschlaege[0].titel}` : "Event-Vorschläge zur Freigabe", href: "/cockpit/workshops" },
    { zahl: neueWuensche.length, text: "neue Werkzeugwünsche", href: "/cockpit/werkzeug" },
    { zahl: neueAnfragen.filter((a) => a.art === "warteliste").length, text: "neue Einträge auf der Warteliste", href: "/cockpit/anfragen" },
    { zahl: neueAnfragen.filter((a) => a.art === "kontakt").length, text: "neue Kontaktanfragen", href: "/cockpit/anfragen" },
  ].filter((a) => a.zahl > 0);

  return (
    <>
      <CKopf titel="Moin, Seb."><p>{formatLang(heute)} · {heuteDa.length} von {buchten.length} Werkstattbuchten belegt</p></CKopf>

      {/* Hilferufe: immer ganz oben */}
      {rufe.map(({ mitgliedId, nachricht }) => (
        <section key={nachricht.id} className="buehne mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between lg:p-5" role="alert">
          <div>
            <span className="badge">Hilferuf · {vorMin(nachricht.zeit)}</span>
            <h2 className="heading-m mt-2">{camp.zonen.find((z) => z.id === nachricht.buchtId)?.name ?? "Halle"}: {name(mitgliedId)} kommt nicht weiter</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={() => hilferufErledigen(mitgliedId, nachricht.id)}>Ich komme</button>
            <Link href={`/cockpit/support?mitglied=${mitgliedId}`} className="btn btn-outline">Zum Chat</Link>
          </div>
        </section>
      ))}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* Heute in der Halle */}
        <section className="karte p-4 lg:p-5">
          <h2 className="heading-m">Heute in der Halle</h2>
          <div className="mt-4 border border-line max-md:hidden">
            <Hallenplan zonen={camp.zonen} belegt={belegungImZeitraum(belegungAus(camp), heute, heute)} zeigeFrei className="block h-auto w-full" />
          </div>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {buchten.map((z) => {
              const b = heuteDa.find((x) => x.buchtId === z.id);
              const ruf = rufe.some((r) => r.nachricht.buchtId === z.id);
              return (
                <li key={z.id} className="flex items-center gap-3 py-3">
                  <span className="w-10 shrink-0 font-display text-2xl text-display">{z.kurz}</span>
                  {b ? (
                    <>
                      <VanSeite farbe={b.fahrzeug.farbe} className="w-16 shrink-0 max-xs:hidden" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{b.fahrzeug.spitzname} · {b.kunde.name}</span>
                        <span className="block truncate text-[14px] text-muted">{b.fahrzeug.modell}{b.phase ? ` · ${b.phase}` : ""} · bis {formatKurz(b.bis)}</span>
                      </span>
                      {ruf && <span className="badge shrink-0">Hilferuf</span>}
                    </>
                  ) : (
                    <span className="flex-1 text-muted">{gesperrt.includes(z.id) ? "Gesperrt" : "Frei"}</span>
                  )}
                </li>
              );
            })}
          </ul>
          <Link href="/cockpit/buchungen" className="btn btn-ghost">Zum Belegungskalender <IconPfeil width={18} height={18} /></Link>
        </section>

        <div className="space-y-5">
          {/* Zu erledigen */}
          <section className="karte p-4 lg:p-5">
            <h2 className="heading-m">Zu erledigen</h2>
            {aufgaben.length === 0 && <p className="mt-3 text-muted">Alles erledigt. Zeit für einen Kaffee in der Lounge.</p>}
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {aufgaben.map((a) => (
                <li key={a.text}>
                  <Link href={a.href} className="flex min-h-12 items-center gap-3 py-2 hover:text-display">
                    <span className={`flex h-8 min-w-8 shrink-0 items-center justify-center px-1 font-display text-xl ${a.dringend ? "bg-gelb text-pflaume" : "border border-line-strong text-display"}`}>{a.zahl}</span>
                    <span className="flex-1">{a.text}</span>
                    <IconPfeil width={18} height={18} className="shrink-0 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Anstehend */}
          <section className="karte p-4 lg:p-5">
            <h2 className="heading-m">Workshops und Events</h2>
            {termine.length === 0 && <p className="mt-3 text-muted">In den nächsten Tagen steht nichts an.</p>}
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {termine.map((t) => (
                <li key={t.id}>
                  <Link href={t.href} className="block py-2.5 hover:text-display">
                    <span className="label text-muted">{t.datum === heute ? "Heute" : formatLang(t.datum)}</span>
                    <span className="block font-semibold">{t.titel}</span>
                    <span className="block text-[14px] text-muted">{t.info}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* Kennzahlen */}
      <section className="mt-8">
        <h2 className="heading-m">Kennzahlen <Beispiel>Beispielwerte</Beispiel></h2>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
          <Kachel label="Auslastung diese Woche" wert={`${Math.round(aWoche * 100)} %`} anteil={aWoche} hinweis={`${formatKurz(wVon)} – ${formatKurz(wBis)}`} />
          <Kachel label="Auslastung im Monat" wert={`${Math.round(aMonat * 100)} %`} anteil={aMonat} hinweis="alle Werkstattbuchten" />
          <Kachel label="Umsatz Buchungen" wert={euro(umsatz(camp, mVon, mBis))} hinweis="Buchungen mit Start in diesem Monat" />
          <Kachel label="Abos aktiv" wert={abos.aktiv} hinweis={`${abos.pausiert} pausiert · ${abos.gekuendigt} gekündigt · ${abos.konto} kostenlose Konten`} />
          <Kachel label="Workshop-Anmeldungen" wert={anmeldungen} hinweis="für kommende Termine" />
          <Kachel label="Antwortzeit Support" wert={dauerText(support.mittlereAntwortzeitMin)} hinweis={`${support.anfragen} Anfragen · ${support.wartend} warten`} />
        </div>
      </section>
    </>
  );
}
