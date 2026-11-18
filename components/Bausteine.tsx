import Link from "next/link";
import { IconPfeil } from "./Icons";

/** Seitenkopf: Eyebrow, große Headline, Einleitung. */
export function Seitenkopf({
  eyebrow, titel, children, aktion,
}: { eyebrow: string; titel: string; children?: React.ReactNode; aktion?: React.ReactNode }) {
  return (
    <section className="raster border-b border-line">
      <div className="seite py-14 lg:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display-xl mt-6 max-w-4xl">{titel}</h1>
        {children && <div className="lead mt-6 max-w-2xl">{children}</div>}
        {aktion && <div className="mt-8 flex flex-wrap gap-3">{aktion}</div>}
      </div>
    </section>
  );
}

export function Abschnittskopf({
  eyebrow, titel, children, className = "",
}: { eyebrow: string; titel: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={`max-w-3xl ${className}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="display-l mt-6">{titel}</h2>
      {children && <div className="lead mt-5">{children}</div>}
    </div>
  );
}

export function PfeilLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="btn btn-ghost">
      {children} <IconPfeil width={18} height={18} />
    </Link>
  );
}

/** Dezenter Hinweis, dass ein Wert ein Beispiel ist. */
export function Beispiel({ children = "Beispiel" }: { children?: React.ReactNode }) {
  return (
    <span className="font-condensed text-[12px] font-semibold uppercase tracking-[0.12em] text-muted opacity-80">
      {children}
    </span>
  );
}

/** Gelbes Band, das zur Warteliste führt. */
export function WartelisteBand() {
  return (
    <section className="buehne">
      <div className="seite flex flex-col gap-8 py-14 lg:flex-row lg:items-center lg:justify-between lg:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow">Wir schrauben noch</p>
          <h2 className="display-l mt-6">Sei dabei, wenn das Rolltor aufgeht</h2>
          <p className="mt-5 text-lg text-muted">
            Trag dich in die Warteliste ein. Du erfährst als Erstes, wann es losgeht, und sicherst dir eine der ersten Werkstattbuchten.
          </p>
        </div>
        <Link href="/warteliste" className="btn btn-primary shrink-0">Zur Warteliste</Link>
      </div>
    </section>
  );
}
