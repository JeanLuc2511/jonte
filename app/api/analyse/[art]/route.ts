import { NextResponse } from "next/server";
import { BEISPIEL_BELEG, BEISPIEL_SCHEIN, KBA_BEISPIELE } from "@/lib/daten/kba";
import { pinEingerichtet, pruefeFreigabe } from "@/lib/server/freigabe";
import type { BelegAnalyse, Fahrzeugdaten, ScheinAnalyse } from "@/lib/types";

/**
 * Bildanalyse und Fahrzeugdaten – laufen über n8n, damit KI-Anbieter und Datenquelle austauschbar bleiben.
 *
 *   fahrzeugschein  Foto  → { hsn, tsn }                      N8N_WEBHOOK_FAHRZEUGSCHEIN
 *   fahrzeugdaten   JSON  → { hersteller, modell, motor, … }  N8N_WEBHOOK_FAHRZEUGDATEN
 *   beleg           Foto  → { haendler, datum, betrag, … }    N8N_WEBHOOK_BELEG
 *
 * Die beiden KI-Abfragen (fahrzeugschein, beleg) brauchen pro Anfrage eine PIN-Freigabe:
 * Die PIN steht nur in der Umgebungsvariable KI_PIN und kommt im Header `x-freigabe-pin`.
 * Ohne gültige PIN wird der Webhook nicht aufgerufen.
 *
 * Fotos werden hier nur durchgereicht und nirgends gespeichert. Ohne Webhook antwortet die
 * Route mit Beispielwerten (`demo: true`) und liest das Foto gar nicht erst aus.
 */
const WEBHOOKS: Record<string, string | undefined> = {
  fahrzeugschein: process.env.N8N_WEBHOOK_FAHRZEUGSCHEIN,
  fahrzeugdaten: process.env.N8N_WEBHOOK_FAHRZEUGDATEN,
  beleg: process.env.N8N_WEBHOOK_BELEG,
};

const MAX_FOTO = 8 * 1024 * 1024;
const warte = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: Request, { params }: { params: Promise<{ art: string }> }) {
  const { art } = await params;
  if (!(art in WEBHOOKS)) return NextResponse.json({ ok: false, fehler: "Unbekannte Analyse." }, { status: 404 });
  const webhook = WEBHOOKS[art];

  try {
    if (art === "fahrzeugdaten") {
      const { hsn, tsn } = (await request.json()) as { hsn?: string; tsn?: string };
      const h = String(hsn ?? "").trim();
      const t = String(tsn ?? "").trim().toUpperCase();
      if (!/^\d{4}$/.test(h) || !/^[A-Z0-9]{3}$/.test(t)) {
        return NextResponse.json<Fahrzeugdaten>({ gefunden: false }, { status: 422 });
      }
      if (webhook) {
        const res = await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hsn: h, tsn: t }) });
        if (!res.ok) throw new Error("n8n");
        const daten = (await res.json()) as Fahrzeugdaten;
        return NextResponse.json<Fahrzeugdaten>({ ...daten, hsn: h, tsn: t, gefunden: Boolean(daten.gefunden ?? daten.hersteller) });
      }
      await warte(600);
      const treffer = h === "0000" ? undefined : KBA_BEISPIELE[`${h}/${t}`];
      return NextResponse.json<Fahrzeugdaten>(treffer ? { gefunden: true, hsn: h, tsn: t, ...treffer, demo: true } : { gefunden: false, hsn: h, tsn: t, demo: true });
    }

    // Foto-Analysen = KI-Abfragen: erst die PIN prüfen, dann erst Foto lesen und Webhook rufen.
    if (webhook || pinEingerichtet()) {
      const freigabe = pruefeFreigabe(request);
      if (!freigabe.ok) return NextResponse.json({ ok: false, fehler: freigabe.fehler, pinNoetig: freigabe.pinNoetig }, { status: freigabe.status });
    }
    if (!webhook) {
      await warte(1400);
      if (art === "fahrzeugschein") return NextResponse.json<ScheinAnalyse>({ ok: true, ...BEISPIEL_SCHEIN, demo: true });
      return NextResponse.json<BelegAnalyse>({ ok: true, ...BEISPIEL_BELEG, datum: new Date().toISOString().slice(0, 10), demo: true });
    }
    const form = await request.formData();
    const foto = form.get("foto");
    if (!(foto instanceof File) || !foto.type.startsWith("image/") || foto.size > MAX_FOTO) {
      return NextResponse.json({ ok: false, fehler: "Bitte ein Foto bis 8 MB hochladen." }, { status: 422 });
    }
    const weiter = new FormData();
    weiter.append("foto", foto, "foto");
    weiter.append("art", art);
    const res = await fetch(webhook, { method: "POST", body: weiter });
    if (!res.ok) throw new Error("n8n");
    return NextResponse.json({ ok: true, ...(await res.json()) });
  } catch {
    return NextResponse.json({ ok: false, fehler: "Die Analyse hat gerade nicht geklappt. Trag die Daten bitte von Hand ein." }, { status: 502 });
  }
}
