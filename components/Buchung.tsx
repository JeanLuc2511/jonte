"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FAHRZEUGE } from "@/lib/daten/fahrzeuge";
import { ABO } from "@/lib/daten/abo";
import { KONTO_VORTEILE } from "@/lib/daten/site";
import { useKonto, useRolle } from "@/lib/mein-camp/store";
import { darf } from "@/lib/rechte";
import { buchungMerken } from "@/lib/services/mitglieder";
import { ZEITFENSTER } from "@/lib/daten/leistungen";
import { euro, formatLang, formatZeitraum, naechster, plusTage } from "@/lib/datum";
import {
  STUNDENPREIS, belegungImZeitraum, buchtPreis, getBelegung, sendeBuchung, workshopStatus, workshopText,
} from "@/lib/services/buchung";
import type { BuchungsBestaetigung, Leistung, LeistungId, Workshop, Zone } from "@/lib/types";
import { useHeute } from "@/lib/warenkorb";
import { Beispiel } from "./Bausteine";
import { IconHaken } from "./Icons";

interface Props {
  leistungen: Leistung[];
  buchten: Zone[];
  workshops: Workshop[];
  start: { leistung?: LeistungId; bucht?: string; workshop?: string; von?: string; bis?: string };
}

const TASTEN = "ABCDEF";

export function Buchung({ leistungen, buchten, workshops, start }: Props) {
  const heute = useHeute();
  const [leistung, setLeistung] = useState<LeistungId>(start.leistung ?? (start.workshop ? "workshop" : "bucht"));
  const [modus, setModus] = useState<"tage" | "stunden">("tage");
  const [zeit, setZeit] = useState<{ von?: string; bis?: string }>({ von: start.von, bis: start.bis });
  const [bucht, setBucht] = useState<string | undefined>(start.bucht);
  const [workshop, setWorkshop] = useState<string | undefined>(start.workshop);
  const [uhrzeit, setUhrzeit] = useState(ZEITFENSTER[0]);
  const [stunden, setStunden] = useState(1);
  const [gast, setGast] = useState({ vorname: "", nachname: "", email: "", telefon: "", fahrzeug: "" });
  const konto = useKonto();
  const rolle = useRolle() ?? "gast";
  const eingeloggt = rolle !== "gast" && konto !== null;
  const meinFahrzeug = eingeloggt ? konto.fahrzeuge.find((f) => f.id === konto.aktivesFahrzeugId) : undefined;
  const k = eingeloggt
    ? { vorname: konto.mitglied.vorname, nachname: konto.mitglied.nachname || "–", email: konto.mitglied.email, telefon: konto.mitglied.telefon ?? "", fahrzeug: meinFahrzeug?.spitzname ?? "" }
    : gast;
  const setK = setGast;
  const inklusive = darf(rolle, "werkzeug.inklusive");
  const fensterTage = darf(rolle, "buchung.frueher") ? ABO.buchungsfensterTage.mitglied : ABO.buchungsfensterTage.standard;
  const spaetestens = heute ? plusTage(heute, fensterTage) : undefined;
  const passt = (b: Zone) => !meinFahrzeug || b.bucht!.maxLaengeM >= meinFahrzeug.laengeM;
  const [status, setStatus] = useState<"offen" | "sendet">("offen");
  const [fertig, setFertig] = useState<BuchungsBestaetigung | null>(null);

  const von = zeit.von ?? (heute ? naechster(heute, 6) : undefined);
  const bis = modus === "stunden" || leistung !== "bucht" ? von : (zeit.bis && von && zeit.bis >= von ? zeit.bis : von ? plusTage(von, 1) : undefined);

  const belegung = useMemo(() => (heute ? getBelegung(heute) : []), [heute]);
  const belegt = useMemo(
    () => new Set(von && bis ? belegungImZeitraum(belegung, von, bis).map((b) => b.buchtId) : []),
    [belegung, von, bis],
  );
  const gewaehlteBucht = buchten.find((b) => b.id === bucht && !belegt.has(b.id) && passt(b));
  const gewaehlterWorkshop = workshops.find((w) => w.id === workshop && workshopStatus(w) !== "ausgebucht");
  const aktuelle = leistungen.find((l) => l.id === leistung)!;

  // Zusammenfassung
  let zeile = "";
  let summe: number | null = null;
  let zahlHinweis = "Zahlung vor Ort oder per Rechnung";
  let fehlt: string | null = null;
  let pauschale: { tage: number; betrag: number } | null = null;
  if (leistung === "bucht") {
    if (modus === "tage") {
      if (!gewaehlteBucht) fehlt = "Wähl eine freie Werkstattbucht.";
      else if (von && bis) {
        const p = buchtPreis(gewaehlteBucht.bucht!.preisProTag, von, bis);
        summe = p.summe;
        if (!inklusive) { pauschale = { tage: p.tage, betrag: p.tage * ABO.werkzeugpauschaleProTag }; summe += pauschale.betrag; }
        zeile = `${gewaehlteBucht.name} · ${formatZeitraum(von, bis)} · ${p.tage} ${p.tage === 1 ? "Tag" : "Tage"}${p.rabatt ? " · 15 % Wochenrabatt" : ""}`;
      }
    } else if (von) {
      summe = STUNDENPREIS * stunden;
      zeile = `Werkstattbucht stundenweise · ${formatLang(von)} · ab ${uhrzeit} Uhr · ${stunden} Std.`;
    }
  } else if (leistung === "workshop") {
    if (!gewaehlterWorkshop) fehlt = "Wähl einen Workshop.";
    else {
      summe = gewaehlterWorkshop.preis;
      zeile = `${gewaehlterWorkshop.titel} · ${formatLang(gewaehlterWorkshop.datum)} · ${gewaehlterWorkshop.zeit}`;
      zahlHinweis = workshopStatus(gewaehlterWorkshop) === "findet-statt"
        ? "Findet statt – Zahlungslink kommt per Mail"
        : "Reservierung – du zahlst erst, wenn der Workshop zustande kommt";
    }
  } else if (von) {
    summe = aktuelle.preis;
    zeile = `${aktuelle.name} · ${formatLang(von)} · ${uhrzeit} Uhr`;
  }
  if (!fehlt && (!k.vorname.trim() || !k.nachname.trim())) fehlt = "Trag deinen Namen ein.";
  if (!fehlt && !/^\S+@\S+\.\S+$/.test(k.email)) fehlt = "Trag deine E-Mail-Adresse ein.";

  async function absenden() {
    if (fehlt || !von) return;
    setStatus("sendet");
    const b = await sendeBuchung({
      leistung, objektId: leistung === "bucht" ? gewaehlteBucht?.id : gewaehlterWorkshop?.id,
      von, bis, uhrzeit, kontakt: k, alsGast: !eingeloggt,
    });
    if (eingeloggt && summe !== null) {
      buchungMerken({
        leistung, titel: leistung === "bucht" ? (modus === "tage" && gewaehlteBucht ? gewaehlteBucht.name : "Werkstattbucht stundenweise") : leistung === "workshop" ? `Workshop: ${gewaehlterWorkshop?.titel}` : aktuelle.name,
        buchtId: modus === "tage" ? gewaehlteBucht?.id : undefined, von: leistung === "workshop" && gewaehlterWorkshop ? gewaehlterWorkshop.datum : von,
        bis: leistung === "workshop" && gewaehlterWorkshop ? gewaehlterWorkshop.datum : bis ?? von, uhrzeit, fahrzeugId: meinFahrzeug?.id, summe,
      });
    }
    setFertig(b);
    window.scrollTo({ top: 0 });
  }

  if (fertig) {
    return (
      <div className="buehne">
        <div className="seite einblenden grid gap-10 py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-20" role="status">
          <div>
            <p className="eyebrow">Anfrage {fertig.nummer}</p>
            <h1 className="display-xl mt-6">Steht, {k.vorname}.</h1>
            <p className="mt-6 text-lg">{zeile}</p>
            {summe !== null && <p className="mt-2 font-display text-4xl">{euro(summe)}</p>}
            <p className="mt-2 text-muted">{zahlHinweis}</p>
            <p className="mt-6 max-w-lg border border-line p-3 text-[15px]">
              Demo-Hinweis: Es wurde nichts verbindlich gebucht. Später geht deine Buchung hier ins Buchungssystem und du bekommst die Bestätigung an {k.email}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/werkstatt" className="btn btn-outline">Zurück zur Halle</Link>
              <Link href="/shop" className="btn btn-ghost">Material im Fachshop ansehen</Link>
            </div>
          </div>
          {eingeloggt ? (
            <div className="border border-line-strong p-6 lg:p-8">
              <p className="label">Gebucht mit deinem Konto</p>
              <h2 className="heading-l mt-2">Steht in Mein Camp</h2>
              <p className="mt-3 text-muted">Die Buchung findest du in deiner Übersicht. {inklusive ? "Das Werkzeug ist für dich inklusive." : `Als Mitglied sparst du die Werkzeugpauschale – ab ${ABO.lohntAbTagen} Tagen im Monat lohnt sich das Abo.`}</p>
              <Link href="/mein-camp" className="btn btn-primary mt-7 w-full">Zu Mein Camp</Link>
              {!inklusive && <Link href="/mein-camp/mitgliedschaft" className="btn btn-outline mt-3 w-full">Mitglied werden</Link>}
            </div>
          ) : (
          <div className="border border-line-strong p-6 lg:p-8">
            <p className="label">Du hast als Gast gebucht</p>
            <h2 className="heading-l mt-2">Das bringt dir ein Konto</h2>
            <ul className="mt-5 space-y-4">
              {KONTO_VORTEILE.map((v) => (
                <li key={v.titel} className="flex gap-3">
                  <IconHaken className="mt-0.5 shrink-0" width={22} height={22} />
                  <span><strong className="font-semibold">{v.titel}.</strong> <span className="text-muted">{v.text}</span></span>
                </li>
              ))}
            </ul>
            <Link href="/mein-camp" className="btn btn-primary mt-7 w-full">Kostenloses Konto anlegen</Link>
            <p className="mt-3 text-[14px] text-muted">Das Konto kostet nichts. Die Mitgliedschaft kannst du später jederzeit dazubuchen.</p>
          </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="buehne">
      <div className="seite grid gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14 lg:py-16">
        <div className="space-y-12">
          {/* 1 */}
          <Schritt nr="1" titel="Was möchtest du buchen?">
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Leistung">
              {leistungen.map((l, i) => (
                <button key={l.id} type="button" role="radio" aria-checked={leistung === l.id} className="option !items-start" onClick={() => setLeistung(l.id)}>
                  <span className="option-key">{TASTEN[i]}</span>
                  <span>
                    {l.name}
                    <span className="block font-sans text-[14px] font-normal text-muted">{l.kurz}</span>
                    <span className="mt-1 block text-[15px] font-semibold">{l.preisText}</span>
                  </span>
                </button>
              ))}
            </div>
          </Schritt>

          {/* 2 */}
          {leistung === "bucht" && (
            <Schritt nr="2" titel="Wann und wo?">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Dauer">
                <button type="button" className="chip" aria-pressed={modus === "tage"} onClick={() => setModus("tage")}>Tageweise</button>
                <button type="button" className="chip" aria-pressed={modus === "stunden"} onClick={() => setModus("stunden")}>Nur ein paar Stunden</button>
              </div>
              {modus === "tage" ? (
                <>
                  <div className="mt-5 grid max-w-md grid-cols-2 gap-3">
                    <Datum label="Von" wert={von} min={heute} max={spaetestens} onChange={(v) => setZeit({ von: v, bis: bis && bis >= v ? bis : plusTage(v, 1) })} />
                    <Datum label="Bis" wert={bis} min={von} max={spaetestens} onChange={(v) => setZeit({ von, bis: v })} />
                  </div>
                  <p className="mt-2 text-[14px] text-muted">
                    Buchbar bis {spaetestens ? formatLang(spaetestens) : "…"} – {darf(rolle, "buchung.frueher") ? `als Mitglied ${ABO.buchungsfensterTage.mitglied} Tage im Voraus.` : `${ABO.buchungsfensterTage.standard} Tage im Voraus, als Mitglied ${ABO.buchungsfensterTage.mitglied}.`}
                  </p>
                  {meinFahrzeug && <p className="mt-4 border border-line p-3 text-[15px]">Wir zeigen dir, welche Werkstattbuchten für <strong className="font-semibold">{meinFahrzeug.spitzname}</strong> ({String(meinFahrzeug.laengeM).replace(".", ",")} m) passen.</p>}
                  <p className="feld-label mt-6">Werkstattbucht <Beispiel>· Beispiel-Belegung</Beispiel></p>
                  <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Werkstattbucht">
                    {buchten.map((b) => {
                      const zuKurz = !passt(b);
                      const voll = belegt.has(b.id) || zuKurz;
                      return (
                        <button
                          key={b.id} type="button" role="radio" aria-checked={gewaehlteBucht?.id === b.id}
                          disabled={voll} className="option disabled:cursor-not-allowed disabled:opacity-45" onClick={() => setBucht(b.id)}
                        >
                          <span className="option-key">{b.kurz}</span>
                          <span className="flex-1">
                            {b.bucht!.groesse} · bis {String(b.bucht!.maxLaengeM).replace(".", ",")} m
                            <span className="block font-sans text-[14px] font-normal text-muted">
                              {zuKurz ? `Zu kurz für ${meinFahrzeug?.spitzname}` : voll ? "In diesem Zeitraum belegt" : `${euro(b.bucht!.preisProTag)} pro Tag`}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-[15px] text-muted">
                    Lieber erst schauen, wo was steht? <Link href="/werkstatt" className="font-semibold text-ink underline underline-offset-4">Zum Hallenplan</Link>
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-4 max-w-lg text-muted">
                    Für die schnelle Reparatur oder einen einzelnen Einbau. Wir stellen dich in eine freie Werkstattbucht, Werkzeug ist dabei.
                  </p>
                  <div className="mt-5 grid max-w-md grid-cols-2 gap-3">
                    <Datum label="Tag" wert={von} min={heute} onChange={(v) => setZeit({ von: v })} />
                    <label>
                      <span className="feld-label">Dauer</span>
                      <select className="feld" value={stunden} onChange={(e) => setStunden(Number(e.target.value))}>
                        {[1, 2, 3, 4].map((s) => <option key={s} value={s}>{s} {s === 1 ? "Stunde" : "Stunden"} · {euro(s * STUNDENPREIS)}</option>)}
                      </select>
                    </label>
                  </div>
                  <Zeitwahl wert={uhrzeit} onChange={setUhrzeit} />
                </>
              )}
            </Schritt>
          )}

          {leistung === "workshop" && (
            <Schritt nr="2" titel="Welcher Workshop?">
              <div className="grid gap-3" role="radiogroup" aria-label="Workshop">
                {workshops.map((w) => {
                  const voll = workshopStatus(w) === "ausgebucht";
                  return (
                    <button
                      key={w.id} type="button" role="radio" aria-checked={gewaehlterWorkshop?.id === w.id} disabled={voll}
                      className="option disabled:cursor-not-allowed disabled:opacity-45" onClick={() => setWorkshop(w.id)}
                    >
                      <span className="flex-1">
                        {w.titel}
                        <span className="block font-sans text-[14px] font-normal text-muted">{formatLang(w.datum)} · {w.zeit} · {workshopText(w)}</span>
                      </span>
                      <span className="shrink-0 font-semibold">{euro(w.preis)}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[15px] text-muted">
                Du reservierst nur. Gezahlt wird erst, wenn genug Leute dabei sind und der Workshop sicher stattfindet.
              </p>
            </Schritt>
          )}

          {(leistung === "beratung" || leistung === "gaspruefung") && (
            <Schritt nr="2" titel="Wann passt es dir?">
              <ul className="mb-5 space-y-1.5">
                {aktuelle.punkte.map((p) => <li key={p} className="flex gap-2"><IconHaken width={20} height={20} className="mt-0.5 shrink-0" /> {p}</li>)}
              </ul>
              <div className="max-w-[13.5rem]">
                <Datum label="Tag" wert={von} min={heute} onChange={(v) => setZeit({ von: v })} />
              </div>
              <Zeitwahl wert={uhrzeit} onChange={setUhrzeit} />
            </Schritt>
          )}

          {/* 3 */}
          <Schritt nr="3" titel="Wer kommt?">
            {eingeloggt ? (
              <div className="border border-line p-4">
                <p className="font-semibold">{konto.mitglied.vorname} {konto.mitglied.nachname} · {konto.mitglied.email}</p>
                <p className="text-muted">{meinFahrzeug ? `Mit ${meinFahrzeug.spitzname} (${meinFahrzeug.hersteller} ${meinFahrzeug.modell})` : "Noch kein Fahrzeug in der Garage"} · Daten aus Mein Camp</p>
              </div>
            ) : (
            <>
            <p className="-mt-1 mb-5 max-w-lg text-muted">Du buchst als Gast – ein Konto brauchst du nicht.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Feld label="Vorname" wert={k.vorname} auto="given-name" onChange={(v) => setK({ ...k, vorname: v })} />
              <Feld label="Nachname" wert={k.nachname} auto="family-name" onChange={(v) => setK({ ...k, nachname: v })} />
              <Feld label="E-Mail" typ="email" wert={k.email} auto="email" onChange={(v) => setK({ ...k, email: v })} />
              <Feld label="Telefon (freiwillig)" typ="tel" wert={k.telefon} auto="tel" onChange={(v) => setK({ ...k, telefon: v })} />
              <label className="sm:col-span-2">
                <span className="feld-label">Dein Fahrzeug (freiwillig)</span>
                <select className="feld" value={k.fahrzeug} onChange={(e) => setK({ ...k, fahrzeug: e.target.value })}>
                  <option value="">Bitte wählen</option>
                  {FAHRZEUGE.map((f) => <option key={f.id} value={f.id}>{f.name}{f.zusatz ? ` · ${f.zusatz}` : ""}</option>)}
                  <option value="anderes">Ein anderes</option>
                </select>
              </label>
            </div>
            </>
            )}
          </Schritt>
        </div>

        {/* Zusammenfassung */}
        <aside className="self-start border border-line-strong p-6 lg:sticky lg:top-32">
          <p className="label">Deine Buchung</p>
          <h2 className="heading-m mt-2">{aktuelle.name}</h2>
          <p className="mt-3 min-h-12" aria-live="polite">{zeile || <span className="text-muted">Noch nichts ausgewählt.</span>}</p>
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-muted">Gesamt <Beispiel>· Beispielpreis</Beispiel></span>
            <span className="font-display text-4xl">{summe !== null && zeile ? euro(summe) : "–"}</span>
          </div>
          <p className="mt-1 text-[14px] text-muted">{zahlHinweis}</p>
          {leistung === "bucht" && zeile && (
            <p className="mt-3 border-t border-line pt-3 text-[15px]">
              {pauschale
                ? <>Darin: Werkzeugpauschale {pauschale.tage} × {euro(ABO.werkzeugpauschaleProTag)} = <strong className="font-semibold">{euro(pauschale.betrag)}</strong>. <Link href="/mein-camp/mitgliedschaft" className="underline underline-offset-4">Als Mitglied inklusive.</Link></>
                : inklusive ? <strong className="font-semibold">Werkzeug inklusive – du bist Mitglied.</strong> : "Werkzeug ist im Stundenpreis dabei."}
            </p>
          )}
          <button type="button" className="btn btn-primary mt-6 w-full" disabled={Boolean(fehlt) || status === "sendet"} onClick={absenden}>
            {leistung === "workshop" ? "Platz reservieren" : eingeloggt ? "Jetzt buchen" : "Als Gast buchen"}
          </button>
          <p className="mt-3 text-[14px]" aria-live="polite">{fehlt ?? "Kostenlos stornierbar bis 7 Tage vorher."}</p>
        </aside>
      </div>
    </div>
  );
}

function Schritt({ nr, titel, children }: { nr: string; titel: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="heading-l flex items-baseline gap-4">
        <span className="font-display text-lila">{nr}</span> {titel}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Datum({ label, wert, min, max, onChange }: { label: string; wert?: string; min?: string | null; max?: string; onChange: (v: string) => void }) {
  return (
    <label>
      <span className="feld-label">{label}</span>
      <input type="date" className="feld" value={wert ?? ""} min={min ?? undefined} max={max} onChange={(e) => e.target.value && onChange(e.target.value)} />
    </label>
  );
}

function Feld({ label, wert, onChange, typ = "text", auto }: { label: string; wert: string; onChange: (v: string) => void; typ?: string; auto?: string }) {
  return (
    <label>
      <span className="feld-label">{label}</span>
      <input type={typ} className="feld" value={wert} autoComplete={auto} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Zeitwahl({ wert, onChange }: { wert: string; onChange: (v: string) => void }) {
  return (
    <>
      <p className="feld-label mt-5">Uhrzeit</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Uhrzeit">
        {ZEITFENSTER.map((z) => (
          <button key={z} type="button" className="chip" aria-pressed={wert === z} onClick={() => onChange(z)}>{z} Uhr</button>
        ))}
      </div>
    </>
  );
}
