import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { LEGAL_DOCS, LEGAL_MAP } from '@/data/legal';
import { pageMetadata } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';

export function generateStaticParams() {
  return LEGAL_DOCS.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const d = LEGAL_MAP[params.slug];
  if (!d) return {};
  return pageMetadata({ title: d.title, description: d.description, path: `/pravni/${d.slug}` });
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const d = LEGAL_MAP[params.slug];
  if (!d) notFound();
  return (
    <>
      <PageHeader eyebrow="Právní informace" title={d.title} lead={d.description} crumbs={[{ name: 'Právní informace' }, { name: d.title }]} />
      <div className="container-les grid gap-10 py-10 lg:grid-cols-[1fr_260px]">
        <div className="max-w-3xl">
          <div className="mb-8 rounded-2xl border-2 border-dashed border-orange-500/50 bg-orange-50 p-4 text-sm text-orange-900">
            <strong>NÁVRH – určeno k finální právní kontrole.</strong> Text zatím neprošel kontrolou právníka a údaje provozovatele
            nebyly ověřeny ve veřejných rejstřících.
          </div>
          <div className="prose-les">
            {d.sections.map((s) => (
              <section key={s.heading}>
                <h2>{s.heading}</h2>
                {s.paragraphs?.map((p) => <p key={p} className="mt-3">{p}</p>)}
                {s.list ? (
                  <ul>
                    {s.list.map((li) => (
                      <li key={li}>{li}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>
        <nav aria-label="Právní dokumenty" className="card self-start p-5 text-sm">
          <p className="mb-2 font-semibold text-forest-900">Právní informace</p>
          <ul className="space-y-1.5">
            {LEGAL_DOCS.map((x) => (
              <li key={x.slug}>
                <Link href={`/pravni/${x.slug}`} aria-current={x.slug === d.slug ? 'page' : undefined} className={x.slug === d.slug ? 'font-semibold text-forest-700' : 'text-ink/75 hover:text-forest-700'}>
                  {x.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
