import Link from 'next/link';
import { OPERATOR, SUPPORT } from '@/lib/site';

/** Blok dobrovolné podpory Laguny. Podpora není platbou za zboží. */
export default function SupportLaguna({ compact = false }: { compact?: boolean }) {
  return (
    <section aria-labelledby="podpora-title" className="paper-texture relative overflow-hidden rounded-[28px] border border-bark-500/20">
      <div className={`relative grid gap-8 ${compact ? 'p-6 md:p-8' : 'p-8 md:grid-cols-[1.2fr_1fr] md:p-12'}`}>
        <div>
          <p className="eyebrow text-bark-500">Dobrovolná podpora</p>
          <h2 id="podpora-title" className="h-display mt-2 text-3xl md:text-4xl">Líbilo se vám nakupování v našem lese?</h2>
          <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-ink/80">
            <p>Naše zboží je zdarma. Příroda ho pro vás připravuje každý den.</p>
            <p>
              Pokud vás LES.cz pobavil nebo jste se něco nového dozvěděli, můžete dobrovolně podpořit {OPERATOR.name}.
            </p>
            <p>Výše podpory je zcela na vás. Můžete přispět, nebo také nemusíte.</p>
            <p className="font-display text-lg italic text-forest-800">Ani lesní skřítek vás kontrolovat nebude.</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={SUPPORT.url} className="btn-primary px-6 py-3" rel="noopener">
              Podpořit Lagunu na jejím webu ↗
            </a>
            {!compact ? (
              <Link href="/pravni/dobrovolna-podpora" className="btn-ghost px-6 py-3">
                Jak podpora funguje
              </Link>
            ) : null}
          </div>
          <p className="mt-4 text-xs text-ink/60">
            Dar je dobrovolný a nijak nesouvisí s „nákupem“ na LES.cz – nic za něj nedostanete kromě dobrého pocitu.
            Platbu nepřijímá LES.cz, odkaz vede na oficiální web Laguny.
          </p>
        </div>
        {!compact ? (
          <div className="relative hidden md:block" aria-hidden="true">
            <div className="absolute inset-0 rotate-2 rounded-3xl bg-forest-800" />
            <div className="relative -rotate-2 rounded-3xl border border-bark-500/20 bg-sand-50 p-6 shadow-lift">
              <p className="font-mono text-xs uppercase tracking-widest text-ink/50">Účtenka č. 000000</p>
              <div className="my-3 border-t border-dashed border-ink/20" />
              <dl className="space-y-2 font-mono text-sm">
                <div className="flex justify-between"><dt>Lesní jahody</dt><dd>0 Kč</dd></div>
                <div className="flex justify-between"><dt>Březové větve</dt><dd>0 Kč</dd></div>
                <div className="flex justify-between"><dt>Šišky (24 ks)</dt><dd>0 Kč</dd></div>
                <div className="flex justify-between"><dt>Doprava – vlastní nohy</dt><dd>0 Kč</dd></div>
              </dl>
              <div className="my-3 border-t border-dashed border-ink/20" />
              <div className="flex justify-between font-mono text-base font-bold"><span>CELKEM</span><span>0 Kč</span></div>
              <p className="mt-3 font-mono text-xs text-ink/60">Dobrovolné spropitné pro Lagunu: kolik chcete. Nebo nic.</p>
              <p className="mt-4 text-center font-display text-lg text-forest-700">Děkujeme za nákup v lese!</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
