import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RECHTSSEITEN } from "@/lib/daten/rechtliches";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return RECHTSSEITEN.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const seite = RECHTSSEITEN.find((r) => r.slug === slug);
  return seite ? { title: seite.titel } : {};
}

export default async function RechtsSeite({ params }: Props) {
  const { slug } = await params;
  const seite = RECHTSSEITEN.find((r) => r.slug === slug);
  if (!seite) notFound();

  return (
    <div className="hell">
      <div className="seite grid gap-10 py-14 lg:grid-cols-[240px_1fr] lg:gap-16 lg:py-20">
        <nav aria-label="Rechtliches" className="min-w-0 lg:sticky lg:top-32 lg:self-start">
          <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:px-0">
            {RECHTSSEITEN.map((r) => (
              <li key={r.slug} className="shrink-0">
                <Link href={`/rechtliches/${r.slug}`} className="chip lg:w-full" aria-pressed={r.slug === slug} aria-current={r.slug === slug ? "page" : undefined}>
                  {r.titel}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
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
      </div>
    </div>
  );
}
