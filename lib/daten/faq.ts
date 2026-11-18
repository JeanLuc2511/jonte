import type { FaqGruppe } from "@/lib/types";

/** Beispiel-Antworten. Verbindlich wird es erst mit den echten AGB und der Werkstattordnung. */
export const FAQ: FaqGruppe[] = [
  {
    titel: "Werkstattbucht",
    fragen: [
      { frage: "Was ist in der Werkstattbucht alles dabei?", antwort: "Dein Platz in der warmen Halle, Strom, Licht und Druckluft. Werkzeugwagen, Maschinen und Werkzeugwand sind für Mitglieder inklusive. Ohne Abo kommt eine Werkzeugpauschale von 10 € pro Tag dazu." },
      { frage: "Wie lange kann ich buchen?", antwort: "Von einer Stunde für eine schnelle Reparatur bis zu mehreren Wochen für den Komplettausbau. Ab sieben Tagen wird der Tagespreis günstiger." },
      { frage: "Passt mein Fahrzeug rein?", antwort: "Die Standardbuchten passen bis 6,00 m Länge, die XL-Buchten bis 7,40 m. Das Rolltor ist 3,50 m hoch – damit kommen auch Hochdächer mit Dachhaube durch." },
      { frage: "Kann mein Camper über Nacht stehen bleiben?", antwort: "Ja. Bei einer Buchung über mehrere Tage bleibt dein Fahrzeug in der Bucht stehen, die Halle ist nachts abgeschlossen. Übernachten in der Halle geht nicht." },
      { frage: "Muss ich Erfahrung mitbringen?", antwort: "Nein. Vom ersten Traum bis zum laufenden Umbau ist alles willkommen. Für die großen Maschinen gibt es eine kurze Einweisung, und im Camp ist immer jemand da, den du fragen kannst." },
    ],
  },
  {
    titel: "Werkzeug & Mitbringen",
    fragen: [
      { frage: "Was muss ich mitbringen?", antwort: "Dein Fahrzeug, dein Material, feste Schuhe und Arbeitskleidung. Schutzbrillen und Gehörschutz liegen bereit. Material bekommst du auch im Fachshop direkt in der Halle." },
      { frage: "Darf ich eigenes Werkzeug benutzen?", antwort: "Klar. Elektrowerkzeug sollte in ordentlichem Zustand sein, mit intaktem Kabel und Schutzhaube." },
      { frage: "Kann ich Werkzeug ausleihen und mit nach Hause nehmen?", antwort: "Nein. Das Werkzeug nutzt du in deiner Werkstattbucht, es bleibt aber in der Halle. So ist es für alle da, wenn sie es brauchen." },
      { frage: "Was passiert, wenn etwas kaputtgeht?", antwort: "Sag kurz Bescheid. Verschleiß gehört dazu und kostet dich nichts. Nur bei grober Fahrlässigkeit sprechen wir über den Schaden." },
    ],
  },
  {
    titel: "Versicherung & Haftung",
    fragen: [
      { frage: "Wie bin ich in der Halle versichert?", antwort: "Du arbeitest eigenverantwortlich an deinem eigenen Fahrzeug. Eine private Haftpflicht brauchst du, eine Unfallversicherung empfehlen wir. Die Halle selbst ist über die Betriebshaftpflicht abgesichert." },
      { frage: "Wer haftet für meinen Ausbau?", antwort: "Du. Camp & Camper stellt Platz, Werkzeug und Wissen, baut aber nicht für dich. Bei sicherheitsrelevanten Dingen wie Gas, Sitzen und Gurten sagen wir dir ehrlich, wo eine Fachabnahme nötig ist." },
      { frage: "Ist mein Fahrzeug in der Halle versichert?", antwort: "Dein Fahrzeug bleibt über deine eigene Kfz-Versicherung versichert. Die Halle ist abgeschlossen und alarmgesichert." },
    ],
  },
  {
    titel: "Buchung & Storno",
    fragen: [
      { frage: "Brauche ich ein Konto, um zu buchen?", antwort: "Nein, du kannst als Gast buchen. Mit dem kostenlosen Konto bekommst du Garage, Projekt-Planer und Community dazu. Als Mitglied ist das Werkzeug inklusive und Seb hilft dir persönlich." },
      { frage: "Kann ich stornieren oder verschieben?", antwort: "Bis 7 Tage vor Beginn kostenlos. Danach verschieben wir gern einmal auf einen freien Termin. Bei kurzfristiger Absage berechnen wir 50 %." },
      { frage: "Was ist, wenn ich länger brauche?", antwort: "Passiert fast allen. Wenn deine Werkstattbucht danach frei ist, verlängerst du einfach. Sonst ziehst du in eine andere um." },
    ],
  },
  {
    titel: "Konto & Mitgliedschaft",
    fragen: [
      { frage: "Was ist der Unterschied zwischen Konto und Mitgliedschaft?", antwort: "Das Konto ist kostenlos: Garage, Projekt-Planer, Bautagebuch, Events und Hilfe-Börse. Die Mitgliedschaft kostet 39 € im Monat und bringt Werkzeug inklusive, Support von Seb, ein früheres Buchungsfenster, 10 % im Fachshop und Werkzeugwünsche." },
      { frage: "Ab wann lohnt sich das Abo?", antwort: "Ohne Abo zahlst du 10 € Werkzeugpauschale pro Tag in der Halle. Ab vier Tagen im Monat ist das Abo günstiger." },
      { frage: "Kann ich pausieren oder kündigen?", antwort: "Beides, jederzeit in Mein Camp. Das Abo ist monatlich kündbar. Wenn dein Projekt ruht, pausierst du einfach. Nach einer Kündigung behältst du dein kostenloses Konto." },
      { frage: "Was passiert mit dem Foto vom Fahrzeugschein?", antwort: "Wir lesen daraus nur HSN und TSN, um dein Fahrzeug zu erkennen. Das Foto selbst wird nicht gespeichert." },
      { frage: "Wer sieht mein Projekt?", antwort: "Du entscheidest. Öffentliche Projekte erscheinen in der Community-Galerie, mit einem Klick ist dein Projekt wieder privat. Budget und Belege sieht außer dir niemand." },
    ],
  },
  {
    titel: "Workshops",
    fragen: [
      { frage: "Warum gibt es eine Mindestteilnehmerzahl?", antwort: "Ein Workshop lebt von der Runde und muss sich für die Leitung tragen. Deshalb findet er statt, sobald genug Leute dabei sind." },
      { frage: "Wann zahle ich?", antwort: "Erst wenn der Workshop sicher stattfindet. Mit deiner Anmeldung reservierst du nur deinen Platz." },
      { frage: "Was passiert, wenn nicht genug zusammenkommen?", antwort: "Ist die Mindestzahl 7 Tage vorher nicht erreicht, fällt der Termin aus. Du zahlst nichts und bekommst den nächsten Termin zuerst angeboten." },
    ],
  },
  {
    titel: "Fachshop & Gasprüfung",
    fragen: [
      { frage: "Kann ich Bestellungen in der Halle abholen?", antwort: "Ja. Alles aus dem Fachshop kannst du am Empfang abholen, große Teile wie Bodenplatten gibt es nur zur Abholung." },
      { frage: "Woher weiß ich, ob ein Teil in mein Fahrzeug passt?", antwort: "Im Fachshop filterst du nach deinem Fahrzeug. Fahrzeugspezifische Teile sind als „Passgenau“ markiert, alles andere passt in jeden Kastenwagen." },
      { frage: "Wer macht die Gasprüfung?", antwort: "Anerkannte Sachkundige prüfen an festen Tagen nach G 607 direkt am Prüfplatz. Du bekommst Prüfbescheinigung und Plakette." },
    ],
  },
];
