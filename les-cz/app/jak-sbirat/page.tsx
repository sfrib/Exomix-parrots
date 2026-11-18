import Link from 'next/link';
import { GENERAL_COLLECTING_RULES } from '@/data/helpers';
import { pageMetadata } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';

export const metadata = pageMetadata({
  title: 'Jak správně sbírat v přírodě pro papouška',
  description: 'Pravidla bezpečného a legálního sběru: co říká lesní zákon, kde nesbírat, jak materiál očistit a co dělat při podezření na otravu.',
  path: '/jak-sbirat',
});

export default function HowToCollectPage() {
  return (
    <>
      <PageHeader
        eyebrow="Nákupní řád lesa"
        title="Jak správně sbírat?"
        lead="Les je otevřený nonstop, ale má svůj nákupní řád. Tady je celý – v lidské řeči."
        crumbs={[{ name: 'Jak sbírat' }]}
      />
      <div className="container-les grid gap-8 py-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="card p-6 md:p-8">
            <h2 className="h-display text-2xl">Zlatá pravidla</h2>
            <ol className="mt-4 space-y-3">
              {GENERAL_COLLECTING_RULES.map((r, i) => (
                <li key={r} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-forest-700 text-sm font-bold text-white">{i + 1}</span>
                  <span className="pt-1 text-ink/85">{r}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="card prose-les p-6 md:p-8">
            <h2 className="!mt-0">Co dovoluje zákon</h2>
            <p>
              Lesní zákon (č. 289/1995 Sb., § 19) dovoluje každému vstupovat do lesa na vlastní nebezpečí a sbírat pro vlastní potřebu
              lesní plody a suchou na zemi ležící klest. Paragraf 20 zakazuje mimo jiné poškozovat stromy, sekat chvojí a sbírat lesní
              plody způsobem, který les poškozuje.
            </p>
            <p>
              Pro papouščí „nákupy“ to znamená: plody ano, suché spadlé větvičky ano. <strong>Živé větve jen se souhlasem vlastníka</strong> –
              nejjednodušší je vlastní zahrada, známý sadař nebo ořez stromů u sousedů.
            </p>
            <p>
              Zákon o ochraně přírody a krajiny (č. 114/1992 Sb.) chrání zvláště chráněné druhy rostlin a chráněná území. V národních
              parcích a rezervacích platí přísnější pravidla – tam se nesbírá, dokud si to neověříte.
            </p>
            <p className="text-sm text-ink/60">Shrnutí nenahrazuje znění předpisů. Text je návrh určený k právní kontrole.</p>
          </section>

          <section className="card prose-les p-6 md:p-8">
            <h2 className="!mt-0">Hygiena a příprava</h2>
            <ul>
              <li>Plody i zeleň omyjte pitnou vodou a nechte oschnout.</li>
              <li>Větve a kůru omyjte horkou vodou a kartáčem; odstraňte lišejníky, mech, trus a vše, co vypadá jako plíseň.</li>
              <li>Materiál skladujte suchý a vzdušný. Navlhlé nebo zatuchlé seno, listí a šišky vyhoďte.</li>
              <li>Nic nesbírejte u silnic, na polích, v sadech, které se stříkají, a v místech, kde venčí psi.</li>
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-berry-600/30 bg-berry-50 p-6">
            <h2 className="font-display text-xl font-semibold text-berry-700">Podezření na otravu?</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink/85">
              <li>Ihned kontaktujte veterináře se zaměřením na ptáky.</li>
              <li>Odstraňte zbytky rostliny z klece, ale uschovejte vzorek (ideálně celou větvičku s listy, květy či plody).</li>
              <li>Zapamatujte si, kdy a kolik toho papoušek mohl sníst.</li>
              <li>Nepodávejte nic „na zvracení“ ani domácí léčbu bez pokynu veterináře.</li>
            </ol>
          </section>
          <section className="card p-6">
            <h2 className="font-display text-xl font-semibold text-forest-900">Co vzít s sebou do lesa</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-ink/80">
              <li>✔ pohodlnou obuv (= naše doprava)</li>
              <li>✔ košík nebo papírový sáček (= naše balné)</li>
              <li>✔ zahradnické nůžky – jen pro větve s povolením</li>
              <li>✔ atlas rostlin nebo tuhle stránku</li>
              <li>✘ kreditní kartu – nebude potřeba</li>
            </ul>
          </section>
          <Link href="/rizikove-rostliny" className="btn-danger w-full">Přehled rizikových rostlin</Link>
        </aside>
      </div>
    </>
  );
}
