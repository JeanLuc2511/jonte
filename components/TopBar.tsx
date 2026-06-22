'use client';

import Link from 'next/link';

import ShareButton from './ShareButton';

function IconButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      className="no-select inline-flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur transition-colors active:scale-95 disabled:opacity-40"
      style={{
        borderColor: active ? 'rgba(255,138,30,0.5)' : 'var(--line)',
        background: active ? 'rgba(255,138,30,0.16)' : 'rgba(20,22,27,0.55)',
        color: active ? 'var(--accent)' : 'var(--text)',
      }}
    >
      {children}
    </button>
  );
}

export default function TopBar({
  modelId,
  modelName,
  autoRotate,
  onToggleRotate,
  onReset,
  reducedMotion,
}: {
  modelId: string;
  modelName: string;
  autoRotate: boolean;
  onToggleRotate: () => void;
  onReset: () => void;
  reducedMotion: boolean;
}) {
  return (
    <div className="safe-t safe-x pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
      <div className="pointer-events-auto flex items-center gap-2">
        <Link
          href="/"
          aria-label="Zurück zur Auswahl"
          className="no-select inline-flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur transition-colors active:scale-95"
          style={{ borderColor: 'var(--line)', background: 'rgba(20,22,27,0.55)', color: 'var(--text)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div
          className="rounded-full border px-4 py-2 backdrop-blur"
          style={{ borderColor: 'var(--line)', background: 'rgba(20,22,27,0.55)' }}
        >
          <p className="text-xs leading-none" style={{ color: 'var(--muted)' }}>
            Jonte · Aufbau
          </p>
          <p className="text-sm font-bold leading-tight">{modelName}</p>
        </div>
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        <IconButton
          onClick={onToggleRotate}
          active={autoRotate && !reducedMotion}
          disabled={reducedMotion}
          label="Automatisch drehen"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M21 12a9 9 0 1 1-2.64-6.36M21 4v4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconButton>
        <IconButton onClick={onReset} label="Ansicht zurücksetzen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
          </svg>
        </IconButton>
        <ShareButton modelId={modelId} />
      </div>
    </div>
  );
}
