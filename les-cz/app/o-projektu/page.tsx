import Link from 'next/link';
import { PRODUCTS, exomixProducts } from '@/data/index';
import { CATEGORIES } from '@/data/categories';
import { OPERATOR, SITE } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';

export const metadata = pageMetadata({
  title: 'O projektu LES.cz',
  description: 'LES.cz je vtipný e-shop, který nic neprodává. Vzdělávací a osvětový projekt Společnosti Laguna o přírodních materiálech pro papoušky.',
  path: '/o-projektu',
});

export default function AboutPage() {
  const exo = exomixProducts();
  return (
    <>
      <PageHeader eyebrow="O projektu" title="E-shop, který nic neprodává" lead={SITE.description} crumbs={[{ name: 'O projektu' }]} />
      <div className="container-les grid gap-10 py-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="prose-les">
          <h2 className="!mt-0">Proč parodie na e-shop?</h2>
          <p>
            Protože lidé rádi nakupují – a papoušci rádi ničí věci. LES.cz bere formát internetového obchodu, který zná každý, a plní ho
            obsahem, který by měl znát každý chovatel: co z přírody je pro papouška vhodné, jak to připravit, kde a jak to legálně
            nasbírat a čemu se vyhnout.
          </p>
          <p>Hlavní myšlenka je jednoduchá: <strong>{SITE.slogan}</strong> {SITE.slogans.join(' ')}</p>
          <h2>Odbornost má přednost před vtipem</h2>
          <p>
            Vtipné jsou ceny, sklady a tlačítka. Odborné texty jsou psané střízlivě a u každé informace je vidět, odkud pochází:
            z projektu ExoMix (A), z odborné literatury (B), nebo jde o pracovní text k ověření (C). Každá produktová karta ukazuje stav
            a datum odborné kontroly. Metodiku najdete na stránce <Link href="/zdroje">Odborné zdroje</Link>.
          </p>
          <h2>Vztah k ExoMixu</h2>
          <p>
            Databáze LES.cz navazuje na výživový konfigurátor ExoMix (VetExotic). Při jejím zakládání jsme prošli veškeré dostupné
            podklady ExoMixu. ExoMix obsahuje hlavně nutriční data semen (slunečnice, oves nahý, mungo), premixy a oleje (např.
            ostropestřecový a pupalkový olej), profily 17 druhů papoušků a nutriční režimy – databázi lesních rostlin zatím neobsahuje.
            Převzaté údaje jsou na webu označené písmenem A (aktuálně {exo.length} položek).
          </p>
          <h2>Kdo za lesem stojí</h2>
          <p>
            LES.cz je vzdělávací a osvětový projekt {OPERATOR.name}.{' '}
            <a href={OPERATOR.web} rel="noopener">Poznejte organizaci, která stojí za naším lesem.</a>
          </p>
        </div>
        <aside className="space-y-4">
          <div className="card p-6">
            <p className="font-display text-xl font-semibold text-forest-900">Les v číslech</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt>Položek v databázi</dt><dd className="font-bold">{PRODUCTS.length}</dd></div>
              {CATEGORIES.map((c) => (
                <div key={c.slug} className="flex justify-between">
                  <dt className="text-ink/70">{c.name}</dt>
                  <dd>{PRODUCTS.filter((p) => p.category === c.slug).length}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-forest-900/10 pt-3"><dt>Prodaných kusů</dt><dd className="font-bold">0</dd></div>
              <div className="flex justify-between"><dt>Odeslaných balíků</dt><dd className="font-bold">0</dd></div>
              <div className="flex justify-between"><dt>Kurýrů</dt><dd className="font-bold">0 (strom se nehne)</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </>
  );
}
