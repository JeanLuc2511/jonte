"use client";

/**
 * ANALYSE-ADAPTER  →  n8n (Bildanalyse per KI-Modell, Fahrzeugdaten aus KBA-Liste oder Schnittstelle)
 * Der Browser spricht nur mit `/api/analyse/<art>`; Webhook-URLs bleiben auf dem Server.
 */
import type { BelegAnalyse, Fahrzeugdaten, ScheinAnalyse } from "@/lib/types";

async function mitFoto<T extends { ok: boolean; fehler?: string }>(art: string, foto: File): Promise<T> {
  const form = new FormData();
  form.append("foto", foto);
  try {
    const res = await fetch(`/api/analyse/${art}`, { method: "POST", body: form });
    return (await res.json()) as T;
  } catch {
    return { ok: false, fehler: "Keine Verbindung. Trag die Daten bitte von Hand ein." } as T;
  }
}

/** Liest nur HSN (Feld 2.1) und TSN (Feld 2.2). Das Foto wird nicht gespeichert. */
export const leseFahrzeugschein = (foto: File) => mitFoto<ScheinAnalyse>("fahrzeugschein", foto);

/** Liest Händler, Datum, Betrag und Positionen aus einem Beleg. */
export const leseBeleg = (foto: File) => mitFoto<BelegAnalyse>("beleg", foto);

export async function ladeFahrzeugdaten(hsn: string, tsn: string): Promise<Fahrzeugdaten> {
  try {
    const res = await fetch("/api/analyse/fahrzeugdaten", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hsn, tsn }),
    });
    return (await res.json()) as Fahrzeugdaten;
  } catch {
    return { gefunden: false };
  }
}

/** Verkleinert ein Foto im Browser (Bautagebuch, Chat), bevor es abgelegt wird. */
export function verkleinere(datei: File, maxKante = 720): Promise<string> {
  return new Promise((fertig, fehler) => {
    const url = URL.createObjectURL(datei);
    const bild = new Image();
    bild.onload = () => {
      const f = Math.min(1, maxKante / Math.max(bild.width, bild.height));
      const c = document.createElement("canvas");
      c.width = Math.round(bild.width * f);
      c.height = Math.round(bild.height * f);
      c.getContext("2d")?.drawImage(bild, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      fertig(c.toDataURL("image/jpeg", 0.72));
    };
    bild.onerror = () => { URL.revokeObjectURL(url); fehler(new Error("Bild nicht lesbar")); };
    bild.src = url;
  });
}
