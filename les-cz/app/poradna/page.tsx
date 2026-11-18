import Link from 'next/link';
import { ARTICLES } from '@/data/articles';
import { pageMetadata } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';

export const metadata = pageMetadata({
  title: 'Lesní poradna – otázky chovatelů papoušků',
  description: 'Jaké větve může papoušek okusovat? Může papoušek borůvky? Jsou šišky bezpečné? Odpovědi na nejčastější otázky chovatelů.',
  path: '/poradna',
});

export default function AdvicePage() {
  return (
    <>
      <PageHeader eyebrow="Vzdělávání" title="Lesní poradna" lead="Odpovědi na otázky, které chovatelé papoušků zadávají do vyhledávače nejčastěji." crumbs={[{ name: 'Lesní poradna' }]} />
      <div className="container-les py-10">
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((a) => (
            <li key={a.slug}>
              <Link href={`/poradna/${a.slug}`} className="group card flex h-full flex-col p-6 transition hover:shadow-lift">
                <h2 className="h-display text-2xl group-hover:underline">{a.title}</h2>
                <p className="mt-2 text-sm text-ink/70">{a.description}</p>
                <span className="mt-auto pt-4 text-sm font-semibold text-forest-700">Číst →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
