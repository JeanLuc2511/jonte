import Link from "next/link";

export default function NichtGefunden() {
  return (
    <div className="seite flex min-h-[60dvh] flex-col justify-center py-20">
      <p className="eyebrow">Seite nicht gefunden</p>
      <h1 className="display-xl mt-6">Hier steht kein Camper.</h1>
      <p className="lead mt-5 max-w-xl">Die Seite gibt es nicht oder sie ist umgezogen. In der Halle findest du alles wieder.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primary">Zur Startseite</Link>
        <Link href="/werkstatt" className="btn btn-outline">Zur Werkstatt</Link>
      </div>
    </div>
  );
}
