import Link from 'next/link';
import { OPERATOR } from '@/lib/site';
import { pageMetadata } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';
import SupportLaguna from '@/components/SupportLaguna';

export const metadata = pageMetadata({
  title: 'Dobrovolně podpořit Lagunu',
  description: 'Naše zboží je zdarma. Pokud vás LES.cz pobavil nebo poučil, můžete dobrovolně podpořit Společnost Laguna. Nebo také nemusíte.',
  path: '/podporit-lagunu',
});

export default function SupportPage() {
  return (
    <>
      <PageHeader eyebrow="Dobrovolná podpora" title="Podpořit Lagunu" lead="Úplně dobrovolně. Lesní skřítek se nedívá." crumbs={[{ name: 'Podpořit Lagunu' }]} />
      <div className="container-les space-y-10 py-10">
        <SupportLaguna />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="card p-6">
            <h2 className="font-display text-xl font-semibold text-forest-900">Kdo je Laguna</h2>
            <p className="mt-2 text-sm text-ink/80">
              {OPERATOR.name} je nezisková organizace zaměřená na papoušky. Podle projektových podkladů se věnuje rehabilitaci papoušků
              s fyzickým či psychickým hendikepem, jejich socializaci a hledání nových domovů a osvětě chovatelů. (Popis k potvrzení Lagunou.)
            </p>
          </div>
          <div className="card p-6">
            <h2 className="font-display text-xl font-semibold text-forest-900">Proč LES.cz</h2>
            <p className="mt-2 text-sm text-ink/80">
              Mnoho problémů papoušků v zajetí souvisí s nudou a nevhodnou péčí. Bezpečné přírodní obohacení je levný a účinný způsob,
              jak papouškům zlepšit život. LES.cz to říká s humorem.
            </p>
          </div>
          <div className="card p-6">
            <h2 className="font-display text-xl font-semibold text-forest-900">Dar není platba</h2>
            <p className="mt-2 text-sm text-ink/80">
              Za dar nic nedostanete a obsah webu je zdarma pro všechny. LES.cz nepřijímá žádné platby.{' '}
              <Link href="/pravni/dobrovolna-podpora" className="font-semibold text-forest-700 underline">Více informací</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
