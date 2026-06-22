'use client';

import type { Chip, ChipTone } from '@/lib/inventory';
import type { Step } from '@/lib/types';

const TONE_COLOR: Record<ChipTone, string> = {
  node: '#c8cdd6',
  long: '#3a86d6',
  short: '#2bb673',
  plate: '#ffc60b',
  slide: '#ff8a1e',
};

function ChipPill({ chip }: { chip: Chip }) {
  const c = TONE_COLOR[chip.tone];
  return (
    <span
      className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
      style={{ borderColor: `${c}55`, background: `${c}14` }}
    >
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: c }} />
      <span className="font-medium" style={{ color: 'var(--text)' }}>
        {chip.label}
      </span>
      <span className="font-bold tabular-nums" style={{ color: c }}>
        ×{chip.count}
      </span>
    </span>
  );
}

export default function StepBar({
  steps,
  index,
  setIndex,
  chips,
  platformHeightCm,
  totalHeightCm,
  onShowInventory,
}: {
  steps: Step[];
  index: number;
  setIndex: (i: number) => void;
  chips: Chip[];
  platformHeightCm: number;
  totalHeightCm: number;
  onShowInventory: () => void;
}) {
  const total = steps.length;
  const step = steps[index];
  const atStart = index <= 0;
  const atEnd = index >= total - 1;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Fortschritt */}
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted)' }}>
          <span>
            Schritt <span className="font-bold" style={{ color: 'var(--text)' }}>{index + 1}</span> von {total}
          </span>
          <button
            type="button"
            onClick={onShowInventory}
            className="no-select font-semibold underline-offset-2 hover:underline"
            style={{ color: 'var(--muted)' }}
          >
            Materialliste
          </button>
        </div>
        <div className="mt-2 flex gap-1" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={total}>
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Zu Schritt ${i + 1}`}
              onClick={() => setIndex(i)}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{
                background: i === index ? 'var(--accent)' : i < index ? '#5a6470' : 'var(--line)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Inhalt */}
      <div className="scroll-soft min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
          {step.kicker}
        </p>
        <h2 className="mt-1 text-xl font-bold leading-snug">{step.title}</h2>

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <ChipPill key={chip.key} chip={chip} />
            ))}
          </div>
        )}

        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
          {step.hint}
        </p>

        <div
          className="mt-4 flex flex-wrap gap-x-5 gap-y-1 rounded-xl border px-3 py-2 text-xs"
          style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
        >
          <span>
            Plattform <span className="font-bold" style={{ color: 'var(--text)' }}>~{platformHeightCm} cm</span>
          </span>
          <span>
            Gesamthöhe <span className="font-bold" style={{ color: 'var(--text)' }}>~{totalHeightCm} cm</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="safe-b safe-x flex gap-3 px-5 pb-4 pt-2">
        <button
          type="button"
          onClick={() => setIndex(Math.max(0, index - 1))}
          disabled={atStart}
          className="no-select flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border text-base font-semibold transition-opacity active:scale-[0.98] disabled:opacity-35"
          style={{ borderColor: 'var(--line)', background: 'rgba(255,255,255,0.03)', color: 'var(--text)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Zurück
        </button>
        <button
          type="button"
          onClick={() => setIndex(Math.min(total - 1, index + 1))}
          disabled={atEnd}
          className="no-select flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-xl text-base font-bold transition-opacity active:scale-[0.98] disabled:opacity-50"
          style={{ background: 'var(--accent)', color: '#1b1205' }}
        >
          {atEnd ? 'Fertig' : 'Weiter'}
          {!atEnd && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
