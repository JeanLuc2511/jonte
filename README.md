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
| Cockpit | `lib/services/cockpit.ts` | Nur Infrastruktur: Freigaben, „Werkzeug gekauft“, Auswertungen, Support-Kennzahlen. Keine Oberfläche. |

Zum Andocken ans Backend werden die Funktionskörper in `lib/services/mitglieder.ts` und `cockpit.ts` durch
API-Aufrufe ersetzt und `useKonto()` liest den Zustand vom Server. Oberflächen und Ereignisse bleiben.

Zwei gestrichelte „Demo“-Schalter (Event freigeben, Werkzeug gekauft) rufen die Cockpit-Funktionen auf, damit sich
Sebs Seite vorführen lässt. Sebs Antworten im Chat sind simuliert.

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
- Echte Anmeldung: Bisher gibt es kein Login, der Mitgliederbereich ist eine Demo im Browser
