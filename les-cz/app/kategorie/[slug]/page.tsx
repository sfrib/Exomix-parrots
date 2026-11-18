import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CATEGORIES, CATEGORY_MAP, isCategorySlug } from '@/data/categories';
import { productsByCategory } from '@/data/index';
import { toSearchEntry } from '@/lib/search';
import { pageMetadata } from '@/lib/seo';
import CatalogBrowser from '@/components/CatalogBrowser';
import PageHeader from '@/components/PageHeader';

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  if (!isCategorySlug(params.slug)) return {};
  const c = CATEGORY_MAP[params.slug];
  return pageMetadata({
    title: `${c.name} pro papoušky`,
    description: c.description,
    path: `/kategorie/${c.slug}`,
  });
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  if (!isCategorySlug(params.slug)) notFound();
  const c = CATEGORY_MAP[params.slug];
  const entries = productsByCategory(c.slug).map(toSearchEntry);
  const risky = c.slug === 'rizikove-zbozi';

  return (
    <>
      <PageHeader
        eyebrow={`Oddělení ${c.letter}`}
        title={c.name}
        lead={
          <>
            <p>{c.description}</p>
            <p className="mt-2 font-display italic text-forest-700">{c.claim}</p>
          </>
        }
        crumbs={[{ name: 'Sortiment', href: '/obchod' }, { name: c.name }]}
        tone={risky ? 'danger' : 'paper'}
      >
        {risky ? (
          <div className="mt-6 max-w-3xl rounded-2xl border border-berry-600/30 bg-white p-5 text-sm leading-relaxed text-ink/85">
            <p className="font-semibold text-berry-700">Tohle oddělení slouží ke vzdělávání.</p>
            <p className="mt-1">
              Zboží z oddělení G se papouškům nepodává. Naučte se ho poznat, abyste ho nepřinesli domů omylem –
              a abyste ho dokázali odstranit z okolí venkovní voliéry. Při podezření na otravu ihned kontaktujte
              veterináře a vezměte s sebou vzorek rostliny.
            </p>
          </div>
        ) : null}
        <nav aria-label="Další oddělení" className="mt-6 flex flex-wrap gap-2">
          {CATEGORIES.filter((x) => x.slug !== c.slug).map((x) => (
            <Link key={x.slug} href={`/kategorie/${x.slug}`} className="chip border-forest-900/15 bg-white/80 px-3 py-1.5 text-sm text-forest-800 hover:border-forest-600">
              {x.letter}. {x.name}
            </Link>
          ))}
        </nav>
      </PageHeader>
      <div className="container-les py-10">
        <CatalogBrowser entries={entries} initialCategory={c.slug} lockCategory />
      </div>
    </>
  );
}
