import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CAMPAIGNS } from '@/data/seasonal';
import { productsInSeason } from '@/data/index';
import { SEASONS, SEASON_LABEL, isSeason } from '@/lib/seasons';
import { toSearchEntry } from '@/lib/search';
import { pageMetadata } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';
import ProductCard from '@/components/ProductCard';

const ADJ: Record<string, string> = { jaro: 'Jarní', leto: 'Letní', podzim: 'Podzimní', zima: 'Zimní' };

export function generateStaticParams() {
  return SEASONS.map((season) => ({ season }));
}

export function generateMetadata({ params }: { params: { season: string } }): Metadata {
  if (!isSeason(params.season)) return {};
  return pageMetadata({
    title: `${ADJ[params.season]} nabídka – co sbírat pro papouška`,
    description: `${CAMPAIGNS[params.season].headline} ${CAMPAIGNS[params.season].subline} Co se dá pro papouška nasbírat – ${SEASON_LABEL[params.season].toLowerCase()}.`,
    path: `/sezona/${params.season}`,
  });
}

export default function SeasonPage({ params }: { params: { season: string } }) {
  if (!isSeason(params.season)) notFound();
  const c = CAMPAIGNS[params.season];
  const entries = productsInSeason(params.season).map(toSearchEntry);
  return (
    <>
      <PageHeader
        eyebrow={`${ADJ[params.season]} nabídka`}
        title={c.headline}
        lead={c.subline}
        crumbs={[{ name: 'Sezónní nabídka', href: '/sezona' }, { name: SEASON_LABEL[params.season] }]}
      >
        <ul className="mt-6 flex flex-wrap gap-2">
          {c.messages.map((m) => (
            <li key={m} className="chip border-bark-500/20 bg-white/80 px-3 py-1.5 text-sm text-bark-600">{m}</li>
          ))}
        </ul>
      </PageHeader>
      <div className="container-les py-10">
        <div className="mb-8 rounded-2xl border border-forest-900/10 bg-white p-6">
          <h2 className="font-display text-xl font-semibold text-forest-900">Na co si teď dát pozor</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink/80">
            {c.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {entries.map((e) => (
            <li key={e.slug}>
              <ProductCard entry={e} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
