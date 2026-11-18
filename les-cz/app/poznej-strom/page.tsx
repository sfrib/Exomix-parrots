import Link from 'next/link';
import type { IdentificationPart } from '@/lib/types';
import { productsByCategory, getProducts } from '@/data/index';
import { pageMetadata } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';
import PlantIllustration from '@/components/PlantIllustration';
import SafetyBadge from '@/components/SafetyBadge';

export const metadata = pageMetadata({
  title: 'Poznej svůj strom – určování dřevin pro chovatele',
  description: 'Jak poznat břízu, vrbu, lísku, lípu a další dřeviny podle celého stromu, listu, kůry, větve, květu a plodu. A které stromy si s nimi plete.',
  path: '/poznej-strom',
});

const PARTS: Array<{ key: IdentificationPart; label: string }> = [
  { key: 'cely', label: 'Celý strom' },
  { key: 'list', label: 'List' },
  { key: 'kura', label: 'Kůra' },
  { key: 'vetev', label: 'Větev' },
  { key: 'kvet', label: 'Květ' },
  { key: 'plod', label: 'Plod' },
];

/** Dřeviny z rizikového oddělení, které je dobré umět poznat. */
const RISKY_TREES = ['tis-cerveny', 'akat', 'stremcha-a-pecky', 'kunsky-kastan', 'tuje', 'zlaty-dest'];

export default function TreeGuidePage() {
  const trees = productsByCategory('vetve-a-stromy');
  const risky = getProducts(RISKY_TREES);
  return (
    <>
      <PageHeader
        eyebrow="B. Poznej svůj strom"
        title="Poznej svůj strom"
        lead="Šest znaků pro každou dřevinu: celý strom, list, kůra, větev, květ a plod. Strom určujte vždy podle více znaků najednou."
        crumbs={[{ name: 'Poznej svůj strom' }]}
      >
        <nav aria-label="Rychlý výběr stromu" className="mt-6 flex flex-wrap gap-2">
          {trees.map((t) => (
            <a key={t.slug} href={`#${t.slug}`} className="chip border-forest-900/15 bg-white/80 px-3 py-1.5 text-sm text-forest-800 hover:border-forest-600">
              {t.name}
            </a>
          ))}
        </nav>
      </PageHeader>

      <div className="container-les space-y-10 py-10">
        <div className="rounded-2xl border border-orange-500/30 bg-orange-50 p-5 text-sm text-ink/85">
          <strong>Fotografie se připravují.</strong> Ke každému znaku doplníme licencovanou fotografii. Do té doby používejte popis spolu s botanickým klíčem
          nebo se poraďte s někým, kdo dřeviny bezpečně zná. Ilustrace na webu nejsou určené k určování rostlin.
        </div>

        {trees.map((t) => (
          <section key={t.slug} id={t.slug} className="card scroll-mt-32 overflow-hidden" aria-labelledby={`h-${t.slug}`}>
            <div className="grid gap-6 p-6 md:grid-cols-[200px_1fr]">
              <PlantIllustration kind={t.visual.kind} color={t.visual.color} accent={t.visual.accent} className="aspect-square w-full rounded-2xl" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 id={`h-${t.slug}`} className="h-display text-3xl">{t.name}</h2>
                  <SafetyBadge level={t.safety.level} />
                </div>
                <p className="italic text-ink/60">{t.latin} · {t.family}</p>
                <p className="mt-2 text-ink/80">{t.safety.summary}</p>
                <Link href={`/produkt/${t.slug}`} className="mt-3 inline-block text-sm font-semibold text-forest-700 hover:underline">
                  Celá produktová karta →
                </Link>
              </div>
            </div>
            <ul className="grid border-t border-forest-900/10 sm:grid-cols-2 lg:grid-cols-3">
              {PARTS.map((part) => (
                <li key={part.key} className="border-b border-r border-forest-900/5 p-5">
                  <div className="mb-3 grid aspect-[4/3] place-items-center rounded-xl bg-[repeating-linear-gradient(45deg,#F3EBDD,#F3EBDD_10px,#EFE4D2_10px,#EFE4D2_20px)] text-xs text-ink/45">
                    Foto: {part.label.toLowerCase()}
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-forest-700">{part.label}</h3>
                  <p className="mt-1 text-sm text-ink/80">{t.identification.parts[part.key] ?? 'Popis se připravuje.'}</p>
                </li>
              ))}
            </ul>
            {t.identification.lookalikes && t.identification.lookalikes.length > 0 ? (
              <div className="border-t border-forest-900/10 bg-berry-50/60 p-5 text-sm">
                <strong className="text-berry-700">Možné záměny: </strong>
                {t.identification.lookalikes.map((l, i) => (
                  <span key={l.name}>
                    {i > 0 ? '; ' : ''}
                    {l.slug ? <Link href={`/produkt/${l.slug}`} className="font-semibold underline">{l.name}</Link> : <strong>{l.name}</strong>} – {l.danger}
                  </span>
                ))}
              </div>
            ) : null}
          </section>
        ))}

        <section className="rounded-[28px] border border-berry-600/25 bg-berry-50 p-8" aria-labelledby="rizikove-stromy">
          <h2 id="rizikove-stromy" className="h-display text-3xl text-berry-700">Stromy a keře, které musíte poznat taky</h2>
          <p className="mt-2 text-ink/80">Tyhle dřeviny do klece nepatří. Rostou v parcích, živých plotech i v lese.</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {risky.map((r) => (
              <li key={r.slug}>
                <Link href={`/produkt/${r.slug}`} className="flex items-center gap-3 rounded-xl border border-berry-600/20 bg-white p-3 hover:border-berry-600">
                  <PlantIllustration kind={r.visual.kind} color={r.visual.color} accent={r.visual.accent} className="h-14 w-14 rounded-lg" />
                  <span>
                    <span className="block font-semibold text-berry-700">{r.name}</span>
                    <span className="block text-xs italic text-ink/60">{r.latin}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
