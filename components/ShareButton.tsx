'use client';

import { useEffect, useState } from 'react';

type Status = 'idle' | 'copied' | 'shared';

export default function ShareButton({ modelId, label }: { modelId: string; label?: string }) {
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const t = setTimeout(() => setStatus('idle'), 1800);
    return () => clearTimeout(t);
  }, [status]);

  async function share() {
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/build?modell=${modelId}`
        : `/build?modell=${modelId}`;
    const data = {
      title: 'Jonte – QUADRO Aufbau',
      text: 'Schau dir den Aufbau dieses QUADRO-Gerüsts an:',
      url,
    };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(data);
        setStatus('shared');
        return;
      }
    } catch {
      // Nutzer hat Teilen abgebrochen – Fallback unten
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus('copied');
    } catch {
      setStatus('idle');
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="no-select relative inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors active:scale-95"
      style={{ borderColor: 'var(--line)', background: 'rgba(255,255,255,0.04)', color: 'var(--text)' }}
      aria-label="Link teilen"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M18 8a3 3 0 1 0-2.83-4M6 12a3 3 0 1 0 0 .01M18 16a3 3 0 1 0 0 .01M8.6 13.5l6.8 3.5M15.4 7L8.6 10.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{status === 'copied' ? 'Link kopiert' : status === 'shared' ? 'Geteilt' : label ?? 'Teilen'}</span>
    </button>
  );
}
