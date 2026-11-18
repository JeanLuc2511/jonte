"use client";

import { useState } from "react";
import { euro } from "@/lib/datum";
import { neueId } from "@/lib/mein-camp/store";
import { preiseSpeichern, werkzeugEntfernen, werkzeugSpeichern, zoneEntfernen, zoneSpeichern } from "@/lib/services/cockpit";
import type { Preise, Werkzeug, WerkzeugKategorie, Zone, ZonenTyp } from "@/lib/types";
import { IconPlus } from "../Icons";
import { Hallenplan } from "../werkstatt/Hallenplan";
import { Auswahl, CKopf, Eingabe, FotoKnopf, Reiter, Textfeld, useCockpit, useGespeichert } from "./Teile";

const TYPEN: [ZonenTyp, string][] = [["bucht", "Werkstattbucht"], ["werkbank", "Werkbank"], ["station", "Station"], ["bereich", "Bereich"]];
const KATEGORIEN: WerkzeugKategorie[] = ["Sägen & Trennen", "Bohren & Schrauben", "Schleifen & Fräsen", "Elektrik", "Metall & Karosserie", "Kleben & Dichten", "Messen & Prüfen", "Hilfsmittel"];
const zahl = (v: string) => Number(String(v).replace(",", ".")) || 0;

export function Halle() {
  const [reiter, setReiter] = useState<"bereiche" | "werkzeug" | "preise">("bereiche");
  return (
    <>
      <CKopf titel="Halle & Preise"><p>Hallenplan, Werkzeug und Preise. Was du hier änderst, steht sofort auf der Werkstatt-Seite und in der Buchung.</p></CKopf>
      <Reiter label="Bereich" aktiv={reiter} onWahl={setReiter} werte={[["bereiche", "Buchten & Stationen"], ["werkzeug", "Werkzeug"], ["preise", "Preise"]]} />
      {reiter === "bereiche" && <Bereiche />}
      {reiter === "werkzeug" && <WerkzeugPflege />}
      {reiter === "preise" && <PreisPflege />}
    </>
  );
}

/* ---------- Buchten, Werkbänke, Stationen ---------- */

function Bereiche() {
  const c = useCockpit();
  const [id, setId] = useState<string | null>("b1");
  const [neu, setNeu] = useState<Zone | null>(null);
  if (!c) return null;
  const zone = neu ?? c.camp.zonen.find((z) => z.id === id) ?? null;
  const anlegen = () => {
    const n = c.camp.zonen.length + 1;
    setNeu({ id: neueId("z"), typ: "station", kurz: `S${n}`, name: "Neue Station", beschreibung: "", x: 520, y: 360, w: 160, h: 60, ausstattung: [] });
    setId(null);
  };
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div>
        <div className="border border-line">
          <Hallenplan zonen={neu ? [...c.camp.zonen, neu] : c.camp.zonen} auswahl={zone?.id} onAuswahl={(z) => { setNeu(null); setId(z); }} className="block h-auto w-full" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-outline btn-klein" onClick={anlegen}><IconPlus width={18} height={18} /> Bereich anlegen</button>
          <span className="text-[14px] text-muted">Tipp auf einen Bereich im Plan, um ihn zu bearbeiten.</span>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2">
          {c.camp.zonen.map((z) => (
            <li key={z.id}><button type="button" className="chip" aria-pressed={zone?.id === z.id} onClick={() => { setNeu(null); setId(z.id); }}>{z.kurz}</button></li>
          ))}
        </ul>
      </div>
      {zone
        ? <ZonenFormular key={zone.id} zone={zone} neu={Boolean(neu)} onFertig={(gespeicherteId) => { setNeu(null); setId(gespeicherteId); }} />
        : <div className="karte p-6 text-muted">Wähl einen Bereich aus.</div>}
    </div>
  );
}

function ZonenFormular({ zone, neu, onFertig }: { zone: Zone; neu: boolean; onFertig: (id: string | null) => void }) {
  const [z, setZ] = useState(zone);
  const [ausstattung, setAusstattung] = useState((zone.ausstattung ?? []).join("\n"));
  const [fehler, setFehler] = useState<string | null>(null);
  const [ok, markiere] = useGespeichert();
  const bucht = z.bucht ?? { groesse: "Standard" as const, maxLaengeM: 6, preisProTag: 69, ausrichtung: "hoch" as const };
  const speichern = () => {
    zoneSpeichern({ ...z, ausstattung: ausstattung.split("\n").map((a) => a.trim()).filter(Boolean), bucht: z.typ === "bucht" ? bucht : undefined });
    markiere();
    if (neu) onFertig(z.id);
  };
  return (
    <form className="karte p-5" onSubmit={(e) => { e.preventDefault(); speichern(); }}>
      <h2 className="heading-m">{neu ? "Neuer Bereich" : z.name}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Eingabe label="Name" wert={z.name} onChange={(v) => setZ({ ...z, name: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Eingabe label="Kürzel im Plan" wert={z.kurz} maxLength={7} onChange={(v) => setZ({ ...z, kurz: v })} />
          <Auswahl label="Art" wert={z.typ} onChange={(v) => setZ({ ...z, typ: v as ZonenTyp })} optionen={TYPEN} />
        </div>
        <Textfeld label="Beschreibung" wert={z.beschreibung} onChange={(v) => setZ({ ...z, beschreibung: v })} className="sm:col-span-2" />
        {z.typ === "bucht" && (
          <>
            <Auswahl label="Größe" wert={bucht.groesse} onChange={(v) => setZ({ ...z, bucht: { ...bucht, groesse: v as "Standard" | "XL" } })} optionen={[["Standard", "Standard"], ["XL", "XL"]]} />
            <Eingabe label="Für Fahrzeuge bis (m)" inputMode="decimal" wert={bucht.maxLaengeM} onChange={(v) => setZ({ ...z, bucht: { ...bucht, maxLaengeM: zahl(v) } })} />
            <Eingabe label="Preis pro Tag (€)" inputMode="numeric" wert={bucht.preisProTag} onChange={(v) => setZ({ ...z, bucht: { ...bucht, preisProTag: zahl(v) } })} />
            <Auswahl label="Fahrzeug steht" wert={bucht.ausrichtung} onChange={(v) => setZ({ ...z, bucht: { ...bucht, ausrichtung: v as "hoch" | "quer" } })} optionen={[["hoch", "längs (hoch im Plan)"], ["quer", "quer im Plan"]]} />
          </>
        )}
        <Textfeld label="Ausstattung" wert={ausstattung} onChange={setAusstattung} hilfe="Ein Punkt pro Zeile." className="sm:col-span-2" />
        <Eingabe label="Hinweis (z. B. Einweisung nötig)" wert={z.hinweis ?? ""} onChange={(v) => setZ({ ...z, hinweis: v || undefined })} className="sm:col-span-2" />
      </div>
      <fieldset className="mt-4">
        <legend className="feld-label">Lage im Hallenplan (Plan ist 1200 × 760)</legend>
        <div className="grid grid-cols-4 gap-3">
          {(["x", "y", "w", "h"] as const).map((k) => (
            <Eingabe key={k} label={{ x: "Links", y: "Oben", w: "Breite", h: "Tiefe" }[k]} inputMode="numeric" wert={z[k]} onChange={(v) => setZ({ ...z, [k]: Math.round(zahl(v)) })} />
          ))}
        </div>
      </fieldset>
      {fehler && <p className="mt-3 font-semibold text-display" role="alert">{fehler}</p>}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-primary">{neu ? "Bereich anlegen" : "Speichern"}</button>
        {neu
          ? <button type="button" className="btn btn-ghost" onClick={() => onFertig("b1")}>Abbrechen</button>
          : <button type="button" className="btn btn-ghost !text-muted" onClick={() => { const e = zoneEntfernen(z.id); setFehler(e); if (!e) onFertig(null); }}>Entfernen</button>}
        {ok}
      </div>
    </form>
  );
}

/* ---------- Werkzeug ---------- */

type WzForm = Omit<Werkzeug, "id"> & { id?: string };
const LEER: WzForm = { name: "", kategorie: "Hilfsmittel", zoneId: "wand", anzahl: 1 };

function WerkzeugPflege() {
  const c = useCockpit();
  const [filter, setFilter] = useState("alle");
  const [form, setForm] = useState<WzForm | null>(null);
  if (!c) return null;
  const orte: [string, string][] = [["buchten", "Jede Werkstattbucht (Werkzeugwagen)"], ...c.camp.zonen.map((z): [string, string] => [z.id, z.name])];
  const liste = c.camp.werkzeuge.filter((w) => filter === "alle" || w.zoneId === filter);
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div>
        <div className="flex flex-wrap items-end gap-3">
          <Auswahl label="Ort" wert={filter} onChange={setFilter} optionen={[["alle", `Ganze Halle (${c.camp.werkzeuge.length})`], ...orte]} className="min-w-56 flex-1" />
          <button type="button" className="btn btn-primary" onClick={() => setForm({ ...LEER, zoneId: filter === "alle" ? "wand" : filter })}><IconPlus width={18} height={18} /> Werkzeug anlegen</button>
        </div>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {liste.map((w) => (
            <li key={w.id}>
              <button type="button" onClick={() => setForm(w)} className={`flex min-h-14 w-full items-center gap-3 py-2 text-left hover:text-display ${form?.id === w.id ? "text-display" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {w.foto ? <img src={w.foto} alt="" className="h-11 w-14 shrink-0 object-cover" /> : <span className="h-11 w-14 shrink-0 border border-dashed border-line" />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{w.name}</span>
                  <span className="block truncate text-[14px] text-muted">{orte.find((o) => o[0] === w.zoneId)?.[1]} · {w.anzahl}×{w.einweisung ? " · Einweisung" : ""}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {form ? (
        <form
          key={form.id ?? "neu"} className="buehne self-start p-5 xl:sticky xl:top-32"
          onSubmit={(e) => { e.preventDefault(); if (!form.name.trim()) return; werkzeugSpeichern({ ...form, name: form.name.trim() }); setForm(null); }}
        >
          <h2 className="heading-m">{form.id ? "Werkzeug bearbeiten" : "Neues Werkzeug"}</h2>
          <div className="mt-4 grid gap-3">
            <Eingabe label="Name" wert={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Auswahl label="Liegt wo?" wert={form.zoneId} onChange={(v) => setForm({ ...form, zoneId: v })} optionen={orte} />
            <div className="grid grid-cols-2 gap-3">
              <Auswahl label="Kategorie" wert={form.kategorie} onChange={(v) => setForm({ ...form, kategorie: v as WerkzeugKategorie })} optionen={KATEGORIEN.map((k) => [k, k] as const)} />
              <Eingabe label="Anzahl" inputMode="numeric" wert={form.anzahl} onChange={(v) => setForm({ ...form, anzahl: Math.max(1, Math.round(zahl(v))) })} />
            </div>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-5 w-5 accent-[#331654]" checked={Boolean(form.einweisung)} onChange={(e) => setForm({ ...form, einweisung: e.target.checked || undefined })} />
              Nur nach Einweisung
            </label>
            <div>
              <p className="feld-label">Foto</p>
              <div className="flex flex-wrap items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {form.foto && <img src={form.foto} alt="Foto des Werkzeugs" className="h-20 w-28 object-cover" />}
                <FotoKnopf onFoto={(q) => setForm({ ...form, foto: q })}>{form.foto ? "Neu aufnehmen" : "Foto aufnehmen"}</FotoKnopf>
                {form.foto && <button type="button" className="btn btn-ghost !min-h-0" onClick={() => setForm({ ...form, foto: undefined })}>Entfernen</button>}
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" className="btn btn-primary" disabled={!form.name.trim()}>{form.id ? "Speichern" : "Anlegen"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Abbrechen</button>
            {form.id && <button type="button" className="btn btn-ghost" onClick={() => { werkzeugEntfernen(form.id!); setForm(null); }}>Löschen</button>}
          </div>
        </form>
      ) : (
        <div className="karte self-start p-6 text-muted">Tipp auf ein Werkzeug, um es zu bearbeiten – oder leg ein neues an, am Handy direkt mit Foto.</div>
      )}
    </div>
  );
}

/* ---------- Preise ---------- */

function PreisPflege() {
  const c = useCockpit();
  const [p, setP] = useState<Preise | null>(null);
  const [ok, markiere] = useGespeichert();
  if (!c) return null;
  const w = p ?? c.camp.preise;
  const set = (neu: Partial<Preise>) => setP({ ...w, ...neu });
  const buchten = c.camp.zonen.filter((z) => z.typ === "bucht");
  const lohnt = Math.ceil(w.preisProMonat / Math.max(1, w.werkzeugpauschaleProTag));
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <form className="karte p-5" onSubmit={(e) => { e.preventDefault(); preiseSpeichern(w); setP(null); markiere(); }}>
        <h2 className="heading-m">Abo, Pauschale und Regeln</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Eingabe label="Abo pro Monat (€)" inputMode="numeric" wert={w.preisProMonat} onChange={(v) => set({ preisProMonat: zahl(v) })} />
          <Eingabe label="Werkzeugpauschale pro Tag (€)" inputMode="numeric" wert={w.werkzeugpauschaleProTag} onChange={(v) => set({ werkzeugpauschaleProTag: zahl(v) })} />
          <Eingabe label="Stundenpreis (€)" inputMode="numeric" wert={w.stundenpreis} onChange={(v) => set({ stundenpreis: zahl(v) })} />
          <Eingabe label="Rabatt ab 7 Tagen (%)" inputMode="numeric" wert={Math.round(w.wochenrabatt * 100)} onChange={(v) => set({ wochenrabatt: zahl(v) / 100 })} />
          <Eingabe label="Shop-Rabatt für Mitglieder (%)" inputMode="numeric" wert={Math.round(w.shopRabatt * 100)} onChange={(v) => set({ shopRabatt: zahl(v) / 100 })} />
          <div className="grid grid-cols-2 gap-3">
            <Eingabe label="Buchbar (Tage)" inputMode="numeric" wert={w.buchungsfensterTage.standard} onChange={(v) => set({ buchungsfensterTage: { ...w.buchungsfensterTage, standard: zahl(v) } })} />
            <Eingabe label="Mitglieder" inputMode="numeric" wert={w.buchungsfensterTage.mitglied} onChange={(v) => set({ buchungsfensterTage: { ...w.buchungsfensterTage, mitglied: zahl(v) } })} />
          </div>
        </div>
        <p className="mt-4 text-muted">Mit diesen Werten lohnt sich das Abo ab <strong className="text-display">{lohnt} Tagen</strong> in der Halle pro Monat.</p>
        <div className="mt-5 flex flex-wrap items-center gap-3"><button type="submit" className="btn btn-primary">Preise speichern</button>{ok}</div>
      </form>
      <section className="karte self-start p-5">
        <h2 className="heading-m">Tagespreise der Werkstattbuchten</h2>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {buchten.map((z) => (
            <li key={z.id} className="flex items-center justify-between gap-3 py-2.5">
              <span><span className="font-display text-xl text-display">{z.kurz}</span> <span className="ml-2">{z.bucht?.groesse} · bis {String(z.bucht?.maxLaengeM).replace(".", ",")} m</span></span>
              <span className="font-semibold">{euro(z.bucht?.preisProTag ?? 0)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[14px] text-muted">Den Tagespreis änderst du direkt an der Werkstattbucht unter „Buchten &amp; Stationen“.</p>
      </section>
    </div>
  );
}
