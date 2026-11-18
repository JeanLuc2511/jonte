"use client";

import { useState } from "react";
import { wunschAuswertung } from "@/lib/camp/auswertung";
import { formatLang } from "@/lib/datum";
import { wunschStatusSetzen } from "@/lib/services/cockpit";
import type { WunschStatus } from "@/lib/types";
import { CKopf, Kachel, Reiter, useCockpit } from "./Teile";

const STATUS: [WunschStatus, string][] = [["neu", "Neu"], ["geprueft", "Geprüft"], ["gekauft", "Gekauft"], ["abgelehnt", "Abgelehnt"]];
type Filter = "offen" | WunschStatus;

export function Werkzeug() {
  const c = useCockpit();
  const [filter, setFilter] = useState<Filter>("offen");
  if (!c) return null;
  const alle = wunschAuswertung(c.camp, c.konto);
  const liste = alle.filter((g) => (filter === "offen" ? g.status === "neu" || g.status === "geprueft" : g.status === filter));
  const n = (s: WunschStatus) => alle.filter((g) => g.status === s).length;
  return (
    <>
      <CKopf titel="Werkzeugwünsche"><p>Was sich Mitglieder für die Halle wünschen: wie oft, von wem und warum. Die Wünsche sind nicht öffentlich.</p></CKopf>
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kachel label="Neu" wert={n("neu")} />
        <Kachel label="Geprüft" wert={n("geprueft")} />
        <Kachel label="Gekauft" wert={n("gekauft")} />
        <Kachel label="Wünsche gesamt" wert={alle.reduce((s, g) => s + g.anzahl, 0)} />
      </div>
      <Reiter label="Filter" aktiv={filter} onWahl={setFilter} werte={[["offen", "Offen"], ["gekauft", "Gekauft"], ["abgelehnt", "Abgelehnt"]]} />
      {liste.length === 0 && <p className="text-muted">Hier steht gerade nichts.</p>}
      <ul className="space-y-4">
        {liste.map((g) => (
          <li key={g.werkzeug} className="karte p-4 lg:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="heading-m flex items-baseline gap-3"><span className="font-display text-4xl text-display">{g.anzahl}×</span> {g.werkzeug}</h2>
              <span className={`badge ${g.status === "gekauft" ? "badge-live" : g.status === "abgelehnt" ? "badge-leise" : ""}`}>{STATUS.find((s) => s[0] === g.status)?.[1]}</span>
            </div>
            <ul className="mt-3 divide-y divide-line border-y border-line text-[15px]">
              {g.wuensche.map((w) => (
                <li key={w.id} className="py-2"><strong className="font-semibold">{w.mitgliedName}</strong> <span className="text-muted">· {formatLang(w.datum)}</span><span className="block text-muted">{w.begruendung}</span></li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={`Status für ${g.werkzeug}`}>
              {STATUS.map(([id, name]) => (
                <button key={id} type="button" className="chip" aria-pressed={g.status === id} onClick={() => wunschStatusSetzen(g.werkzeug, id)}>{name}</button>
              ))}
            </div>
            {g.status !== "gekauft" && <p className="mt-2 text-[14px] text-muted">„Gekauft“ schickt an alle {new Set(g.wuensche.map((w) => w.mitgliedId)).size} Wünschenden: „Dein Wunsch ist da!“</p>}
          </li>
        ))}
      </ul>
    </>
  );
}
