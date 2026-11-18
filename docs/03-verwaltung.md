# Camp & Camper – Plan Verwaltungsbereich (Camp-Cockpit)

Stand: 18.11.2026 · baut auf [01-website.md](01-website.md) und [02-mitgliederbereich.md](02-mitgliederbereich.md) auf

## Ziel

Seb hat an einem Ort alles im Blick, was in der Halle, auf der Website und im Mitgliederbereich passiert, und pflegt selbst alle Inhalte, ohne Code anzufassen. Das Cockpit nutzt dasselbe Datenmodell, dieselben Rollen und Rechte (`lib/rechte.ts`) und dieselbe Service-Schicht wie Website und Mitgliederbereich. Das Fundament dafür liegt schon in `lib/services/cockpit.ts`.

Seb nutzt das Cockpit oft in der Halle, also am Handy. Gebaut wird trotzdem in der Reihenfolge PC → Tablet → Handy. Die Ansichten „Heute in der Halle“ und „Support“ müssen am Handy aber besonders gut funktionieren.

## Zugang

- Eigener Bereich unter `/cockpit`, nur mit der Rolle **Admin** („Camp-Team“).
- Später sind weitere Rollen möglich, z. B. Aushilfe mit eingeschränkten Rechten. Das Rechte-Modell ist dafür offen.
- In der Demo gibt es einen Schalter „Als Seb ansehen“, ohne echtes Login.

## Übersicht (Startseite des Cockpits)

- **Heute in der Halle:** welche Werkstattbuchten belegt sind, von wem und mit welchem Fahrzeug, plus anstehende Workshops und Events.
- **Zu erledigen:** offene Hilferufe („Ich komm nicht weiter“, ganz oben), unbeantwortete Support-Nachrichten, Event-Vorschläge zur Freigabe, neue Werkzeugwünsche, neue Wartelisten- und Kontaktanfragen.
- **Kennzahlen:** Auslastung der Buchten (Woche/Monat), Umsatz aus Buchungen, aktive/pausierte/gekündigte Abos, Workshop-Anmeldungen, Support-Anfragen und Antwortzeit.

## Bereiche

### 1. Buchungen und Halle

- Belegungskalender aller Buchten. Buchungen anlegen, verschieben und stornieren, auch für Leute ohne Konto (Telefon, Walk-in).
- Sperrzeiten setzen (Urlaub, Wartung, Events).
- **Halle pflegen:** Buchten (Maße, Ausstattung, Preise), Stationen und Werkbänke im Hallenplan, Werkzeugliste je Station. Neues Werkzeug lässt sich direkt mit Foto anlegen.
- Preise und Werkzeugpauschale pflegen.

### 2. Workshops und Events

- Workshops anlegen: Termin, Beschreibung, Preis, Mindest- und Höchstzahl, Absagefrist. Teilnehmerliste mit Kontakt.
- Bei Workshops ist sichtbar, ob die Mindestzahl erreicht ist; absagen mit automatischer Nachricht an alle.
- Event-Vorschläge der Mitglieder **freigeben oder ablehnen**, mit kurzer Begründung.
- Eigene Events anlegen. Die Event-Ordnung lässt sich bearbeiten.

### 3. Mitglieder und Abos

- Liste aller Konten mit Stufe (Konto, Mitglied), Abo-Status (aktiv, pausiert, gekündigt) und letzter Buchung.
- Detailansicht: Fahrzeuge, Projekt mit Phase und Bautagebuch, Buchungen, Support-Verlauf, interne Notizen von Seb.
- Abo von Hand pausieren oder beenden (z. B. auf Zuruf).

### 4. Support-Postfach

- Alle Projekt-Chats an einem Ort, jeweils mit Fahrzeug, Phase und letzten Fotos daneben.
- Hilferufe aus der Halle erscheinen sofort oben und mit Buchtnummer.
- Video-Termine im Blick.
- Die Antwortzeit wird im Hintergrund gemessen (siehe 02-mitgliederbereich.md).

### 5. Werkzeugwünsche

- Auswertung: welches Werkzeug wie oft, von wem, mit welcher Begründung.
- Status je Werkzeug: neu, geprüft, gekauft, abgelehnt. „Gekauft“ löst „Dein Wunsch ist da!“ an alle Wünschenden aus (Funktion `werkzeugGekauft` ist schon vorhanden).

### 6. Inhalte hochladen und pflegen

Hier pflegt Seb alles, was heute in `lib/daten/` steht:

- **Medien:** Fotos hochladen (auch direkt mit der Handy-Kamera), z. B. Hallenfotos, Galerie, Workshop-Bilder. Alles liegt in einer Medienbibliothek.
- **Texte:** Startseite, Leistungen, FAQ, Kontakt und Öffnungszeiten, Rechtstexte.
- **Phasen-Vorlagen:** Checklisten, Stücklisten und Budget-Richtwerte je Ausbauphase.
- **Community:** öffentliche Projekte prüfen und bei Bedarf ausblenden (z. B. sichtbare Kennzeichen).

### 7. Warteliste und Anfragen

- Einträge aus Warteliste und Kontaktformular mit Status (neu, kontaktiert, erledigt).
- Export als Tabelle.

### 8. Shop

- Produkte, Lager und Bestellungen pflegt Seb im **Shopify-Admin**. Das wird nicht nachgebaut.
- Das Cockpit zeigt nur einen Überblick (offene Bestellungen, Lieferungen an die Bucht) und verlinkt in den Shopify-Admin. In der Demo kommen die Werte aus den Beispieldaten.

## Daten und Speicherung

- **Demo:** Änderungen im Cockpit wirken sofort auf Website und Mitgliederbereich im selben Browser. Sie werden noch nicht dauerhaft gespeichert, genau wie heute der Mitgliederbereich.
- **Später:** Mit dem Buchungs-Backend kommen echte Speicherung, Login und Datei-Ablage dazu. Vorschlag: Supabase mit Region EU (Datenbank, Login und Dateispeicher in einem). Die Cockpit-Funktionen laufen dafür ausschließlich über `lib/services/`, damit nur deren Inhalt getauscht werden muss.
- Jede Cockpit-Aktion erzeugt ein Ereignis (`lib/services/ereignisse.ts`). Darüber benachrichtigt n8n Mitglieder und Seb (Mail, Push, später WhatsApp).

## Demo für Seb

Seb klickt auf „Als Seb ansehen“ und sieht ein lebendiges Cockpit: zwei belegte Buchten heute, ein offener Hilferuf aus Bucht 2, ein Event-Vorschlag (Grillabend) zur Freigabe, drei Werkzeugwünsche, zwei neue Wartelisten-Einträge. Gibt er den Grillabend frei, erscheint er im Mitgliederbereich. Markiert er ein Werkzeug als gekauft, bekommt das Beispiel-Mitglied „Dein Wunsch ist da!“.

## Offen

- Braucht Seb weitere Personen mit Zugang (Aushilfe, Partner)?
- Über welchen Kanal will Seb benachrichtigt werden (Mail, Push, WhatsApp)?
- Wann kommt das echte Backend, und mit welchem Anbieter?
