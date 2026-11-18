"use client";

import { PHASEN } from "@/lib/daten/phasen";
import { useKonto, useRolle } from "@/lib/mein-camp/store";
import type { Projekt } from "@/lib/types";
import { ProjektKarte } from "./ProjektKarte";

/**
 * Community-Galerie: Beispielprojekte plus die eigenen Projekte aus Mein Camp.
 * Eigene Projekte erscheinen nur, solange sie öffentlich sind – der Privat-Knopf wirkt sofort.
 */
export function Galerie({ projekte, anzahl }: { projekte: Projekt[]; anzahl?: number }) {
  const z = useKonto();
  const rolle = useRolle();
  const eingeloggt = z && rolle && rolle !== "gast";

  const eigeneNamen = new Set(eingeloggt ? z.fahrzeuge.map((f) => f.spitzname.toLowerCase()) : []);
  const eigene: (Projekt & { meins: true })[] = eingeloggt
    ? z.projekte.filter((p) => p.oeffentlich).flatMap((p) => {
        const f = z.fahrzeuge.find((x) => x.id === p.fahrzeugId);
        if (!f) return [];
        const vorlage = projekte.find((x) => x.id === f.spitzname.toLowerCase());
        const letzter = p.tagebuch[0];
        return [{
          meins: true as const, id: p.id, titel: f.spitzname, crew: z.mitglied.vorname,
          fahrzeug: `${f.modell}${f.baujahr ? `, Baujahr ${f.baujahr}` : ""}`, typ: f.typ === "anderes" ? "sprinter" : f.typ, farbe: f.farbe,
          status: f.ausbaustand === "fertig" ? "Fertig" : "Im Bau",
          dauer: `Phase ${PHASEN.find((x) => x.id === p.aktivePhase)?.name} · ${p.tagebuch.length} Einträge im Bautagebuch`,
          zitat: letzter ? letzter.text : vorlage?.zitat ?? "Gerade erst angefangen.",
          highlights: vorlage?.highlights ?? [f.radstand, f.dachhoehe].filter((x): x is string => Boolean(x)),
          instagram: z.mitglied.instagram ?? "", instagramUrl: "https://www.instagram.com/",
        }];
      })
    : [];

  const liste = [...eigene, ...projekte.filter((p) => !eigeneNamen.has(p.id))].slice(0, anzahl);

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {liste.map((p, i) => (
        <div key={p.id} className={anzahl && i === anzahl - 1 ? "md:max-xl:hidden" : ""}>
          <ProjektKarte p={p} meins={"meins" in p} />
        </div>
      ))}
    </div>
  );
}
