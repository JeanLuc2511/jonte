"use client";

import { useState } from "react";
import { TEXTE, TEXT_GRUPPEN } from "@/lib/daten/texte";
import { formatLang } from "@/lib/datum";
import {
  cockpitZuruecksetzen, faqSpeichern, kontaktSpeichern, leistungenSpeichern, mediumAendern, mediumEntfernen, mediumHochladen,
  phaseSpeichern, projektAusblenden, rechtsseiteSpeichern, texteSpeichern,
} from "@/lib/services/cockpit";
import type { FaqGruppe, KontaktDaten, Leistung, MedienKategorie, PhasenVorlage, Rechtsseite } from "@/lib/types";
import { IconPlus } from "../Icons";
import { Foto } from "../mein-camp/Teile";
import { Auswahl, CKopf, Eingabe, FotoKnopf, Reiter, Textfeld, useCockpit, useGespeichert } from "./Teile";

type Tab = "medien" | "texte" | "leistungen" | "faq" | "kontakt" | "recht" | "phasen" | "community";
const KATEGORIEN: [MedienKategorie, string][] = [["halle", "Halle"], ["galerie", "Galerie"], ["workshop", "Workshop"], ["werkzeug", "Werkzeug"], ["sonstiges", "Sonstiges"]];
const zahl = (v: string) => Number(String(v).replace(",", ".")) || 0;
const zeilen = (t: string) => t.split("\n").map((x) => x.trim()).filter(Boolean);

export function Inhalte({ produkte }: { produkte: { id: string; titel: string }[] }) {
  const [tab, setTab] = useState<Tab>("medien");
  return (
    <>
      <CKopf titel="Inhalte & Medien"><p>Alles, was auf der Website steht, pflegst du hier selbst. Speichern genügt – die Seite zeigt es sofort.</p></CKopf>
      <Reiter label="Bereich" aktiv={tab} onWahl={setTab} werte={[["medien", "Medien"], ["texte", "Texte"], ["leistungen", "Leistungen"], ["faq", "FAQ"], ["kontakt", "Kontakt & Zeiten"], ["recht", "Rechtstexte"], ["phasen", "Phasen-Vorlagen"], ["community", "Community"]]} />
      {tab === "medien" && <Medien />}
      {tab === "texte" && <Texte />}
      {tab === "leistungen" && <Leistungen />}
      {tab === "faq" && <Faq />}
      {tab === "kontakt" && <Kontakt />}
      {tab === "recht" && <Recht />}
      {tab === "phasen" && <Phasen produkte={produkte} />}
      {tab === "community" && <Community />}
    </>
  );
}

/* ---------- Medienbibliothek ---------- */

function Medien() {
  const c = useCockpit();
  const [kategorie, setKategorie] = useState<MedienKategorie>("halle");
  const [filter, setFilter] = useState<"alle" | MedienKategorie>("alle");
  if (!c) return null;
  const liste = c.camp.medien.filter((m) => filter === "alle" || m.kategorie === filter);
  return (
    <>
      <section className="buehne p-5">
        <h2 className="heading-m">Fotos hochladen</h2>
        <p className="mt-1 text-muted">Am Handy direkt mit der Kamera, am Rechner aus dem Ordner. Hallenfotos erscheinen auf der Werkstatt-Seite.</p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Auswahl label="Wofür?" wert={kategorie} onChange={(v) => setKategorie(v as MedienKategorie)} optionen={KATEGORIEN} className="w-44" />
          <FotoKnopf onFoto={(quelle, name) => mediumHochladen({ name: name || "Foto", quelle, kategorie })}>Kamera</FotoKnopf>
          <FotoKnopf kamera={false} onFoto={(quelle, name) => mediumHochladen({ name: name || "Foto", quelle, kategorie })}>Dateien wählen</FotoKnopf>
        </div>
        <p className="mt-3 text-[14px] text-muted">Demo: Die Bilder liegen verkleinert in deinem Browser. Später landen sie im Dateispeicher in der EU. Prüf vor dem Hochladen, ob Kennzeichen oder Gesichter zu sehen sind.</p>
      </section>
      <div className="mt-6"><Reiter label="Kategorie" aktiv={filter} onWahl={setFilter} werte={[["alle", `Alle (${c.camp.medien.length})`], ...KATEGORIEN]} /></div>
      {liste.length === 0 && <p className="text-muted">Noch keine Bilder in dieser Kategorie.</p>}
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-4">
        {liste.map((m) => (
          <li key={m.id} className="karte flex flex-col">
            <Foto quelle={m.quelle} />
            <div className="flex flex-1 flex-col gap-2 p-3">
              <label><span className="sr-only">Name</span><input className="feld !min-h-10 !py-1.5" value={m.name} onChange={(e) => mediumAendern(m.id, { name: e.target.value })} /></label>
              <label><span className="sr-only">Kategorie</span>
                <select className="feld !min-h-10 !py-1.5" value={m.kategorie} onChange={(e) => mediumAendern(m.id, { kategorie: e.target.value as MedienKategorie })}>{KATEGORIEN.map(([id, n]) => <option key={id} value={id}>{n}</option>)}</select>
              </label>
              {m.kategorie === "halle" && (
                <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" className="h-5 w-5 accent-[#FDE58B]" checked={m.aufWebsite} onChange={(e) => mediumAendern(m.id, { aufWebsite: e.target.checked })} /> Auf der Werkstatt-Seite zeigen</label>
              )}
              <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-[13px] text-muted">
                <span>{formatLang(m.datum)}</span>
                <button type="button" className="btn btn-ghost !min-h-9 !py-1 text-[13px]" onClick={() => mediumEntfernen(m.id)}>Löschen</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ---------- Texte ---------- */

function Texte() {
  const c = useCockpit();
  const [entwurf, setEntwurf] = useState<Record<string, string>>({});
  const [ok, markiere] = useGespeichert();
  if (!c) return null;
  const wert = (k: string) => entwurf[k] ?? c.camp.texte[k] ?? "";
  const geaendert = Object.keys(entwurf).length > 0;
  return (
    <form onSubmit={(e) => { e.preventDefault(); texteSpeichern(entwurf); setEntwurf({}); markiere(); }}>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {TEXT_GRUPPEN.map((g) => (
          <section key={g.titel} className="karte p-5">
            <h2 className="heading-m">{g.titel}</h2>
            <div className="mt-3 grid gap-3">
              {g.felder.map((f) => f.lang
                ? <Textfeld key={f.k} label={f.label} wert={wert(f.k)} onChange={(v) => setEntwurf({ ...entwurf, [f.k]: v })} zeilen={4} />
                : <Eingabe key={f.k} label={f.label} wert={wert(f.k)} onChange={(v) => setEntwurf({ ...entwurf, [f.k]: v })} />)}
            </div>
            {g.felder.some((f) => wert(f.k) !== TEXTE[f.k]) && (
              <button type="button" className="btn btn-ghost !min-h-0 mt-2 text-[14px]" onClick={() => setEntwurf({ ...entwurf, ...Object.fromEntries(g.felder.map((f) => [f.k, TEXTE[f.k]])) })}>Ursprünglichen Text wiederherstellen</button>
            )}
          </section>
        ))}
      </div>
      <div className="sticky bottom-20 z-10 mt-5 flex flex-wrap items-center gap-3 border border-line bg-dunkel p-3 lg:bottom-4">
        <button type="submit" className="btn btn-primary" disabled={!geaendert}>Texte speichern</button>
        {geaendert && <button type="button" className="btn btn-ghost" onClick={() => setEntwurf({})}>Verwerfen</button>}
        {ok}
      </div>
    </form>
  );
}

/* ---------- Leistungen ---------- */

function Leistungen() {
  const c = useCockpit();
  const [liste, setListe] = useState<Leistung[] | null>(null);
  const [ok, markiere] = useGespeichert();
  if (!c) return null;
  const l = liste ?? c.camp.leistungen;
  const set = (i: number, neu: Partial<Leistung>) => setListe(l.map((x, j) => (j === i ? { ...x, ...neu } : x)));
  return (
    <form onSubmit={(e) => { e.preventDefault(); leistungenSpeichern(l); setListe(null); markiere(); }}>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {l.map((x, i) => (
          <section key={x.id} className="karte p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Eingabe label="Name" wert={x.name} onChange={(v) => set(i, { name: v })} />
              <Eingabe label="Preis-Text" wert={x.preisText} onChange={(v) => set(i, { preisText: v })} />
              <Textfeld label="Beschreibung" wert={x.kurz} onChange={(v) => set(i, { kurz: v })} zeilen={2} className="sm:col-span-2" />
              <Textfeld label="Stichpunkte" wert={x.punkte.join("\n")} onChange={(v) => set(i, { punkte: v.split("\n") })} hilfe="Ein Punkt pro Zeile." className="sm:col-span-2" />
              {x.id !== "bucht" && x.id !== "workshop" && <Eingabe label="Preis für die Buchung (€)" inputMode="numeric" wert={x.preis} onChange={(v) => set(i, { preis: zahl(v) })} />}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3"><button type="submit" className="btn btn-primary" disabled={!liste}>Leistungen speichern</button>{ok}</div>
    </form>
  );
}

/* ---------- FAQ ---------- */

function Faq() {
  const c = useCockpit();
  const [entwurf, setEntwurf] = useState<FaqGruppe[] | null>(null);
  const [offen, setOffen] = useState(0);
  const [ok, markiere] = useGespeichert();
  if (!c) return null;
  const faq = entwurf ?? c.camp.faq;
  const gruppe = faq[offen] ?? faq[0];
  const setGruppe = (neu: FaqGruppe) => setEntwurf(faq.map((g, i) => (i === offen ? neu : g)));
  return (
    <form onSubmit={(e) => { e.preventDefault(); faqSpeichern(faq.map((g) => ({ ...g, fragen: g.fragen.filter((f) => f.frage.trim()) })).filter((g) => g.titel.trim())); setEntwurf(null); markiere(); }}>
      <div className="flex flex-wrap gap-2">
        {faq.map((g, i) => <button key={i} type="button" className="chip" aria-pressed={i === offen} onClick={() => setOffen(i)}>{g.titel || "Neues Thema"} ({g.fragen.length})</button>)}
        <button type="button" className="chip" onClick={() => { setEntwurf([...faq, { titel: "", fragen: [{ frage: "", antwort: "" }] }]); setOffen(faq.length); }}><IconPlus width={16} height={16} /> Thema</button>
      </div>
      {gruppe && (
        <section className="karte mt-5 p-5">
          <Eingabe label="Thema" wert={gruppe.titel} onChange={(v) => setGruppe({ ...gruppe, titel: v })} className="max-w-md" />
          <ul className="mt-4 space-y-4">
            {gruppe.fragen.map((f, i) => (
              <li key={i} className="border-t border-line pt-4">
                <Eingabe label={`Frage ${i + 1}`} wert={f.frage} onChange={(v) => setGruppe({ ...gruppe, fragen: gruppe.fragen.map((x, j) => (j === i ? { ...x, frage: v } : x)) })} />
                <Textfeld label="Antwort" wert={f.antwort} onChange={(v) => setGruppe({ ...gruppe, fragen: gruppe.fragen.map((x, j) => (j === i ? { ...x, antwort: v } : x)) })} className="mt-2" />
                <button type="button" className="btn btn-ghost !min-h-0 !py-2 text-[14px] !text-muted" onClick={() => setGruppe({ ...gruppe, fragen: gruppe.fragen.filter((_, j) => j !== i) })}>Frage entfernen</button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-x-6">
            <button type="button" className="btn btn-ghost" onClick={() => setGruppe({ ...gruppe, fragen: [...gruppe.fragen, { frage: "", antwort: "" }] })}><IconPlus width={18} height={18} /> Frage hinzufügen</button>
            <button type="button" className="btn btn-ghost !text-muted" onClick={() => { setEntwurf(faq.filter((_, i) => i !== offen)); setOffen(0); }}>Thema löschen</button>
          </div>
        </section>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-3"><button type="submit" className="btn btn-primary" disabled={!entwurf}>FAQ speichern</button>{ok}</div>
    </form>
  );
}

/* ---------- Kontakt & Öffnungszeiten ---------- */

function Kontakt() {
  const c = useCockpit();
  const [entwurf, setEntwurf] = useState<KontaktDaten | null>(null);
  const [ok, markiere] = useGespeichert();
  if (!c) return null;
  const k = entwurf ?? c.camp.kontakt;
  const zeit = (i: number, neu: Partial<KontaktDaten["oeffnungszeiten"][number]>) => setEntwurf({ ...k, oeffnungszeiten: k.oeffnungszeiten.map((o, j) => (j === i ? { ...o, ...neu } : o)) });
  return (
    <form className="grid grid-cols-1 gap-5 xl:grid-cols-2" onSubmit={(e) => { e.preventDefault(); kontaktSpeichern({ ...k, oeffnungszeiten: k.oeffnungszeiten.filter((o) => o.tage.trim()), hinweise: k.hinweise.filter((h) => h.trim()) }); setEntwurf(null); markiere(); }}>
      <section className="karte p-5">
        <h2 className="heading-m">Kontakt</h2>
        <div className="mt-3 grid gap-3">
          <Eingabe label="E-Mail" typ="email" wert={k.email} onChange={(v) => setEntwurf({ ...k, email: v })} />
          <Eingabe label="Telefon" typ="tel" wert={k.telefon} onChange={(v) => setEntwurf({ ...k, telefon: v })} />
          <Textfeld label="Gut zu wissen (Anfahrt)" wert={k.hinweise.join("\n")} onChange={(v) => setEntwurf({ ...k, hinweise: v.split("\n") })} zeilen={4} hilfe="Ein Hinweis pro Zeile." />
        </div>
      </section>
      <section className="karte p-5">
        <h2 className="heading-m">Öffnungszeiten</h2>
        <ul className="mt-3 space-y-2">
          {k.oeffnungszeiten.map((o, i) => (
            <li key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
              <Eingabe label={i === 0 ? "Tage" : ""} aria-label="Tage" wert={o.tage} onChange={(v) => zeit(i, { tage: v })} />
              <Eingabe label={i === 0 ? "Zeit" : ""} aria-label="Zeit" wert={o.zeit} onChange={(v) => zeit(i, { zeit: v })} />
              <button type="button" className="btn btn-ghost !px-2" aria-label="Zeile entfernen" onClick={() => setEntwurf({ ...k, oeffnungszeiten: k.oeffnungszeiten.filter((_, j) => j !== i) })}>✕</button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn-ghost" onClick={() => setEntwurf({ ...k, oeffnungszeiten: [...k.oeffnungszeiten, { tage: "", zeit: "" }] })}><IconPlus width={18} height={18} /> Zeile</button>
      </section>
      <div className="flex flex-wrap items-center gap-3 xl:col-span-2"><button type="submit" className="btn btn-primary" disabled={!entwurf}>Kontakt speichern</button>{ok}</div>
    </form>
  );
}

/* ---------- Rechtstexte ---------- */

function Recht() {
  const c = useCockpit();
  const [slug, setSlug] = useState("impressum");
  const [entwurf, setEntwurf] = useState<Rechtsseite | null>(null);
  const [ok, markiere] = useGespeichert();
  if (!c) return null;
  const seite = entwurf?.slug === slug ? entwurf : c.camp.rechtliches.find((r) => r.slug === slug)!;
  const abschnitt = (i: number, neu: Partial<Rechtsseite["abschnitte"][number]>) => setEntwurf({ ...seite, abschnitte: seite.abschnitte.map((a, j) => (j === i ? { ...a, ...neu } : a)) });
  return (
    <form onSubmit={(e) => { e.preventDefault(); rechtsseiteSpeichern({ ...seite, abschnitte: seite.abschnitte.filter((a) => a.titel.trim() || a.text.trim()) }); setEntwurf(null); markiere(); }}>
      <div className="flex flex-wrap gap-2">
        {c.camp.rechtliches.map((r) => <button key={r.slug} type="button" className="chip" aria-pressed={r.slug === slug} onClick={() => { setSlug(r.slug); setEntwurf(null); }}>{r.titel}</button>)}
      </div>
      <section className="karte mt-5 p-5">
        <p className="text-[14px] text-muted">Die Texte sind Platzhalter. Trag hier die Fassung ein, die du von deiner Kanzlei oder einem Rechtstext-Dienst bekommst.</p>
        <Textfeld label="Einleitung" wert={seite.intro} onChange={(v) => setEntwurf({ ...seite, intro: v })} zeilen={2} className="mt-3" />
        <ul className="mt-4 space-y-4">
          {seite.abschnitte.map((a, i) => (
            <li key={i} className="border-t border-line pt-4">
              <Eingabe label="Überschrift" wert={a.titel} onChange={(v) => abschnitt(i, { titel: v })} />
              <Textfeld label="Text" wert={a.text} onChange={(v) => abschnitt(i, { text: v })} zeilen={4} className="mt-2" />
              <button type="button" className="btn btn-ghost !min-h-0 !py-2 text-[14px] !text-muted" onClick={() => setEntwurf({ ...seite, abschnitte: seite.abschnitte.filter((_, j) => j !== i) })}>Abschnitt entfernen</button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn-ghost" onClick={() => setEntwurf({ ...seite, abschnitte: [...seite.abschnitte, { titel: "", text: "" }] })}><IconPlus width={18} height={18} /> Abschnitt</button>
      </section>
      <div className="mt-5 flex flex-wrap items-center gap-3"><button type="submit" className="btn btn-primary" disabled={!entwurf}>{seite.titel} speichern</button>{ok}</div>
    </form>
  );
}

/* ---------- Phasen-Vorlagen ---------- */

function Phasen({ produkte }: { produkte: { id: string; titel: string }[] }) {
  const c = useCockpit();
  const [id, setId] = useState<string>("elektrik");
  const [entwurf, setEntwurf] = useState<PhasenVorlage | null>(null);
  const [ok, markiere] = useGespeichert();
  if (!c) return null;
  const p = entwurf?.id === id ? entwurf : c.camp.phasen.find((x) => x.id === id)!;
  const posten = (i: number, neu: Partial<PhasenVorlage["stueckliste"][number]>) => setEntwurf({ ...p, stueckliste: p.stueckliste.map((s, j) => (j === i ? { ...s, ...neu } : s)) });
  return (
    <form onSubmit={(e) => { e.preventDefault(); phaseSpeichern({ ...p, checkliste: zeilen(p.checkliste.join("\n")), stueckliste: p.stueckliste.filter((s) => s.name.trim()) }); setEntwurf(null); markiere(); }}>
      <div className="flex flex-wrap gap-2">
        {c.camp.phasen.map((x, i) => <button key={x.id} type="button" className="chip" aria-pressed={x.id === id} onClick={() => { setId(x.id); setEntwurf(null); }}>0{i + 1} {x.name}</button>)}
      </div>
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="karte p-5">
          <h2 className="heading-m">Checkliste {p.name}</h2>
          <div className="mt-3 grid gap-3">
            <Eingabe label="Kurz gesagt" wert={p.kurz} onChange={(v) => setEntwurf({ ...p, kurz: v })} />
            <Textfeld label="Punkte der Checkliste" wert={p.checkliste.join("\n")} onChange={(v) => setEntwurf({ ...p, checkliste: v.split("\n") })} zeilen={8} hilfe="Ein Punkt pro Zeile. Mitglieder haken sie im Projekt-Planer ab." />
            <Eingabe label="Budget-Richtwert (€)" inputMode="numeric" wert={p.budgetRichtwert} onChange={(v) => setEntwurf({ ...p, budgetRichtwert: zahl(v) })} className="max-w-48" />
          </div>
        </section>
        <section className="karte p-5">
          <h2 className="heading-m">Stückliste {p.name}</h2>
          <p className="mt-1 text-[14px] text-muted">Mit einem Produkt aus dem Fachshop verknüpft, landet die Position mit einem Klick im Warenkorb.</p>
          <ul className="mt-3 space-y-3">
            {p.stueckliste.map((s, i) => (
              <li key={i} className="grid grid-cols-[64px_1fr_auto] items-end gap-2 border-t border-line pt-3">
                <Eingabe label="Menge" inputMode="numeric" wert={s.menge} onChange={(v) => posten(i, { menge: Math.max(1, Math.round(zahl(v))) })} />
                <Eingabe label="Bezeichnung" wert={s.name} onChange={(v) => posten(i, { name: v })} />
                <button type="button" className="btn btn-ghost !px-2" aria-label="Position entfernen" onClick={() => setEntwurf({ ...p, stueckliste: p.stueckliste.filter((_, j) => j !== i) })}>✕</button>
                <Auswahl label="Produkt im Fachshop" wert={s.produktId ?? ""} onChange={(v) => posten(i, { produktId: v || undefined, name: v ? (s.name || produkte.find((x) => x.id === v)?.titel || "") : s.name })} optionen={[["", "Nicht im Fachshop"], ...produkte.map((x) => [x.id, x.titel] as const)]} className="col-span-3" />
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-ghost" onClick={() => setEntwurf({ ...p, stueckliste: [...p.stueckliste, { name: "", menge: 1 }] })}><IconPlus width={18} height={18} /> Position</button>
        </section>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3"><button type="submit" className="btn btn-primary" disabled={!entwurf}>Vorlage speichern</button>{ok}</div>
    </form>
  );
}

/* ---------- Community-Galerie ---------- */

function Community() {
  const c = useCockpit();
  const [grund, setGrund] = useState<Record<string, string>>({});
  if (!c) return null;
  const { camp, konto } = c;
  const eigeneNamen = new Set(konto.fahrzeuge.map((f) => f.spitzname.toLowerCase()));
  const liste = [
    ...konto.projekte.filter((p) => p.oeffentlich).map((p) => {
      const f = konto.fahrzeuge.find((x) => x.id === p.fahrzeugId);
      return { id: p.id, titel: f?.spitzname ?? p.titel, von: konto.mitglied.vorname, info: `${p.tagebuch.length} Einträge im Bautagebuch`, fotos: p.tagebuch.flatMap((t) => t.fotos).slice(0, 4), aus: camp.ausgeblendet.includes(p.id) };
    }),
    ...camp.projekte.filter((p) => !eigeneNamen.has(p.id)).map((p) => ({ id: p.id, titel: p.titel, von: p.crew, info: p.fahrzeug, fotos: [] as string[], aus: Boolean(p.ausgeblendet) })),
  ];
  return (
    <>
      <p className="mb-4 max-w-2xl text-muted">Öffentliche Projekte in der Galerie. Wenn auf Fotos Kennzeichen oder Gesichter zu sehen sind, blendest du das Projekt aus. Das Mitglied bekommt eine Nachricht.</p>
      <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {liste.map((p) => (
          <li key={p.id} className={`karte p-4 ${p.aus ? "opacity-70" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="heading-s">{p.titel}</h2><p className="text-[15px] text-muted">{p.von} · {p.info}</p></div>
              <span className={`badge ${p.aus ? "badge-leise" : "badge-live"}`}>{p.aus ? "Ausgeblendet" : "Sichtbar"}</span>
            </div>
            {p.fotos.length > 0 && <ul className="mt-3 grid grid-cols-4 gap-2">{p.fotos.map((f, i) => <li key={i}><Foto quelle={f} /></li>)}</ul>}
            {p.aus ? (
              <button type="button" className="btn btn-outline btn-klein mt-3" onClick={() => projektAusblenden(p.id, false)}>Wieder zeigen</button>
            ) : (
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <Eingabe label="Grund (freiwillig)" wert={grund[p.id] ?? ""} placeholder="z. B. Kennzeichen auf Foto 2" onChange={(v) => setGrund({ ...grund, [p.id]: v })} className="min-w-48 flex-1" />
                <button type="button" className="btn btn-outline btn-klein" onClick={() => projektAusblenden(p.id, true, grund[p.id]?.trim())}>Ausblenden</button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <section className="mt-10 border border-dashed border-line p-5">
        <p className="label text-muted">Demo</p>
        <p className="mt-2 max-w-xl text-muted">Alles, was du im Cockpit änderst, liegt nur in diesem Browser. Mit einem Klick ist das Camp wieder im Ausgangszustand.</p>
        <button type="button" className="btn btn-outline btn-klein mt-4" onClick={cockpitZuruecksetzen}>Cockpit zurücksetzen</button>
      </section>
    </>
  );
}
