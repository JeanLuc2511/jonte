"use client";

import { useState } from "react";
import { ABO } from "@/lib/daten/abo";
import { euro, formatLang } from "@/lib/datum";
import { useKonto, useRolle } from "@/lib/mein-camp/store";
import { aboAbschliessen, aboFortsetzen, aboKuendigen, aboPausieren, demoZuruecksetzen } from "@/lib/services/mitglieder";
import { Beispiel } from "../Bausteine";
import { BereichKopf, StufenVergleich } from "./Teile";

export function Mitgliedschaft() {
  const z = useKonto();
  const rolle = useRolle();
  const [dialog, setDialog] = useState<null | "pause" | "kuendigen">(null);
  const [tage, setTage] = useState(6);
  if (!z || !rolle) return null;
  const { abo } = z.mitglied;
  const ohneAbo = tage * ABO.werkzeugpauschaleProTag;

  return (
    <>
      <BereichKopf eyebrow="Mitgliedschaft" titel="Dein Abo, deine Regeln">
        <p>Monatlich kündbar. Pausieren, wenn das Projekt ruht. Und wer fertig ist, bleibt mit dem kostenlosen Konto in der Community.</p>
      </BereichKopf>

      {/* Status */}
      <section className="buehne p-5 lg:p-8" aria-live="polite">
        {abo.status === "aktiv" && (
          <>
            <span className="badge badge-live">Abo aktiv</span>
            <h2 className="heading-l mt-3">Mitglied seit {formatLang(abo.seit ?? z.mitglied.dabeiSeit)}</h2>
            <p className="mt-2 text-lg text-muted">{euro(abo.preisProMonat)} im Monat · nächste Abbuchung am {formatLang(abo.naechsteAbbuchung ?? "")} <Beispiel /></p>
            {dialog === null && (
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" className="btn btn-outline" onClick={() => setDialog("pause")}>Abo pausieren</button>
                <button type="button" className="btn btn-outline" onClick={() => setDialog("kuendigen")}>Abo kündigen</button>
              </div>
            )}
          </>
        )}
        {abo.status === "pausiert" && (
          <>
            <span className="badge">Abo pausiert</span>
            <h2 className="heading-l mt-3">Pause bis {formatLang(abo.pausiertBis ?? "")}</h2>
            <p className="mt-2 max-w-xl text-lg text-muted">In der Pause zahlst du nichts. Garage, Projekt und Community bleiben, die Abo-Vorteile ruhen. Danach läuft es automatisch weiter.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="btn btn-primary" onClick={aboFortsetzen}>Jetzt fortsetzen</button>
              <button type="button" className="btn btn-outline" onClick={() => setDialog("kuendigen")}>Abo kündigen</button>
            </div>
          </>
        )}
        {abo.status === "gekuendigt" && (
          <>
            <span className="badge">Gekündigt</span>
            <h2 className="heading-l mt-3">Dein Abo endet am {formatLang(abo.endetAm ?? "")}</h2>
            <p className="mt-2 max-w-xl text-lg text-muted">Die Kündigung ist bestätigt. Bis dahin gelten alle Vorteile weiter. Danach behältst du dein kostenloses Konto mit Garage, Projekt und Community.</p>
            <button type="button" className="btn btn-primary mt-6" onClick={aboFortsetzen}>Kündigung zurücknehmen</button>
          </>
        )}
        {abo.status === "keins" && (
          <>
            <span className="badge">Kostenloses Konto</span>
            <h2 className="heading-l mt-3">Werde Mitglied für {euro(ABO.preisProMonat)} im Monat</h2>
            <p className="mt-2 max-w-xl text-lg text-muted">Werkzeug inklusive, Support von Seb, früher buchen, 10 % im Fachshop und Werkzeug wünschen. Monatlich kündbar, jederzeit pausierbar. <Beispiel>Beispielpreis</Beispiel></p>
            <button type="button" className="btn btn-primary mt-6" onClick={aboAbschliessen}>Jetzt Mitglied werden</button>
            <p className="mt-3 text-[14px] text-muted">Demo: Es wird nichts abgebucht. Später läuft die Zahlung über den Checkout.</p>
          </>
        )}

        {dialog === "pause" && (
          <div className="einblenden mt-6 border border-line-strong p-5">
            <h3 className="heading-m">Wie lange willst du pausieren?</h3>
            <p className="mt-1 text-muted">Zum Beispiel über den Winter oder wenn das Projekt ruht. In der Pause zahlst du nichts.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {[1, 2, 3].map((m) => <button key={m} type="button" className="btn btn-primary" onClick={() => { aboPausieren(m); setDialog(null); }}>{m} {m === 1 ? "Monat" : "Monate"}</button>)}
              <button type="button" className="btn btn-ghost" onClick={() => setDialog(null)}>Doch nicht</button>
            </div>
          </div>
        )}
        {dialog === "kuendigen" && (
          <div className="einblenden mt-6 border border-line-strong p-5">
            <h3 className="heading-m">Abo wirklich kündigen?</h3>
            <ul className="mt-3 space-y-1.5">
              <li>– Dein Abo endet zum Monatsende, bis dahin gilt alles weiter.</li>
              <li>– Dein kostenloses Konto bleibt: Garage, Projekt, Bautagebuch, Events, Hilfe-Börse.</li>
              <li>– Du kannst jederzeit wieder Mitglied werden.</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className="btn btn-primary" onClick={() => { aboKuendigen(); setDialog(null); }}>Jetzt kündigen</button>
              {abo.status === "aktiv" && <button type="button" className="btn btn-outline" onClick={() => setDialog("pause")}>Lieber pausieren</button>}
              <button type="button" className="btn btn-ghost" onClick={() => setDialog(null)}>Abo behalten</button>
            </div>
          </div>
        )}
      </section>

      {/* Rechner */}
      <section className="karte mt-6 p-5 lg:p-6">
        <h2 className="heading-m">Lohnt sich das Abo für dich?</h2>
        <label className="mt-4 block">
          <span className="feld-label">Tage in der Halle pro Monat: <strong className="text-display">{tage}</strong></span>
          <input type="range" min={1} max={20} value={tage} onChange={(e) => setTage(Number(e.target.value))} className="w-full accent-[#FDE58B]" />
        </label>
        <div className="mt-4 grid gap-px border border-line bg-line sm:grid-cols-2">
          <div className="bg-dunkel p-4">
            <p className="label text-muted">Ohne Abo · Werkzeugpauschale</p>
            <p className="font-display text-4xl">{euro(ohneAbo)}</p>
            <p className="text-[14px] text-muted">{tage} × {euro(ABO.werkzeugpauschaleProTag)} pro Tag</p>
          </div>
          <div className="bg-dunkel p-4">
            <p className="label text-muted">Mit Abo · Werkzeug inklusive</p>
            <p className="font-display text-4xl text-display">{euro(ABO.preisProMonat)}</p>
            <p className="text-[14px] text-muted">plus Support, Rabatt und frühere Buchung</p>
          </div>
        </div>
        <p className="mt-4 text-lg" aria-live="polite">
          {ohneAbo >= ABO.preisProMonat
            ? <>Du sparst <strong className="text-display">{euro(ohneAbo - ABO.preisProMonat)}</strong> im Monat – allein beim Werkzeug.</>
            : <>Ab {ABO.lohntAbTagen} Tagen im Monat ist das Abo günstiger als die Werkzeugpauschale.</>}
          {" "}<Beispiel>Beispielwerte</Beispiel>
        </p>
      </section>

      <section className="mt-10">
        <h2 className="heading-l mb-5">Die Stufen im Vergleich</h2>
        <StufenVergleich aktuelle={rolle} />
      </section>

      <section className="mt-10 border border-dashed border-line p-5">
        <p className="label text-muted">Demo</p>
        <p className="mt-2 max-w-xl text-muted">Alles, was du hier änderst, liegt nur in deinem Browser. Mit einem Klick ist das Beispiel-Mitglied wieder im Ausgangszustand.</p>
        <button type="button" className="btn btn-outline btn-klein mt-4" onClick={demoZuruecksetzen}>Demo zurücksetzen</button>
      </section>
    </>
  );
}
