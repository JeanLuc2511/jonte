/** Kleine Datums-Helfer. Alle Daten laufen als ISO-String (YYYY-MM-DD) durch die App. */

export function isoHeute(): string {
  const d = new Date();
  return toIso(d);
}

export function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const t = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${t}`;
}

export function vonIso(iso: string): Date {
  const [y, m, t] = iso.split("-").map(Number);
  return new Date(y, m - 1, t, 12);
}

export function plusTage(iso: string, tage: number): string {
  const d = vonIso(iso);
  d.setDate(d.getDate() + tage);
  return toIso(d);
}

/** Anzahl Tage inklusive Start- und Endtag */
export function tageInklusive(von: string, bis: string): number {
  const ms = vonIso(bis).getTime() - vonIso(von).getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

export function ueberschneidet(aVon: string, aBis: string, bVon: string, bBis: string): boolean {
  return aVon <= bBis && bVon <= aBis;
}

const kurz = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "short" });
const lang = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "numeric",
  month: "long",
});
const wochentag = new Intl.DateTimeFormat("de-DE", { weekday: "short" });
const monat = new Intl.DateTimeFormat("de-DE", { month: "short" });

export const formatKurz = (iso: string) => kurz.format(vonIso(iso));
export const formatLang = (iso: string) => lang.format(vonIso(iso));
export const formatWochentag = (iso: string) => wochentag.format(vonIso(iso)).replace(".", "");
export const formatMonat = (iso: string) => monat.format(vonIso(iso)).replace(".", "");
export const tagDesMonats = (iso: string) => vonIso(iso).getDate();

export function formatZeitraum(von: string, bis: string): string {
  return von === bis ? formatLang(von) : `${formatKurz(von)} – ${formatKurz(bis)}`;
}

/** Nächster Wochentag (0 = So … 6 = Sa) ab einschließlich `iso` */
export function naechster(iso: string, wochentagNr: number): string {
  const d = vonIso(iso);
  const diff = (wochentagNr - d.getDay() + 7) % 7;
  return plusTage(iso, diff);
}

export const euro = (betrag: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(betrag) ? 0 : 2,
  }).format(betrag);
