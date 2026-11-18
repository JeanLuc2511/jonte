/** Linien-Icons nach Designsystem: 1,5 px Strich, eckige Enden, ohne Füllung. */
import type { SVGProps } from "react";

function Basis({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" {...props}
    >
      {children}
    </svg>
  );
}

type P = SVGProps<SVGSVGElement>;

export const IconPfeil = (p: P) => <Basis {...p}><path d="M4 12h15M13 6l6 6-6 6" /></Basis>;
export const IconKorb = (p: P) => <Basis {...p}><path d="M3 5h3l2 11h10l2-8H7" /><path d="M9 20h.01M17 20h.01" /></Basis>;
export const IconMenue = (p: P) => <Basis {...p}><path d="M3 7h18M3 12h18M3 17h18" /></Basis>;
export const IconZu = (p: P) => <Basis {...p}><path d="M5 5l14 14M19 5L5 19" /></Basis>;
export const IconHaken = (p: P) => <Basis {...p}><path d="M4 12.5l5 5L20 6.5" /></Basis>;
export const IconPlus = (p: P) => <Basis {...p}><path d="M12 5v14M5 12h14" /></Basis>;
export const IconMinus = (p: P) => <Basis {...p}><path d="M5 12h14" /></Basis>;
export const IconSuche = (p: P) => <Basis {...p}><path d="M10.5 17a6.5 6.5 0 100-13 6.5 6.5 0 000 13zM15.5 15.5L20 20" /></Basis>;
export const IconPin = (p: P) => <Basis {...p}><path d="M12 21s7-6.2 7-11.5a7 7 0 10-14 0C5 14.8 12 21 12 21z" /><path d="M12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /></Basis>;
export const IconInsta = (p: P) => <Basis {...p}><path d="M4 4h16v16H4z" /><path d="M12 15.500a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM17 7h.01" /></Basis>;
export const IconUhr = (p: P) => <Basis {...p}><path d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2" /></Basis>;
export const IconHalle = (p: P) => <Basis {...p}><path d="M3 21V9l9-5 9 5v12M3 21h18M8 21v-7h8v7" /></Basis>;
export const IconWerkzeug = (p: P) => <Basis {...p}><path d="M14 6l4-3 3 3-3 4-2-1-9 9-3-3 9-9z" /></Basis>;
export const IconLeute = (p: P) => <Basis {...p}><path d="M9 11a3 3 0 100-6 3 3 0 000 6zM3 20c0-3.3 2.7-5 6-5s6 1.7 6 5M16 11a3 3 0 100-6M17 15c2.4.4 4 2 4 5" /></Basis>;
export const IconBlitz = (p: P) => <Basis {...p}><path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" /></Basis>;
export const IconFlamme = (p: P) => <Basis {...p}><path d="M12 21c3.9 0 6-2.6 6-6 0-4-3-5-3-9-3 1-6 4.5-6 8-1 0-2-1-2-2-1 1.5-1 2.5-1 3.500C6 18.5 8.1 21 12 21z" /></Basis>;
export const IconFenster = (p: P) => <Basis {...p}><path d="M4 5h16v14H4zM12 5v14M4 12h16" /></Basis>;
export const IconHolz = (p: P) => <Basis {...p}><path d="M3 8h18v8H3zM7 8v8M12 8v8M17 8v8" /></Basis>;
export const IconTropfen = (p: P) => <Basis {...p}><path d="M12 3c3 4 6 7 6 11a6 6 0 01-12 0c0-4 3-7 6-11z" /></Basis>;
export const IconSchraube = (p: P) => <Basis {...p}><path d="M8 3h8v4H8zM10 7v14h4V7M10 11l4 2M10 15l4 2" /></Basis>;
export const IconSchicht = (p: P) => <Basis {...p}><path d="M12 4l9 4-9 4-9-4 9-4zM3 12l9 4 9-4M3 16l9 4 9-4" /></Basis>;
export const IconSchloss = (p: P) => <Basis {...p}><path d="M6 11h12v9H6zM8.5 11V7.5a3.5 3.5 0 017 0V11" /></Basis>;
export const IconKonto = (p: P) => <Basis {...p}><path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.5-6 8-6s8 2 8 6" /></Basis>;
export const IconKamera = (p: P) => <Basis {...p}><path d="M3 7h4l2-3h6l2 3h4v13H3z" /><path d="M12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" /></Basis>;
export const IconGlocke = (p: P) => <Basis {...p}><path d="M6 17V11a6 6 0 0112 0v6l2 2H4l2-2zM10 21h4" /></Basis>;
export const IconChat = (p: P) => <Basis {...p}><path d="M4 5h16v11H10l-5 4v-4H4z" /></Basis>;
export const IconKalender = (p: P) => <Basis {...p}><path d="M4 6h16v14H4zM4 10h16M8 3v5M16 3v5" /></Basis>;
export const IconListe = (p: P) => <Basis {...p}><path d="M9 6h11M9 12h11M9 18h11M4 6h1M4 12h1M4 18h1" /></Basis>;
export const IconStern = (p: P) => <Basis {...p}><path d="M12 3l2.7 6 6.3.6-4.8 4.3 1.5 6.300L12 17l-5.7 3.2 1.5-6.300L3 9.6 9.3 9z" /></Basis>;
export const IconVideo = (p: P) => <Basis {...p}><path d="M3 6h13v12H3zM16 10l5-3v10l-5-3" /></Basis>;
export const IconAuge = (p: P) => <Basis {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /></Basis>;
export const IconEuro = (p: P) => <Basis {...p}><path d="M18 6.500A7 7 0 107 17.500a7 7 0 0011 0M4 10h9M4 14h9" /></Basis>;
