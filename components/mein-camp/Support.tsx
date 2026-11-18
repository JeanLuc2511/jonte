"use client";

import { usePhasen } from "@/lib/camp/store";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ZEITFENSTER } from "@/lib/daten/leistungen";
import { formatLang, isoHeute, plusTage } from "@/lib/datum";
import { useKonto } from "@/lib/mein-camp/store";
import { verkleinere } from "@/lib/services/analyse";
import { hilferuf, istGrenzthema, laufendeBuchung, supportSenden, videoterminBuchen } from "@/lib/services/mitglieder";
import { IconKamera, IconVideo } from "../Icons";
import { VanSeite } from "../Van";
import { BereichKopf, Feldgruppe, NurMit } from "./Teile";

const uhr = (iso: string) => new Date(iso).toLocaleString("de-DE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function Support() {
  return (
    <>
      <BereichKopf eyebrow="Support von Seb" titel="Frag den, der’s schon gebaut hat">
        <p>Dein direkter Draht zu Seb. Er sieht dein Fahrzeug, deine Phase und deine Bilder – du musst nichts erklären.</p>
      </BereichKopf>
      <NurMit recht="support" titel="Seb schaut mit drauf" text="Projekt-Chat mit Fotos, der „Ich komm nicht weiter“-Knopf in der Halle und Video-Termine. Ohne Zeitbegrenzung.">
        <Chat />
      </NurMit>
    </>
  );
}

function Chat() {
  const PHASEN = usePhasen();
  const z = useKonto();
  const [text, setText] = useState("");
  const [foto, setFoto] = useState<string | undefined>();
  const [tag, setTag] = useState(() => plusTage(isoHeute(), 2));
  const [zeit, setZeit] = useState(ZEITFENSTER[2]);
  const datei = useRef<HTMLInputElement>(null);
  const liste = useRef<HTMLOListElement>(null);
  const anzahl = z?.support.length ?? 0;

  useEffect(() => {
    if (liste.current) liste.current.scrollTop = liste.current.scrollHeight;
  }, [anzahl]);

  if (!z) return null;
  const heute = isoHeute();
  const fahrzeug = z.fahrzeuge.find((f) => f.id === z.aktivesFahrzeugId);
  const projekt = z.projekte.find((p) => p.fahrzeugId === z.aktivesFahrzeugId);
  const laeuft = laufendeBuchung(z, heute);
  const bilder = projekt?.tagebuch.reduce((s, t) => s + t.fotos.length, 0) ?? 0;
  const warnt = istGrenzthema(text);

  function senden() {
    if (!text.trim() && !foto) return;
    supportSenden(text.trim() || "Foto", foto);
    setText(""); setFoto(undefined);
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
      {/* Chat */}
      <section className="karte flex flex-col" aria-label="Projekt-Chat">
        <ol ref={liste} className="flex max-h-[560px] min-h-[320px] flex-col gap-3 overflow-y-auto p-4 lg:p-5" aria-live="polite">
          {z.support.length === 0 && <li className="m-auto max-w-xs text-center text-muted">Noch keine Nachricht. Schreib Seb, woran du gerade hängst.</li>}
          {z.support.map((n) => {
            if (n.von === "system") {
              return (
                <li key={n.id} className={`mx-auto max-w-md border px-4 py-2 text-center text-[15px] ${n.art === "grenze" ? "border-line-strong text-display" : "border-line text-muted"}`}>
                  {n.text}
                  {n.art === "grenze" && <Link href="/buchen?leistung=beratung" className="mt-1 block font-semibold underline underline-offset-4">Beratung vor Ort buchen</Link>}
                </li>
              );
            }
            const ich = n.von === "mitglied";
            return (
              <li key={n.id} className={`max-w-[85%] ${ich ? "self-end" : "self-start"}`}>
                <div className={`px-4 py-3 ${ich ? "bg-gelb text-pflaume" : "bg-surface-strong"}`}>
                  {n.foto && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.foto} alt="Foto zur Nachricht" className="mb-2 max-h-56 w-full object-cover" />
                  )}
                  <p className="whitespace-pre-line">{n.text}</p>
                </div>
                <p className={`mt-1 text-[12px] text-muted ${ich ? "text-right" : ""}`}>{ich ? "Du" : "Seb"} · {uhr(n.zeit)}</p>
              </li>
            );
          })}
        </ol>
        <form className="border-t border-line p-3 lg:p-4" onSubmit={(e) => { e.preventDefault(); senden(); }}>
          {warnt && (
            <p className="mb-3 border border-line-strong p-3 text-[15px] text-display" role="status">
              Gas und 230 V klären wir nicht aus der Ferne. Dafür gibt es die Beratung vor Ort – da schauen wir gemeinsam auf dein Fahrzeug.
            </p>
          )}
          {foto && (
            <div className="mb-3 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto} alt="Angehängtes Foto" className="h-16 w-20 object-cover" />
              <button type="button" className="btn btn-ghost !min-h-0 !py-2 text-[14px]" onClick={() => setFoto(undefined)}>Foto entfernen</button>
            </div>
          )}
          <div className="flex gap-2">
            <button type="button" className="flex h-12 w-12 shrink-0 items-center justify-center border border-line hover:bg-surface-strong" aria-label="Foto anhängen" onClick={() => datei.current?.click()}><IconKamera /></button>
            <input ref={datei} type="file" accept="image/*" className="sr-only" aria-label="Foto auswählen" onChange={async (e) => { const d = e.target.files?.[0]; if (d) setFoto(await verkleinere(d, 640).catch(() => undefined)); e.target.value = ""; }} />
            <label className="flex-1"><span className="sr-only">Nachricht an Seb</span>
              <input className="feld" placeholder="Woran hängst du gerade?" value={text} onChange={(e) => setText(e.target.value)} />
            </label>
            <button type="submit" className="btn btn-primary btn-klein shrink-0" disabled={!text.trim() && !foto}>Senden</button>
          </div>
        </form>
      </section>

      <div className="space-y-5">
        {/* Kontext */}
        <section className="karte p-5">
          <p className="label text-muted">Das sieht Seb zu deiner Frage</p>
          {fahrzeug ? (
            <div className="mt-3 flex items-center gap-4">
              <VanSeite farbe={fahrzeug.farbe} className="w-24 shrink-0" />
              <p className="text-[15px]"><strong className="block font-semibold">{fahrzeug.spitzname} · {fahrzeug.modell}</strong>
                <span className="text-muted">Phase {PHASEN.find((p) => p.id === projekt?.aktivePhase)?.name ?? "–"} · {bilder} Bilder im Bautagebuch</span></p>
            </div>
          ) : <p className="mt-2 text-muted">Leg ein Fahrzeug an, dann hat Seb den Kontext sofort.</p>}
        </section>

        {/* Hilferuf */}
        <section className={laeuft ? "buehne p-5" : "karte p-5"}>
          <h2 className="heading-s">Ich komm nicht weiter</h2>
          {laeuft ? (
            <>
              <p className="mt-2 text-muted">Du bist gerade in {laeuft.titel}. Ein Klick, und Seb weiß, wo er gebraucht wird.</p>
              {z.support.some((n) => n.art === "hilferuf" && n.erledigt === false)
                ? <p className="mt-4 border border-line-strong p-3 font-semibold" role="status">Dein Hilferuf ist bei Seb. Er meldet sich gleich.</p>
                : <button type="button" className="btn btn-primary mt-4 w-full" onClick={hilferuf}>Seb in die Bucht rufen</button>}
            </>
          ) : (
            <p className="mt-2 text-muted">Der Knopf ist aktiv, solange du eine Werkstattbucht gebucht hast und in der Halle bist.</p>
          )}
        </section>

        {/* Video-Termin */}
        <form className="karte p-5" onSubmit={(e) => { e.preventDefault(); videoterminBuchen(formatLang(tag), zeit); }}>
          <h2 className="heading-s flex items-center gap-2"><IconVideo width={22} height={22} /> Video-Termin</h2>
          <p className="mt-2 text-[15px] text-muted">20 Minuten mit Seb, du zeigst mit dem Handy, wo es klemmt.</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Feldgruppe label="Tag"><input type="date" className="feld" min={heute} value={tag} onChange={(e) => e.target.value && setTag(e.target.value)} /></Feldgruppe>
            <Feldgruppe label="Uhrzeit">
              <select className="feld" value={zeit} onChange={(e) => setZeit(e.target.value)}>{ZEITFENSTER.map((x) => <option key={x} value={x}>{x} Uhr</option>)}</select>
            </Feldgruppe>
          </div>
          <button type="submit" className="btn btn-outline mt-4 w-full">Termin anfragen</button>
        </form>

        <p className="border border-line p-4 text-[15px] text-muted">
          <strong className="font-semibold text-ink">Klare Grenze:</strong> Gas und 230 V klären wir nicht im Chat. Dafür buchst du eine Beratung oder einen Platz vor Ort.
        </p>
      </div>
    </div>
  );
}
