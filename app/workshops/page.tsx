import type { Metadata } from "next";
import { Abschnittskopf, Beispiel, Seitenkopf, WartelisteBand } from "@/components/Bausteine";
import { WorkshopKarte } from "@/components/WorkshopKarte";
import { getWorkshops } from "@/lib/services/buchung";

export const metadata: Metadata = {
  title: "Workshops",
  description: "Workshops rund um den Camper-Ausbau: Elektrik, Dachfenster, Dämmung, Möbelbau, Gas und Solar. Jeder Termin findet statt, sobald genug Leute dabei sind.",
};

// Termine hängen vom Tagesdatum ab – stündlich neu erzeugen.
export const revalidate = 3600;

const ABLAUF = [
  { nr: "1", titel: "Du reservierst deinen Platz", text: "Kostenlos und ohne Zahlungsdaten. Du siehst jederzeit, wie viele schon dabei sind." },
  { nr: "2", titel: "Die Runde füllt sich", text: "Sobald die Mindestzahl erreicht ist, steht der Termin fest. Du bekommst die Zusage per Mail." },
  { nr: "3", titel: "Erst dann zahlst du", text: "Mit der Zusage kommt der Zahlungslink. Vorher wird nichts abgebucht." },
];

export default async function WorkshopsSeite() {
  const workshops = await getWorkshops();

  return (
    <>
      <Seitenkopf eyebrow="Workshops im Camp" titel="Einmal zeigen lassen, dann selber machen">
        <p>
          Ein Thema, ein Tag, eine kleine Runde am echten Fahrzeug. Jeder Workshop hat eine Mindestteilnehmerzahl – er findet statt, sobald genug Leute dabei sind.
        </p>
      </Seitenkopf>

      {/* So funktioniert die Mindestteilnehmerzahl */}
      <section className="buehne">
        <div className="seite py-14 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <p className="eyebrow">So funktioniert’s</p>
              <h2 className="display-l mt-6">Kein Risiko für dich</h2>
              <p className="mt-5 text-lg text-muted">
                Kommt eine Runde bis 7 Tage vor dem Termin nicht zusammen, fällt der Workshop aus. Niemand zahlt etwas, und du bekommst den nächsten Termin zuerst angeboten.
              </p>
            </div>
            <ol className="grid gap-px self-start border border-line bg-[var(--border)] sm:grid-cols-3">
              {ABLAUF.map((s) => (
                <li key={s.nr} className="bg-gelb p-5">
                  <p className="font-display text-6xl leading-none">{s.nr}</p>
                  <h3 className="heading-s mt-4">{s.titel}</h3>
                  <p className="mt-2 text-[15px] text-muted">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Legende zum Balken */}
          <div className="mt-10 border border-line p-5 lg:flex lg:items-center lg:gap-10">
            <p className="label shrink-0">So liest du den Balken</p>
            <div className="mt-4 flex-1 lg:mt-0">
              <div className="flex max-w-md gap-1" aria-hidden="true">
                {[1, 1, 1, 0, 0, 0, 0, 0].map((voll, i) => (
                  <span key={i} className="relative h-5 flex-1">
                    <span className={`block h-full border border-pflaume ${voll ? "bg-pflaume" : i < 4 ? "" : "opacity-35"}`} />
                    {i === 3 && <span className="absolute -right-[3px] -top-1.5 h-8 w-[2px] bg-lila" />}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[15px] text-muted">
                Jedes Kästchen ist ein Platz. Gefüllt heißt reserviert. Die lila Linie markiert die Mindestzahl: Hier fehlt noch eine Person, dann findet der Workshop statt.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="seite abschnitt">
        <Abschnittskopf eyebrow="Die nächsten Termine" titel="Such dir dein Thema">
          <p>Für Einsteiger und für alle, die schon mittendrin stecken. <Beispiel>Beispieltermine und -preise</Beispiel></p>
        </Abschnittskopf>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {workshops.map((w) => <WorkshopKarte key={w.id} w={w} />)}
        </div>
      </section>

      <WartelisteBand />
    </>
  );
}
