import Link from 'next/link';
import { CATEGORIES } from '@/data/categories';
import { CAMPAIGNS } from '@/data/seasonal';
import { ARTICLES } from '@/data/articles';
import { PRODUCTS, getProducts, productsByCategory, searchIndex } from '@/data/index';
import { toSearchEntry } from '@/lib/search';
import { currentMonth, seasonOfMonth } from '@/lib/seasons';
import { SITE } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import PlantIllustration from '@/components/PlantIllustration';
import ProductCard from '@/components/ProductCard';
import SeasonalOffer from '@/components/SeasonalOffer';
import SupportLaguna from '@/components/SupportLaguna';
import { LogoMark } from '@/components/Logo';
import { SAFETY_META } from '@/components/SafetyBadge';

export const metadata = pageMetadata({
  title: `${SITE.name} – ${SITE.slogan}`,
  description: SITE.description,
  path: '/',
});

/** Doporučené produkty (výběr redakce). */
const RECOMMENDED = ['lesni-jahody', 'briza', 'pampeliska', 'sisky', 'sipky', 'vrba', 'ptacinec', 'boruvky'];
/** Nejnovější přírůstky do lesa – doplňuje redakce při rozšiřování databáze. */
const NEWEST = ['pupeny', 'cekanka', 'lipovy-kvet', 'drin'];

const USP = [
  { title: 'Doprava zdarma', text: 'Protože žádná není. Chodí se pěšky.' },
  { title: 'Otevřeno nonstop', text: 'Les nezavírá ani o svátcích.' },
  { title: '100 % lokální', text: 'Ze skladu za humny.' },
  { title: 'Vrácení zboží', text: 'Vraťte to do lesa. Les to vezme.' },
];

const TIPS = [
  {
    title: 'Šiška s překvapením',
    text: 'Do čisté šišky zastrčte pár semínek. Papoušek ji bude rozebírat dlouhé minuty – přesně o to jde.',
    href: '/produkt/sisky',
  },
  {
    title: 'Bidla v různých průměrech',
    text: 'Větve různé tloušťky procvičí nohy. Malým papouškům tenké větvičky, velkým silné větve.',
    href: '/produkt/vetvicky',
  },
  {
    title: 'Ovoce je pamlsek',
    text: 'Lesní plody obsahují cukry. Patří do jídelníčku jen v menším množství – jako odměna, ne jako oběd.',
    href: '/poradna/muze-papousek-boruvky',
  },
];

export default function HomePage() {
  const index = searchIndex();
  const entries = Object.fromEntries(index.map((e) => [e.slug, e]));
  const recommended = getProducts(RECOMMENDED).map(toSearchEntry);
  const newest = getProducts(NEWEST).map(toSearchEntry);
  const trees = productsByCategory('vetve-a-stromy').slice(0, 8);
  const risky = productsByCategory('rizikove-zbozi').slice(0, 6);
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c.slug, PRODUCTS.filter((p) => p.category === c.slug).length]));
  const heroItems = getProducts(['lesni-jahody', 'sisky', 'briza']);

  return (
    <>
      {/* 1. ÚVODNÍ BANNER + 2. LOGO + 3. VYHLEDÁVÁNÍ */}
      <section className="relative overflow-hidden bg-forest-900 text-white">
        <HeroForest />
        <div className="container-les relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark className="h-14 w-14 drop-shadow" />
              <span className="rounded-full border border-honey-300/40 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-honey-200">
                E-shop, který nic neprodává
              </span>
            </div>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
              Nejlepší zverimex
              <br />
              <span className="text-honey-300">je les.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/80">
              Lesní plody, větve, byliny a přírodní hračky pro papoušky. Cena: zdarma. Doprava: vlastní nohy.
              K tomu poctivé informace o tom, co je bezpečné – a co ne.
            </p>

            <form action="/hledat" role="search" className="mt-8 max-w-xl">
              <label htmlFor="hero-search" className="block font-display text-xl font-semibold text-white">
                Co hledáte pro svého papouška?
              </label>
              <p id="hero-search-hint" className="mt-1 text-sm text-white/70">
                Zadejte název rostliny, stromu nebo plodu.
              </p>
              <div className="mt-3 flex overflow-hidden rounded-full bg-white p-1.5 shadow-lift">
                <input
                  id="hero-search"
                  name="q"
                  type="search"
                  aria-describedby="hero-search-hint"
                  placeholder="např. bříza, šípky, pampeliška…"
                  className="min-w-0 flex-1 bg-transparent px-4 text-base text-ink outline-none placeholder:text-ink/40"
                />
                <button type="submit" className="btn-buy px-6">Hledat</button>
              </div>
              <p className="mt-3 text-sm text-white/60">
                Oblíbené:{' '}
                {['borůvky', 'bříza', 'šišky', 'tis', 'pampeliška'].map((q, i) => (
                  <span key={q}>
                    {i > 0 ? ', ' : ''}
                    <Link href={`/hledat?q=${encodeURIComponent(q)}`} className="underline decoration-white/30 underline-offset-2 hover:text-honey-200">
                      {q}
                    </Link>
                  </span>
                ))}
              </p>
            </form>
          </div>

          <div className="relative mx-auto hidden h-[500px] w-full max-w-md md:block" aria-hidden="true">
            {heroItems.map((p, i) => (
              <div
                key={p.slug}
                className="absolute w-56 overflow-hidden rounded-2xl border border-white/10 bg-white text-ink shadow-lift"
                style={{
                  left: ['0%', '50%', '20%'][i],
                  top: ['2%', '10%', '52%'][i],
                  transform: `rotate(${[-6, 5, -2][i]}deg)`,
                }}
              >
                <PlantIllustration kind={p.visual.kind} color={p.visual.color} accent={p.visual.accent} className="aspect-[4/3] w-full" />
                <div className="p-3">
                  <p className="font-display font-semibold text-forest-900">{p.name}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-display text-lg font-bold text-forest-700">{p.shop.price}</span>
                    <span className="rounded-full bg-honey-300 px-2.5 py-0.5 text-[11px] font-bold uppercase">Koupit</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="absolute bottom-2 right-0 rotate-[-8deg] rounded-full border-4 border-honey-300 px-5 py-3 text-center font-display text-sm font-bold uppercase leading-tight text-honey-300">
              Doprava
              <br />
              vlastní nohy
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-forest-900/10 bg-sand-100">
        <ul className="container-les grid grid-cols-2 gap-4 py-5 md:grid-cols-4">
          {USP.map((u) => (
            <li key={u.title} className="flex items-start gap-3">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-forest-500" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-forest-900">{u.title}</p>
                <p className="text-xs text-ink/60">{u.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="container-les space-y-20 py-16">
        {/* 4. HLAVNÍ KATEGORIE */}
        <section aria-labelledby="kategorie-title">
          <SectionHead eyebrow="Oddělení lesního skladu" title="Hlavní kategorie" id="kategorie-title" link={{ href: '/obchod', label: 'Celý sortiment' }} />
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/kategorie/${c.slug}`}
                  className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift ${c.slug === 'rizikove-zbozi' ? 'border-berry-600/30' : 'border-forest-900/10'}`}
                >
                  <PlantIllustration kind={c.icon} color={c.color} accent={c.slug === 'rizikove-zbozi' ? '#A3262A' : '#3E7B3A'} className="aspect-[5/3] w-full" />
                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-xs font-semibold text-bark-400">Oddělení {c.letter}</p>
                    <h3 className={`font-display text-lg font-semibold ${c.slug === 'rizikove-zbozi' ? 'text-berry-600' : 'text-forest-900'}`}>{c.name}</h3>
                    <p className="mt-1 hidden text-sm text-ink/70 sm:block">{c.claim}</p>
                    <p className="mt-auto pt-3 text-xs font-semibold text-forest-700">
                      {counts[c.slug]} položek →
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 5. SEZÓNNÍ NABÍDKA */}
        <SeasonalOffer initialSeason={seasonOfMonth(currentMonth())} campaigns={CAMPAIGNS} entries={entries} />

        {/* 6. DOPORUČENÉ PRODUKTY */}
        <section aria-labelledby="doporucene-title">
          <SectionHead eyebrow="Výběr lesního skladníka" title="Doporučené zboží" id="doporucene-title" link={{ href: '/obchod', label: 'Zobrazit vše' }} />
          <ul className="rail lg:grid-cols-4">
            {recommended.map((e) => (
              <li key={e.slug} className="rail-item">
                <ProductCard entry={e} />
              </li>
            ))}
          </ul>
        </section>

        {/* 7. NEJNOVĚJŠÍ PŘÍRŮSTKY + 8. PRODUKTOVÉ TIPY */}
        <section className="grid gap-10 lg:grid-cols-[2fr_1fr]" aria-label="Novinky a tipy">
          <div>
            <SectionHead eyebrow="Právě vyrostlo" title="Nejnovější přírůstky do lesa" id="novinky-title" />
            <ul className="rail">
              {newest.map((e) => (
                <li key={e.slug} className="rail-item">
                  <ProductCard entry={e} highlight="Novinka" />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHead eyebrow="Tipy skladníka" title="Produktové tipy" id="tipy-title" />
            <ul className="space-y-4">
              {TIPS.map((t, i) => (
                <li key={t.title} className="card p-5">
                  <p className="font-display text-3xl font-bold text-honey-400">0{i + 1}</p>
                  <h3 className="mt-1 font-display text-lg font-semibold text-forest-900">{t.title}</h3>
                  <p className="mt-1 text-sm text-ink/75">{t.text}</p>
                  <Link href={t.href} className="mt-3 inline-block text-sm font-semibold text-forest-700 hover:underline">
                    Více →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 9. VZDĚLÁVACÍ SEKCE */}
        <section aria-labelledby="poradna-title" className="paper-texture rounded-[28px] p-8 md:p-12">
          <SectionHead eyebrow="Lesní poradna" title="Nejčastější otázky chovatelů" id="poradna-title" link={{ href: '/poradna', label: 'Všechny články' }} />
          <ul className="rail md:grid-cols-2 lg:grid-cols-3">
            {ARTICLES.slice(0, 6).map((a) => (
              <li key={a.slug} className="rail-item">
                <Link href={`/poradna/${a.slug}`} className="group flex h-full flex-col rounded-2xl border border-bark-500/15 bg-white/80 p-5 transition hover:bg-white hover:shadow-card">
                  <span className="text-2xl" aria-hidden="true">?</span>
                  <h3 className="mt-2 font-display text-lg font-semibold text-forest-900 group-hover:underline">{a.question}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-ink/70">{a.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 10. PRŮVODCE STROMY + 11. PRŮVODCE BEZPEČNÝMI ROSTLINAMI */}
        <section className="grid gap-6 lg:grid-cols-2" aria-label="Průvodci">
          <div className="card flex flex-col p-8">
            <p className="eyebrow">Průvodce stromy</p>
            <h2 className="h-display mt-2 text-3xl">Poznej svůj strom</h2>
            <p className="mt-3 text-ink/75">
              Celý strom, list, kůra, větev, květ a plod. Šest znaků, podle kterých bezpečně poznáte dřevinu dřív, než z ní uříznete bidýlko.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {trees.map((t) => (
                <li key={t.slug}>
                  <Link href={`/poznej-strom#${t.slug}`} className="chip border-forest-900/15 bg-sand-50 px-3 py-1.5 text-sm text-forest-800 hover:border-forest-600">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/poznej-strom" className="btn-primary mt-auto self-start">Otevřít průvodce stromy</Link>
          </div>
          <div className="card flex flex-col p-8">
            <p className="eyebrow">Průvodce bezpečnými rostlinami</p>
            <h2 className="h-display mt-2 text-3xl">Je to pro papouška bezpečné?</h2>
            <p className="mt-3 text-ink/75">Napište název rostliny a uvidíte, jak na tom je. Barvy znamenají:</p>
            <ul className="mt-4 space-y-2 text-sm">
              {(['doporuceno', 'stridme', 'neovereno', 'rizikove'] as const).map((l) => (
                <li key={l} className="flex items-start gap-2">
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${SAFETY_META[l].dot}`} aria-hidden="true" />
                  <span>
                    <strong>{SAFETY_META[l].short}:</strong> {SAFETY_META[l].description}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm font-semibold text-berry-600">Nejčastější nebezpečné zboží:</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {risky.map((r) => (
                <li key={r.slug}>
                  <Link href={`/produkt/${r.slug}`} className="chip border-berry-600/25 bg-berry-50 px-3 py-1.5 text-sm text-berry-700 hover:border-berry-600">
                    {r.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/je-to-bezpecne" className="btn-primary mt-6 self-start">Ověřit rostlinu</Link>
          </div>
        </section>

        {/* 12. DOBROVOLNÁ PODPORA LAGUNY */}
        <SupportLaguna />
      </div>
    </>
  );
}

function SectionHead({ eyebrow, title, id, link }: { eyebrow: string; title: string; id: string; link?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="h-display mt-1 text-3xl md:text-4xl">
          {title}
        </h2>
      </div>
      {link ? (
        <Link href={link.href} className="text-sm font-semibold text-forest-700 hover:underline">
          {link.label} →
        </Link>
      ) : null}
    </div>
  );
}

/** Dekorativní siluety lesa v pozadí hero banneru. */
function HeroForest() {
  const trees = Array.from({ length: 18 }).map((_, i) => ({
    x: i * 90 - 40 + (i % 3) * 14,
    h: 160 + ((i * 53) % 120),
    o: 0.08 + ((i * 7) % 5) * 0.025,
  }));
  return (
    <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-72 w-full" viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      {trees.map((t, i) => (
        <path key={i} d={`M${t.x} 300 L ${t.x + 45} ${300 - t.h} L ${t.x + 90} 300 Z`} fill="#86B67A" opacity={t.o} />
      ))}
      <rect y="292" width="1600" height="8" fill="#0B1F13" opacity="0.6" />
    </svg>
  );
}
