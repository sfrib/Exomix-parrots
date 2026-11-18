import type { Provenance, ReviewStatus, Sourced, SourcedList } from '@/lib/types';

/** A – informace převzatá z ExoMixu. */
export const a = (text: string, ...sourceIds: string[]): Sourced => ({
  text,
  provenance: 'A',
  sourceIds: ['exomix', ...sourceIds],
});

/** B – informace dohledaná v odborné literatuře (uveďte zdroje ze `sources.ts`). */
export const b = (text: string, ...sourceIds: string[]): Sourced => ({ text, provenance: 'B', sourceIds });

/** C – informace, kterou je nutné ověřit. */
export const c = (text: string, ...sourceIds: string[]): Sourced => ({ text, provenance: 'C', sourceIds });

/** Seznam s původem. */
export const list = (provenance: Provenance, items: string[], ...sourceIds: string[]): SourcedList => ({
  items,
  provenance,
  sourceIds,
});

/** Výchozí stav odborné kontroly – žádný produkt zatím neprošel kontrolou veterinářem. */
export const DRAFT: ReviewStatus = { status: 'navrh', reviewedAt: null, reviewer: null };

/** Obecná pravidla sběru, která se zobrazují u každého produktu (doplňují specifický text). */
export const GENERAL_COLLECTING_RULES = [
  'Sbírejte jen to, co bezpečně poznáte. Při sebemenší pochybnosti nesbírejte.',
  'Vyhněte se okrajům silnic, polím a sadům, kde se mohlo stříkat, psím venčištím a místům u skládek.',
  'Živé větve řežte jen se souhlasem vlastníka stromu (v lese vlastníka lesa). Lesní zákon dovoluje sbírat pro vlastní potřebu lesní plody a suchou klest ležící na zemi.',
  'Nesbírejte v národních parcích, rezervacích a dalších chráněných územích, pokud to tamní pravidla nedovolují, a nikdy nesbírejte zvláště chráněné druhy.',
  'Nesbírejte nic plesnivého, nahnilého, napadeného houbou nebo znečištěného trusem divokých zvířat.',
  'Vše před podáním důkladně omyjte pitnou vodou a nechte oschnout.',
  'Novou potravinu zavádějte postupně a v malém množství a sledujte trus i chování papouška.',
];
