'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { SearchEntry } from '@/lib/search';
import { searchEntries } from '@/lib/search';
import ProductCard from './ProductCard';
import SafetyBadge, { SAFETY_META } from './SafetyBadge';
import PlantIllustration from './PlantIllustration';

/**
 * Vyhledávání. Režim `safety` = nástroj „Je to pro papouška bezpečné?“ (velký verdikt u nejlepší shody).
 * Dotaz se drží v URL (?q=), takže výsledky jde sdílet.
 */
export default function SearchResults({ entries, mode = 'catalog' }: { entries: SearchEntry[]; mode?: 'catalog' | 'safety' }) {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get('q') ?? '';
  const [query, setQuery] = useState(initial);

  useEffect(() => setQuery(params.get('q') ?? ''), [params]);

  const results = useMemo(() => searchEntries(entries, query), [entries, query]);
  const top = results[0];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.replace(q ? `?q=${encodeURIComponent(q)}` : '?', { scroll: false });
  }

  return (
    <div>
      <form onSubmit={submit} role="search" className="flex max-w-2xl overflow-hidden rounded-full border border-forest-900/15 bg-white p-1.5 shadow-card">
        <label htmlFor="search-q" className="sr-only">
          {mode === 'safety' ? 'Název rostliny' : 'Hledat'}
        </label>
        <input
          id="search-q"
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={mode === 'safety' ? 'Napište název rostliny, např. tis, bříza, jeřabiny…' : 'Hledat rostlinu, strom, plod…'}
          className="min-w-0 flex-1 bg-transparent px-4 text-base outline-none"
        />
        <button type="submit" className="btn-buy px-6">
          {mode === 'safety' ? 'Ověřit' : 'Hledat'}
        </button>
      </form>

      {query.trim() === '' ? (
        <p className="mt-6 text-ink/60">Začněte psát. Hledáme v českých, lidových i latinských názvech a diakritika nevadí.</p>
      ) : results.length === 0 ? (
        <div className="mt-8 max-w-2xl rounded-2xl border border-orange-500/30 bg-orange-50 p-6">
          <p className="font-display text-2xl text-forest-900">„{query}“ v lese zatím nevedeme.</p>
          <p className="mt-2 text-ink/80">
            <strong>To neznamená, že je to bezpečné.</strong> Rostlinu, kterou neznáme, papouškovi nepodávejte a poraďte se s
            veterinářem se zaměřením na ptáky. Zkuste také jiný název (lidový nebo latinský).
          </p>
        </div>
      ) : (
        <>
          {mode === 'safety' && top ? (
            <div className={`mt-8 grid max-w-4xl gap-6 rounded-[28px] border p-6 md:grid-cols-[180px_1fr] ${SAFETY_META[top.safety].className}`}>
              <PlantIllustration kind={top.visual.kind} color={top.visual.color} accent={top.visual.accent} className="aspect-square w-full rounded-2xl" />
              <div>
                <p className="text-sm text-ink/60">Nejlepší shoda</p>
                <h2 className="font-display text-3xl font-semibold text-forest-900">{top.name}</h2>
                <p className="italic text-ink/60">{top.latin}</p>
                <div className="mt-3">
                  <SafetyBadge level={top.safety} size="lg" />
                </div>
                <p className="mt-3 leading-relaxed text-ink/85">{top.safetySummary}</p>
                <Link href={`/produkt/${top.slug}`} className="btn-primary mt-4">
                  Celá karta: příprava, rizika, identifikace
                </Link>
              </div>
            </div>
          ) : null}
          <h2 className="mt-10 font-display text-2xl text-forest-900">
            {mode === 'safety' ? 'Další shody' : `Výsledky pro „${query}“`} <span className="text-base text-ink/50">({results.length})</span>
          </h2>
          <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(mode === 'safety' ? results.slice(1) : results).map((e) => (
              <li key={e.slug}>
                <ProductCard entry={e} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
