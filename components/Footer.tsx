import Link from "next/link";
import { NAVIGATION, SITE } from "@/lib/daten/site";
import { RECHTSSEITEN } from "@/lib/daten/rechtliches";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-dunkel">
      <div className="seite grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-muted">
            Die DIY-Mietwerkstatt für Selbstausbauer in Münster. Du schraubst, wir stellen Halle, Werkzeug und Wissen.
          </p>
          <span className="badge mt-6">In Gründung</span>
        </div>
        <FooterSpalte titel="Im Camp">
          {NAVIGATION.map((n) => <FooterLink key={n.href} href={n.href}>{n.label}</FooterLink>)}
          <FooterLink href="/buchen">Buchen</FooterLink>
          <FooterLink href="/warteliste">Warteliste</FooterLink>
        </FooterSpalte>
        <FooterSpalte titel="Rechtliches">
          {RECHTSSEITEN.map((r) => <FooterLink key={r.slug} href={`/rechtliches/${r.slug}`}>{r.titel}</FooterLink>)}
        </FooterSpalte>
        <FooterSpalte titel="Hier findest du uns">
          <li className="text-muted">
            {SITE.adresse.strasse}<br />{SITE.adresse.plz} {SITE.adresse.ort}
          </li>
          <FooterLink href="/kontakt">Anfahrt &amp; Kontakt</FooterLink>
          <li>
            <a href={SITE.instagram.url} target="_blank" rel="noopener noreferrer" className="text-muted underline-offset-4 hover:text-display hover:underline">
              Instagram
            </a>
          </li>
        </FooterSpalte>
      </div>
      <div className="border-t border-line">
        <p className="seite py-5 text-[13px] text-muted">
          © {new Date().getFullYear()} {SITE.name} · Diese Seite ist eine Vision-Demo. Preise, Termine, Projekte und der Hallenplan sind Beispiele; es werden keine echten Buchungen oder Bestellungen ausgelöst.
        </p>
      </div>
    </footer>
  );
}

function FooterSpalte({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="label text-display">{titel}</h2>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-muted underline-offset-4 hover:text-display hover:underline">{children}</Link>
    </li>
  );
}
