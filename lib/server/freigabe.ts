import { createHash, timingSafeEqual } from "node:crypto";

/**
 * PIN-Freigabe für KI-Abfragen (Bildanalyse von Fahrzeugschein und Beleg).
 *
 * Die PIN steht ausschließlich in der Umgebungsvariable KI_PIN auf dem Server – nie im Code,
 * nie im Browser. Jede einzelne Abfrage muss sie mitschicken; sie wird nirgends zwischengespeichert.
 * Ist ein KI-Webhook hinterlegt, aber keine PIN gesetzt, bleibt die Abfrage gesperrt.
 */
const MAX_FEHLVERSUCHE = 5;
const SPERRE_MS = 15 * 60_000;
const fehlversuche = new Map<string, { anzahl: number; bis: number }>();

export const pinEingerichtet = () => Boolean(process.env.KI_PIN);

const hash = (t: string) => createHash("sha256").update(t).digest();

function absender(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unbekannt";
}

export type Freigabe = { ok: true } | { ok: false; status: number; fehler: string; pinNoetig?: boolean };

export function pruefeFreigabe(request: Request): Freigabe {
  const pin = process.env.KI_PIN;
  if (!pin) return { ok: false, status: 503, fehler: "Die Bildanalyse ist noch nicht freigeschaltet. Trag die Daten bitte von Hand ein." };

  const wer = absender(request);
  const jetzt = Date.now();
  const stand = fehlversuche.get(wer);
  if (stand && stand.bis > jetzt && stand.anzahl >= MAX_FEHLVERSUCHE) {
    return { ok: false, status: 429, fehler: "Zu viele falsche Versuche. Probier es in einer Viertelstunde noch einmal." };
  }

  const eingabe = request.headers.get("x-freigabe-pin") ?? "";
  if (!eingabe) return { ok: false, status: 401, fehler: "Für die Bildanalyse brauchst du die PIN.", pinNoetig: true };

  if (!timingSafeEqual(hash(eingabe), hash(pin))) {
    const anzahl = stand && stand.bis > jetzt ? stand.anzahl + 1 : 1;
    fehlversuche.set(wer, { anzahl, bis: jetzt + SPERRE_MS });
    return { ok: false, status: 401, fehler: "Die PIN stimmt nicht.", pinNoetig: true };
  }
  fehlversuche.delete(wer);
  return { ok: true };
}
