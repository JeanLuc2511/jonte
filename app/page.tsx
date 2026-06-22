import Link from "next/link";

import ModelPreview from "@/components/ModelPreview";
import { buildModel } from "@/lib/quadro";
import { MODELS } from "@/lib/models";

export default function Home() {
  return (
    <main className="safe-x mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col px-5 py-8 sm:px-8">
      <header className="safe-t anim-rise">
        <span
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest"
          style={{ borderColor: "var(--line)", color: "var(--muted)" }}
        >
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--accent)" }} />
          QUADRO Aufbau-Assistent
        </span>
        <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">
          Jonte
        </h1>
        <p className="mt-2 max-w-xl text-base leading-relaxed" style={{ color: "var(--muted)" }}>
          Wähle ein Modell, dreh es mit dem Finger in 3D und bau es Schritt für
          Schritt auf. Bei jedem Schritt leuchten genau die Teile auf, die neu
          dazukommen.
        </p>
      </header>

      <section className="mt-8 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
        {MODELS.map((model, idx) => {
          const built = buildModel(model);
          const teile = built.rods.length + built.connectors.length + built.plates.length + built.slide.length;
          return (
            <Link
              key={model.id}
              href={`/build?modell=${model.id}`}
              className="anim-rise group flex flex-col overflow-hidden rounded-2xl border transition-transform duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
              style={{
                background: "var(--panel)",
                borderColor: "var(--line)",
                animationDelay: `${0.05 + idx * 0.06}s`,
              }}
            >
              <div
                className="relative flex h-44 items-center justify-center"
                style={{
                  background:
                    "radial-gradient(420px 240px at 50% 18%, rgba(255,138,30,0.10), transparent 70%), #14161b",
                }}
              >
                <ModelPreview model={model} className="h-40 w-full px-6 transition-transform duration-300 group-hover:scale-[1.04]" />
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-xl font-bold">{model.name}</h2>
                  <span
                    className="shrink-0 text-sm font-semibold"
                    style={{ color: "var(--accent)" }}
                  >
                    ~{built.platformHeightCm} cm
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                  {model.blurb}
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <Tag>{teile} Teile</Tag>
                  <Tag>{built.steps.length} Schritte</Tag>
                  {model.slide && <Tag accent>mit Rutsche</Tag>}
                  <span
                    className="ml-auto inline-flex items-center gap-1 font-semibold transition-transform group-hover:translate-x-0.5"
                    style={{ color: "var(--text)" }}
                  >
                    Aufbauen
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <footer className="safe-b mt-8 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
        <p>
          ⚠︎ Aufbau und Belastungstest durch Erwachsene. In der Nähe von Wasser
          immer Aufsicht.
        </p>
        <p className="mt-1">
          Maße sind Schätzwerte — bei Bedarf am echten Gerüst nachmessen.
        </p>
      </footer>
    </main>
  );
}

function Tag({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 font-medium"
      style={{
        borderColor: accent ? "rgba(255,138,30,0.4)" : "var(--line)",
        color: accent ? "var(--accent)" : "var(--muted)",
        background: accent ? "rgba(255,138,30,0.08)" : "transparent",
      }}
    >
      {children}
    </span>
  );
}
