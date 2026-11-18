import { NextResponse } from "next/server";
import { pinEingerichtet } from "@/lib/server/freigabe";

export const dynamic = "force-dynamic";

/** Sagt dem Browser nur, ob für KI-Abfragen eine PIN verlangt wird – nie die PIN selbst. */
export function GET() {
  const kiAktiv = Boolean(process.env.N8N_WEBHOOK_FAHRZEUGSCHEIN || process.env.N8N_WEBHOOK_BELEG);
  return NextResponse.json({ pinNoetig: pinEingerichtet() || kiAktiv });
}
