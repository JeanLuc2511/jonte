import type { Metadata } from "next";
import { Beispiel, Seitenkopf } from "@/components/Bausteine";
import { FaqInhalt } from "@/components/live/Inhalte";
import { getFaq } from "@/lib/services/inhalte";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Häufige Fragen zu Werkstattbucht, Werkzeug, Versicherung und Haftung, Storno, Workshops und Fachshop.",
};

export default async function FaqSeite() {
  const gruppen = await getFaq();
  return (
    <>
      <Seitenkopf eyebrow="Häufige Fragen" titel="Frag ruhig. Die meisten fragen dasselbe.">
        <p>Was du mitbringen musst, wie du versichert bist und was passiert, wenn du länger brauchst. <Beispiel>Beispielantworten</Beispiel></p>
      </Seitenkopf>
      <FaqInhalt gruppen={gruppen} />
    </>
  );
}
