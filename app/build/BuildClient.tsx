'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import InventorySheet from '@/components/InventorySheet';
import StepBar from '@/components/StepBar';
import TopBar from '@/components/TopBar';
import { totalChips } from '@/lib/inventory';
import { DEFAULT_MODEL_ID, modelById } from '@/lib/models';
import { buildModel } from '@/lib/quadro';

const Scene = dynamic(() => import('@/components/Scene'), {
  ssr: false,
  loading: () => <CanvasFallback />,
});

function CanvasFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center" style={{ background: 'var(--bg)' }}>
      <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--muted)' }}>
        <span className="h-3 w-3 animate-pulse rounded-full" style={{ background: 'var(--accent)' }} />
        3D wird geladen…
      </div>
    </div>
  );
}

function DragHint({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="anim-rise pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2">
      <span
        className="rounded-full border px-3 py-1.5 text-xs backdrop-blur"
        style={{ borderColor: 'var(--line)', background: 'rgba(20,22,27,0.6)', color: 'var(--muted)' }}
      >
        1 Finger drehen · 2 Finger zoomen
      </span>
    </div>
  );
}

function SafetyBanner({ onClose }: { onClose: () => void }) {
  return (
    <div className="anim-rise pointer-events-auto absolute inset-x-3 top-20 z-20 mx-auto max-w-sm sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
      <div
        className="rounded-xl border p-3 text-sm shadow-lg backdrop-blur"
        style={{ borderColor: 'rgba(255,138,30,0.4)', background: 'rgba(29,32,39,0.92)' }}
      >
        <p className="font-semibold" style={{ color: 'var(--accent)' }}>
          Kurz zur Sicherheit
        </p>
        <p className="mt-1 leading-relaxed" style={{ color: 'var(--text)' }}>
          Aufbau und Belastungstest durch Erwachsene. In der Nähe von Wasser immer Aufsicht.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="no-select mt-2 rounded-lg px-3 py-1.5 text-sm font-bold"
          style={{ background: 'var(--accent)', color: '#1b1205' }}
        >
          Verstanden
        </button>
      </div>
    </div>
  );
}

export default function BuildClient() {
  const params = useSearchParams();
  const requested = params.get('modell');
  const model = modelById(requested ?? undefined) ?? modelById(DEFAULT_MODEL_ID)!;
  const built = useMemo(() => buildModel(model), [model]);

  const [index, setIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [showInv, setShowInv] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [showHint, setShowHint] = useState(true);

  // Schritt zurücksetzen, wenn das Modell wechselt
  useEffect(() => {
    setIndex(0);
  }, [model.id]);

  // Reduced-Motion respektieren
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Sicherheits-Hinweis beim ersten Start
  useEffect(() => {
    try {
      if (!localStorage.getItem('jonte-safety-seen')) setShowSafety(true);
    } catch {
      /* localStorage nicht verfügbar */
    }
  }, []);

  // Dreh-Hinweis nach kurzer Zeit ausblenden
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4200);
    return () => clearTimeout(t);
  }, []);

  // Tastatur-Navigation
  const last = built.steps.length - 1;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(last, i + 1));
      else if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [last]);

  const dismissSafety = useCallback(() => {
    setShowSafety(false);
    try {
      localStorage.setItem('jonte-safety-seen', '1');
    } catch {
      /* ignore */
    }
  }, []);

  const inventory = useMemo(() => totalChips(built), [built]);

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden landscape:flex-row">
      <div className="relative min-h-0 flex-1">
        <Scene
          model={model}
          built={built}
          step={index}
          autoRotate={autoRotate}
          resetKey={resetKey}
          reducedMotion={reduced}
        />
        <TopBar
          modelId={model.id}
          modelName={model.name}
          autoRotate={autoRotate}
          onToggleRotate={() => setAutoRotate((v) => !v)}
          onReset={() => setResetKey((k) => k + 1)}
          reducedMotion={reduced}
        />
        <p className="sr-only">
          Interaktive 3D-Ansicht des Modells. Mit den Pfeiltasten links und rechts blätterst du
          durch die Aufbauschritte.
        </p>
        <DragHint show={showHint && !showSafety} />
        {showSafety && <SafetyBanner onClose={dismissSafety} />}
      </div>

      <aside
        className="max-h-[50dvh] shrink-0 border-t landscape:h-full landscape:max-h-none landscape:w-[384px] landscape:border-l landscape:border-t-0"
        style={{ background: 'var(--panel)', borderColor: 'var(--line)' }}
      >
        <StepBar
          built={built}
          index={index}
          setIndex={setIndex}
          platformHeightCm={built.platformHeightCm}
          totalHeightCm={built.totalHeightCm}
          onShowInventory={() => setShowInv(true)}
        />
      </aside>

      <InventorySheet
        open={showInv}
        onClose={() => setShowInv(false)}
        modelName={model.name}
        chips={inventory}
        platformHeightCm={built.platformHeightCm}
        totalHeightCm={built.totalHeightCm}
      />
    </div>
  );
}
