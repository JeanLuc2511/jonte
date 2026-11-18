# CLAUDE.md – Camp & Camper

Website für die DIY-Mietwerkstatt „Camp & Camper“ in Münster. Aktuell eine Vision-Demo mit
Beispieldaten, gebaut als Fundament für den echten Auftritt. Überblick und Andockpunkte: `README.md`.

## Befehle

- `npm run dev` – Entwicklung
- `npm run lint` und `npm run build` – müssen vor jedem Push fehlerfrei laufen

## Aufbau

- `app/` – Seiten (Next.js 16 App Router). `params` und `searchParams` sind Promises.
- `components/` – Bausteine; `components/werkstatt/` Hallenplan, `components/shop/` Fachshop
- `lib/daten/` – **alle** Beispieldaten, zentral
- `lib/services/` – Adapter zu Shopify, Buchungs-Backend, n8n. Seiten lesen Daten nur hierüber.
- `lib/types.ts` – gemeinsame Datentypen (auch für Mitgliederbereich, App und Cockpit)
- `app/mein-camp/`, `components/mein-camp/` – Mitgliederbereich; Plan in `docs/02-mitgliederbereich.md`
- `lib/rechte.ts` – Rollen (`gast`, `konto`, `mitglied`, `admin`) und Rechte-Matrix
- `lib/mein-camp/store.ts` – Konto-Zustand der Demo; `lib/services/mitglieder.ts` – alle Aktionen der Mitglieder
- `app/cockpit/`, `components/cockpit/` – Sebs Verwaltungsbereich; Plan in `docs/03-verwaltung.md`
- `lib/camp/store.ts` – gemeinsamer Camp-Zustand (Halle, Buchungen, Workshops, Preise, Inhalte, Medien);
  `lib/camp/auswertung.ts` – Kennzahlen als reine Funktionen; `lib/services/cockpit.ts` – alle Admin-Aktionen
- `components/live/` – Teile der Website, die den Camp-Zustand live anzeigen (`<T k="…" />` für Texte)

## Regeln

- Neue Inhalte gehören nach `lib/daten/` und werden über `lib/services/` gelesen, nie direkt in Seiten.
  Ausnahme: feste Konfiguration (`abo.ts`, `phasen.ts`, `fahrzeuge.ts`) dürfen Komponenten direkt importieren.
- Im Mitgliederbereich: Zustand nur über `lib/services/mitglieder.ts` ändern, Sichtbarkeit nur über
  `darf(rolle, recht)` steuern, jede Aktion meldet ein Ereignis (`melde(...)`).
- Alles, was Seb pflegt (Halle, Preise, Workshops, Texte, FAQ, Phasen), kommt im Browser aus dem Camp-Zustand:
  `useCamp()`, `usePreise()`, `usePhasen()` statt fester Importe. Server-Seiten geben die Beispieldaten nur als
  Startwert mit. Neue pflegbare Texte in `lib/daten/texte.ts` eintragen und mit `<T k="…" />` ausgeben.
- Im Cockpit: Zustand nur über `lib/services/cockpit.ts` ändern. Jede Aktion prüft ein Admin-Recht, meldet ein
  Ereignis und schreibt Änderungen, die das Beispiel-Mitglied betreffen, mit Benachrichtigung in dessen Konto.
- Produkte und Bestellungen bleiben im Shopify-Admin; das Cockpit zeigt nur einen Überblick.
- „Heute in der Halle“ und „Support“ müssen am Handy mit einer Hand bedienbar bleiben (Navigation unten).
- Externe Dienste (Bildanalyse, Fahrzeugdaten, Benachrichtigungen) laufen über n8n-Webhooks hinter
  eigenen Routen in `app/api/` und werden ohne Webhook simuliert. Fahrzeugschein-Fotos nie speichern.
- Alles, was vom Tagesdatum abhängt, wird im Browser berechnet (`useHeute()`) oder per `revalidate` erneuert.
- Keine Geheimnisse im Client: Webhook-URLs und Tokens nur in Server-Routen und Umgebungsvariablen.

## Sprache und Ton

- Deutsch, per Du, locker und handfest. Kurze Sätze, Werkstattsprache, höchstens ein Ausrufezeichen pro Absatz.
- Der Arbeitsplatz heißt immer **Werkstattbucht**. Außerdem: Selbstausbauer, Fachshop, Camp.
- Kein Werkzeugverleih zum Mitnehmen. Buchen geht ohne Konto.
- Werkzeug ist nur für Mitglieder inklusive, sonst gilt die Werkzeugpauschale pro Tag.
- Budget und Belege sind immer privat. Werkzeugwünsche sind nicht öffentlich, es gibt kein Voting.
- Beispielwerte dezent mit `<Beispiel />` kennzeichnen.

## Design (Designsystem „Camp & Camper“)

- Tokens in `app/globals.css`. Gelb `#FDE58B` ist die Marke, Lila `#7934C7` die Aktion – nie als große Fläche.
- Bühnen: dunkel (Standard), `.buehne` gelb für Formulare und Buchungsschritte, `.hell` creme.
- Anton für Headlines (`display-*` in Großbuchstaben, `heading-*` normal), Barlow für Text,
  Barlow Semi Condensed für Buttons, Badges, Eyebrows. Schriften nur lokal.
- Eckig: Flächen ohne Radius, Buttons 3 px, Pillen nur für Status-Badges. Haarlinien statt Schatten.
- Ein Primär-Button pro Abschnitt, daneben Outline. Keine Emojis, keine Stockfotos; Icons als 1,5-px-Linien.
- Die Wortmarke nicht nachbauen; Bildmarke `public/logo.png` nicht beschneiden oder umfärben.
- Reihenfolge der Optimierung: PC/Laptop, dann Tablet, dann Handy. Touch-Flächen mindestens 44 px.
