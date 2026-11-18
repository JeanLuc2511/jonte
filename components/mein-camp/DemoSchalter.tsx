"use client";

import { useRolle } from "@/lib/mein-camp/store";
import { demoAnsicht } from "@/lib/services/mitglieder";

const STUFEN = [
  { id: "gast", name: "Gast" },
  { id: "konto", name: "Konto" },
  { id: "mitglied", name: "Mitglied" },
] as const;

/** Schaltet die Demo zwischen den drei Kontostufen um – sitzt in der Demo-Leiste ganz oben. */
export function DemoSchalter() {
  const rolle = useRolle();
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Demo-Ansicht wechseln">
      <span className="max-sm:sr-only">Ansicht als</span>
      <div className="flex border border-line">
        {STUFEN.map((s) => (
          <button
            key={s.id} type="button" aria-pressed={rolle === s.id} onClick={() => demoAnsicht(s.id)}
            className={`min-h-8 px-3 font-condensed text-[12px] font-bold uppercase tracking-[0.1em] transition-colors ${rolle === s.id ? "bg-gelb text-pflaume" : "text-muted hover:text-display"}`}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
