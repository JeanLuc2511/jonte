"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { unbeantwortet } from "@/lib/camp/auswertung";
import { usePhasen } from "@/lib/camp/store";
import { euro, formatKurz, formatLang } from "@/lib/datum";
import { ROLLEN_NAME } from "@/lib/rechte";
import { aboVonHand, notizSpeichern } from "@/lib/services/cockpit";
import type { MitgliedAkte } from "@/lib/types";
import { Foto } from "../mein-camp/Teile";
import { VanSeite } from "../Van";
import { ABO_NAME, CKopf, Reiter, Textfeld, useCockpit, useGespeichert } from "./Teile";

type Filter = "alle" | "aktiv" | "pausiert" | "gekuendigt" | "konto";
const stufe = (a: MitgliedAkte): Exclude<Filter, "alle"> => (a.mitglied.rolle === "mitglied" && a.mitglied.abo.status !== "keins" ? a.mitglied.abo.status : "konto");

export function Mitglieder() {
  return <Suspense fallback={null}><Liste /></Suspense>;
}

function Liste() {
  const c = useCockpit();
  const router = useRouter();
  const id = useSearchParams().get("id");
  const [filter, setFilter] = useState<Filter>("alle");
  if (!c) return null;
  const akte = c.akten.find((a) => a.mitglied.id === id);
  if (akte) return <Akte key={akte.mitglied.id} a={akte} onZurueck={() => router.replace("/cockpit/mitglieder", { scroll: false })} />;

  const zaehle = (f: Filter) => c.akten.filter((a) => f === "alle" || stufe(a) === f).length;
  const liste = c.akten.filter((a) => filter === "alle" || stufe(a) === filter);
  return (
    <>
      <CKopf titel="Mitglieder & Abos"><p>Alle Konten mit Stufe, Abo-Status und letzter Buchung.</p></CKopf>
      <Reiter label="Filter" aktiv={filter} onWahl={setFilter} werte={[["alle", `Alle (${zaehle("alle")})`], ["aktiv", `Abo aktiv (${zaehle("aktiv")})`], ["pausiert", `Pausiert (${zaehle("pausiert")})`], ["gekuendigt", `Gekündigt (${zaehle("gekuendigt")})`], ["konto", `Kostenlos (${zaehle("konto")})`]]} />
      <ul className="karte divide-y divide-line">
        {liste.map((a) => (
          <li key={a.mitglied.id}>
            <Link href={`/cockpit/mitglieder?id=${a.mitglied.id}`} scroll={false} className="grid min-h-16 grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 p-3 hover:bg-surface-strong md:grid-cols-[1.4fr_1fr_1.2fr_1fr]">
              <span className="min-w-0">
                <span className="block truncate font-semibold">{a.mitglied.vorname} {a.mitglied.nachname}</span>
                <span className="block truncate text-[14px] text-muted">{a.mitglied.email}</span>
              </span>
              <span className={`badge justify-self-end md:justify-self-start ${stufe(a) === "aktiv" ? "badge-live" : stufe(a) === "konto" ? "badge-leise" : ""}`}>{ABO_NAME[stufe(a) === "konto" ? "keins" : stufe(a)]}</span>
              <span className="truncate text-[15px] text-muted max-md:col-span-2">{a.fahrzeuge.map((f) => f.spitzname).join(", ") || "kein Fahrzeug"}{a.projekt ? ` · ${a.projekt.eintraege} Einträge` : ""}</span>
              <span className="text-[15px] text-muted max-md:hidden">{a.letzteBuchung ? `Letzte Buchung ${formatKurz(a.letzteBuchung)}` : "noch keine Buchung"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function Akte({ a, onZurueck }: { a: MitgliedAkte; onZurueck: () => void }) {
  const c = useCockpit();
  const phasen = usePhasen();
  const [notiz, setNotiz] = useState<string | null>(null);
  const [ok, markiere] = useGespeichert();
  if (!c) return null;
  const { camp, faelle } = c;
  const m = a.mitglied;
  const buchungen = camp.buchungen.filter((b) => b.mitgliedId === m.id).sort((x, y) => y.von.localeCompare(x.von));
  const fall = faelle.find((f) => f.mitgliedId === m.id);
  const text = notiz ?? camp.notizen[m.id] ?? "";
  const s = stufe(a);
  return (
    <>
      <button type="button" className="btn btn-ghost" onClick={onZurueck}>← Alle Mitglieder</button>
      <CKopf titel={`${m.vorname} ${m.nachname}`}>
        <p>{ROLLEN_NAME[m.rolle]} · dabei seit {formatLang(m.dabeiSeit)} · {m.email}{m.telefon ? ` · ${m.telefon}` : ""}</p>
      </CKopf>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Abo */}
        <section className="buehne p-5">
          <span className={`badge ${s === "aktiv" ? "badge-live" : ""}`}>{ABO_NAME[s === "konto" ? "keins" : s]}</span>
          <p className="mt-3 text-lg">
            {s === "aktiv" && <>{euro(m.abo.preisProMonat)} im Monat · nächste Abbuchung {m.abo.naechsteAbbuchung ? formatLang(m.abo.naechsteAbbuchung) : "–"}</>}
            {s === "pausiert" && <>Pausiert bis {m.abo.pausiertBis ? formatLang(m.abo.pausiertBis) : "–"}</>}
            {s === "gekuendigt" && <>Endet am {m.abo.endetAm ? formatLang(m.abo.endetAm) : "–"}. Das kostenlose Konto bleibt.</>}
            {s === "konto" && <>Kein Abo. Bucht mit Werkzeugpauschale.</>}
          </p>
          {s !== "konto" && (
            <div className="mt-4 flex flex-wrap gap-3">
              {s === "aktiv" && <button type="button" className="btn btn-outline" onClick={() => aboVonHand(m.id, "pausieren")}>Abo pausieren</button>}
              {s !== "aktiv" && <button type="button" className="btn btn-primary" onClick={() => aboVonHand(m.id, "fortsetzen")}>Abo fortsetzen</button>}
              {s !== "gekuendigt" && <button type="button" className="btn btn-outline" onClick={() => aboVonHand(m.id, "beenden")}>Abo beenden</button>}
            </div>
          )}
          <p className="mt-3 text-[14px] text-muted">Für Änderungen auf Zuruf. Das Mitglied bekommt automatisch eine Nachricht.</p>
        </section>

        {/* Notizen */}
        <form className="karte p-5" onSubmit={(e) => { e.preventDefault(); notizSpeichern(m.id, text); setNotiz(null); markiere(); }}>
          <h2 className="heading-m">Interne Notizen</h2>
          <Textfeld label="Nur fürs Camp-Team sichtbar" wert={text} onChange={setNotiz} zeilen={4} className="mt-3" />
          <div className="mt-3 flex flex-wrap items-center gap-3"><button type="submit" className="btn btn-outline">Notiz speichern</button>{ok}</div>
        </form>

        {/* Fahrzeuge & Projekt */}
        <section className="karte p-5">
          <h2 className="heading-m">Fahrzeuge und Projekt</h2>
          <ul className="mt-3 divide-y divide-line">
            {a.fahrzeuge.map((f) => (
              <li key={f.spitzname} className="flex items-center gap-4 py-2"><VanSeite farbe={f.farbe} className="w-20 shrink-0" /><span><strong className="font-semibold">{f.spitzname}</strong><span className="block text-[15px] text-muted">{f.modell}</span></span></li>
            ))}
            {a.fahrzeuge.length === 0 && <li className="py-2 text-muted">Noch kein Fahrzeug angelegt.</li>}
          </ul>
          {a.projekt && (
            <div className="mt-3 border-t border-line pt-3">
              <p className="font-semibold">{a.projekt.titel}</p>
              <p className="text-[15px] text-muted">Phase {phasen.find((p) => p.id === a.projekt!.phase)?.name} · {a.projekt.eintraege} Einträge im Bautagebuch · {a.projekt.oeffentlich ? "öffentlich" : "privat"}</p>
              {a.projekt.fotos.length > 0 && <ul className="mt-3 grid grid-cols-4 gap-2">{a.projekt.fotos.map((f, i) => <li key={i}><Foto quelle={f} /></li>)}</ul>}
            </div>
          )}
        </section>

        {/* Buchungen & Support */}
        <section className="karte p-5">
          <h2 className="heading-m">Buchungen</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {buchungen.slice(0, 5).map((b) => (
              <li key={b.id} className="flex justify-between gap-3 py-2 text-[15px]">
                <span>{camp.zonen.find((z) => z.id === b.buchtId)?.name} · {formatKurz(b.von)} – {formatKurz(b.bis)}{b.status === "storniert" ? " · storniert" : ""}</span>
                <span className="shrink-0 font-semibold">{euro(b.summe)}</span>
              </li>
            ))}
            {buchungen.length === 0 && <li className="py-2 text-muted">Keine Werkstattbucht gebucht.</li>}
          </ul>
          <h2 className="heading-m mt-6">Support-Verlauf</h2>
          {fall ? (
            <>
              <ul className="mt-3 space-y-2 text-[15px]">
                {fall.nachrichten.slice(-3).map((n) => (
                  <li key={n.id} className="border border-line p-2"><span className="label text-muted">{n.von === "seb" ? "Du" : n.von === "system" ? "System" : m.vorname}</span><span className="block">{n.text}</span></li>
                ))}
              </ul>
              <Link href={`/cockpit/support?mitglied=${m.id}`} className="btn btn-outline btn-klein mt-3">{unbeantwortet(fall) ? "Antworten" : "Zum Chat"}</Link>
            </>
          ) : <p className="mt-2 text-muted">{s === "konto" ? "Support gibt es nur mit Abo." : "Noch keine Nachricht."}</p>}
        </section>
      </div>
    </>
  );
}
