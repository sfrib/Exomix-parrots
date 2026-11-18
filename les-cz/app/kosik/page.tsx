import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';

export const metadata = {
  ...pageMetadata({ title: 'Košík', description: 'Váš košík je prázdný. A navždy bude.', path: '/kosik' }),
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <>
      <PageHeader eyebrow="Pokladna" title="Váš košík je prázdný." lead="A navždy bude. LES.cz totiž nic neprodává." crumbs={[{ name: 'Košík' }]} />
      <div className="container-les grid gap-8 py-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="card p-8">
          <h2 className="h-display text-2xl">Jak „nakupovat“ v lese</h2>
          <ol className="mt-5 space-y-4">
            {[
              ['Vyberte zboží', 'Projděte sortiment a přečtěte si kartu produktu – hlavně část o rizicích a sběru.'],
              ['Klikněte na KOUPIT', 'Nic se nestane. Tedy kromě toho, že se zasmějete. Neukládáme žádná data.'],
              ['Obujte se', 'Doprava probíhá výhradně vlastníma nohama. Košík si přineste vlastní (ten proutěný).'],
              ['Sbírejte s rozumem', 'Jen to, co bezpečně poznáte, jen tam, kde smíte, a jen tolik, kolik potřebujete.'],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-honey-300 font-display text-lg font-bold text-forest-950">{i + 1}</span>
                <div>
                  <p className="font-semibold text-forest-900">{t}</p>
                  <p className="text-sm text-ink/75">{d}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/obchod" className="btn-buy">Pokračovat v „nákupu“</Link>
            <Link href="/jak-sbirat" className="btn-ghost">Pravidla sběru</Link>
          </div>
        </div>
        <div className="paper-texture rounded-2xl border border-bark-500/20 p-8">
          <h2 className="font-display text-xl font-semibold text-forest-900">Rekapitulace objednávky</h2>
          <dl className="mt-4 space-y-2 font-mono text-sm">
            <div className="flex justify-between"><dt>Zboží</dt><dd>0 Kč</dd></div>
            <div className="flex justify-between"><dt>Doprava (vlastní nohy)</dt><dd>0 Kč</dd></div>
            <div className="flex justify-between"><dt>Balné (kapsa)</dt><dd>0 Kč</dd></div>
            <div className="flex justify-between border-t border-dashed border-ink/20 pt-2 font-bold"><dt>Celkem</dt><dd>0 Kč</dd></div>
          </dl>
          <p className="mt-4 text-xs text-ink/60">Nevzniká žádná objednávka, smlouva ani závazek. Platební údaje nikdy nezadávejte – nikde je nechceme.</p>
          <Link href="/podporit-lagunu" className="mt-6 inline-block text-sm font-semibold text-bark-500 hover:underline">
            Chcete přesto něco dát? Dobrovolně podpořte Lagunu →
          </Link>
        </div>
      </div>
    </>
  );
}
