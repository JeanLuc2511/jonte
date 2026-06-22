'use client';

import { useEffect, useRef } from 'react';

import type { Chip, ChipTone } from '@/lib/inventory';

const TONE_COLOR: Record<ChipTone, string> = {
  node: '#c8cdd6',
  long: '#3a86d6',
  short: '#2bb673',
  plate: '#ffc60b',
  slide: '#ff8a1e',
};

export default function InventorySheet({
  open,
  onClose,
  modelName,
  chips,
  platformHeightCm,
  totalHeightCm,
}: {
  open: boolean;
  onClose: () => void;
  modelName: string;
  chips: Chip[];
  platformHeightCm: number;
  totalHeightCm: number;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = (document.activeElement as HTMLElement) ?? null;
    const node = dialogRef.current;
    const getFocusable = () =>
      node
        ? Array.from(
            node.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])'),
          ).filter((el) => !el.hasAttribute('disabled'))
        : [];
    getFocusable()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const f = getFocusable();
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center sm:items-center"
      style={{ background: 'rgba(8,9,12,0.6)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="jonte-inv-title"
    >
      <div
        ref={dialogRef}
        className="anim-rise safe-b w-full max-w-md rounded-t-2xl border p-5 sm:rounded-2xl"
        style={{ background: 'var(--panel)', borderColor: 'var(--line)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              Materialliste gesamt
            </p>
            <h2 id="jonte-inv-title" className="mt-0.5 text-xl font-bold">
              {modelName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="no-select inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border"
            style={{ borderColor: 'var(--line)', color: 'var(--text)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          {chips.map((chip) => {
            const c = TONE_COLOR[chip.tone];
            return (
              <li
                key={chip.key}
                className="flex items-center justify-between rounded-xl border px-4 py-3"
                style={{ borderColor: 'var(--line)', background: 'rgba(255,255,255,0.02)' }}
              >
                <span className="flex items-center gap-3">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ background: c }} />
                  <span className="font-medium">{chip.label}</span>
                </span>
                <span className="text-lg font-bold tabular-nums" style={{ color: c }}>
                  {chip.count}×
                </span>
              </li>
            );
          })}
        </ul>

        <div
          className="mt-4 flex justify-between rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}
        >
          <span>
            Plattform <span className="font-bold" style={{ color: 'var(--text)' }}>~{platformHeightCm} cm</span>
          </span>
          <span>
            Gesamthöhe <span className="font-bold" style={{ color: 'var(--text)' }}>~{totalHeightCm} cm</span>
          </span>
        </div>
        <p className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>
          Mengen sind ungefähr — am echten Set abgleichen. Farben im Set sind bunt gemischt.
        </p>
      </div>
    </div>
  );
}
