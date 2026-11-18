import type { Metadata } from 'next';
import type { Article, Product } from './types';
import { OPERATOR, SITE } from './site';

export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).toString();
}

/** Jednotné metadata pro stránky (title, description, canonical, Open Graph, Twitter). */
export function pageMetadata({
  title,
  description,
  path,
  ogType = 'website',
}: {
  title: string;
  description: string;
  path: string;
  ogType?: 'website' | 'article';
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE.name,
      locale: SITE.locale,
      type: ogType,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

/**
 * Pozn.: Záměrně NEPOUŽÍVÁME schema.org Product/Offer – web nic neprodává
 * a strukturovaná data nesmí vytvářet dojem skutečné nabídky zboží.
 * Produktové stránky jsou popsány jako vzdělávací články + FAQ.
 */
export function productJsonLd(product: Product) {
  const url = absoluteUrl(`/produkt/${product.slug}`);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `${product.name} (${product.latin}) – průvodce pro chovatele papoušků`,
      description: product.safety.summary,
      url,
      inLanguage: 'cs',
      isAccessibleForFree: true,
      about: { '@type': 'Thing', name: product.name, alternateName: product.latin },
      publisher: organizationJsonLd(),
      ...(product.review.reviewedAt ? { dateModified: product.review.reviewedAt } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `Může papoušek ${product.name.toLocaleLowerCase('cs')}?`,
          acceptedAnswer: { '@type': 'Answer', text: product.safety.summary },
        },
        {
          '@type': 'Question',
          name: `Jak připravit ${product.name.toLocaleLowerCase('cs')} pro papouška?`,
          acceptedAnswer: { '@type': 'Answer', text: product.preparation.text },
        },
      ],
    },
  ];
}

export function articleJsonLd(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: absoluteUrl(`/poradna/${article.slug}`),
    dateModified: article.updated,
    inLanguage: 'cs',
    publisher: organizationJsonLd(),
  };
}

export function organizationJsonLd() {
  return {
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    parentOrganization: {
      '@type': 'NGO',
      name: OPERATOR.name,
      url: OPERATOR.web,
      taxID: OPERATOR.ico,
    },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    inLanguage: 'cs',
    description: SITE.description,
    publisher: organizationJsonLd(),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/hledat?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; href?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };
}
