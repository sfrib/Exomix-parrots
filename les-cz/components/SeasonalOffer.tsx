'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Season } from '@/lib/types';
import type { SearchEntry } from '@/lib/search';
import type { SeasonalCampaign } from '@/data/seasonal';
import ProductCard from './ProductCard';

const LABEL: Record<Season, string> = { jaro: 'Jarní nabídka', leto: 'Letní nabídka', podzim: 'Podzimní nabídka', zima: 'Zimní nabídka' };

/** Sezónní kampaň na homepage – po načtení v prohlížeči se přepne na aktuální roční období. */
export default function SeasonalOffer({
  initialSeason,
  campaigns,
  entries,
}: {
  initialSeason: Season;
  campaigns: Record<Season, SeasonalCampaign>;
  entries: Record<string, SearchEntry>;
}) {
  const [season, setSeason] = useState<Season>(initialSeason);
  useEffect(() => {
    const m = new Date().getMonth() + 1;
    setSeason(m >= 3 && m <= 5 ? 'jaro' : m >= 6 && m <= 8 ? 'leto' : m >= 9 && m <= 11 ? 'podzim' : 'zima');
  }, []);
  const campaign = campaigns[season];
  const featured = campaign.featured.map((s) => entries[s]).filter(Boolean).slice(0, 4);

  return (
    <section aria-labelledby="sezona-title" className="overflow-hidden rounded-[28px] bg-forest-900 text-white">
      <div className="grid gap-8 p-6 sm:p-8 md:p-12 lg:grid-cols-[1fr_1.6fr]">
        <div className="flex flex-col">
          <p className="eyebrow text-honey-300">{LABEL[season]}</p>
          <h2 id="sezona-title" className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
            {campaign.headline}
          </h2>
          <p className="mt-2 font-display text-xl italic text-honey-200">{campaign.subline}</p>
          <ul className="mt-6 space-y-2 text-sm text-white/80">
            {campaign.tips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="text-honey-300" aria-hidden="true">●</span>
                {tip}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap gap-2 pt-6">
            <Link href={`/sezona/${season}`} className="btn bg-honey-300 text-forest-950 hover:bg-honey-400">
              Celá {LABEL[season].toLowerCase()}
            </Link>
            <Link href="/co-roste-ted" className="btn border border-white/30 text-white hover:bg-white/10">
              Kalendář sběru
            </Link>
          </div>
        </div>
        <ul className="rail">
          {featured.map((e) => (
            <li key={e.slug} className="rail-item text-ink">
              <ProductCard entry={e} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
