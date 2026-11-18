"use client";

/** Kleine Bausteine fürs Cockpit – gleiche Tokens und Formen wie Website und Mitgliederbereich. */
import { useRef, useState } from "react";
import { alleAkten, alleFaelle } from "@/lib/camp/auswertung";
import { useCamp } from "@/lib/camp/store";
import { isoHeute } from "@/lib/datum";
import { useKonto } from "@/lib/mein-camp/store";
import { verkleinere } from "@/lib/services/analyse";
import { IconHaken, IconKamera } from "../Icons";

/** Alles, was eine Cockpit-Seite braucht – oder `null`, solange die Daten noch laden. */
export function useCockpit() {
  const camp = useCamp();
  const konto = useKonto();
  if (!camp || !konto) return null;
  return { camp, konto, heute: isoHeute(), akten: alleAkten(camp, konto), faelle: alleFaelle(camp, konto) };
}

export function CKopf({ titel, children, aktion }: { titel: string; children?: React.ReactNode; aktion?: React.ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="eyebrow">Camp-Cockpit</p>
        <h1 className="display-l mt-4 !text-[clamp(2rem,3.6vw,3rem)]">{titel}</h1>
        {children && <div className="mt-3 text-muted">{children}</div>}
      </div>
      {aktion}
    </header>
  );
}

/** Kennzahl als Kachel: eine Zahl, ein Label, optional ein Balken (eine Farbe, Wert steht immer als Text daneben). */
export function Kachel({ label, wert, hinweis, anteil }: { label: string; wert: React.ReactNode; hinweis?: React.ReactNode; anteil?: number }) {
  return (
    <div className="karte p-4">
      <p className="label text-muted">{label}</p>
      <p className="mt-2 font-display text-4xl leading-none text-display">{wert}</p>
      {anteil !== undefined && (
        <div className="mt-3 h-1.5 bg-surface-strong" aria-hidden="true"><div className="h-full bg-gelb" style={{ width: `${Math.round(anteil * 100)}%` }} /></div>
      )}
      {hinweis && <p className="mt-2 text-[14px] text-muted">{hinweis}</p>}
    </div>
  );
}

export function Reiter<T extends string>({ werte, aktiv, onWahl, label }: { werte: readonly (readonly [T, string, number?])[]; aktiv: T; onWahl: (w: T) => void; label: string }) {
  return (
    <div className="-mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label={label}>
      {werte.map(([id, name, zahl]) => (
        <button key={id} type="button" className="chip" aria-pressed={aktiv === id} onClick={() => onWahl(id)}>
          {name}
          {zahl ? <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[12px] ${aktiv === id ? "bg-pflaume text-gelb" : "bg-gelb text-pflaume"}`}>{zahl}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Eingabe({ label, wert, onChange, typ = "text", className = "", ...rest }: {
  label: string; wert: string | number; onChange: (v: string) => void; typ?: string; className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type" | "className">) {
  return (
    <label className={`block ${className}`}>
      <span className="feld-label">{label}</span>
      <input type={typ} className="feld" value={wert} onChange={(e) => onChange(e.target.value)} {...rest} />
    </label>
  );
}

export function Textfeld({ label, wert, onChange, zeilen = 3, className = "", hilfe }: { label: string; wert: string; onChange: (v: string) => void; zeilen?: number; className?: string; hilfe?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="feld-label">{label}</span>
      <textarea className="feld" rows={zeilen} value={wert} onChange={(e) => onChange(e.target.value)} />
      {hilfe && <span className="mt-1 block text-[13px] text-muted">{hilfe}</span>}
    </label>
  );
}

export function Auswahl({ label, wert, onChange, optionen, className = "" }: { label: string; wert: string; onChange: (v: string) => void; optionen: readonly (readonly [string, string])[]; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="feld-label">{label}</span>
      <select className="feld" value={wert} onChange={(e) => onChange(e.target.value)}>
        {optionen.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
      </select>
    </label>
  );
}

/** „Gespeichert"-Rückmeldung neben einem Speichern-Knopf. */
export function useGespeichert(): [React.ReactNode, () => void] {
  const [an, setAn] = useState(false);
  const zeige = an ? <span className="einblenden flex items-center gap-1.5 font-semibold text-display" role="status"><IconHaken width={18} height={18} /> Gespeichert – wirkt sofort auf der Website</span> : null;
  return [zeige, () => { setAn(true); window.setTimeout(() => setAn(false), 2600); }];
}

/** Foto aufnehmen oder auswählen (am Handy direkt mit der Kamera). Liefert ein verkleinertes Bild. */
export function FotoKnopf({ onFoto, children = "Foto aufnehmen", kamera = true }: { onFoto: (quelle: string, name: string) => void; children?: React.ReactNode; kamera?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" className="btn btn-outline btn-klein" onClick={() => ref.current?.click()}><IconKamera width={18} height={18} /> {children}</button>
      <input
        ref={ref} type="file" accept="image/*" multiple={!kamera} capture={kamera ? "environment" : undefined} className="sr-only" aria-label="Foto auswählen"
        onChange={async (e) => {
          for (const d of [...(e.target.files ?? [])]) {
            const q = await verkleinere(d, 900).catch(() => null);
            if (q) onFoto(q, d.name.replace(/\.[a-z0-9]+$/i, ""));
          }
          e.target.value = "";
        }}
      />
    </>
  );
}

export const vorMin = (iso: string) => {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  return min < 1 ? "gerade eben" : min < 60 ? `vor ${min} Min.` : min < 1440 ? `vor ${Math.round(min / 60)} Std.` : `vor ${Math.round(min / 1440)} ${Math.round(min / 1440) === 1 ? "Tag" : "Tagen"}`;
};

export const ABO_NAME: Record<string, string> = { aktiv: "Abo aktiv", pausiert: "Abo pausiert", gekuendigt: "Gekündigt", keins: "Kostenloses Konto" };
