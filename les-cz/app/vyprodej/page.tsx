import Link from 'next/link';
import { CLEARANCE } from '@/data/seasonal';
import { getProduct } from '@/data/index';
import { pageMetadata } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';
import PlantIllustration from '@/components/PlantIllustration';

export const metadata = pageMetadata({
  title: 'Lesní výprodej – sleva 100 % z ničeho',
  description: 'Doprodej sezónního zboží z lesa. Všechny ceny snížené z nuly na nulu.',
  path: '/vyprodej',
});

export default function ClearancePage() {
  return (
    <>
      <PageHeader eyebrow="F. Lesní výprodej" title={`${CLEARANCE.title} −100 %`} lead={CLEARANCE.intro} crumbs={[{ name: 'Lesní výprodej' }]} />
      <div className="container-les py-10">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CLEARANCE.items.map((item) => {
            const p = getProduct(item.slug);
            if (!p) return null;
            return (
              <li key={item.slug} className="card relative overflow-hidden">
                <span className="absolute right-3 top-3 z-10 rotate-6 rounded-md bg-berry-600 px-3 py-1 font-display text-sm font-bold text-white shadow">
                  {item.deal}
                </span>
                <PlantIllustration kind={p.visual.kind} color={p.visual.color} accent={p.visual.accent} className="aspect-[4/3] w-full" />
                <div className="p-5">
                  <h2 className="font-display text-xl font-semibold text-forest-900">{item.label}</h2>
                  <p className="mt-1 text-sm text-ink/70">{item.note}</p>
                  <p className="mt-3 font-display text-lg">
                    <span className="mr-2 text-ink/40 line-through">0 Kč</span>
                    <span className="font-bold text-forest-700">0 Kč</span>
                  </p>
                  <Link href={`/produkt/${p.slug}`} className="btn-buy mt-4">Do produktu →</Link>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-8 max-w-2xl text-sm text-ink/60">
          Akce platí do vyprodání zásob, tedy přibližně navždy. Výprodej je vtip – žádné zboží se neprodává ani neodesílá.
        </p>
      </div>
    </>
  );
}
