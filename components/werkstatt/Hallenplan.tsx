import { HALLE } from "@/lib/daten/halle";
import type { Belegung, Zone } from "@/lib/types";
import { VanOben } from "../Van";

interface Props {
  zonen: Zone[];
  /** Belegungen im gewählten Zeitraum */
  belegt?: Belegung[];
  /** Zeigt „frei" an den Buchten – nur sinnvoll, wenn ein Zeitraum gewählt ist */
  zeigeFrei?: boolean;
  auswahl?: string | null;
  hervorgehoben?: string | null;
  onAuswahl?: (id: string) => void;
  onHover?: (id: string | null) => void;
  className?: string;
}

const GELB = "#FDE58B";
const SAND = "#EED5C7";
const HOLZ = "#A38879";

/** Die Beispielhalle von oben. Ohne `onAuswahl` ist der Plan eine reine Grafik. */
export function Hallenplan({
  zonen, belegt = [], zeigeFrei = false, auswahl, hervorgehoben, onAuswahl, onHover, className,
}: Props) {
  const interaktiv = Boolean(onAuswahl);
  const proBucht = new Map<string, Belegung>();
  for (const b of belegt) if (!proBucht.has(b.buchtId)) proBucht.set(b.buchtId, b);

  return (
    <svg
      viewBox={`0 0 ${HALLE.breite} ${HALLE.hoehe}`} className={className}
      role={interaktiv ? "group" : "img"}
      aria-label="Hallenplan von oben: sechs Werkstattbuchten, Werkbänke, Holzwerkstatt, Metall-Ecke, Werkzeugwand, Gas-Prüfplatz und Lounge"
    >
      <defs>
        <pattern id="plan-raster" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="rgba(255,252,243,0.05)" strokeWidth="1" />
        </pattern>
        <pattern id="plan-schraffur" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0V10" stroke="rgba(253,229,139,0.16)" strokeWidth="2" />
        </pattern>
      </defs>

      {/* Hallenwand */}
      <rect x="20" y="20" width="1160" height="720" fill="#241a0e" />
      <rect x="20" y="20" width="1160" height="720" fill="url(#plan-raster)" stroke={HOLZ} strokeWidth="6" />

      {/* Rolltor links, Eingang rechts */}
      <path d="M20 352V428" stroke="#1E1409" strokeWidth="10" />
      <path d="M20 352V428" stroke={GELB} strokeWidth="4" strokeDasharray="10 7" />
      <path d="M1180 628V692" stroke="#1E1409" strokeWidth="10" />
      <path d="M1180 628V692" stroke={GELB} strokeWidth="4" />

      {/* Fahrgasse */}
      <path d="M40 390H860" stroke="rgba(253,229,139,0.28)" strokeWidth="2" strokeDasharray="22 16" />
      <path d="M52 390l22-12v24z" fill="rgba(253,229,139,0.5)" />
      <text x="96" y="378" className="plan-text" fontSize="15" fill={HOLZ}>Rolltor</text>
      <text x="470" y="378" className="plan-text max-sm:hidden" fontSize="15" fill={HOLZ} textAnchor="middle">Fahrgasse</text>
      <text x="1166" y="616" className="plan-text max-sm:hidden" fontSize="15" fill={HOLZ} textAnchor="end">Eingang</text>

      {zonen.map((z) => {
        const istBucht = z.typ === "bucht";
        const b = proBucht.get(z.id);
        const frei = istBucht && !b;
        const aktiv = auswahl === z.id || hervorgehoben === z.id;
        const stroke = aktiv ? GELB : istBucht ? (frei && zeigeFrei ? GELB : "rgba(253,229,139,0.45)") : "rgba(238,213,199,0.4)";
        const fill = aktiv
          ? "rgba(253,229,139,0.2)"
          : istBucht
            ? frei && zeigeFrei ? "url(#plan-schraffur)" : "rgba(255,252,243,0.03)"
            : "rgba(255,252,243,0.07)";
        const cx = z.x + z.w / 2;
        const quer = z.bucht?.ausrichtung === "quer";
        const status = istBucht
          ? b ? (b.gesperrt ? "gesperrt" : b.fahrzeug.spitzname) : zeigeFrei ? "frei" : `bis ${String(z.bucht!.maxLaengeM).replace(".", ",")} m`
          : null;

        return (
          <g
            key={z.id}
            className={interaktiv ? "plan-zone" : undefined}
            role={interaktiv ? "button" : undefined}
            tabIndex={interaktiv ? 0 : undefined}
            aria-pressed={interaktiv ? auswahl === z.id : undefined}
            aria-label={interaktiv ? `${z.name}${istBucht ? (b ? (b.gesperrt ? ", gesperrt" : `, belegt von ${b.fahrzeug.spitzname}`) : zeigeFrei ? ", frei" : "") : ""}` : undefined}
            onClick={interaktiv ? () => onAuswahl?.(z.id) : undefined}
            onKeyDown={interaktiv ? (e) => {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onAuswahl?.(z.id); }
            } : undefined}
            onMouseEnter={onHover ? () => onHover(z.id) : undefined}
            onMouseLeave={onHover ? () => onHover(null) : undefined}
            onFocus={onHover ? () => onHover(z.id) : undefined}
            onBlur={onHover ? () => onHover(null) : undefined}
          >
            <rect
              className="plan-flaeche" x={z.x} y={z.y} width={z.w} height={z.h}
              fill={fill} stroke={stroke} strokeWidth={aktiv ? 4 : 2}
              strokeDasharray={istBucht && !aktiv ? "14 8" : undefined}
            />
            <Dekor zone={z} />
            {b?.gesperrt && (
              <path d={`M${z.x + 14} ${z.y + 14}L${z.x + z.w - 14} ${z.y + z.h - 14}M${z.x + z.w - 14} ${z.y + 14}L${z.x + 14} ${z.y + z.h - 14}`} stroke={HOLZ} strokeWidth="3" pointerEvents="none" />
            )}
            {b && !b.gesperrt && (
              <g
                transform={quer
                  ? `translate(${z.x + 84} ${z.y + z.h / 2 + 50}) rotate(-90) scale(1 1.2)`
                  : `translate(${cx - 50} ${z.y + 62})`}
                pointerEvents="none"
              >
                <VanOben farbe={b.fahrzeug.farbe} />
              </g>
            )}
            {istBucht ? (
              <g pointerEvents="none">
                <text
                  x={z.x + 14} y={z.y + 42}
                  className="plan-kurz text-[30px] max-sm:text-[40px]" fill={aktiv || (frei && zeigeFrei) ? GELB : SAND}
                >
                  {z.kurz}
                </text>
                {status && (
                  <text
                    x={quer ? z.x + 14 : z.x + z.w - 14} y={quer ? z.y + z.h - 16 : z.y + 38}
                    textAnchor={quer ? "start" : "end"}
                    className="plan-text max-sm:hidden" fontSize="17"
                    fill={b ? "#fff" : zeigeFrei ? GELB : HOLZ}
                  >
                    {status}
                  </text>
                )}
              </g>
            ) : (
              <text
                x={cx} y={z.y + z.h / 2 + 11} textAnchor="middle" pointerEvents="none"
                className={`plan-kurz ${z.w < 130 ? "text-[24px] max-sm:text-[30px]" : "text-[28px] max-sm:text-[38px]"}`}
                fill={aktiv ? GELB : "#fff"}
              >
                {z.kurz}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Kleine Einrichtungsdetails, damit die Bereiche nach Werkstatt aussehen. */
function Dekor({ zone: z }: { zone: Zone }) {
  const s = "rgba(238,213,199,0.28)";
  const p = { fill: "none", stroke: s, strokeWidth: 2, pointerEvents: "none" as const };
  switch (z.id) {
    case "holz":
      return (
        <g {...p}>
          <rect x={z.x + 16} y={z.y + 16} width="84" height="54" />
          <path d={`M${z.x + 58} ${z.y + 16}v54`} />
          <rect x={z.x + 170} y={z.y + 16} width="84" height="30" />
          <rect x={z.x + 16} y={z.y + 140} width="238" height="34" />
          <path d={`M${z.x + 76} ${z.y + 140}v34M${z.x + 136} ${z.y + 140}v34M${z.x + 196} ${z.y + 140}v34`} />
        </g>
      );
    case "metall":
      return (
        <g {...p}>
          <rect x={z.x + 16} y={z.y + 16} width="60" height="36" />
          <circle cx={z.x + 222} cy={z.y + 38} r="20" />
          <path d={`M${z.x + 16} ${z.y + 132}h238`} strokeDasharray="6 6" />
        </g>
      );
    case "lounge":
      return (
        <g {...p}>
          <rect x={z.x + 24} y={z.y + 24} width="110" height="40" />
          <circle cx={z.x + 212} cy={z.y + 124} r="24" />
          <circle cx={z.x + 172} cy={z.y + 124} r="8" />
          <circle cx={z.x + 212} cy={z.y + 84} r="8" />
        </g>
      );
    case "shop":
      return (
        <g {...p}>
          <path d={`M${z.x + 16} ${z.y + 16}h238M${z.x + 16} ${z.y + 26}h238`} />
          <path d={`M${z.x + 60} ${z.y + 16}v10M${z.x + 110} ${z.y + 16}v10M${z.x + 160} ${z.y + 16}v10M${z.x + 210} ${z.y + 16}v10`} />
        </g>
      );
    case "wand":
      return (
        <g {...p}>
          <path d={`M${z.x + 12} ${z.y + z.h - 8}h${z.w - 24}`} strokeWidth="4" />
        </g>
      );
    case "gas":
      return <circle {...p} cx={z.x + z.w / 2} cy={z.y + 36} r="16" />;
    case "reste":
      return (
        <g {...p}>
          <rect x={z.x + 14} y={z.y + 14} width="36" height="36" />
          <rect x={z.x + 60} y={z.y + 14} width="36" height="36" />
        </g>
      );
    default:
      if (z.typ === "werkbank") {
        return <rect {...p} x={z.x + 8} y={z.y + 8} width={z.w - 16} height={z.h - 16} />;
      }
      return null;
  }
}
