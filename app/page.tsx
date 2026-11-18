import Link from "next/link";
import { Abschnittskopf, Beispiel, PfeilLink, WartelisteBand } from "@/components/Bausteine";
import { HeroGrafik } from "@/components/HeroGrafik";
import { IconHalle, IconLeute, IconPin, IconWerkzeug } from "@/components/Icons";
import { Galerie } from "@/components/Galerie";
import { VanSeite } from "@/components/Van";
import { LeistungsKarten, WorkshopListe } from "@/components/live/Inhalte";
import { T } from "@/components/live/T";
import { Hallenplan } from "@/components/werkstatt/Hallenplan";
import { FAHRZEUGE } from "@/lib/daten/fahrzeuge";
import { SITE } from "@/lib/daten/site";
import { getHalle, getLeistungen, getWorkshops } from "@/lib/services/buchung";
import { getProjekte } from "@/lib/services/inhalte";

export const revalidate = 3600;

const WEGE = [
  { icon: IconHalle, eyebrow: "Buchen", titel: "Werkstattbucht mieten", text: "Dein Platz im Warmen, mit Werkzeug, Maschinen und Leuten, die wissen, wie es geht.", href: "/werkstatt", cta: "Halle ansehen" },
  { icon: IconWerkzeug, eyebrow: "Fachshop", titel: "Material holen", text: "Dämmung, Elektrik, Fenster, Holz – sortiert nach deinem Fahrzeug, abholbar in der Halle.", href: "/shop", cta: "Zum Fachshop" },
  { icon: IconLeute, eyebrow: "Community", titel: "Mitschrauben", text: "Schau dir an, was andere gerade bauen, und werde Teil vom Camp.", href: "/community", cta: "Projekte ansehen" },
];

const FARBEN = ["#EED5C7", "#9DB4D6", "#FFFCF3", "#D98C7A", "#B9A6E0"];

export default async function Startseite() {
  const [halle, leistungen, workshops, projekte] = await Promise.all([getHalle(), getLeistungen(), getWorkshops(), getProjekte()]);
  const buchten = halle.zonen.filter((z) => z.typ === "bucht").length;

  return (
    <>
      {/* Hero */}
      <section className="raster overflow-hidden border-b border-line">
        <div className="seite grid items-center gap-8 py-12 lg:grid-cols-[1.15fr_1fr] lg:gap-6 lg:py-20">
          <div>
            <p className="eyebrow"><T k="start.eyebrow" /></p>
            <h1 className="display-hero mt-6 lg:text-[clamp(4.5rem,7.6vw,8rem)]"><T k="start.titel" /></h1>
            <p className="mt-7 max-w-xl text-lg leading-[1.82]">
              <T k="start.text" />
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/werkstatt" className="btn btn-primary">Werkstattbucht ansehen</Link>
              <Link href="/warteliste" className="btn btn-outline">Zur Warteliste</Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-[15px] text-muted">
              <IconPin width={18} height={18} className="shrink-0 text-display" /> {SITE.adresse.strasse}, {SITE.adresse.ort} · <span className="text-accent">In Gründung</span>
            </p>
          </div>
          <HeroGrafik className="mx-auto h-auto w-full max-w-[560px] lg:max-w-none" />
        </div>
        <div className="seite"><dl className="grid grid-cols-2 border-t border-line lg:grid-cols-4">
          {[
            [String(buchten), "Werkstattbuchten"],
            [String(halle.werkzeuge.length), "Werkzeuge & Maschinen"],
            [String(workshops.length), "Workshop-Themen"],
            [String(FAHRZEUGE.length), "Fahrzeugtypen im Fachshop"],
          ].map(([zahl, text], i) => (
            <div key={text} className={`py-6 ${i % 2 ? "pl-5" : "pr-5"} ${i > 1 ? "max-lg:border-t max-lg:border-line" : ""} lg:px-6 lg:first:pl-0 ${i ? "lg:border-l lg:border-line" : ""} ${i % 2 ? "max-lg:border-l max-lg:border-line" : ""}`}>
              <dt className="sr-only">{text}</dt>
              <dd>
                <span className="font-display text-5xl text-display lg:text-6xl">{zahl}</span>
                <span className="mt-1 block font-condensed text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">{text}</span>
              </dd>
            </div>
          ))}
        </dl></div>
      </section>

      {/* Drei Wege */}
      <section className="seite abschnitt">
        <Abschnittskopf eyebrow="Dein Weg ins Camp" titel="Drei Türen, eine Halle" />
        <div className="mt-10 grid gap-px border border-line bg-line lg:grid-cols-3">
          {WEGE.map((w) => (
            <Link key={w.href} href={w.href} className="group flex flex-col bg-dunkel p-6 transition-colors hover:bg-[#2a1d10] lg:p-8">
              <w.icon width={40} height={40} className="text-display" />
              <p className="label mt-8 text-muted">{w.eyebrow}</p>
              <h3 className="heading-l mt-2">{w.titel}</h3>
              <p className="mt-3 text-muted">{w.text}</p>
              <span className="btn btn-ghost mt-auto self-start pt-6 group-hover:underline">{w.cta} →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Halle */}
      <section className="border-y border-line">
        <div className="seite abschnitt grid items-center gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
          <div>
            <Abschnittskopf eyebrow="Das Herzstück" titel="Die Halle von oben">
              <p>
                Sechs Werkstattbuchten, Holzwerkstatt, Metall-Ecke, Werkbänke und eine Wand voller Spezialwerkzeug. Klick dich durch, sieh nach, was wo liegt, und welche Werkstattbucht in deinem Zeitraum frei ist.
              </p>
            </Abschnittskopf>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/werkstatt" className="btn btn-outline">Halle erkunden</Link>
              <Beispiel>Beispiel-Hallenplan</Beispiel>
            </div>
          </div>
          <Link href="/werkstatt" className="block border border-line" aria-label="Zum interaktiven Hallenplan">
            <Hallenplan zonen={halle.zonen} className="block h-auto w-full" />
          </Link>
        </div>
      </section>

      {/* Angebote */}
      <section className="seite abschnitt">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Abschnittskopf eyebrow="Was du buchen kannst" titel="Platz, Wissen, Prüfung" />
          <Beispiel>Beispielpreise</Beispiel>
        </div>
        <LeistungsKarten leistungen={leistungen} />
        <p className="mt-6 max-w-2xl text-muted">
          Buchen geht ohne Konto – auch nur für eine Stunde, wenn du schnell etwas reparieren willst. Für Mitglieder ist das Werkzeug inklusive, sonst kommt eine Werkzeugpauschale pro Tag dazu.
        </p>
      </section>

      {/* Mein Camp */}
      <section className="border-y border-line">
        <div className="seite abschnitt grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
          <div>
            <Abschnittskopf eyebrow="Mein Camp" titel="Dein Ausbau dauert Monate. Hier findet er statt.">
              <p>Fahrzeug anlegen, Projekt planen, Bautagebuch führen, Hilfe von Seb und der Community bekommen. Das Konto ist kostenlos. Als Mitglied ist das Werkzeug inklusive.</p>
            </Abschnittskopf>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/mein-camp" className="btn btn-outline">Mein Camp ansehen</Link>
              <span className="text-muted">Mitglied ab 39 € im Monat <Beispiel /></span>
            </div>
          </div>
          <ul className="grid gap-px border border-line bg-line sm:grid-cols-2">
            {[
              ["Meine Garage", "HSN/TSN eintippen oder Fahrzeugschein fotografieren. Shop und Buchung richten sich nach deinem Fahrzeug."],
              ["Projekt-Planer", "Sechs Phasen mit Checklisten von Seb, Stückliste mit einem Klick im Warenkorb, Budget im Blick."],
              ["Support von Seb", "Projekt-Chat mit Fotos und der „Ich komm nicht weiter“-Knopf, wenn du in der Halle stehst."],
              ["Community", "Events vorschlagen, zur Hilfe-Börse kommen, Projekt in der Galerie zeigen."],
            ].map(([t, text]) => (
              <li key={t} className="bg-dunkel p-5">
                <h3 className="heading-s">{t}</h3>
                <p className="mt-2 text-[15px] text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* So läuft's – gelbe Bühne */}
      <section className="buehne">
        <div className="seite abschnitt">
          <Abschnittskopf eyebrow="So funktioniert’s" titel="Vom leeren Blech zum fertigen Camper" />
          <ol className="mt-10 grid gap-8 md:grid-cols-3 lg:gap-12">
            {[
              ["01", "Werkstattbucht buchen", "Zeitraum wählen, freie Werkstattbucht aussuchen, fertig. Für einen Tag oder den ganzen Ausbau."],
              ["02", "Reinfahren und loslegen", "Der Werkzeugwagen steht bereit. Bestelltes Material aus dem Fachshop wartet schon in deiner Werkstattbucht."],
              ["03", "Nicht allein bauen", "Workshops, Beratung und die Leute in den Buchten nebenan. Irgendwer hat dein Problem schon gelöst."],
            ].map(([nr, titel, text]) => (
              <li key={nr} className="border-t-2 border-pflaume pt-5">
                <p className="font-display text-7xl leading-none">{nr}</p>
                <h3 className="heading-m mt-4">{titel}</h3>
                <p className="mt-2 text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Fahrzeuge */}
      <section className="seite abschnitt">
        <Abschnittskopf eyebrow="Fachshop" titel="Passend für das, was du fährst">
          <p>Bodenplatten, Einbaurahmen, Fenster: Fahrzeugspezifische Teile findest du mit einem Klick.</p>
        </Abschnittskopf>
        <ul className="mt-10 grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-3 lg:grid-cols-5">
          {FAHRZEUGE.map((f, i) => (
            <li key={f.id} className="bg-dunkel last:max-md:col-span-2">
              <Link href={`/shop?fahrzeug=${f.id}`} className="flex h-full flex-col p-5 transition-colors hover:bg-[#2a1d10]">
                <VanSeite farbe={FARBEN[i]} lang={f.id === "daily"} className="h-auto w-full max-w-[220px]" />
                <span className="heading-s mt-4">{f.name}</span>
                <span className="text-[14px] text-muted">{f.zusatz ?? f.hersteller}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6"><PfeilLink href="/shop">Alles im Fachshop</PfeilLink></div>
      </section>

      {/* Workshops */}
      <section className="border-y border-line">
        <div className="seite abschnitt">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Abschnittskopf eyebrow="Workshops" titel="Findet statt, wenn genug dabei sind">
              <p>Du reservierst deinen Platz und zahlst erst, wenn die Runde steht.</p>
            </Abschnittskopf>
            <PfeilLink href="/workshops">Alle Workshops</PfeilLink>
          </div>
          <WorkshopListe workshops={workshops} anzahl={3} kompakt />
        </div>
      </section>

      {/* Community */}
      <section className="seite abschnitt">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Abschnittskopf eyebrow="Aus der Halle" titel="Wer hier gerade baut" />
          <PfeilLink href="/community">Alle Projekte</PfeilLink>
        </div>
        <div className="mt-10"><Galerie projekte={projekte} anzahl={3} /></div>
      </section>

      <WartelisteBand />
    </>
  );
}
