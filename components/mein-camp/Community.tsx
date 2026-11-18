"use client";

import { useState } from "react";
import { EVENT_ORDNUNG, EVENT_ORTE } from "@/lib/daten/abo";
import { formatMonat, formatWochentag, isoHeute, plusTage, tagDesMonats } from "@/lib/datum";
import { useKonto } from "@/lib/mein-camp/store";
import { eventEntscheiden } from "@/lib/services/cockpit";
import { eventTeilnahme, eventVorschlagen, hilfeAntworten, hilfeEintragen, hilfeLoeschen } from "@/lib/services/mitglieder";
import type { CampEvent } from "@/lib/types";
import { BereichKopf, DemoAktion, Feldgruppe } from "./Teile";

export function Community() {
  const [reiter, setReiter] = useState<"events" | "hilfe">("events");
  return (
    <>
      <BereichKopf eyebrow="Community" titel="Zusammen baut es sich leichter">
        <p>Events aus dem Camp und von Mitgliedern, dazu die Hilfe-Börse für alles, wofür man vier Hände braucht.</p>
      </BereichKopf>
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Bereich">
        <button type="button" aria-pressed={reiter === "events"} className="chip" onClick={() => setReiter("events")}>Events</button>
        <button type="button" aria-pressed={reiter === "hilfe"} className="chip" onClick={() => setReiter("hilfe")}>Hilfe-Börse</button>
      </div>
      {reiter === "events" ? <Events /> : <Hilfe />}
    </>
  );
}

/* ---------- Events ---------- */

function Events() {
  const z = useKonto();
  const [offen, setOffen] = useState(false);
  const [gesendet, setGesendet] = useState(false);
  const heute = isoHeute();
  const [f, setF] = useState({ titel: "", beschreibung: "", datum: plusTage(heute, 14), von: "18:00", bis: "21:00", ort: EVENT_ORTE[0], max: "20" });
  if (!z) return null;

  const liste = z.events.filter((e) => e.datum >= heute && e.status !== "abgelehnt" && (e.status === "freigegeben" || e.vorgeschlagenVon === z.mitglied.vorname)).sort((a, b) => a.datum.localeCompare(b.datum));
  const gueltig = f.titel.trim() && f.datum >= heute && f.von < f.bis && Number(f.max) >= 2;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
      <div>
        <ul className="space-y-4">
          {liste.map((e) => <EventKarte key={e.id} e={e} />)}
        </ul>
        {liste.length === 0 && <p className="text-muted">Gerade steht nichts an. Schlag etwas vor.</p>}
      </div>

      <div className="space-y-5">
        {offen ? (
          <form
            className="buehne einblenden p-5"
            onSubmit={(ev) => {
              ev.preventDefault();
              if (!gueltig) return;
              eventVorschlagen({ titel: f.titel.trim(), beschreibung: f.beschreibung.trim(), datum: f.datum, von: f.von, bis: f.bis, ort: f.ort, maxPersonen: Number(f.max) });
              setOffen(false); setGesendet(true); setF({ ...f, titel: "", beschreibung: "" });
            }}
          >
            <h2 className="heading-m">Event vorschlagen</h2>
            <p className="mt-1 text-[15px] text-muted">Du bist die verantwortliche Person. Seb prüft nur, ob der Zeitpunkt passt.</p>
            <div className="mt-4 grid gap-4">
              <Feldgruppe label="Was hast du vor?"><input className="feld" placeholder="Grillabend, Kino, Stammtisch …" value={f.titel} onChange={(e) => setF({ ...f, titel: e.target.value })} /></Feldgruppe>
              <Feldgruppe label="Kurz beschrieben"><textarea className="feld min-h-20" value={f.beschreibung} onChange={(e) => setF({ ...f, beschreibung: e.target.value })} /></Feldgruppe>
              <Feldgruppe label="Datum"><input type="date" className="feld" min={heute} value={f.datum} onChange={(e) => e.target.value && setF({ ...f, datum: e.target.value })} /></Feldgruppe>
              <div className="grid grid-cols-2 gap-3">
                <Feldgruppe label="Von"><input type="time" className="feld" value={f.von} onChange={(e) => setF({ ...f, von: e.target.value })} /></Feldgruppe>
                <Feldgruppe label="Bis"><input type="time" className="feld" value={f.bis} onChange={(e) => setF({ ...f, bis: e.target.value })} /></Feldgruppe>
              </div>
              <Feldgruppe label="Ort in der Halle">
                <select className="feld" value={f.ort} onChange={(e) => setF({ ...f, ort: e.target.value })}>{EVENT_ORTE.map((o) => <option key={o}>{o}</option>)}</select>
              </Feldgruppe>
              <Feldgruppe label="Höchstens so viele Personen"><input className="feld" inputMode="numeric" value={f.max} onChange={(e) => setF({ ...f, max: e.target.value.replace(/\D/g, "") })} /></Feldgruppe>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="submit" className="btn btn-primary" disabled={!gueltig}>An Seb schicken</button>
              <button type="button" className="btn btn-ghost" onClick={() => setOffen(false)}>Abbrechen</button>
            </div>
          </form>
        ) : (
          <section className="karte p-5">
            <h2 className="heading-m">Du hast eine Idee?</h2>
            <p className="mt-2 text-muted">Schlag ein Event vor. Sobald Seb den Termin freigibt, ist es fix – ohne Mindestteilnehmerzahl.</p>
            {gesendet && <p className="einblenden mt-3 border border-line-strong p-3 text-[15px]" role="status">Dein Vorschlag ist bei Seb. Du bekommst eine Nachricht, sobald er freigegeben ist.</p>}
            <button type="button" className="btn btn-primary mt-4" onClick={() => { setOffen(true); setGesendet(false); }}>Event vorschlagen</button>
          </section>
        )}

        <section className="karte p-5">
          <h2 className="heading-s">Event-Ordnung</h2>
          <ul className="mt-3 space-y-2 text-[15px] text-muted">
            {EVENT_ORDNUNG.map((r) => <li key={r} className="flex gap-2"><span className="text-display" aria-hidden="true">–</span>{r}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}

function EventKarte({ e }: { e: CampEvent }) {
  const wartet = e.status === "vorgeschlagen";
  const voll = e.angemeldet >= e.maxPersonen;
  return (
    <li className="karte flex gap-4 p-4 lg:p-5">
      <div className="flex w-16 shrink-0 flex-col items-center self-start border border-line-strong py-2 text-center">
        <span className="label text-muted">{formatWochentag(e.datum)}</span>
        <span className="font-display text-4xl leading-none text-display">{tagDesMonats(e.datum)}</span>
        <span className="label mt-1 text-muted">{formatMonat(e.datum)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <span className={`badge ${wartet ? "" : "badge-live"}`}>{wartet ? "Wartet auf Freigabe" : "Findet statt"}</span>
        <h3 className="heading-m mt-2">{e.titel}</h3>
        <p className="mt-1 text-muted">{e.beschreibung}</p>
        <p className="mt-2 text-[15px]">{e.von} – {e.bis} Uhr · {e.ort}</p>
        <p className="text-[15px] text-muted">Verantwortlich: {e.verantwortlich}{e.vomCamp ? " · Event vom Camp" : " · von Mitgliedern"}</p>
        {wartet ? (
          <>
            <p className="mt-3 text-[15px] text-accent">Seb prüft, ob der Termin in den Hallenbetrieb passt.</p>
            <DemoAktion onClick={() => eventEntscheiden(e.id, true)}>So sieht es aus, wenn Seb freigibt</DemoAktion>
          </>
        ) : (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-40 flex-1">
              <div className="h-2 bg-surface-strong" role="img" aria-label={`${e.angemeldet} von ${e.maxPersonen} Plätzen belegt`}>
                <div className="h-full bg-gelb" style={{ width: `${Math.min(100, (e.angemeldet / e.maxPersonen) * 100)}%` }} />
              </div>
              <p className="mt-1 text-[14px] text-muted">{e.angemeldet} von {e.maxPersonen} dabei</p>
            </div>
            {e.ichDabei
              ? <button type="button" className="btn btn-outline btn-klein" onClick={() => eventTeilnahme(e.id, false)}>Du bist dabei · Abmelden</button>
              : <button type="button" className="btn btn-primary btn-klein" disabled={voll} onClick={() => eventTeilnahme(e.id, true)}>{voll ? "Ausgebucht" : "Ich komme"}</button>}
          </div>
        )}
      </div>
    </li>
  );
}

/* ---------- Hilfe-Börse ---------- */

function Hilfe() {
  const z = useKonto();
  const [filter, setFilter] = useState<"alle" | "gesuch" | "angebot">("alle");
  const [offen, setOffen] = useState(false);
  const [geantwortet, setGeantwortet] = useState<string[]>([]);
  const [f, setF] = useState({ art: "gesuch" as "gesuch" | "angebot", titel: "", text: "", wann: "" });
  if (!z) return null;
  const liste = z.hilfe.filter((h) => filter === "alle" || h.art === filter);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
      <div>
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter">
          {([["alle", "Alles"], ["gesuch", "Gesuche"], ["angebot", "Angebote"]] as const).map(([id, name]) => (
            <button key={id} type="button" className="chip" aria-pressed={filter === id} onClick={() => setFilter(id)}>{name}</button>
          ))}
        </div>
        <ul className="space-y-4">
          {liste.map((h) => (
            <li key={h.id} className="karte p-4 lg:p-5">
              <p className="label text-accent">{h.art === "gesuch" ? "Sucht Hilfe" : "Bietet Hilfe"}</p>
              <h3 className="heading-m mt-1">{h.titel}</h3>
              <p className="mt-2 text-muted">{h.text}</p>
              <p className="mt-2 text-[15px]">{h.von}{h.fahrzeug ? ` · ${h.fahrzeug}` : ""} · {h.wann}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[14px] text-muted">{h.antworten} {h.antworten === 1 ? "Antwort" : "Antworten"}</span>
                {h.eigener
                  ? <button type="button" className="btn btn-ghost !min-h-0 !py-2 !text-muted" onClick={() => hilfeLoeschen(h.id)}>Dein Eintrag · Löschen</button>
                  : geantwortet.includes(h.id)
                    ? <span className="font-semibold text-display" role="status">{h.von} bekommt deine Nachricht.</span>
                    : <button type="button" className="btn btn-outline btn-klein" onClick={() => { hilfeAntworten(h.id); setGeantwortet([...geantwortet, h.id]); }}>{h.art === "gesuch" ? "Ich helfe" : "Hab Interesse"}</button>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-5">
        {offen ? (
          <form
            className="buehne einblenden p-5"
            onSubmit={(e) => { e.preventDefault(); if (!f.titel.trim()) return; hilfeEintragen({ art: f.art, titel: f.titel.trim(), text: f.text.trim(), wann: f.wann.trim() || "nach Absprache" }); setOffen(false); setF({ art: "gesuch", titel: "", text: "", wann: "" }); }}
          >
            <h2 className="heading-m">Eintrag schreiben</h2>
            <div className="mt-4 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Art">
              <button type="button" role="radio" aria-checked={f.art === "gesuch"} className="option" onClick={() => setF({ ...f, art: "gesuch" })}>Ich suche</button>
              <button type="button" role="radio" aria-checked={f.art === "angebot"} className="option" onClick={() => setF({ ...f, art: "angebot" })}>Ich biete</button>
            </div>
            <div className="mt-4 grid gap-4">
              <Feldgruppe label="Worum geht’s?"><input className="feld" placeholder="Wer hilft mir Samstag beim Dachfenster?" value={f.titel} onChange={(e) => setF({ ...f, titel: e.target.value })} /></Feldgruppe>
              <Feldgruppe label="Details"><textarea className="feld min-h-20" value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} /></Feldgruppe>
              <Feldgruppe label="Wann?"><input className="feld" placeholder="Samstag, ab 10 Uhr" value={f.wann} onChange={(e) => setF({ ...f, wann: e.target.value })} /></Feldgruppe>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="submit" className="btn btn-primary" disabled={!f.titel.trim()}>Veröffentlichen</button>
              <button type="button" className="btn btn-ghost" onClick={() => setOffen(false)}>Abbrechen</button>
            </div>
          </form>
        ) : (
          <section className="karte p-5">
            <h2 className="heading-m">Vier Hände gesucht?</h2>
            <p className="mt-2 text-muted">Schreib, wobei du Hilfe brauchst – oder was du anderen anbieten kannst.</p>
            <button type="button" className="btn btn-primary mt-4" onClick={() => setOffen(true)}>Eintrag schreiben</button>
          </section>
        )}
        <p className="border border-line p-4 text-[15px] text-muted">
          <strong className="font-semibold text-ink">Gut zu wissen:</strong> Hilfe unter Mitgliedern ist privat und nicht im Auftrag von Camp &amp; Camper. Arbeiten an Gas und 230 V sind ausgenommen.
        </p>
      </div>
    </div>
  );
}
