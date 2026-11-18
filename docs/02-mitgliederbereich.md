# Camp & Camper – Plan Mitgliederbereich

Stand: 17.11.2026 · baut auf [01-website.md](01-website.md) auf

## Ziel

Ein Camper-Ausbau dauert Monate. Der Mitgliederbereich ist der Ort, an dem dieser Weg stattfindet: Fahrzeug anlegen, Projekt planen und dokumentieren, Hilfe von Seb und der Community bekommen, sich zu Events treffen. Für Seb bringt das wiederkehrende Kunden, planbare Einnahmen über ein Abo und mehr Umsatz im Fachshop.

Für die Demo läuft alles mit Beispieldaten und einem Beispiel-Mitglied. Alles, was später ein externer Dienst übernimmt (Bildanalyse, Fahrzeugdaten, Benachrichtigungen), wird schon jetzt über n8n angebunden und ist austauschbar.

## Kontostufen

| | Gast | Kostenloses Konto | Mitglied (Abo) |
| --- | --- | --- | --- |
| Bucht buchen | ja + Werkzeugpauschale | ja + Werkzeugpauschale | ja, **Werkzeug inklusive** |
| Meine Garage, Projekt, Bautagebuch | – | ja | ja |
| Events vorschlagen und teilnehmen | – | ja | ja |
| Hilfe-Börse | – | ja | ja |
| Support von Seb | – | – | ja |
| Früheres Buchungsfenster | – | – | ja |
| Rabatt im Fachshop | – | – | ja |
| Werkzeug wünschen | – | – | ja |

**Abo:**

- Ist in der Demo von Anfang an sichtbar. Es ist ein Verkaufsargument und bringt Seb regelmäßige Einnahmen.
- Monatlich kündbar, mit Kündigungsbutton (Pflicht für online abgeschlossene Abos in Deutschland).
- **Pausieren** statt kündigen, z. B. im Winter oder bei einer Projektpause.
- Wer fertig ist und kündigt, behält sein kostenloses Konto und bleibt in der Community.
- Beispielwerte für die Demo: Abo 39 €/Monat, Werkzeugpauschale 10 €/Tag. Ab vier Tagen in der Halle pro Monat lohnt sich das Abo.

## Funktionen

### 1. Meine Garage

- **Mehrere Fahrzeuge** pro Konto, eines davon ist das aktive.
- **Anlegen über HSN/TSN:** abtippen oder **Fahrzeugschein fotografieren**. Eine Bildanalyse liest nur die Felder 2.1 (HSN) und 2.2 (TSN) aus. Das Foto wird nicht gespeichert, weil Name, Adresse und Fahrgestellnummer darauf stehen.
- Die Schlüsselnummer liefert Hersteller, Modell, Motor, Leistung und Kraftstoff. Quelle ist entweder das öffentliche KBA-Verzeichnis (halbjährliche Liste) oder später eine kommerzielle Schnittstelle.
- **Zusatzfragen**, weil die KBA-Daten dafür nicht reichen: Radstand, Dachhöhe, Länge, Schiebetür, Fenster, Baujahr, aktueller Ausbaustand.
- **Manuelle Eingabe** als Rückfallebene, z. B. bei HSN/TSN 0000 (Importe, Oldtimer, stark umgebaute Fahrzeuge).
- **Wirkung überall:** Der Shop zeigt passende Teile, die Buchung bietet nur passende Buchten an (Höhe, Länge), und Empfehlungen richten sich nach Fahrzeug und Ausbaustand.

### 2. Projekt-Planer und Bautagebuch

- Ein Projekt pro Fahrzeug.
- **Phasen:** Planung → Dämmung → Elektrik → Wasser/Gas → Möbel → Finish, jeweils mit Checklisten-Vorlagen von Seb.
- **Stückliste → Warenkorb:** Die Materialliste einer Phase lässt sich mit einem Klick bestellen, auf Wunsch direkt an die gebuchte Bucht geliefert.
- **Budget:** geplant gegen ausgegeben, je Phase und gesamt.
  - Shop-Käufe werden automatisch eingetragen.
  - Fremde Käufe: **Beleg fotografieren**, die Bildanalyse liest Händler, Datum, Betrag und Positionen aus. Oder von Hand eintragen.
- **Bautagebuch mit Fotos** pro Schritt.
- **Sichtbarkeit:** Projekte sind öffentlich und erscheinen in der Community-Galerie, mit Link zum Instagram-Profil. Ein **Privat-Knopf** macht das Projekt privat.
- Beim Foto-Upload kommt ein Hinweis, Kennzeichen und Gesichter vor dem Veröffentlichen zu prüfen.

### 3. Support von Seb (nur Mitglieder)

- **Projekt-Chat mit Fotos:** Seb sieht dabei sofort Fahrzeug, Phase und bisherige Bilder.
- **„Ich komm nicht weiter“-Knopf** während einer laufenden Buchung: Seb sieht, in welcher Bucht jemand Hilfe braucht.
- **Video-Termin** buchbar.
- **Keine Zeitbegrenzung** zum Start. Erst Vertrauen aufbauen, dann entscheiden.
- **Im Hintergrund messen:** Anzahl der Anfragen und Bearbeitungszeit, damit eine spätere Entscheidung auf Zahlen beruht.
- **Klare Grenze:** Gas und 230 V werden nicht aus der Ferne geklärt. Dafür bucht man einen Platz bzw. eine Beratung vor Ort. Das wird im Chat deutlich angezeigt.

### 4. Community

**Events:**

- Mitglieder schlagen selbst Events vor (z. B. Grillabend) mit Datum, Uhrzeit, Ort in der Halle und Höchstzahl an Personen.
- Seb prüft nur, ob der Zeitpunkt passt, und gibt **von Hand** frei.
- Freigegebene Events sind **fix**. Es gibt keine Mindestteilnehmerzahl, auch nicht bei Sebs eigenen Events.
- Alle mit Konto können sich anmelden.
- Jedes Event hat eine **verantwortliche Person** und eine **Obergrenze** je nach Platz.
- Es gilt eine **Event-Ordnung**: Maschinen aus, Ruhezeiten, Alkohol nur ohne Werkzeug.
- Seb kann eigene Events anlegen.

**Hilfe-Börse:**

- Gesuche und Angebote („Wer hilft mir Samstag beim Dachfenster?“).
- Hinweis: Hilfe unter Mitgliedern ist privat und nicht im Auftrag von Seb. Gas und 230 V sind ausgenommen.

### 5. Werkzeugwünsche (nur Mitglieder)

- Mitglieder wünschen sich **einzeln** Werkzeug mit kurzer Begründung.
- **Nicht öffentlich und kein Voting:** Andere Mitglieder sehen die Wünsche nicht.
- Bestätigung an das Mitglied: „Danke, das ist kein Kaufversprechen.“
- Seb sieht eine **Auswertung**: welche Werkzeuge wie oft gewünscht wurden, von wem und wann.
- Wird etwas gekauft, bekommen alle, die es sich gewünscht haben, eine Nachricht: „Dein Wunsch ist da!“

### 6. Seb-Cockpit

Alles, was Mitglieder tun, landet bei Seb: Event-Freigaben, Support-Anfragen, Werkzeugwünsche, Buchungen, Abos, Projekte.

- **Jetzt:** nur die Infrastruktur, also Rollen und Rechte (Mitglied, Admin), Datenmodell, Ereignisse und Benachrichtigungen für alle Aktionen oben.
- **Später:** die eigentliche Oberfläche (am besten auch in der App), sobald alle Funktionen stehen und klar ist, was Seb wirklich braucht.

## Anbindungen über n8n

Alle externen Dienste laufen über n8n-Webhooks mit konfigurierbaren URLs. So bleibt der KI-Anbieter austauschbar, und die Website hängt nicht direkt an einzelnen Diensten.

| Auslöser | Was n8n macht |
| --- | --- |
| Fahrzeugschein-Foto | Bildanalyse per KI-Modell, gibt HSN/TSN zurück, verwirft das Foto |
| HSN/TSN | Fahrzeugdaten aus KBA-Liste oder externer Schnittstelle |
| Beleg-Foto | Bildanalyse per KI-Modell, gibt Händler, Datum, Betrag und Positionen zurück |
| Event vorgeschlagen / freigegeben | Benachrichtigung an Seb bzw. an die Community |
| Support-Anfrage, „Ich komm nicht weiter“ | Benachrichtigung an Seb, Zeitmessung |
| Werkzeugwunsch / Werkzeug gekauft | Eintrag in die Auswertung bzw. Nachricht an die Wünschenden |
| Abo abgeschlossen / pausiert / gekündigt | Weiterleitung an Buchhaltung und CRM |
| Warteliste | wie in 01-website.md |

## Daten und Datenschutz

- Fahrzeugschein-Fotos werden nie gespeichert, nur die ausgelesenen Nummern.
- Belege und Budget sind immer privat, auch wenn das Projekt öffentlich ist.
- Fotos und Daten werden in der EU gespeichert.
- Öffentliche Projekte zeigen nur, was das Mitglied freigibt; der Privat-Knopf wirkt sofort.

## Demo für Seb

Für das Treffen zeigt die Demo ein eingeloggtes Beispiel-Mitglied mit Abo, zwei Fahrzeugen und einem laufenden Projekt mitten in der Elektrik-Phase. Bildanalyse und Benachrichtigungen werden simuliert, bis n8n angebunden ist.

## Offen

- Höhe von Abo und Werkzeugpauschale.
- Wie viel Support-Zeit Seb anbieten will.
- Welches KI-Modell die Bildanalyse übernimmt.
- KBA-Liste selbst pflegen oder kommerzielle Schnittstelle nutzen.
