import type { Metadata } from "next";
import { Seitenkopf } from "@/components/Bausteine";
import { Buchung } from "@/components/Buchung";
import { getHalle, getLeistungen, getWorkshops } from "@/lib/services/buchung";
import type { LeistungId } from "@/lib/types";

export const metadata: Metadata = {
  title: "Buchen",
  description: "Werkstattbucht, Workshop, Ausbau-Beratung oder Gasprüfung buchen – auch ohne Konto.",
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const LEISTUNGEN: LeistungId[] = ["bucht", "workshop", "beratung", "gaspruefung"];

export default async function BuchenSeite({
  searchParams,
}: { searchParams: Promise<Record<string, string | undefined>> }) {
  const [q, halle, leistungen, workshops] = await Promise.all([searchParams, getHalle(), getLeistungen(), getWorkshops()]);
  const buchten = halle.zonen.filter((z) => z.typ === "bucht");

  return (
    <>
      <Seitenkopf eyebrow="Buchen" titel="In drei Schritten in die Halle">
        <p>Werkstattbucht, Workshop, Beratung oder Gasprüfung. Ohne Konto, ohne Umwege.</p>
      </Seitenkopf>
      <Buchung
        leistungen={leistungen} buchten={buchten} workshops={workshops}
        start={{
          leistung: LEISTUNGEN.find((l) => l === q.leistung),
          bucht: buchten.find((b) => b.id === q.bucht)?.id,
          workshop: workshops.find((w) => w.id === q.workshop)?.id,
          von: q.von && ISO.test(q.von) ? q.von : undefined,
          bis: q.bis && ISO.test(q.bis) ? q.bis : undefined,
        }}
      />
    </>
  );
}
