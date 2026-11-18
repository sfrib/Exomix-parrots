import type { MetadataRoute } from 'next';
import { PRODUCTS } from '@/data/index';
import { CATEGORIES } from '@/data/categories';
import { ARTICLES } from '@/data/articles';
import { LEGAL_DOCS } from '@/data/legal';
import { SEASONS } from '@/lib/seasons';
import { absoluteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ['/', '/obchod', '/co-roste-ted', '/je-to-bezpecne', '/poznej-strom', '/jak-sbirat', '/prirodni-obohaceni', '/poradna', '/sezona', '/vyprodej', '/podporit-lagunu', '/o-projektu', '/zdroje'];
  return [
    ...staticPaths.map((p) => ({ url: absoluteUrl(p), changeFrequency: 'weekly' as const, priority: p === '/' ? 1 : 0.7 })),
    ...CATEGORIES.map((c) => ({ url: absoluteUrl(`/kategorie/${c.slug}`), changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...PRODUCTS.map((p) => ({ url: absoluteUrl(`/produkt/${p.slug}`), changeFrequency: 'monthly' as const, priority: 0.9, ...(p.review.reviewedAt ? { lastModified: p.review.reviewedAt } : {}) })),
    ...ARTICLES.map((a) => ({ url: absoluteUrl(`/poradna/${a.slug}`), lastModified: a.updated, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...SEASONS.map((s) => ({ url: absoluteUrl(`/sezona/${s}`), changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...LEGAL_DOCS.map((d) => ({ url: absoluteUrl(`/pravni/${d.slug}`), changeFrequency: 'yearly' as const, priority: 0.2 })),
  ];
}
