import type { Metadata } from "next";
import { Warenkorb } from "@/components/shop/Warenkorb";
import { getProdukte } from "@/lib/services/shop";

export const metadata: Metadata = { title: "Warenkorb" };

export default async function WarenkorbSeite() {
  const produkte = await getProdukte();
  return (
    <div className="seite py-12 lg:py-16">
      <p className="eyebrow">Fachshop</p>
      <h1 className="display-xl mt-6">Dein Warenkorb</h1>
      <div className="mt-10"><Warenkorb produkte={produkte} /></div>
    </div>
  );
}
