import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/daten/site";

/**
 * Bildmarke aus dem Designsystem. Die handgeschriebene Wortmarke liegt noch nicht
 * als Datei vor und wird laut Designsystem nicht nachgebaut – der Name steht
 * deshalb als schlichtes Label daneben.
 */
export function Logo({ groesse = 44 }: { groesse?: number }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label={`${SITE.name} – zur Startseite`}>
      <Image src={SITE.logo} alt="" width={groesse} height={groesse} priority className="rounded-full" />
      <span className="font-condensed text-[17px] font-bold uppercase leading-none tracking-[0.14em] text-ink">
        Camp <span className="text-display">&amp;</span> Camper
      </span>
    </Link>
  );
}
