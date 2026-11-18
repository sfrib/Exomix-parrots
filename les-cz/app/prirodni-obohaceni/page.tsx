import Link from 'next/link';
import { getProducts } from '@/data/index';
import { pageMetadata } from '@/lib/seo';
import PageHeader from '@/components/PageHeader';

export const metadata = pageMetadata({
  title: 'Přírodní obohacení – hračky pro papoušky z lesa',
  description: 'Návody na přírodní hračky a foraging pro papoušky: šišky s pamlskem, hledací krabice, větvové bludiště, kytice ze zeleně. Bezpečně a zdarma.',
  path: '/prirodni-obohaceni',
});

const IDEAS = [
  {
    title: 'Šiška s překvapením',
    level: 'Snadné',
    size: 'malí až střední papoušci',
    materials: ['sisky'],
    steps: ['Vyberte čistou, suchou a vyčištěnou šišku.', 'Mezi šupiny zastrčte pár oblíbených semínek.', 'Šišku podejte v misce nebo zavěšenou na bezpečném přírodním provázku pod dohledem.'],
    caution: 'Žádné dekorační šišky. Lepkavé, pryskyřičné a plesnivé šišky vyhoďte.',
  },
  {
    title: 'Hledací krabice z listí',
    level: 'Snadné',
    size: 'všechny velikosti (velikost krabice podle ptáka)',
    materials: ['suche-listi', 'seno-a-sucha-trava'],
    steps: ['Do nepotištěné papírové krabice nasypte suché, čisté listí bezpečných stromů.', 'Přimíchejte několik pamlsků.', 'Nechte papouška hledat. Po hře obsah vyhoďte.'],
    caution: 'Listí a seno musí být suché, bez zápachu a plísně. Vlhký materiál je riziko aspergilózy.',
  },
  {
    title: 'Větvové bludiště',
    level: 'Střední',
    size: 'střední a velcí papoušci',
    materials: ['vetvicky', 'briza', 'vrba', 'liska'],
    steps: ['Připravte několik větví různých průměrů z bezpečných dřevin.', 'Upevněte je v kleci nebo voliéře do různých úhlů – vznikne prolézačka.', 'Na rozvětvení zastrčte kousky ovoce nebo zeleně.'],
    caution: 'Větve pevně upevněte, aby nespadly. Ohlodané a znečištěné větve pravidelně měňte.',
  },
  {
    title: 'Jarní kytice pupenů',
    level: 'Snadné',
    size: 'všechny velikosti',
    materials: ['pupeny', 'vrba', 'briza'],
    steps: ['Na jaře uřízněte (se souhlasem majitele) větvičky s pupeny bezpečných dřevin.', 'Svažte je přírodním lýkem do malé kytice.', 'Zavěste do klece – papoušek bude pupeny loupat.'],
    caution: 'Nikdy pupeny peckovin (třešeň, švestka, střemcha) – obsahují kyanogenní glykosidy.',
  },
  {
    title: 'Bylinkový salátový bar',
    level: 'Snadné',
    size: 'všechny velikosti',
    materials: ['pampeliska', 'ptacinec', 'jitrocel', 'cekanka'],
    steps: ['Natrhejte čistou zeleň z místa daleko od silnic a psů.', 'Omyjte ji a nechte oschnout.', 'Svažte do svazku a připevněte ke kleci, nebo zapíchejte do „květináče“ z kůry.'],
    caution: 'Novou zeleň zavádějte postupně. Nespotřebovanou zeleň do večera odstraňte.',
  },
  {
    title: 'Klasy na zavěšení',
    level: 'Snadné',
    size: 'malí papoušci (andulky, korely, agapornisové)',
    materials: ['klasy-trav'],
    steps: ['Natrhejte zralé klasy lučních trav a jitrocele.', 'Zkontrolujte, že v klasech nejsou černé rohovité útvary (námel).', 'Svažte do svazku a zavěste.'],
    caution: 'Klasy s námelem vyhoďte celé.',
  },
];

export default function EnrichmentPage() {
  return (
    <>
      <PageHeader
        eyebrow="G. Přírodní obohacení"
        title="Přírodní obohacení"
        lead="Nejlevnější hračky rostou na stromech. Inspirace, jak z lesního materiálu udělat zábavu, která papouška zaměstná a přitom mu neublíží."
        crumbs={[{ name: 'Přírodní obohacení' }]}
      />
      <div className="container-les py-10">
        <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {IDEAS.map((idea) => (
            <li key={idea.title} className="card flex flex-col p-6">
              <div className="flex flex-wrap gap-2">
                <span className="chip border-forest-600/30 bg-forest-50 text-forest-800">{idea.level}</span>
                <span className="chip border-bark-500/20 bg-sand-100 text-bark-600">{idea.size}</span>
              </div>
              <h2 className="h-display mt-3 text-2xl">{idea.title}</h2>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink/85">
                {idea.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p className="mt-4 rounded-xl bg-honey-100 p-3 text-sm text-bark-700">
                <strong>Pozor:</strong> {idea.caution}
              </p>
              <p className="mt-auto pt-4 text-sm">
                <span className="text-ink/60">Materiál z lesa: </span>
                {getProducts(idea.materials).map((p, i) => (
                  <span key={p.slug}>
                    {i > 0 ? ', ' : ''}
                    <Link href={`/produkt/${p.slug}`} className="font-semibold text-forest-700 hover:underline">{p.name}</Link>
                  </span>
                ))}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-10 max-w-3xl rounded-2xl border border-forest-900/10 bg-white p-6 text-sm text-ink/80">
          <h2 className="font-display text-xl font-semibold text-forest-900">Obecná pravidla pro přírodní hračky</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Jen materiál z rostlin vedených jako vhodné, čistý a suchý.</li>
            <li>Žádné lepidlo, barvy, laky, kovové drátky ani dlouhé provázky (riziko zamotání a uškrcení).</li>
            <li>Novou hračku zpočátku podávejte pod dohledem.</li>
            <li>Návody jsou inspirace z chovatelské praxe (původ C – k ověření), nejsou to odborně ověřené postupy.</li>
          </ul>
        </div>
      </div>
    </>
  );
}
