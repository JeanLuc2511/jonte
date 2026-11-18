"use client";

import { useCamp, usePhasen, usePreise } from "@/lib/camp/store";
import Link from "next/link";
import { useRef, useState } from "react";
import { euro, formatLang, isoHeute } from "@/lib/datum";
import { useKonto, useRolle } from "@/lib/mein-camp/store";
import { darf } from "@/lib/rechte";
import { leseBeleg, verkleinere } from "@/lib/services/analyse";
import {
  budgetEintragen, budgetGeplantSetzen, budgetLoeschen, checklisteUmschalten, phaseSetzen,
  sichtbarkeitSetzen, stuecklisteBestellt, tagebuchLoeschen, tagebuchSchreiben,
} from "@/lib/services/mitglieder";
import type { Ausbauprojekt, BudgetEintrag, PhasenId, PhasenVorlage, Produkt } from "@/lib/types";
import { warenkorb } from "@/lib/warenkorb";
import { Beispiel } from "../Bausteine";
import { IconAuge, IconHaken, IconKamera, IconSchloss } from "../Icons";
import { BereichKopf, Feldgruppe, Foto } from "./Teile";

type Reiter = "plan" | "budget" | "tagebuch";
const QUELLE: Record<BudgetEintrag["quelle"], string> = { shop: "Fachshop · automatisch", beleg: "Beleg · ausgelesen", manuell: "Von Hand" };

export function Projekt({ produkte }: { produkte: Produkt[] }) {
  const PHASEN = usePhasen();
  const camp = useCamp();
  const z = useKonto();
  const [projektId, setProjektId] = useState<string | null>(null);
  const [gezeigt, setGezeigt] = useState<PhasenId | null>(null);
  const [reiter, setReiter] = useState<Reiter>("plan");
  if (!z) return null;

  const projekt = z.projekte.find((p) => p.id === projektId) ?? z.projekte.find((p) => p.fahrzeugId === z.aktivesFahrzeugId) ?? z.projekte[0];
  if (!projekt) {
    return (
      <>
        <BereichKopf eyebrow="Projekt-Planer" titel="Noch kein Projekt" />
        <div className="karte p-8">
          <p className="text-muted">Ein Projekt gehört immer zu einem Fahrzeug. Leg zuerst eins in deiner Garage an.</p>
          <Link href="/mein-camp/garage" className="btn btn-primary mt-5">Zur Garage</Link>
        </div>
      </>
    );
  }
  const fahrzeug = z.fahrzeuge.find((f) => f.id === projekt.fahrzeugId);
  const ausgeblendet = Boolean(camp?.ausgeblendet.includes(projekt.id));
  const phasenId = gezeigt ?? projekt.aktivePhase;
  const vorlage = PHASEN.find((p) => p.id === phasenId)!;
  const aktivIdx = PHASEN.findIndex((p) => p.id === projekt.aktivePhase);

  return (
    <>
      <BereichKopf eyebrow="Projekt-Planer" titel={projekt.titel}>
        <p>{fahrzeug ? `${fahrzeug.hersteller} ${fahrzeug.modell}` : ""} · Phase {PHASEN[aktivIdx].name}</p>
      </BereichKopf>

      {z.projekte.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Projekt wählen">
          {z.projekte.map((p) => (
            <button key={p.id} type="button" className="chip" aria-pressed={p.id === projekt.id} onClick={() => { setProjektId(p.id); setGezeigt(null); }}>
              {z.fahrzeuge.find((f) => f.id === p.fahrzeugId)?.spitzname ?? p.titel}
            </button>
          ))}
        </div>
      )}

      {/* Sichtbarkeit */}
      <section className="karte mb-6 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          {projekt.oeffentlich ? <IconAuge className="mt-0.5 shrink-0 text-display" /> : <IconSchloss className="mt-0.5 shrink-0 text-display" />}
          <p>
            <strong className="font-semibold">{projekt.oeffentlich ? (ausgeblendet ? "Vom Camp-Team vorerst ausgeblendet" : "Öffentlich in der Community-Galerie") : "Privat – nur du siehst dieses Projekt"}</strong>
            <span className="block text-[15px] text-muted">
              {projekt.oeffentlich ? <>Sichtbar sind Titel, Phase, Bautagebuch und dein Instagram-Profil. Budget und Belege bleiben immer privat. <Link href="/community" className="text-accent underline underline-offset-4">Ansehen</Link></> : "Du kannst es jederzeit wieder freigeben."}
            </span>
          </p>
        </div>
        <button type="button" className="btn btn-outline btn-klein shrink-0" aria-pressed={!projekt.oeffentlich} onClick={() => sichtbarkeitSetzen(projekt.id, !projekt.oeffentlich)}>
          {projekt.oeffentlich ? "Privat schalten" : "Öffentlich zeigen"}
        </button>
      </section>

      {/* Phasen */}
      <ol className="grid grid-cols-3 gap-px border border-line bg-line md:grid-cols-6" aria-label="Phasen">
        {PHASEN.map((p, i) => {
          const fertig = (projekt.erledigt[p.id] ?? []).length;
          const zustand = i < aktivIdx ? "erledigt" : i === aktivIdx ? "aktuell" : "offen";
          return (
            <li key={p.id}>
              <button
                type="button" aria-pressed={p.id === phasenId} onClick={() => setGezeigt(p.id)}
                className={`flex h-full w-full flex-col p-3 text-left transition-colors hover:bg-surface-strong ${p.id === phasenId ? "bg-surface-strong" : "bg-dunkel"}`}
              >
                <span className={`font-display text-2xl ${zustand === "offen" ? "text-muted opacity-60" : zustand === "aktuell" ? "text-lila-hell" : "text-display"}`}>0{i + 1}</span>
                <span className="font-condensed text-[15px] font-bold uppercase tracking-wide">{p.name}</span>
                <span className="mt-1 text-[13px] text-muted">{zustand === "aktuell" ? "Hier bist du" : `${fertig}/${p.checkliste.length} erledigt`}</span>
                <span className={`mt-2 h-1 w-full ${zustand === "erledigt" ? "bg-gelb" : zustand === "aktuell" ? "bg-lila-hell" : "bg-surface-strong"}`} />
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Ansicht">
          {([["plan", "Checkliste & Material"], ["budget", "Budget"], ["tagebuch", "Bautagebuch"]] as const).map(([id, name]) => (
            <button key={id} type="button" aria-pressed={reiter === id} className="chip" onClick={() => setReiter(id)}>{name}</button>
          ))}
        </div>
        {phasenId !== projekt.aktivePhase && reiter === "plan" && (
          <button type="button" className="btn btn-ghost" onClick={() => phaseSetzen(projekt.id, phasenId)}>{vorlage.name} als aktuelle Phase setzen</button>
        )}
      </div>

      <div className="mt-6">
        {reiter === "plan" && <Plan key={vorlage.id} projekt={projekt} vorlage={vorlage} produkte={produkte} />}
        {reiter === "budget" && <Budget projekt={projekt} phase={phasenId} />}
        {reiter === "tagebuch" && <Tagebuch projekt={projekt} phase={phasenId} />}
      </div>
    </>
  );
}

/* ---------- Checkliste & Stückliste ---------- */

function Plan({ projekt, vorlage, produkte }: { projekt: Ausbauprojekt; vorlage: PhasenVorlage; produkte: Produkt[] }) {
  const ABO = usePreise();
  const z = useKonto();
  const rolle = useRolle();
  const [anBucht, setAnBucht] = useState(true);
  const [bestellt, setBestellt] = useState(false);
  if (!z || !rolle) return null;

  const erledigt = projekt.erledigt[vorlage.id] ?? [];
  const heute = isoHeute();
  const buchung = z.buchungen.filter((b) => b.leistung === "bucht" && b.bis >= heute).sort((a, b) => a.von.localeCompare(b.von))[0];
  const rabatt = darf(rolle, "shop.rabatt") ? ABO.shopRabatt : 0;
  const posten = vorlage.stueckliste.map((s) => {
    const produkt = produkte.find((p) => p.id === s.produktId);
    return { ...s, produkt, einzel: produkt?.preis ?? s.preis ?? 0 };
  });
  const bestellbar = posten.filter((p) => p.produkt);
  const summe = posten.reduce((x, p) => x + p.einzel * p.menge, 0);

  function bestellen() {
    bestellbar.forEach((p) => warenkorb.hinzu(p.produkt!.id, p.menge));
    const ziel = buchung && anBucht ? `${buchung.titel}, ab ${formatLang(buchung.von)}` : null;
    warenkorb.lieferung(ziel);
    stuecklisteBestellt(projekt.id, vorlage.id, ziel);
    setBestellt(true);
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <section className="karte p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="heading-m">Checkliste {vorlage.name}</h2>
          <span className="font-display text-2xl text-display">{erledigt.length}/{vorlage.checkliste.length}</span>
        </div>
        <p className="mt-1 text-[15px] text-muted">Vorlage von Seb · {vorlage.kurz}</p>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {vorlage.checkliste.map((punkt, i) => {
            const an = erledigt.includes(i);
            return (
              <li key={punkt}>
                <button type="button" role="checkbox" aria-checked={an} onClick={() => checklisteUmschalten(projekt.id, vorlage.id, i)} className="flex min-h-12 w-full items-center gap-3 py-2 text-left hover:text-display">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center border ${an ? "border-gelb bg-gelb text-pflaume" : "border-line-strong"}`}>{an && <IconHaken width={16} height={16} strokeWidth={2.5} />}</span>
                  <span className={an ? "text-muted line-through" : ""}>{punkt}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="karte flex flex-col p-5">
        <h2 className="heading-m">Stückliste {vorlage.name}</h2>
        <p className="mt-1 text-[15px] text-muted">Was du für diese Phase brauchst. <Beispiel>Beispielmengen</Beispiel></p>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {posten.map((p) => (
            <li key={p.name} className="flex items-baseline justify-between gap-3 py-2.5">
              <span>
                <span className="text-muted">{p.menge} ×</span>{" "}
                {p.produkt ? <Link href={`/shop/${p.produkt.handle}`} className="underline-offset-4 hover:text-display hover:underline">{p.name}</Link> : p.name}
                {!p.produkt && <span className="ml-2 font-condensed text-[12px] font-bold uppercase tracking-wider text-muted">nicht im Fachshop</span>}
              </span>
              <span className="shrink-0 font-semibold">{euro(p.einzel * p.menge)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-baseline justify-between gap-3">
          <span className="text-muted">Summe{rabatt > 0 && <> · 10 % Mitgliederrabatt gehen im Warenkorb ab</>}</span>
          <span className="font-display text-3xl text-display">{euro(summe)}</span>
        </p>
        {buchung && bestellbar.length > 0 && (
          <label className="mt-4 flex gap-3 border border-line p-3">
            <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[#7934C7]" checked={anBucht} onChange={(e) => setAnBucht(e.target.checked)} />
            <span><strong className="font-semibold">Direkt an meine Werkstattbucht liefern</strong><span className="block text-[15px] text-muted">{buchung.titel}, gebucht ab {formatLang(buchung.von)}. Das Material steht bereit, wenn du kommst.</span></span>
          </label>
        )}
        <div className="mt-auto pt-5">
          {bestellt ? (
            <p className="einblenden border border-line-strong p-3" role="status">
              {bestellbar.length} Positionen liegen im Warenkorb. <Link href="/warenkorb" className="font-semibold text-accent underline underline-offset-4">Zum Warenkorb</Link>
              <span className="block text-[14px] text-muted">Nach dem Kauf landet der Betrag automatisch in deinem Budget.</span>
            </p>
          ) : (
            <button type="button" className="btn btn-primary w-full" disabled={bestellbar.length === 0} onClick={bestellen}>
              {bestellbar.length === 0 ? "Nichts davon im Fachshop" : "Alles in den Warenkorb"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------- Budget ---------- */

function Budget({ projekt, phase }: { projekt: Ausbauprojekt; phase: PhasenId }) {
  const PHASEN = usePhasen();
  const [form, setForm] = useState<null | { haendler: string; datum: string; betrag: string; phase: PhasenId; quelle: "beleg" | "manuell"; positionen?: { name: string; betrag: number }[] }>(null);
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const datei = useRef<HTMLInputElement>(null);

  const jePhase = (id: PhasenId) => projekt.budget.filter((b) => b.phase === id).reduce((s, b) => s + b.betrag, 0);
  const ausgegeben = projekt.budget.reduce((s, b) => s + b.betrag, 0);
  const geplant = Object.values(projekt.budgetGeplant).reduce((s, b) => s + b, 0);

  async function beleg(file: File) {
    setLaedt(true); setFehler(null); setForm(null);
    const a = await leseBeleg(file);
    if (datei.current) datei.current.value = "";
    setLaedt(false);
    if (!a.ok) { setFehler(a.fehler ?? "Der Beleg war nicht lesbar."); return; }
    setForm({ haendler: a.haendler ?? "", datum: a.datum ?? isoHeute(), betrag: String(a.betrag ?? ""), phase, quelle: "beleg", positionen: a.positionen });
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.1fr]">
      <section className="karte p-5">
        <p className="flex items-center gap-2 text-[14px] text-muted"><IconSchloss width={16} height={16} /> Budget und Belege sind immer privat – auch bei öffentlichem Projekt.</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div><p className="label text-muted">Ausgegeben</p><p className="font-display text-4xl text-display">{euro(Math.round(ausgegeben))}</p></div>
          <div><p className="label text-muted">Geplant</p><p className="font-display text-4xl">{euro(geplant)}</p></div>
        </div>
        <ul className="mt-5 space-y-4">
          {PHASEN.map((p) => {
            const ist = jePhase(p.id);
            const soll = projekt.budgetGeplant[p.id];
            const anteil = soll > 0 ? Math.min(100, (ist / soll) * 100) : ist > 0 ? 100 : 0;
            const drueber = ist > soll;
            return (
              <li key={p.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className={`font-condensed text-[15px] font-bold uppercase tracking-wide ${p.id === phase ? "text-display" : ""}`}>{p.name}</span>
                  <span className="flex items-center gap-2 text-[15px]">
                    <span className={drueber ? "font-semibold text-display" : ""}>{euro(Math.round(ist))}</span>
                    <span className="text-muted">von</span>
                    <label className="flex items-center gap-1">
                      <span className="sr-only">Geplantes Budget {p.name} in Euro</span>
                      <input type="number" min={0} step={50} className="feld !min-h-9 w-24 !px-2 !py-1 text-right" value={soll} onChange={(e) => budgetGeplantSetzen(projekt.id, p.id, Number(e.target.value))} />
                      <span className="text-muted">€</span>
                    </label>
                  </span>
                </div>
                <div className="mt-1.5 h-2 bg-surface-strong" role="img" aria-label={`${Math.round(anteil)} % des geplanten Budgets`}>
                  <div className={`h-full ${drueber ? "bg-lila-hell" : "bg-gelb"}`} style={{ width: `${anteil}%` }} />
                </div>
                {drueber && <p className="mt-1 text-[13px] text-muted">{euro(Math.round(ist - soll))} über Plan</p>}
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary" onClick={() => datei.current?.click()} disabled={laedt}><IconKamera width={18} height={18} /> Beleg fotografieren</button>
          <button type="button" className="btn btn-outline" onClick={() => { setFehler(null); setForm({ haendler: "", datum: isoHeute(), betrag: "", phase, quelle: "manuell" }); }}>Von Hand eintragen</button>
          <input ref={datei} type="file" accept="image/*" capture="environment" className="sr-only" aria-label="Foto vom Beleg" onChange={(e) => e.target.files?.[0] && beleg(e.target.files[0])} />
        </div>
        <div aria-live="polite">
          {laedt && <p className="puls mt-4 font-semibold">Beleg wird gelesen: Händler, Datum, Betrag, Positionen …</p>}
          {fehler && <p className="mt-4 border border-line p-3 font-semibold">{fehler}</p>}
        </div>

        {form && (
          <form
            className="buehne einblenden mt-4 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              const betrag = Number(form.betrag.replace(",", "."));
              if (!form.haendler.trim() || !(betrag > 0)) return;
              budgetEintragen(projekt.id, { phase: form.phase, datum: form.datum, haendler: form.haendler.trim(), betrag, quelle: form.quelle, positionen: form.positionen });
              setForm(null);
            }}
          >
            <h3 className="heading-s">{form.quelle === "beleg" ? "Das haben wir gelesen – stimmt das?" : "Ausgabe eintragen"}</h3>
            {form.quelle === "beleg" && <p className="mt-1 text-[14px] text-muted"><Beispiel>Bildanalyse simuliert</Beispiel> · Korrigier, was nicht passt.</p>}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Feldgruppe label="Händler"><input className="feld" value={form.haendler} onChange={(e) => setForm({ ...form, haendler: e.target.value })} /></Feldgruppe>
              <Feldgruppe label="Betrag in Euro"><input className="feld" inputMode="decimal" value={form.betrag} onChange={(e) => setForm({ ...form, betrag: e.target.value })} /></Feldgruppe>
              <Feldgruppe label="Datum"><input type="date" className="feld" value={form.datum} onChange={(e) => setForm({ ...form, datum: e.target.value })} /></Feldgruppe>
              <Feldgruppe label="Phase">
                <select className="feld" value={form.phase} onChange={(e) => setForm({ ...form, phase: e.target.value as PhasenId })}>{PHASEN.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
              </Feldgruppe>
            </div>
            {form.positionen && (
              <ul className="mt-4 divide-y divide-[var(--border)] border-y border-line text-[15px]">
                {form.positionen.map((p) => <li key={p.name} className="flex justify-between gap-3 py-1.5"><span>{p.name}</span><span>{euro(p.betrag)}</span></li>)}
              </ul>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="submit" className="btn btn-primary">Ins Budget übernehmen</button>
              <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Verwerfen</button>
            </div>
          </form>
        )}

        <h3 className="heading-s mt-6">Ausgaben</h3>
        {projekt.budget.length === 0 && <p className="mt-2 text-muted">Noch keine Ausgaben. Käufe im Fachshop tragen sich von selbst ein.</p>}
        <ul className="mt-2 divide-y divide-line border-y border-line">
          {projekt.budget.map((b) => (
            <li key={b.id} className="py-3">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0">
                    <span className="block font-semibold">{b.haendler}</span>
                    <span className="text-[14px] text-muted">{formatLang(b.datum)} · {PHASEN.find((p) => p.id === b.phase)?.name} · {QUELLE[b.quelle]}</span>
                  </span>
                  <span className="shrink-0 font-semibold">{euro(b.betrag)}</span>
                </summary>
                <div className="mt-2 text-[15px] text-muted">
                  {b.positionen?.map((p) => <p key={p.name} className="flex justify-between gap-3"><span>{p.name}</span><span>{euro(p.betrag)}</span></p>)}
                  {b.quelle !== "shop" && <button type="button" className="btn btn-ghost !min-h-0 !py-2 text-[14px]" onClick={() => budgetLoeschen(projekt.id, b.id)}>Eintrag löschen</button>}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ---------- Bautagebuch ---------- */

function Tagebuch({ projekt, phase }: { projekt: Ausbauprojekt; phase: PhasenId }) {
  const PHASEN = usePhasen();
  const [offen, setOffen] = useState(false);
  const [titel, setTitel] = useState("");
  const [text, setText] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [geprueft, setGeprueft] = useState(false);
  const datei = useRef<HTMLInputElement>(null);

  async function waehle(liste: FileList) {
    const neu = await Promise.all([...liste].slice(0, 4).map((d) => verkleinere(d).catch(() => null)));
    setFotos((alt) => [...alt, ...neu.filter((x): x is string => Boolean(x))].slice(0, 4));
    if (datei.current) datei.current.value = "";
  }
  const brauchtPruefung = fotos.length > 0 && projekt.oeffentlich;
  const gueltig = titel.trim() && (!brauchtPruefung || geprueft);

  return (
    <div>
      {!offen ? (
        <button type="button" className="btn btn-primary" onClick={() => setOffen(true)}>Eintrag schreiben</button>
      ) : (
        <form
          className="buehne einblenden p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!gueltig) return;
            tagebuchSchreiben(projekt.id, { phase, datum: isoHeute(), titel: titel.trim(), text: text.trim(), fotos });
            setTitel(""); setText(""); setFotos([]); setGeprueft(false); setOffen(false);
          }}
        >
          <h3 className="heading-m">Was hast du heute geschafft?</h3>
          <div className="mt-4 grid gap-4">
            <Feldgruppe label="Überschrift"><input className="feld" value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="Zum Beispiel: Ladebooster sitzt" /></Feldgruppe>
            <Feldgruppe label="Text"><textarea className="feld min-h-28" value={text} onChange={(e) => setText(e.target.value)} /></Feldgruppe>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-outline btn-klein" onClick={() => datei.current?.click()} disabled={fotos.length >= 4}><IconKamera width={18} height={18} /> Fotos dazu</button>
            <input ref={datei} type="file" accept="image/*" multiple className="sr-only" aria-label="Fotos auswählen" onChange={(e) => e.target.files && waehle(e.target.files)} />
            <span className="text-[14px] text-muted">bis zu 4 Fotos · Phase {PHASEN.find((p) => p.id === phase)?.name}</span>
          </div>
          {fotos.length > 0 && (
            <>
              <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {fotos.map((f, i) => (
                  <li key={i} className="relative">
                    <Foto quelle={f} />
                    <button type="button" className="absolute right-1 top-1 bg-pflaume px-2 py-1 text-[12px] font-bold uppercase text-creme" onClick={() => setFotos(fotos.filter((_, j) => j !== i))}>Weg</button>
                  </li>
                ))}
              </ul>
              {projekt.oeffentlich ? (
                <label className="mt-4 flex gap-3 border border-line-strong p-3">
                  <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[#331654]" checked={geprueft} onChange={(e) => setGeprueft(e.target.checked)} />
                  <span><strong className="font-semibold">Dein Projekt ist öffentlich.</strong> Ich habe geprüft, dass auf den Fotos keine Kennzeichen und keine Gesichter anderer zu sehen sind.</span>
                </label>
              ) : (
                <p className="mt-4 text-[15px] text-muted">Dein Projekt ist privat. Wenn du es später freigibst: Prüf vorher, ob Kennzeichen oder Gesichter zu sehen sind.</p>
              )}
            </>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="submit" className="btn btn-primary" disabled={!gueltig}>Eintrag speichern</button>
            <button type="button" className="btn btn-ghost" onClick={() => setOffen(false)}>Abbrechen</button>
          </div>
        </form>
      )}

      {projekt.tagebuch.length === 0 && <p className="mt-6 text-muted">Noch kein Eintrag. Der erste ist der schwerste – ein Foto vom leeren Kasten reicht.</p>}
      <ol className="mt-6 space-y-5">
        {projekt.tagebuch.map((t) => (
          <li key={t.id} className="karte grid gap-4 p-5 md:grid-cols-[1fr_minmax(0,260px)]">
            <div>
              <p className="label text-muted">{formatLang(t.datum)} · {PHASEN.find((p) => p.id === t.phase)?.name}</p>
              <h3 className="heading-m mt-2">{t.titel}</h3>
              <p className="mt-2 text-muted">{t.text}</p>
              <button type="button" className="btn btn-ghost !min-h-0 !py-2 text-[14px] !text-muted" onClick={() => tagebuchLoeschen(projekt.id, t.id)}>Eintrag löschen</button>
            </div>
            {t.fotos.length > 0 && (
              <div className={`grid gap-2 ${t.fotos.length > 1 ? "grid-cols-2" : ""}`}>
                {t.fotos.map((f, i) => <Foto key={i} quelle={f} />)}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
