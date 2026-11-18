/**
 * SHOP-ADAPTER  →  später: Shopify Storefront API (headless)
 *
 * Alle Seiten und Komponenten holen Produkte ausschließlich über diese Funktionen.
 * Zum Andocken werden nur die Funktionskörper ersetzt:
 *   getProdukte()      → Storefront-Query `products` (Tags/Metafelder → `passend`)
 *   getProdukt(handle) → Storefront-Query `product(handle:)`
 *   starteCheckout()   → `cartCreate` + Weiterleitung auf `cart.checkoutUrl`
 * Benötigte Variablen stehen in `.env.example` (SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_TOKEN).
 */
import { PRODUKTE } from "@/lib/daten/produkte";
import type { Produkt, WarenkorbZeile } from "@/lib/types";

export async function getProdukte(): Promise<Produkt[]> {
  return PRODUKTE;
}

export async function getProdukt(handle: string): Promise<Produkt | undefined> {
  return PRODUKTE.find((p) => p.handle === handle);
}

export async function getAehnliche(produkt: Produkt, anzahl = 3): Promise<Produkt[]> {
  return PRODUKTE.filter((p) => p.kategorie === produkt.kategorie && p.id !== produkt.id).slice(0, anzahl);
}

export interface CheckoutErgebnis {
  /** In der Demo `null` – später die Shopify-Checkout-URL */
  checkoutUrl: string | null;
  demo: boolean;
}

export async function starteCheckout(zeilen: WarenkorbZeile[]): Promise<CheckoutErgebnis> {
  void zeilen;
  return { checkoutUrl: null, demo: true };
}
