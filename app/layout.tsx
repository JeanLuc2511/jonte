import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/daten/site";

// Schriften liegen lokal in app/fonts – es wird nichts von Google nachgeladen.
const anton = localFont({
  src: "./fonts/anton-latin-400-normal.woff2",
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});
const barlow = localFont({
  src: [
    { path: "./fonts/barlow-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/barlow-latin-500-normal.woff2", weight: "500" },
    { path: "./fonts/barlow-latin-600-normal.woff2", weight: "600" },
    { path: "./fonts/barlow-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-barlow",
  display: "swap",
});
const barlowCondensed = localFont({
  src: [
    { path: "./fonts/barlow-semi-condensed-latin-500-normal.woff2", weight: "500" },
    { path: "./fonts/barlow-semi-condensed-latin-600-normal.woff2", weight: "600" },
    { path: "./fonts/barlow-semi-condensed-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: `${SITE.name} – ${SITE.claim}`, template: `%s · ${SITE.name}` },
  description: SITE.beschreibung,
  // Vision-Demo: bis zum echten Start nicht in Suchmaschinen
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#1E1409" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${anton.variable} ${barlow.variable} ${barlowCondensed.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#inhalt" className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50">
          Zum Inhalt
        </a>
        <Header />
        <main id="inhalt" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
