"use client";

import { usePathname, useRouter } from "next/navigation";
import { setAlsSeb, useAdmin } from "@/lib/camp/store";
import { useRolle } from "@/lib/mein-camp/store";
import { demoAnsicht } from "@/lib/services/mitglieder";

const STUFEN = [
  { id: "gast", name: "Gast" },
  { id: "konto", name: "Konto" },
  { id: "mitglied", name: "Mitglied" },
] as const;

const knopf = (an: boolean) =>
  `min-h-8 whitespace-nowrap px-3 font-condensed text-[12px] font-bold uppercase tracking-[0.1em] transition-colors ${an ? "bg-gelb text-pflaume" : "text-muted hover:text-display"}`;

/** Schaltet die Demo zwischen den Kontostufen und Sebs Cockpit um – sitzt in der Demo-Leiste ganz oben. */
export function DemoSchalter() {
  const rolle = useRolle();
  const admin = useAdmin();
  const router = useRouter();
  const pfad = usePathname();
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Demo-Ansicht wechseln">
      <span className="max-lg:sr-only">Ansicht als</span>
      <div className="flex border border-line">
        {STUFEN.map((s) => (
          <button
            key={s.id} type="button" aria-pressed={!admin && rolle === s.id} className={knopf(!admin && rolle === s.id)}
            onClick={() => { setAlsSeb(false); demoAnsicht(s.id); if (pfad.startsWith("/cockpit")) router.push("/mein-camp"); }}
          >
            {s.name}
          </button>
        ))}
      </div>
      <button type="button" aria-pressed={admin === true} className={`${knopf(admin === true)} border border-line`} onClick={() => { setAlsSeb(true); router.push("/cockpit"); }}>
        <span className="max-md:hidden">Als </span>Seb<span className="max-md:hidden"> ansehen</span>
      </button>
    </div>
  );
}
