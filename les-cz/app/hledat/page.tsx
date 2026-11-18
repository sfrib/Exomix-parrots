import { Suspense } from 'react';
import { searchIndex } from '@/data/index';
import { pageMetadata } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';
import SearchResults from '@/components/SearchResults';

export const metadata = {
  ...pageMetadata({
    title: 'Hledat v lese',
    description: 'Vyhledávání v databázi přírodních materiálů pro papoušky.',
    path: '/hledat',
  }),
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <>
      <PageHeader eyebrow="Vyhledávání" title="Co hledáte pro svého papouška?" lead="Zadejte název rostliny, stromu nebo plodu." crumbs={[{ name: 'Hledat' }]} />
      <div className="container-les py-10">
        <Suspense fallback={<p>Načítám les…</p>}>
          <SearchResults entries={searchIndex()} />
        </Suspense>
      </div>
    </>
  );
}
