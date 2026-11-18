"use client";

import { useState } from "react";
import { formatLang } from "@/lib/datum";
import { useKonto } from "@/lib/mein-camp/store";
import { werkzeugGekauft } from "@/lib/services/cockpit";
import { werkzeugWuenschen } from "@/lib/services/mitglieder";
import { BereichKopf, DemoAktion, Feldgruppe, NurMit } from "./Teile";

export function Werkzeugwuensche() {
  return (
    <>
      <BereichKopf eyebrow="Werkzeugwünsche" titel="Was fehlt dir in der Halle?">
        <p>Sag Seb, welches Werkzeug dir die Arbeit leichter machen würde. Dein Wunsch geht nur an ihn.</p>
      </BereichKopf>
      <NurMit recht="werkzeug.wuenschen" titel="Bestimm mit, was an der Wand hängt" text="Mitglieder wünschen sich Werkzeug direkt bei Seb. Wird es gekauft, bekommst du Bescheid.">
        <Wuensche />
      </NurMit>
    </>
  );
}

function Wuensche() {
  const z = useKonto();
  const [werkzeug, setWerkzeug] = useState("");
  const [warum, setWarum] = useState("");
  const [danke, setDanke] = useState(false);
  if (!z) return null;
  const gueltig = werkzeug.trim().length > 2 && warum.trim().length > 2;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <form
        className="buehne self-start p-5 lg:p-6"
        onSubmit={(e) => { e.preventDefault(); if (!gueltig) return; werkzeugWuenschen(werkzeug.trim(), warum.trim()); setWerkzeug(""); setWarum(""); setDanke(true); }}
      >
        <h2 className="heading-m">Neuer Wunsch</h2>
        <div className="mt-4 grid gap-4">
          <Feldgruppe label="Welches Werkzeug?"><input className="feld" placeholder="Zum Beispiel: zweite Tauchsäge" value={werkzeug} onChange={(e) => { setWerkzeug(e.target.value); setDanke(false); }} /></Feldgruppe>
          <Feldgruppe label="Wofür brauchst du es?"><textarea className="feld min-h-24" placeholder="Ein, zwei Sätze reichen." value={warum} onChange={(e) => setWarum(e.target.value)} /></Feldgruppe>
        </div>
        <button type="submit" className="btn btn-primary mt-5" disabled={!gueltig}>Wunsch an Seb schicken</button>
        {danke && <p className="einblenden mt-4 border border-line-strong p-3 font-semibold" role="status">Danke, das ist kein Kaufversprechen. Seb sammelt die Wünsche und entscheidet, was sich für die Halle lohnt.</p>}
        <p className="mt-4 text-[14px] text-muted">Wünsche sind nicht öffentlich. Andere Mitglieder sehen sie nicht, und es gibt kein Voting.</p>
      </form>

      <section>
        <h2 className="heading-m">Deine Wünsche</h2>
        {z.werkzeugwuensche.length === 0 && <p className="mt-2 text-muted">Noch keiner. Was hat dir beim letzten Mal gefehlt?</p>}
        <ul className="mt-3 space-y-3">
          {z.werkzeugwuensche.map((w) => (
            <li key={w.id} className="karte p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="heading-s">{w.werkzeug}</h3>
                <span className={`badge ${w.status === "gekauft" ? "badge-live" : "badge-leise"}`}>{w.status === "gekauft" ? "Ist da" : "Bei Seb"}</span>
              </div>
              <p className="mt-1 text-muted">{w.begruendung}</p>
              <p className="mt-2 text-[14px] text-muted">Gewünscht am {formatLang(w.datum)}{w.status === "gekauft" ? " · hängt jetzt in der Halle" : ""}</p>
              {w.status === "offen" && <DemoAktion onClick={() => werkzeugGekauft(w.werkzeug)}>So sieht es aus, wenn Seb es kauft</DemoAktion>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
