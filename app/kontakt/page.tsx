import type { Metadata } from "next";
import { Beispiel, Seitenkopf } from "@/components/Bausteine";
import { IconPin } from "@/components/Icons";
import { Oeffnungszeiten, Telefon } from "@/components/live/Inhalte";
import { KontaktFormular } from "@/components/KontaktFormular";
import { SITE } from "@/lib/daten/site";

export const metadata: Metadata = {
  title: "Kontakt & Anfahrt",
  description: "Camp & Camper, Rudolf-Diesel-Straße 20, 48157 Münster. Anfahrt, Öffnungszeiten und Kontakt.",
};

export default function KontaktSeite() {
  const { strasse, plz, ort } = SITE.adresse;
  const karte = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${strasse}, ${plz} ${ort}`)}`;

  return (
    <>
      <Seitenkopf eyebrow="Kontakt & Anfahrt" titel="Komm vorbei. Oder schreib erst mal.">
        <p>Die Halle steht im Gewerbegebiet in Münster. Du fährst mit dem Camper direkt durchs Rolltor in deine Werkstattbucht.</p>
      </Seitenkopf>

      <section className="seite abschnitt grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        {/* Anfahrtsskizze statt eingebetteter Karte – lädt nichts von Dritten nach */}
        <div className="relative border border-line">
          <svg viewBox="0 0 640 440" className="block h-auto w-full" role="img" aria-label={`Anfahrtsskizze: ${strasse}, ${plz} ${ort}`}>
            <rect width="640" height="440" fill="#241a0e" />
            <g stroke="rgba(238,213,199,0.16)" strokeWidth="26" fill="none" strokeLinecap="square">
              <path d="M-20 340 L250 300 L660 330" />
              <path d="M250 300 L300 -20" />
              <path d="M460 316 L520 460" />
            </g>
            <path d="M-20 120 Q200 60 380 150 T660 120" stroke="rgba(238,213,199,0.08)" strokeWidth="60" fill="none" />
            <path d="M90 318 L270 170 L540 200" stroke="rgba(253,229,139,0.9)" strokeWidth="5" fill="none" strokeDasharray="14 10" />
            <text x="34" y="372" className="plan-text" fontSize="13" fill="#A38879">Rudolf-Diesel-Straße</text>
            <g fill="rgba(255,252,243,0.07)" stroke="rgba(238,213,199,0.3)" strokeWidth="2">
              <rect x="60" y="180" width="120" height="70" /><rect x="330" y="230" width="90" height="50" />
              <rect x="80" y="40" width="150" height="60" /><rect x="400" y="40" width="170" height="80" />
            </g>
            <rect x="468" y="160" width="130" height="86" fill="#FDE58B" stroke="#331654" strokeWidth="3" />
            <text x="533" y="198" textAnchor="middle" className="plan-kurz" fontSize="22" fill="#331654">CAMP &amp;</text>
            <text x="533" y="224" textAnchor="middle" className="plan-kurz" fontSize="22" fill="#331654">CAMPER</text>
            <path d="M468 190 v40" stroke="#7934C7" strokeWidth="6" />
            <text x="456" y="214" textAnchor="end" className="plan-text" fontSize="12" fill="#FDE58B">Rolltor</text>
          </svg>
          <p className="absolute bottom-3 left-3"><Beispiel>Skizze, nicht maßstäblich</Beispiel></p>
        </div>

        <div>
          <h2 className="heading-l">Hier findest du uns</h2>
          <address className="mt-5 flex gap-3 text-lg not-italic">
            <IconPin className="mt-1 shrink-0 text-display" />
            <span>{SITE.name}<br />{strasse}<br />{plz} {ort}</span>
          </address>
          <a href={karte} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-6">Route in der Karten-App</a>

          <Oeffnungszeiten />
        </div>
      </section>

      <section className="buehne">
        <div className="seite grid gap-10 py-14 lg:grid-cols-[1fr_1.3fr] lg:gap-16 lg:py-20">
          <div>
            <p className="eyebrow">Schreib uns</p>
            <h2 className="display-l mt-6">Was hast du vor?</h2>
            <p className="mt-5 text-lg text-muted">
              Erzähl kurz, welches Fahrzeug du hast und wo du stehst. Oder ruf an: <span className="whitespace-nowrap font-semibold text-ink"><Telefon /></span> <Beispiel>Platzhalter</Beispiel>
            </p>
          </div>
          <KontaktFormular />
        </div>
      </section>
    </>
  );
}
