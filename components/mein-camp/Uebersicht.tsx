"use client";

import { usePhasen, usePreise } from "@/lib/camp/store";
import Link from "next/link";
import { useState } from "react";
import { euro, formatKurz, formatLang, isoHeute } from "@/lib/datum";
import { useKonto, useRolle } from "@/lib/mein-camp/store";
import { darf } from "@/lib/rechte";
import { benachrichtigungenGelesen, hilferuf, laufendeBuchung } from "@/lib/services/mitglieder";
import { IconGlocke, IconPfeil } from "../Icons";
import { VanSeite } from "../Van";
import { BereichKopf } from "./Teile";

export function Uebersicht() {
  const ABO = usePreise();
  const PHASEN = usePhasen();
  const phase = (id: string) => PHASEN.find((p) => p.id === id);
  const z = useKonto();
  const rolle = useRolle();
  const [gerufen, setGerufen] = useState(false);
  if (!z || !rolle) return null;

  const heute = isoHeute();
  const fahrzeug = z.fahrzeuge.find((f) => f.id === z.aktivesFahrzeugId);
  const projekt = z.projekte.find((p) => p.fahrzeugId === z.aktivesFahrzeugId);
  const vorlage = projekt ? phase(projekt.aktivePhase) : undefined;
  const erledigt = projekt && vorlage ? (projekt.erledigt[vorlage.id] ?? []).length : 0;
  const naechster = projekt && vorlage ? vorlage.checkliste.find((_, i) => !(projekt.erledigt[vorlage.id] ?? []).includes(i)) : undefined;
  const ausgegeben = projekt ? projekt.budget.reduce((s, b) => s + b.betrag, 0) : 0;
  const geplant = projekt ? Object.values(projekt.budgetGeplant).reduce((s, b) => s + b, 0) : 0;
  const laeuft = laufendeBuchung(z, heute);
  const kommend = z.buchungen.filter((b) => b.bis >= heute).sort((a, b) => a.von.localeCompare(b.von));
  const events = z.events.filter((e) => e.status === "freigegeben" && e.datum >= heute).slice(0, 2);
  const ungelesen = z.benachrichtigungen.some((n) => !n.gelesen);

  return (
    <>
      <BereichKopf eyebrow="Mein Camp" titel={`Moin, ${z.mitglied.vorname}.`}>
        {projekt && vorlage
          ? <p>Du steckst mitten in der Phase {vorlage.name}. {naechster ? <>Als Nächstes: {naechster}.</> : "Die Checkliste ist durch – Zeit für die nächste Phase."}</p>
          : <p>Leg dein Fahrzeug an, dann richtet sich hier alles nach deinem Ausbau.</p>}
      </BereichKopf>

      {laeuft && (
        <section className="buehne mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between lg:p-6">
          <div>
            <span className="badge badge-live">Du bist gerade in der Halle</span>
            <h2 className="heading-m mt-3">{laeuft.titel} · noch bis {formatLang(laeuft.bis)}</h2>
            <p className="mt-1 text-muted">
              {darf(rolle, "werkzeug.inklusive") ? "Werkzeug ist für dich inklusive." : `Werkzeugpauschale ${euro(ABO.werkzeugpauschaleProTag)} pro Tag – als Mitglied inklusive.`}
            </p>
          </div>
          {darf(rolle, "support") ? (
            gerufen || z.support.some((n) => n.art === "hilferuf" && n.erledigt === false)
              ? <p className="max-w-xs font-semibold" role="status">Dein Hilferuf ist bei Seb angekommen.</p>
              : <button type="button" className="btn btn-primary shrink-0" onClick={() => { hilferuf(); setGerufen(true); }}>Ich komm nicht weiter</button>
          ) : (
            <Link href="/mein-camp/support" className="btn btn-outline shrink-0">Hilfe von Seb holen</Link>
          )}
        </section>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Fahrzeug */}
        <section className="karte flex flex-col p-5">
          <p className="label text-muted">Aktives Fahrzeug</p>
          {fahrzeug ? (
            <>
              <VanSeite farbe={fahrzeug.farbe} className="mx-auto mt-3 w-full max-w-[240px]" />
              <h2 className="heading-m mt-3">{fahrzeug.spitzname}</h2>
              <p className="text-muted">{fahrzeug.hersteller} {fahrzeug.modell}</p>
              <p className="text-[15px] text-muted">{[fahrzeug.radstand, fahrzeug.dachhoehe].filter(Boolean).join("")} · {String(fahrzeug.laengeM).replace(".", ",")} m{fahrzeug.baujahr ? ` · Baujahr ${fahrzeug.baujahr}` : ""}</p>
            </>
          ) : <p className="mt-3 text-muted">Noch kein Fahrzeug angelegt.</p>}
          <Link href="/mein-camp/garage" className="btn btn-ghost mt-auto self-start pt-4">{fahrzeug ? "Zur Garage" : "Fahrzeug anlegen"} <IconPfeil width={18} height={18} /></Link>
        </section>

        {/* Projekt */}
        <section className="karte flex flex-col p-5 xl:col-span-2">
          <p className="label text-muted">Projekt</p>
          {projekt && vorlage ? (
            <>
              <h2 className="heading-m mt-2">{projekt.titel}</h2>
              <ol className="mt-5 grid grid-cols-6 gap-1" aria-label="Phasen">
                {PHASEN.map((p, i) => {
                  const idx = PHASEN.findIndex((x) => x.id === projekt.aktivePhase);
                  return (
                    <li key={p.id}>
                      <span className={`block h-2 ${i < idx ? "bg-gelb" : i === idx ? "bg-lila-hell" : "bg-surface-strong"}`} />
                      <span className={`mt-2 block font-condensed text-[12px] font-bold uppercase tracking-wide max-sm:sr-only ${i === idx ? "text-display" : "text-muted"}`}>{p.name}</span>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[15px] text-muted">Checkliste {vorlage.name}</p>
                  <p className="font-display text-4xl text-display">{erledigt} / {vorlage.checkliste.length}</p>
                </div>
                <div>
                  <p className="text-[15px] text-muted">Budget gesamt · privat</p>
                  <p><span className="font-display text-4xl text-display">{euro(Math.round(ausgegeben))}</span> <span className="text-muted">von {euro(geplant)}</span></p>
                </div>
              </div>
              <Link href="/mein-camp/projekt" className="btn btn-ghost mt-auto self-start pt-4">Weiter im Projekt <IconPfeil width={18} height={18} /></Link>
            </>
          ) : <p className="mt-3 text-muted">Sobald ein Fahrzeug in deiner Garage steht, startet hier dein Projekt.</p>}
        </section>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Benachrichtigungen */}
        <section className="karte p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="heading-s flex items-center gap-2"><IconGlocke width={22} height={22} /> Neuigkeiten</h2>
            {ungelesen && <button type="button" className="btn btn-ghost !min-h-0 !py-1 text-[14px]" onClick={benachrichtigungenGelesen}>Alle gelesen</button>}
          </div>
          {z.benachrichtigungen.length === 0 && <p className="mt-3 text-muted">Noch nichts Neues. Hier landen Antworten von Seb, Freigaben und erfüllte Wünsche.</p>}
          <ul className="mt-3 divide-y divide-line">
            {z.benachrichtigungen.slice(0, 5).map((n) => (
              <li key={n.id}>
                <Link href={n.link ?? "/mein-camp"} className="flex gap-3 py-3 hover:text-display">
                  <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${n.gelesen ? "bg-surface-strong" : "bg-gelb"}`} aria-label={n.gelesen ? "gelesen" : "neu"} />
                  <span className="min-w-0">
                    <span className="block font-semibold">{n.titel}</span>
                    <span className="block truncate text-[15px] text-muted">{n.text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Termine */}
        <section className="karte p-5">
          <h2 className="heading-s">Deine Termine</h2>
          <ul className="mt-3 divide-y divide-line">
            {kommend.map((b) => (
              <li key={b.id} className="flex justify-between gap-3 py-3">
                <span><span className="block font-semibold">{b.titel}</span><span className="text-[15px] text-muted">{b.von === b.bis ? formatLang(b.von) : `${formatKurz(b.von)} – ${formatKurz(b.bis)}`}</span></span>
                <span className="label self-center text-muted">Buchung</span>
              </li>
            ))}
            {events.map((e) => (
              <li key={e.id} className="flex justify-between gap-3 py-3">
                <span><span className="block font-semibold">{e.titel}</span><span className="text-[15px] text-muted">{formatLang(e.datum)} · {e.von} Uhr · {e.ort}</span></span>
                <span className="label self-center text-accent">{e.ichDabei ? "Dabei" : "Event"}</span>
              </li>
            ))}
            {kommend.length + events.length === 0 && <li className="py-3 text-muted">Nichts geplant. Buch dir eine Werkstattbucht oder schau in die Community.</li>}
          </ul>
          <div className="mt-2 flex flex-wrap gap-x-6">
            <Link href="/buchen" className="btn btn-ghost">Werkstattbucht buchen</Link>
            <Link href="/mein-camp/community" className="btn btn-ghost">Events ansehen</Link>
          </div>
        </section>
      </div>

      {rolle === "konto" && (
        <section className="buehne mt-5 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between lg:p-6">
          <div>
            <h2 className="heading-m">Ab {ABO.lohntAbTagen} Tagen im Monat lohnt sich das Abo</h2>
            <p className="mt-1 text-muted">Werkzeug inklusive, Support von Seb, früher buchen, 10 % im Fachshop. {euro(ABO.preisProMonat)} im Monat, monatlich kündbar.</p>
          </div>
          <Link href="/mein-camp/mitgliedschaft" className="btn btn-primary shrink-0">Mitglied werden</Link>
        </section>
      )}
    </>
  );
}
