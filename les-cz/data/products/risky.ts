import type {
  Identification,
  IllustrationKind,
  Product,
  Provenance,
  SafetyLevel,
  ShopInfo,
  Sourced,
  SourcedList,
} from '@/lib/types';
import { a, b, c, DRAFT, list } from '../helpers';

/**
 * G. ZAKÁZANÉ A RIZIKOVÉ ZBOŽÍ
 *
 * Vzdělávací sekce – rostliny a materiály, které jsou pro papoušky toxické,
 * dráždivé nebo nebezpečné kvůli záměně. Nic z toho se „neprodává“:
 * tlačítko KOUPIT vede k humornému, ale jednoznačnému odmítnutí.
 *
 * Obsahové látky jsou převzaty z obecné toxikologické literatury (B).
 * Údaje specifické pro papoušky většinou chybějí – proto jsou označeny jako C.
 * Žádné dávky, LD50 ani kazuistiky zde záměrně neuvádíme.
 */

const EMERGENCY =
  'Při podezření na otravu ihned kontaktujte veterináře se zaměřením na ptáky a vezměte s sebou vzorek rostliny (nebo její fotografii). Nečekejte, až se objeví příznaky.';

const RED = '#B3261E';

interface RiskyInput {
  slug: string;
  name: string;
  synonyms?: string[];
  latin: string;
  family: string;
  tagline: string;
  months: number[];
  level?: SafetyLevel;
  safety: { summary: string; provenance: Provenance; sourceIds?: string[] };
  parts: Sourced;
  /** Hlavní toxické / rizikové látky (zobrazuje se v sekci nutriční charakteristiky). */
  toxins: Sourced;
  risks: SourcedList;
  habitat: Sourced;
  identification: Identification;
  /** Specifické varování připojené za humorné odmítnutí objednávky. */
  refusal: string;
  benefits?: Sourced;
  serving?: Sourced;
  preparation?: Sourced;
  collecting?: Sourced;
  whenToCollect?: Sourced;
  speciesNote?: string;
  shop?: Partial<ShopInfo>;
  exomix?: string[];
  sourceIds: string[];
  related?: string[];
  visual: { kind: IllustrationKind; color: string; accent?: string };
  seo: { title: string; description: string };
}

/** Sestaví produkt rizikového zboží se společnými výchozími hodnotami. */
function risky(i: RiskyInput): Product {
  const level = i.level ?? 'rizikove';
  const safetySourced = (text: string): Sourced => ({
    text,
    provenance: i.safety.provenance,
    sourceIds: i.safety.sourceIds,
  });
  return {
    slug: i.slug,
    name: i.name,
    synonyms: i.synonyms,
    latin: i.latin,
    family: i.family,
    category: 'rizikove-zbozi',
    tagline: i.tagline,
    months: i.months,
    shop: {
      price: 'NEPRODEJNÉ',
      availability: 'STAŽENO Z PRODEJE',
      warehouse: 'Lesní trezor – oddělení nebezpečného zboží',
      shipping: 'Nedoručujeme. Ani vlastníma nohama.',
      badge: 'Nekupovat!',
      buyMessage: `Objednávka zamítnuta. Tohle zboží lesní skladník papouškům nevydá. ${i.refusal}`,
      ...i.shop,
    },
    safety: { level, ...i.safety },
    parts: i.parts,
    nutrition: { summary: i.toxins },
    benefits:
      i.benefits ?? safetySourced('Žádný. Pro papouška nemá tato rostlina přínos, který by vyvážil riziko otravy.'),
    species: {
      mali: 'Nevhodné.',
      stredni: 'Nevhodné.',
      velci: 'Nevhodné.',
      poznamka:
        i.speciesNote ??
        'Toxicita je doložena obecně (u lidí a savců); údaje pro jednotlivé druhy papoušků většinou chybějí. Z preventivních důvodů je rostlina nevhodná pro všechny papoušky.',
      provenance: 'C',
    },
    serving: i.serving ?? safetySourced('Nepodávat.'),
    preparation:
      i.preparation ??
      c('Žádná domácí úprava – mytí, sušení, vaření ani mražení – z této rostliny bezpečné krmivo neudělá.'),
    risks: { ...i.risks, items: [...i.risks.items, EMERGENCY] },
    collecting:
      i.collecting ??
      c(
        'Nesbírat. Pokud rostlina roste u voliéry nebo venkovního výběhu, kam papoušek dosáhne, odstraňte ji nebo zabraňte přístupu. Nepoužívejte ji ani jako dekoraci v místnosti, kde papoušek volně létá.',
      ),
    habitat: i.habitat,
    whenToCollect:
      i.whenToCollect ?? c('Nikdy. Uvedené měsíce značí období, kdy je rostlina nejnápadnější nebo nejrizikovější.'),
    identification: i.identification,
    exomix: i.exomix,
    sourceIds: i.sourceIds,
    review: DRAFT,
    visual: { kind: i.visual.kind, color: i.visual.color, accent: i.visual.accent ?? RED },
    photos: [],
    related: i.related,
    seo: i.seo,
  };
}

/** Určovací znaky podle Klíče ke květeně ČR (B). */
const ident = (
  parts: Identification['parts'],
  lookalikes?: Identification['lookalikes'],
): Identification => ({ parts, lookalikes, provenance: 'B', sourceIds: ['kubat-2002'] });

const ALL_YEAR = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const RISKY: Product[] = [
  risky({
    slug: 'tis-cerveny',
    name: 'Tis červený',
    synonyms: ['tis', 'tisový živý plot'],
    latin: 'Taxus baccata L.',
    family: 'Taxaceae – tisovité',
    tagline: 'Elegantní stálezelený design. Bohužel smrtelně vážně.',
    months: ALL_YEAR,
    safety: {
      summary:
        'Prudce jedovatý pro lidi i zvířata. Tis patří mezi rostliny, které literatura o ptačí toxikologii typicky uvádí jako jedovaté.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005', 'harrison-lightfoot-2006'],
    },
    parts: b(
      'Jedovaté jsou všechny části – jehlice (i suché a opadané), větve, kůra i semeno. Nejedovatý je jen červený dužnatý míšek, semeno uvnitř je však prudce jedovaté.',
      'frohne-pfander-2005',
      'cooper-johnson-1984',
    ),
    toxins: b('Taxinové alkaloidy (zejména taxin B) – působí na srdce a vyvolávají poruchy srdečního rytmu.', 'frohne-pfander-2005'),
    risks: list(
      'B',
      ['U zvířat bývá průběh otravy velmi rychlý – slabost, třes, dušnost, poruchy srdečního rytmu, náhlý úhyn.'],
      'frohne-pfander-2005',
      'cooper-johnson-1984',
    ),
    preparation: b(
      'Sušením jedovatost nezmizí – nebezpečné jsou i suché opadané jehlice a odřezky ze stříhání živých plotů.',
      'cooper-johnson-1984',
    ),
    habitat: b(
      'Ve volné přírodě vzácný a chráněný (skalnaté svahy, roklinové lesy). Velmi častý v parcích, na hřbitovech, v zahradách a živých plotech – tedy často blízko domova.',
      'kubat-2002',
      'zakon-ochrana-prirody',
    ),
    identification: ident(
      {
        cely: 'Stálezelený jehličnatý keř nebo strom, často stříhaný do tvaru.',
        list: 'Ploché měkké jehlice 2–3 cm, nahoře tmavě zelené a lesklé, vespod světlejší a bez bílých proužků, uspořádané do dvou řad.',
        kura: 'Červenohnědá, odlupuje se v tenkých šupinách.',
        vetev: 'Bez pryskyřice – rozemnuté jehlice nevoní pryskyřicí.',
        plod: 'Semeno obalené jasně červeným dužnatým míškem (srpen–říjen), jen na samičích rostlinách.',
      },
      [
        {
          name: 'Jedle bělokorá',
          latin: 'Abies alba',
          danger:
            'Jedle má na rubu jehlic dva bílé proužky a voní pryskyřicí. Při sběru jehličnatých větví vždy tis spolehlivě vylučte.',
        },
        {
          name: 'Smrk a borovice',
          slug: 'smrk-a-borovice',
          danger:
            'Smrk má jehlice čtyřhranné a pichlavé, borovice dlouhé a ve svazečcích. Tis má jehlice ploché, měkké a bez vůně.',
        },
      ],
    ),
    refusal:
      'Tis je prudce jedovatý – včetně suchých jehlic a odřezků z živého plotu. Větve tisu nikdy nedávejte do klece ani do voliéry.',
    sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984', 'harrison-lightfoot-2006', 'kubat-2002', 'zakon-ochrana-prirody'],
    related: ['smrk-a-borovice', 'tuje', 'sisky'],
    visual: { kind: 'branch', color: '#1F3D2B' },
    seo: {
      title: 'Je tis jedovatý pro papoušky? | LES.cz',
      description:
        'Tis červený je prudce jedovatý pro papoušky i lidi – jehlice, větve i semena. Jak ho poznat v parku a s čím ho nezaměnit.',
    },
  }),

  risky({
    slug: 'avokado',
    name: 'Avokádo',
    synonyms: ['avokádová pecka', 'guacamole'],
    latin: 'Persea americana Mill.',
    family: 'Lauraceae – vavřínovité',
    tagline: 'Exotický import. Do lesa nepatří a do papouška taky ne.',
    months: ALL_YEAR,
    safety: {
      summary:
        'Avokádo patří mezi nejznámější toxické potraviny v ptačí medicíně. Otravy klecových ptáků byly popsány v odborné literatuře.',
      provenance: 'B',
      sourceIds: ['hargis-1989', 'harrison-lightfoot-2006'],
    },
    parts: b('Za rizikové se považuje celé avokádo – listy, slupka, pecka i dužnina.', 'hargis-1989', 'harrison-lightfoot-2006'),
    toxins: b(
      'Persin – látka poškozující srdeční sval; u ptáků je popisována dušnost a hromadění tekutin.',
      'hargis-1989',
      'harrison-lightfoot-2006',
    ),
    risks: list('B', ['Popisované příznaky u ptáků: dušnost, načepýření, slabost, náhlý úhyn.'], 'hargis-1989'),
    preparation: c(
      'Žádná úprava avokádo bezpečným nečiní. Pozor i na guacamole a pomazánky – papoušek nemá ochutnávat z talíře.',
    ),
    collecting: c(
      'Nekupovat pro papouška. Avokádový „stromek“ vypěstovaný z pecky nepěstujte v místnosti, kde papoušek volně létá.',
    ),
    habitat: c(
      'V lese neroste. Najdete ho v obchodě, v kuchyni – a na talíři vedle papouška. Proto je v lesním trezoru jako exotická výjimka.',
    ),
    whenToCollect: c('Nikdy. Avokádo je v obchodech „naskladněno“ celoročně, a proto je i riziko celoroční.'),
    identification: {
      parts: {
        plod: 'Hruškovitý plod se zelenou až tmavě fialovou slupkou, nažloutlou máslovou dužninou a velkou kulatou peckou.',
        list: 'Pokojová rostlina vypěstovaná z pecky má velké kožovité eliptické listy – i ty jsou rizikové.',
      },
      provenance: 'C',
    },
    refusal: 'Avokádo je pro papoušky toxické – dužnina, slupka, pecka i listy. A v lese stejně neroste.',
    sourceIds: ['hargis-1989', 'harrison-lightfoot-2006'],
    related: ['plisne', 'rododendron', 'tis-cerveny'],
    visual: { kind: 'warning', color: '#4E6B2E' },
    seo: {
      title: 'Může papoušek avokádo? Ne. Proč | LES.cz',
      description:
        'Avokádo je pro papoušky toxické (persin). Proč patří mezi nejznámější jedovaté potraviny pro ptáky a co dělat při podezření na otravu.',
    },
  }),

  risky({
    slug: 'konvalinka',
    name: 'Konvalinka vonná',
    synonyms: ['konvalinka', 'konvalinky'],
    latin: 'Convallaria majalis L.',
    family: 'Asparagaceae – chřestovité',
    tagline: 'Voní jako jaro. Působí na srdce. Papouškovi neprodáváme.',
    months: [4, 5, 6, 7, 8],
    safety: {
      summary:
        'Celá rostlina obsahuje srdeční glykosidy. Jedovatá je i voda z vázy, ve které stály konvalinky.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984'],
    },
    parts: b('Všechny části – listy, květy, červené bobule i oddenek. Jedovatá je i voda z vázy.', 'frohne-pfander-2005'),
    toxins: b('Srdeční glykosidy (zejména konvalatoxin) – ovlivňují srdeční rytmus.', 'frohne-pfander-2005'),
    risks: list(
      'B',
      ['Popisovány jsou zažívací potíže a poruchy srdečního rytmu (údaje převážně u lidí a savců).'],
      'frohne-pfander-2005',
      'cooper-johnson-1984',
    ),
    habitat: b('Listnaté a smíšené lesy, háje a křoviny; často také na zahradách.', 'kubat-2002'),
    identification: ident(
      {
        cely: 'Vytrvalá bylina 10–25 cm s plazivým oddenkem.',
        list: 'Obvykle 2 (až 3) eliptické listy vyrůstající z jednoho místa a navzájem se objímající pochvami. Bez vůně česneku.',
        kvet: 'Bílé zvonkovité vonné květy v jednostranném hroznu, květen.',
        plod: 'Červené kulovité bobule, léto.',
      },
      [
        {
          name: 'Česnek medvědí',
          slug: 'cesnek-medvedi',
          danger:
            'Listy medvědího česneku vyrůstají každý zvlášť na vlastním řapíku a po rozemnutí voní česnekem. Pozor: po předchozím sběru voní česnekem i ruce a test vůní je pak nespolehlivý.',
        },
        {
          name: 'Ocún jesenní',
          slug: 'ocun-jesenni',
          danger: 'Ocún má na jaře listy v trsu přímo ze země, uprostřed s tobolkou. Je také prudce jedovatý.',
        },
      ],
    ),
    refusal:
      'Konvalinka obsahuje srdeční glykosidy. Nedávejte ji papouškovi ani jako kytičku do pokoje – jedovatá je i voda z vázy.',
    sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984', 'kubat-2002'],
    related: ['cesnek-medvedi', 'ocun-jesenni', 'naprstnik'],
    visual: { kind: 'flower', color: '#F4F1E8' },
    seo: {
      title: 'Je konvalinka jedovatá pro papoušky? | LES.cz',
      description:
        'Konvalinka obsahuje srdeční glykosidy – jedovaté jsou listy, květy, bobule i voda z vázy. Jak ji odlišit od medvědího česneku.',
    },
  }),

  risky({
    slug: 'naprstnik',
    name: 'Náprstník',
    synonyms: ['náprstník červený', 'náprstník velkokvětý', 'digitalis'],
    latin: 'Digitalis purpurea L. a další druhy rodu Digitalis',
    family: 'Plantaginaceae – jitrocelovité',
    tagline: 'Fialové zvonky jako z katalogu. Obsah: srdeční glykosidy.',
    months: [6, 7, 8],
    safety: {
      summary: 'Všechny části obsahují srdeční glykosidy. Náprstník patří mezi klasické jedovaté rostliny.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984'],
    },
    parts: b('Všechny části, zejména listy a semena.', 'frohne-pfander-2005'),
    toxins: b('Srdeční glykosidy (digitoxin a další) – ovlivňují srdeční rytmus.', 'frohne-pfander-2005'),
    risks: list(
      'B',
      ['Popisovány jsou zažívací potíže a poruchy srdečního rytmu (údaje převážně u lidí a savců).'],
      'frohne-pfander-2005',
    ),
    preparation: b('Sušením se jedovatost neztrácí.', 'cooper-johnson-1984'),
    habitat: b(
      'Paseky, lesní okraje a světliny, zejména na kyselých půdách; pěstuje se i na zahradách. U nás roste také žlutě kvetoucí náprstník velkokvětý.',
      'kubat-2002',
    ),
    identification: ident(
      {
        cely: 'Dvouletá až vytrvalá bylina; v prvním roce jen přízemní růžice listů, ve druhém lodyha 0,5–1,5 m.',
        list: 'Vejčitě kopinaté listy, na rubu šedoplstnaté, s výraznou žilnatinou.',
        kvet: 'Nachové (u náprstníku velkokvětého žluté) náprstkovité květy v dlouhém jednostranném hroznu, uvnitř tečkované.',
      },
      [
        {
          name: 'Kostival lékařský',
          latin: 'Symphytum officinale',
          danger:
            'Přízemní růžice listů si lze splést. Ani kostival není pro papouška vhodný – obsahuje pyrrolizidinové alkaloidy.',
        },
        {
          name: 'Divizna',
          latin: 'Verbascum spp.',
          danger: 'Má podobně plstnaté listy v růžici. Bez jistého určení nesbírejte žádné přízemní růžice listů.',
        },
      ],
    ),
    refusal: 'Náprstník obsahuje srdeční glykosidy – listy, květy i semena. Ani usušený není bezpečný.',
    sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984', 'kubat-2002'],
    related: ['konvalinka', 'omej'],
    visual: { kind: 'flower', color: '#9B3F8C' },
    seo: {
      title: 'Náprstník a papoušci: jedovatá krása | LES.cz',
      description:
        'Náprstník obsahuje srdeční glykosidy a je jedovatý i usušený. Jak ho poznat na pasece a proč ho nesbírat ani do kytice.',
    },
  }),

  risky({
    slug: 'omej',
    name: 'Oměj',
    synonyms: ['oměj šalamounek', 'oměj vlčí mor', 'akonit'],
    latin: 'Aconitum spp. (např. A. napellus, A. lycoctonum)',
    family: 'Ranunculaceae – pryskyřníkovité',
    tagline: 'Modrá přilba, pod ní jeden z nejjedovatějších obsahů v Evropě.',
    months: [6, 7, 8, 9],
    safety: {
      summary: 'Oměje patří mezi nejjedovatější rostliny Evropy. Jedovaté jsou všechny části.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005'],
    },
    parts: b('Všechny části, nejvíce hlízy (kořeny) a semena.', 'frohne-pfander-2005'),
    toxins: b('Diterpenoidní alkaloidy, zejména akonitin – působí na nervovou soustavu a srdce.', 'frohne-pfander-2005'),
    risks: list(
      'B',
      [
        'Otravu mohou vyvolat už malá množství; popisovány jsou poruchy srdečního rytmu a ochrnutí (údaje u lidí a savců).',
        'Akonitin může pronikat i kůží – při manipulaci s rostlinou používejte rukavice.',
      ],
      'frohne-pfander-2005',
    ),
    habitat: b(
      'Vlhké horské a podhorské nivy, břehy potoků, vlhké lesy; oměj šalamounek se často pěstuje na zahradách.',
      'kubat-2002',
    ),
    identification: ident(
      {
        cely: 'Vytrvalá bylina 0,5–1,5 m.',
        list: 'Dlanitě hluboce dělené listy.',
        kvet: 'Přilbovité květy – modrofialové (oměj šalamounek) nebo světle žluté (oměj vlčí mor).',
      },
      [
        {
          name: 'Ostrožky a další modře kvetoucí zahradní trvalky',
          danger: 'Modré zahradní květiny nesbírejte pro papouška bez jistého určení.',
        },
      ],
    ),
    refusal: 'Oměj patří mezi nejjedovatější rostliny Evropy. Nesahejte na něj bez rukavic, natož abyste ho nesli papouškovi.',
    sourceIds: ['frohne-pfander-2005', 'kubat-2002'],
    related: ['naprstnik', 'pryskyrnik-a-sasanky'],
    visual: { kind: 'flower', color: '#3E4FA3' },
    seo: {
      title: 'Oměj – nejjedovatější rostlina lesa | LES.cz',
      description:
        'Oměj patří mezi nejjedovatější rostliny Evropy. Kde roste, jak vypadá a proč se ho nedotýkat bez rukavic.',
    },
  }),

  risky({
    slug: 'rulik-zlomocny',
    name: 'Rulík zlomocný',
    synonyms: ['rulík', 'belladona', 'vlčí bobule'],
    latin: 'Atropa bella-donna L.',
    family: 'Solanaceae – lilkovité',
    tagline: 'Černé lesklé bobule v akci „jako borůvky“. Nejsou to borůvky.',
    months: [7, 8, 9],
    safety: {
      summary:
        'Všechny části obsahují tropanové alkaloidy. Lesklé černé bobule jsou nebezpečné hlavně kvůli záměně s borůvkami.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984'],
    },
    parts: b('Všechny části – kořen, listy, květy i bobule.', 'frohne-pfander-2005'),
    toxins: b('Tropanové alkaloidy (hyoscyamin/atropin, skopolamin) – působí na nervovou soustavu.', 'frohne-pfander-2005'),
    risks: list('C', [
      'U lidí a savců je popisován neklid, rozšířené zornice a zrychlený tep. Citlivost ptáků na tropanové alkaloidy se může od savců lišit a není dobře popsána – riziko je i tak nepřijatelné.',
    ]),
    habitat: b(
      'Paseky a světliny v bukových a smíšených lesích, hlavně na vápnitých půdách v pahorkatinách a horách.',
      'kubat-2002',
    ),
    identification: ident(
      {
        cely: 'Statná bylina 0,5–1,5 m (borůvka je keříček do 50 cm).',
        list: 'Velké vejčité celokrajné listy, často po dvou nestejně velkých.',
        kvet: 'Hnědofialové zvonkovité květy jednotlivě v paždí listů.',
        plod: 'Lesklá černá bobule velikosti třešně, sedící na hvězdicovitém zeleném kalichu.',
      },
      [
        {
          name: 'Borůvky',
          slug: 'boruvky',
          danger:
            'Borůvka roste na nízkém keříčku, plody jsou modročerné s namodralým ojíněním a na vrcholu mají plochou „korunku“. Rulík je vysoká bylina s lesklými bobulemi na zeleném hvězdicovitém kalichu.',
        },
        {
          name: 'Třešně',
          danger: 'Velikostí a leskem připomínají třešně, ale rostou jednotlivě na bylině, ne na stromě.',
        },
      ],
    ),
    refusal: 'Rulík zlomocný není borůvka, i když se tak v lese tváří. Všechny jeho části jsou jedovaté.',
    sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984', 'kubat-2002'],
    related: ['boruvky', 'vrani-oko', 'lilek-potmechut'],
    visual: { kind: 'berry', color: '#1C1A22' },
    seo: {
      title: 'Rulík zlomocný: jedovatá „borůvka“ | LES.cz',
      description:
        'Rulík zlomocný má lesklé černé bobule podobné borůvkám a je jedovatý. Jak ho na pasece spolehlivě odlišit od borůvek.',
    },
  }),

  risky({
    slug: 'lilek-potmechut',
    name: 'Lilek potměchuť',
    synonyms: ['potměchuť', 'psí víno'],
    latin: 'Solanum dulcamara L.',
    family: 'Solanaceae – lilkovité',
    tagline: 'Červené bobule v hroznech. Vypadá jako dárek, chová se jako jed.',
    months: [7, 8, 9, 10],
    safety: {
      summary: 'Obsahuje steroidní glykoalkaloidy, nejvíce v nezralých bobulích a stoncích.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005'],
    },
    parts: b('Všechny části, zejména nezralé (zelené) bobule, listy a stonky.', 'frohne-pfander-2005'),
    toxins: b(
      'Steroidní glykoalkaloidy solaninového typu – dráždí trávicí trakt a působí na nervovou soustavu.',
      'frohne-pfander-2005',
    ),
    risks: list('C', ['U zvířat jsou popisovány zažívací potíže; údaje pro papoušky chybějí.']),
    habitat: b(
      'Vlhká místa: břehy vod, olšiny, vlhké křoviny a lesní okraje; popíná se po okolní vegetaci.',
      'kubat-2002',
    ),
    identification: ident(
      {
        cely: 'Popínavý polokeř, lodyhy dole dřevnatějí, 0,3–2 m.',
        list: 'Vejčité listy, často na bázi se dvěma ouškovitými laloky.',
        kvet: 'Fialové květy s nazpět ohnutými cípy a nápadným žlutým kuželem prašníků.',
        plod: 'Vejcovité lesklé bobule, nejdřív zelené, pak oranžové až šarlatově červené, v převislých vrcholících.',
      },
      [
        {
          name: 'Jeřabiny',
          slug: 'jerabiny',
          danger:
            'Jeřabiny rostou na stromě ve vzpřímených chocholících a jeřáb má zpeřené listy. Potměchuť je popínavá rostlina s převislými hrozny vejčitých bobulí.',
        },
        {
          name: 'Lesní jahody',
          slug: 'lesni-jahody',
          danger: 'Jahoda má semínka na povrchu, potměchuť je hladká lesklá bobule.',
        },
      ],
    ),
    refusal: 'Lilek potměchuť má krásné červené bobule – a v nich glykoalkaloidy. Nesbírat.',
    sourceIds: ['frohne-pfander-2005', 'kubat-2002'],
    related: ['jerabiny', 'rulik-zlomocny', 'lykovec-jedovaty'],
    visual: { kind: 'berry', color: '#D2382B' },
    seo: {
      title: 'Je lilek potměchuť jedovatý? | LES.cz',
      description:
        'Lilek potměchuť má lákavé červené bobule, které obsahují glykoalkaloidy. Jak ho poznat a s čím si ho nesplést.',
    },
  }),

  risky({
    slug: 'krusina-olsova',
    name: 'Krušina olšová',
    synonyms: ['krušina'],
    latin: 'Frangula alnus Mill.',
    family: 'Rhamnaceae – řešetlákovité',
    tagline: 'Bobule ve třech barvách najednou. Projímavý efekt v ceně.',
    months: [7, 8, 9, 10],
    safety: {
      summary: 'Kůra a plody obsahují antrachinonové glykosidy s výrazně projímavým účinkem.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984'],
    },
    parts: b('Kůra (zejména čerstvá), plody, v menší míře listy.', 'frohne-pfander-2005'),
    toxins: b('Antrachinonové glykosidy (frangulin a další) – silně dráždí střeva.', 'frohne-pfander-2005'),
    risks: list('C', [
      'Průjem, dehydratace, podráždění trávicího traktu. U malých ptáků může být závažná i mírná otrava.',
    ]),
    preparation: b(
      'Čerstvá kůra je dráždivější než kůra dlouho skladovaná – pro papouška ale není bezpečná ani ta.',
      'frohne-pfander-2005',
    ),
    habitat: b(
      'Vlhké lesy, olšiny, rašeliniště, lesní okraje a paseky, hlavně na kyselých půdách.',
      'kubat-2002',
    ),
    identification: ident(
      {
        cely: 'Keř nebo nízký strom 1–4 m.',
        list: 'Střídavé, eliptické, celokrajné listy s 6–10 páry souběžných postranních žilek.',
        kura: 'Šedohnědá se světlými podlouhlými lenticelami; vnitřní kůra je po seškrábnutí žlutá.',
        plod: 'Kulovité peckovičky zrají postupně – na jednom keři bývají zároveň zelené, červené a černé.',
      },
      [
        {
          name: 'Olše',
          slug: 'olse',
          danger:
            'Olše má listy na okraji pilovité, na konci uťaté nebo vykrojené, a nese šištičky. Krušina má listy celokrajné a bobule. Při řezání větví „z olšiny“ krušinu vylučte.',
        },
        {
          name: 'Dřín',
          slug: 'drin',
          danger: 'Dřín má vstřícné listy a podlouhlé červené peckovice; krušina má listy střídavé a plody postupně černající.',
        },
        {
          name: 'Borůvky',
          slug: 'boruvky',
          danger: 'Borůvka je nízký keříček, krušina keř až strom.',
        },
      ],
    ),
    refusal: 'Krušina olšová je silně projímavá – kůra i bobule. Z lesní lékárny ji papouškům nevydáváme.',
    sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984', 'kubat-2002'],
    related: ['olse', 'drin', 'kura'],
    visual: { kind: 'berry', color: '#2A1E24' },
    seo: {
      title: 'Krušina olšová a papoušci | LES.cz',
      description:
        'Krušina olšová má silně projímavou kůru i bobule. Jak ji odlišit od olše a dřínu při sběru větví pro papouška.',
    },
  }),

  risky({
    slug: 'brslen-evropsky',
    name: 'Brslen evropský',
    synonyms: ['brslen', 'kardinálská čepice', 'kardinálská čepička'],
    latin: 'Euonymus europaeus L.',
    family: 'Celastraceae – jesencovité',
    tagline: '„Kardinálská čepička“ – módní kousek podzimu. Na papouška nesedí.',
    months: [9, 10, 11],
    safety: {
      summary: 'Plody, semena, listy i kůra obsahují jedovaté látky; u zvířat jsou popisovány otravy.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984'],
    },
    parts: b('Všechny části, zejména plody a semena.', 'frohne-pfander-2005'),
    toxins: b('Kardioaktivní glykosidy (kardenolidy) a další látky, mimo jiné alkaloidy.', 'frohne-pfander-2005'),
    risks: list('C', ['Zažívací potíže, při větším množství poruchy srdeční činnosti; údaje pro ptáky chybějí.']),
    habitat: b('Lesní okraje, křoviny, lužní a světlé listnaté lesy, živé ploty.', 'kubat-2002'),
    identification: ident(
      {
        cely: 'Keř 1–4 m.',
        list: 'Vstřícné, eliptické, jemně pilovité listy, na podzim karmínově zbarvené.',
        vetev: 'Mladé větévky zelené, čtyřhranné, často s korkovými lištami.',
        plod: 'Růžové až karmínové čtyřlaločné tobolky, ze kterých visí semena v oranžovém míšku.',
      },
      [
        {
          name: 'Šípky',
          slug: 'sipky',
          danger: 'Šípek je dužnatý červený plod na trnitém keři; brslen má laločnatou tobolku s oranžovými semeny.',
        },
        {
          name: 'Hloh',
          slug: 'hloh',
          danger: 'Hloh má trny a drobné červené malvičky v chocholících.',
        },
      ],
    ),
    refusal: 'Brslen je krásný, ale jedovatý. Žádné „kardinálské čepičky“ do voliéry.',
    sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984', 'kubat-2002'],
    related: ['sipky', 'hloh'],
    visual: { kind: 'berry', color: '#D9457A' },
    seo: {
      title: 'Brslen evropský: jedovatá čepička | LES.cz',
      description:
        'Brslen evropský láká růžovými tobolkami s oranžovými semeny, ale je jedovatý. Jak ho poznat a odlišit od šípků a hlohu.',
    },
  }),

  risky({
    slug: 'bez-cerveny',
    name: 'Bez červený',
    synonyms: ['bez hroznatý', 'červené bezinky'],
    latin: 'Sambucus racemosa L.',
    family: 'Viburnaceae (Adoxaceae) – kalinovité',
    tagline: 'Červené hrozny už v létě. Předčasný výprodej, který nedoporučujeme.',
    months: [6, 7, 8],
    safety: {
      summary: 'Semena a nezralé části obsahují kyanogenní glykosidy. Pro papouška je bez červený nevhodný.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005'],
    },
    parts: b('Semena v plodech, listy, kůra a nezralé plody.', 'frohne-pfander-2005'),
    toxins: b('Kyanogenní glykosidy (uvolňují kyanovodík), zejména v semenech.', 'frohne-pfander-2005'),
    risks: list('C', ['Vyvrhování potravy, průjem, slabost. Papoušek semena při zobání rozdrtí, čímž se látky uvolní.']),
    habitat: b('Paseky, lesní okraje a světliny, hlavně v podhůří a horách.', 'kubat-2002'),
    identification: ident(
      {
        cely: 'Keř 1–3 m.',
        list: 'Vstřícné lichozpeřené listy s 5 (3–7) pilovitými lístky.',
        vetev: 'Dřeň ve větvích je žlutohnědá (bez černý má dřeň bílou).',
        kvet: 'Žlutavě bílé květy v hustých vejčitých latách, duben–květen.',
        plod: 'Jasně červené peckovičky v hustých hroznech, zrají v červnu až srpnu.',
      },
      [
        {
          name: 'Bezinky (bez černý)',
          slug: 'bezinky',
          danger: 'Bez černý má plody černé v plochých vrcholících a bílou dřeň. Červené „bezinky“ jsou vždy bez červený.',
        },
        {
          name: 'Jeřabiny',
          slug: 'jerabiny',
          danger: 'Jeřáb má listy střídavé a plody dozrávají až na konci léta v plochých chocholících.',
        },
      ],
    ),
    refusal: 'Červené bezinky nejsou bezinky. Bez červený má jedovatá semena.',
    sourceIds: ['frohne-pfander-2005', 'kubat-2002'],
    related: ['bezinky', 'bez-chebdi', 'jerabiny'],
    visual: { kind: 'berry', color: '#E0312B' },
    seo: {
      title: 'Bez červený a papoušci | LES.cz',
      description:
        'Bez červený má jasně červené plody s jedovatými semeny. Jak ho poznat a proč červené „bezinky“ nesbírat pro papouška.',
    },
  }),

  risky({
    slug: 'bez-chebdi',
    name: 'Bez chebdí',
    synonyms: ['chebdí', 'bezinky na bylině'],
    latin: 'Sambucus ebulus L.',
    family: 'Viburnaceae (Adoxaceae) – kalinovité',
    tagline: 'Vypadá jako bezinky. Páchne jako problém.',
    months: [8, 9, 10],
    safety: {
      summary: 'Celá rostlina je jedovatá, včetně zralých černých plodů.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005'],
    },
    parts: b('Všechny části včetně zralých plodů.', 'frohne-pfander-2005'),
    toxins: b('Kyanogenní glykosidy, lektiny a další látky dráždící trávicí trakt.', 'frohne-pfander-2005'),
    risks: list('C', ['Vyvrhování potravy, průjem, slabost; údaje pro ptáky chybějí.']),
    habitat: b(
      'Okraje cest a lesů, paseky, rumiště; hlavně v teplejších oblastech na živinami bohatých půdách.',
      'kubat-2002',
    ),
    identification: ident(
      {
        cely: 'Vytrvalá BYLINA 0,5–2 m, která na zimu zatahuje – nemá dřevnaté kmínky jako bez černý.',
        list: 'Vstřícné lichozpeřené listy se 7–11 úzkými lístky; rostlina nepříjemně páchne.',
        kvet: 'Bílé květy s fialovými prašníky ve VZPŘÍMENÝCH vrcholících.',
        plod: 'Černé lesklé plody ve vzpřímených vrcholících (zralé bezinky visí dolů).',
      },
      [
        {
          name: 'Bezinky (bez černý)',
          slug: 'bezinky',
          danger:
            'Bez černý je keř nebo stromek s dřevnatými větvemi a zralé plodenství visí dolů. Bez chebdí je bylina a plodenství drží vzpřímeně.',
        },
      ],
    ),
    refusal: 'Bez chebdí není bezinka. Je to jedovatá bylina, která se jen dobře převléká.',
    sourceIds: ['frohne-pfander-2005', 'kubat-2002'],
    related: ['bezinky', 'bez-cerveny'],
    visual: { kind: 'berry', color: '#1E1B2A' },
    seo: {
      title: 'Bez chebdí: jedovatý dvojník bezinek | LES.cz',
      description:
        'Bez chebdí vypadá jako bezinky, ale je jedovatý. Podle čeho ho poznáte: bylina, vzpřímené plodenství a nepříjemný pach.',
    },
  }),

  risky({
    slug: 'vrani-oko',
    name: 'Vraní oko čtyřlisté',
    synonyms: ['vraní oko'],
    latin: 'Paris quadrifolia L.',
    family: 'Melanthiaceae – kýchavicovité',
    tagline: 'Jedna borůvka na talířku ze čtyř listů. Jen to není borůvka.',
    months: [6, 7, 8],
    safety: {
      summary: 'Celá rostlina obsahuje saponiny, nejvíce bobule a oddenek.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005'],
    },
    parts: b('Všechny části, zejména bobule a oddenek.', 'frohne-pfander-2005'),
    toxins: b('Steroidní saponiny – dráždí trávicí trakt.', 'frohne-pfander-2005'),
    risks: list('C', ['Zažívací potíže; údaje pro ptáky chybějí.']),
    habitat: b('Stinné vlhké listnaté a smíšené lesy, lužní lesy, humózní půdy.', 'kubat-2002'),
    identification: ident(
      {
        cely: 'Bylina 15–40 cm s jedinou lodyhou.',
        list: 'Na vrcholu lodyhy přeslen obvykle 4 (až 6) širokých listů do kříže.',
        kvet: 'Jediný nenápadný zelenavý květ nad listy, květen–červen.',
        plod: 'Jediná modročerná ojíněná bobule uprostřed přeslenu listů.',
      },
      [
        {
          name: 'Borůvky',
          slug: 'boruvky',
          danger: 'Borůvky rostou po mnoha na keříčku. Vraní oko má vždy jedinou bobuli nad čtyřmi listy.',
        },
      ],
    ),
    refusal: 'Vraní oko je jen jedno, ale jedovaté. Na borůvky se zeptejte ve vedlejším regálu.',
    sourceIds: ['frohne-pfander-2005', 'kubat-2002'],
    related: ['boruvky', 'rulik-zlomocny'],
    visual: { kind: 'berry', color: '#232A4A' },
    seo: {
      title: 'Vraní oko čtyřlisté: falešná borůvka | LES.cz',
      description:
        'Vraní oko má jedinou modročernou bobuli nad čtyřmi listy a je jedovaté. Jak ho v lese odlišit od borůvek.',
    },
  }),

  risky({
    slug: 'lykovec-jedovaty',
    name: 'Lýkovec jedovatý',
    synonyms: ['lýkovec', 'lýkovec obecný'],
    latin: 'Daphne mezereum L.',
    family: 'Thymelaeaceae – vrabečnicovité',
    tagline: 'Kvete jako první, voní jako parfém a dráždí jako pepřák.',
    months: [2, 3, 4, 7, 8],
    safety: {
      summary: 'Kůra, listy i červené bobule obsahují silně dráždivé diterpeny.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005'],
    },
    parts: b('Všechny části, zejména kůra a bobule (semena).', 'frohne-pfander-2005'),
    toxins: b(
      'Diterpeny daphnanového typu (mezerein, dafnetoxin) – silně dráždí sliznice i kůži.',
      'frohne-pfander-2005',
    ),
    risks: list('C', ['Silné podráždění zobáku, dutiny ústní a trávicího traktu; údaje pro ptáky chybějí.']),
    habitat: b(
      'Listnaté a smíšené lesy, zejména na vápnitých a humózních půdách, od pahorkatin po hory.',
      'kubat-2002',
    ),
    identification: ident(
      {
        cely: 'Řídce větvený keřík 0,3–1,5 m.',
        kvet: 'Růžové vonné květy vyrůstají přímo z holých větví ještě před olistěním (únor–duben).',
        list: 'Kopinaté listy nahloučené na koncích větví.',
        plod: 'Lesklé šarlatové bobule přisedlé přímo na větvičkách, červenec–srpen.',
      },
      [
        {
          name: 'Rybíz',
          latin: 'Ribes spp.',
          danger: 'Rybíz má bobule v převislých hroznech na stopkách; lýkovec má bobule přisedlé přímo na větvi.',
        },
        {
          name: 'Dřín',
          slug: 'drin',
          danger: 'Dřín má protáhlé červené peckovice na stopkách a vstřícné listy.',
        },
      ],
    ),
    refusal: 'Lýkovec jedovatý má jméno, které se nemusí překládat. Nesbírat.',
    sourceIds: ['frohne-pfander-2005', 'kubat-2002'],
    related: ['drin', 'lilek-potmechut'],
    visual: { kind: 'berry', color: '#D4242E' },
    seo: {
      title: 'Lýkovec jedovatý a papoušci | LES.cz',
      description:
        'Lýkovec jedovatý má silně dráždivou kůru i červené bobule. Jak ho poznat v předjaří podle růžových květů na holých větvích.',
    },
  }),

  risky({
    slug: 'bolehlav-plamaty',
    name: 'Bolehlav plamatý a rozpuk jízlivý',
    synonyms: ['bolehlav', 'rozpuk', 'bílé okolíky', 'miříkovité'],
    latin: 'Conium maculatum L.; Cicuta virosa L.',
    family: 'Apiaceae – miříkovité',
    tagline: 'Bílé okolíky na rozloučenou. Klasika antické tragédie.',
    months: [6, 7, 8, 9],
    safety: {
      summary:
        'Bolehlav i rozpuk patří mezi nejjedovatější rostliny naší přírody. Miříkovité rostliny s bílými okolíky proto pro papouška nesbírejte vůbec.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984'],
    },
    parts: b('Všechny části; u rozpuku zejména oddenek.', 'frohne-pfander-2005'),
    toxins: b(
      'Bolehlav: piperidinové alkaloidy (koniin). Rozpuk: polyacetylen cikutoxin, který vyvolává křeče.',
      'frohne-pfander-2005',
    ),
    risks: list('B', ['Ochrnutí, křeče, selhání dýchání (údaje u lidí a savců).'], 'frohne-pfander-2005', 'cooper-johnson-1984'),
    habitat: b(
      'Bolehlav: rumiště, okraje cest a polí, náspy, okraje lesů. Rozpuk: břehy vod, mokřady, rákosiny.',
      'kubat-2002',
    ),
    identification: ident(
      {
        cely: 'Bolehlav: bylina 0,5–2 m, celá lysá, po rozemnutí páchne „myšinou“.',
        vetev: 'Lodyha dutá, rýhovaná, sivě ojíněná, dole s nachovými skvrnami.',
        list: 'Dvakrát až třikrát zpeřené listy podobné petrželi.',
        kvet: 'Drobné bílé květy ve složených okolících.',
      },
      [
        {
          name: 'Kerblík, bršlice a další bíle kvetoucí miříkovité',
          danger:
            'Rozeznat jedovaté a nejedovaté miříkovité rostliny vyžaduje zkušenost. Pro papouška je nesbírejte vůbec.',
        },
        {
          name: 'Řebříček',
          slug: 'rebricek',
          danger:
            'Řebříček nemá okolíky, ale ploché chocholíky drobných úborů a jemně dělené aromatické listy. Bez jistoty nesbírat.',
        },
      ],
    ),
    refusal:
      'Bolehlav a rozpuk patří mezi nejjedovatější rostliny naší přírody. Bílé okolíky papouškovi nesbírejte vůbec.',
    sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984', 'kubat-2002'],
    related: ['rebricek', 'hermanek'],
    visual: { kind: 'herb', color: '#5D7A3A' },
    seo: {
      title: 'Bolehlav a bílé okolíky: nesbírat! | LES.cz',
      description:
        'Bolehlav plamatý a rozpuk jízlivý patří mezi nejjedovatější rostliny ČR. Proč pro papouška nesbírat žádné bílé okolíky.',
    },
  }),

  risky({
    slug: 'kunsky-kastan',
    name: 'Kaštan koňský (jírovec)',
    synonyms: ['koňský kaštan', 'jírovec maďal', 'kaštany z parku'],
    latin: 'Aesculus hippocastanum L.',
    family: 'Sapindaceae – mýdelníkovité',
    tagline: 'Leštěné hnědé kuličky. Na hraní dětem, ne do zobáku.',
    months: [9, 10],
    safety: {
      summary:
        'Semena, slupky, kůra i listy obsahují saponiny a glykosidy. U zvířat jsou popsány otravy.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984'],
    },
    parts: b('Semena (kaštany), nezralé plody, kůra, listy a pupeny.', 'frohne-pfander-2005'),
    toxins: b('Triterpenové saponiny (escin) a kumarinový glykosid eskulin.', 'frohne-pfander-2005'),
    risks: list('B', ['Zažívací potíže, u zvířat jsou popisovány i nervové příznaky.'], 'cooper-johnson-1984'),
    habitat: b(
      'Nepůvodní strom vysazovaný v alejích, parcích, zámeckých zahradách a na okrajích lesů.',
      'kubat-2002',
    ),
    identification: ident(
      {
        cely: 'Mohutný strom se širokou korunou.',
        list: 'Dlanitě složené listy z 5–7 velkých obvejčitých lístků.',
        vetev: 'Velké lepkavé hnědé pupeny.',
        kvet: 'Bílé (u kříženců i růžové) květy ve vzpřímených „svícnech“, květen.',
        plod: 'Tobolka s řídkými tlustými ostny; uvnitř 1–3 lesklá hnědá semena s velkou světlou skvrnou.',
      },
      [
        {
          name: 'Kaštany jedlé',
          slug: 'jedle-kastany',
          danger:
            'Kaštanovník jedlý má obal hustě porostlý jemnými jehlicovitými ostny (jako ježek), plody jsou zploštělé se špičkou a strom má jednoduché pilovité listy. Kaštany z parku jsou téměř vždy koňské.',
        },
      ],
    ),
    refusal: 'Koňský kaštan není jedlý kaštan. Na hraní pro děti dobrý, do zobáku ne.',
    sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984', 'kubat-2002'],
    related: ['jedle-kastany', 'zaludy'],
    visual: { kind: 'nut', color: '#6B3A1F' },
    seo: {
      title: 'Může papoušek kaštany? Koňské ne | LES.cz',
      description:
        'Koňské kaštany z parku obsahují saponiny a pro papoušky nejsou. Jak je odlišit od jedlých kaštanů podle obalu a listů.',
    },
  }),

  risky({
    slug: 'akat',
    name: 'Akát',
    synonyms: ['trnovník akát', 'robinie', 'akátové větve'],
    latin: 'Robinia pseudoacacia L.',
    family: 'Fabaceae – bobovité',
    tagline: 'Nejrozšířenější „falešná akácie“ v Česku. Větve bohužel nejsou na okus.',
    months: ALL_YEAR,
    safety: {
      summary:
        'Kůra, semena a listy obsahují lektiny a další toxické látky; u zvířat (zejména koní) jsou popsány otravy po okusu kůry.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984'],
    },
    parts: b('Kůra, semena (lusky) a listy; nejnebezpečnější je kůra.', 'frohne-pfander-2005', 'cooper-johnson-1984'),
    toxins: b('Lektiny (robin) a glykosid robitin.', 'frohne-pfander-2005'),
    risks: list('C', ['Zažívací potíže a slabost; větve k okusování proto nedávejte.']),
    habitat: b(
      'Nepůvodní invazní dřevina, velmi hojná v teplejších oblastech – lesíky, meze, náspy, stráně, okraje lesů.',
      'kubat-2002',
    ),
    identification: ident(
      {
        cely: 'Strom 10–25 m s řídkou korunou, často s výmladky.',
        list: 'Lichozpeřené listy s 9–19 eliptickými celokrajnými lístky.',
        kura: 'Šedohnědá, hluboce podélně rozbrázděná.',
        vetev: 'Na větvičkách párové trny (přeměněné palisty).',
        kvet: 'Bílé vonné květy v převislých hroznech, květen–červen.',
        plod: 'Ploché hnědé lusky, často visí na stromě přes zimu.',
      },
      [
        {
          name: 'Jasan',
          slug: 'jasan',
          danger:
            'Jasan má listy vstřícné s pilovitými lístky a černé pupeny a nemá trny. Akát má listy střídavé s celokrajnými lístky a párové trny.',
        },
        {
          name: 'Jeřáb',
          slug: 'jerabiny',
          danger: 'Jeřáb má pilovité lístky a nemá trny.',
        },
      ],
    ),
    refusal: 'Akátové větve do klece nepatří – kůra je toxická. V lese je akátu hodně, o to víc pozor.',
    sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984', 'kubat-2002'],
    related: ['jasan', 'vetvicky', 'kura'],
    visual: { kind: 'branch', color: '#6A5A44' },
    seo: {
      title: 'Akát a papoušci: proč ne akátové větve | LES.cz',
      description:
        'Akát je v Česku všude, ale jeho kůra, listy a semena jsou toxické. Jak akát poznat a nezaměnit ho s jasanem při sběru větví.',
    },
  }),

  risky({
    slug: 'stremcha-a-pecky',
    name: 'Střemcha, třešně, švestky a pecky',
    synonyms: ['střemcha', 'třešeň', 'višeň', 'švestka', 'slivoň', 'bobkovišeň', 'pecky', 'meruňkové pecky', 'třešňové větve'],
    latin: 'Prunus padus L., P. avium (L.) L., P. cerasus L., P. domestica L., P. laurocerasus L. a další',
    family: 'Rosaceae – růžovité',
    tagline: 'Peckoviny: pecky, větve a listy rozhodně ne.',
    months: [5, 6, 7, 8],
    safety: {
      summary:
        'Semena (jádra pecek), listy – zejména zavadlé –, kůra a větve slivoní obsahují kyanogenní glykosidy. Větve slivoní proto nepatří mezi materiály k okusování.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984'],
    },
    parts: b(
      'Jádra pecek, listy (nejvíce zavadlé), kůra, větve a pupeny. U bobkovišně všechny zelené části.',
      'frohne-pfander-2005',
    ),
    toxins: b(
      'Kyanogenní glykosidy (amygdalin, prunasin) – při poškození pletiv uvolňují kyanovodík.',
      'frohne-pfander-2005',
    ),
    risks: list('C', [
      'Rozkousaná pecka nebo okusovaná kůra může uvolnit kyanovodík. Malí papoušci jsou ohroženi víc.',
      'Dužnina zralých třešní a švestek bez pecky je jiná kapitola – o té rozhodněte s veterinářem. Tato karta se týká pecek, větví a listů.',
    ]),
    preparation: c('Vypeckování řeší jen dužninu. Větve a listy slivoní žádná úprava bezpečnými neudělá.'),
    habitat: b(
      'Střemcha: lužní lesy, břehy potoků, vlhké okraje lesů. Třešeň ptačí: listnaté lesy a jejich okraje. Švestky a višně: sady, aleje, zahrady. Bobkovišeň: zahrady a parky.',
      'kubat-2002',
    ),
    identification: ident(
      {
        cely: 'Stromy a keře s peckovicemi.',
        list: 'Střemcha: eliptické jemně pilovité listy, na řapíku drobné žlázky.',
        kura: 'Střemcha: tmavá kůra, po poškrábání s nepříjemnou hořkomandlovou vůní.',
        kvet: 'Střemcha: bílé vonné květy v převislých hroznech, duben–květen.',
        plod: 'Střemcha: černé lesklé hořké peckovice v hroznech, červenec.',
      },
      [
        {
          name: 'Jabloň a hrušeň',
          slug: 'jablon',
          danger:
            'Větve jabloní a hrušní se v literatuře uvádějí jako vhodné, větve slivoní (třešeň, švestka, střemcha) ne. Před řezáním si strom bezpečně určete.',
        },
        {
          name: 'Borůvky',
          slug: 'boruvky',
          danger: 'Černé plody střemchy visí v hroznech na stromě; borůvky rostou jednotlivě na nízkém keříčku.',
        },
      ],
    ),
    refusal: 'Pecky, větve a listy peckovin obsahují kyanogenní glykosidy. Do lesního košíku nepatří.',
    sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984', 'kubat-2002'],
    related: ['jablon', 'hrusen', 'vetvicky'],
    visual: { kind: 'branch', color: '#3B2230' },
    seo: {
      title: 'Pecky a větve třešní pro papouška? Ne | LES.cz',
      description:
        'Pecky, větve a listy třešní, švestek a střemchy obsahují kyanogenní glykosidy. Proč je nedávat papouškovi k okusování.',
    },
  }),

  risky({
    slug: 'cesnek-medvedi',
    name: 'Česnek medvědí',
    synonyms: ['medvědí česnek', 'divoký česnek', 'cibule', 'česnek'],
    latin: 'Allium ursinum L.',
    family: 'Amaryllidaceae – amarylkovité',
    tagline: 'Jarní hit lidských jídelníčků. Pro papoušky výprodej bez nákupu.',
    months: [3, 4, 5],
    safety: {
      summary:
        'Česneky (rod Allium) obsahují sirné látky, které u řady zvířat poškozují červené krvinky. V krmení papoušků se česnek a cibule obecně nedoporučují. Navíc hrozí smrtelně nebezpečná záměna s konvalinkou a ocúnem.',
      provenance: 'C',
      sourceIds: ['cooper-johnson-1984'],
    },
    parts: c('Všechny části – listy, cibulky i květy.'),
    toxins: b(
      'Organické sirné sloučeniny typické pro česneky a cibule – u savců způsobují oxidační poškození červených krvinek (anémii).',
      'cooper-johnson-1984',
    ),
    risks: list('C', [
      'Možné poškození červených krvinek; údaje pro papoušky chybějí.',
      'Hlavní riziko je záměna se smrtelně jedovatou konvalinkou nebo ocúnem.',
    ]),
    habitat: b('Vlhké listnaté a lužní lesy, humózní půdy, často souvislé porosty.', 'kubat-2002'),
    identification: ident(
      {
        cely: 'Vytrvalá bylina 15–40 cm s cibulkou.',
        list: 'Eliptické listy vyrůstají jednotlivě, každý na vlastním řapíku; po rozemnutí silně voní česnekem.',
        kvet: 'Bílé hvězdicovité květy v polokulovitém okolíku, duben–květen.',
      },
      [
        {
          name: 'Konvalinka',
          slug: 'konvalinka',
          danger: 'Konvalinka má 2–3 listy vyrůstající společně a objímající se, bez česnekové vůně. Prudce jedovatá.',
        },
        {
          name: 'Ocún jesenní',
          slug: 'ocun-jesenni',
          danger: 'Ocún má na jaře listy v trsu bez řapíků, uprostřed s tobolkou. Prudce jedovatý.',
        },
      ],
    ),
    refusal:
      'Medvědí česnek si nechte do pesta pro sebe. Papouškovi česneky nedáváme – a záměna s konvalinkou nebo ocúnem může být smrtelná.',
    sourceIds: ['cooper-johnson-1984', 'kubat-2002'],
    related: ['konvalinka', 'ocun-jesenni'],
    visual: { kind: 'leaf', color: '#3F7D3A' },
    seo: {
      title: 'Medvědí česnek a papoušci: proč ne | LES.cz',
      description:
        'Medvědí česnek papouškům nepatří a jeho záměna s konvalinkou nebo ocúnem je nebezpečná i pro lidi. Jak je od sebe odlišit.',
    },
  }),

  risky({
    slug: 'ocun-jesenni',
    name: 'Ocún jesenní',
    synonyms: ['ocún', 'naháč'],
    latin: 'Colchicum autumnale L.',
    family: 'Colchicaceae – ocúnovité',
    tagline: 'Na podzim kvete bez listů, na jaře má listy bez květů. Zmatek, který zabíjí.',
    months: [3, 4, 5, 8, 9, 10],
    safety: {
      summary:
        'Celá rostlina obsahuje kolchicin, jeden z nejnebezpečnějších rostlinných jedů. Jedovatý zůstává i v senu.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984'],
    },
    parts: b('Všechny části, nejvíce semena a hlíza.', 'frohne-pfander-2005'),
    toxins: b('Alkaloid kolchicin – blokuje dělení buněk.', 'frohne-pfander-2005'),
    preparation: b('Sušením se kolchicin nerozkládá – ocún v senu zůstává jedovatý.', 'cooper-johnson-1984'),
    risks: list(
      'B',
      ['Otrava se projevuje se zpožděním – průjem, později selhání orgánů (údaje u lidí a savců).'],
      'frohne-pfander-2005',
    ),
    habitat: b('Vlhké louky, pastviny a lesní okraje, hlavně v teplejších oblastech.', 'kubat-2002'),
    identification: ident(
      {
        cely: 'Vytrvalá bylina s podzemní hlízou.',
        kvet: 'Světle fialové „šafránové“ květy vyrůstají přímo ze země bez listů, srpen–říjen.',
        list: 'Na jaře široce kopinaté lesklé listy v trsu bez řapíků, uprostřed s nafouklou tobolkou.',
      },
      [
        {
          name: 'Česnek medvědí',
          slug: 'cesnek-medvedi',
          danger: 'Jarní listy ocúnu si lze splést s medvědím česnekem. Ocún nevoní česnekem a nemá řapíky.',
        },
        {
          name: 'Šafrán (krokus)',
          latin: 'Crocus spp.',
          danger: 'Krokus kvete hlavně na jaře a má úzké listy s bílým proužkem. Ocún kvete na podzim bez listů.',
        },
      ],
    ),
    refusal: 'Ocún jesenní obsahuje kolchicin. Neprodáváme ho ani v senu.',
    sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984', 'kubat-2002'],
    related: ['seno-a-sucha-trava', 'cesnek-medvedi', 'konvalinka'],
    visual: { kind: 'flower', color: '#B88CC4' },
    seo: {
      title: 'Ocún jesenní: jed v louce i v senu | LES.cz',
      description:
        'Ocún jesenní obsahuje kolchicin a zůstává jedovatý i usušený v senu. Jak ho poznat na podzim i na jaře.',
    },
  }),

  risky({
    slug: 'zaludy',
    name: 'Žaludy',
    synonyms: ['žalud', 'dubové plody'],
    latin: 'Quercus robur L., Q. petraea (Matt.) Liebl. a další duby',
    family: 'Fagaceae – bukovité',
    tagline: 'Klasika podzimní kolekce veverek. Pro papoušky zatím jen „na objednávku u veterináře“.',
    months: [9, 10, 11],
    level: 'neovereno',
    safety: {
      summary:
        'Žaludy obsahují velké množství tříslovin; otravy žaludy jsou dobře popsané u skotu a koní. Pro papoušky jsou údaje rozporné – někteří chovatelé louhované žaludy podávají, spolehlivé podklady ale chybějí. Bez konzultace s veterinářem nepodávat.',
      provenance: 'C',
      sourceIds: ['cooper-johnson-1984'],
    },
    shop: {
      availability: 'POZASTAVENO – ČEKÁ NA ODBORNÝ POSUDEK',
      badge: 'Neověřeno',
      buyMessage:
        'Objednávka pozastavena. U žaludů nemá lesní skladník jasno: odborné podklady pro papoušky jsou rozporné. Než je podáte, poraďte se s veterinářem. Větve dubu najdete na samostatné kartě.',
    },
    parts: b('Žaludy (semena) a mladé listy; nejvíce tříslovin mají zelené nezralé žaludy.', 'cooper-johnson-1984'),
    toxins: b(
      'Třísloviny (galotaniny) – u přežvýkavců a koní poškozují trávicí trakt a ledviny.',
      'cooper-johnson-1984',
    ),
    benefits: c(
      'Pro papouška nejasný. Žaludy jsou bohaté na škrob, ale bezpečné množství ani vliv tříslovin na papoušky nejsou spolehlivě popsány.',
    ),
    serving: c('Do odborné kontroly nepodávat.'),
    preparation: c(
      'Louhování (opakované máčení ve vodě) obsah tříslovin snižuje, ale bezpečnost pro papoušky tím ověřena není.',
    ),
    risks: list('C', [
      'Zažívací potíže, poškození ledvin (popsáno u hospodářských zvířat).',
      'Plesnivé žaludy – riziko mykotoxinů.',
    ]),
    collecting: c('Do odborné kontroly nesbírat pro krmení. Větve dubu jsou samostatný produkt – viz karta Dub.'),
    whenToCollect: c('Zatím nesbírat. Žaludy padají v září až listopadu.'),
    speciesNote:
      'Spolehlivé údaje pro jednotlivé druhy papoušků chybějí. Do odborné kontroly platí pro všechny skupiny: nepodávat.',
    habitat: b('Listnaté a smíšené lesy, doubravy, parky a aleje.', 'kubat-2002'),
    identification: ident(
      {
        list: 'Laločnaté listy; dub letní má listy téměř bez řapíku, dub zimní na zřetelném řapíku.',
        plod: 'Žalud v miskovité čepičce; dub letní má žaludy na dlouhé stopce, dub zimní přisedlé.',
      },
      [
        {
          name: 'Bukvice',
          slug: 'bukvice',
          danger: 'Bukvice jsou trojhranné oříšky v ostnité číšce.',
        },
        {
          name: 'Koňské kaštany',
          slug: 'kunsky-kastan',
          danger: 'Koňské kaštany jsou lesklé, kulaté a rostou v ostnité tobolce – jsou jedovaté.',
        },
      ],
    ),
    refusal: '',
    sourceIds: ['cooper-johnson-1984', 'kubat-2002'],
    related: ['dub', 'bukvice', 'kunsky-kastan'],
    visual: { kind: 'nut', color: '#8A6A3B' },
    seo: {
      title: 'Může papoušek žaludy? Zatím spíš ne | LES.cz',
      description:
        'Žaludy obsahují třísloviny a údaje pro papoušky jsou rozporné. Proč je zatím nepodávat bez konzultace s veterinářem.',
    },
  }),

  risky({
    slug: 'hasivka-orlici',
    name: 'Hasivka orličí a kapradiny',
    synonyms: ['hasivka', 'kapradí', 'kapraď', 'kapradiny'],
    latin: 'Pteridium aquilinum (L.) Kuhn; Dryopteris filix-mas (L.) Schott a další',
    family: 'Dennstaedtiaceae – hasivkovité (a další kapradiny)',
    tagline: 'Prehistorický design, moderní problémy.',
    months: [5, 6, 7, 8, 9, 10],
    safety: {
      summary:
        'Hasivka obsahuje karcinogenní ptaquilosid a enzym thiaminázu; otravy jsou dobře popsané u skotu a koní. Ani ostatní kapradiny nejsou vhodné.',
      provenance: 'B',
      sourceIds: ['cooper-johnson-1984', 'frohne-pfander-2005'],
    },
    parts: b('Celá rostlina, zejména mladé rašící listy a oddenek.', 'cooper-johnson-1984'),
    toxins: b(
      'Ptaquilosid (karcinogen) a thiamináza, která rozkládá vitamin B1. Kapraď samec: floroglucinoly.',
      'frohne-pfander-2005',
      'cooper-johnson-1984',
    ),
    risks: list('C', [
      'Dlouhodobé poškození (nedostatek vitaminu B1, nádorová onemocnění) popsané u savců; údaje pro ptáky chybějí.',
    ]),
    collecting: c(
      'Nesbírat. Kapradiny nepoužívejte do klece ani jako dekoraci nebo podestýlku.',
    ),
    habitat: b('Paseky, světlé lesy, vřesoviště, kyselé půdy; často rozsáhlé porosty.', 'kubat-2002'),
    identification: ident(
      {
        cely: 'Statná kapradina 0,5–2 m; listy vyrůstají jednotlivě z podzemního oddenku.',
        list: 'Trojúhelníkovitá čepel dvakrát až třikrát zpeřená, tuhá.',
      },
      [
        {
          name: 'Ostatní kapradiny',
          danger: 'Do klece nepatří žádné kapradiny – ani jako dekorace nebo podestýlka.',
        },
      ],
    ),
    refusal: 'Kapradiny jsou krásné na fotkách z lesa. V kleci nemají co dělat.',
    sourceIds: ['cooper-johnson-1984', 'frohne-pfander-2005', 'kubat-2002'],
    related: ['suche-listi', 'seno-a-sucha-trava'],
    visual: { kind: 'leaf', color: '#4F7A34' },
    seo: {
      title: 'Kapradiny a hasivka pro papoušky? Ne | LES.cz',
      description:
        'Hasivka orličí obsahuje karcinogenní ptaquilosid a thiaminázu. Proč do klece nepatří žádné kapradiny, ani jako dekorace.',
    },
  }),

  risky({
    slug: 'pryskyrnik-a-sasanky',
    name: 'Pryskyřníky a sasanky',
    synonyms: ['pryskyřník', 'sasanka hajní', 'sasanka', 'blatouch'],
    latin: 'Ranunculus spp., Anemone nemorosa L., A. ranunculoides L.',
    family: 'Ranunculaceae – pryskyřníkovité',
    tagline: 'Jarní koberec z lesa. Fotit ano, zobat ne.',
    months: [3, 4, 5, 6, 7],
    safety: {
      summary:
        'Čerstvé rostliny uvolňují dráždivý protoanemonin. Sušením jeho obsah klesá, pro papouška ale vhodné nejsou.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984'],
    },
    parts: b('Celé čerstvé rostliny.', 'frohne-pfander-2005'),
    toxins: b(
      'Glykosid ranunkulin, ze kterého při poškození rostliny vzniká dráždivý protoanemonin.',
      'frohne-pfander-2005',
    ),
    preparation: b(
      'Sušením se protoanemonin mění na méně účinný anemonin, proto je seno s pryskyřníky méně nebezpečné než čerstvá píce. Papouškovi je ale přesto nepodávejte.',
      'cooper-johnson-1984',
    ),
    risks: list('C', ['Podráždění zobáku, sliznic a trávicího traktu.']),
    habitat: b(
      'Pryskyřníky: louky, pastviny, vlhká místa. Sasanka hajní: jarní koberce v listnatých lesích.',
      'kubat-2002',
    ),
    identification: ident(
      {
        kvet: 'Pryskyřník: lesklé sytě žluté pětičetné květy. Sasanka hajní: bílé květy se 6–8 okvětními lístky (březen–duben); sasanka pryskyřníkovitá: žluté.',
        list: 'Dlanitě dělené listy.',
      },
      [
        {
          name: 'Pampeliška',
          slug: 'pampeliska',
          danger:
            'Pampeliška má jeden velký úbor z mnoha jazykovitých kvítků a v lodyze bílé mléko. Pryskyřník má pět lesklých korunních lístků.',
        },
        {
          name: 'Sedmikráska',
          slug: 'sedmikraska',
          danger: 'Sedmikráska má žlutý střed a bílé paprsky (úbor) a listy v přízemní růžici.',
        },
      ],
    ),
    refusal: 'Pryskyřníky a sasanky dráždí. Jarní koberec si vyfoťte, nesbírejte.',
    sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984', 'kubat-2002'],
    related: ['pampeliska', 'sedmikraska', 'omej'],
    visual: { kind: 'flower', color: '#F2C21B' },
    seo: {
      title: 'Pryskyřník a sasanky: jedovaté jaro | LES.cz',
      description:
        'Pryskyřníky a sasanky uvolňují dráždivý protoanemonin. Jak je odlišit od pampelišky a sedmikrásky.',
    },
  }),

  risky({
    slug: 'brectan',
    name: 'Břečťan popínavý',
    synonyms: ['břečťan'],
    latin: 'Hedera helix L.',
    family: 'Araliaceae – aralkovité',
    tagline: 'Stálezelený popínavý doplněk ke stromům. Bez montáže do klece.',
    months: ALL_YEAR,
    safety: {
      summary: 'Listy i bobule obsahují saponiny. Při sběru větví a kůry je potřeba břečťan odstranit.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005'],
    },
    parts: b('Listy, bobule a stonky.', 'frohne-pfander-2005'),
    toxins: b('Triterpenové saponiny (hederasaponiny, α-hederin) – dráždí trávicí trakt.', 'frohne-pfander-2005'),
    risks: list('C', ['Zažívací potíže; údaje pro ptáky chybějí.']),
    collecting: c(
      'Nesbírat. Pokud řežete větve nebo sbíráte kůru ze stromů porostlých břečťanem, břečťan pečlivě odstraňte.',
    ),
    habitat: b('Lesy, skály, zdi, kmeny stromů, parky a zahrady.', 'kubat-2002'),
    identification: ident(
      {
        cely: 'Stálezelená liána šplhající pomocí příčepivých kořínků.',
        list: 'Kožovité lesklé listy; na plazivých výhonech 3–5laločné, na kvetoucích celistvé vejčité.',
        kvet: 'Zelenožluté květy v kulovitých okolících, září–říjen.',
        plod: 'Černé bobule dozrávají v zimě a na jaře.',
      },
      [
        {
          name: 'Kůra a větve stromů porostlých břečťanem',
          slug: 'kura',
          danger: 'Břečťan se drží kmene – kůru a větve z takových stromů před použitím důkladně očistěte.',
        },
      ],
    ),
    refusal: 'Břečťan obsahuje saponiny. Kůru ze stromů, po kterých šplhá, nejdřív pořádně očistěte.',
    sourceIds: ['frohne-pfander-2005', 'kubat-2002'],
    related: ['kura', 'vetvicky', 'jmeli'],
    visual: { kind: 'leaf', color: '#2F5A2E' },
    seo: {
      title: 'Břečťan a papoušci | LES.cz',
      description:
        'Břečťan obsahuje saponiny v listech i bobulích. Proč ho odstranit z větví a kůry, které nosíte papouškovi z lesa.',
    },
  }),

  risky({
    slug: 'jmeli',
    name: 'Jmelí bílé',
    synonyms: ['jmelí', 'vánoční jmelí'],
    latin: 'Viscum album L.',
    family: 'Santalaceae – santálovité',
    tagline: 'Vánoční dekorace se šťastnou pověstí. Smůla pro papoušky.',
    months: [11, 12, 1, 2],
    safety: {
      summary: 'Listy, stonky i bobule obsahují viskotoxiny a lektiny.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005'],
    },
    parts: b('Celá rostlina včetně bílých bobulí.', 'frohne-pfander-2005'),
    toxins: b('Viskotoxiny (bílkovinné toxiny) a lektiny.', 'frohne-pfander-2005'),
    risks: list('C', [
      'Zažívací potíže, při větším množství poruchy srdeční činnosti; údaje pro ptáky chybějí.',
      'Pozor na vánoční výzdobu v místnosti, kde papoušek létá.',
    ]),
    collecting: c(
      'Nesbírat. Větve stromů napadených jmelím (topol, lípa, jabloň, borovice) používejte jen po odstranění jmelí.',
    ),
    habitat: b(
      'Poloparazit na větvích stromů – topoly, lípy, jabloně, javory, borovice a jedle.',
      'kubat-2002',
    ),
    identification: ident(
      {
        cely: 'Stálezelené kulovité trsy v korunách stromů, nejlépe viditelné v zimě.',
        vetev: 'Žlutozelené vidličnatě větvené stonky.',
        list: 'Vstřícné kožovité podlouhlé listy.',
        plod: 'Bílé průsvitné lepkavé bobule, listopad–březen.',
      },
      [
        {
          name: 'Ptačí hnízda v korunách',
          danger: 'Zdálky podobné kulovité útvary. Při řezání větví z korun stromů vždy jmelí odstraňte.',
        },
      ],
    ),
    refusal: 'Jmelí pod stromeček, ne do klece. Viskotoxiny nejsou vánoční dárek.',
    sourceIds: ['frohne-pfander-2005', 'kubat-2002'],
    related: ['topol', 'lipa', 'jablon'],
    visual: { kind: 'berry', color: '#E9EEDF', accent: RED },
    seo: {
      title: 'Jmelí a papoušci: vánoční riziko | LES.cz',
      description:
        'Jmelí obsahuje viskotoxiny a lektiny. Proč ho nedávat do místnosti s papouškem a jak ho odstranit z nasbíraných větví.',
    },
  }),

  risky({
    slug: 'tuje',
    name: 'Túje (zeravy)',
    synonyms: ['tůje', 'thuje', 'zerav', 'živý plot', 'cypřišek'],
    latin: 'Thuja occidentalis L., T. plicata Donn ex D. Don a další',
    family: 'Cupressaceae – cypřišovité',
    tagline: 'Živý plot, který si s papouškem rozhodně nerozumí.',
    months: ALL_YEAR,
    safety: {
      summary: 'Túje obsahují silice s thujonem. Větve tújí nejsou materiál k okusování.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005'],
    },
    parts: b('Šupinovité listy, větévky a šištice.', 'frohne-pfander-2005'),
    toxins: b('Silice s vysokým podílem thujonu – působí na nervovou soustavu.', 'frohne-pfander-2005'),
    risks: list('C', [
      'Nervové příznaky, poškození jater a ledvin (údaje u savců).',
      'Podobné riziko nelze vyloučit u cypřišků a jalovců – bez ověření nepodávat.',
    ]),
    habitat: b('Nepůvodní dřeviny – živé ploty, zahrady, hřbitovy, parky.', 'kubat-2002'),
    identification: ident(
      {
        cely: 'Stálezelený keř nebo strom, často stříhaný do živého plotu.',
        list: 'Drobné šupinovité listy přitisklé ke zploštělým větévkám; po rozemnutí aromaticky až ostře voní.',
        plod: 'Drobné vejcovité šištice.',
      },
      [
        {
          name: 'Smrk a borovice',
          slug: 'smrk-a-borovice',
          danger: 'Smrk a borovice mají jehlice, túje šupinovité listy.',
        },
        {
          name: 'Tis',
          slug: 'tis-cerveny',
          danger: 'Tis má ploché jehlice ve dvou řadách – a je ještě nebezpečnější.',
        },
      ],
    ),
    refusal: 'Túje z živého plotu do klece nepatří. Thujon papouškům nepřejeme.',
    sourceIds: ['frohne-pfander-2005', 'kubat-2002'],
    related: ['tis-cerveny', 'smrk-a-borovice'],
    visual: { kind: 'branch', color: '#3C6B3A' },
    seo: {
      title: 'Túje a papoušci: živý plot ne do klece | LES.cz',
      description:
        'Túje obsahují silice s thujonem. Proč větve z živého plotu nedávat papouškovi a jak túji odlišit od smrku a tisu.',
    },
  }),

  risky({
    slug: 'zlaty-dest',
    name: 'Štědřenec odvislý (zlatý déšť)',
    synonyms: ['zlatý déšť', 'štědřenec'],
    latin: 'Laburnum anagyroides Medik.',
    family: 'Fabaceae – bobovité',
    tagline: 'Zlaté hrozny jako z reklamy. Obsah: cytisin.',
    months: [5, 6, 7, 8, 9],
    safety: {
      summary: 'Všechny části, nejvíce semena v luscích, obsahují alkaloid cytisin.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984'],
    },
    parts: b('Všechny části, zejména semena, květy a kůra.', 'frohne-pfander-2005'),
    toxins: b('Chinolizidinový alkaloid cytisin.', 'frohne-pfander-2005'),
    risks: list('B', ['Zvracení, křeče, ochrnutí dýchání (údaje u lidí a savců).'], 'frohne-pfander-2005'),
    habitat: b('Okrasný keř nebo stromek v parcích a zahradách; místy zplaňuje.', 'kubat-2002'),
    identification: ident(
      {
        cely: 'Keř nebo nízký strom 2–7 m.',
        list: 'Trojčetné listy s eliptickými lístky, na rubu přitiskle chlupaté.',
        kvet: 'Zářivě žluté květy v dlouhých převislých hroznech, květen–červen.',
        plod: 'Ploché lusky s tmavými semeny, visí na stromě dlouho do zimy.',
      },
      [
        {
          name: 'Akát',
          slug: 'akat',
          danger: 'Akát má bílé květy a zpeřené listy – a pro papoušky je také nevhodný.',
        },
      ],
    ),
    refusal: 'Zlatý déšť je zlatý jen na pohled. Semena v luscích obsahují cytisin.',
    sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984', 'kubat-2002'],
    related: ['akat'],
    visual: { kind: 'flower', color: '#F2C62F' },
    seo: {
      title: 'Zlatý déšť a papoušci | LES.cz',
      description:
        'Zlatý déšť (štědřenec) obsahuje cytisin ve všech částech, nejvíce v semenech. Jak ho poznat v parku nebo na zahradě.',
    },
  }),

  risky({
    slug: 'houby',
    name: 'Houby (všechny lesní)',
    synonyms: ['hřiby', 'muchomůrky', 'choroše', 'houby na větvích', 'žampiony'],
    latin: 'Fungi',
    family: 'Houby (Fungi) – samostatná říše, nejsou to rostliny',
    tagline: 'Lesní delikatesa pro lidi. Pro papoušky celé oddělení zavřeno.',
    months: [6, 7, 8, 9, 10, 11],
    safety: {
      summary:
        'Lesní houby papouškům nedáváme. Mnohé jsou smrtelně jedovaté, spolehlivě je rozeznat je obtížné a citlivost ptáků na houbové toxiny není dobře popsána.',
      provenance: 'C',
    },
    parts: c('Celé plodnice; také dřevokazné houby (choroše) a povlaky hub na větvích a kůře.'),
    toxins: c(
      'Podle druhu například amatoxiny (muchomůrka zelená), muskarin nebo orelanin – některé způsobují pozdní selhání jater a ledvin.',
    ),
    benefits: c('Žádný, který by vyvážil riziko.'),
    serving: c('Nepodávat.'),
    preparation: c('Vaření ani sušení jedovaté houby bezpečnými nečiní.'),
    risks: list('C', [
      'Smrtelné otravy (u lidí) způsobují zejména muchomůrky; příznaky se mohou objevit až po mnoha hodinách.',
      'Větve a kůra s plodnicemi hub nebo s plísní nejsou vhodné k okusování.',
    ]),
    habitat: c('Všude v lese, na loukách, na kmenech i na větvích.'),
    whenToCollect: c('Nikdy pro papouška. Hlavní houbová sezóna je od léta do podzimu.'),
    identification: {
      parts: {
        cely: 'Plodnice hub – klobouky na třeni, choroše na kmenech, povlaky na dřevě.',
      },
      lookalikes: [
        {
          name: 'Kůra a větve',
          slug: 'kura',
          danger: 'Kůru nebo větve s plodnicí houby nebo jejím povlakem nepoužívejte.',
        },
      ],
      provenance: 'C',
    },
    refusal: 'Houby papouškům nevydáváme – žádné, ani ty „jisté“. Lesní houbaření nechte lidem.',
    sourceIds: [],
    related: ['plisne', 'kura', 'vetvicky'],
    visual: { kind: 'warning', color: '#A0522D' },
    seo: {
      title: 'Může papoušek houby? Ne | LES.cz',
      description:
        'Lesní houby papouškům nepatří – mnohé jsou smrtelně jedovaté a rozeznat je je těžké. Pozor i na choroše na větvích.',
    },
  }),

  risky({
    slug: 'plisne',
    name: 'Plíseň (cokoli plesnivého)',
    synonyms: ['plíseň', 'aflatoxin', 'aflatoxiny', 'aspergilóza', 'zatuchlé seno', 'plesnivé ořechy', 'mykotoxiny'],
    latin: 'Aspergillus spp., Penicillium spp. a další plísně',
    family: 'Mikroskopické houby (plísně)',
    tagline: 'Jediné zboží, kterého má les vždycky až moc.',
    months: ALL_YEAR,
    safety: {
      summary:
        'Plesnivé krmivo a materiály patří mezi nejzávažnější rizika v chovu papoušků – mykotoxiny (např. aflatoxiny) poškozují játra a spory plísní rodu Aspergillus vyvolávají aspergilózu.',
      provenance: 'B',
      sourceIds: ['harrison-lightfoot-2006', 'ritchie-1994'],
    },
    parts: b(
      'Plesnivé ořechy, semena, ovoce, seno, listí, kůra, šišky a větve; také zatuchlé krmivo skladované ve vlhku.',
      'harrison-lightfoot-2006',
    ),
    toxins: a(
      'Aflatoxiny a další mykotoxiny. V systémovém promptu AI poradce ExoMixu (lib/ai/prompts.ts) jsou aflatoxiny výslovně uvedeny mezi bezpečnostními limity: „Dodržuj bezpečnostní limity (aflatoxiny, oxaláty, Ca:P)“.',
    ),
    exomix: [
      'AI poradce ExoMixu má aflatoxiny mezi bezpečnostními limity (lib/ai/prompts.ts: „Dodržuj bezpečnostní limity (aflatoxiny, oxaláty, Ca:P)“).',
    ],
    risks: list(
      'B',
      [
        'Aspergilóza – závažné onemocnění dýchacích cest papoušků.',
        'Poškození jater mykotoxiny (aflatoxiny).',
      ],
      'harrison-lightfoot-2006',
      'ritchie-1994',
    ),
    preparation: c(
      'Plíseň se nedá omýt, odkrojit ani vypéct. Co je plesnivé, patří do kompostu nebo do odpadu – celé, ne jen viditelná skvrna.',
    ),
    collecting: c(
      'Nesbírejte vlhké, zatuchlé ani plesnivé materiály. Nasbírané přírodniny skladujte suché a vzdušné a pravidelně je kontrolujte.',
    ),
    habitat: c('Všude, kde je vlhko a teplo – v lese, ve skladu, v krmítku i ve vlhké podestýlce.'),
    whenToCollect: c('Nikdy. Riziko je celoroční, nejvyšší za vlhkého a teplého počasí.'),
    speciesNote: 'Riziko plísní a mykotoxinů se týká všech papoušků.',
    identification: {
      parts: {
        cely: 'Bílé, šedé, zelené, modrozelené, černé nebo žluté povlaky, chomáčky a skvrny; zatuchlý zápach; slepené hrudky ve zrní.',
        plod: 'Na klasech trav a obilí: černofialové rohovité útvary místo zrn (námel) – takové klasy nesbírejte.',
      },
      lookalikes: [
        {
          name: 'Seno a suchá tráva',
          slug: 'seno-a-sucha-trava',
          danger: 'Seno používejte jen suché, voňavé a bez prachu.',
        },
        {
          name: 'Klasy trav',
          slug: 'klasy-trav',
          danger: 'Klasy s černými rohovitými útvary (námel) nesbírejte.',
        },
        {
          name: 'Lískové oříšky',
          slug: 'liskove-orisky',
          danger: 'Ořechy podávejte jen zdravé a čerstvé, bez plísně a zatuchlého zápachu.',
        },
      ],
      provenance: 'C',
    },
    refusal:
      'Plíseň neprodáváme, i když jí má les vždycky plný sklad. Plesnivé krmivo a přírodniny vyhoďte – celé.',
    sourceIds: ['harrison-lightfoot-2006', 'ritchie-1994', 'exomix'],
    related: ['seno-a-sucha-trava', 'liskove-orisky', 'klasy-trav'],
    visual: { kind: 'warning', color: '#5E7A6A' },
    seo: {
      title: 'Plíseň a aflatoxiny: riziko pro papoušky | LES.cz',
      description:
        'Plesnivé krmivo, seno nebo ořechy patří mezi největší rizika v chovu papoušků – aflatoxiny a aspergilóza. Jak plíseň poznat.',
    },
  }),

  risky({
    slug: 'rododendron',
    name: 'Rododendrony a azalky',
    synonyms: ['rododendron', 'azalka', 'pěnišník', 'rojovník'],
    latin: 'Rhododendron spp.',
    family: 'Ericaceae – vřesovcovité',
    tagline: 'Zahradní luxus v květináči. Do voliéry ani lístek.',
    months: ALL_YEAR,
    safety: {
      summary:
        'Listy, květy i nektar obsahují grayanotoxiny. Rododendrony patří mezi rostliny běžně uváděné jako jedovaté pro ptáky.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005', 'harrison-lightfoot-2006'],
    },
    parts: b('Listy, květy, nektar a mladé výhony.', 'frohne-pfander-2005'),
    toxins: b('Grayanotoxiny (diterpeny) – působí na nervovou soustavu a srdce.', 'frohne-pfander-2005'),
    risks: list('C', ['Vyvrhování potravy, slabost, poruchy srdečního rytmu.']),
    habitat: b(
      'Okrasné keře v zahradách, parcích a v květináčích. V přírodě ČR roste příbuzný rojovník bahenní (Rhododendron tomentosum) na rašeliništích – také jedovatý.',
      'kubat-2002',
    ),
    identification: ident(
      {
        cely: 'Stálezelené nebo opadavé keře.',
        list: 'Kožovité, celokrajné, eliptické listy, v mrazu se svinují.',
        kvet: 'Velké nálevkovité květy v bohatých okolících, duben–červen.',
      },
      [
        {
          name: 'Brusinky',
          slug: 'brusinky',
          danger:
            'Brusinka je drobný keříček se stejně kožovitými listy ze stejné čeledi; má červené bobule. Rododendron je velký keř bez bobulí.',
        },
      ],
    ),
    refusal:
      'Rododendron i azalka obsahují grayanotoxiny. Květináč z obýváku odneste tam, kam papoušek nedoletí.',
    sourceIds: ['frohne-pfander-2005', 'harrison-lightfoot-2006', 'kubat-2002'],
    related: ['brusinky', 'tis-cerveny', 'avokado'],
    visual: { kind: 'flower', color: '#C9467E' },
    seo: {
      title: 'Rododendron a azalka: jedovaté pro ptáky | LES.cz',
      description:
        'Rododendrony a azalky obsahují grayanotoxiny v listech, květech i nektaru. Proč nepatří do místnosti s papouškem.',
    },
  }),
];
