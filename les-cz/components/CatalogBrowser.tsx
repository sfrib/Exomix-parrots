'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CategorySlug, SafetyLevel } from '@/lib/types';
import type { SearchEntry } from '@/lib/search';
import { normalize, searchEntries } from '@/lib/search';
import { CATEGORIES } from '@/data/categories';
import { MONTH_NAMES } from '@/lib/seasons';
import ProductCard from './ProductCard';
import { SAFETY_META } from './SafetyBadge';

type Sort = 'doporucene' | 'nazev' | 'sezona';

interface Props {
  entries: SearchEntry[];
  initialCategory?: CategorySlug | 'vse';
  lockCategory?: boolean;
}

/** Katalog s filtrováním (kategorie, bezpečnost, měsíc), textovým hledáním a řazením. Vše běží na klientu. */
export default function CatalogBrowser({ entries, initialCategory = 'vse', lockCategory = false }: Props) {
  const [category, setCategory] = useState<CategorySlug | 'vse'>(initialCategory);
  const [safety, setSafety] = useState<SafetyLevel | 'vse'>('vse');
  const [month, setMonth] = useState<number | 0>(0);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('doporucene');
  // Aktuální měsíc až po načtení v prohlížeči (stránka je staticky generovaná).
  const [nowMonth, setNowMonth] = useState(0);
  useEffect(() => setNowMonth(new Date().getMonth() + 1), []);

  const results = useMemo(() => {
    let list = query.trim() ? searchEntries(entries, query, 500) : [...entries];
    if (category !== 'vse') list = list.filter((e) => e.category === category);
    if (safety !== 'vse') list = list.filter((e) => e.safety === safety);
    if (month) list = list.filter((e) => e.months.includes(month));
    if (sort === 'nazev') list.sort((x, y) => x.name.localeCompare(y.name, 'cs'));
    if (sort === 'sezona') {
      list.sort((x, y) => Number(y.months.includes(nowMonth)) - Number(x.months.includes(nowMonth)) || x.name.localeCompare(y.name, 'cs'));
    }
    return list;
  }, [entries, category, safety, month, query, sort, nowMonth]);

  const activeFilters = (category !== 'vse' && !lockCategory ? 1 : 0) + (safety !== 'vse' ? 1 : 0) + (month ? 1 : 0) + (query ? 1 : 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start" aria-label="Filtry">
        <div>
          <label htmlFor="catalog-q" className="mb-2 block text-sm font-semibold text-forest-900">Hledat v sortimentu</label>
          <input
            id="catalog-q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="např. bříza, šípek…"
            className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-2 text-sm outline-none focus:border-forest-600 focus:ring-4 focus:ring-forest-200"
          />
        </div>

        {!lockCategory ? (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-forest-900">Oddělení</legend>
            <div className="flex flex-wrap gap-1.5 lg:flex-col">
              {[{ slug: 'vse' as const, name: 'Vše' }, ...CATEGORIES].map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  aria-pressed={category === c.slug}
                  onClick={() => setCategory(c.slug)}
                  className={`rounded-full border px-3 py-1.5 text-left text-sm transition ${category === c.slug ? 'border-forest-700 bg-forest-700 text-white' : 'border-forest-900/15 bg-white hover:border-forest-600'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-forest-900">Bezpečnost</legend>
          <div className="flex flex-wrap gap-1.5">
            {(['vse', 'doporuceno', 'stridme', 'neovereno', 'rizikove'] as const).map((level) => (
              <button
                key={level}
                type="button"
                aria-pressed={safety === level}
                onClick={() => setSafety(level)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${safety === level ? 'border-forest-700 bg-forest-700 text-white' : 'border-forest-900/15 bg-white hover:border-forest-600'}`}
              >
                {level === 'vse' ? 'Vše' : SAFETY_META[level].short}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="catalog-month" className="mb-2 block text-sm font-semibold text-forest-900">Naskladněno v měsíci</label>
          <select
            id="catalog-month"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-full rounded-xl border border-forest-900/15 bg-white px-3 py-2 text-sm"
          >
            <option value={0}>Kdykoli</option>
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
                {i + 1 === nowMonth ? ' (teď)' : ''}
              </option>
            ))}
          </select>
        </div>

        {activeFilters > 0 ? (
          <button
            type="button"
            className="text-sm font-medium text-forest-700 underline underline-offset-2"
            onClick={() => {
              if (!lockCategory) setCategory('vse');
              setSafety('vse');
              setMonth(0);
              setQuery('');
            }}
          >
            Zrušit filtry ({activeFilters})
          </button>
        ) : null}
      </aside>

      <section aria-live="polite">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink/70">
            <strong className="text-forest-900">{results.length}</strong> {pluralItems(results.length)} skladem v lese
          </p>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-ink/70">Řadit:</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-lg border border-forest-900/15 bg-white px-2 py-1.5">
              <option value="doporucene">Doporučené</option>
              <option value="nazev">Podle názvu</option>
              <option value="sezona">Právě v sezóně</option>
            </select>
          </label>
        </div>
        {results.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="font-display text-xl text-forest-900">Tohle v lese zatím nevedeme.</p>
            <p className="mt-2 text-sm text-ink/70">
              To ale neznamená, že je to bezpečné. U neznámé rostliny platí: nepodávat a zeptat se veterináře.
              {query ? <> Hledali jste „{query}“ ({normalize(query)}).</> : null}
            </p>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((e) => (
              <li key={e.slug}>
                <ProductCard entry={e} highlight={e.months.includes(nowMonth) && e.category !== 'rizikove-zbozi' ? 'V sezóně' : undefined} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function pluralItems(n: number) {
  if (n === 1) return 'položka';
  if (n >= 2 && n <= 4) return 'položky';
  return 'položek';
}
