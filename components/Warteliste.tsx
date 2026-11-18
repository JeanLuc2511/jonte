"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { sendeFormular } from "@/lib/services/formulare";
import { IconHaken, IconPfeil } from "./Icons";

type Frage =
  | { id: string; art: "text" | "lang"; titel: string; hilfe?: string; platzhalter?: string; pflicht?: boolean }
  | { id: string; art: "wahl" | "mehrfach"; titel: string; hilfe?: string; optionen: string[] }
  | { id: "kontakt"; art: "kontakt"; titel: string; hilfe?: string };

/** Die sechs Fragen der bisherigen Typeform – ergänzt um Name, Kontaktdaten und Einwilligung. */
const FRAGEN: Frage[] = [
  { id: "vorname", art: "text", titel: "Erst mal: Wie heißt du?", platzhalter: "Dein Vorname", pflicht: true },
  { id: "fahrzeug", art: "wahl", titel: "Was fährst du – oder willst du ausbauen?", optionen: ["Sprinter", "Crafter / TGE", "Ducato / Boxer / Jumper", "Transit", "Daily", "Ein anderes Fahrzeug", "Noch keins"] },
  { id: "stand", art: "wahl", titel: "Wo stehst du mit deinem Ausbau?", hilfe: "Vom ersten Traum bis zum laufenden Umbau – alles ist willkommen.", optionen: ["Ich träume noch", "Ich plane gerade", "Fahrzeug steht da, bald geht’s los", "Ich bin mittendrin", "Fast fertig, es fehlt der Feinschliff"] },
  { id: "interessen", art: "mehrfach", titel: "Was möchtest du hier im Camp machen?", hilfe: "Mehrere möglich.", optionen: ["Werkstattbucht mieten", "Material aus dem Fachshop", "Beratung", "Workshops", "Gasprüfung"] },
  { id: "start", art: "wahl", titel: "Wann würdest du am liebsten loslegen?", optionen: ["Sofort", "In 1 bis 3 Monaten", "In 3 bis 6 Monaten", "Später", "Weiß ich noch nicht"] },
  { id: "quelle", art: "wahl", titel: "Wie hast du von uns gehört?", optionen: ["Instagram", "Empfehlung", "Google", "An der Halle vorbeigefahren", "Woanders"] },
  { id: "herausforderung", art: "lang", titel: "Was ist gerade deine größte Baustelle?", hilfe: "Freiwillig. Hilft uns, die richtigen Workshops zu planen.", platzhalter: "Zum Beispiel: Ich traue mich nicht ans Dachfenster." },
  { id: "kontakt", art: "kontakt", titel: "Wohin dürfen wir uns melden?", hilfe: "Wir schreiben dir, sobald es losgeht. Kein Newsletter-Dauerfeuer." },
];

const TASTEN = "ABCDEFGH";

export function Warteliste() {
  const [schritt, setSchritt] = useState(-1);
  const [a, setA] = useState<Record<string, string | string[] | boolean>>({ interessen: [] });
  const [fehler, setFehler] = useState<string | null>(null);
  const [status, setStatus] = useState<"offen" | "sendet" | "fertig">("offen");
  const [demo, setDemo] = useState(false);

  const frage = FRAGEN[schritt];
  const letzter = schritt === FRAGEN.length - 1;
  const text = (id: string) => (typeof a[id] === "string" ? (a[id] as string) : "");

  const absenden = useCallback(async () => {
    setStatus("sendet");
    const antwort = await sendeFormular("warteliste", { ...a, einwilligung: a.einwilligung === true });
    if (antwort.ok) { setDemo(Boolean(antwort.demo)); setStatus("fertig"); }
    else { setStatus("offen"); setFehler(antwort.fehler ?? "Das hat nicht geklappt."); }
  }, [a]);

  const weiter = useCallback(() => {
    if (!frage) return setSchritt(0);
    if (frage.art === "text" && frage.pflicht && !text(frage.id).trim()) return setFehler("Das brauchen wir noch.");
    if (frage.art === "wahl" && !a[frage.id]) return setFehler("Such dir eine Antwort aus.");
    if (frage.art === "mehrfach" && (a[frage.id] as string[]).length === 0) return setFehler("Mindestens eins darf es sein.");
    if (frage.art === "kontakt") {
      if (!/^\S+@\S+\.\S+$/.test(text("email"))) return setFehler("Die E-Mail-Adresse sieht noch nicht richtig aus.");
      if (a.einwilligung !== true) return setFehler("Ohne dein Einverständnis dürfen wir dich nicht anschreiben.");
      setFehler(null);
      return void absenden();
    }
    setFehler(null);
    setSchritt((s) => s + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frage, a, absenden]);

  const waehle = useCallback((f: Frage, option: string) => {
    setFehler(null);
    if (f.art === "mehrfach") {
      setA((alt) => {
        const liste = alt[f.id] as string[];
        return { ...alt, [f.id]: liste.includes(option) ? liste.filter((o) => o !== option) : [...liste, option] };
      });
    } else {
      setA((alt) => ({ ...alt, [f.id]: option }));
      window.setTimeout(() => setSchritt((s) => Math.min(s + 1, FRAGEN.length - 1)), 260);
    }
  }, []);

  // Tastatur wie bei Typeform: Buchstaben wählen, Enter geht weiter.
  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      if (status !== "offen") return;
      const ziel = e.target as HTMLElement;
      const tippt = ziel.tagName === "INPUT" || ziel.tagName === "TEXTAREA";
      if (e.key === "Enter" && !(ziel.tagName === "TEXTAREA" && !e.metaKey && !e.ctrlKey) && ziel.tagName !== "BUTTON" && ziel.tagName !== "A") {
        e.preventDefault();
        weiter();
      } else if (!tippt && frage && (frage.art === "wahl" || frage.art === "mehrfach")) {
        const i = TASTEN.indexOf(e.key.toUpperCase());
        if (i >= 0 && i < frage.optionen.length) waehle(frage, frage.optionen[i]);
      }
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, [frage, status, weiter, waehle]);

  const rahmen = "buehne flex min-h-[calc(100dvh-110px)] flex-col";

  if (status === "fertig") {
    return (
      <div className={rahmen}>
        <div className="seite einblenden flex flex-1 flex-col justify-center py-16" role="status">
          <p className="eyebrow">Du bist drauf</p>
          <h1 className="display-xl mt-6 max-w-3xl">Danke, {text("vorname") || "du"}. Wir melden uns.</h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Sobald das Rolltor aufgeht, bist du unter den Ersten, die es erfahren. Bis dahin: Schau dir schon mal die Halle an.
          </p>
          {demo && (
            <p className="mt-6 max-w-xl border border-line p-3 text-[15px]">
              Demo-Hinweis: Es ist noch kein n8n-Webhook hinterlegt. Deine Angaben wurden nicht gespeichert.
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/werkstatt" className="btn btn-primary">Halle ansehen</Link>
            <Link href="/" className="btn btn-outline">Zur Startseite</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={rahmen}>
      <div
        className="h-1.5 bg-[rgba(51,22,84,0.15)]" role="progressbar" aria-label="Fortschritt"
        aria-valuemin={0} aria-valuemax={FRAGEN.length} aria-valuenow={Math.max(0, schritt)}
      >
        <div className="h-full bg-lila transition-[width] duration-300" style={{ width: `${(Math.max(0, schritt) / FRAGEN.length) * 100}%` }} />
      </div>

      <div className="seite flex flex-1 flex-col justify-center py-10 lg:py-16">
        {schritt === -1 ? (
          <div className="einblenden max-w-3xl">
            <p className="eyebrow">Warteliste</p>
            <h1 className="display-hero mt-6">Wir schrauben noch.</h1>
            <p className="mt-6 max-w-xl text-xl text-muted">
              Die Halle wird gerade eingerichtet. Trag dich ein und sichere dir eine der ersten Werkstattbuchten. Acht kurze Fragen, zwei Minuten.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button type="button" className="btn btn-primary" onClick={weiter} autoFocus>Los geht’s</button>
              <span className="text-[14px] text-muted max-md:hidden">oder drück <kbd className="font-semibold">Enter ↵</kbd></span>
            </div>
          </div>
        ) : (
          <div key={frage.id} className="einblenden w-full max-w-2xl">
            <p className="label flex items-center gap-2 text-muted">
              Frage {schritt + 1} von {FRAGEN.length} <IconPfeil width={16} height={16} />
            </p>
            <h1 className="heading-l mt-3" id="frage-titel">{frage.titel}</h1>
            {frage.hilfe && <p className="mt-3 text-lg text-muted">{frage.hilfe}</p>}

            <div className="mt-7">
              {frage.art === "text" && (
                <input
                  autoFocus aria-labelledby="frage-titel" className="w-full border-0 border-b-2 border-pflaume bg-transparent py-3 font-condensed text-3xl font-medium placeholder:text-pflaume/35 focus:outline-none focus-visible:border-lila"
                  placeholder={frage.platzhalter} value={text(frage.id)} autoComplete="given-name"
                  onChange={(e) => { setFehler(null); setA({ ...a, [frage.id]: e.target.value }); }}
                />
              )}
              {frage.art === "lang" && (
                <textarea
                  autoFocus aria-labelledby="frage-titel" rows={3} className="w-full border-0 border-b-2 border-pflaume bg-transparent py-3 font-condensed text-2xl font-medium placeholder:text-pflaume/35 focus:outline-none focus-visible:border-lila"
                  placeholder={frage.platzhalter} value={text(frage.id)}
                  onChange={(e) => setA({ ...a, [frage.id]: e.target.value })}
                />
              )}
              {(frage.art === "wahl" || frage.art === "mehrfach") && (
                <div className="flex flex-col gap-3" role={frage.art === "wahl" ? "radiogroup" : "group"} aria-labelledby="frage-titel">
                  {frage.optionen.map((o, i) => {
                    const an = frage.art === "wahl" ? a[frage.id] === o : (a[frage.id] as string[]).includes(o);
                    return (
                      <button
                        key={o} type="button" className="option" role={frage.art === "wahl" ? "radio" : "checkbox"}
                        aria-checked={an} onClick={() => waehle(frage, o)}
                      >
                        <span className="option-key">{an ? <IconHaken width={16} height={16} strokeWidth={2.5} /> : TASTEN[i]}</span>
                        {o}
                      </button>
                    );
                  })}
                </div>
              )}
              {frage.art === "kontakt" && (
                <div className="grid gap-4">
                  <label>
                    <span className="feld-label">E-Mail</span>
                    <input autoFocus type="email" className="feld" autoComplete="email" placeholder="du@beispiel.de" value={text("email")} onChange={(e) => { setFehler(null); setA({ ...a, email: e.target.value }); }} />
                  </label>
                  <label>
                    <span className="feld-label">Telefon (freiwillig)</span>
                    <input type="tel" className="feld" autoComplete="tel" value={text("telefon")} onChange={(e) => setA({ ...a, telefon: e.target.value })} />
                  </label>
                  <label className="mt-2 flex gap-3">
                    <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[#331654]" checked={a.einwilligung === true} onChange={(e) => { setFehler(null); setA({ ...a, einwilligung: e.target.checked }); }} />
                    <span className="text-[15px]">
                      Ich bin einverstanden, dass Camp &amp; Camper meine Angaben speichert und mich zum Start der Werkstatt per E-Mail kontaktiert. Das kann ich jederzeit widerrufen. Mehr im{" "}
                      <Link href="/rechtliches/datenschutz" className="underline underline-offset-4">Datenschutz</Link>.
                    </span>
                  </label>
                </div>
              )}
            </div>

            {fehler && <p className="mt-4 font-semibold" role="alert">{fehler}</p>}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button type="button" className="btn btn-primary" onClick={weiter} disabled={status === "sendet"}>
                {letzter ? (status === "sendet" ? "Wird gesendet …" : "Auf die Warteliste") : "Weiter"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => { setFehler(null); setSchritt(schritt - 1); }}>Zurück</button>
              {!letzter && <span className="text-[14px] text-muted max-md:hidden">Enter ↵ geht auch</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
