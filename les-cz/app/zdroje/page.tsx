import { SOURCES } from '@/data/sources';
import { PRODUCTS } from '@/data/index';
import { pageMetadata } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';
import { PROVENANCE_META } from '@/components/ProvenanceTag';
import type { Provenance } from '@/lib/types';

export const metadata = pageMetadata({
  title: 'Odborné zdroje a metodika',
  description: 'Odkud LES.cz bere informace, jak rozlišuje ověřené a neověřené údaje a jak probíhá odborná kontrola.',
  path: '/zdroje',
});

export default function SourcesPage() {
  const sections = PRODUCTS.flatMap((p) => [p.safety, p.parts, p.benefits, p.serving, p.preparation, p.collecting, p.habitat, p.whenToCollect, p.nutrition.summary, p.risks, p.species, p.identification]);
  const counts = (['A', 'B', 'C'] as Provenance[]).map((k) => [k, sections.filter((s) => s.provenance === k).length] as const);
  const total = sections.length;
  const reviewed = PRODUCTS.filter((p) => p.review.status === 'overeno').length;

  return (
    <>
      <PageHeader eyebrow="Metodika" title="Odborné zdroje a metodika" lead="Jak poznáte, čemu na LES.cz věřit. Každá informace nese svůj původ." crumbs={[{ name: 'Odborné zdroje' }]} />
      <div className="container-les space-y-10 py-10">
        <section className="grid gap-4 md:grid-cols-3">
          {counts.map(([k, n]) => (
            <div key={k} className={`rounded-2xl border p-6 ${PROVENANCE_META[k].className}`}>
              <p className="font-display text-4xl font-bold">{Math.round((n / total) * 100)} %</p>
              <p className="mt-1 font-semibold">{PROVENANCE_META[k].label}</p>
              <p className="text-sm opacity-80">{PROVENANCE_META[k].long} ({n} z {total} obsahových bloků)</p>
            </div>
          ))}
        </section>
        <p className="max-w-3xl text-ink/80">
          Odbornou kontrolou veterinářem zatím prošlo <strong>{reviewed}</strong> z {PRODUCTS.length} produktových karet. Do té doby je
          obsah veden jako návrh a na každé kartě je to výslovně uvedeno.
        </p>

        <section className="prose-les max-w-3xl">
          <h2 className="!mt-0">Jak s informacemi pracujeme</h2>
          <ul>
            <li><strong>A – ExoMix:</strong> údaje převzaté z projektu ExoMix (repozitář výživového konfigurátoru VetExotic).</li>
            <li><strong>B – literatura:</strong> údaj se opírá o uvedený odborný zdroj. Při odborné kontrole se doplní konkrétní kapitola a strana.</li>
            <li><strong>C – k ověření:</strong> pracovní text vycházející z chovatelské praxe nebo obecných znalostí. Musí ho potvrdit odborník.</li>
            <li>Nevymýšlíme čísla. Nutriční hodnoty uvádíme jen tam, kde existuje databázový záznam, a vždy s uvedením, k čemu se vztahují.</li>
            <li>Rostlinu nikdy neoznačíme jako „bezpečnou pro všechny papoušky“.</li>
          </ul>
        </section>

        <section>
          <h2 className="h-display text-3xl">Registr zdrojů</h2>
          <ol className="mt-4 space-y-3">
            {SOURCES.map((s) => (
              <li key={s.id} className="card p-5 text-sm">
                <p className="text-ink/90">{s.citation}</p>
                {s.url ? (
                  <a href={s.url} className="mt-1 inline-block text-forest-700 underline" rel="noopener nofollow">{s.url}</a>
                ) : null}
                {s.note ? <p className="mt-1 text-xs text-ink/60">{s.note}</p> : null}
                <p className="mt-1 text-xs text-ink/50">Použito u {PRODUCTS.filter((p) => p.sourceIds.includes(s.id)).length} karet · id: {s.id}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
