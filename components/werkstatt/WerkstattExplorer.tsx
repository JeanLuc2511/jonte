"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { euro, formatKurz, formatZeitraum, naechster, plusTage } from "@/lib/datum";
import { belegungImZeitraum, buchtPreis, getBelegung } from "@/lib/services/buchung";
import type { Belegung, Werkzeug, Zone } from "@/lib/types";
import { useHeute } from "@/lib/warenkorb";
import { Beispiel } from "../Bausteine";
import { IconInsta, IconPfeil, IconSuche, IconZu } from "../Icons";
import { VanSeite } from "../Van";
import { Hallenplan } from "./Hallenplan";

const TYP_NAME: Record<Zone["typ"], string> = {
  bucht: "Werkstattbucht", werkbank: "Werkbank", station: "Station", bereich: "Bereich",
};

export function WerkstattExplorer({ zonen, werkzeuge }: { zonen: Zone[]; werkzeuge: Werkzeug[] }) {
  const heute = useHeute();
  const [zeitraum, setZeitraum] = useState<{ von: string; bis: string } | null>(null);
  const [auswahl, setAuswahl] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const planRef = useRef<HTMLDivElement>(null);

  const von = zeitraum?.von ?? (heute ? naechster(heute, 6) : null);
  const bis = zeitraum?.bis ?? (von ? plusTage(von, 1) : null);

  const belegung = useMemo(() => (heute ? getBelegung(heute) : []), [heute]);
  const belegt = useMemo(
    () => (von && bis ? belegungImZeitraum(belegung, von, bis) : []),
    [belegung, von, bis],
  );
  const buchten = zonen.filter((z) => z.typ === "bucht");
  const belegteIds = new Set(belegt.map((b) => b.buchtId));
  const frei = buchten.filter((z) => !belegteIds.has(z.id));

  const gezeigt = zonen.find((z) => z.id === (hover ?? auswahl)) ?? null;

  const schnell = heute
    ? [
        { label: "Heute", von: heute, bis: heute },
        { label: "Wochenende", von: naechster(heute, 6), bis: plusTage(naechster(heute, 6), 1) },
        { label: "Nächste Woche", von: naechster(plusTage(heute, 1), 1), bis: plusTage(naechster(plusTage(heute, 1), 1), 4) },
        { label: "14 Tage", von: naechster(plusTage(heute, 1), 1), bis: plusTage(naechster(plusTage(heute, 1), 1), 13) },
      ]
    : [];

  function zeigeZone(id: string) {
    setAuswahl(id);
    planRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <section className="seite py-10 lg:py-14" ref={planRef}>
        {/* Zeitraum */}
        <div className="karte flex flex-col gap-4 p-4 lg:flex-row lg:items-end lg:justify-between lg:p-5">
          <div>
            <p className="feld-label">Wann willst du schrauben?</p>
            <div className="flex flex-wrap gap-2">
              {schnell.map((s) => (
                <button
                  key={s.label} type="button" className="chip"
                  aria-pressed={von === s.von && bis === s.bis}
                  onClick={() => setZeitraum({ von: s.von, bis: s.bis })}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-[360px]">
            <label>
              <span className="feld-label">Von</span>
              <input
                type="date" className="feld" value={von ?? ""} min={heute ?? undefined}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v) setZeitraum({ von: v, bis: bis && bis >= v ? bis : v });
                }}
              />
            </label>
            <label>
              <span className="feld-label">Bis</span>
              <input
                type="date" className="feld" value={bis ?? ""} min={von ?? undefined}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v && von) setZeitraum({ von: v < von ? v : von, bis: v });
                }}
              />
            </label>
          </div>
        </div>

        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted" aria-live="polite">
          {von && bis ? (
            <>
              <strong className="font-semibold text-ink">{formatZeitraum(von, bis)}:</strong>
              <span><strong className="text-display">{frei.length} von {buchten.length}</strong> Werkstattbuchten frei</span>
              <span>· {belegt.length} {belegt.length === 1 ? "Fahrzeug ist" : "Fahrzeuge sind"} gleichzeitig da</span>
              <Beispiel>Beispiel-Belegung</Beispiel>
            </>
          ) : (
            <span>Belegung wird geladen …</span>
          )}
        </p>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
          <div>
            <div className="border border-line">
              <Hallenplan
                zonen={zonen} belegt={belegt} zeigeFrei={Boolean(von)}
                auswahl={auswahl} hervorgehoben={hover}
                onAuswahl={(id) => setAuswahl(id === auswahl ? null : id)} onHover={setHover}
                className="block h-auto w-full"
              />
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-muted">
              <li className="flex items-center gap-2"><span className="h-3 w-5 border-2 border-dashed border-gelb bg-gelb/15" />frei im Zeitraum</li>
              <li className="flex items-center gap-2"><span className="h-3 w-5 border border-dunkel bg-sand" />belegt, Fahrzeug steht drin</li>
              <li className="flex items-center gap-2"><span className="h-3 w-5 border border-sand/50 bg-creme/10" />Werkbank, Station, Bereich</li>
              <li className="max-lg:hidden">Fahr über einen Bereich oder klick ihn an.</li>
              <li className="lg:hidden">Tipp auf einen Bereich.</li>
            </ul>
          </div>

          {/* Detail / Übersicht */}
          <aside className="karte self-start lg:sticky lg:top-28" aria-live="polite">
            {gezeigt ? (
              <ZonenDetail
                key={gezeigt.id} zone={gezeigt} werkzeuge={werkzeuge} belegt={belegt} belegung={belegung}
                von={von} bis={bis} angeheftet={auswahl === gezeigt.id} onZu={() => setAuswahl(null)}
              />
            ) : (
              <Uebersicht frei={frei} von={von} bis={bis} onZone={setAuswahl} />
            )}
          </aside>
        </div>
      </section>

      {/* Wer ist gleichzeitig da */}
      <section className="border-y border-line">
        <div className="seite py-14">
          <p className="eyebrow">Nachbarn in der Halle</p>
          <h2 className="heading-l mt-5">
            {belegt.length > 0 ? "Diese Fahrzeuge sind gleichzeitig da" : "In dem Zeitraum hast du die Halle fast für dich"}
          </h2>
          <p className="lead mt-3 max-w-2xl">
            Wer neben dir schraubt, hat oft genau das Problem schon gelöst, an dem du gerade hängst.
          </p>
          {belegt.length > 0 && (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {belegt.map((b) => {
                const zone = zonen.find((z) => z.id === b.buchtId);
                return (
                  <li key={b.id} className="karte flex gap-4 p-4">
                    <button
                      type="button" onClick={() => zeigeZone(b.buchtId)}
                      className="flex h-[76px] w-[120px] shrink-0 items-end bg-surface-strong px-2 pb-1"
                      aria-label={`${zone?.name} im Plan zeigen`}
                    >
                      <VanSeite farbe={b.fahrzeug.farbe} className="w-full" />
                    </button>
                    <div className="min-w-0">
                      <p className="label text-muted">{zone?.kurz} · {formatKurz(b.von)} – {formatKurz(b.bis)}</p>
                      <h3 className="heading-s mt-1 truncate">{b.fahrzeug.spitzname}</h3>
                      <p className="text-[15px] text-muted">{b.fahrzeug.modell} · {b.crew}</p>
                      <p className="mt-1 text-[15px]">{b.phase}</p>
                      {b.instagram && (
                        <p className="mt-1 flex items-center gap-1.5 text-[14px] text-accent">
                          <IconInsta width={16} height={16} /> {b.instagram}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <Werkzeugliste zonen={zonen} werkzeuge={werkzeuge} onZone={zeigeZone} />
    </>
  );
}

/* ------------------------------------------------------------------ */

function Uebersicht({
  frei, von, bis, onZone,
}: { frei: Zone[]; von: string | null; bis: string | null; onZone: (id: string) => void }) {
  return (
    <div className="p-5 lg:p-6">
      <p className="label text-muted">Freie Werkstattbuchten</p>
      <h2 className="heading-m mt-2">{von && bis ? formatZeitraum(von, bis) : "Zeitraum wählen"}</h2>
      {frei.length === 0 && von && (
        <p className="mt-4 text-muted">
          In diesem Zeitraum ist alles belegt. Schieb den Zeitraum ein paar Tage – oder trag dich auf die Warteliste ein.
        </p>
      )}
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {frei.map((z) => {
          const preis = von && bis ? buchtPreis(z.bucht!.preisProTag, von, bis) : null;
          return (
            <li key={z.id} className="flex items-center gap-3 py-3">
              <button type="button" onClick={() => onZone(z.id)} className="min-w-0 flex-1 text-left hover:text-display">
                <span className="font-display text-xl text-display">{z.kurz}</span>
                <span className="ml-2 font-semibold">{z.bucht!.groesse}</span>
                <span className="block text-[14px] text-muted">
                  bis {String(z.bucht!.maxLaengeM).replace(".", ",")} m · {euro(z.bucht!.preisProTag)} / Tag
                </span>
              </button>
              {preis && <span className="text-right font-semibold">{euro(preis.summe)}</span>}
              <Link
                href={`/buchen?bucht=${z.id}&von=${von}&bis=${bis}`}
                className="btn btn-outline btn-klein" aria-label={`${z.name} buchen`}
              >
                Buchen
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[14px] text-muted">
        Für Mitglieder ist das Werkzeug inklusive, sonst kommen 10 € Werkzeugpauschale pro Tag dazu. <Beispiel>Beispielpreise</Beispiel>
      </p>
    </div>
  );
}

function ZonenDetail({
  zone, werkzeuge, belegt, belegung, von, bis, angeheftet, onZu,
}: {
  zone: Zone; werkzeuge: Werkzeug[]; belegt: Belegung[]; belegung: Belegung[];
  von: string | null; bis: string | null; angeheftet: boolean; onZu: () => void;
}) {
  const istBucht = zone.typ === "bucht";
  const liste = werkzeuge.filter((w) => w.zoneId === zone.id || (istBucht && w.zoneId === "buchten"));
  const drin = belegt.find((b) => b.buchtId === zone.id);
  const preis = istBucht && von && bis ? buchtPreis(zone.bucht!.preisProTag, von, bis) : null;
  const wiederFrei = drin
    ? belegung.filter((b) => b.buchtId === zone.id).reduce((spaet, b) => (b.von <= plusTage(spaet, 1) && b.bis > spaet ? b.bis : spaet), drin.bis)
    : null;

  return (
    <div className="einblenden p-5 lg:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="label text-muted">{TYP_NAME[zone.typ]}</p>
        {angeheftet && (
          <button type="button" onClick={onZu} className="-m-2 flex h-11 w-11 items-center justify-center text-muted hover:text-display" aria-label="Zurück zur Übersicht">
            <IconZu width={20} height={20} />
          </button>
        )}
      </div>
      <h2 className="heading-m mt-1">{zone.name}</h2>
      {istBucht && von && (
        <span className={`badge mt-3 ${drin ? "" : "badge-live"}`}>{drin ? "Belegt" : "Frei im Zeitraum"}</span>
      )}
      <p className="mt-4 text-muted">{zone.beschreibung}</p>

      {drin && (
        <div className="mt-4 border border-line p-3">
          <p className="label text-muted">Steht hier</p>
          <p className="mt-1 font-semibold">{drin.fahrzeug.spitzname} · {drin.fahrzeug.modell}</p>
          <p className="text-[15px] text-muted">{drin.crew} · {drin.phase}</p>
          {wiederFrei && <p className="mt-1 text-[15px] text-accent">Wieder frei ab {formatKurz(plusTage(wiederFrei, 1))}</p>}
        </div>
      )}

      {zone.ausstattung && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {zone.ausstattung.map((a) => (
            <li key={a} className="border border-line px-2.5 py-1 font-condensed text-[14px] font-semibold uppercase tracking-wide">{a}</li>
          ))}
        </ul>
      )}

      {liste.length > 0 && (
        <>
          <p className="label mt-6 text-display">{istBucht ? "Im Werkzeugwagen & an der Bucht" : "Das liegt hier"}</p>
          <ul className="mt-2 divide-y divide-line border-y border-line text-[15px]">
            {liste.map((w) => (
              <li key={w.id} className="flex items-baseline justify-between gap-3 py-2">
                <span>
                  {w.name}
                  {w.einweisung && <span className="ml-2 font-condensed text-[12px] font-bold uppercase tracking-wider text-accent">Einweisung</span>}
                </span>
                {!istBucht && <span className="shrink-0 text-muted">{w.anzahl}×</span>}
              </li>
            ))}
          </ul>
        </>
      )}
      {zone.hinweis && <p className="mt-4 text-[14px] text-accent">{zone.hinweis}</p>}

      {istBucht && (
        <div className="mt-6">
          {preis && !drin && (
            <p className="mb-3 flex items-baseline justify-between gap-3">
              <span className="text-muted">{preis.tage} {preis.tage === 1 ? "Tag" : "Tage"}{preis.rabatt ? " · 15 % Wochenrabatt" : ""}</span>
              <span className="font-display text-3xl text-display">{euro(preis.summe)}</span>
            </p>
          )}
          {drin ? (
            <p className="text-[15px] text-muted">Wähl einen anderen Zeitraum oder eine freie Werkstattbucht.</p>
          ) : (
            <Link href={`/buchen?bucht=${zone.id}${von && bis ? `&von=${von}&bis=${bis}` : ""}`} className="btn btn-primary w-full">
              Diese Werkstattbucht buchen
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Werkzeugliste({
  zonen, werkzeuge, onZone,
}: { zonen: Zone[]; werkzeuge: Werkzeug[]; onZone: (id: string) => void }) {
  const [suche, setSuche] = useState("");
  const [kategorie, setKategorie] = useState<string | null>(null);
  const kategorien = [...new Set(werkzeuge.map((w) => w.kategorie))];
  const q = suche.trim().toLowerCase();
  const treffer = werkzeuge.filter(
    (w) => (!kategorie || w.kategorie === kategorie) && (!q || w.name.toLowerCase().includes(q)),
  );
  const ort = (w: Werkzeug) =>
    w.zoneId === "buchten" ? { name: "Jede Werkstattbucht", id: "b1" } : { name: zonen.find((z) => z.id === w.zoneId)?.name ?? "", id: w.zoneId };

  return (
    <section className="seite abschnitt" id="werkzeug">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-end">
        <div>
          <p className="eyebrow">Gesamtliste</p>
          <h2 className="display-l mt-6">Alles, was in der Halle liegt</h2>
        </div>
        <p className="lead">
          {werkzeuge.length} Werkzeuge und Maschinen. Für Mitglieder inklusive, sonst mit Werkzeugpauschale pro Tag. Das Werkzeug bleibt in der Halle – einen Verleih zum Mitnehmen gibt es nicht.
          {" "}<Beispiel>Beispielbestand</Beispiel>
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <label className="relative block lg:w-80">
          <span className="sr-only">Werkzeug suchen</span>
          <IconSuche className="pointer-events-none absolute left-3 top-3 text-muted" />
          <input
            type="search" className="feld pl-11" placeholder="Werkzeug suchen, z. B. Lochsäge"
            value={suche} onChange={(e) => setSuche(e.target.value)}
          />
        </label>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
          <button type="button" className="chip" aria-pressed={!kategorie} onClick={() => setKategorie(null)}>Alle</button>
          {kategorien.map((k) => (
            <button key={k} type="button" className="chip" aria-pressed={kategorie === k} onClick={() => setKategorie(kategorie === k ? null : k)}>
              {k}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-6 grid border-t border-line md:grid-cols-2 md:gap-x-10">
        {treffer.map((w) => {
          const o = ort(w);
          return (
            <li key={w.id} className="flex items-center justify-between gap-4 border-b border-line py-3">
              <div className="min-w-0">
                <p className="font-semibold">
                  {w.name}
                  {w.einweisung && <span className="ml-2 font-condensed text-[12px] font-bold uppercase tracking-wider text-accent">Einweisung</span>}
                </p>
                <p className="text-[14px] text-muted">{w.kategorie} · {w.anzahl}×</p>
              </div>
              <button
                type="button" onClick={() => onZone(o.id)}
                className="flex min-h-11 shrink-0 items-center gap-1.5 text-right font-condensed text-[14px] font-semibold uppercase tracking-wide text-accent underline-offset-4 hover:underline"
              >
                {o.name} <IconPfeil width={16} height={16} />
              </button>
            </li>
          );
        })}
      </ul>
      {treffer.length === 0 && (
        <p className="mt-6 text-muted">Dazu liegt nichts in der Halle. Frag uns – vielleicht fehlt es nur in der Liste.</p>
      )}
    </section>
  );
}
