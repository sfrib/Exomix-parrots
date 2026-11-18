import Link from 'next/link';
import Logo from './Logo';
import { CartIcon } from './BuyButton';
import { CATEGORIES } from '@/data/categories';

const NAV = [
  { href: '/obchod', label: 'Celý sortiment' },
  { href: '/co-roste-ted', label: 'Co roste teď' },
  { href: '/je-to-bezpecne', label: 'Je to bezpečné?' },
  { href: '/poznej-strom', label: 'Poznej strom' },
  { href: '/poradna', label: 'Lesní poradna' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-forest-900/10 bg-sand-50/90 backdrop-blur">
      <div className="container-les flex h-16 items-center gap-4">
        <Link href="/" aria-label="LES.cz – úvodní stránka" className="shrink-0">
          <Logo />
        </Link>

        <form action="/hledat" role="search" className="ml-2 hidden flex-1 md:flex">
          <label htmlFor="header-search" className="sr-only">
            Hledat v lese
          </label>
          <input
            id="header-search"
            name="q"
            type="search"
            placeholder="Hledat rostlinu, strom, plod…"
            className="w-full max-w-md rounded-full border border-forest-900/15 bg-white px-4 py-2 text-sm shadow-inner outline-none placeholder:text-ink/40 focus:border-forest-600 focus:ring-4 focus:ring-forest-200"
          />
        </form>

        <nav aria-label="Hlavní navigace" className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.slice(1, 4).map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-3 py-2 text-sm font-medium text-forest-900 hover:bg-forest-50">
              {item.label}
            </Link>
          ))}
          <Link href="/podporit-lagunu" className="rounded-full px-3 py-2 text-sm font-semibold text-bark-500 hover:bg-honey-100">
            Podpořit Lagunu
          </Link>
        </nav>

        <Link href="/kosik" className="relative ml-auto grid h-10 w-10 place-items-center rounded-full border border-forest-900/15 bg-white text-forest-900 hover:bg-honey-100 lg:ml-0" aria-label="Košík (je prázdný a vždycky bude)">
          <CartIcon className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-honey-300 px-1 text-[11px] font-bold text-forest-950">0</span>
        </Link>

        <details className="group relative lg:hidden">
          <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-full border border-forest-900/15 bg-white [&::-webkit-details-marker]:hidden" aria-label="Menu">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </summary>
          <div className="absolute right-0 top-12 w-[min(88vw,20rem)] rounded-2xl border border-forest-900/10 bg-white p-3 shadow-lift">
            <form action="/hledat" role="search" className="mb-2">
              <label htmlFor="mobile-search" className="sr-only">Hledat v lese</label>
              <input id="mobile-search" name="q" type="search" placeholder="Hledat v lese…" className="w-full rounded-full border border-forest-900/15 px-4 py-2 text-sm" />
            </form>
            <ul className="space-y-0.5">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-forest-50">{item.label}</Link>
                </li>
              ))}
              <li className="my-1 border-t border-forest-900/10" />
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link href={`/kategorie/${c.slug}`} className="block rounded-lg px-3 py-2 text-sm hover:bg-forest-50">{c.letter}. {c.name}</Link>
                </li>
              ))}
              <li className="my-1 border-t border-forest-900/10" />
              <li><Link href="/podporit-lagunu" className="block rounded-lg px-3 py-2 text-sm font-semibold text-bark-500 hover:bg-honey-100">Podpořit Lagunu</Link></li>
            </ul>
          </div>
        </details>
      </div>

      <nav aria-label="Kategorie" className="hidden border-t border-forest-900/5 md:block">
        <div className="container-les flex items-center gap-1 overflow-x-auto py-1.5 text-sm">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/kategorie/${c.slug}`} className={`whitespace-nowrap rounded-full px-3 py-1.5 hover:bg-forest-50 ${c.slug === 'rizikove-zbozi' ? 'text-berry-600' : 'text-forest-800'}`}>
              {c.name}
            </Link>
          ))}
          <Link href="/sezona" className="whitespace-nowrap rounded-full px-3 py-1.5 text-forest-800 hover:bg-forest-50">Sezónní nabídka</Link>
          <Link href="/vyprodej" className="whitespace-nowrap rounded-full bg-honey-100 px-3 py-1.5 font-semibold text-bark-600 hover:bg-honey-200">Lesní výprodej −100 %</Link>
        </div>
      </nav>
    </header>
  );
}
