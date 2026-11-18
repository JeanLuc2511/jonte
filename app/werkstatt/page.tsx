import type { Metadata } from "next";
import Link from "next/link";
import { Seitenkopf, WartelisteBand } from "@/components/Bausteine";
import { HallenFotos } from "@/components/live/Inhalte";
import { T } from "@/components/live/T";
import { WerkstattExplorer } from "@/components/werkstatt/WerkstattExplorer";
import { getHalle } from "@/lib/services/buchung";

export const metadata: Metadata = {
  title: "Werkstatt",
  description: "Die Halle von oben: Werkstattbuchten, Werkbänke, Stationen und jedes Werkzeug. Zeitraum wählen und freie Werkstattbuchten sehen.",
};

export default async function WerkstattSeite() {
  const { zonen, werkzeuge } = await getHalle();

  return (
    <>
      <Seitenkopf eyebrow="Die Halle von oben" titel={<T k="werkstatt.titel" />}>
        <p><T k="werkstatt.text" /></p>
      </Seitenkopf>

      <WerkstattExplorer zonen={zonen} werkzeuge={werkzeuge} />
      <HallenFotos />

      <section className="border-t border-line">
        <div className="seite abschnitt !pb-10"><div className="grid gap-px border border-line bg-line md:grid-cols-3">
          {[
            { nr: "01", titel: "Werkzeug ohne Zähler", text: "Für Mitglieder ist das Werkzeug inklusive. Ohne Abo zahlst du eine Werkzeugpauschale von 10 € pro Tag – nie pro Säge." },
            { nr: "02", titel: "Werkzeug bleibt hier", text: "Nehmen, nutzen, zurückhängen. Einen Verleih zum Mitnehmen gibt es nicht – dafür ist immer alles da." },
            { nr: "03", titel: "Einweisung statt Rätselraten", text: "Tischkreissäge, Oberfräse und Schweißgerät zeigen wir dir einmal. Danach nutzt du sie selbstständig." },
          ].map((p) => (
            <div key={p.nr} className="bg-dunkel p-6 lg:p-8">
              <p className="font-display text-5xl text-lila-hell">{p.nr}</p>
              <h3 className="heading-s mt-4">{p.titel}</h3>
              <p className="mt-2 text-muted">{p.text}</p>
            </div>
          ))}
        </div></div>
        <div className="seite flex flex-wrap gap-3 pb-16">
          <Link href="/buchen" className="btn btn-primary">Werkstattbucht buchen</Link>
          <Link href="/faq" className="btn btn-outline">Fragen zur Halle</Link>
        </div>
      </section>

      <WartelisteBand />
    </>
  );
}
