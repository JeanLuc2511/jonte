"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { FAHRZEUGE, fahrzeugName } from "@/lib/daten/fahrzeuge";
import { DACHHOEHEN, HOEHE_M, KBA_BEISPIELE, LAENGE_M, RADSTAENDE } from "@/lib/daten/kba";
import { PHASEN } from "@/lib/daten/phasen";
import { useKonto } from "@/lib/mein-camp/store";
import { ladeFahrzeugdaten, leseFahrzeugschein } from "@/lib/services/analyse";
import { fahrzeugAktivieren, fahrzeugAnlegen, fahrzeugEntfernen } from "@/lib/services/mitglieder";
import type { Fahrzeugdaten, GaragenFahrzeug } from "@/lib/types";
import { Beispiel } from "../Bausteine";
import { IconKamera, IconPlus } from "../Icons";
import { VanSeite } from "../Van";
import { BereichKopf, Feldgruppe } from "./Teile";

const STAND: Record<string, string> = { leer: "Leer, noch nichts gemacht", fertig: "Fertig ausgebaut", ...Object.fromEntries(PHASEN.map((p) => [p.id, `In der Phase ${p.name}`])) };
const FARBEN = ["#EED5C7", "#9DB4D6", "#FFFCF3", "#D98C7A", "#B9A6E0", "#A9B08A"];

export function Garage() {
  const z = useKonto();
  const [anlegen, setAnlegen] = useState(false);
  if (!z) return null;

  return (
    <>
      <BereichKopf
        eyebrow="Meine Garage" titel="Deine Fahrzeuge"
        aktion={!anlegen && <button type="button" className="btn btn-primary" onClick={() => setAnlegen(true)}><IconPlus width={18} height={18} /> Fahrzeug anlegen</button>}
      >
        <p>Einmal anlegen, überall wirksam: Der Fachshop zeigt passende Teile, die Buchung nur Werkstattbuchten, in die dein Fahrzeug passt.</p>
      </BereichKopf>

      {anlegen && <Anlegen nr={z.fahrzeuge.length} onFertig={() => setAnlegen(false)} />}

      {z.fahrzeuge.length === 0 && !anlegen && (
        <div className="karte p-8 text-center">
          <h2 className="heading-m">Deine Garage ist noch leer</h2>
          <p className="mx-auto mt-2 max-w-md text-muted">Halt den Fahrzeugschein bereit – mit HSN und TSN geht es in einer Minute.</p>
        </div>
      )}

      <ul className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {z.fahrzeuge.map((f) => {
          const aktiv = f.id === z.aktivesFahrzeugId;
          return (
            <li key={f.id} className={`karte flex flex-col p-5 ${aktiv ? "!border-line-strong" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="heading-m">{f.spitzname}</h2>
                  <p className="text-muted">{f.hersteller} {f.modell}</p>
                </div>
                {aktiv ? <span className="badge badge-live">Aktiv</span> : <button type="button" className="btn btn-outline btn-klein" onClick={() => fahrzeugAktivieren(f.id)}>Aktiv setzen</button>}
              </div>
              <VanSeite farbe={f.farbe} lang={f.laengeM > 6.2} className="mx-auto my-4 w-full max-w-[260px]" />
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[15px]">
                {[
                  ["HSN / TSN", f.hsn ? `${f.hsn} / ${f.tsn}` : "von Hand angelegt"],
                  ["Motor", [f.motor, f.leistungKw ? `${f.leistungKw} kW` : null].filter(Boolean).join(" · ") || "–"],
                  ["Radstand · Dach", [f.radstand, f.dachhoehe].filter(Boolean).join(" · ") || "–"],
                  ["Länge", `${String(f.laengeM).replace(".", ",")} m`],
                  ["Baujahr", f.baujahr ?? "–"],
                  ["Schiebetür · Fenster", `${f.schiebetuer ?? "–"} · ${f.fenster ?? "–"}`],
                ].map(([k, v]) => (
                  <div key={String(k)}><dt className="label text-muted">{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
              <p className="mt-4 border-t border-line pt-3 text-[15px]"><span className="text-muted">Ausbaustand:</span> {STAND[f.ausbaustand]}</p>
              <div className="mt-auto flex flex-wrap gap-x-6 pt-3">
                {f.typ !== "anderes" && <Link href={`/shop?fahrzeug=${f.typ}`} className="btn btn-ghost">Teile für {fahrzeugName(f.typ)}</Link>}
                <button type="button" className="btn btn-ghost !text-muted" onClick={() => { if (window.confirm(`${f.spitzname} und das zugehörige Projekt wirklich entfernen?`)) fahrzeugEntfernen(f.id); }}>Entfernen</button>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/* ------------------------------------------------------------------ */

type Weg = "foto" | "nummer" | "hand";

function Anlegen({ nr, onFertig }: { nr: number; onFertig: () => void }) {
  const [weg, setWeg] = useState<Weg | null>(null);
  const [hsn, setHsn] = useState("");
  const [tsn, setTsn] = useState("");
  const [laedt, setLaedt] = useState<string | null>(null);
  const [hinweis, setHinweis] = useState<string | null>(null);
  const [daten, setDaten] = useState<Fahrzeugdaten | null>(null);
  const [vomFoto, setVomFoto] = useState(false);
  const datei = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({
    spitzname: "", hersteller: "", modell: "", typ: "anderes" as GaragenFahrzeug["typ"], baujahr: "", radstand: "L2", dachhoehe: "H2",
    laenge: "5.4", schiebetuer: "rechts" as NonNullable<GaragenFahrzeug["schiebetuer"]>, fenster: "keine" as NonNullable<GaragenFahrzeug["fenster"]>,
    ausbaustand: "leer" as GaragenFahrzeug["ausbaustand"],
  });

  async function suche(h: string, t: string) {
    setLaedt("Fahrzeugdaten werden gesucht …");
    setHinweis(null);
    const d = await ladeFahrzeugdaten(h, t);
    setLaedt(null);
    if (d.gefunden) {
      setDaten(d);
      setF((alt) => ({ ...alt, hersteller: d.hersteller ?? "", modell: d.modell ?? "", typ: d.typ ?? "anderes" }));
    } else {
      setDaten({ gefunden: false, hsn: h, tsn: t });
      setHinweis(h === "0000"
        ? "Mit HSN 0000 (Importe, Oldtimer, Umbauten) gibt es keine Daten. Trag dein Fahrzeug einfach von Hand ein."
        : "Zu dieser Schlüsselnummer finden wir nichts. Prüf die Eingabe – oder trag dein Fahrzeug von Hand ein.");
    }
  }

  async function foto(file: File) {
    setWeg("foto");
    setLaedt("Fahrzeugschein wird gelesen – nur die Felder 2.1 und 2.2 …");
    const a = await leseFahrzeugschein(file);
    if (datei.current) datei.current.value = "";
    if (!a.ok || !a.hsn || !a.tsn) {
      setLaedt(null);
      setHinweis(a.fehler ?? "Die Nummern waren nicht lesbar. Tipp sie bitte ab.");
      setWeg("nummer");
      return;
    }
    setHsn(a.hsn); setTsn(a.tsn); setVomFoto(true);
    await suche(a.hsn, a.tsn);
  }

  const zeigeDetails = weg === "hand" || daten !== null;
  const manuell = weg === "hand" || (daten !== null && !daten.gefunden);
  const gueltig = f.spitzname.trim() && f.hersteller.trim() && f.modell.trim() && Number(f.laenge) > 3;

  function speichern() {
    fahrzeugAnlegen({
      spitzname: f.spitzname.trim(), typ: f.typ, hsn: manuell ? undefined : daten?.hsn, tsn: manuell ? undefined : daten?.tsn,
      hersteller: f.hersteller.trim(), modell: f.modell.trim(), motor: manuell ? undefined : daten?.motor, leistungKw: manuell ? undefined : daten?.leistungKw,
      kraftstoff: manuell ? undefined : daten?.kraftstoff, baujahr: Number(f.baujahr) || undefined, radstand: f.radstand, dachhoehe: f.dachhoehe,
      laengeM: Number(f.laenge), hoeheM: HOEHE_M[f.dachhoehe], schiebetuer: f.schiebetuer, fenster: f.fenster, ausbaustand: f.ausbaustand,
      farbe: FARBEN[(nr + 3) % FARBEN.length], quelle: manuell ? "manuell" : vomFoto ? "fahrzeugschein" : "hsn-tsn",
    });
    onFertig();
  }

  return (
    <section className="buehne einblenden mb-8 p-5 lg:p-8" aria-label="Fahrzeug anlegen">
      <div className="flex items-start justify-between gap-4">
        <h2 className="heading-l">Fahrzeug anlegen</h2>
        <button type="button" className="btn btn-ghost !min-h-0" onClick={onFertig}>Abbrechen</button>
      </div>

      {/* Schritt 1 */}
      <p className="label mt-6">1 · Wie willst du starten?</p>
      <div className="mt-3 grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="Weg wählen">
        <button type="button" role="radio" aria-checked={weg === "foto"} className="option !items-start" onClick={() => { setWeg("foto"); datei.current?.click(); }}>
          <span className="option-key">A</span>
          <span>Fahrzeugschein fotografieren<span className="block font-sans text-[14px] font-normal text-muted">Wir lesen nur HSN und TSN. Das Foto wird nicht gespeichert.</span></span>
        </button>
        <button type="button" role="radio" aria-checked={weg === "nummer"} className="option !items-start" onClick={() => { setWeg("nummer"); setDaten(null); setHinweis(null); }}>
          <span className="option-key">B</span>
          <span>HSN und TSN abtippen<span className="block font-sans text-[14px] font-normal text-muted">Felder 2.1 und 2.2 im Fahrzeugschein.</span></span>
        </button>
        <button type="button" role="radio" aria-checked={weg === "hand"} className="option !items-start" onClick={() => { setWeg("hand"); setDaten(null); setHinweis(null); }}>
          <span className="option-key">C</span>
          <span>Von Hand eingeben<span className="block font-sans text-[14px] font-normal text-muted">Für Importe, Oldtimer und Umbauten.</span></span>
        </button>
      </div>
      <input ref={datei} type="file" accept="image/*" capture="environment" className="sr-only" aria-label="Foto vom Fahrzeugschein" onChange={(e) => e.target.files?.[0] && foto(e.target.files[0])} />

      {(weg === "nummer" || (weg === "foto" && (hsn || laedt))) && (
        <form className="mt-5 flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); setVomFoto(false); void suche(hsn, tsn); }}>
          <Feldgruppe label="HSN (2.1)" className="w-28"><input className="feld" inputMode="numeric" maxLength={4} placeholder="1313" value={hsn} onChange={(e) => setHsn(e.target.value.replace(/\D/g, ""))} /></Feldgruppe>
          <Feldgruppe label="TSN (2.2)" className="w-28"><input className="feld uppercase" maxLength={3} placeholder="GBW" value={tsn} onChange={(e) => setTsn(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} /></Feldgruppe>
          <button type="submit" className="btn btn-outline" disabled={hsn.length !== 4 || tsn.length !== 3 || Boolean(laedt)}>Fahrzeug suchen</button>
          <p className="w-full text-[14px] text-muted">
            <Beispiel>Zum Ausprobieren:</Beispiel> {Object.keys(KBA_BEISPIELE).map((k) => k.replace("/", " / ")).join(" · ")} · 0000 / 000 für die Rückfallebene
          </p>
        </form>
      )}

      <div aria-live="polite">
        {laedt && <p className="puls mt-5 flex items-center gap-3 font-semibold"><IconKamera /> {laedt}</p>}
        {vomFoto && daten && !laedt && <p className="mt-4 text-[15px]">Gelesen: HSN {daten.hsn}, TSN {daten.tsn}. Das Foto wurde verworfen. <Beispiel>Bildanalyse simuliert</Beispiel></p>}
        {hinweis && <p className="mt-4 border border-line p-3 font-semibold">{hinweis}</p>}
        {daten?.gefunden && !laedt && (
          <div className="mt-5 border border-line-strong p-4">
            <p className="label">Gefunden</p>
            <p className="heading-m mt-1">{daten.hersteller} {daten.modell}</p>
            <p className="text-muted">{daten.motor} · {daten.leistungKw} kW · {daten.kraftstoff}</p>
          </div>
        )}
      </div>

      {/* Schritt 2 */}
      {zeigeDetails && !laedt && (
        <div className="einblenden">
          <p className="label mt-8">2 · {manuell ? "Dein Fahrzeug" : "Was die Schlüsselnummer nicht verrät"}</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {manuell && (
              <>
                <Feldgruppe label="Hersteller"><input className="feld" value={f.hersteller} onChange={(e) => setF({ ...f, hersteller: e.target.value })} /></Feldgruppe>
                <Feldgruppe label="Modell"><input className="feld" value={f.modell} onChange={(e) => setF({ ...f, modell: e.target.value })} /></Feldgruppe>
                <Feldgruppe label="Fahrzeugfamilie">
                  <select className="feld" value={f.typ} onChange={(e) => setF({ ...f, typ: e.target.value as GaragenFahrzeug["typ"] })}>
                    <option value="anderes">Ein anderes Fahrzeug</option>
                    {FAHRZEUGE.map((x) => <option key={x.id} value={x.id}>{fahrzeugName(x.id)}</option>)}
                  </select>
                </Feldgruppe>
              </>
            )}
            <Feldgruppe label="Spitzname"><input className="feld" placeholder="Wie heißt dein Camper?" value={f.spitzname} onChange={(e) => setF({ ...f, spitzname: e.target.value })} /></Feldgruppe>
            <Feldgruppe label="Baujahr"><input className="feld" inputMode="numeric" maxLength={4} placeholder="2018" value={f.baujahr} onChange={(e) => setF({ ...f, baujahr: e.target.value.replace(/\D/g, "") })} /></Feldgruppe>
            <Feldgruppe label="Radstand">
              <select className="feld" value={f.radstand} onChange={(e) => setF({ ...f, radstand: e.target.value, laenge: String(LAENGE_M[e.target.value]) })}>{RADSTAENDE.map((r) => <option key={r}>{r}</option>)}</select>
            </Feldgruppe>
            <Feldgruppe label="Dachhöhe">
              <select className="feld" value={f.dachhoehe} onChange={(e) => setF({ ...f, dachhoehe: e.target.value })}>{DACHHOEHEN.map((r) => <option key={r}>{r}</option>)}</select>
            </Feldgruppe>
            <Feldgruppe label="Länge in Metern"><input className="feld" inputMode="decimal" value={f.laenge} onChange={(e) => setF({ ...f, laenge: e.target.value.replace(",", ".") })} /></Feldgruppe>
            <Feldgruppe label="Schiebetür">
              <select className="feld" value={f.schiebetuer} onChange={(e) => setF({ ...f, schiebetuer: e.target.value as typeof f.schiebetuer })}>
                <option value="rechts">rechts</option><option value="links">links</option><option value="beide">beide Seiten</option><option value="keine">keine</option>
              </select>
            </Feldgruppe>
            <Feldgruppe label="Fenster">
              <select className="feld" value={f.fenster} onChange={(e) => setF({ ...f, fenster: e.target.value as typeof f.fenster })}>
                <option value="keine">keine (Kastenwagen)</option><option value="teilweise">teilweise</option><option value="rundum">rundum verglast</option>
              </select>
            </Feldgruppe>
            <Feldgruppe label="Aktueller Ausbaustand" className="sm:col-span-2 lg:col-span-1">
              <select className="feld" value={f.ausbaustand} onChange={(e) => setF({ ...f, ausbaustand: e.target.value as GaragenFahrzeug["ausbaustand"] })}>
                {Object.entries(STAND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Feldgruppe>
          </div>
          <button type="button" className="btn btn-primary mt-6" disabled={!gueltig} onClick={speichern}>In die Garage stellen</button>
        </div>
      )}
    </section>
  );
}
