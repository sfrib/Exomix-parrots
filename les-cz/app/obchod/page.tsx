import { searchIndex } from '@/data/index';
import { pageMetadata } from '@/lib/seo';
import CatalogBrowser from '@/components/CatalogBrowser';
import PageHeader from '@/components/PageHeader';

export const metadata = pageMetadata({
  title: 'Celý sortiment lesního skladu',
  description: 'Všechny lesní plody, větve, byliny, přírodní hračky i rizikové rostliny na jednom místě. Filtrujte podle bezpečnosti a sezóny.',
  path: '/obchod',
});

export default function ShopPage() {
  return (
    <>
      <PageHeader
        eyebrow="Katalog"
        title="Celý sortiment"
        lead="Všechno, co les momentálně vede. Ceny bez DPH, s DPH i bez ceny – vždycky zdarma."
        crumbs={[{ name: 'Celý sortiment' }]}
      />
      <div className="container-les py-10">
        <CatalogBrowser entries={searchIndex()} />
      </div>
    </>
  );
}
