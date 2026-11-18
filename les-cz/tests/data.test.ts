import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '@/data/index';
import { SOURCE_MAP } from '@/data/sources';
import { CATEGORY_MAP } from '@/data/categories';
import { ARTICLES } from '@/data/articles';
import { CAMPAIGNS, CLEARANCE } from '@/data/seasonal';

const slugs = new Set(PRODUCTS.map((p) => p.slug));

describe('databáze přírodních materiálů', () => {
  it('má unikátní slugy ve formátu URL', () => {
    expect(slugs.size).toBe(PRODUCTS.length);
    for (const p of PRODUCTS) expect(p.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('pokrývá všechny kategorie', () => {
    for (const key of Object.keys(CATEGORY_MAP)) {
      expect(PRODUCTS.some((p) => p.category === key), key).toBe(true);
    }
  });

  it('odkazuje jen na existující zdroje', () => {
    for (const p of PRODUCTS) {
      const all = [
        ...p.sourceIds,
        ...(p.safety.sourceIds ?? []),
        ...[p.parts, p.benefits, p.serving, p.preparation, p.collecting, p.habitat, p.whenToCollect, p.nutrition.summary].flatMap((s) => s.sourceIds ?? []),
        ...(p.risks.sourceIds ?? []),
        ...(p.species.sourceIds ?? []),
        ...(p.identification.sourceIds ?? []),
        ...(p.nutrition.valuesSourceIds ?? []),
      ];
      for (const id of all) expect(SOURCE_MAP[id], `${p.slug}: neznámý zdroj ${id}`).toBeDefined();
    }
  });

  it('má křížové odkazy jen na existující produkty', () => {
    for (const p of PRODUCTS) {
      for (const r of p.related ?? []) expect(slugs.has(r), `${p.slug} → related ${r}`).toBe(true);
      for (const l of p.identification.lookalikes ?? []) {
        if (l.slug) expect(slugs.has(l.slug), `${p.slug} → lookalike ${l.slug}`).toBe(true);
      }
    }
    for (const a of ARTICLES) for (const r of a.relatedProducts) expect(slugs.has(r), `článek ${a.slug} → ${r}`).toBe(true);
    for (const c of Object.values(CAMPAIGNS)) for (const f of c.featured) expect(slugs.has(f), `kampaň ${c.season} → ${f}`).toBe(true);
    for (const i of CLEARANCE.items) expect(slugs.has(i.slug), `výprodej → ${i.slug}`).toBe(true);
  });

  it('má platné měsíce a vyplněné povinné texty', () => {
    for (const p of PRODUCTS) {
      expect(p.months.length, p.slug).toBeGreaterThan(0);
      for (const m of p.months) expect(m >= 1 && m <= 12, `${p.slug} měsíc ${m}`).toBe(true);
      for (const field of [p.name, p.latin, p.family, p.tagline, p.safety.summary, p.parts.text, p.shop.buyMessage]) {
        expect(field.trim().length, p.slug).toBeGreaterThan(0);
      }
      expect(p.risks.items.length, p.slug).toBeGreaterThan(0);
    }
  });

  it('nepoužívá zakázané paušální tvrzení o bezpečnosti', () => {
    const banned = /bezpečn\w* pro všechny papoušky/i;
    for (const p of PRODUCTS) expect(JSON.stringify(p), p.slug).not.toMatch(banned);
  });

  it('rizikové zboží je vždy označené jako rizikové nebo neověřené', () => {
    for (const p of PRODUCTS.filter((x) => x.category === 'rizikove-zbozi')) {
      expect(['rizikove', 'neovereno'], p.slug).toContain(p.safety.level);
    }
  });

  it('žádný produkt netvrdí odbornou kontrolu bez data', () => {
    for (const p of PRODUCTS) {
      if (p.review.status === 'overeno') expect(p.review.reviewedAt, p.slug).not.toBeNull();
    }
  });

  it('má SEO texty v rozumné délce', () => {
    for (const p of PRODUCTS) {
      if (p.seo?.title) expect(p.seo.title.length, p.slug).toBeLessThanOrEqual(70);
      if (p.seo?.description) expect(p.seo.description.length, p.slug).toBeLessThanOrEqual(170);
    }
  });
});
