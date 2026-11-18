'use client';

import { useEffect, useState } from 'react';
import type { Season } from '@/lib/types';

/**
 * „Skladový ticker“ se sezónními hláškami.
 * Na serveru se vykreslí období podle data buildu, v prohlížeči se přepne na aktuální měsíc.
 */
export default function SeasonalTicker({ initialSeason, messages }: { initialSeason: Season; messages: Record<Season, string[]> }) {
  const [season, setSeason] = useState<Season>(initialSeason);

  useEffect(() => {
    const m = new Date().getMonth() + 1;
    setSeason(m >= 3 && m <= 5 ? 'jaro' : m >= 6 && m <= 8 ? 'leto' : m >= 9 && m <= 11 ? 'podzim' : 'zima');
  }, []);

  const list = messages[season];
  const items = [...list, ...list];

  return (
    <div className="relative overflow-hidden bg-forest-900 text-sand-100" role="region" aria-label="Novinky z lesního skladu">
      <p className="sr-only">{list.join(' ')}</p>
      <div className="flex w-max animate-ticker gap-10 whitespace-nowrap py-2 text-[13px]" aria-hidden="true">
        {items.map((msg, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="text-honey-300">✦</span>
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
