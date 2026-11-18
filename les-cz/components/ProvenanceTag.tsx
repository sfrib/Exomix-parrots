import type { Provenance } from '@/lib/types';
import { SOURCE_MAP } from '@/data/sources';

export const PROVENANCE_META: Record<Provenance, { label: string; long: string; className: string }> = {
  A: {
    label: 'A · ExoMix',
    long: 'Převzato z projektu ExoMix',
    className: 'border-sky-700/25 bg-sky-50 text-sky-900',
  },
  B: {
    label: 'B · Literatura',
    long: 'Dohledáno v odborné literatuře',
    className: 'border-forest-700/25 bg-forest-50 text-forest-800',
  },
  C: {
    label: 'C · K ověření',
    long: 'Pracovní text – nutno ověřit',
    className: 'border-orange-600/30 bg-orange-50 text-orange-900',
  },
};

export default function ProvenanceTag({ provenance, sourceIds }: { provenance: Provenance; sourceIds?: string[] }) {
  const meta = PROVENANCE_META[provenance];
  const sources = (sourceIds ?? []).map((id) => SOURCE_MAP[id]?.citation).filter(Boolean);
  const title = [meta.long, ...sources].join('\n');
  return (
    <span className={`chip ${meta.className} whitespace-nowrap px-2 py-0.5 text-[11px]`} title={title}>
      {meta.label}
      {sourceIds && sourceIds.length > 0 ? <span className="opacity-70">· {sourceIds.length} zdr.</span> : null}
    </span>
  );
}
