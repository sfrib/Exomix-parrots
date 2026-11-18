import type { CategorySlug, Product, Season } from '@/lib/types';
import { SEASON_MONTHS } from '@/lib/seasons';
import { toSearchEntry, type SearchEntry } from '@/lib/search';
import { FRUITS } from './products/fruits';
import { BRANCHES } from './products/branches';
import { HERBS } from './products/herbs';
import { TOYS } from './products/toys';
import { RISKY } from './products/risky';

/** Centrální databáze přírodních materiálů – jediný zdroj pravdy pro celý web. */
export const PRODUCTS: Product[] = [...FRUITS, ...BRANCHES, ...HERBS, ...TOYS, ...RISKY];

const PRODUCT_MAP = new Map(PRODUCTS.map((p) => [p.slug, p]));

export function getProduct(slug: string): Product | undefined {
  return PRODUCT_MAP.get(slug);
}

export function getProducts(slugs: string[]): Product[] {
  return slugs.map((s) => PRODUCT_MAP.get(s)).filter((p): p is Product => Boolean(p));
}

export function productsByCategory(category: CategorySlug): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

/** Bezpečné produkty (bez rizikového zboží). */
export function shopProducts(): Product[] {
  return PRODUCTS.filter((p) => p.category !== 'rizikove-zbozi');
}

export function productsInMonth(month: number, includeRisky = false): Product[] {
  return PRODUCTS.filter((p) => p.months.includes(month) && (includeRisky || p.category !== 'rizikove-zbozi'));
}

export function productsInSeason(season: Season, includeRisky = false): Product[] {
  const months = SEASON_MONTHS[season];
  return PRODUCTS.filter(
    (p) => p.months.some((m) => months.includes(m)) && (includeRisky || p.category !== 'rizikove-zbozi'),
  );
}

export function relatedProducts(product: Product, limit = 4): Product[] {
  const explicit = getProducts(product.related ?? []);
  const fill = PRODUCTS.filter(
    (p) => p.category === product.category && p.slug !== product.slug && !explicit.includes(p),
  );
  return [...explicit, ...fill].slice(0, limit);
}

/** Kompaktní index pro klientské vyhledávání a filtrování. */
export function searchIndex(): SearchEntry[] {
  return PRODUCTS.map(toSearchEntry);
}

/** Produkty, kde se objevují informace převzaté z ExoMixu. */
export function exomixProducts(): Product[] {
  return PRODUCTS.filter(
    (p) =>
      (p.exomix && p.exomix.length > 0) ||
      p.sourceIds.includes('exomix') ||
      [p.parts, p.benefits, p.serving, p.preparation, p.nutrition.summary].some((s) => s.provenance === 'A'),
  );
}
