import type { CategorySlug, IllustrationKind, Product, SafetyLevel } from './types';

/** Kompaktní záznam pro vyhledávání na klientu (neposíláme celou databázi). */
export interface SearchEntry {
  slug: string;
  name: string;
  latin: string;
  synonyms: string[];
  category: CategorySlug;
  safety: SafetyLevel;
  safetySummary: string;
  months: number[];
  tagline: string;
  price: string;
  availability: string;
  badge?: string;
  visual: { kind: IllustrationKind; color: string; accent: string };
}

export function toSearchEntry(p: Product): SearchEntry {
  return {
    slug: p.slug,
    name: p.name,
    latin: p.latin,
    synonyms: p.synonyms ?? [],
    category: p.category,
    safety: p.safety.level,
    safetySummary: p.safety.summary,
    months: p.months,
    tagline: p.tagline,
    price: p.shop.price,
    availability: p.shop.availability,
    badge: p.shop.badge,
    visual: p.visual,
  };
}

/** Odstraní diakritiku a sjednotí velikost písmen: „Šípky“ → „sipky“. */
export function normalize(value: string): string {
  return value
    .toLocaleLowerCase('cs')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Jednoduché a rychlé vyhledávání:
 *  - přesná shoda názvu > začátek názvu > začátek slova > obsahuje,
 *  - prohledává český název, synonyma i latinský název,
 *  - toleruje diakritiku („bezinky“ = „bezinky“, „sipek“ najde „Šípky“).
 */
export function searchEntries(entries: SearchEntry[], query: string, limit = 50): SearchEntry[] {
  const q = normalize(query);
  if (!q) return [];
  const terms = q.split(' ');

  const scored = entries
    .map((entry) => {
      const name = normalize(entry.name);
      const haystacks = [name, ...entry.synonyms.map(normalize), normalize(entry.latin)];
      let score = 0;
      for (const term of terms) {
        let best = 0;
        for (const h of haystacks) {
          if (h === term) best = Math.max(best, 100);
          else if (h.startsWith(term)) best = Math.max(best, 60);
          else if (h.split(' ').some((w) => w.startsWith(term))) best = Math.max(best, 40);
          else if (term.length >= 3 && h.includes(term)) best = Math.max(best, 20);
          // Toleruj tvarosloví: „jeřabiny“ vs „jeřabina“ – shoda prvních 4+ znaků.
          else if (term.length >= 5 && h.split(' ').some((w) => w.slice(0, 4) === term.slice(0, 4))) best = Math.max(best, 10);
        }
        if (best === 0) return { entry, score: 0 };
        score += best;
      }
      if (haystacks[0] === q) score += 50;
      return { entry, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || x.entry.name.localeCompare(y.entry.name, 'cs'));

  return scored.slice(0, limit).map((x) => x.entry);
}
