import Link from 'next/link';
import Logo from './Logo';
import { CATEGORIES } from '@/data/categories';
import { OPERATOR, SITE } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="mt-24 bg-forest-950 text-sand-100">
      <div className="container-les grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo tone="light" />
          <p className="font-display text-xl text-honey-300">{SITE.slogan}</p>
          <p className="text-sm text-sand-100/70">
            Žádný košík, žádná pokladna, žádný kurýr. Jen les, papoušek a trocha znalostí.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-sand-100/60">Sortiment</h2>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}><Link href={`/kategorie/${c.slug}`} className="hover:text-honey-300">{c.name}</Link></li>
            ))}
            <li><Link href="/sezona" className="hover:text-honey-300">Sezónní nabídka</Link></li>
            <li><Link href="/vyprodej" className="hover:text-honey-300">Lesní výprodej</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-sand-100/60">Pro chovatele</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/je-to-bezpecne" className="hover:text-honey-300">Je to pro papouška bezpečné?</Link></li>
            <li><Link href="/poznej-strom" className="hover:text-honey-300">Poznej svůj strom</Link></li>
            <li><Link href="/co-roste-ted" className="hover:text-honey-300">Co roste právě teď?</Link></li>
            <li><Link href="/jak-sbirat" className="hover:text-honey-300">Jak správně sbírat</Link></li>
            <li><Link href="/prirodni-obohaceni" className="hover:text-honey-300">Přírodní obohacení</Link></li>
            <li><Link href="/poradna" className="hover:text-honey-300">Lesní poradna</Link></li>
            <li><Link href="/zdroje" className="hover:text-honey-300">Odborné zdroje a metodika</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-sand-100/60">O lese</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/o-projektu" className="hover:text-honey-300">O projektu LES.cz</Link></li>
            <li><Link href="/podporit-lagunu" className="hover:text-honey-300">Dobrovolná podpora Laguny</Link></li>
            <li><Link href="/pravni/provozovatel" className="hover:text-honey-300">Provozovatel</Link></li>
            <li><Link href="/pravni/pravidla-uzivani" className="hover:text-honey-300">Pravidla používání</Link></li>
            <li><Link href="/pravni/ochrana-osobnich-udaju" className="hover:text-honey-300">Ochrana osobních údajů</Link></li>
            <li><Link href="/pravni/cookies" className="hover:text-honey-300">Cookies</Link></li>
            <li><Link href="/pravni/dobrovolna-podpora" className="hover:text-honey-300">Informace o dobrovolné podpoře</Link></li>
            <li><Link href="/pravni/odborne-upozorneni" className="hover:text-honey-300">Odborné upozornění</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-les flex flex-col gap-3 py-6 text-xs text-sand-100/60 md:flex-row md:items-center md:justify-between">
          <p>
            LES.cz je vzdělávací a osvětový projekt {OPERATOR.name}{' '}
            <a href={OPERATOR.web} className="underline decoration-white/30 underline-offset-2 hover:text-honey-300" rel="noopener">
              Poznejte organizaci, která stojí za naším lesem.
            </a>
          </p>
          <p>
            LES.cz nic neprodává. Informace nenahrazují veterinární péči. Web nepoužívá cookies ani analytiku.
          </p>
        </div>
      </div>
    </footer>
  );
}
