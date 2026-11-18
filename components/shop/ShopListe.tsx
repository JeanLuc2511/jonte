"use client";

import Link from "next/link";
import { useState } from "react";
import { useKonto, useRolle } from "@/lib/mein-camp/store";
import { FAHRZEUGE } from "@/lib/daten/fahrzeuge";
import type { FahrzeugId, Produkt } from "@/lib/types";
import { ProduktKarte } from "./ProduktKarte";

export function ShopListe({
  produkte, kategorien, startFahrzeug,
}: { produkte: Produkt[]; kategorien: readonly string[]; startFahrzeug?: FahrzeugId }) {
  const konto = useKonto();
  const rolle = useRolle();
  const meins = rolle && rolle !== "gast" ? konto?.fahrzeuge.find((f) => f.id === konto.aktivesFahrzeugId) : undefined;
  const ausGarage = meins && meins.typ !== "anderes" ? meins.typ : null;
  // Solange nichts gewählt wurde, gilt das aktive Fahrzeug aus der Garage.
  const [gewaehlt, setFahrzeug] = useState<FahrzeugId | null | undefined>(startFahrzeug);
  const fahrzeug = gewaehlt === undefined ? ausGarage : gewaehlt;
  const [kategorie, setKategorie] = useState<string | null>(null);

  const passt = (p: Produkt) => !fahrzeug || p.passend === "universal" || p.passend.includes(fahrzeug);
  const treffer = produkte
    .filter((p) => passt(p) && (!kategorie || p.kategorie === kategorie))
    // Fahrzeugspezifisches zuerst, wenn ein Fahrzeug gewählt ist
    .sort((a, b) => (fahrzeug ? Number(a.passend === "universal") - Number(b.passend === "universal") : 0));

  return (
    <>
      <div className="buehne">
        <div className="seite py-8 lg:py-10">
          <p className="heading-m">{meins && gewaehlt === undefined && ausGarage ? `Passend für ${meins.spitzname}` : "Was fährst du?"}</p>
          {meins && gewaehlt === undefined && ausGarage && (
            <p className="mt-1 text-muted">Aus deiner Garage: {meins.hersteller} {meins.modell}. <Link href="/mein-camp/garage" className="underline underline-offset-4">Fahrzeug wechseln</Link></p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" role="group" aria-label="Fahrzeug wählen">
            <button type="button" className="option" aria-pressed={!fahrzeug} onClick={() => setFahrzeug(null)}>
              Alle Fahrzeuge
            </button>
            {FAHRZEUGE.map((f) => (
              <button
                key={f.id} type="button" className="option !items-start !flex-col !gap-0"
                aria-pressed={fahrzeug === f.id} onClick={() => setFahrzeug(fahrzeug === f.id ? null : f.id)}
              >
                <span>{f.name}</span>
                <span className="text-[13px] font-medium text-muted">{f.zusatz ?? f.hersteller}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="seite py-10 lg:py-14">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Kategorie wählen">
          <button type="button" className="chip" aria-pressed={!kategorie} onClick={() => setKategorie(null)}>Alles</button>
          {kategorien.map((k) => (
            <button key={k} type="button" className="chip" aria-pressed={kategorie === k} onClick={() => setKategorie(kategorie === k ? null : k)}>
              {k}
            </button>
          ))}
        </div>
        <p className="mt-5 text-muted" aria-live="polite">
          {treffer.length} {treffer.length === 1 ? "Artikel" : "Artikel"}
          {fahrzeug && <> passend für <strong className="text-ink">{FAHRZEUGE.find((f) => f.id === fahrzeug)?.name}</strong></>}
          {kategorie && <> in <strong className="text-ink">{kategorie}</strong></>}
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {treffer.map((p) => <ProduktKarte key={p.id} p={p} />)}
        </div>
        {treffer.length === 0 && (
          <p className="mt-8 text-muted">Für diese Kombination liegt noch nichts im Regal. Nimm einen Filter raus.</p>
        )}
      </div>
    </>
  );
}
