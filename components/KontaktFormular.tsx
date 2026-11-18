"use client";

import { useState } from "react";
import { sendeFormular } from "@/lib/services/formulare";

export function KontaktFormular() {
  const [status, setStatus] = useState<"offen" | "sendet" | "fertig">("offen");
  const [fehler, setFehler] = useState<string | null>(null);

  if (status === "fertig") {
    return (
      <div className="einblenden" role="status">
        <h2 className="heading-m">Ist angekommen.</h2>
        <p className="mt-3 text-muted">Danke für deine Nachricht. Wir melden uns, sobald wir die Hände frei haben.</p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setStatus("sendet");
        setFehler(null);
        const antwort = await sendeFormular("kontakt", {
          name: f.get("name"), email: f.get("email"), nachricht: f.get("nachricht"),
          einwilligung: f.get("einwilligung") === "on",
        });
        if (antwort.ok) setStatus("fertig");
        else { setStatus("offen"); setFehler(antwort.fehler ?? "Das hat nicht geklappt."); }
      }}
    >
      <label>
        <span className="feld-label">Dein Name</span>
        <input name="name" className="feld" required autoComplete="name" />
      </label>
      <label>
        <span className="feld-label">E-Mail</span>
        <input name="email" type="email" className="feld" required autoComplete="email" />
      </label>
      <label className="sm:col-span-2">
        <span className="feld-label">Worum geht’s?</span>
        <textarea name="nachricht" className="feld min-h-36" required />
      </label>
      <label className="flex gap-3 text-[15px] sm:col-span-2">
        <input name="einwilligung" type="checkbox" required className="mt-1 h-5 w-5 shrink-0 accent-[#331654]" />
        <span>Ich bin einverstanden, dass Camp &amp; Camper meine Angaben nutzt, um meine Anfrage zu beantworten. Details stehen im Datenschutz.</span>
      </label>
      {fehler && <p className="sm:col-span-2 font-semibold" role="alert">{fehler}</p>}
      <div className="sm:col-span-2">
        <button type="submit" className="btn btn-primary" disabled={status === "sendet"}>
          {status === "sendet" ? "Wird gesendet …" : "Nachricht senden"}
        </button>
      </div>
    </form>
  );
}
