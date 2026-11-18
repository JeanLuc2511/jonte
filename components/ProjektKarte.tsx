import type { Projekt } from "@/lib/types";
import { IconInsta } from "./Icons";
import { VanSeite } from "./Van";

export function ProjektKarte({ p, meins = false }: { p: Projekt; meins?: boolean }) {
  return (
    <article className="karte flex h-full flex-col">
      <div className="relative flex h-44 items-end justify-center overflow-hidden bg-surface-strong px-8">
        <span className="absolute left-3 top-2 font-display text-6xl uppercase leading-none text-gelb/15" aria-hidden="true">{p.titel}</span>
        <span className={`badge absolute right-3 top-3 bg-dunkel ${p.status === "Fertig" ? "badge-live" : ""}`}>{p.status}</span>
        <VanSeite farbe={p.farbe} lang={p.typ === "daily"} className="relative w-full max-w-[280px]" />
        <span className="absolute inset-x-0 bottom-0 h-px bg-holz" aria-hidden="true" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="heading-m">{p.titel}{meins && <span className="label ml-3 align-middle text-accent">Dein Projekt</span>}</h3>
        <p className="mt-1 text-[15px] text-muted">{p.fahrzeug}</p>
        <p className="text-[15px] text-muted">{p.crew} · {p.dauer}</p>
        <blockquote className="mt-4 text-[17px] leading-snug">„{p.zitat}“</blockquote>
        <ul className="mt-4 flex flex-wrap gap-2">
          {p.highlights.map((h) => (
            <li key={h} className="border border-line px-2.5 py-1 font-condensed text-[14px] font-semibold uppercase tracking-wide">{h}</li>
          ))}
        </ul>
        {p.instagram && <a
          href={p.instagramUrl} target="_blank" rel="noopener noreferrer"
          className="mt-auto flex min-h-11 items-center gap-2 pt-5 font-condensed text-[15px] font-semibold uppercase tracking-wide text-accent underline-offset-4 hover:underline"
        >
          <IconInsta width={20} height={20} /> {p.instagram}
          <span className="sr-only">auf Instagram (Beispielprofil)</span>
        </a>}
      </div>
    </article>
  );
}
