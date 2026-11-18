/**
 * FORMULAR-ADAPTER  →  n8n-Webhook
 *
 * Der Browser schickt Formulare an die eigene Route `/api/formulare/<id>`.
 * Die Route leitet serverseitig an den n8n-Webhook weiter – die Webhook-URL
 * bleibt damit geheim und ist pro Formular per Umgebungsvariable einstellbar
 * (siehe `.env.example`). Ohne Variable läuft das Formular im Demo-Modus.
 */
import type { FormularAntwort, FormularId } from "@/lib/types";

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
    return (await res.json()) as FormularAntwort;
  } catch {
    return { ok: false, fehler: "Keine Verbindung. Versuch es bitte gleich noch einmal." };
  }
}
