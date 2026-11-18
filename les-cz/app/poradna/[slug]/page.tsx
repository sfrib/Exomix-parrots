import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ARTICLES, ARTICLE_MAP } from '@/data/articles';
import { getProducts } from '@/data/index';
import { SOURCE_MAP } from '@/data/sources';
import { toSearchEntry } from '@/lib/search';
import { articleJsonLd, pageMetadata } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import PageHeader from '@/components/PageHeader';
import ProductCard from '@/components/ProductCard';
import ProvenanceTag from '@/components/ProvenanceTag';

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = ARTICLE_MAP[params.slug];
  if (!a) return {};
  return pageMetadata({ title: a.title, description: a.description, path: `/poradna/${a.slug}`, ogType: 'article' });
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const a = ARTICLE_MAP[params.slug];
  if (!a) notFound();
  const related = getProducts(a.relatedProducts).map(toSearchEntry);
  return (
    <article>
      <JsonLd data={articleJsonLd(a)} />
      <PageHeader
        eyebrow="Lesní poradna"
        title={a.title}
        lead={a.description}
        crumbs={[{ name: 'Lesní poradna', href: '/poradna' }, { name: a.title }]}
      >
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink/60">
          <ProvenanceTag provenance={a.provenance} sourceIds={a.sourceIds} />
          <span>Aktualizováno {new Date(a.updated).toLocaleDateString('cs-CZ')} · čeká na odbornou kontrolu</span>
        </div>
      </PageHeader>
      <div className="container-les grid gap-10 py-10 lg:grid-cols-[1fr_300px]">
        <div className="prose-les max-w-3xl">
          {a.body.map((block, i) => (
            <div key={i}>
              {block.heading ? <h2>{block.heading}</h2> : null}
              {block.paragraphs?.map((p) => <p key={p} className="mt-3">{p}</p>)}
              {block.list ? (
                <ul>
                  {block.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
          <h2>Zdroje</h2>
          <ul>
            {a.sourceIds.map((id) => (
              <li key={id} className="text-sm">{SOURCE_MAP[id]?.citation}</li>
            ))}
          </ul>
        </div>
        <aside className="space-y-4">
          <p className="font-display text-lg font-semibold text-forest-900">Zboží z článku</p>
          <ul className="grid gap-4">
            {related.slice(0, 4).map((e) => (
              <li key={e.slug}>
                <ProductCard entry={e} />
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </article>
  );
}
