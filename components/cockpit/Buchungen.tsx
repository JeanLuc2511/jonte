"use client";

import { useState } from "react";
import { konflikt } from "@/lib/camp/auswertung";
import { usePreise } from "@/lib/camp/store";
import { FAHRZEUGE } from "@/lib/daten/fahrzeuge";
import { euro, formatKurz, formatLang, formatWochentag, formatZeitraum, plusTage, tagDesMonats } from "@/lib/datum";
import { buchtPreis } from "@/lib/services/buchung";
import { buchungAnlegen, buchungStornieren, buchungVerschieben, sperrzeitEntfernen, sperrzeitSetzen } from "@/lib/services/cockpit";
import type { BuchungsQuelle, FahrzeugId, HallenBuchung } from "@/lib/types";
import { IconPlus } from "../Icons";
import { Auswahl, CKopf, Eingabe, useCockpit } from "./Teile";

const TAGE = 14;
const QUELLE: Record<BuchungsQuelle, string> = { online: "Online", telefon: "Telefon", "walk-in": "Walk-in" };
type Panel = null | { art: "buchung"; id: string } | { art: "neu"; buchtId: string; von: string } | { art: "sperre" };

export function Buchungen() {
  const c = useCockpit();
  const preise = usePreise();
  const [start, setStart] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  if (!c) return null;
  const { camp, heute, akten } = c;
  const anfang = start ?? plusTage(heute, -1);
  const tage = Array.from({ length: TAGE }, (_, i) => plusTage(anfang, i));
  const buchten = camp.zonen.filter((z) => z.typ === "bucht");
  const aktive = camp.buchungen.filter((b) => b.status === "bestaetigt");
  const gewaehlt = panel?.art === "buchung" ? camp.buchungen.find((b) => b.id === panel.id) : undefined;

  return (
    <>
      <CKopf titel="Buchungen" aktion={
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={() => setPanel({ art: "neu", buchtId: buchten[0]?.id ?? "", von: heute })}><IconPlus width={18} height={18} /> Buchung anlegen</button>
          <button type="button" className="btn btn-outline" onClick={() => setPanel({ art: "sperre" })}>Sperrzeit setzen</button>
        </div>
      }>
        <p>Belegungskalender aller Werkstattbuchten. Tipp auf eine Buchung zum Verschieben oder Stornieren, auf ein freies Feld zum Anlegen.</p>
      </CKopf>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button type="button" className="chip" onClick={() => setStart(plusTage(anfang, -7))}>← Woche</button>
        <button type="button" className="chip" aria-pressed={anfang === plusTage(heute, -1)} onClick={() => setStart(null)}>Heute</button>
        <button type="button" className="chip" onClick={() => setStart(plusTage(anfang, 7))}>Woche →</button>
        <span className="ml-2 text-muted">{formatZeitraum(tage[0], tage[TAGE - 1])}</span>
      </div>

      {/* Kalender: Zeilen = Werkstattbuchten, Spalten = Tage */}
      <div className="karte overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-14 border-b border-r border-line bg-[#2a1d10] p-2 text-left"><span className="sr-only">Werkstattbucht</span></th>
              {tage.map((t) => (
                <th key={t} scope="col" className={`border-b border-line p-1.5 text-center font-condensed font-bold uppercase ${t === heute ? "bg-gelb text-pflaume" : "text-muted"}`}>
                  {formatWochentag(t)}<span className="block text-[15px]">{tagDesMonats(t)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {buchten.map((z) => (
              <tr key={z.id}>
                <th scope="row" className="sticky left-0 z-10 border-b border-r border-line bg-[#2a1d10] p-2 text-left font-display text-xl text-display">{z.kurz}</th>
                {tage.map((t) => {
                  const b = aktive.find((x) => x.buchtId === z.id && x.von <= t && x.bis >= t);
                  const s = camp.sperrzeiten.find((x) => x.buchtIds.includes(z.id) && x.von <= t && x.bis >= t);
                  if (b) {
                    const erster = b.von === t || t === tage[0];
                    return (
                      <td key={t} className="border-b border-line p-0">
                        <button
                          type="button" onClick={() => setPanel({ art: "buchung", id: b.id })} title={`${b.fahrzeug.spitzname} · ${b.kunde.name}`}
                          aria-label={`${z.name}, ${formatLang(t)}: ${b.fahrzeug.spitzname}, ${b.kunde.name}`}
                          className={`block h-11 w-full overflow-hidden whitespace-nowrap px-1.5 text-left font-semibold text-dunkel ${gewaehlt?.id === b.id ? "outline outline-2 -outline-offset-2 outline-gelb" : ""} ${b.von === t ? "border-l-2 border-dunkel" : ""}`}
                          style={{ background: b.fahrzeug.farbe }}
                        >
                          {erster ? b.fahrzeug.spitzname : ""}
                        </button>
                      </td>
                    );
                  }
                  if (s) return <td key={t} className="border-b border-line p-0"><div className="flex h-11 items-center justify-center bg-surface-strong text-[11px] font-bold uppercase tracking-wide text-muted" title={s.grund}>{s.von === t || t === tage[0] ? "gesperrt" : ""}</div></td>;
                  return (
                    <td key={t} className="border-b border-l border-line p-0">
                      <button type="button" className="block h-11 w-full hover:bg-surface-strong" aria-label={`${z.name}, ${formatLang(t)}: frei – Buchung anlegen`} onClick={() => setPanel({ art: "neu", buchtId: z.id, von: t })} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[14px] text-muted lg:hidden">Der Kalender lässt sich seitlich wischen.</p>

      <div className="mt-5" aria-live="polite">
        {gewaehlt && <BuchungDetail key={gewaehlt.id} b={gewaehlt} onZu={() => setPanel(null)} />}
        {panel?.art === "neu" && <NeueBuchung key={`${panel.buchtId}-${panel.von}`} buchtId={panel.buchtId} von={panel.von} rabatt={preise.wochenrabatt} mitglieder={akten.map((a) => [a.mitglied.id, `${a.mitglied.vorname} ${a.mitglied.nachname}`])} onZu={() => setPanel(null)} />}
        {panel?.art === "sperre" && <NeueSperre onZu={() => setPanel(null)} />}
      </div>

      <section className="mt-8">
        <h2 className="heading-m">Sperrzeiten</h2>
        {camp.sperrzeiten.length === 0 && <p className="mt-2 text-muted">Keine gesetzt.</p>}
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {camp.sperrzeiten.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span><strong className="font-semibold">{s.grund}</strong><span className="block text-[15px] text-muted">{formatZeitraum(s.von, s.bis)} · {s.buchtIds.length === buchten.length ? "ganze Halle" : s.buchtIds.map((id) => buchten.find((z) => z.id === id)?.kurz).join(", ")}</span></span>
              <button type="button" className="btn btn-ghost btn-klein" onClick={() => sperrzeitEntfernen(s.id)}>Aufheben</button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function BuchungDetail({ b, onZu }: { b: HallenBuchung; onZu: () => void }) {
  const c = useCockpit();
  const [f, setF] = useState({ buchtId: b.buchtId, von: b.von, bis: b.bis });
  const [fehler, setFehler] = useState<string | null>(null);
  const [sicher, setSicher] = useState(false);
  if (!c) return null;
  const buchten = c.camp.zonen.filter((z) => z.typ === "bucht");
  const geaendert = f.buchtId !== b.buchtId || f.von !== b.von || f.bis !== b.bis;
  return (
    <section className="buehne einblenden p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label">{QUELLE[b.quelle]}{b.mitgliedId ? " · mit Konto" : " · ohne Konto"}</p>
          <h2 className="heading-m mt-1">{b.fahrzeug.spitzname} · {b.kunde.name}</h2>
          <p className="text-muted">{b.fahrzeug.modell}{b.phase ? ` · ${b.phase}` : ""} · {euro(b.summe)}</p>
          <p className="text-[15px] text-muted">{[b.kunde.telefon, b.kunde.email].filter(Boolean).join(" · ")}</p>
        </div>
        <button type="button" className="btn btn-ghost !min-h-0" onClick={onZu}>Schließen</button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Auswahl label="Werkstattbucht" wert={f.buchtId} onChange={(v) => setF({ ...f, buchtId: v })} optionen={buchten.map((z) => [z.id, `${z.kurz} · ${z.bucht?.groesse}`])} />
        <Eingabe label="Von" typ="date" wert={f.von} onChange={(v) => v && setF({ ...f, von: v, bis: f.bis < v ? v : f.bis })} />
        <Eingabe label="Bis" typ="date" wert={f.bis} min={f.von} onChange={(v) => v && setF({ ...f, bis: v })} />
      </div>
      {fehler && <p className="mt-3 font-semibold" role="alert">{fehler}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary" disabled={!geaendert} onClick={() => { const e = buchungVerschieben(b.id, f); setFehler(e); if (!e) onZu(); }}>Verschieben</button>
        {sicher
          ? <button type="button" className="btn btn-outline" onClick={() => { buchungStornieren(b.id); onZu(); }}>Wirklich stornieren</button>
          : <button type="button" className="btn btn-outline" onClick={() => setSicher(true)}>Stornieren</button>}
      </div>
      {b.mitgliedId && <p className="mt-3 text-[14px] text-muted">Das Mitglied wird automatisch benachrichtigt.</p>}
    </section>
  );
}

function NeueBuchung({ buchtId, von, rabatt, mitglieder, onZu }: { buchtId: string; von: string; rabatt: number; mitglieder: [string, string][]; onZu: () => void }) {
  const c = useCockpit();
  const [f, setF] = useState({ buchtId, von, bis: plusTage(von, 1), name: "", telefon: "", email: "", spitzname: "", modell: "", typ: "anderes" as FahrzeugId | "anderes", quelle: "telefon" as BuchungsQuelle, mitgliedId: "" });
  const [fehler, setFehler] = useState<string | null>(null);
  if (!c) return null;
  const buchten = c.camp.zonen.filter((z) => z.typ === "bucht");
  const bucht = buchten.find((z) => z.id === f.buchtId);
  const preis = bucht?.bucht ? buchtPreis(bucht.bucht.preisProTag, f.von, f.bis, rabatt) : null;
  const belegt = konflikt(c.camp, f.buchtId, f.von, f.bis);
  const waehleMitglied = (id: string) => {
    const a = c.akten.find((x) => x.mitglied.id === id);
    setF({ ...f, mitgliedId: id, ...(a ? { name: `${a.mitglied.vorname} ${a.mitglied.nachname}`, email: a.mitglied.email, telefon: a.mitglied.telefon ?? "", spitzname: a.fahrzeuge[0]?.spitzname ?? "", modell: a.fahrzeuge[0]?.modell ?? "" } : {}) });
  };
  return (
    <form
      className="buehne einblenden p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!f.name.trim() || !preis) return setFehler("Trag mindestens den Namen ein.");
        const grund = buchungAnlegen({
          buchtId: f.buchtId, von: f.von, bis: f.bis, quelle: f.quelle, mitgliedId: f.mitgliedId || undefined,
          kunde: { name: f.name.trim(), telefon: f.telefon || undefined, email: f.email || undefined },
          fahrzeug: { spitzname: f.spitzname.trim() || f.name.trim().split(" ")[0], modell: f.modell.trim() || "Fahrzeug offen", typ: f.typ, farbe: "#E6C0AB" },
          summe: preis.summe,
        });
        setFehler(grund);
        if (!grund) onZu();
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="heading-m">Buchung anlegen</h2>
        <button type="button" className="btn btn-ghost !min-h-0" onClick={onZu}>Abbrechen</button>
      </div>
      <p className="mt-1 text-muted">Für Anrufe und Leute, die einfach vorbeikommen – ein Konto ist nicht nötig.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Auswahl label="Werkstattbucht" wert={f.buchtId} onChange={(v) => setF({ ...f, buchtId: v })} optionen={buchten.map((z) => [z.id, `${z.kurz} · ${z.bucht?.groesse} · bis ${String(z.bucht?.maxLaengeM).replace(".", ",")} m`])} />
        <Eingabe label="Von" typ="date" wert={f.von} onChange={(v) => v && setF({ ...f, von: v, bis: f.bis < v ? v : f.bis })} />
        <Eingabe label="Bis" typ="date" wert={f.bis} min={f.von} onChange={(v) => v && setF({ ...f, bis: v })} />
        <Auswahl label="Gebucht über" wert={f.quelle} onChange={(v) => setF({ ...f, quelle: v as BuchungsQuelle })} optionen={[["telefon", "Telefon"], ["walk-in", "Walk-in"], ["online", "Online"]]} />
        <Auswahl label="Konto (falls vorhanden)" wert={f.mitgliedId} onChange={waehleMitglied} optionen={[["", "Ohne Konto"], ...mitglieder]} className="sm:col-span-2" />
        <Eingabe label="Name" wert={f.name} onChange={(v) => setF({ ...f, name: v })} />
        <Eingabe label="Telefon" typ="tel" wert={f.telefon} onChange={(v) => setF({ ...f, telefon: v })} />
        <Eingabe label="E-Mail (freiwillig)" typ="email" wert={f.email} onChange={(v) => setF({ ...f, email: v })} />
        <Eingabe label="Fahrzeug-Spitzname" wert={f.spitzname} onChange={(v) => setF({ ...f, spitzname: v })} />
        <Eingabe label="Modell" wert={f.modell} placeholder="z. B. Sprinter L2H2" onChange={(v) => setF({ ...f, modell: v })} />
        <Auswahl label="Fahrzeugfamilie" wert={f.typ} onChange={(v) => setF({ ...f, typ: v as FahrzeugId | "anderes" })} optionen={[["anderes", "Anderes"], ...FAHRZEUGE.map((x) => [x.id, x.name] as const)]} />
      </div>
      <p className="mt-4 text-lg" aria-live="polite">
        {belegt ? <strong className="font-semibold">{belegt}</strong> : preis && <>{preis.tage} {preis.tage === 1 ? "Tag" : "Tage"}{preis.rabatt ? " · Wochenrabatt" : ""} · <strong className="font-display text-2xl">{euro(preis.summe)}</strong> <span className="text-[14px] text-muted">zzgl. Werkzeugpauschale ohne Abo</span></>}
      </p>
      {fehler && !belegt && <p className="mt-2 font-semibold" role="alert">{fehler}</p>}
      <button type="submit" className="btn btn-primary mt-4" disabled={Boolean(belegt)}>Buchung eintragen</button>
    </form>
  );
}

function NeueSperre({ onZu }: { onZu: () => void }) {
  const c = useCockpit();
  const [f, setF] = useState({ buchtIds: [] as string[], von: "", bis: "", grund: "" });
  const [fehler, setFehler] = useState<string | null>(null);
  if (!c) return null;
  const buchten = c.camp.zonen.filter((z) => z.typ === "bucht");
  const von = f.von || plusTage(c.heute, 7);
  const bis = f.bis || von;
  const alle = f.buchtIds.length === buchten.length;
  return (
    <form
      className="buehne einblenden p-5"
      onSubmit={(e) => { e.preventDefault(); const g = sperrzeitSetzen({ buchtIds: f.buchtIds, von, bis, grund: f.grund.trim() || "Gesperrt" }); setFehler(g); if (!g) onZu(); }}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="heading-m">Sperrzeit setzen</h2>
        <button type="button" className="btn btn-ghost !min-h-0" onClick={onZu}>Abbrechen</button>
      </div>
      <p className="mt-1 text-muted">Urlaub, Wartung oder ein Event in der Halle. In der Zeit ist online nichts buchbar.</p>
      <p className="feld-label mt-4">Welche Werkstattbuchten?</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Werkstattbuchten">
        <button type="button" className="chip" aria-pressed={alle} onClick={() => setF({ ...f, buchtIds: alle ? [] : buchten.map((z) => z.id) })}>Ganze Halle</button>
        {buchten.map((z) => (
          <button key={z.id} type="button" className="chip" aria-pressed={f.buchtIds.includes(z.id)} onClick={() => setF({ ...f, buchtIds: f.buchtIds.includes(z.id) ? f.buchtIds.filter((x) => x !== z.id) : [...f.buchtIds, z.id] })}>{z.kurz}</button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Eingabe label="Von" typ="date" wert={von} onChange={(v) => v && setF({ ...f, von: v, bis: bis < v ? v : bis })} />
        <Eingabe label="Bis" typ="date" wert={bis} min={von} onChange={(v) => v && setF({ ...f, bis: v })} />
        <Eingabe label="Grund" wert={f.grund} placeholder="z. B. Betriebsurlaub" onChange={(v) => setF({ ...f, grund: v })} className="sm:col-span-2" />
      </div>
      {fehler && <p className="mt-3 font-semibold" role="alert">{fehler}</p>}
      <button type="submit" className="btn btn-primary mt-4">Sperren ({formatKurz(von)}{bis !== von ? ` – ${formatKurz(bis)}` : ""})</button>
    </form>
  );
}
