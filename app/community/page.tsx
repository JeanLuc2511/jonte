import type { Metadata } from "next";
import Link from "next/link";
import { Abschnittskopf, Beispiel, Seitenkopf, WartelisteBand } from "@/components/Bausteine";
import { IconInsta } from "@/components/Icons";
import { Galerie } from "@/components/Galerie";
import { SITE } from "@/lib/daten/site";
import { getProjekte } from "@/lib/services/inhalte";

export const metadata: Metadata = {
  title: "Community",
  description: "Ausbauprojekte aus der Halle: Wer baut gerade was, wie lange dauert es und wo kannst du den Leuten auf Instagram folgen.",
};

export default async function CommunitySeite() {
  const projekte = await getProjekte();
  const imBau = projekte.filter((p) => p.status === "Im Bau").length;

  return (
    <>
      <Seitenkopf eyebrow="Aus der Halle" titel="Jeder Camper hier hat einen Namen">
        <p>
          Im Camp wird nebeneinander gebaut, gefachsimpelt und geholfen. Das sind die Projekte aus der Halle – und die Menschen dahinter. Folg ihnen auf Instagram und schau zu, wie aus einem leeren Kastenwagen ein Zuhause wird.
        </p>
      </Seitenkopf>

      <section className="seite abschnitt">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Abschnittskopf eyebrow="Ausbauprojekte" titel={`${imBau} im Bau, ${projekte.length - imBau} schon unterwegs`} />
          <Beispiel>Beispielprojekte und -profile</Beispiel>
        </div>
        <div className="mt-10"><Galerie projekte={projekte} /></div>
      </section>

      <section className="border-y border-line">
        <div className="seite abschnitt grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">Dein Projekt hier</p>
            <h2 className="display-l mt-6">Zeig, was du baust</h2>
            <p className="lead mt-5">
              Wer im Camp schraubt, kann sein Projekt hier vorstellen. Mit dem kostenlosen Konto führst du ein Bautagebuch – auf Wunsch landet es direkt in dieser Galerie, verlinkt mit deinem Instagram-Profil. Ein Klick, und es ist wieder privat.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/mein-camp/projekt" className="btn btn-primary">Mein Projekt zeigen</Link>
              <a href={SITE.instagram.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                <IconInsta width={18} height={18} /> {SITE.instagram.handle}
              </a>
            </div>
          </div>
          <ol className="grid gap-px border border-line bg-line sm:grid-cols-2">
            {[
              ["Rohbau", "Leerräumen, entrosten, Fenster und Dachhaube setzen."],
              ["Dämmung", "Blech bekleben, Hohlräume füllen, Unterkonstruktion."],
              ["Elektrik & Wasser", "Kabel ziehen, bevor die Wände zu sind."],
              ["Möbel", "Bett, Küche, Schränke – und alles, was klappert, festschrauben."],
            ].map(([t, text], i) => (
              <li key={t} className="bg-dunkel p-5">
                <p className="font-display text-4xl text-lila-hell">0{i + 1}</p>
                <h3 className="heading-s mt-2">{t}</h3>
                <p className="mt-1 text-[15px] text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <WartelisteBand />
    </>
  );
}
