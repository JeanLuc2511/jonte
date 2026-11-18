# Camp & Camper – Plan Website

Stand: 17.11.2026 · Fortsetzung: [02-mitgliederbereich.md](02-mitgliederbereich.md)

## Ziel

Zum Treffen mit Seb am 20.11.2026 um 16 Uhr bringen wir eine klickbare Vision-Demo von camp-camper.de mit: die fertige Website für PC, Tablet und Handy. Danach folgt eine App, die per TestFlight auf dem Handy läuft. Seb ist noch in der Gründung, daher sind Inhalte, Preise, Projekte und der Hallenplan Beispiele.

- **Die Demo ist das Fundament.** Gefällt sie Seb, wird sie nicht neu gebaut, sondern Schritt für Schritt an echte Systeme angeschlossen.
- **Reihenfolge der Optimierung:** zuerst PC/Laptop, dann Tablet, dann Handy.
- **Ein Durchgang:** Claude Code baut die komplette Seite in einem Rutsch, nicht in Etappen.
- **Danach:** gemeinsam festlegen, was Mitglieder im Mitgliederbereich können.

## Ausgangslage

Seb hat heute eine einzelne Coming-soon-Seite und eine Typeform-Warteliste. Shop, Buchung und Inhalte gibt es noch nicht.

| Bereich | Befund |
| --- | --- |
| Website | WordPress 7.1.4 + Elementor 4.3.5, Hello-Theme. Wartungsmodus aktiv (HTTP 503, noindex), deshalb bei Google unsichtbar |
| Plugins | Borlabs Cookie, Google Tag Manager, WPForms (Bezahl-Add-on) |
| Rechtliches | Impressum und Datenschutz sind nicht verlinkt |
| Warteliste | Typeform mit 6 Fragen (Fahrzeug, Stand, Interessen, Start, Quelle, Herausforderung), **fragt keine Kontaktdaten ab** |
| Angebot laut Formular | Werkstattbucht, Fachshop, Beratung, Workshops, Gasprüfung; Testphase mit 3 Projekten |
| Standort | Rudolf-Diesel-Straße 20, 48157 Münster |
| Sebs Idee | Shopify-Shop + Slot-Buchung über die App Cowlendar |
| Design | Farben, Schriften und Logo-Bildmarke im Designsystem „Camp & Camper“: https://claude.ai/artifact/G5EsWj35vjLoV2sD3WCBoz |

## Architektur

Die Website wird als eigenes Frontend gebaut (headless). Shop, Buchung und Formulardaten kommen später aus spezialisierten Systemen, ohne dass die Seite neu gebaut werden muss.

```
                Besucher: PC, Tablet, Handy
                            │
                            ▼
         ┌───────────────────────────────────┐      ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
         │   Website (Headless-Frontend)     │        App (iOS/Android)
         │   Vercel, Deployment über GitHub  │      │ später, TestFlight     │
         │   Demo: alles mit Beispieldaten   │        nutzt dieselben Daten
         └───────────────────────────────────┘      └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
               │                │                │                │
               ▼                ▼                ▼                ▼
   ┌ ─ ─ ─ ─ ─ ─ ─ ┐  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ┐  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
      n8n              Shopify (headless)    Buchungs-Backend
   │ Warteliste,   │  │ Produkte,        │  │ Buchten, Workshops,        │
     Formulare,         Warenkorb,           Termine, Mitglieder,
   │ Benachricht.  │  │ Checkout         │  │ eigene Verwaltung          │
   └ ─ ─ ─ ─ ─ ─ ─ ┘  └ ─ ─ ─ ─ ─ ─ ─ ─ ┘  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘

   gestrichelt = wird nach der Demo angebunden
```

Für die Demo laufen alle Inhalte über Beispieldaten. Shopify übernimmt später Produkte und Checkout, das Buchungs-Backend Buchten, Workshops und Mitglieder, n8n die Formulare. Die App greift auf dieselben Daten zu.

## Seitenstruktur und Entscheidungen

Die öffentliche Seite führt jeden Besucher zu einem von drei Zielen: Werkstattbucht buchen, im Shop kaufen oder Mitglied werden.

| Seite | Was drauf ist | Worauf es ankommt |
| --- | --- | --- |
| Start | Die Vision auf einen Blick, Angebote, Community, Standort | Keine Hallenfotos vorhanden: Grafik, Illustration und Typografie statt Stockfotos |
| Werkstatt | Beispielhalle von oben, interaktiv | Buchten, Werkbänke und Stationen anfahrbar, darauf öffnet sich die Werkzeugliste; dazu eine Gesamtliste. Bei gewähltem Zeitraum sieht man freie Buchten und die anderen Fahrzeuge, die zur gleichen Zeit da sind. Soll zum Verweilen einladen, am Handy kompakter |
| Workshops | Termine mit Plätzen | Mindestteilnehmerzahl: Ein Workshop findet erst statt, wenn genug dabei sind |
| Fachshop | Material und Teile | Passend zu Sprinter, Crafter, Ducato/Boxer/Jumper, Transit, Daily |
| Community | Ausbauprojekte aus der Halle | Verweis auf die Instagram-Profile der Leute, eigener Van-Content |
| FAQ | Häufige Fragen | Versicherung, Haftung, Mitbringen, Storno |
| Warteliste | Formular im Typeform-Stil | Jetzt mit Kontaktdaten und Einwilligung; Daten laufen über einen n8n-Workflow |
| Rechtliches | Impressum, Datenschutz, AGB, Widerruf, Werkstattordnung | Platzhalter bis zu den echten Rechtstexten |

**Entschieden:**

- Gebucht werden kann auch ohne Konto (z. B. eine Stunde für eine Reparatur). Dabei wird erklärt, was ein Konto bringt.
- Werkzeugverleih zum Mitnehmen lassen wir vorerst weg; Werkzeug ist in der Bucht inklusive.
- Für Seb zeigen wir die „fertige“ Demo, nicht die Testphase.
- Begriff für den Arbeitsplatz: **Werkstattbucht**.

**Mindestteilnehmer bei Workshops (Vorschlag):** Wer sich anmeldet, reserviert einen Platz. Gezahlt wird erst, wenn die Mindestzahl erreicht ist. Wird sie bis 7 Tage vorher nicht erreicht, fällt der Workshop automatisch aus und niemand zahlt etwas. Die genaue Buchungslogik klären wir bei der Anbindung.

## Repo und Deployment

Der Code liegt im privaten Repo `JeanLuc2511/camp-camper` (vorher `jonte`, Historie am 18.11.2026 neu begonnen, nur noch Camp & Camper). Deployt wird über GitHub → Vercel; jeder Push auf `main` geht live.

## Ablauf und nächste Schritte

Bis zum Treffen am Freitag steht die Website. Alles Weitere besprechen wir danach.

1. Repo vorbereiten (erledigt).
2. Prompt in Claude Code geben, das die Seite in einem Durchgang baut und auf Vercel veröffentlicht.
3. Prüfen in der Reihenfolge PC → Tablet → Handy, Nacharbeiten gezielt beauftragen.
4. Treffen mit Seb: Demo zeigen, Fragen klären (Buchten, Preise, Werkzeug, Gasprüfung, wer die Website pflegt).
5. Danach: Mitgliederbereich festlegen, App bauen (TestFlight), Shopify, Buchungs-Backend und n8n anbinden.

**Offen:**

- Gibt es das zweite Repo noch, und auf welchem Account?
- Unter welcher URL zeigen wir Seb die Demo?
