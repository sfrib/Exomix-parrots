import type { SafetyLevel } from '@/lib/types';

export const SAFETY_META: Record<SafetyLevel, { label: string; short: string; className: string; dot: string; description: string }> = {
  doporuceno: {
    label: 'Běžně podáváno',
    short: 'Vhodné',
    className: 'border-forest-600/30 bg-forest-50 text-forest-800',
    dot: 'bg-forest-500',
    description: 'V literatuře a chovatelské praxi běžně podáváno. I tak platí správná příprava a přiměřené množství.',
  },
  stridme: {
    label: 'Střídmě / s podmínkou',
    short: 'Střídmě',
    className: 'border-honey-500/40 bg-honey-100 text-bark-700',
    dot: 'bg-honey-400',
    description: 'Jen omezené množství, jen určitá část rostliny nebo jen po úpravě.',
  },
  neovereno: {
    label: 'Neověřeno – nepodávat bez konzultace',
    short: 'Neověřeno',
    className: 'border-orange-500/40 bg-orange-50 text-orange-900',
    dot: 'bg-orange-500',
    description: 'Podklady jsou rozporné nebo chybí. Nepodávejte bez konzultace s veterinářem.',
  },
  rizikove: {
    label: 'Rizikové – nepodávat',
    short: 'Rizikové',
    className: 'border-berry-600/40 bg-berry-50 text-berry-700',
    dot: 'bg-berry-600',
    description: 'Jedovaté nebo prokazatelně nevhodné. Nepodávat.',
  },
};

export default function SafetyBadge({ level, size = 'sm' }: { level: SafetyLevel; size?: 'sm' | 'lg' }) {
  const meta = SAFETY_META[level];
  return (
    <span className={`chip ${meta.className} ${size === 'lg' ? 'px-4 py-1.5 text-sm' : ''}`} title={meta.description}>
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} aria-hidden="true" />
      {size === 'lg' ? meta.label : meta.short}
    </span>
  );
}
