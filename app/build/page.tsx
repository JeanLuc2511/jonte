import { Suspense } from 'react';

import BuildClient from './BuildClient';

export default function BuildPage() {
  return (
    <Suspense
      fallback={
        <div className="grid h-[100dvh] place-items-center" style={{ background: 'var(--bg)' }}>
          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--muted)' }}>
            <span className="h-3 w-3 animate-pulse rounded-full" style={{ background: 'var(--accent)' }} />
            lädt…
          </div>
        </div>
      }
    >
      <BuildClient />
    </Suspense>
  );
}
