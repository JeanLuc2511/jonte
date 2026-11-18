"use client";

import { useState } from "react";
import { anfragenAlsCsv } from "@/lib/camp/auswertung";
import { anfrageStatusSetzen } from "@/lib/services/cockpit";
import type { AnfrageStatus } from "@/lib/types";
import { CKopf, Reiter, useCockpit, vorMin } from "./Teile";

const STATUS: [AnfrageStatus, string][] = [["neu", "Neu"], ["kontaktiert", "Kontaktiert"], ["erledigt", "Erledigt"]];
type Filter = "alle" | AnfrageStatus;

export function Anfragen() {
  const c = useCockpit();
  const [art, setArt] = useState<"warteliste" | "kontakt">("warteliste");
  const [filter, setFilter] = useState<Filter>("alle");
  if (!c) return null;
  const { anfragen } = c.camp;
  const neu = (a: "warteliste" | "kontakt") => anfragen.filter((x) => x.art === a && x.status === "neu").length;
  const liste = anfragen.filter((a) => a.art === art && (filter === "alle" || a.status === filter));

  function exportieren() {
    const url = URL.createObjectURL(new Blob([anfragenAlsCsv(c!.camp)], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `camp-camper-anfragen-${c!.heute}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <CKopf titel="Warteliste & Anfragen" aktion={<button type="button" className="btn btn-outline" onClick={exportieren}>Als Tabelle exportieren</button>}>
        <p>Alles aus der Warteliste und dem Kontaktformular. {anfragen.filter((a) => a.art === "warteliste").length} Leute stehen auf der Warteliste.</p>
      </CKopf>
      <Reiter label="Art" aktiv={art} onWahl={setArt} werte={[["warteliste", "Warteliste", neu("warteliste")], ["kontakt", "Kontakt", neu("kontakt")]]} />
      <Reiter label="Status" aktiv={filter} onWahl={setFilter} werte={[["alle", "Alle"], ...STATUS]} />
      {liste.length === 0 && <p className="text-muted">Keine Einträge mit diesem Status.</p>}
      <ul className="space-y-3">
        {liste.map((a) => (
          <li key={a.id} className={`karte p-4 ${a.status === "neu" ? "!border-line-strong" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="label text-muted">{vorMin(a.zeit)}</p>
                <h2 className="heading-s mt-1">{a.name || "Ohne Namen"}</h2>
                <p className="text-[15px]">
                  <a href={`mailto:${a.email}`} className="text-accent underline underline-offset-4">{a.email}</a>
                  {a.telefon && <> · <a href={`tel:${a.telefon.replace(/\s/g, "")}`} className="text-accent underline underline-offset-4">{a.telefon}</a></>}
                </p>
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label={`Status für ${a.name}`}>
                {STATUS.map(([id, name]) => (
                  <button key={id} type="button" className="chip" aria-pressed={a.status === id} onClick={() => anfrageStatusSetzen(a.id, id)}>{name}</button>
                ))}
              </div>
            </div>
            <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-[15px] sm:grid-cols-2">
              {Object.entries(a.angaben).map(([k, v]) => (
                <div key={k} className={v.length > 60 ? "sm:col-span-2" : ""}><dt className="label text-muted">{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
