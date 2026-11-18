import Link from "next/link";
import { euro, formatMonat, formatWochentag, tagDesMonats } from "@/lib/datum";
import { workshopStatus, workshopText } from "@/lib/services/buchung";
import type { Workshop } from "@/lib/types";
import { Foto } from "./mein-camp/Teile";

/** Plätze als Kästchen: gefüllt = angemeldet, Markierung = ab hier findet der Workshop statt. */
export function Teilnehmerbalken({ w }: { w: Workshop }) {
  const status = workshopStatus(w);
  return (
    <div>
      <div
        className="flex gap-1" role="img"
        aria-label={`${w.angemeldet} von ${w.maxTeilnehmer} Plätzen reserviert, Start ab ${w.minTeilnehmer}`}
      >
        {Array.from({ length: w.maxTeilnehmer }, (_, i) => (
          <span key={i} className="relative h-5 flex-1">
            <span
              className={`block h-full border ${
                i < w.angemeldet ? "border-gelb bg-gelb" : i < w.minTeilnehmer ? "border-gelb/70" : "border-line"
              }`}
            />
            {i === w.minTeilnehmer - 1 && (
              <span className="absolute -right-[3px] -top-1.5 h-8 w-[2px] bg-lila-hell" aria-hidden="true" />
            )}
          </span>
        ))}
      </div>
      <p className="mt-3 flex flex-wrap justify-between gap-x-4 text-[14px] text-muted">
        <span><strong className="text-ink">{w.angemeldet}</strong> dabei · Start ab {w.minTeilnehmer} · max. {w.maxTeilnehmer}</span>
        <span className={status === "offen" ? "text-accent" : "text-ink"}>{workshopText(w)}</span>
      </p>
    </div>
  );
}

export function WorkshopKarte({ w, kompakt = false, bild }: { w: Workshop; kompakt?: boolean; bild?: string }) {
  const status = workshopStatus(w);
  return (
    <article className="karte flex h-full flex-col p-5 lg:p-6" id={w.id}>
      {bild && <div className="-mx-5 -mt-5 mb-5 lg:-mx-6 lg:-mt-6"><Foto quelle={bild} className="!aspect-[16/7]" /></div>}
      <div className="flex items-start gap-4">
        <div className="flex w-16 shrink-0 flex-col items-center border border-line-strong py-2 text-center">
          <span className="label text-muted">{formatWochentag(w.datum)}</span>
          <span className="font-display text-4xl leading-none text-display">{tagDesMonats(w.datum)}</span>
          <span className="label mt-1 text-muted">{formatMonat(w.datum)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <span className={`badge ${status === "findet-statt" ? "badge-live" : status === "ausgebucht" ? "badge-leise" : ""}`}>
            {w.abgesagt ? "Abgesagt" : status === "findet-statt" ? "Findet statt" : status === "ausgebucht" ? "Ausgebucht" : `Noch ${w.minTeilnehmer - w.angemeldet} bis zum Start`}
          </span>
          <h3 className="heading-m mt-3">{w.titel}</h3>
        </div>
      </div>
      <p className="mt-4 text-muted">{w.kurz}</p>
      {!kompakt && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {w.inhalte.map((i) => (
            <li key={i} className="border border-line px-2.5 py-1 font-condensed text-[14px] font-semibold uppercase tracking-wide">{i}</li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-[15px] text-muted">
        {w.zeit} · {w.dauer} · {w.level}{!kompakt && <> · {w.leitung}</>}
      </p>
      <div className="mt-auto pt-6">
        <Teilnehmerbalken w={w} />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p>
            <span className="font-display text-3xl text-display">{euro(w.preis)}</span>
            <span className="ml-2 text-[13px] text-muted">pro Person · zahlbar erst bei Zusage</span>
          </p>
          {w.abgesagt ? (
            <span className="text-[15px] text-muted">Dieser Termin fällt aus. Niemand zahlt etwas.</span>
          ) : status === "ausgebucht" ? (
            <Link href="/warteliste" className="btn btn-outline btn-klein">Auf die Nachrückliste</Link>
          ) : (
            <Link href={`/buchen?workshop=${w.id}`} className="btn btn-outline btn-klein">Platz reservieren</Link>
          )}
        </div>
      </div>
    </article>
  );
}
