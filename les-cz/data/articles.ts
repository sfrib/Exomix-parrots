import type { Article } from '@/lib/types';

/**
 * Průvodce a SEO články („Lesní poradna“).
 * Texty jsou návrhy – před zveřejněním je zkontroluje veterinář se zaměřením na ptáky.
 */
export const ARTICLES: Article[] = [
  {
    slug: 'jake-vetve-muze-papousek-okusovat',
    title: 'Jaké větve může papoušek okusovat?',
    question: 'Jaké větve může papoušek okusovat?',
    description:
      'Bříza, vrba, líska, jabloň, lípa… Přehled dřevin, které chovatelé papouškům běžně dávají, a těch, kterým se vyhnout. Plus jak větve připravit.',
    updated: '2026-11-18',
    provenance: 'C',
    sourceIds: ['harrison-lightfoot-2006', 'frohne-pfander-2005', 'zakon-lesni'],
    relatedProducts: ['briza', 'vrba', 'liska', 'jablon', 'lipa', 'stremcha-a-pecky', 'tis-cerveny', 'akat'],
    body: [
      {
        paragraphs: [
          'Okusování větví je pro papoušky přirozená činnost: obrušuje zobák, zaměstná je na dlouhé hodiny a uleví od nudy. Rozhoduje ale druh dřeviny, její původ a čistota.',
        ],
      },
      {
        heading: 'Dřeviny, které se v chovatelské praxi běžně používají',
        list: [
          'Bříza, vrba, líska, lípa, olše, jasan, habr – listnáče s měkčím až středně tvrdým dřevem.',
          'Jabloň a hrušeň – jen ze sadů, kde se nestříká.',
          'Vinná réva – letorosty z révy, která nebyla ošetřována postřiky.',
        ],
      },
      {
        heading: 'Dřeviny, kterým se vyhnout',
        list: [
          'Tis – prudce jedovatý, roste v parcích, na hřbitovech a v živých plotech.',
          'Akát – jedovatá kůra, semena i listy; v Česku velmi běžný.',
          'Peckoviny (třešeň, višeň, švestka, střemcha, bobkovišeň) – kyanogenní glykosidy v kůře, listech a peckách.',
          'Tůje, zlatý déšť, koňský kaštan, rododendron.',
          'Javor a dub až po konzultaci – podklady o vhodnosti nejsou jednoznačné.',
        ],
      },
      {
        heading: 'Jak větve připravit',
        list: [
          'Berte jen větve, které bezpečně poznáte, a jen ze stromů, které nebyly stříkané.',
          'Živé větve řežte pouze se souhlasem vlastníka stromu. V lese smí každý sbírat jen suchou klest ležící na zemi.',
          'Větve omyjte horkou vodou a kartáčem, odstraňte lišejníky, plísně a trus.',
          'Nabízejte různé průměry – malí papoušci tenké větvičky, velcí silnější větve.',
        ],
      },
    ],
  },
  {
    slug: 'muze-papousek-boruvky',
    title: 'Může papoušek borůvky?',
    question: 'Může papoušek borůvky?',
    description:
      'Borůvky patří mezi ovoce, které papoušci běžně dostávají. Kolik jich dát, proč se pak barví trus a s jakými jedovatými bobulemi je nezaměnit.',
    updated: '2026-11-18',
    provenance: 'C',
    sourceIds: ['harrison-lightfoot-2006', 'kubat-2002'],
    relatedProducts: ['boruvky', 'rulik-zlomocny', 'vrani-oko', 'brusinky'],
    body: [
      {
        paragraphs: [
          'Zralé borůvky se v chovatelské praxi podávají jako ovocný pamlsek. Obsahují cukry, takže tvoří jen menší část krmné dávky.',
          'Po borůvkách může být trus modrofialový. Je to barvivo z plodů, ne krev – pokud se ale změna barvy trusu objeví bez borůvek v jídelníčku nebo trvá déle, kontaktujte veterináře.',
        ],
      },
      {
        heading: 'Pozor na záměnu',
        list: [
          'Rulík zlomocný má velké lesklé černé bobule s hvězdicovitým kalichem – je prudce jedovatý.',
          'Vraní oko čtyřlisté má jedinou modročernou bobuli nad přeslenem čtyř listů – jedovaté.',
          'Borůvka roste na nízkém keříku s drobnými vejčitými listy; plod je ojíněný a uvnitř fialový.',
        ],
      },
    ],
  },
  {
    slug: 'jsou-sisky-bezpecne-pro-papousky',
    title: 'Jsou šišky bezpečné pro papoušky?',
    question: 'Jsou šišky bezpečné pro papoušky?',
    description:
      'Šišky jsou oblíbená přírodní hračka. Jak je vyčistit, které nebrat a proč dekorační šišky do klece nepatří.',
    updated: '2026-11-18',
    provenance: 'C',
    sourceIds: ['harrison-lightfoot-2006'],
    relatedProducts: ['sisky', 'smrk-a-borovice', 'plisne'],
    body: [
      {
        paragraphs: [
          'Šišky smrku, borovice nebo modřínu chovatelé běžně používají jako hračku na trhání a hledání pamlsků. Šiška se nejí – je to materiál na ničení.',
        ],
      },
      {
        heading: 'Jak šišky připravit',
        list: [
          'Sbírejte čisté, suché šišky bez plísně, daleko od silnic.',
          'Omyjte je a nechte důkladně proschnout; chovatelé je často dosušují v troubě při nízké teplotě, aby se zbavili hmyzu (tento postup je praxe, ne ověřený standard).',
          'Lepkavé šišky s velkým množstvím pryskyřice nepoužívejte.',
          'Nikdy nedávejte dekorační šišky – barvy, laky a třpytky jsou nebezpečné.',
        ],
      },
    ],
  },
  {
    slug: 'jak-poznat-bezpecny-strom',
    title: 'Jak poznat bezpečný strom?',
    question: 'Jak poznat bezpečný strom?',
    description:
      'Určení stromu podle listu, kůry, větve, květu a plodu. Proč nestačí „vypadá to jako bříza“ a jak postupovat, když si nejste jistí.',
    updated: '2026-11-18',
    provenance: 'C',
    sourceIds: ['kubat-2002'],
    relatedProducts: ['briza', 'liska', 'habr', 'buk', 'jasan', 'akat'],
    body: [
      {
        paragraphs: [
          'Strom určujte podle více znaků najednou: celkový vzhled, list, kůra, větévka s pupeny, květ a plod. Jeden znak nestačí.',
          'V sekci Poznej svůj strom najdete u každé dřeviny popis všech šesti znaků. Fotografie pro určení doplňujeme – do té doby používejte i botanický klíč nebo se poraďte s někým, kdo dřeviny zná.',
        ],
      },
      {
        heading: 'Zlaté pravidlo',
        list: [
          'Neznáte? Nesbírejte.',
          'Nejste si jistí na 100 %? Nesbírejte.',
          'Roste to u silnice, na poli nebo ve stříkaném sadu? Nesbírejte.',
        ],
      },
    ],
  },
  {
    slug: 'jake-bylinky-muze-papousek',
    title: 'Jaké bylinky může papoušek?',
    question: 'Jaké bylinky může papoušek?',
    description:
      'Pampeliška, jitrocel, ptačinec, kopřiva, heřmánek – které plané rostliny chovatelé papouškům dávají a na co si dát pozor.',
    updated: '2026-11-18',
    provenance: 'C',
    sourceIds: ['harrison-lightfoot-2006', 'kubat-2002'],
    relatedProducts: ['pampeliska', 'jitrocel', 'ptacinec', 'kopriva', 'hermanek', 'bolehlav-plamaty', 'cesnek-medvedi'],
    body: [
      {
        paragraphs: [
          'Zelené krmení je důležitou součástí jídelníčku mnoha papoušků. Z planě rostoucích rostlin se v praxi nejčastěji používá pampeliška, jitrocel, ptačinec a mladá kopřiva.',
        ],
      },
      {
        heading: 'Rostliny, které do misky nepatří',
        list: [
          'Miříkovité rostliny (bolehlav, rozpuk) – pro laika snadno zaměnitelné s jedlými druhy a prudce jedovaté.',
          'Medvědí česnek – česnekovité rostliny se papouškům nedávají; navíc hrozí záměna s konvalinkou a ocúnem.',
          'Pryskyřníky a sasanky – dráždivý protoanemonin.',
        ],
      },
    ],
  },
  {
    slug: 'co-sbirat-v-lese-pro-papouska',
    title: 'Co sbírat v lese pro papouška?',
    question: 'Co sbírat v lese pro papouška?',
    description:
      'Sezónní přehled: co se dá v lese a na jeho okraji pro papouška nasbírat na jaře, v létě, na podzim i v zimě – a co tam nechat.',
    updated: '2026-11-18',
    provenance: 'C',
    sourceIds: ['zakon-lesni', 'zakon-ochrana-prirody'],
    relatedProducts: ['pupeny', 'lesni-jahody', 'boruvky', 'sisky', 'sipky', 'vetvicky'],
    body: [
      {
        paragraphs: [
          'Les je skvělý „zverimex“, ale nákupní řád má přísný. Lesní zákon dovoluje každému sbírat pro vlastní potřebu lesní plody a suchou klest ležící na zemi. Řezat živé větve, sekat chvojí nebo poškozovat stromy bez souhlasu vlastníka zakázáno.',
          'Aktuální nabídku podle měsíce najdete v sekci Co roste právě teď.',
        ],
      },
      {
        heading: 'Rychlý přehled',
        list: [
          'Jaro: pupeny a mladé lístky bezpečných dřevin, pampeliška, ptačinec, kopřiva.',
          'Léto: lesní jahody, borůvky, maliny, ostružiny, klasy trav, lipový květ.',
          'Podzim: jeřabiny, šípky, hloh, lískové oříšky, šišky, suché listí.',
          'Zima: suchá klest, šišky, šípky na keřích, větve z ořezu nestříkaných sadů.',
        ],
      },
    ],
  },
  {
    slug: 'jak-pripravit-prirodni-hracku',
    title: 'Jak připravit přírodní hračku?',
    question: 'Jak připravit přírodní hračku?',
    description:
      'Návody na foraging hračky ze šišek, větví, listí a kůry. Jak materiál vyčistit a na co si dát pozor.',
    updated: '2026-11-18',
    provenance: 'C',
    sourceIds: ['harrison-lightfoot-2006'],
    relatedProducts: ['sisky', 'vetvicky', 'kura', 'suche-listi', 'seno-a-sucha-trava', 'prirodni-vlakna'],
    body: [
      {
        paragraphs: [
          'Přírodní hračka nemusí stát nic. Stačí bezpečný materiál, čistota a trocha fantazie. Inspiraci najdete v sekci Přírodní obohacení.',
        ],
      },
      {
        heading: 'Základní pravidla',
        list: [
          'Jen materiál z bezpečných dřevin a rostlin, čistý, suchý a bez plísní.',
          'Žádné lepidlo, barvy, kovové drátky ani dlouhé provázky, do kterých se může papoušek zamotat.',
          'Hračku přizpůsobte velikosti papouška a zpočátku ho při hře sledujte.',
          'Poškozenou, zvlhlou nebo zašpiněnou hračku vyhoďte.',
        ],
      },
    ],
  },
];

export const ARTICLE_MAP = Object.fromEntries(ARTICLES.map((x) => [x.slug, x]));
