import Link from 'next/link';
import { CATEGORIES } from '@/data/categories';
import { PRODUCTS, searchIndex } from '@/data/index';
import { MONTH_NAMES, MONTH_SHORT } from '@/lib/seasons';
import { pageMetadata } from '@/lib/seo';
import MonthPicker from '@/components/MonthPicker';
import PageHeader from '@/components/PageHeader';

export const metadata = pageMetadata({
  title: 'Co roste právě teď? Kalendář sběru pro papoušky',
  description: 'Sezónní kalendář: co se dá pro papouška nasbírat v každém měsíci – lesní plody, větve, byliny i přírodní hračky.',
  path: '/co-roste-ted',
});

export default function WhatGrowsNowPage() {
  return (
    <>
      <PageHeader
        eyebrow="Kalendář lesního skladu"
        title="Co roste právě teď?"
        lead="Vyberte měsíc a podívejte se, co je v lese naskladněno. Pod tím najdete celoroční kalendář sběru."
        crumbs={[{ name: 'Co roste teď' }]}
      />
      <div className="container-les py-10">
        <MonthPicker entries={searchIndex()} />

        <section className="mt-16" aria-labelledby="kalendar">
          <h2 id="kalendar" className="h-display text-3xl">Co můžu nasbírat? Celoroční kalendář</h2>
          <p className="mt-2 text-ink/70">Zelená = vhodná doba sběru. Kalendář je orientační – záleží na nadmořské výšce a počasí.</p>
          {CATEGORIES.filter((c) => c.slug !== 'rizikove-zbozi').map((c) => (
            <div key={c.slug} className="mt-8">
              <h3 className="font-display text-xl font-semibold text-forest-900">{c.name}</h3>
              <div className="mt-3 overflow-x-auto rounded-2xl border border-forest-900/10 bg-white">
                <table className="w-full min-w-[720px] text-sm">
                  <caption className="sr-only">Kalendář sběru – {c.name}</caption>
                  <thead>
                    <tr className="bg-sand-100 text-xs uppercase text-ink/60">
                      <th scope="col" className="px-3 py-2 text-left">Položka</th>
                      {MONTH_SHORT.map((m, i) => (
                        <th key={m} scope="col" className="px-1 py-2 text-center" title={MONTH_NAMES[i]}>{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PRODUCTS.filter((p) => p.category === c.slug).map((p) => (
                      <tr key={p.slug} className="border-t border-forest-900/5">
                        <th scope="row" className="px-3 py-2 text-left font-medium">
                          <Link href={`/produkt/${p.slug}`} className="hover:text-forest-700 hover:underline">{p.name}</Link>
                        </th>
                        {MONTH_SHORT.map((m, i) => {
                          const on = p.months.includes(i + 1);
                          return (
                            <td key={m} className="px-0.5 py-1.5">
                              <span className={`block h-5 rounded ${on ? 'bg-forest-500' : 'bg-sand-200'}`} title={`${MONTH_NAMES[i]}: ${on ? 'ano' : 'ne'}`}>
                                <span className="sr-only">{on ? 'ano' : 'ne'}</span>
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
