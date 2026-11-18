"use client";

import { useState } from "react";
import { IconSchloss } from "../Icons";

/**
 * Freigabe einer KI-Abfrage: Jede Bildanalyse braucht einmal die PIN.
 * Die Eingabe wird nicht gespeichert und erst auf dem Server geprüft.
 */
export function PinFreigabe({ was, fehler, laedt, onFreigabe, onAbbruch }: {
  was: string; fehler?: string | null; laedt?: boolean; onFreigabe: (pin: string) => void; onAbbruch: () => void;
}) {
  const [pin, setPin] = useState("");
  return (
    <form
      className="einblenden mt-5 border border-line-strong p-4" aria-label="Freigabe mit PIN"
      onSubmit={(e) => { e.preventDefault(); if (pin) { onFreigabe(pin); setPin(""); } }}
    >
      <p className="flex items-center gap-2 font-semibold"><IconSchloss width={20} height={20} /> Freigabe für die Bildanalyse</p>
      <p className="mt-1 text-[15px] text-muted">{was} wird von einem KI-Dienst gelesen. Gib dafür die PIN ein – sie gilt nur für diese eine Abfrage.</p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label>
          <span className="feld-label">PIN</span>
          <input
            className="feld w-36 tracking-[0.4em]" type="password" inputMode="numeric" autoComplete="off" maxLength={12} autoFocus
            value={pin} onChange={(e) => setPin(e.target.value)} aria-invalid={Boolean(fehler)}
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={!pin || laedt}>{laedt ? "Wird geprüft …" : "Freigeben"}</button>
        <button type="button" className="btn btn-ghost" onClick={onAbbruch}>Lieber von Hand</button>
      </div>
      {fehler && <p className="mt-3 font-semibold" role="alert">{fehler}</p>}
    </form>
  );
}
