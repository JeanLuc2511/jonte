"use client";

import Link from "next/link";
import { ABO, STUFEN_VERGLEICH } from "@/lib/daten/abo";
import { euro } from "@/lib/datum";
import type { Recht } from "@/lib/rechte";
import { darf } from "@/lib/rechte";
import { useRolle } from "@/lib/mein-camp/store";
import { Beispiel } from "../Bausteine";
import { IconHaken, IconSchloss } from "../Icons";

/** Kopf einer Seite im Mitgliederbereich. */
export function BereichKopf({ eyebrow, titel, children, aktion }: { eyebrow: string; titel: string; children?: React.ReactNode; aktion?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display-l mt-5">{titel}</h1>
        {children && <div className="lead mt-4">{children}</div>}
      </div>
      {aktion}
    </header>
  );
}

/** Zeigt den Inhalt nur mit dem nötigen Recht – sonst, was die Mitgliedschaft hier bringt. */
export function NurMit({ recht, titel, text, children }: { recht: Recht; titel: string; text: string; children: React.ReactNode }) {
  const rolle = useRolle();
  if (!rolle) return null;
  if (darf(rolle, recht)) return <>{children}</>;
  return (
    <div className="buehne p-6 lg:p-10">
      <IconSchloss width={36} height={36} />
      <p className="label mt-5">Nur für Mitglieder</p>
      <h2 className="heading-l mt-2">{titel}</h2>
      <p className="mt-3 max-w-xl text-lg text-muted">{text}</p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Link href="/mein-camp/mitgliedschaft" className="btn btn-primary">Mitglied werden</Link>
        <span className="text-muted">{euro(ABO.preisProMonat)} im Monat · monatlich kündbar <Beispiel /></span>
      </div>
    </div>
  );
}

/** Vergleich der drei Kontostufen. */
export function StufenVergleich({ aktuelle }: { aktuelle?: string | null }) {
  const spalten = [
    { id: "gast", name: "Gast", preis: "ohne Konto" },
    { id: "konto", name: "Konto", preis: "kostenlos" },
    { id: "mitglied", name: "Mitglied", preis: `${euro(ABO.preisProMonat)} / Monat` },
  ] as const;
  const zelle = (w: string | boolean) =>
    w === true ? <IconHaken width={20} height={20} className="mx-auto" aria-label="ja" />
      : w === false ? <span aria-label="nein" className="opacity-40">–</span>
        : <span className="text-[14px] font-semibold leading-tight">{w}</span>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr>
            <th className="w-[40%] border-b border-line-strong p-3" />
            {spalten.map((s) => (
              <th key={s.id} scope="col" className={`border-b border-line-strong p-3 text-center align-bottom ${s.id === "mitglied" ? "bg-surface-strong" : ""}`}>
                <span className="heading-s block">{s.name}</span>
                <span className="block text-[13px] font-normal text-muted">{s.preis}</span>
                {aktuelle === s.id && <span className="label mt-1 block text-accent">Deine Stufe</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {STUFEN_VERGLEICH.map((z) => (
            <tr key={z.zeile}>
              <th scope="row" className="border-b border-line p-3 font-medium">{z.zeile}</th>
              <td className="border-b border-line p-3 text-center">{zelle(z.gast)}</td>
              <td className="border-b border-line p-3 text-center">{zelle(z.konto)}</td>
              <td className="border-b border-line bg-surface-strong p-3 text-center">{zelle(z.mitglied)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const MOTIVE: Record<string, { text: string; flaeche: string; farbe: string }> = {
  kabel: { text: "Kabel", flaeche: "#331654", farbe: "#FDE58B" },
  plan: { text: "Schaltplan", flaeche: "#FFFCF3", farbe: "#331654" },
  boden: { text: "Bodenplatte", flaeche: "#A38879", farbe: "#1E1409" },
  daemmung: { text: "Dämmung", flaeche: "#56258D", farbe: "#FFFCF3" },
  daemmung2: { text: "Dach", flaeche: "#EED5C7", farbe: "#331654" },
  leer: { text: "Leerer Kasten", flaeche: "#E6C0AB", farbe: "#1E1409" },
};

/** Foto aus dem Bautagebuch – oder eine gezeichnete Kachel für die Beispielbilder. */
export function Foto({ quelle, className = "" }: { quelle: string; className?: string }) {
  if (!quelle.startsWith("motiv:")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={quelle} alt="Foto aus dem Bautagebuch" className={`aspect-[4/3] w-full object-cover ${className}`} />;
  }
  const m = MOTIVE[quelle.slice(6)] ?? MOTIVE.leer;
  return (
    <div className={`relative flex aspect-[4/3] w-full items-end overflow-hidden p-2 ${className}`} style={{ background: m.flaeche, color: m.farbe }} role="img" aria-label={`Beispielbild: ${m.text}`}>
      <svg viewBox="0 0 120 90" className="absolute inset-0 h-full w-full opacity-30" aria-hidden="true">
        <path d="M-5 70 L40 30 L70 55 L95 35 L125 62 V95 H-5Z" fill="currentColor" />
        <circle cx="92" cy="20" r="9" fill="currentColor" />
      </svg>
      <span className="relative font-condensed text-[12px] font-bold uppercase tracking-[0.14em]">{m.text} · Beispielbild</span>
    </div>
  );
}

/** Kleiner Demo-Schalter für Aktionen, die später Seb im Cockpit auslöst. */
export function DemoAktion({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="mt-3 flex min-h-11 items-center gap-2 border border-dashed border-line px-3 text-left font-condensed text-[13px] font-semibold uppercase tracking-wide text-muted hover:text-display">
      Demo · {children}
    </button>
  );
}

export const Feldgruppe = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
  <label className={`block ${className}`}>
    <span className="feld-label">{label}</span>
    {children}
  </label>
);
