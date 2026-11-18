'use client';

import { useEffect, useState } from 'react';
import type { SearchEntry } from '@/lib/search';
import { MONTH_NAMES } from '@/lib/seasons';
import ProductCard from './ProductCard';

const MONTH_LOCATIVE = ['V lednu', 'V únoru', 'V březnu', 'V dubnu', 'V květnu', 'V červnu', 'V červenci', 'V srpnu', 'V září', 'V říjnu', 'V listopadu', 'V prosinci'];

/** „Co roste právě teď?“ – výběr měsíce, výchozí je aktuální měsíc v prohlížeči. */
export default function MonthPicker({ entries }: { entries: SearchEntry[] }) {
  const [month, setMonth] = useState<number>(0);
  const [now, setNow] = useState<number>(0);
  useEffect(() => {
    const m = new Date().getMonth() + 1;
    setNow(m);
    setMonth(m);
  }, []);

  const shown = month ? entries.filter((e) => e.months.includes(month) && e.category !== 'rizikove-zbozi') : [];
  const risky = month ? entries.filter((e) => e.months.includes(month) && e.category === 'rizikove-zbozi') : [];

  return (
    <div>
      <div role="tablist" aria-label="Měsíc" className="flex flex-wrap gap-1.5">
        {MONTH_NAMES.map((name, i) => (
          <button
            key={name}
            role="tab"
            aria-selected={month === i + 1}
            onClick={() => setMonth(i + 1)}
            className={`rounded-full border px-3 py-1.5 text-sm capitalize transition ${
              month === i + 1 ? 'border-forest-700 bg-forest-700 text-white' : 'border-forest-900/15 bg-white hover:border-forest-600'
            }`}
          >
            {name}
            {i + 1 === now ? ' •' : ''}
          </button>
        ))}
      </div>

      {month === 0 ? (
        <p className="mt-6 text-ink/60">Načítám aktuální měsíc…</p>
      ) : (
        <>
          <h2 className="h-display mt-8 text-3xl">
            {MONTH_LOCATIVE[month - 1]} je naskladněno{' '}
            <span className="text-forest-600">{shown.length}</span> {shown.length === 1 ? 'položka' : shown.length >= 2 && shown.length <= 4 ? 'položky' : 'položek'}
          </h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((e) => (
              <li key={e.slug}>
                <ProductCard entry={e} />
              </li>
            ))}
          </ul>
          {risky.length > 0 ? (
            <div className="mt-10 rounded-2xl border border-berry-600/25 bg-berry-50 p-6">
              <h3 className="font-display text-xl font-semibold text-berry-700">Pozor, v tomto měsíci je nápadné i rizikové zboží</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {risky.map((e) => (
                  <li key={e.slug}>
                    <a href={`/produkt/${e.slug}`} className="chip border-berry-600/25 bg-white px-3 py-1.5 text-sm text-berry-700 hover:border-berry-600">
                      {e.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
