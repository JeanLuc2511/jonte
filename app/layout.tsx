import type { Metadata, Viewport } from "next";
import "./globals.css";

const DESCRIPTION =
  "Dreh dein QUADRO-Klettergerüst in 3D mit dem Finger und bau es Schritt für Schritt auf. 4 Modelle, jedes mit Rutsche.";

export const metadata: Metadata = {
  metadataBase: new URL("https://jonte-black.vercel.app"),
  title: "Jonte – QUADRO Schritt für Schritt aufbauen",
  description: DESCRIPTION,
  applicationName: "Jonte",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Jonte",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png" }],
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Jonte",
    title: "Jonte – QUADRO Schritt für Schritt aufbauen",
    description: DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Jonte – QUADRO Aufbau in 3D" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jonte – QUADRO Schritt für Schritt aufbauen",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  other: { "mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: "#15171c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
