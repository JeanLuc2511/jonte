import type { Metadata } from "next";
import Link from "next/link";
import { Beispiel, Seitenkopf } from "@/components/Bausteine";
import { IconPlus } from "@/components/Icons";
import { getFaq } from "@/lib/services/inhalte";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Häufige Fragen zu Werkstattbucht, Werkzeug, Versicherung und Haftung, Storno, Workshops und Fachshop.",
};

const anker = (titel: string) => titel.toLowerCase().replace(/[^a-zäöü]+/g, "-");

export default async function FaqSeite() {
  const gruppen = await getFaq();
  return (
    <>
      <Seitenkopf eyebrow="Häufige Fragen" titel="Frag ruhig. Die meisten fragen dasselbe.">
        <p>Was du mitbringen musst, wie du versichert bist und was passiert, wenn du länger brauchst. <Beispiel>Beispielantworten</Beispiel></p>
      </Seitenkopf>
      <div className="seite abschnitt grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
        <nav aria-label="Themen" className="min-w-0 lg:sticky lg:top-32 lg:self-start">
          <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-0 lg:px-0">
            {gruppen.map((g) => (
              <li key={g.titel} className="shrink-0">
                <a href={`#${anker(g.titel)}`} className="chip lg:w-full lg:border-0 lg:border-b lg:px-0 lg:normal-case lg:tracking-normal">
                  {g.titel}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0 space-y-14">
          {gruppen.map((g) => (
            <section key={g.titel} id={anker(g.titel)}>
              <h2 className="heading-l">{g.titel}</h2>
              <div className="mt-5 border-t border-line">
                {g.fragen.map((f) => (
                  <details key={f.frage} className="group border-b border-line">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-semibold hover:text-display [&::-webkit-details-marker]:hidden">
                      {f.frage}
                      <IconPlus className="shrink-0 text-display transition-transform group-open:rotate-45" />
                    </summary>
                    <p className="max-w-2xl pb-5 text-muted">{f.antwort}</p>
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
    </>
  );
}
