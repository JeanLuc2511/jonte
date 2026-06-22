# Jonte 🧱

Eine visuelle, kindgerecht-einfache **Schritt-für-Schritt-Aufbauanleitung für QUADRO-Klettergerüste**.
Du drehst das Gerüst in 3D mit dem Finger und klickst dich durch den Aufbau – bei jedem Schritt
**leuchten genau die Teile auf, die neu dazukommen**.

Es gibt **4 fertige Modelle**, jedes mit Rutsche:

| Modell | Beschreibung |
|---|---|
| **Mini** | Flacher Würfel, niedrige Plattform – für die Kleinsten. |
| **Kletterwürfel** | Klassischer Würfel mit Plattform und kurzer Rutsche. |
| **Turm** | Höherer Turm mit längerer Rutsche. |
| **Pool-Rutsche** | Plattform auf Poolrand-Höhe, Rutsche zeigt zum Pool. |

## Bedienung

- **1 Finger** (oder Maus): Gerüst drehen
- **2 Finger** (oder Mausrad): zoomen
- **Weiter / Zurück**: durch die Aufbauschritte blättern – die neuen Teile leuchten orange auf
- **⟳ oben rechts**: automatisch drehen · **⊕**: Ansicht zurücksetzen
- **Materialliste**: zeigt das gesamte Material des Modells

Die App ist **mobil-first** gebaut (zum Aufbauen im Garten am Handy oder iPad). Auf dem iPad/iPhone
lässt sie sich über *Teilen → Zum Home-Bildschirm* wie eine richtige App installieren.

## So teilst du den Link

Oben rechts auf **Teilen** tippen. Auf dem Handy öffnet sich das System-Teilen-Menü
(WhatsApp, Nachrichten, …); am Rechner wird der Link in die Zwischenablage kopiert.

Jeder Link öffnet direkt das gewählte Modell, z. B.:

```
https://jonte.vercel.app/build?modell=turm
```

Mögliche Modelle: `mini`, `wuerfel`, `turm`, `pool`.

## Technik

- [Next.js](https://nextjs.org) (App Router, TypeScript) · kein Backend, keine Datenbank
- [react-three-fiber](https://github.com/pmndrs/react-three-fiber) + [`@react-three/drei`](https://github.com/pmndrs/drei) für die 3D-Darstellung
- [Tailwind CSS](https://tailwindcss.com)
- Deployment auf [Vercel](https://vercel.com)

Die Aufbaulogik (Teile, Reihenfolge, Höhen) steckt in `lib/` und wird aus kompakten
Modell-Definitionen (`lib/models.ts`) generiert. Maße in `lib/constants.ts` lassen sich
nachmessen und anpassen – alle Höhenangaben rechnen sich dann automatisch um.

## Lokal starten

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Production-Build
```
