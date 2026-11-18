"use client";

import { useState } from "react";
import { warenkorb } from "@/lib/warenkorb";
import { IconHaken } from "../Icons";

export function InDenWarenkorb({
  produktId, titel, variante = "outline", voll = false,
}: { produktId: string; titel: string; variante?: "primary" | "outline"; voll?: boolean }) {
  const [drin, setDrin] = useState(false);
  return (
    <button
      type="button" aria-label={`${titel} in den Warenkorb`}
      className={`btn btn-${variante} ${variante === "outline" ? "btn-klein" : ""} ${voll ? "w-full" : ""}`}
      onClick={() => {
        warenkorb.hinzu(produktId);
        setDrin(true);
        window.setTimeout(() => setDrin(false), 1800);
      }}
    >
      {drin ? <><IconHaken width={18} height={18} /> Liegt im Warenkorb</> : "In den Warenkorb"}
    </button>
  );
}
