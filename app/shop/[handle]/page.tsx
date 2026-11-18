import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Beispiel } from "@/components/Bausteine";
import { IconHaken } from "@/components/Icons";
import { InDenWarenkorb } from "@/components/shop/InDenWarenkorb";
import { ProduktGrafik } from "@/components/shop/ProduktGrafik";
import { ProduktKarte, passendText } from "@/components/shop/ProduktKarte";
import { Preis } from "@/components/shop/Preis";
import { getAehnliche, getProdukt, getProdukte } from "@/lib/services/shop";

type Props = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  return (await getProdukte()).map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProdukt((await params).handle);
  return p ? { title: p.titel, description: p.kurz } : {};
}

export default async function ProduktSeite({ params }: Props) {
  const p = await getProdukt((await params).handle);
  if (!p) notFound();
  const aehnliche = await getAehnliche(p);

  return (
    <>
      <div className="seite py-8 lg:py-12">
        <nav aria-label="Brotkrumen" className="label flex flex-wrap gap-2 text-muted">
          <Link href="/shop" className="hover:text-display">Fachshop</Link>
          <span aria-hidden="true">/</span>
          <span>{p.kategorie}</span>
        </nav>
        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
          <ProduktGrafik kategorie={p.kategorie} nummer={p.id.replace("p-", "")} gross />
          <div>
            {p.badge && <span className="badge">{p.badge}</span>}
            <h1 className="heading-l mt-4">{p.titel}</h1>
            <p className="mt-3 font-condensed text-[15px] font-semibold uppercase tracking-wide text-accent">{passendText(p)}</p>
            <p className="lead mt-5">{p.beschreibung}</p>
            <ul className="mt-6 space-y-2">
              {p.details.map((d) => (
                <li key={d} className="flex gap-3"><IconHaken className="mt-0.5 shrink-0 text-display" width={20} height={20} /> {d}</li>
              ))}
            </ul>
            <div className="mt-8 border-t border-line pt-6">
              <p className="flex flex-wrap items-baseline gap-x-3">
                <Preis betrag={p.preis} gross />
                <span className="text-muted">{p.einheit ? `${p.einheit} · ` : ""}inkl. MwSt.</span>
                <Beispiel>Beispielpreis</Beispiel>
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <InDenWarenkorb produktId={p.id} titel={p.titel} variante="primary" />
                <Link href="/warenkorb" className="btn btn-outline">Zum Warenkorb</Link>
              </div>
              {p.abholbar && (
                <p className="mt-5 text-[15px] text-muted">
                  Abholung in der Halle möglich – liegt für dich am Empfang, wenn du in deine Werkstattbucht kommst.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {aehnliche.length > 0 && (
        <section className="border-t border-line">
          <div className="seite py-14">
            <h2 className="heading-l">Passt dazu</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {aehnliche.map((a) => <ProduktKarte key={a.id} p={a} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
