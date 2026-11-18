import type { Metadata } from "next";
import { Beispiel, Seitenkopf } from "@/components/Bausteine";
import { T } from "@/components/live/T";
import { ShopListe } from "@/components/shop/ShopListe";
import { FAHRZEUGE } from "@/lib/daten/fahrzeuge";
import { PRODUKT_KATEGORIEN } from "@/lib/daten/produkte";
import { getProdukte } from "@/lib/services/shop";
import type { FahrzeugId } from "@/lib/types";

export const metadata: Metadata = {
  title: "Fachshop",
  description: "Material und Teile für den Camper-Ausbau, passend zu Sprinter, Crafter, Ducato/Boxer/Jumper, Transit und Daily. Abholung direkt in der Halle.",
};

export default async function ShopSeite({ searchParams }: { searchParams: Promise<{ fahrzeug?: string }> }) {
  const [{ fahrzeug }, produkte] = await Promise.all([searchParams, getProdukte()]);
  const start = FAHRZEUGE.find((f) => f.id === fahrzeug)?.id as FahrzeugId | undefined;

  return (
    <>
      <Seitenkopf eyebrow="Fachshop" titel={<T k="shop.titel" />}>
        <p>
          <T k="shop.text" />
          {" "}<Beispiel>Beispielsortiment und -preise</Beispiel>
        </p>
      </Seitenkopf>
      <ShopListe produkte={produkte} kategorien={PRODUKT_KATEGORIEN} startFahrzeug={start} />
    </>
  );
}
