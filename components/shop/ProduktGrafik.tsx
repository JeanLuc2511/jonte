import type { ProduktKategorie } from "@/lib/types";
import { IconBlitz, IconFenster, IconHolz, IconSchicht, IconSchraube, IconTropfen } from "../Icons";

const STIL: Record<ProduktKategorie, { icon: typeof IconBlitz; flaeche: string; farbe: string }> = {
  "Dämmung": { icon: IconSchicht, flaeche: "#331654", farbe: "#FDE58B" },
  "Elektrik": { icon: IconBlitz, flaeche: "#FDE58B", farbe: "#331654" },
  "Fenster & Lüftung": { icon: IconFenster, flaeche: "#EED5C7", farbe: "#331654" },
  "Möbelbau & Holz": { icon: IconHolz, flaeche: "#A38879", farbe: "#1E1409" },
  "Wasser & Gas": { icon: IconTropfen, flaeche: "#56258D", farbe: "#FFFCF3" },
  "Befestigen & Dichten": { icon: IconSchraube, flaeche: "#FFFCF3", farbe: "#331654" },
};

/** Typografische Produktkachel statt Produktfoto. */
export function ProduktGrafik({
  kategorie, nummer, gross = false,
}: { kategorie: ProduktKategorie; nummer: string; gross?: boolean }) {
  const s = STIL[kategorie];
  const Icon = s.icon;
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${gross ? "aspect-square" : "aspect-[4/3]"}`}
      style={{ background: s.flaeche, color: s.farbe }} aria-hidden="true"
    >
      <span className="absolute left-3 top-3 font-condensed text-[12px] font-bold uppercase tracking-[0.16em] opacity-70">
        {kategorie}
      </span>
      <span className="absolute bottom-2 right-3 font-display text-2xl opacity-25">{nummer}</span>
      <Icon width={gross ? 180 : 84} height={gross ? 180 : 84} strokeWidth={gross ? 0.7 : 1} />
    </div>
  );
}
