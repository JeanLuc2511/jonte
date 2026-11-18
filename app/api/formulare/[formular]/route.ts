import { NextResponse } from "next/server";
import type { FormularAntwort } from "@/lib/types";

/** Pro Formular eine Umgebungsvariable mit der n8n-Webhook-URL. */
const WEBHOOKS: Record<string, string | undefined> = {
  warteliste: process.env.N8N_WEBHOOK_WARTELISTE,
  kontakt: process.env.N8N_WEBHOOK_KONTAKT,
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ formular: string }> },
) {
  const { formular } = await params;
  if (!(formular in WEBHOOKS)) {
    return NextResponse.json<FormularAntwort>({ ok: false, fehler: "Unbekanntes Formular." }, { status: 404 });
  }

  let daten: Record<string, unknown>;
  try {
    daten = await request.json();
  } catch {
    return NextResponse.json<FormularAntwort>({ ok: false, fehler: "Ungültige Daten." }, { status: 400 });
  }

  const email = typeof daten.email === "string" ? daten.email : "";
  if (!/^\S+@\S+\.\S+$/.test(email) || daten.einwilligung !== true) {
    return NextResponse.json<FormularAntwort>(
      { ok: false, fehler: "E-Mail-Adresse und Einwilligung werden gebraucht." },
      { status: 422 },
    );
  }

  const webhook = WEBHOOKS[formular];
  if (!webhook) {
    // Demo-Modus: noch kein n8n-Webhook hinterlegt, es wird nichts gespeichert.
    return NextResponse.json<FormularAntwort>({ ok: true, demo: true });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formular,
        quelleSeite: "website",
        gesendetAm: new Date().toISOString(),
        ...daten,
      }),
    });
    if (!res.ok) throw new Error(`n8n antwortet mit ${res.status}`);
    return NextResponse.json<FormularAntwort>({ ok: true });
  } catch {
    return NextResponse.json<FormularAntwort>(
      { ok: false, fehler: "Das hat gerade nicht geklappt. Versuch es bitte gleich noch einmal." },
      { status: 502 },
    );
  }
}
