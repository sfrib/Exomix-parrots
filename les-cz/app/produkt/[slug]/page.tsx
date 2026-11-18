import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { IdentificationPart, Product, Sourced } from '@/lib/types';
import { PRODUCTS, getProduct, relatedProducts } from '@/data/index';
import { CATEGORY_MAP } from '@/data/categories';
import { SOURCE_MAP } from '@/data/sources';
import { GENERAL_COLLECTING_RULES } from '@/data/helpers';
import { formatMonths } from '@/lib/seasons';
import { toSearchEntry } from '@/lib/search';
import { pageMetadata, productJsonLd } from '@/lib/seo';
import Breadcrumbs from '@/components/Breadcrumbs';
import BuyButton from '@/components/BuyButton';
import JsonLd from '@/components/JsonLd';
import MonthBar from '@/components/MonthBar';
import PlantIllustration from '@/components/PlantIllustration';
import ProductCard from '@/components/ProductCard';
import ProvenanceTag, { PROVENANCE_META } from '@/components/ProvenanceTag';
import SafetyBadge, { SAFETY_META } from '@/components/SafetyBadge';
import SupportLaguna from '@/components/SupportLaguna';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getProduct(params.slug);
  if (!p) return {};
  return pageMetadata({
    title: p.seo?.title?.replace(/\s*\|\s*LES\.cz\s*$/, '') ?? `${p.name} pro papoušky`,
    description: p.seo?.description ?? p.safety.summary.slice(0, 158),
    path: `/produkt/${p.slug}`,
    ogType: 'article',
  });
}

const ID_PARTS: Array<{ key: IdentificationPart; label: string }> = [
  { key: 'cely', label: 'Celá rostlina / strom' },
  { key: 'list', label: 'List' },
  { key: 'kura', label: 'Kůra' },
  { key: 'vetev', label: 'Větev' },
  { key: 'kvet', label: 'Květ' },
  { key: 'plod', label: 'Plod' },
];

export default function ProductPage({ params }: { params: { slug: string } }) {
  const p = getProduct(params.slug);
  if (!p) notFound();
  const category = CATEGORY_MAP[p.category];
  const risky = p.category === 'rizikove-zbozi';
  const related = relatedProducts(p).map(toSearchEntry);
  const reviewed = p.review.reviewedAt
    ? new Date(p.review.reviewedAt).toLocaleDateString('cs-CZ')
    : null;

  return (
    <article>
      <JsonLd data={productJsonLd(p)} />
      <div className="container-les pt-6">
        <Breadcrumbs items={[{ name: category.name, href: `/kategorie/${category.slug}` }, { name: p.name }]} />
      </div>

      {/* HLAVIČKA PRODUKTU */}
      <section className="container-les grid gap-10 py-8 lg:grid-cols-[1.05fr_1fr]">
        <div>
          {/* 1. Fotografie / ilustrace */}
          <figure className={`overflow-hidden rounded-[28px] border ${risky ? 'border-berry-600/30' : 'border-forest-900/10'} bg-white shadow-card`}>
            <PlantIllustration kind={p.visual.kind} color={p.visual.color} accent={p.visual.accent} className="aspect-square w-full" title={`Ilustrace: ${p.name}`} />
            <figcaption className="border-t border-forest-900/10 px-5 py-3 text-xs text-ink/60">
              Ilustrace slouží jako produktový obrázek a <strong>není určena k určování rostliny</strong>. Fotografie pro
              identifikaci najdete níže.
            </figcaption>
          </figure>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/kategorie/${category.slug}`} className="chip border-forest-900/15 bg-white text-forest-800 hover:border-forest-600">
              {category.letter}. {category.name}
            </Link>
            {p.shop.badge ? <span className={`chip border-transparent ${risky ? 'bg-berry-600' : 'bg-forest-800'} text-white`}>{p.shop.badge}</span> : null}
          </div>
          {/* 2.–4. Název, latinský název, čeleď */}
          <h1 className="h-display mt-4 text-4xl md:text-5xl">{p.name}</h1>
          <p className="mt-2 text-lg italic text-ink/70">{p.latin}</p>
          <p className="text-sm text-ink/60">Čeleď: {p.family}</p>
          <p className="mt-4 font-display text-xl text-forest-800">{p.tagline}</p>

          <div className={`mt-6 rounded-2xl border p-5 ${SAFETY_META[p.safety.level].className}`}>
            <div className="flex flex-wrap items-center gap-2">
              <SafetyBadge level={p.safety.level} size="lg" />
              <ProvenanceTag provenance={p.safety.provenance} sourceIds={p.safety.sourceIds} />
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/85">{p.safety.summary}</p>
          </div>

          {/* „Cenovka“ */}
          <div className="mt-6 rounded-2xl border border-forest-900/10 bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-ink/50">Cena</p>
                <p className={`font-display text-4xl font-bold ${risky ? 'text-berry-600' : 'text-forest-700'}`}>{p.shop.price}</p>
              </div>
              <BuyButton productName={p.name} message={p.shop.buyMessage} risky={risky} />
            </div>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wider text-ink/50">Dostupnost</dt>
                <dd className="font-semibold text-forest-900">{p.shop.availability}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-ink/50">Sklad</dt>
                <dd className="text-ink/85">{p.shop.warehouse}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-ink/50">Doprava</dt>
                <dd className="text-ink/85">{p.shop.shipping}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-ink/55">
              Parodie e-shopu: nic se neprodává, neobjednává ani neposílá. <Link href="/pravni/pravidla-uzivani" className="underline">Proč?</Link>
            </p>
          </div>

          {/* 6. Dostupnost podle sezóny */}
          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold text-forest-900">
              {risky ? 'Kdy je nejnápadnější' : 'Sezóna'}: <span className="font-normal text-ink/75">{formatMonths(p.months)}</span>
            </p>
            <MonthBar months={p.months} risky={risky} />
          </div>

          {/* 20. Stav odborné kontroly */}
          <ReviewBox product={p} reviewed={reviewed} />
        </div>
      </section>

      {/* DETAILNÍ INFORMACE */}
      <div className="container-les grid gap-10 pb-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <InfoSection n={7} title={risky ? 'Nebezpečné části rostliny' : 'Část rostliny vhodná k použití'} data={p.parts} />

          <section className="card p-6" aria-labelledby="sec-nutrition">
            <SectionTitle id="sec-nutrition" n={8} title={risky ? 'Obsahové látky' : 'Nutriční charakteristika'} provenance={p.nutrition.summary.provenance} sourceIds={p.nutrition.summary.sourceIds} />
            <p className="mt-3 leading-relaxed text-ink/85">{p.nutrition.summary.text}</p>
            {p.nutrition.values && p.nutrition.values.length > 0 ? (
              <div className="mt-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-forest-900">9. Obsah důležitých živin (na 100 g)</h3>
                  {p.nutrition.valuesProvenance ? <ProvenanceTag provenance={p.nutrition.valuesProvenance} sourceIds={p.nutrition.valuesSourceIds} /> : null}
                </div>
                <table className="mt-2 w-full text-sm">
                  <tbody>
                    {p.nutrition.values.map((v) => (
                      <tr key={v.label} className="border-b border-forest-900/10 last:border-0">
                        <th scope="row" className="py-2 text-left font-normal text-ink/75">{v.label}</th>
                        <td className="py-2 text-right font-semibold tabular-nums text-forest-900">
                          {v.amount.toLocaleString('cs-CZ')} {v.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {p.nutrition.valuesBasis ? <p className="mt-2 text-xs text-ink/55">{p.nutrition.valuesBasis}</p> : null}
              </div>
            ) : (
              <p className="mt-4 text-xs text-ink/55">9. Číselné hodnoty živin: pro tento materiál nemáme spolehlivý zdroj, proto je neuvádíme.</p>
            )}
          </section>

          <InfoSection n={10} title={risky ? 'Přínos pro papouška' : 'Přínos pro papouška'} data={p.benefits} />

          <section className="card p-6" aria-labelledby="sec-species">
            <SectionTitle id="sec-species" n={11} title="Vhodnost podle druhů papoušků" provenance={p.species.provenance} sourceIds={p.species.sourceIds} />
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ['Malí papoušci', 'andulka, korela, agapornis, papoušíček, neofémy', p.species.mali],
                ['Střední papoušci', 'pyrury, aratingy, rozely, horští papoušci', p.species.stredni],
                ['Velcí papoušci', 'ary, amazoňani, žako, kakaduové', p.species.velci],
              ].map(([title, examples, text]) => (
                <div key={title} className="rounded-xl bg-sand-100 p-4">
                  <dt className="font-semibold text-forest-900">{title}</dt>
                  <dd className="text-xs text-ink/55">{examples}</dd>
                  <dd className="mt-2 text-sm text-ink/85">{text}</dd>
                </div>
              ))}
            </dl>
            {p.species.poznamka ? <p className="mt-3 text-sm text-ink/75">{p.species.poznamka}</p> : null}
            <p className="mt-3 text-xs text-ink/55">
              Rozdělení do skupin odpovídá kategoriím projektu ExoMix (malý papoušek / střední papoušek / velký papoušek).
            </p>
          </section>

          <InfoSection n={12} title="Způsob podávání" data={p.serving} />
          <InfoSection n={13} title="Příprava před podáním" data={p.preparation} />

          <section className={`card p-6 ${risky ? 'border-berry-600/30' : ''}`} aria-labelledby="sec-risks">
            <SectionTitle id="sec-risks" n={14} title={risky ? 'Rizika a co dělat' : 'Možná rizika'} provenance={p.risks.provenance} sourceIds={p.risks.sourceIds} />
            <ul className="mt-3 space-y-2">
              {p.risks.items.map((r) => (
                <li key={r} className="flex gap-2 text-ink/85">
                  <span className="mt-0.5 text-berry-600" aria-hidden="true">▲</span>
                  {r}
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-6" aria-labelledby="sec-collect">
            <SectionTitle id="sec-collect" n={15} title={risky ? 'Sběr' : 'Způsob bezpečného sběru'} provenance={p.collecting.provenance} sourceIds={p.collecting.sourceIds} />
            <p className="mt-3 leading-relaxed text-ink/85">{p.collecting.text}</p>
            {!risky ? (
              <details className="mt-4 rounded-xl bg-sand-100 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-forest-900">Obecná pravidla sběru (platí vždy)</summary>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink/80">
                  {GENERAL_COLLECTING_RULES.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </details>
            ) : null}
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <InfoSection n={16} title={risky ? 'Kde roste' : 'Kde rostlinu najít'} data={p.habitat} />
            <InfoSection n={17} title={risky ? 'Kdy je nejnebezpečnější' : 'Kdy sbírat'} data={p.whenToCollect} />
          </div>

          {/* 18. Identifikace */}
          <section className="card p-6" aria-labelledby="sec-id">
            <SectionTitle id="sec-id" n={18} title="Fotografie a znaky pro identifikaci" provenance={p.identification.provenance} sourceIds={p.identification.sourceIds} />
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ID_PARTS.filter((part) => p.identification.parts[part.key]).map((part) => {
                const photo = p.photos.find((ph) => ph.part === part.key);
                return (
                  <li key={part.key} className="overflow-hidden rounded-xl border border-forest-900/10 bg-sand-50">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo.src} alt={photo.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    ) : (
                      <div className="grid aspect-[4/3] place-items-center bg-[repeating-linear-gradient(45deg,#F3EBDD,#F3EBDD_10px,#EFE4D2_10px,#EFE4D2_20px)] p-3 text-center text-xs text-ink/50">
                        Fotografie „{part.label.toLowerCase()}“ se připravuje
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-semibold text-forest-900">{part.label}</p>
                      <p className="mt-1 text-sm text-ink/80">{p.identification.parts[part.key]}</p>
                      {photo ? <p className="mt-1 text-[11px] text-ink/50">Foto: {photo.author}, {photo.license}</p> : null}
                    </div>
                  </li>
                );
              })}
            </ul>
            {p.identification.lookalikes && p.identification.lookalikes.length > 0 ? (
              <div className="mt-6 rounded-xl border border-berry-600/20 bg-berry-50 p-4">
                <h3 className="font-semibold text-berry-700">Pozor na záměnu</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {p.identification.lookalikes.map((l) => (
                    <li key={l.name}>
                      {l.slug ? (
                        <Link href={`/produkt/${l.slug}`} className="font-semibold text-berry-700 underline underline-offset-2">
                          {l.name}
                        </Link>
                      ) : (
                        <strong className="text-berry-700">{l.name}</strong>
                      )}
                      {l.latin ? <em className="text-ink/60"> ({l.latin})</em> : null} – <span className="text-ink/80">{l.danger}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="mt-4 text-xs text-ink/55">
              Popisy nenahrazují určení odborníkem. Pokud si nejste jistí na 100 %, rostlinu nesbírejte.
            </p>
          </section>

          {p.exomix && p.exomix.length > 0 ? (
            <section className="card border-sky-700/20 p-6" aria-labelledby="sec-exomix">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="sec-exomix" className="font-display text-xl font-semibold text-forest-900">Z databáze ExoMix</h2>
                <ProvenanceTag provenance="A" sourceIds={['exomix']} />
              </div>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink/85">
                {p.exomix.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* 19. Odborné zdroje */}
          <section className="card p-6" aria-labelledby="sec-sources">
            <h2 id="sec-sources" className="font-display text-xl font-semibold text-forest-900">
              <span className="mr-2 text-honey-500">19</span>Odborné zdroje
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink/80">
              {p.sourceIds.map((id) => {
                const s = SOURCE_MAP[id];
                if (!s) return null;
                return (
                  <li key={id}>
                    {s.citation}{' '}
                    {s.url ? (
                      <a href={s.url} className="text-forest-700 underline" rel="noopener nofollow">
                        odkaz
                      </a>
                    ) : null}
                    {s.note ? <span className="block text-xs text-ink/55">{s.note}</span> : null}
                  </li>
                );
              })}
            </ol>
            <p className="mt-3 text-xs text-ink/55">
              Legenda původu informací:{' '}
              {(['A', 'B', 'C'] as const).map((k) => `${PROVENANCE_META[k].label} = ${PROVENANCE_META[k].long}`).join(' · ')}.{' '}
              <Link href="/zdroje" className="underline">Metodika</Link>
            </p>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          <nav aria-label="Obsah karty" className="card p-5 text-sm">
            <p className="mb-2 font-semibold text-forest-900">Na této kartě</p>
            <ul className="space-y-1.5 text-ink/75">
              {[
                ['#sec-nutrition', 'Živiny'],
                ['#sec-species', 'Vhodnost podle druhů'],
                ['#sec-risks', 'Rizika'],
                ['#sec-collect', 'Sběr'],
                ['#sec-id', 'Identifikace'],
                ['#sec-sources', 'Zdroje'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="hover:text-forest-700 hover:underline">{label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="card p-5 text-sm text-ink/75">
            <p className="font-semibold text-forest-900">Nejste si jistí?</p>
            <p className="mt-1">
              Informace na LES.cz nenahrazují konzultaci s veterinářem se zaměřením na ptáky. Při podezření na otravu jednejte okamžitě.
            </p>
            <Link href="/pravni/odborne-upozorneni" className="mt-2 inline-block font-semibold text-forest-700 hover:underline">Odborné upozornění →</Link>
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="container-les py-10" aria-labelledby="related-title">
          <h2 id="related-title" className="h-display mb-6 text-3xl">Zákazníci, kteří si „koupili“ tohle, šli do lesa i pro…</h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((e) => (
              <li key={e.slug}>
                <ProductCard entry={e} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="container-les">
        <SupportLaguna compact />
      </div>
    </article>
  );
}

function SectionTitle({ id, n, title, provenance, sourceIds }: { id: string; n: number; title: string; provenance: Sourced['provenance']; sourceIds?: string[] }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 id={id} className="font-display text-xl font-semibold text-forest-900">
        <span className="mr-2 text-honey-500">{n}</span>
        {title}
      </h2>
      <ProvenanceTag provenance={provenance} sourceIds={sourceIds} />
    </div>
  );
}

function InfoSection({ n, title, data }: { n: number; title: string; data: Sourced }) {
  const id = `sec-${n}`;
  return (
    <section className="card p-6" aria-labelledby={id}>
      <SectionTitle id={id} n={n} title={title} provenance={data.provenance} sourceIds={data.sourceIds} />
      <p className="mt-3 leading-relaxed text-ink/85">{data.text}</p>
    </section>
  );
}

function ReviewBox({ product, reviewed }: { product: Product; reviewed: string | null }) {
  const status = product.review.status;
  return (
    <div className={`mt-6 rounded-2xl border p-4 text-sm ${status === 'overeno' ? 'border-forest-600/30 bg-forest-50' : 'border-orange-500/30 bg-orange-50'}`}>
      <p className="font-semibold text-forest-900">
        Odborná kontrola:{' '}
        {status === 'overeno' ? 'ověřeno' : status === 'v-kontrole' ? 'probíhá' : 'čeká na kontrolu veterinářem'}
      </p>
      <p className="mt-1 text-ink/75">
        Datum poslední odborné kontroly: <strong>{reviewed ?? 'zatím neproběhla'}</strong>
        {product.review.reviewer ? ` · ${product.review.reviewer}` : ''}
      </p>
      {status !== 'overeno' ? (
        <p className="mt-1 text-xs text-ink/60">
          Obsah je pracovní návrh. U každé informace vidíte její původ (A – ExoMix, B – literatura, C – k ověření).
        </p>
      ) : null}
    </div>
  );
}
