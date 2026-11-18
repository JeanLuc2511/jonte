import { NextResponse } from "next/server";

/**
 * Nimmt Ereignisse aus dem Mitgliederbereich an und leitet sie an n8n weiter.
 * Je Themengruppe lässt sich ein eigener Webhook setzen; sonst greift N8N_WEBHOOK_EREIGNISSE.
 */
const GRUPPEN: Record<string, string | undefined> = {
  event: process.env.N8N_WEBHOOK_EVENTS,
  support: process.env.N8N_WEBHOOK_SUPPORT,
  werkzeug: process.env.N8N_WEBHOOK_WERKZEUG,
  abo: process.env.N8N_WEBHOOK_ABO,
};

const TYP = /^(konto|abo|fahrzeug|projekt|buchung|support|event|hilfe|werkzeug)\.[a-z]+$/;

export async function POST(request: Request) {
  let ereignis: { typ?: unknown };
  try {
    ereignis = await request.json();
  } catch {
    return NextResponse.json({ ok: false, fehler: "Ungültige Daten." }, { status: 400 });
  }
  if (typeof ereignis.typ !== "string" || !TYP.test(ereignis.typ)) {
    return NextResponse.json({ ok: false, fehler: "Unbekannter Ereignistyp." }, { status: 422 });
  }

  const webhook = GRUPPEN[ereignis.typ.split(".")[0]] || process.env.N8N_WEBHOOK_EREIGNISSE;
  if (!webhook) return NextResponse.json({ ok: true, demo: true });

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quelleSeite: "website", ...ereignis }),
    });
    return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : 502 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
