import Link from 'next/link';
import type { SearchEntry } from '@/lib/search';
import { CATEGORY_MAP } from '@/data/categories';
import PlantIllustration from './PlantIllustration';
import SafetyBadge from './SafetyBadge';

/** Produktová karta – přijímá kompaktní záznam, takže funguje na serveru i v klientském katalogu. */
export default function ProductCard({ entry, highlight }: { entry: SearchEntry; highlight?: string }) {
  const category = CATEGORY_MAP[entry.category];
  const risky = entry.category === 'rizikove-zbozi';
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-forest-900/10 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden">
        <PlantIllustration kind={entry.visual.kind} color={entry.visual.color} accent={entry.visual.accent} className="h-full w-full transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {entry.badge ? (
            <span className={`chip border-transparent ${risky ? 'bg-berry-600 text-white' : 'bg-forest-800 text-white'}`}>{entry.badge}</span>
          ) : null}
          {highlight ? <span className="chip border-transparent bg-honey-300 text-forest-950">{highlight}</span> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-bark-400">{category?.shortName}</span>
          <SafetyBadge level={entry.safety} />
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug text-forest-900">
          <Link href={`/produkt/${entry.slug}`} className="after:absolute after:inset-0">
            {entry.name}
          </Link>
        </h3>
        <p className="text-xs italic text-ink/55">{entry.latin}</p>
        <p className="line-clamp-2 text-sm text-ink/75">{entry.tagline}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p className={`font-display text-xl font-bold ${risky ? 'text-berry-600' : 'text-forest-700'}`}>{entry.price}</p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink/55">{entry.availability}</p>
          </div>
          <span className="rounded-full bg-sand-200 px-3 py-1 text-xs font-semibold text-forest-800 transition group-hover:bg-honey-300">
            Detail →
          </span>
        </div>
      </div>
    </article>
  );
}
