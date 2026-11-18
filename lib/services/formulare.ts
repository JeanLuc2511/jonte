/**
 * FORMULAR-ADAPTER  →  n8n-Webhook
 *
 * Der Browser schickt Formulare an die eigene Route `/api/formulare/<id>`.
 * Die Route leitet serverseitig an den n8n-Webhook weiter – die Webhook-URL
 * bleibt damit geheim und ist pro Formular per Umgebungsvariable einstellbar
 * (siehe `.env.example`). Ohne Variable läuft das Formular im Demo-Modus.
 */
import type { FormularAntwort, FormularId } from "@/lib/types";
import { anfrageEingegangen } from "./camp";

export async function sendeFormular(
  formular: FormularId,
  daten: Record<string, unknown>,
): Promise<FormularAntwort> {
  try {
    const res = await fetch(`/api/formulare/${formular}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(daten),
    });
    const antwort = (await res.json()) as FormularAntwort;
    // Demo: Die Anfrage erscheint sofort in Sebs Cockpit. Später liest das Cockpit sie aus dem Backend.
    if (antwort.ok) {
      const angaben: Record<string, string> = {};
      for (const [k, v] of Object.entries(daten)) {
        if (["email", "telefon", "einwilligung", "vorname", "name"].includes(k) || v === "" || v == null) continue;
        angaben[k.charAt(0).toUpperCase() + k.slice(1)] = Array.isArray(v) ? v.join(", ") : String(v);
      }
      anfrageEingegangen({ art: formular, name: String(daten.vorname ?? daten.name ?? ""), email: String(daten.email ?? ""), telefon: daten.telefon ? String(daten.telefon) : undefined, angaben });
    }
    return antwort;
  } catch {
    return { ok: false, fehler: "Keine Verbindung. Versuch es bitte gleich noch einmal." };
  }
}
