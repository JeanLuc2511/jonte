# Camp & Camper – Vision-Demo

Website für **Camp & Camper**, die DIY-Mietwerkstatt für Camper-Selbstausbau in Münster
(Rudolf-Diesel-Straße 20). Die Seite ist eine klickbare Vision-Demo: Inhalte, Preise, Projekte,
Termine und der Hallenplan sind **Beispiele**. Es werden keine echten Buchungen oder Bestellungen ausgelöst.

Die Demo ist als Fundament gebaut: Shop, Buchung und Formulare hängen an einer Service-Schicht,
hinter der später die echten Systeme sitzen – ohne Umbau der Seiten.

## Starten

```bash
npm install
```

```bash
npm run dev
```

Dann <http://localhost:3000> öffnen. Prüfen vor dem Deploy:

```bash
npm run lint && npm run build
```

Technik: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4. Keine Datenbank, kein Login.

## Seiten

| Pfad | Inhalt |
| --- | --- |
| `/` | Start: Vision, drei Wege (Buchen, Fachshop, Community) |
| `/werkstatt` | Interaktiver Hallenplan, Zeitraumwahl, freie Werkstattbuchten, Nachbarfahrzeuge, Werkzeug-Gesamtliste |
| `/workshops` | Termine mit Mindestteilnehmerzahl |
| `/shop`, `/shop/[handle]`, `/warenkorb` | Fachshop mit Fahrzeugfilter, Produktseite, Warenkorb |
| `/community` | Ausbauprojekte mit Instagram-Verweis |
| `/buchen` | Buchung als Gast: Werkstattbucht (tage- oder stundenweise), Workshop, Beratung, Gasprüfung |
| `/warteliste` | Warteliste im Typeform-Stil mit Kontaktdaten und Einwilligung |
| `/faq`, `/kontakt`, `/rechtliches/[slug]` | FAQ, Anfahrt/Kontakt, fünf Rechtsseiten als Platzhalter |
| `/mein-camp` | Mitgliederbereich: Übersicht mit Neuigkeiten, Terminen und „Ich komm nicht weiter“-Knopf |
| `/mein-camp/garage` | Meine Garage: Fahrzeuge anlegen über Fahrzeugschein-Foto, HSN/TSN oder von Hand |
| `/mein-camp/projekt` | Projekt-Planer: Phasen, Checkliste, Stückliste → Warenkorb, Budget mit Beleg-Foto, Bautagebuch, Privat-Knopf |
| `/mein-camp/support` | Support von Seb: Projekt-Chat mit Fotos, Hilferuf, Video-Termin (nur Mitglieder) |
| `/mein-camp/community` | Events vorschlagen und teilnehmen, Hilfe-Börse |
| `/mein-camp/werkzeugwuensche` | Werkzeug wünschen (nur Mitglieder, nicht öffentlich) |
| `/mein-camp/mitgliedschaft` | Abo abschließen, pausieren, kündigen; Stufenvergleich und Rechner |
| `/cockpit` | Sebs Verwaltungsbereich, Start: Heute in der Halle, Zu erledigen, Kennzahlen |
| `/cockpit/support` | Support-Postfach: alle Projekt-Chats, Hilferufe oben, Video-Termine, Antwortzeit |
| `/cockpit/buchungen` | Belegungskalender; Buchungen anlegen, verschieben, stornieren; Sperrzeiten |
| `/cockpit/halle` | Buchten und Stationen im Hallenplan, Werkzeug mit Foto, Preise und Werkzeugpauschale |
| `/cockpit/workshops` | Workshops mit Teilnehmerliste und Absage; Events freigeben, anlegen; Event-Ordnung |
| `/cockpit/mitglieder` | Konten mit Stufe und Abo-Status; Akte mit Notizen und Abo von Hand |
| `/cockpit/werkzeug` | Auswertung der Werkzeugwünsche mit Status |
| `/cockpit/inhalte` | Medienbibliothek, Texte, Leistungen, FAQ, Kontakt, Rechtstexte, Phasen-Vorlagen, Community |
| `/cockpit/anfragen`, `/cockpit/shop` | Warteliste und Kontakt mit Export; Shop-Überblick mit Link in den Shopify-Admin |

## Wo die Beispieldaten liegen

Alles an einer Stelle: **`lib/daten/`**. Wer Texte, Preise oder den Hallenplan ändern will, ändert nur hier.

| Datei | Inhalt |
| --- | --- |
| `site.ts` | Name, Adresse, Kontakt, Öffnungszeiten, Navigation, Konto-Vorteile |
| `halle.ts` | Hallenplan: Werkstattbuchten, Werkbänke, Stationen (mit Koordinaten) und alle Werkzeuge |
| `belegung.ts` | Beispiel-Belegung der Werkstattbuchten, relativ zu „heute“ |
| `leistungen.ts` | Buchbare Leistungen und Preise |
| `workshops.ts` | Workshops mit Mindest-/Maximalzahl und Anmeldestand |
| `produkte.ts` | Fachshop-Sortiment mit Fahrzeugzuordnung |
| `projekte.ts` | Community-Projekte und Instagram-Namen |
| `faq.ts`, `rechtliches.ts` | FAQ und Platzhalter-Rechtstexte |
| `mitglied.ts` | **Beispiel-Mitglied** Jule: Abo, zwei Fahrzeuge, Projekt in der Elektrik-Phase, Buchungen, Chat, Events, Hilfe-Börse, Wünsche |
| `abo.ts` | Abo-Preis, Werkzeugpauschale, Shop-Rabatt, Buchungsfenster, Stufenvergleich, Event-Ordnung |
| `phasen.ts` | Sebs Vorlagen: sechs Phasen mit Checkliste, Stückliste und Budget-Richtwert |
| `kba.ts` | Beispiel-Schlüsselnummern (HSN/TSN) und die Antworten der simulierten Bildanalyse |
| `camp.ts` | **Beispiel-Camp** fürs Cockpit: alle Buchungen, Sperrzeiten, Konten, Support-Verläufe, Anfragen, Medien, Shop-Bestellungen, Preise |
| `texte.ts` | Pflegbare Texte der Website (Startseite, Seitenköpfe, Band zur Warteliste) |

Die Datentypen stehen in `lib/types.ts` und gelten später auch für Mitgliederbereich und App.

## Wo die echten Systeme andocken

Seiten und Komponenten greifen **nie direkt** auf `lib/daten/` zu, sondern über **`lib/services/`**.
Zum Andocken wird jeweils nur der Inhalt der Funktionen ersetzt.

| System | Datei | Was ersetzt wird |
| --- | --- | --- |
| **Shopify** (headless) | `lib/services/shop.ts` | `getProdukte()`, `getProdukt()` → Storefront API. `starteCheckout()` → `cartCreate` und Weiterleitung auf `checkoutUrl`. Der Browser-Warenkorb in `lib/warenkorb.ts` wird zum Shopify-Cart; `handle` und `id` der Produkte entsprechen schon den Shopify-Feldern. |
| **Buchungs-Backend** | `lib/services/buchung.ts` | `getHalle()`, `getBelegung()`, `getWorkshops()`, `sendeBuchung()` → Endpunkte des eigenen Backends. Die Regeln (Wochenrabatt, Mindestteilnehmer, Storno) wandern dorthin. |
| **n8n** | `app/api/formulare/[formular]/route.ts` | Schon angebunden: Die Route leitet Formulare serverseitig an den Webhook weiter. Es fehlt nur die URL. |
| Inhalte | `lib/services/inhalte.ts` | Community-Projekte und FAQ → CMS oder Backend |

### n8n-Webhook einstellen

In Vercel unter *Settings → Environment Variables* (lokal in `.env.local`, Vorlage: `.env.example`):

```
N8N_WEBHOOK_WARTELISTE=https://…/webhook/warteliste
N8N_WEBHOOK_KONTAKT=https://…/webhook/kontakt
```

Ohne diese Werte laufen die Formulare im Demo-Modus: Sie zeigen die Danke-Seite, speichern aber nichts.
Mit Wert schickt die Route ein JSON per `POST` an n8n – alle Antworten plus `formular`, `quelleSeite`
und `gesendetAm`. Die Webhook-URL bleibt auf dem Server und ist im Browser nicht sichtbar.

## Mitgliederbereich „Mein Camp“

Plan: `docs/02-mitgliederbereich.md`. In der Demo ist das Beispiel-Mitglied Jule eingeloggt.
Oben in der Demo-Leiste lässt sich die Ansicht zwischen **Gast**, **Konto** (kostenlos) und **Mitglied** (Abo)
umschalten. Alles, was man ändert, liegt nur im Browser (`localStorage`); „Demo zurücksetzen“ steht unter
Mitgliedschaft. Unveränderte Beispieldaten frischen sich nach drei Tagen selbst auf, damit Termine nicht veralten.

### Aufbau

| Baustein | Datei | Aufgabe |
| --- | --- | --- |
| Datenmodell | `lib/types.ts` (ab „MITGLIEDERBEREICH“) | `KontoZustand`, Fahrzeuge, Projekt, Budget, Events, Ereignisse – für Website, App und Cockpit |
| Rollen und Rechte | `lib/rechte.ts` | Rollen `gast`, `konto`, `mitglied`, `admin`; eine Matrix, abgefragt mit `darf(rolle, recht)` |
| Konto-Zustand | `lib/mein-camp/store.ts` | Steht in der Demo für das Backend; Komponenten lesen mit `useKonto()` / `useRolle()` |
| Aktionen | `lib/services/mitglieder.ts` | Jede Funktion ist ein späterer API-Aufruf, prüft das Recht und meldet ein Ereignis |
| Ereignisse | `lib/services/ereignisse.ts` → `app/api/ereignisse/route.ts` | Protokoll und Weiterleitung an n8n |
| Bildanalyse, Fahrzeugdaten | `lib/services/analyse.ts` → `app/api/analyse/[art]/route.ts` | Weiterleitung an n8n, sonst simuliert |
| Cockpit | `lib/services/cockpit.ts` | Alle Admin-Aktionen; Oberfläche unter `/cockpit` (siehe Abschnitt Camp-Cockpit) |

Zum Andocken ans Backend werden die Funktionskörper in `lib/services/mitglieder.ts` und `cockpit.ts` durch
API-Aufrufe ersetzt und `useKonto()` liest den Zustand vom Server. Oberflächen und Ereignisse bleiben.

Freigaben, gekauftes Werkzeug und Antworten kommen aus dem Cockpit (siehe unten). Zwei gestrichelte „Demo“-Schalter
im Mitgliederbereich springen direkt dorthin. Sebs automatische Chat-Antworten sind simuliert und abschaltbar.

### Wirkung auf die restliche Seite

- **Fachshop:** filtert nach dem aktiven Fahrzeug aus der Garage, Mitglieder sehen 10 % Rabatt.
- **Buchung:** bietet nur Werkstattbuchten an, in die das Fahrzeug passt; Mitglieder buchen 60 statt 30 Tage im Voraus;
  ohne Abo kommt die Werkzeugpauschale dazu.
- **Warenkorb:** Lieferung an die gebuchte Werkstattbucht; der Kauf landet im Projekt-Budget (in der Demo beim Klick auf „Zur Kasse“).
- **Community-Galerie:** zeigt eigene Projekte, solange sie öffentlich sind.

### Webhooks des Mitgliederbereichs

Alle URLs sind Umgebungsvariablen (Vorlage: `.env.example`) und bleiben auf dem Server. Ohne Wert wird simuliert.

**Analyse – n8n antwortet mit JSON**

| Variable | Die Website schickt | n8n antwortet |
| --- | --- | --- |
| `N8N_WEBHOOK_FAHRZEUGSCHEIN` | `multipart/form-data` mit `foto` (Bild, max. 8 MB) und `art=fahrzeugschein` | `{ "hsn": "4136", "tsn": "BGT" }` – nur Felder 2.1 und 2.2; das Foto danach verwerfen |
| `N8N_WEBHOOK_FAHRZEUGDATEN` | JSON `{ "hsn": "4136", "tsn": "BGT" }` | `{ "gefunden": true, "hersteller", "modell", "motor", "leistungKw", "kraftstoff", "typ" }`; `typ` ist `sprinter`, `crafter`, `ducato`, `transit`, `daily` oder `anderes`. Unbekannt: `{ "gefunden": false }` |
| `N8N_WEBHOOK_BELEG` | `multipart/form-data` mit `foto` und `art=beleg` | `{ "haendler", "datum": "JJJJ-MM-TT", "betrag": 86.4, "positionen": [{ "name", "betrag" }] }` |

Die Website speichert keines dieser Fotos; die Route reicht sie nur durch.

**PIN-Freigabe für KI-Abfragen**

Die beiden Bildanalysen (Fahrzeugschein, Beleg) kosten pro Abfrage Geld beim KI-Dienst. Deshalb muss jede einzelne
Abfrage mit einer PIN freigegeben werden:

- Die PIN steht nur in der Umgebungsvariable `KI_PIN` (Vercel → Settings → Environment Variables, lokal `.env.local`).
  Sie steht nicht im Code und wird nicht an den Browser ausgeliefert.
- Der Browser schickt die eingegebene PIN im Header `x-freigabe-pin` mit; geprüft wird in
  `lib/server/freigabe.ts`. Ohne gültige PIN wird der Webhook nicht aufgerufen. Die PIN wird nirgends
  zwischengespeichert, also bei jeder Abfrage neu verlangt.
- Nach fünf falschen Versuchen ist der Absender 15 Minuten gesperrt (einfacher Schutz pro Server-Instanz).
- Ist ein Bild-Webhook gesetzt, aber `KI_PIN` fehlt, bleibt die Bildanalyse gesperrt.
- Die Fahrzeugdaten-Abfrage über HSN/TSN ist keine KI-Abfrage und braucht keine PIN.

Nach dem Ändern von `KI_PIN` oder einem Webhook in Vercel muss neu deployt werden, damit der Wert gilt.

**Ereignisse – n8n muss nur mit 2xx antworten**

Jede Aktion schickt per `POST` ein JSON dieser Form:

```json
{
  "quelleSeite": "website",
  "id": "ev-…",
  "typ": "event.vorgeschlagen",
  "zeit": "2026-11-17T18:30:00.000Z",
  "akteur": { "id": "m-jule", "name": "Jule", "rolle": "mitglied" },
  "daten": { "titel": "Van-Kino", "datum": "2026-12-04", "von": "20:00", "bis": "22:30", "ort": "…", "maxPersonen": 25 }
}
```

| Variable | Ereignistypen | Gedacht für |
| --- | --- | --- |
| `N8N_WEBHOOK_EVENTS` | `event.vorgeschlagen`, `event.freigegeben`, `event.abgelehnt`, `event.angemeldet`, `event.abgemeldet` | Nachricht an Seb bzw. an die Community |
| `N8N_WEBHOOK_SUPPORT` | `support.nachricht`, `support.hilferuf`, `support.videotermin`, `support.beantwortet` | Nachricht an Seb, Zeitmessung (`bearbeitungszeitSek`) |
| `N8N_WEBHOOK_WERKZEUG` | `werkzeug.gewuenscht`, `werkzeug.gekauft` (mit `benachrichtigt`: Liste der Mitglieder) | Auswertung, „Dein Wunsch ist da!“ |
| `N8N_WEBHOOK_ABO` | `abo.abgeschlossen`, `abo.pausiert`, `abo.fortgesetzt`, `abo.gekuendigt` | Buchhaltung und CRM |
| `N8N_WEBHOOK_EREIGNISSE` | alle übrigen und alle Gruppen ohne eigenen Webhook: `konto.*`, `fahrzeug.*`, `projekt.*`, `buchung.*`, `hilfe.*` | Sammel-Webhook |

Die Liste aller Typen steht als `EreignisTyp` in `lib/types.ts`.

## Camp-Cockpit (Sebs Verwaltungsbereich)

Plan: `docs/03-verwaltung.md`. In der Demo-Leiste oben auf **„Als Seb ansehen“** klicken. Ohne diesen Schalter zeigt
`/cockpit` nur „Nur fürs Camp-Team“. Am Handy liegt die Navigation unten: Heute, Support, Buchungen, Mehr.

### Ein Datenstand für alles

Das Cockpit hat einen eigenen Speicher eingeführt, den jetzt auch Website und Mitgliederbereich lesen:

| Baustein | Datei | Aufgabe |
| --- | --- | --- |
| Camp-Zustand | `lib/camp/store.ts` | `CampZustand` (Halle, Buchungen, Workshops, Preise, Inhalte, Konten, Medien). Hooks `useCamp()`, `usePreise()`, `usePhasen()`, `useAdmin()` |
| Auswertungen | `lib/camp/auswertung.ts` | Reine Funktionen: Auslastung, Umsatz, Abo-Zahlen, Antwortzeit, Wunsch-Auswertung, Konflikte, CSV |
| Cockpit-Aktionen | `lib/services/cockpit.ts` | Alles, was Seb tut. Jede Funktion prüft ein Admin-Recht und meldet ein Ereignis |
| Öffentliche Schreibzugriffe | `lib/services/camp.ts` | Neue Buchung, Workshop-Reservierung, Anfrage – landen im Cockpit |
| Live-Inhalte | `components/live/` | `<T k="…" />` für Texte, dazu Workshops, Leistungen, FAQ, Kontakt, Rechtstexte, Hallenfotos |

Die Seiten rendern auf dem Server weiter mit den Beispieldaten aus `lib/daten/`. Im Browser übernehmen die
Live-Komponenten den Stand aus dem Camp-Zustand. Deshalb wirkt alles, was Seb ändert, **sofort im selben Browser**
auf Website und Mitgliederbereich – auch in einem zweiten Fenster. Dauerhaft gespeichert wird noch nichts:
Der Stand liegt in `localStorage` (`cc-camp`, `cc-mein-camp`), unveränderte Beispieldaten frischen sich nach drei
Tagen auf, „Cockpit zurücksetzen“ steht unter Inhalte → Community.

Das Beispiel-Mitglied Jule behält ihr eigenes Konto (`lib/mein-camp/store.ts`). Events, ihr Chat und ihre Wünsche
liegen dort; das Cockpit führt beides zusammen und schreibt Änderungen, die Jule betreffen, in ihr Konto zurück
(Benachrichtigung inklusive).

### Später: Backend andocken

Im Plan vorgeschlagen ist Supabase mit Region EU (Datenbank, Login, Dateispeicher). Getauscht wird dann nur:

- `lib/camp/store.ts` und `lib/mein-camp/store.ts`: Zustand vom Server laden statt aus `localStorage`
- die Funktionskörper in `lib/services/cockpit.ts`, `camp.ts` und `mitglieder.ts`: API-Aufrufe statt `setCamp`/`setKonto`
- `useAdmin()` / „Als Seb ansehen“: echtes Login mit der Rolle `admin`
- `mediumHochladen()` und `verkleinere()`: Upload in den Dateispeicher, im Datensatz steht dann die URL

Weitere Rollen (z. B. Aushilfe) lassen sich in `lib/rechte.ts` ergänzen; das Cockpit blendet Bereiche allein über
`darf(rolle, recht)` ein.

### Was im Cockpit simuliert ist

- Kennzahlen, Konten, Support-Verläufe und Shop-Bestellungen sind Beispieldaten. Umsatz zählt nur Buchungen von Werkstattbuchten.
- Der Shop-Überblick liest nicht aus Shopify; der Knopf führt auf `admin.shopify.com`.
- „Nachricht an alle“ bei Absagen, Freigaben und gekauftem Werkzeug erzeugt ein Ereignis für n8n. Echte Mails oder
  Pushes verschickt erst der n8n-Workflow.
- Sebs automatische Chat-Antworten im Mitgliederbereich lassen sich im Support-Postfach abschalten.

### Ereignisse aus dem Cockpit

Gleiche Form wie oben, `akteur.rolle` ist `admin`. Zusätzliche Webhooks: `N8N_WEBHOOK_WORKSHOPS` (`workshop.*`) und
`N8N_WEBHOOK_BUCHUNGEN` (`buchung.*`, `sperrzeit.*`); alles Übrige geht an `N8N_WEBHOOK_EREIGNISSE`.

| Ereignistypen | Auslöser |
| --- | --- |
| `buchung.angelegt`, `buchung.verschoben`, `buchung.storniert`, `sperrzeit.gesetzt`, `sperrzeit.entfernt` | Belegungskalender |
| `workshop.angelegt`, `workshop.geaendert`, `workshop.abgesagt` (mit `benachrichtigt`: E-Mails), `workshop.reserviert` | Workshops |
| `event.freigegeben`, `event.abgelehnt` (mit `begruendung`), `event.geaendert` | Events |
| `werkzeug.status`, `werkzeug.gekauft` (mit `benachrichtigt`), `werkzeug.angelegt` | Wünsche, Halle |
| `support.beantwortet` (mit `bearbeitungszeitSek`), `abo.pausiert` / `abo.fortgesetzt` / `abo.gekuendigt` (mit `vonHand`), `mitglied.notiz` | Support, Mitglieder |
| `halle.geaendert`, `preise.geaendert`, `inhalt.geaendert`, `medium.hochgeladen`, `medium.entfernt`, `projekt.ausgeblendet` | Halle, Inhalte |
| `anfrage.eingegangen`, `anfrage.status` | Warteliste und Kontakt |

### App

Die App nutzt später dieselben Datentypen (`lib/types.ts`), Rechte (`lib/rechte.ts`) und Endpunkte wie die Website:
Shopify für den Shop, das Backend für Buchungen, Konten und alles aus „Mein Camp“.

## Design

Grundlage ist das Designsystem „Camp & Camper“. Die Tokens stehen in `app/globals.css`:
Werkstatt-Dunkel als Standard, `.buehne` (Sonnengelb) für Formulare und Buchungsschritte, `.hell` (Creme)
für Rechtstexte. Schriften (Anton, Barlow, Barlow Semi Condensed) liegen lokal in `app/fonts/`,
die Bildmarke in `public/logo.png`. Statt Fotos gibt es gezeichnete Grafiken (`components/Van.tsx`,
`components/HeroGrafik.tsx`, `components/werkstatt/Hallenplan.tsx`).

## Deployment

GitHub → Vercel: Jeder Push erzeugt eine Vorschau, der Hauptzweig geht live. Die Seite ist per
`robots` auf „nicht indexieren“ gestellt, solange sie eine Demo ist (`app/layout.tsx`).

## Vor dem echten Start zu ersetzen

- Rechtstexte (Impressum, Datenschutz, AGB, Widerruf, Werkstattordnung)
- Kontaktdaten und Öffnungszeiten in `lib/daten/site.ts`
- Wortmarke als Datei (bisher steht der Name als schlichtes Label neben der Bildmarke)
- Echter Hallengrundriss, Preise, Werkzeugbestand
- `robots` in `app/layout.tsx` freigeben
- Abo-Preis, Werkzeugpauschale, Rabatt und Buchungsfenster in `lib/daten/abo.ts` (im Plan noch offen)
- Echte Anmeldung: Bisher gibt es kein Login, Mitgliederbereich und Cockpit sind eine Demo im Browser.
  Vor dem Start muss `/cockpit` serverseitig geschützt werden – der Schalter „Als Seb ansehen“ ist kein Schutz.
