"use client";

import { useState } from "react";
import { EVENT_ORTE } from "@/lib/daten/abo";
import { euro, formatLang, plusTage } from "@/lib/datum";
import { workshopStatus } from "@/lib/services/buchung";
import { eventEntscheiden, eventOrdnungSpeichern, eventSpeichern, workshopAbsagen, workshopSpeichern } from "@/lib/services/cockpit";
import type { CampEvent, Workshop } from "@/lib/types";
import { IconPlus } from "../Icons";
import { Auswahl, CKopf, Eingabe, Reiter, Textfeld, useCockpit, useGespeichert } from "./Teile";

const zahl = (v: string) => Number(String(v).replace(",", ".")) || 0;

export function Workshops() {
  const c = useCockpit();
  const [reiter, setReiter] = useState<"workshops" | "events">("workshops");
  if (!c) return null;
  const offen = c.konto.events.filter((e) => e.status === "vorgeschlagen").length;
  return (
    <>
      <CKopf titel="Workshops & Events"><p>Termine anlegen, Teilnehmer im Blick behalten, Event-Vorschläge der Mitglieder freigeben.</p></CKopf>
      <Reiter label="Bereich" aktiv={reiter} onWahl={setReiter} werte={[["workshops", "Workshops"], ["events", "Events", offen]]} />
      {reiter === "workshops" ? <WorkshopPflege /> : <EventPflege />}
    </>
  );
}

/* ---------- Workshops ---------- */

type WForm = Omit<Workshop, "id"> & { id?: string };

function WorkshopPflege() {
  const c = useCockpit();
  const [form, setForm] = useState<WForm | null>(null);
  const [offen, setOffen] = useState<string | null>(null);
  const [absage, setAbsage] = useState<{ id: string; grund: string } | null>(null);
  if (!c) return null;
  const { camp, heute } = c;
  const liste = [...camp.workshops].sort((a, b) => a.datum.localeCompare(b.datum));
  const neu = (): WForm => ({ titel: "", kurz: "", beschreibung: "", datum: plusTage(heute, 21), zeit: "10 – 16 Uhr", dauer: "1 Tag", preis: 129, minTeilnehmer: 4, maxTeilnehmer: 8, angemeldet: 0, level: "Einsteiger", leitung: "Seb", inhalte: [], absagefristTage: 7, teilnehmer: [] });

  if (form) return <WorkshopFormular key={form.id ?? "neu"} start={form} onFertig={() => setForm(null)} />;

  return (
    <>
      <button type="button" className="btn btn-primary mb-5" onClick={() => setForm(neu())}><IconPlus width={18} height={18} /> Workshop anlegen</button>
      <ul className="space-y-4">
        {liste.map((w) => {
          const status = workshopStatus(w);
          const erreicht = w.angemeldet >= w.minTeilnehmer;
          const frist = plusTage(w.datum, -(w.absagefristTage ?? 7));
          const vorbei = w.datum < heute;
          return (
            <li key={w.id} className={`karte p-4 lg:p-5 ${w.abgesagt || vorbei ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="label text-muted">{formatLang(w.datum)} · {w.zeit} · {euro(w.preis)}</p>
                  <h2 className="heading-m mt-1">{w.titel}</h2>
                </div>
                <span className={`badge ${w.abgesagt ? "badge-leise" : erreicht ? "badge-live" : ""}`}>{w.abgesagt ? "Abgesagt" : status === "ausgebucht" ? "Ausgebucht" : erreicht ? "Findet statt" : `Noch ${w.minTeilnehmer - w.angemeldet} bis zur Mindestzahl`}</span>
              </div>
              <div className="mt-3 flex max-w-md gap-1" role="img" aria-label={`${w.angemeldet} von ${w.maxTeilnehmer} Plätzen, Mindestzahl ${w.minTeilnehmer}`}>
                {Array.from({ length: w.maxTeilnehmer }, (_, i) => (
                  <span key={i} className="relative h-4 flex-1">
                    <span className={`block h-full border ${i < w.angemeldet ? "border-gelb bg-gelb" : i < w.minTeilnehmer ? "border-gelb/70" : "border-line"}`} />
                    {i === w.minTeilnehmer - 1 && <span className="absolute -right-[3px] -top-1 h-6 w-[2px] bg-lila-hell" />}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[15px] text-muted">
                {w.angemeldet} angemeldet · Mindestzahl {w.minTeilnehmer} · höchstens {w.maxTeilnehmer}
                {!w.abgesagt && !erreicht && !vorbei && <> · <span className={frist <= heute ? "font-semibold text-display" : ""}>Absagefrist {formatLang(frist)}</span></>}
              </p>
              {!w.abgesagt && !vorbei && (
                <div className="mt-3 flex flex-wrap gap-x-5">
                  <button type="button" className="btn btn-ghost" aria-expanded={offen === w.id} onClick={() => setOffen(offen === w.id ? null : w.id)}>Teilnehmerliste ({w.teilnehmer?.length ?? 0})</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setForm(w)}>Bearbeiten</button>
                  <button type="button" className="btn btn-ghost !text-muted" onClick={() => setAbsage({ id: w.id, grund: erreicht ? "" : "Die Mindestzahl wurde leider nicht erreicht." })}>Absagen</button>
                </div>
              )}
              {offen === w.id && (
                <ul className="einblenden mt-2 divide-y divide-line border-y border-line text-[15px]">
                  {(w.teilnehmer ?? []).length === 0 && <li className="py-2 text-muted">Noch niemand angemeldet.</li>}
                  {(w.teilnehmer ?? []).map((t, i) => (
                    <li key={i} className="flex flex-wrap justify-between gap-x-4 py-2"><span className="font-semibold">{t.name}</span><span className="text-muted">{[t.email, t.telefon].filter(Boolean).join(" · ")}</span></li>
                  ))}
                </ul>
              )}
              {absage?.id === w.id && (
                <div className="buehne einblenden mt-3 p-4">
                  <Textfeld label={`Nachricht an alle ${w.teilnehmer?.length ?? 0} Angemeldeten`} wert={absage.grund} onChange={(v) => setAbsage({ id: w.id, grund: v })} zeilen={2} hilfe="Alle bekommen automatisch Bescheid. Niemand zahlt etwas." />
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button type="button" className="btn btn-primary" onClick={() => { workshopAbsagen(w.id, absage.grund.trim()); setAbsage(null); }}>Workshop absagen</button>
                    <button type="button" className="btn btn-ghost" onClick={() => setAbsage(null)}>Doch nicht</button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

function WorkshopFormular({ start, onFertig }: { start: WForm; onFertig: () => void }) {
  const c = useCockpit();
  const [w, setW] = useState(start);
  const [inhalte, setInhalte] = useState(start.inhalte.join("\n"));
  if (!c) return null;
  const bilder = c.camp.medien.filter((m) => m.kategorie === "workshop" || m.kategorie === "halle");
  const gueltig = w.titel.trim() && w.minTeilnehmer >= 1 && w.maxTeilnehmer >= w.minTeilnehmer;
  return (
    <form className="buehne p-5 lg:p-6" onSubmit={(e) => { e.preventDefault(); if (!gueltig) return; workshopSpeichern({ ...w, titel: w.titel.trim(), inhalte: inhalte.split("\n").map((x) => x.trim()).filter(Boolean) }); onFertig(); }}>
      <div className="flex items-start justify-between gap-4">
        <h2 className="heading-l">{w.id ? "Workshop bearbeiten" : "Workshop anlegen"}</h2>
        <button type="button" className="btn btn-ghost !min-h-0" onClick={onFertig}>Abbrechen</button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Eingabe label="Titel" wert={w.titel} onChange={(v) => setW({ ...w, titel: v })} className="sm:col-span-2" />
        <Eingabe label="Termin" typ="date" wert={w.datum} onChange={(v) => v && setW({ ...w, datum: v })} />
        <Eingabe label="Uhrzeit" wert={w.zeit} onChange={(v) => setW({ ...w, zeit: v })} />
        <Textfeld label="Kurzbeschreibung" wert={w.kurz} onChange={(v) => setW({ ...w, kurz: v })} zeilen={2} className="sm:col-span-2 lg:col-span-4" />
        <Textfeld label="Beschreibung" wert={w.beschreibung} onChange={(v) => setW({ ...w, beschreibung: v })} className="sm:col-span-2 lg:col-span-4" />
        <Eingabe label="Preis pro Person (€)" inputMode="numeric" wert={w.preis} onChange={(v) => setW({ ...w, preis: zahl(v) })} />
        <Eingabe label="Mindestzahl" inputMode="numeric" wert={w.minTeilnehmer} onChange={(v) => setW({ ...w, minTeilnehmer: Math.round(zahl(v)) })} />
        <Eingabe label="Höchstzahl" inputMode="numeric" wert={w.maxTeilnehmer} onChange={(v) => setW({ ...w, maxTeilnehmer: Math.round(zahl(v)) })} />
        <Eingabe label="Absagefrist (Tage vorher)" inputMode="numeric" wert={w.absagefristTage ?? 7} onChange={(v) => setW({ ...w, absagefristTage: Math.round(zahl(v)) })} />
        <Eingabe label="Dauer" wert={w.dauer} onChange={(v) => setW({ ...w, dauer: v })} />
        <Auswahl label="Für wen" wert={w.level} onChange={(v) => setW({ ...w, level: v as Workshop["level"] })} optionen={[["Einsteiger", "Einsteiger"], ["Fortgeschritten", "Fortgeschritten"]]} />
        <Eingabe label="Leitung" wert={w.leitung} onChange={(v) => setW({ ...w, leitung: v })} />
        <Auswahl label="Bild aus den Medien" wert={w.bild ?? ""} onChange={(v) => setW({ ...w, bild: v || undefined })} optionen={[["", "Kein Bild"], ...bilder.map((m) => [m.id, m.name] as const)]} />
        <Textfeld label="Inhalte" wert={inhalte} onChange={setInhalte} hilfe="Ein Punkt pro Zeile." className="sm:col-span-2 lg:col-span-4" />
      </div>
      {!gueltig && <p className="mt-3 text-[15px]">Titel fehlt, oder die Höchstzahl liegt unter der Mindestzahl.</p>}
      <button type="submit" className="btn btn-primary mt-5" disabled={!gueltig}>{w.id ? "Speichern" : "Workshop veröffentlichen"}</button>
    </form>
  );
}

/* ---------- Events ---------- */

type EForm = Pick<CampEvent, "titel" | "beschreibung" | "datum" | "von" | "bis" | "ort" | "maxPersonen"> & { id?: string };

function EventPflege() {
  const c = useCockpit();
  const [grund, setGrund] = useState<Record<string, string>>({});
  const [form, setForm] = useState<EForm | null>(null);
  const [ordnung, setOrdnung] = useState<string | null>(null);
  const [ok, markiere] = useGespeichert();
  if (!c) return null;
  const { camp, konto, heute } = c;
  const vorschlaege = konto.events.filter((e) => e.status === "vorgeschlagen");
  const kommend = konto.events.filter((e) => e.status === "freigegeben" && e.datum >= heute).sort((a, b) => a.datum.localeCompare(b.datum));
  const regeln = ordnung ?? camp.eventOrdnung.join("\n");

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div>
        <h2 className="heading-m">Zur Freigabe</h2>
        {vorschlaege.length === 0 && <p className="mt-2 text-muted">Kein Vorschlag offen.</p>}
        <ul className="mt-3 space-y-4">
          {vorschlaege.map((e) => (
            <li key={e.id} className="buehne p-4 lg:p-5">
              <p className="label">Vorschlag von {e.vorgeschlagenVon} · verantwortlich: {e.verantwortlich}</p>
              <h3 className="heading-m mt-1">{e.titel}</h3>
              <p className="mt-1 text-muted">{e.beschreibung}</p>
              <p className="mt-2 font-semibold">{formatLang(e.datum)} · {e.von} – {e.bis} Uhr · {e.ort} · bis {e.maxPersonen} Personen</p>
              <Eingabe label="Kurze Begründung (freiwillig)" wert={grund[e.id] ?? ""} placeholder="z. B. Passt, die Halle ist ab 18 Uhr frei." onChange={(v) => setGrund({ ...grund, [e.id]: v })} className="mt-3" />
              <div className="mt-3 flex flex-wrap gap-3">
                <button type="button" className="btn btn-primary" onClick={() => eventEntscheiden(e.id, true, grund[e.id]?.trim())}>Freigeben</button>
                <button type="button" className="btn btn-outline" onClick={() => eventEntscheiden(e.id, false, grund[e.id]?.trim())}>Ablehnen</button>
              </div>
              <p className="mt-2 text-[14px] text-muted">Du prüfst nur, ob der Zeitpunkt passt. Freigegebene Events sind fix – ohne Mindestteilnehmerzahl.</p>
            </li>
          ))}
        </ul>

        <h2 className="heading-m mt-8">Kommende Events</h2>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {kommend.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="min-w-0">
                <span className="block font-semibold">{e.titel}</span>
                <span className="block text-[15px] text-muted">{formatLang(e.datum)} · {e.von} Uhr · {e.ort} · {e.angemeldet}/{e.maxPersonen} · {e.vomCamp ? "vom Camp" : `von ${e.vorgeschlagenVon}`}</span>
              </span>
              <button type="button" className="btn btn-ghost btn-klein" onClick={() => setForm(e)}>Bearbeiten</button>
            </li>
          ))}
          {kommend.length === 0 && <li className="py-3 text-muted">Noch nichts im Kalender.</li>}
        </ul>
      </div>

      <div className="space-y-5">
        {form ? (
          <form className="buehne einblenden p-5" onSubmit={(e) => { e.preventDefault(); if (!form.titel.trim()) return; eventSpeichern({ ...form, titel: form.titel.trim() }); setForm(null); }}>
            <h2 className="heading-m">{form.id ? "Event bearbeiten" : "Eigenes Event anlegen"}</h2>
            <div className="mt-4 grid gap-3">
              <Eingabe label="Titel" wert={form.titel} onChange={(v) => setForm({ ...form, titel: v })} />
              <Textfeld label="Beschreibung" wert={form.beschreibung} onChange={(v) => setForm({ ...form, beschreibung: v })} zeilen={2} />
              <Eingabe label="Datum" typ="date" wert={form.datum} onChange={(v) => v && setForm({ ...form, datum: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Eingabe label="Von" typ="time" wert={form.von} onChange={(v) => setForm({ ...form, von: v })} />
                <Eingabe label="Bis" typ="time" wert={form.bis} onChange={(v) => setForm({ ...form, bis: v })} />
              </div>
              <Auswahl label="Ort in der Halle" wert={form.ort} onChange={(v) => setForm({ ...form, ort: v })} optionen={[...new Set([...EVENT_ORTE, form.ort])].map((o) => [o, o] as const)} />
              <Eingabe label="Obergrenze Personen" inputMode="numeric" wert={form.maxPersonen} onChange={(v) => setForm({ ...form, maxPersonen: Math.max(1, Math.round(zahl(v))) })} />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="submit" className="btn btn-primary" disabled={!form.titel.trim()}>{form.id ? "Speichern" : "Event anlegen"}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Abbrechen</button>
            </div>
          </form>
        ) : (
          <section className="karte p-5">
            <h2 className="heading-m">Eigenes Event</h2>
            <p className="mt-2 text-muted">Deine Events brauchen keine Freigabe und sind sofort für alle mit Konto sichtbar.</p>
            <button type="button" className="btn btn-primary mt-4" onClick={() => setForm({ titel: "", beschreibung: "", datum: plusTage(heute, 10), von: "18:00", bis: "21:00", ort: EVENT_ORTE[0], maxPersonen: 20 })}><IconPlus width={18} height={18} /> Event anlegen</button>
          </section>
        )}

        <form className="karte p-5" onSubmit={(e) => { e.preventDefault(); eventOrdnungSpeichern(regeln.split("\n")); setOrdnung(null); markiere(); }}>
          <h2 className="heading-m">Event-Ordnung</h2>
          <Textfeld label="Regeln" wert={regeln} onChange={setOrdnung} zeilen={6} hilfe="Eine Regel pro Zeile. Steht im Mitgliederbereich bei den Events." className="mt-3" />
          <div className="mt-3 flex flex-wrap items-center gap-3"><button type="submit" className="btn btn-outline">Speichern</button>{ok}</div>
        </form>
      </div>
    </div>
  );
}
