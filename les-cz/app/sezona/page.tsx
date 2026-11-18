import Link from 'next/link';
import { CAMPAIGNS } from '@/data/seasonal';
import { productsInSeason } from '@/data/index';
import { SEASONS, SEASON_LABEL } from '@/lib/seasons';
import { pageMetadata } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';

export const metadata = pageMetadata({
  title: 'Sezónní nabídka',
  description: 'Jarní, letní, podzimní a zimní nabídka lesního skladu pro papoušky.',
  path: '/sezona',
});

export default function SeasonsPage() {
  return (
    <>
      <PageHeader eyebrow="E. Sezónní nabídka" title="Sezónní nabídka" lead="Les mění sortiment čtyřikrát ročně. Bez ohlášení a bez slev – tedy se slevou 100 %." crumbs={[{ name: 'Sezónní nabídka' }]} />
      <div className="container-les grid gap-6 py-10 md:grid-cols-2">
        {SEASONS.map((s) => {
          const c = CAMPAIGNS[s];
          return (
            <Link key={s} href={`/sezona/${s}`} className="group card flex flex-col p-8 transition hover:shadow-lift">
              <p className="eyebrow">{SEASON_LABEL[s]}ní nabídka</p>
              <h2 className="h-display mt-2 text-2xl group-hover:underline">{c.headline}</h2>
              <p className="mt-1 font-display italic text-forest-700">{c.subline}</p>
              <p className="mt-4 text-sm text-ink/60">{productsInSeason(s).length} položek v nabídce →</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
