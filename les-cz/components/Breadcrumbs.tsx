import Link from 'next/link';
import { breadcrumbJsonLd } from '@/lib/seo';
import JsonLd from './JsonLd';

export interface Crumb {
  name: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ name: 'Les', href: '/' }, ...items];
  return (
    <nav aria-label="Drobečková navigace" className="text-sm text-ink/60">
      <JsonLd data={breadcrumbJsonLd(all)} />
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 ? <span aria-hidden="true">/</span> : null}
            {c.href && i < all.length - 1 ? (
              <Link href={c.href} className="hover:text-forest-700 hover:underline">
                {c.name}
              </Link>
            ) : (
              <span aria-current={i === all.length - 1 ? 'page' : undefined} className="text-ink/80">
                {c.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
