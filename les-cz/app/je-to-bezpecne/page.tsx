import Link from 'next/link';
import { Suspense } from 'react';
import { PRODUCTS, searchIndex } from '@/data/index';
import { pageMetadata } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';
import SearchResults from '@/components/SearchResults';
import { SAFETY_META } from '@/components/SafetyBadge';
import type { SafetyLevel } from '@/lib/types';

export const metadata = pageMetadata({
  title: 'Je to pro papouška bezpečné?',
  description: 'Rychlé ověření rostliny podle názvu: je vhodná pro papouška, jen střídmě, neověřená, nebo jedovatá? S vysvětlením a zdroji.',
  path: '/je-to-bezpecne',
});

const LEVELS: SafetyLevel[] = ['doporuceno', 'stridme', 'neovereno', 'rizikove'];

export default function SafetyCheckerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Nástroj pro chovatele"
        title="Je to pro papouška bezpečné?"
        lead="Napište název rostliny, stromu nebo plodu. Dozvíte se, jak na tom je, a na kartě najdete přípravu, rizika i znaky pro určení."
        crumbs={[{ name: 'Je to bezpečné?' }]}
      />
      <div className="container-les py-10">
        <Suspense fallback={<p>Načítám les…</p>}>
          <SearchResults entries={searchIndex()} mode="safety" />
        </Suspense>

        <section className="mt-16" aria-labelledby="abeceda">
          <h2 id="abeceda" className="h-display text-3xl">Celý seznam podle bezpečnosti</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {LEVELS.map((level) => {
              const items = PRODUCTS.filter((p) => p.safety.level === level).sort((a, b) => a.name.localeCompare(b.name, 'cs'));
              return (
                <div key={level} className={`rounded-2xl border p-5 ${SAFETY_META[level].className}`}>
                  <h3 className="font-display text-xl font-semibold">{SAFETY_META[level].label}</h3>
                  <p className="mt-1 text-xs opacity-80">{SAFETY_META[level].description}</p>
                  <ul className="mt-3 space-y-1 text-sm">
                    {items.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/produkt/${p.slug}`} className="hover:underline">
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="mt-6 max-w-3xl text-sm text-ink/60">
            Zařazení vychází z odborné literatury a chovatelské praxe a čeká na odbornou kontrolu veterinářem. Rostlina, která v seznamu není,
            není automaticky bezpečná.
          </p>
        </section>
      </div>
    </>
  );
}
