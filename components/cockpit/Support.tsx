"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { dauerText, letzteNachricht, offeneHilferufe, supportKennzahlen, unbeantwortet, videotermine } from "@/lib/camp/auswertung";
import { usePhasen } from "@/lib/camp/store";
import { autoAntwortSetzen, hilferufErledigen, supportAntworten } from "@/lib/services/cockpit";
import type { SupportFall } from "@/lib/types";
import { IconPfeil } from "../Icons";
import { Foto } from "../mein-camp/Teile";
import { VanSeite } from "../Van";
import { CKopf, FotoKnopf, Kachel, useCockpit, vorMin } from "./Teile";

const uhr = (iso: string) => new Date(iso).toLocaleString("de-DE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function Support() {
  // useSearchParams braucht eine Suspense-Grenze, damit die Seite statisch bleiben kann.
  return <Suspense fallback={null}><Postfach /></Suspense>;
}

function Postfach() {
  const c = useCockpit();
  const phasen = usePhasen();
  const router = useRouter();
  const gewaehlt = useSearchParams().get("mitglied");
  const [text, setText] = useState("");
  const [foto, setFoto] = useState<string | undefined>();
  const liste = useRef<HTMLOListElement>(null);
  const fall = c?.faelle.find((f) => f.mitgliedId === gewaehlt);
  const anzahl = fall?.nachrichten.length ?? 0;

  useEffect(() => {
    if (liste.current) liste.current.scrollTop = liste.current.scrollHeight;
  }, [anzahl, gewaehlt]);

  if (!c) return null;
  const { camp, akten, faelle } = c;
  const akte = (id: string) => akten.find((a) => a.mitglied.id === id);
  const rufe = offeneHilferufe(faelle);
  const hatRuf = (f: SupportFall) => rufe.some((r) => r.mitgliedId === f.mitgliedId);
  const rang = (f: SupportFall) => (hatRuf(f) ? 0 : unbeantwortet(f) ? 1 : 2);
  const sortiert = [...faelle].sort((a, b) => rang(a) - rang(b) || letzteNachricht(b).zeit.localeCompare(letzteNachricht(a).zeit));
  const zahlen = supportKennzahlen(faelle);
  const termine = videotermine(faelle);
  const waehle = (id: string | null) => router.replace(id ? `/cockpit/support?mitglied=${id}` : "/cockpit/support", { scroll: false });
  const a = fall ? akte(fall.mitgliedId) : undefined;
  const offenerRuf = fall ? rufe.find((r) => r.mitgliedId === fall.mitgliedId) : undefined;

  function senden() {
    if (!fall || (!text.trim() && !foto)) return;
    supportAntworten(fall.mitgliedId, text.trim() || "Foto", foto);
    setText(""); setFoto(undefined);
  }

  return (
    <>
      <div className={fall ? "max-lg:hidden" : ""}>
        <CKopf titel="Support-Postfach"><p>Alle Projekt-Chats an einem Ort. Hilferufe aus der Halle stehen immer oben.</p></CKopf>
        <div className="mb-5 grid grid-cols-3 gap-3">
          <Kachel label="Hilferufe" wert={rufe.length} />
          <Kachel label="Warten auf dich" wert={zahlen.wartend} />
          <Kachel label="Antwortzeit" wert={dauerText(zahlen.mittlereAntwortzeitMin)} hinweis={<span className="max-sm:hidden">im Schnitt, wird im Hintergrund gemessen</span>} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
        {/* Liste der Chats */}
        <div className={fall ? "max-lg:hidden" : ""}>
          <ul className="karte divide-y divide-line">
            {sortiert.map((f) => {
              const m = akte(f.mitgliedId);
              const letzte = letzteNachricht(f);
              const ruf = hatRuf(f);
              return (
                <li key={f.mitgliedId}>
                  <button type="button" onClick={() => waehle(f.mitgliedId)} aria-current={gewaehlt === f.mitgliedId} className={`flex min-h-[72px] w-full items-center gap-3 p-3 text-left hover:bg-surface-strong ${gewaehlt === f.mitgliedId ? "bg-surface-strong" : ""} ${ruf ? "!bg-gelb !text-pflaume" : ""}`}>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-semibold">{m?.mitglied.vorname} {m?.mitglied.nachname}</span>
                        {ruf ? <span className="label shrink-0">Hilferuf</span> : unbeantwortet(f) ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gelb" aria-label="wartet auf Antwort" /> : null}
                      </span>
                      <span className={`block truncate text-[14px] ${ruf ? "" : "text-muted"}`}>{letzte.von === "seb" ? "Du: " : ""}{letzte.text}</span>
                      <span className={`block text-[12px] ${ruf ? "" : "text-muted"}`}>{m?.fahrzeuge[0]?.spitzname} · {vorMin(letzte.zeit)}</span>
                    </span>
                    <IconPfeil width={18} height={18} className="shrink-0 opacity-60" />
                  </button>
                </li>
              );
            })}
          </ul>

          <section className="karte mt-5 p-4">
            <h2 className="heading-s">Video-Termine</h2>
            {termine.length === 0 && <p className="mt-2 text-muted">Keine angefragt.</p>}
            <ul className="mt-2 divide-y divide-line">
              {termine.map(({ mitgliedId, nachricht }) => (
                <li key={nachricht.id} className="py-2 text-[15px]"><strong className="font-semibold">{akte(mitgliedId)?.mitglied.vorname}:</strong> {nachricht.text.replace("Video-Termin angefragt: ", "").replace(" Seb bestätigt dir den Termin.", "")}</li>
              ))}
            </ul>
          </section>

          <label className="mt-5 flex gap-3 border border-dashed border-line p-4 text-[15px] text-muted">
            <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[#FDE58B]" checked={camp.autoAntwort} onChange={(e) => autoAntwortSetzen(e.target.checked)} />
            <span><strong className="font-semibold text-ink">Demo: Seb antwortet im Mitglieder-Chat automatisch.</strong> Schalt das aus, wenn du die Antworten selbst von hier schreiben willst.</span>
          </label>
        </div>

        {/* Verlauf */}
        {fall && a ? (
          <section className="min-w-0" aria-label={`Chat mit ${a.mitglied.vorname}`}>
            <button type="button" className="btn btn-ghost lg:hidden" onClick={() => waehle(null)}>← Alle Chats</button>
            <div className="karte flex items-center gap-3 p-3">
              {a.fahrzeuge[0] && <VanSeite farbe={a.fahrzeuge[0].farbe} className="w-20 shrink-0" />}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{a.mitglied.vorname} {a.mitglied.nachname}</p>
                <p className="truncate text-[14px] text-muted">{a.fahrzeuge[0] ? `${a.fahrzeuge[0].spitzname} · ${a.fahrzeuge[0].modell}` : "Kein Fahrzeug"}{a.projekt ? ` · Phase ${phasen.find((p) => p.id === a.projekt!.phase)?.name}` : ""}</p>
              </div>
              <Link href={`/cockpit/mitglieder?id=${a.mitglied.id}`} className="btn btn-ghost btn-klein shrink-0 max-sm:hidden">Akte</Link>
            </div>
            {a.projekt && a.projekt.fotos.length > 0 && (
              <ul className="mt-2 grid grid-cols-4 gap-2" aria-label="Letzte Fotos aus dem Bautagebuch">
                {a.projekt.fotos.slice(0, 4).map((f, i) => <li key={i}><Foto quelle={f} /></li>)}
              </ul>
            )}

            {offenerRuf && (
              <div className="buehne mt-3 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" role="alert">
                <p className="font-semibold">Hilferuf aus {camp.zonen.find((z) => z.id === offenerRuf.nachricht.buchtId)?.name ?? "der Halle"} · {vorMin(offenerRuf.nachricht.zeit)}</p>
                <button type="button" className="btn btn-primary" onClick={() => hilferufErledigen(fall.mitgliedId, offenerRuf.nachricht.id)}>Ich komme</button>
              </div>
            )}

            <div className="karte mt-3 flex flex-col">
              <ol ref={liste} className="flex max-h-[52dvh] min-h-[240px] flex-col gap-3 overflow-y-auto p-3 lg:max-h-[480px] lg:p-5" aria-live="polite">
                {fall.nachrichten.map((n) => {
                  if (n.von === "system") return <li key={n.id} className={`mx-auto max-w-md border px-4 py-2 text-center text-[15px] ${n.art === "hilferuf" && n.erledigt === false ? "border-line-strong text-display" : "border-line text-muted"}`}>{n.text}</li>;
                  const ich = n.von === "seb";
                  return (
                    <li key={n.id} className={`max-w-[88%] ${ich ? "self-end" : "self-start"}`}>
                      <div className={`px-4 py-3 ${ich ? "bg-gelb text-pflaume" : "bg-surface-strong"}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {n.foto && <img src={n.foto} alt="Foto zur Nachricht" className="mb-2 max-h-56 w-full object-cover" />}
                        <p className="whitespace-pre-line">{n.text}</p>
                      </div>
                      <p className={`mt-1 text-[12px] text-muted ${ich ? "text-right" : ""}`}>{ich ? "Du" : a.mitglied.vorname} · {uhr(n.zeit)}</p>
                    </li>
                  );
                })}
              </ol>
              <form className="border-t border-line p-3" onSubmit={(e) => { e.preventDefault(); senden(); }}>
                {foto && (
                  <div className="mb-3 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={foto} alt="Angehängtes Foto" className="h-16 w-20 object-cover" />
                    <button type="button" className="btn btn-ghost !min-h-0 !py-2 text-[14px]" onClick={() => setFoto(undefined)}>Foto entfernen</button>
                  </div>
                )}
                <label className="block"><span className="sr-only">Antwort an {a.mitglied.vorname}</span>
                  <textarea className="feld" rows={2} placeholder={`Antwort an ${a.mitglied.vorname} …`} value={text} onChange={(e) => setText(e.target.value)} />
                </label>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <FotoKnopf onFoto={(q) => setFoto(q)}>Foto</FotoKnopf>
                  <button type="submit" className="btn btn-primary" disabled={!text.trim() && !foto}>Antworten</button>
                </div>
              </form>
            </div>
            <p className="mt-3 text-[14px] text-muted">Gas und 230 V nicht aus der Ferne klären – dafür Beratung oder Platz vor Ort anbieten.</p>
          </section>
        ) : (
          <div className="karte flex min-h-60 items-center justify-center p-8 text-center text-muted max-lg:hidden">Wähl links einen Chat aus.</div>
        )}
      </div>
    </>
  );
}
