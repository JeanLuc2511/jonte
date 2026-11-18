"use client";

/**
 * Bereiche der Website, die Seb im Cockpit pflegt. Jede Komponente bekommt die Beispieldaten
 * von der Seite mit (für das erste Rendern) und zeigt danach den Stand aus dem Camp-Zustand.
 */
import Link from "next/link";
import { useCamp } from "@/lib/camp/store";
import { RECHTSSEITEN } from "@/lib/daten/rechtliches";
import { SITE } from "@/lib/daten/site";
import { isoHeute } from "@/lib/datum";
import type { FaqGruppe, Leistung, Workshop } from "@/lib/types";
import { Beispiel } from "../Bausteine";
import { IconPlus } from "../Icons";
import { Foto } from "../mein-camp/Teile";
import { WorkshopKarte } from "../WorkshopKarte";

/* ---------- Workshops ---------- */

export function WorkshopListe({ workshops, anzahl, kompakt = false }: { workshops: Workshop[]; anzahl?: number; kompakt?: boolean }) {
  const camp = useCamp();
  const liste = (camp ? camp.workshops.filter((w) => w.datum >= isoHeute()) : workshops)
    .slice().sort((a, b) => a.datum.localeCompare(b.datum)).slice(0, anzahl);
  if (liste.length === 0) return <p className="mt-10 text-muted">Gerade steht kein Termin an. Trag dich in die Warteliste ein, dann erfährst du es zuerst.</p>;
  return (
    <div className={`mt-10 grid gap-5 ${kompakt ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
      {liste.map((w) => <WorkshopKarte key={w.id} w={w} kompakt={kompakt} bild={w.bild ? camp?.medien.find((m) => m.id === w.bild)?.quelle : undefined} />)}
    </div>
  );
}

/* ---------- Leistungen (Startseite) ---------- */

export function LeistungsKarten({ leistungen }: { leistungen: Leistung[] }) {
  const liste = useCamp()?.leistungen ?? leistungen;
  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {liste.map((l) => (
        <article key={l.id} className="karte flex flex-col p-6">
          <h3 className="heading-m">{l.name}</h3>
          <p className="mt-3 text-muted">{l.kurz}</p>
          <ul className="mt-4 space-y-1 text-[15px]">
            {l.punkte.map((p) => <li key={p} className="flex gap-2"><span className="text-display" aria-hidden="true">–</span>{p}</li>)}
          </ul>
          <p className="mt-auto pt-6 text-lg font-semibold">{l.preisText}</p>
          <Link href={`/buchen?leistung=${l.id}`} className="btn btn-outline btn-klein mt-4">
            {l.id === "workshop" ? "Platz reservieren" : l.id === "bucht" ? "Bucht buchen" : "Termin wählen"}
          </Link>
        </article>
      ))}
    </div>
  );
}

/* ---------- FAQ ---------- */

const anker = (titel: string) => titel.toLowerCase().replace(/[^a-zäöü]+/g, "-");

export function FaqInhalt({ gruppen }: { gruppen: FaqGruppe[] }) {
  const liste = useCamp()?.faq ?? gruppen;
  return (
    <div className="seite abschnitt grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
      <nav aria-label="Themen" className="min-w-0 lg:sticky lg:top-32 lg:self-start">
        <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-0 lg:px-0">
          {liste.map((g) => (
            <li key={g.titel} className="shrink-0">
              <a href={`#${anker(g.titel)}`} className="chip lg:w-full lg:border-0 lg:border-b lg:px-0 lg:normal-case lg:tracking-normal">{g.titel}</a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 space-y-14">
        {liste.map((g) => (
          <section key={g.titel} id={anker(g.titel)}>
            <h2 className="heading-l">{g.titel}</h2>
            <div className="mt-5 border-t border-line">
              {g.fragen.map((f) => (
                <details key={f.frage} className="group border-b border-line">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-semibold hover:text-display [&::-webkit-details-marker]:hidden">
                    {f.frage}
                    <IconPlus className="shrink-0 text-display transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="max-w-2xl whitespace-pre-line pb-5 text-muted">{f.antwort}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
        <div className="karte p-6">
          <h2 className="heading-m">Deine Frage war nicht dabei?</h2>
          <p className="mt-2 text-muted">Schreib uns. Wir antworten so, wie wir auch in der Halle reden.</p>
          <Link href="/kontakt" className="btn btn-outline mt-5">Frage stellen</Link>
        </div>
      </div>
    </div>
  );
}

/* ---------- Kontakt ---------- */

export function Oeffnungszeiten() {
  const k = useCamp()?.kontakt;
  const zeiten = k?.oeffnungszeiten ?? SITE.oeffnungszeiten;
  const hinweise = k?.hinweise ?? ["Rolltor 3,50 m hoch – auch für Hochdächer mit Dachhaube.", "Parkplätze für dein Alltagsauto direkt vor der Halle.", "Noch kein Fahrzeug? Komm trotzdem vorbei und schau dir die Halle an."];
  return (
    <>
      <h3 className="label mt-10 text-display">Öffnungszeiten <Beispiel /></h3>
      <dl className="mt-3 border-t border-line">
        {zeiten.map((o) => (
          <div key={o.tage} className="flex justify-between gap-4 border-b border-line py-2.5"><dt>{o.tage}</dt><dd className="text-muted">{o.zeit}</dd></div>
        ))}
      </dl>
      <h3 className="label mt-10 text-display">Gut zu wissen <Beispiel /></h3>
      <ul className="mt-3 space-y-2 text-muted">{hinweise.map((h) => <li key={h}>{h}</li>)}</ul>
    </>
  );
}

export function Telefon() {
  return <>{useCamp()?.kontakt.telefon ?? SITE.telefon}</>;
}

/* ---------- Rechtstexte ---------- */

export function RechtsInhalt({ slug }: { slug: string }) {
  const camp = useCamp();
  const seite = camp?.rechtliches.find((r) => r.slug === slug) ?? RECHTSSEITEN.find((r) => r.slug === slug);
  if (!seite) return null;
  return (
    <article className="min-w-0 max-w-2xl">
      <span className="badge">Platzhalter</span>
      <h1 className="display-xl mt-5">{seite.titel}</h1>
      <p className="lead mt-5">{seite.intro}</p>
      <div className="mt-10 space-y-8">
        {seite.abschnitte.map((a) => (
          <section key={a.titel} className="border-t border-line pt-5">
            <h2 className="heading-s">{a.titel}</h2>
            <p className="mt-2 whitespace-pre-line">{a.text}</p>
          </section>
        ))}
      </div>
      <p className="mt-12 border border-line p-4 text-[15px] text-muted">
        Dieser Text ist ein Platzhalter und rechtlich nicht verbindlich. Die endgültige Fassung wird vor dem Start der Seite eingesetzt.
      </p>
    </article>
  );
}

/* ---------- Hallenfotos aus der Medienbibliothek ---------- */

export function HallenFotos() {
  const fotos = (useCamp()?.medien ?? []).filter((m) => m.kategorie === "halle" && m.aufWebsite);
  if (fotos.length === 0) return null;
  return (
    <section className="border-t border-line">
      <div className="seite py-14">
        <p className="eyebrow">Aus der Halle</p>
        <h2 className="heading-l mt-5">So sieht es bei uns aus</h2>
        <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {fotos.map((m) => (
            <li key={m.id}><figure><Foto quelle={m.quelle} /><figcaption className="mt-2 text-[14px] text-muted">{m.name}</figcaption></figure></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
