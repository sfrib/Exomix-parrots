import type { Product, Sourced, SpeciesSuitability } from '@/lib/types';
import { b, c, DRAFT, list } from '../helpers';

/**
 * B. VĚTVE A STROMY
 *
 * Seznamy „bezpečných dřevin“ pro papoušky vycházejí převážně z chovatelské praxe,
 * nikoli z kontrolovaných studií. Proto je většina tvrzení o vhodnosti označena C
 * (nutno ověřit) a čeká na odbornou kontrolu veterinářem.
 */

const ALL_YEAR = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** Společná příprava větví před podáním. */
const PREP_BRANCH: Sourced = c(
  'Větve důkladně omyjte horkou vodou a kartáčem. Odstraňte části s houbou, plísní, lišejníkem, hmyzem nebo trusem ptáků. V chovatelské praxi se běžně doporučuje větve navíc spařit horkou vodou nebo krátce vysušit při nízké teplotě v troubě a nechat vychladnout – účinnost a vhodné teploty je potřeba ověřit.',
);

/** Společné pravidlo sběru živých větví. */
const collectLive = (extra: string): Sourced =>
  b(
    `Živé větve řežte jen se souhlasem vlastníka stromu – lesní zákon zakazuje v lese poškozovat stromy (§ 20); volně smíte pro vlastní potřebu sbírat jen suchou klest ležící na zemi (§ 19). ${extra}${extra ? ' ' : ''}Vyhněte se stromům u silnic, v ošetřovaných parcích a sadech, kde se stříká.`,
    'zakon-lesni',
  );

/** Nutriční charakteristika dřeva – bez vymyšlených čísel. */
const woodNutrition = (extra: string) => ({
  summary: c(
    `Dřevo a kůra jsou z výživového hlediska hlavně nestravitelná vláknina (celulóza, lignin); papoušek je spíše rozkouše, než aby je jedl. Hlavní přínos je zaměstnání a obrušování zobáku, ne živiny. ${extra}`.trim(),
  ),
});

const BENEFITS_BRANCH: Sourced = c(
  'Okusování a loupání kůry zaměstná papouška, podporuje přirozené obrušování zobáku a hledání potravy (foraging). Větve různé tloušťky slouží jako přirozená bidýlka, která procvičují nohy lépe než hladká bidla stejného průměru.',
  'harrison-lightfoot-2006',
);

const speciesBranch = (poznamka?: string): SpeciesSuitability => ({
  mali: 'Tenké větvičky a pruty (průměr přibližně jako prst), listy a pupeny k okusování.',
  stredni: 'Větve střední tloušťky jako bidýlka i k loupání kůry.',
  velci: 'Silnější větve; velcí papoušci (ara, kakadu, amazoňan) je zničí rychle – počítejte s častou výměnou.',
  poznamka:
    poznamka ??
    'Doporučené tloušťky jsou orientační. Vhodnost dřeviny vychází z chovatelské praxe a čeká na odbornou kontrolu.',
  provenance: 'C',
});

const RISKS_COMMON = [
  'Postřiky, hnojiva a posypová sůl – větve z neznámého nebo ošetřovaného stromu nepoužívejte.',
  'Plísně, houby a lišejníky – napadené části odstraňte.',
  'Parazité a trus divokých ptáků na kůře – vždy omýt.',
  'Polknutí velkých třísek – sledujte, zda papoušek dřevo jen kouše, nebo i polyká.',
];

export const BRANCHES: Product[] = [
  {
    slug: 'briza',
    name: 'Bříza',
    synonyms: ['bříza bělokorá', 'bříza bradavičnatá', 'bříza pýřitá', 'březové větve'],
    latin: 'Betula pendula Roth, Betula pubescens Ehrh.',
    family: 'Betulaceae – břízovité',
    category: 'vetve-a-stromy',
    tagline: 'Bílá klasika. Kůra se loupe sama – papoušek ji jen dokončí.',
    months: ALL_YEAR,
    shop: {
      price: 'ZDARMA*',
      availability: 'SKLADEM CELÝ ROK',
      warehouse: 'Příroda, oddělení světlých lesů a pasek',
      shipping: 'Vlastní nohy + zahradnické nůžky',
      badge: 'Bestseller',
      buyMessage:
        'Objednávka přijata! Vaše březové větve visí ve skladu přímo na stromě. *Živé větve si smíte vzít jen se souhlasem majitele stromu – kurýr je totiž strom a nikam nejede.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Bříza patří v chovatelské praxi k nejčastěji používaným dřevinám k okusování. Odborné studie přímo na papoušcích chybí – údaj je převzat z praxe a čeká na ověření.',
      provenance: 'C',
    },
    parts: c('Tenké větvičky, kůra, pupeny a mladé listy. Silnější větve jako bidýlka.'),
    nutrition: woodNutrition('Pupeny a mladé listy obsahují víc vody a bílkovin než dřevo, přesné hodnoty pro tuto rostlinu nemáme.'),
    benefits: BENEFITS_BRANCH,
    species: speciesBranch(),
    serving: c('Celé větve upevněte do klece nebo voliéry jako bidýlka či k okusování. Okousané a zašpiněné větve průběžně měňte.'),
    preparation: PREP_BRANCH,
    risks: list('C', [
      ...RISKS_COMMON,
      'Na jaře (březen–duben) bříza silně „krvácí“ mízou – řez v tomto období strom oslabuje.',
    ]),
    collecting: collectLive('Na jaře v době proudění mízy břízy neřežte.'),
    habitat: b('Světlé lesy, paseky, okraje lesů, rašeliniště (bříza pýřitá), náletové plochy; od nížin po hory.', 'kubat-2002'),
    whenToCollect: c(
      'Celoročně; nejvhodnější je období vegetačního klidu (listopad–únor). Mladé lístky a pupeny na jaře, ještě před olistěním.',
    ),
    identification: {
      parts: {
        cely: 'Strom do 25–30 m se štíhlou korunou; bříza bradavičnatá má výrazně převislé konce větví.',
        list: 'Střídavý, trojúhelníkovitě kosočtverečný (b. bradavičnatá) nebo vejčitý (b. pýřitá), dvojitě pilovitý, 3–7 cm.',
        kura: 'Bílá, odlupuje se v tenkých papírovitých pruzích; u báze starých kmenů černá a hluboce rozbrázděná.',
        vetev: 'Tenké tmavě hnědé větévky, u b. bradavičnaté s drobnými bradavičnatými žlázkami, u b. pýřité pýřité.',
        kvet: 'Jehnědy; samčí převislé, žlutohnědé, samičí menší vzpřímené. Kvete v dubnu spolu s rašením listů.',
        plod: 'Drobné křídlaté nažky ve válcovitých plodenstvích („šištičkách“), která se v létě a na podzim rozpadají.',
      },
      lookalikes: [
        {
          name: 'Topol osika',
          latin: 'Populus tremula',
          slug: 'topol',
          danger: 'Mladá kůra je také světlá, ale bez papírovitého loupání; list je okrouhlý na dlouhém zploštělém řapíku. Také používaná dřevina.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['harrison-lightfoot-2006', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'bark', color: '#E9E4D8', accent: '#2F2A24' },
    photos: [],
    related: ['vrba', 'liska', 'buk', 'kura'],
    seo: {
      title: 'Může papoušek okusovat břízu? | LES.cz',
      description:
        'Březové větve pro papoušky: jak je poznat, kdy a kde je řezat, jak je připravit a na co si dát pozor. Zdarma, doprava vlastníma nohama.',
    },
  },
  {
    slug: 'vrba',
    name: 'Vrba',
    synonyms: ['vrba jíva', 'jíva', 'vrba bílá', 'vrba křehká', 'kočičky', 'proutí'],
    latin: 'Salix spp. (např. Salix caprea L., Salix alba L.)',
    family: 'Salicaceae – vrbovité',
    category: 'vetve-a-stromy',
    tagline: 'Jarní kolekce kočiček právě dorazila. Mňau.',
    months: ALL_YEAR,
    shop: {
      price: 'ZDARMA*',
      availability: 'SKLADEM CELÝ ROK, KOČIČKY BŘEZEN–DUBEN',
      warehouse: 'Příroda, oddělení potoků a mokřadů',
      shipping: 'Vlastní nohy (doporučujeme holínky)',
      badge: 'Jarní novinka',
      buyMessage:
        'Objednávka přijata! Vaše vrbové proutí čeká u nejbližšího potoka. *Živé větve řežte jen se souhlasem majitele. Kočičky nemňoukají, ale včely je mají rády – nechte jim pár i pro ně.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Vrbové větve jsou v chovatelské praxi běžně používané k okusování. Kůra obsahuje salicin (glykosid příbuzný kyselině salicylové); papoušci kůru loupou, ale ve velkém ji nepolykají. Vliv na ptáky není podrobně prozkoumán.',
      provenance: 'C',
    },
    parts: c('Větve a pruty, kůra, pupeny, jarní „kočičky“ (jehnědy), mladé listy.'),
    nutrition: woodNutrition('Kůra obsahuje salicin a třísloviny; obsah se liší podle druhu vrby a ročního období.'),
    benefits: BENEFITS_BRANCH,
    species: speciesBranch('Ohebné vrbové pruty se hodí i pro malé druhy. Množství a délka podávání kůry s ohledem na salicin nejsou ověřené.'),
    serving: c('Celé větve nebo svazky prutů; kočičky na větvičkách jako sezónní obohacení.'),
    preparation: PREP_BRANCH,
    risks: list('C', [
      ...RISKS_COMMON,
      'Salicin v kůře – u ptáků léčených léky proti bolesti nebo zánětu (NSAID) se poraďte s veterinářem.',
      'Vrby u vody bývají v blízkosti odpadních vod a polí – sbírejte jen na čistých místech.',
    ]),
    collecting: collectLive('Kočičky jsou na jaře důležitou potravou pro včely a čmeláky – trhejte jen několik větviček.'),
    habitat: b('Břehy potoků a řek, mokřady, lužní lesy, paseky a okraje lesů (jíva i na sušších místech).', 'kubat-2002'),
    whenToCollect: c('Celoročně; pruty nejlépe v době vegetačního klidu. Kočičky v březnu a dubnu.'),
    identification: {
      parts: {
        cely: 'Keře i stromy (vrba bílá až 25 m); jíva obvykle keř nebo menší strom.',
        list: 'Střídavý; u vrby bílé úzce kopinatý, na rubu stříbřitě chlupatý; u jívy široce eliptický, na rubu šedoplstnatý.',
        kura: 'Šedá až šedohnědá; u starých stromů hluboce podélně rozbrázděná.',
        vetev: 'Pružné pruty; pupeny kryté jedinou čepičkovitou šupinou – typický znak vrb.',
        kvet: 'Jehnědy („kočičky“), dvoudomé; u jívy nápadné, stříbřité, rozkvétají v březnu–dubnu před olistěním.',
        plod: 'Tobolka; semena s bílým chmýřím se uvolňují v květnu a červnu.',
      },
      lookalikes: [
        {
          name: 'Topol',
          latin: 'Populus spp.',
          slug: 'topol',
          danger: 'Pupeny mají více šupin a bývají lepkavé. Také používaná dřevina.',
        },
        {
          name: 'Krušina olšová',
          latin: 'Frangula alnus',
          slug: 'krusina-olsova',
          danger: 'Roste na podobných vlhkých místech; má celokrajné listy a černé bobule. Kůra i plody jsou projímavé až jedovaté.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['harrison-lightfoot-2006', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'branch', color: '#8A9A5B', accent: '#D9D4C7' },
    photos: [],
    related: ['briza', 'topol', 'liska', 'pupeny'],
    seo: {
      title: 'Vrba pro papoušky: proutí a kočičky | LES.cz',
      description:
        'Může papoušek okusovat vrbu? Jak poznat vrbu, kdy řezat pruty a kočičky, co je salicin a na co si dát pozor. Lesní sklad otevřen celý rok.',
    },
  },
  {
    slug: 'liska',
    name: 'Líska',
    synonyms: ['líska obecná', 'lískové větve', 'lískové jehnědy'],
    latin: 'Corylus avellana L.',
    family: 'Betulaceae – břízovité',
    category: 'vetve-a-stromy',
    tagline: 'Větve, jehnědy a na podzim i oříšky. Tři v jednom, bez příplatku.',
    months: ALL_YEAR,
    shop: {
      price: 'ZDARMA*',
      availability: 'SKLADEM CELÝ ROK, JEHNĚDY ÚNOR–BŘEZEN',
      warehouse: 'Příroda, oddělení lesních okrajů a mezí',
      shipping: 'Vlastní nohy',
      badge: 'Multifunkční',
      buyMessage:
        'Objednávka přijata! Lískové pruty čekají na okraji lesa. *Živé větve jen se souhlasem majitele. Oříšky expedujeme na podzim – pokud je dřív nevyskladní veverky.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Lískové větve a pruty jsou v chovatelské praxi běžně používané k okusování a jako bidýlka. Údaj vychází z praxe a čeká na ověření.',
      provenance: 'C',
    },
    parts: c('Pruty a větve, kůra, pupeny, samčí jehnědy na jaře, mladé listy. Oříšky jsou samostatný produkt.'),
    nutrition: woodNutrition('Jehnědy obsahují pyl; přesné nutriční hodnoty pro ně nemáme.'),
    benefits: BENEFITS_BRANCH,
    species: speciesBranch('Rovné lískové pruty se hodí pro všechny velikosti papoušků – tloušťku volte podle velikosti nohou.'),
    serving: c('Celé větve jako bidýlka, svazky tenkých prutů k okusování, na jaře větvičky s jehnědami.'),
    preparation: PREP_BRANCH,
    risks: list('C', RISKS_COMMON),
    collecting: collectLive('Líska dobře snáší řez a často roste na mezích a v živých plotech – i tam je ale nutný souhlas majitele.'),
    habitat: b('Okraje lesů, světlé listnaté lesy, meze, křoviny a živé ploty; hojná v celé ČR.', 'kubat-2002'),
    whenToCollect: c('Celoročně; pruty nejlépe v době vegetačního klidu (listopad–březen). Jehnědy v únoru a březnu.'),
    identification: {
      parts: {
        cely: 'Mnohokmenný keř, obvykle 2–6 m vysoký.',
        list: 'Střídavý, okrouhle srdčitý, krátce zašpičatělý, dvojitě pilovitý, měkce chlupatý.',
        kura: 'Hladká, šedohnědá, lesklá, s drobnými světlými lenticelami.',
        vetev: 'Mladé letorosty žláznatě chlupaté; pupeny vejčité, tupé.',
        kvet: 'Samčí jehnědy žluté, převislé, kvetou v únoru–březnu před olistěním; samičí květy drobné, pupenovité s červenými bliznami.',
        plod: 'Oříšek obalený listenovým obalem s roztřepeným okrajem, zraje v srpnu–září.',
      },
      lookalikes: [
        {
          name: 'Olše lepkavá',
          latin: 'Alnus glutinosa',
          slug: 'olse',
          danger: 'Také má jehnědy, ale list je na špičce uťatý a plodem jsou dřevnaté šištičky. Také používaná dřevina.',
        },
        {
          name: 'Habr obecný',
          latin: 'Carpinus betulus',
          slug: 'habr',
          danger: 'Podobně pilovitý list, ale protáhlejší a s rovnoběžnými žilkami. Také používaná dřevina.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['harrison-lightfoot-2006', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'branch', color: '#7A5A3A', accent: '#C9B458' },
    photos: [],
    related: ['liskove-orisky', 'olse', 'habr', 'vetvicky'],
    seo: {
      title: 'Lískové větve pro papoušky | LES.cz',
      description:
        'Může papoušek okusovat lísku? Jak poznat lísku obecnou, kdy řezat pruty a jehnědy a jak je připravit. Lesní sklad: zdarma, vlastní doprava.',
    },
  },
  {
    slug: 'jablon',
    name: 'Jabloň',
    synonyms: ['jabloň domácí', 'jabloň lesní', 'planá jabloň', 'jabloňové větve'],
    latin: 'Malus domestica Borkh., Malus sylvestris (L.) Mill.',
    family: 'Rosaceae – růžovité',
    category: 'vetve-a-stromy',
    tagline: 'Ze zimního řezu přímo do klece. Recyklace, kterou papoušek schvaluje.',
    months: [1, 2, 3, 7, 8],
    shop: {
      price: 'ZDARMA*',
      availability: 'NASKLADNĚNO V OBDOBÍ ŘEZU (únor–březen, červenec–srpen)',
      warehouse: 'Zahrada, oddělení nestříkaných stromů',
      shipping: 'Vlastní nohy, případně sousedův žebřík',
      badge: 'Sezónní',
      buyMessage:
        'Objednávka přijata! Vaše jabloňové větve čekají na zimní řez. *Jen z nestříkaných stromů a se souhlasem majitele. Jádřinci prosím vyhoďte – ty do objednávky nepatří.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Větve z nestříkaných jabloní jsou v chovatelské praxi běžně používané. Semena (jádra) obsahují kyanogenní glykosid amygdalin a nepodávají se. Zásadní riziko představují postřiky v sadech.',
      provenance: 'C',
    },
    parts: c('Větve a větvičky, kůra, pupeny, listy z nestříkaných stromů. Ne semena (jádra).'),
    nutrition: woodNutrition('Plody (jablka) jsou samostatné ovoce; semena obsahují amygdalin.'),
    benefits: BENEFITS_BRANCH,
    species: speciesBranch(),
    serving: c('Celé větve jako bidýlka nebo k okusování; spadané či nevhodné větve ze zimního řezu.'),
    preparation: PREP_BRANCH,
    risks: list('B', [
      'Semena (jádra) obsahují amygdalin, z něhož se při trávení může uvolnit kyanovodík – nepodávejte jádřince ani semena.',
      'Postřiky (fungicidy, insekticidy) v sadech a na zahradách – používejte jen stromy, o kterých víte, že nebyly ošetřovány.',
      'Plísně, houby a lišejníky na starých větvích.',
      'Záměna s peckovinami (třešeň, švestka, střemcha) – jejich listy, kůra a pecky obsahují kyanogenní glykosidy a mezi vhodné dřeviny se neřadí.',
    ], 'frohne-pfander-2005'),
    collecting: collectLive('V praxi se nejčastěji využívají větve ze zimního nebo letního řezu ovocných stromů – domluvte se se sousedy nebo zahrádkáři.'),
    habitat: b('Zahrady a sady; jabloň lesní roztroušeně v listnatých lesích, na okrajích lesů a v křovinách.', 'kubat-2002'),
    whenToCollect: c('Při zimním řezu (únor–březen) nebo letním řezu (červenec–srpen).'),
    identification: {
      parts: {
        cely: 'Strom 5–10 m s nepravidelnou, široce rozložitou korunou.',
        list: 'Střídavý, vejčitý až eliptický, vroubkovaně pilovitý, na rubu často plstnatý.',
        kura: 'Šedohnědá, ve stáří rozpraskaná a odlupující se v plochých šupinách.',
        vetev: 'Krátké plodné větévky (brachyblasty); jabloň lesní může mít trnité výhony.',
        kvet: 'Bílé až růžové pětičetné květy v chocholících, duben–květen.',
        plod: 'Malvice (jablko) s jádřincem; u jabloně lesní drobná, 2–4 cm, trpká.',
      },
      lookalikes: [
        {
          name: 'Hrušeň',
          latin: 'Pyrus spp.',
          slug: 'hrusen',
          danger: 'Kůra rozpraskaná do drobných čtverečků, list lesklý na dlouhém řapíku. Také používaná dřevina.',
        },
        {
          name: 'Střemcha, třešeň, švestka (peckoviny)',
          latin: 'Prunus spp.',
          slug: 'stremcha-a-pecky',
          danger: 'Kůra s vodorovnými pruhy lenticel, plodem je peckovice. Listy a kůra obsahují kyanogenní glykosidy – nepoužívat.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['harrison-lightfoot-2006', 'frohne-pfander-2005', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'branch', color: '#6B4A2B', accent: '#E8A0A8' },
    photos: [],
    related: ['hrusen', 'briza', 'pupeny'],
    seo: {
      title: 'Jabloňové větve pro papoušky | LES.cz',
      description:
        'Může papoušek okusovat jabloň? Proč jen nestříkané stromy, proč ne jádra a jak poznat jabloň od peckovin. Větve ze zimního řezu zdarma.',
    },
  },
  {
    slug: 'hrusen',
    name: 'Hrušeň',
    synonyms: ['hrušeň obecná', 'planá hrušeň', 'hrušňové větve'],
    latin: 'Pyrus communis L., Pyrus pyraster (L.) Burgsd.',
    family: 'Rosaceae – růžovité',
    category: 'vetve-a-stromy',
    tagline: 'Šachovnicová kůra pro strategicky smýšlející papoušky.',
    months: [1, 2, 3, 7, 8],
    shop: {
      price: 'ZDARMA*',
      availability: 'NASKLADNĚNO V OBDOBÍ ŘEZU',
      warehouse: 'Zahrada a stará stromořadí, oddělení nestříkaných stromů',
      shipping: 'Vlastní nohy',
      buyMessage:
        'Objednávka přijata! Hrušňové větve vydáváme při zimním řezu. *Jen z nestříkaných stromů a se souhlasem majitele. Reklamace u hrušně, hruška daleko nepadá.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Větve z nestříkaných hrušní jsou v chovatelské praxi používané podobně jako jabloňové. Semena obsahují kyanogenní glykosidy a nepodávají se.',
      provenance: 'C',
    },
    parts: c('Větve, větvičky, kůra, pupeny a listy z nestříkaných stromů. Ne semena.'),
    nutrition: woodNutrition('Plody (hrušky) jsou samostatné ovoce.'),
    benefits: BENEFITS_BRANCH,
    species: speciesBranch(),
    serving: c('Celé větve jako bidýlka nebo k okusování.'),
    preparation: PREP_BRANCH,
    risks: list('C', [
      ...RISKS_COMMON,
      'Semena obsahují kyanogenní glykosidy – nepodávejte jádřince.',
      'Hrušně bývají v sadech ošetřované postřiky – jen ověřené nestříkané stromy.',
    ]),
    collecting: collectLive('Nejvhodnější jsou větve ze zimního řezu.'),
    habitat: b('Zahrady, sady, stromořadí; hrušeň planá roztroušeně v teplých lesích, na mezích a v křovinách.', 'kubat-2002'),
    whenToCollect: c('Při zimním řezu (únor–březen) nebo letním řezu (červenec–srpen).'),
    identification: {
      parts: {
        cely: 'Strom až 20 m s úzce pyramidální až vejčitou korunou.',
        list: 'Střídavý, okrouhle vejčitý, jemně vroubkovaný, lesklý, na dlouhém řapíku.',
        kura: 'Tmavě šedohnědá, rozpraskaná do drobných pravoúhlých destiček (šachovnicově).',
        vetev: 'Větévky lysé, u hrušně plané často zakončené trnem.',
        kvet: 'Bílé pětičetné květy s červenofialovými prašníky, duben.',
        plod: 'Malvice (hruška) s kamennými buňkami v dužnině; u plané hrušně drobná a tvrdá.',
      },
      lookalikes: [
        {
          name: 'Jabloň',
          latin: 'Malus spp.',
          slug: 'jablon',
          danger: 'Kůra se odlupuje v plochých šupinách, list je plstnatý. Také používaná dřevina.',
        },
        {
          name: 'Peckoviny (třešeň, švestka, střemcha)',
          latin: 'Prunus spp.',
          slug: 'stremcha-a-pecky',
          danger: 'Listy a kůra obsahují kyanogenní glykosidy – nepoužívat.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['harrison-lightfoot-2006', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'branch', color: '#4E3B2A', accent: '#F4F1E8' },
    photos: [],
    related: ['jablon', 'pupeny'],
    seo: {
      title: 'Hrušňové větve pro papoušky | LES.cz',
      description:
        'Může papoušek okusovat hrušeň? Jak hrušeň poznat, proč jen nestříkané stromy a proč ne semena. Lesní a zahradní sklad, doprava vlastníma nohama.',
    },
  },
  {
    slug: 'buk',
    name: 'Buk',
    synonyms: ['buk lesní', 'bukové větve'],
    latin: 'Fagus sylvatica L.',
    family: 'Fagaceae – bukovité',
    category: 'vetve-a-stromy',
    tagline: 'Stříbrná kůra, doutníkové pupeny. Elegance bukového lesa.',
    months: ALL_YEAR,
    shop: {
      price: 'ZDARMA*',
      availability: 'SKLADEM CELÝ ROK',
      warehouse: 'Příroda, oddělení bučin',
      shipping: 'Vlastní nohy',
      buyMessage:
        'Objednávka přijata! Bukové větve najdete v nejbližší bučině. *Živé větve jen se souhlasem vlastníka lesa; spadaná suchá klest je k mání pro každého. Bukvice v této objednávce nejsou – ty mají vlastní (opatrnou) kartu.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Bukové větve se v chovatelské praxi používají k okusování a jako bidýlka. Údaj vychází z praxe a čeká na ověření. Plody (bukvice) jsou samostatný produkt s nejasným hodnocením.',
      provenance: 'C',
    },
    parts: c('Větve, větvičky, kůra, pupeny. Bukvice (plody) sem nepatří – viz samostatná karta.'),
    nutrition: woodNutrition(''),
    benefits: BENEFITS_BRANCH,
    species: speciesBranch(),
    serving: c('Celé větve jako bidýlka nebo k okusování.'),
    preparation: PREP_BRANCH,
    risks: list('C', [...RISKS_COMMON, 'Bukvice na větvích odstraňte – jejich vhodnost pro papoušky není ověřena.']),
    collecting: collectLive(''),
    habitat: b('Bučiny a smíšené lesy od pahorkatin po hory; hojně vysazován i v parcích.', 'kubat-2002'),
    whenToCollect: c('Celoročně; nejlépe v době vegetačního klidu. Na podzim kontrolujte, zda na větvích nejsou bukvice.'),
    identification: {
      parts: {
        cely: 'Mohutný strom do 40 m s hustou korunou a válcovitým kmenem.',
        list: 'Střídavý, eliptický, 5–10 cm, celokrajný až mírně zvlněný, na okraji brvitý (jemné chloupky), mladý lesklý.',
        kura: 'Hladká, stříbrošedá i ve stáří.',
        vetev: 'Pupeny dlouhé, štíhlé, vřetenovité a ostře špičaté, odstávající od větvičky („doutníčky“).',
        kvet: 'Jednodomý; samčí květy v převislých hlávkách na dlouhých stopkách, samičí po dvou v číšce; duben–květen.',
        plod: 'Trojhranné bukvice ve dřevnaté ostnité číšce, zrají v září–říjnu.',
      },
      lookalikes: [
        {
          name: 'Habr obecný',
          latin: 'Carpinus betulus',
          slug: 'habr',
          danger: 'List je ostře dvojitě pilovitý, kmen „svalnatý“ a pupeny přitisklé. Také používaná dřevina.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['harrison-lightfoot-2006', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'bark', color: '#B8BCB4', accent: '#4F6B3A' },
    photos: [],
    related: ['habr', 'bukvice', 'briza'],
    seo: {
      title: 'Bukové větve pro papoušky | LES.cz',
      description:
        'Může papoušek okusovat buk? Jak poznat buk lesní, jak bukové větve připravit a proč jsou bukvice samostatná kapitola.',
    },
  },
  {
    slug: 'dub',
    name: 'Dub',
    synonyms: ['dub letní', 'dub zimní', 'dubové větve'],
    latin: 'Quercus robur L., Quercus petraea (Matt.) Liebl.',
    family: 'Fagaceae – bukovité',
    category: 'vetve-a-stromy',
    tagline: 'Silný jako dub. Ale s výhradou – třísloviny jsou ve hře.',
    months: ALL_YEAR,
    shop: {
      price: 'ZDARMA*',
      availability: 'SKLADEM S VÝHRADOU',
      warehouse: 'Příroda, oddělení doubrav',
      shipping: 'Vlastní nohy (a nejdřív konzultace s veterinářem)',
      badge: 'Neověřeno',
      buyMessage:
        'Objednávka přijata – s hvězdičkou. Dubové dřevo obsahuje třísloviny a podklady pro papoušky se rozcházejí. Žaludy do objednávky nepatří. *Živé větve jen se souhlasem vlastníka a nejdřív se poraďte s veterinářem.',
    },
    safety: {
      level: 'neovereno',
      summary:
        'Dub obsahuje třísloviny (taniny); otravy po pozření žaludů a mladých listů jsou popsané u skotu a koní. Některé chovatelské seznamy dub uvádějí jako vhodný na bidýlka, jiné doporučují opatrnost. Pro papoušky podklady chybí – nepodávejte k intenzivnímu okusování bez konzultace.',
      provenance: 'B',
      sourceIds: ['cooper-johnson-1984', 'frohne-pfander-2005'],
    },
    parts: c('Pokud vůbec, pak jen suché, odkorněné větve jako bidýlka. Ne žaludy, ne mladé listy a pupeny.'),
    nutrition: woodNutrition('Dřevo, kůra, listy i žaludy obsahují třísloviny.'),
    benefits: c('Tvrdé, odolné dřevo vhodné na pevná bidýlka. K okusování existují bezproblémové alternativy (bříza, vrba, líska).'),
    species: speciesBranch('Vhodnost pro žádnou skupinu papoušků není ověřena; volte raději jiné dřeviny.'),
    serving: c('Nejvýše jako bidýlko po konzultaci s veterinářem; sledujte, zda papoušek dřevo jen nekouše a nepolyká.'),
    preparation: PREP_BRANCH,
    risks: list('B', [
      'Třísloviny (taniny) – u skotu a koní popsané otravy po pozření žaludů a mladých listů.',
      'Žaludy jsou samostatně vedeny mezi rizikovým zbožím.',
      'Přenositelnost údajů z hospodářských zvířat na papoušky není ověřena.',
    ], 'cooper-johnson-1984', 'frohne-pfander-2005'),
    collecting: collectLive('Na podzim odstraňte z větví všechny žaludy.'),
    habitat: b('Doubravy, smíšené lesy, lužní lesy (d. letní), teplé stráně (d. zimní), parky a aleje.', 'kubat-2002'),
    whenToCollect: c('Pokud vůbec, pak v době vegetačního klidu, kdy na větvích nejsou žaludy ani mladé listy.'),
    identification: {
      parts: {
        cely: 'Mohutný, dlouhověký strom do 40 m s rozložitou korunou.',
        list: 'Střídavý, peřenolaločný; dub letní má list na krátkém řapíku s „oušky“ u báze, dub zimní delší řapík a klínovitou bázi.',
        kura: 'Ve stáří tlustá, šedá, hluboce podélně rozbrázděná.',
        vetev: 'Pupeny vejčité, s mnoha šupinami, nahloučené na konci větviček.',
        kvet: 'Samčí květy v převislých jehnědách, samičí drobné; květen, současně s rašením.',
        plod: 'Žalud v miskovité číšce; u dubu letního na dlouhé stopce, u dubu zimního přisedlý.',
      },
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['cooper-johnson-1984', 'frohne-pfander-2005', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'leaf', color: '#5E6B2E', accent: '#8B5E34' },
    photos: [],
    related: ['zaludy', 'buk', 'briza'],
    seo: {
      title: 'Může papoušek okusovat dub? | LES.cz',
      description:
        'Dub a papoušci: proč jsou dubové větve neověřené, co jsou třísloviny, proč ne žaludy a čím dub bezpečně nahradit.',
    },
  },
  {
    slug: 'lipa',
    name: 'Lípa',
    synonyms: ['lípa srdčitá', 'lípa velkolistá', 'lipové větve'],
    latin: 'Tilia cordata Mill., Tilia platyphyllos Scop.',
    family: 'Malvaceae – slézovité (dříve Tiliaceae – lípovité)',
    category: 'vetve-a-stromy',
    tagline: 'Národní strom ve stálé nabídce. Měkké dřevo pro jemné zobáky.',
    months: ALL_YEAR,
    shop: {
      price: 'ZDARMA*',
      availability: 'SKLADEM CELÝ ROK',
      warehouse: 'Příroda, oddělení návsí, alejí a suťových lesů',
      shipping: 'Vlastní nohy',
      badge: 'Národní sortiment',
      buyMessage:
        'Objednávka přijata! Lípa vám větve vydá – ale jen se souhlasem majitele.* Památné stromy jsou mimo prodej, ty si jen pohlaďte. Lipový květ najdete pod samostatnou kartou.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Lipové větve se v chovatelské praxi používají k okusování; měkké dřevo je oblíbené i u menších druhů. Údaj vychází z praxe a čeká na ověření.',
      provenance: 'C',
    },
    parts: c('Větve, větvičky, kůra, pupeny, mladé listy. Květy jsou samostatný produkt.'),
    nutrition: woodNutrition('Pupeny a mladé listy jsou slizovité; přesné nutriční hodnoty nemáme.'),
    benefits: BENEFITS_BRANCH,
    species: speciesBranch('Měkké dřevo je vhodné i pro menší druhy; velcí papoušci ho rozkoušou velmi rychle.'),
    serving: c('Celé větve jako bidýlka nebo k okusování, na jaře větvičky s pupeny.'),
    preparation: PREP_BRANCH,
    risks: list('C', [
      ...RISKS_COMMON,
      'Lípy v alejích a městech bývají pokryté medovicí mšic a znečištěné prachem z dopravy – vybírejte stromy mimo silnice.',
      'Památné stromy jsou chráněné – neřezat.',
    ]),
    collecting: collectLive('Památné stromy jsou chráněné zákonem o ochraně přírody a krajiny – z nich se větve neodebírají.'),
    habitat: b('Listnaté a suťové lesy, okraje lesů; hojně vysazovaná v alejích, na návsích a v parcích.', 'kubat-2002'),
    whenToCollect: c('Celoročně; nejlépe v době vegetačního klidu. Na jaře větvičky s pupeny.'),
    identification: {
      parts: {
        cely: 'Strom do 30–40 m s hustou, klenutou korunou.',
        list: 'Střídavý, srdčitý, nesouměrný, pilovitý; lípa srdčitá má na rubu rezavé chomáčky chlupů v paždí žilek, lípa velkolistá větší list s bělavými chlupy.',
        kura: 'Mladá hladká a šedá, později podélně jemně rozbrázděná.',
        vetev: 'Větévky klikaté; pupeny vejčité, nesouměrné, se 2–3 šupinami, často červenavé.',
        kvet: 'Žlutavé, silně vonné květy ve vrcholících s blanitým jazykovitým listenem; červen–červenec.',
        plod: 'Kulovitý oříšek (nažka) na listenu, který slouží jako „vrtulka“.',
      },
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['harrison-lightfoot-2006', 'kubat-2002', 'zakon-lesni', 'zakon-ochrana-prirody'],
    review: DRAFT,
    visual: { kind: 'leaf', color: '#6E8B3D', accent: '#E9D98B' },
    photos: [],
    related: ['lipovy-kvet', 'briza', 'pupeny'],
    seo: {
      title: 'Lipové větve pro papoušky | LES.cz',
      description:
        'Může papoušek okusovat lípu? Jak poznat lípu srdčitou a velkolistou, kdy větve řezat a jak je připravit. Národní strom, lesní ceny.',
    },
  },
  {
    slug: 'topol',
    name: 'Topol',
    synonyms: ['topol osika', 'osika', 'topol černý', 'topol bílý', 'topolové větve'],
    latin: 'Populus tremula L., Populus nigra L., Populus alba L.',
    family: 'Salicaceae – vrbovité',
    category: 'vetve-a-stromy',
    tagline: 'Osika se třese, ale papoušek se nebojí.',
    months: ALL_YEAR,
    shop: {
      price: 'ZDARMA*',
      availability: 'SKLADEM CELÝ ROK',
      warehouse: 'Příroda, oddělení pasek, břehů a větrolamů',
      shipping: 'Vlastní nohy',
      buyMessage:
        'Objednávka přijata! Topoly vám zamávají listím – to je u nich potvrzení objednávky. *Živé větve jen se souhlasem majitele. Chmýří v červnu reklamovat nelze.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Topolové větve (zejména osika) se v chovatelské praxi používají k okusování. Údaj vychází z praxe a čeká na ověření.',
      provenance: 'C',
    },
    parts: c('Větve, větvičky, kůra, pupeny, mladé listy.'),
    nutrition: woodNutrition('Kůra, podobně jako u vrb, obsahuje salicylátové glykosidy.'),
    benefits: BENEFITS_BRANCH,
    species: speciesBranch('Měkké dřevo; velcí papoušci ho spotřebují velmi rychle.'),
    serving: c('Celé větve jako bidýlka nebo k okusování.'),
    preparation: PREP_BRANCH,
    risks: list('C', [
      ...RISKS_COMMON,
      'Pryskyřičné lepkavé pupeny (zejména topol černý a balzámové topoly) – vhodnost pupenů pro papoušky není ověřena.',
    ]),
    collecting: collectLive(''),
    habitat: b('Osika: paseky, okraje lesů, náletové plochy. Topol černý a bílý: břehy řek, lužní lesy; hybridní topoly ve větrolamech a alejích.', 'kubat-2002'),
    whenToCollect: c('Celoročně; nejlépe v době vegetačního klidu.'),
    identification: {
      parts: {
        cely: 'Rychle rostoucí stromy; osika do 20 m, topol černý do 30 m s rozložitou korunou.',
        list: 'Osika: okrouhlý, vroubkovaný list na dlouhém, ze stran zploštělém řapíku – list se třese i za bezvětří. Topol bílý: laločnatý list, na rubu bíle plstnatý.',
        kura: 'Osika: hladká, zelenošedá s kosočtverečnými lenticelami, ve stáří tmavá a rozbrázděná. Topol bílý: bělavá.',
        vetev: 'Pupeny s několika šupinami, často lepkavé.',
        kvet: 'Dvoudomé jehnědy, březen–duben, před olistěním.',
        plod: 'Tobolka; semena s bílým chmýřím se uvolňují v květnu a červnu.',
      },
      lookalikes: [
        {
          name: 'Bříza',
          latin: 'Betula spp.',
          slug: 'briza',
          danger: 'Bílá kůra se loupe v papírovitých pruzích, list je trojúhelníkovitý. Také používaná dřevina.',
        },
        {
          name: 'Vrba',
          latin: 'Salix spp.',
          slug: 'vrba',
          danger: 'Pupeny mají jedinou čepičkovitou šupinu. Také používaná dřevina.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['harrison-lightfoot-2006', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'leaf', color: '#7FA05A', accent: '#C9CFC1' },
    photos: [],
    related: ['vrba', 'briza'],
    seo: {
      title: 'Topol a osika pro papoušky | LES.cz',
      description:
        'Může papoušek okusovat topol? Jak poznat osiku a další topoly, kdy řezat větve a jak je připravit. Lesní sklad, celoroční nabídka.',
    },
  },
  {
    slug: 'javor',
    name: 'Javor',
    synonyms: ['javor klen', 'klen', 'javor mléč', 'javor babyka', 'javor jasanolistý', 'javorové větve'],
    latin: 'Acer pseudoplatanus L., Acer platanoides L., Acer campestre L., Acer negundo L.',
    family: 'Sapindaceae – mýdelníkovité (dříve Aceraceae – javorovité)',
    category: 'vetve-a-stromy',
    tagline: 'Zboží na objednávku s konzultací. Vrtulky jsou mimo prodej.',
    months: ALL_YEAR,
    shop: {
      price: 'ZDARMA*',
      availability: 'POZASTAVENO – ČEKÁ NA ODBORNÉ POSOUZENÍ',
      warehouse: 'Příroda, oddělení suťových lesů a alejí',
      shipping: 'Až po konzultaci s veterinářem',
      badge: 'Neověřeno',
      buyMessage:
        'Objednávka pozastavena. Semena některých javorů obsahují hypoglycin A, který prokazatelně škodí koním; jak působí na papoušky, zatím nikdo neví. Než si javor objednáte, zeptejte se veterináře. Vrtulky do objednávky nikdy nepatří.',
    },
    safety: {
      level: 'neovereno',
      summary:
        'Semena (a u některých druhů i semenáčky a listy) javoru klenu a javoru jasanolistého obsahují hypoglycin A, který u koní způsobuje atypickou myopatii. Zda a jak působí na papoušky, není známo. Některé chovatelské seznamy javor uvádějí jako vhodný – podklady jsou rozporné.',
      provenance: 'B',
      sourceIds: ['valberg-2013'],
    },
    parts: c('Pokud vůbec, pak jen větve bez semen, květů a listů – a až po konzultaci s veterinářem.'),
    nutrition: woodNutrition('Semena javoru klenu a javoru jasanolistého obsahují hypoglycin A.'),
    benefits: c('Stejné jako u jiných dřevin (okusování, bidýlka), ale existují bezproblémové alternativy – bříza, vrba, líska.'),
    species: speciesBranch('Vhodnost pro žádnou skupinu papoušků není ověřena.'),
    serving: c('Nedoporučujeme bez konzultace s veterinářem.'),
    preparation: PREP_BRANCH,
    risks: list('B', [
      'Hypoglycin A v semenech (vrtulkách) javoru klenu a javoru jasanolistého – u koní způsobuje často smrtelnou atypickou myopatii.',
      'Přenositelnost na ptáky není ověřena.',
      'Semena padají na podzim a vítr je roznáší – mohou se dostat i do venkovních voliér.',
    ], 'valberg-2013'),
    collecting: collectLive('Pokud by veterinář javor schválil, odstraňte z větví všechna semena, květy i listy.'),
    habitat: b('Suťové a listnaté lesy (klen, mléč), teplé křoviny a meze (babyka); javor jasanolistý zplaňuje podél řek; všechny se hojně vysazují v alejích a parcích.', 'kubat-2002'),
    whenToCollect: c('Nedoporučujeme sběr bez konzultace. Rozhodně ne v období, kdy jsou na stromech nebo pod nimi semena.'),
    identification: {
      parts: {
        cely: 'Stromy do 20–35 m (babyka často jen keř nebo menší strom).',
        list: 'Vstřícný, dlanitě 3–5laločný na dlouhém řapíku; javor mléč má v řapíku bílou mléčnou šťávu; javor jasanolistý má list zpeřený (3–5 lístků).',
        kura: 'Klen: šedá, ve stáří se odlupuje v plochých šupinách. Mléč: tmavá, jemně podélně rozbrázděná. Babyka: korkovitě rozbrázděná.',
        vetev: 'Pupeny vstřícné; u klenu zelené, u mléče červenohnědé.',
        kvet: 'Žlutozelené květy v chocholících nebo hroznech, duben–květen.',
        plod: 'Dvounažka se dvěma křídly („vrtulka“), zraje na podzim.',
      },
      lookalikes: [
        {
          name: 'Platan',
          latin: 'Platanus × hispanica',
          danger: 'Podobný dlanitý list, ale listy jsou střídavé, kůra se odlupuje ve velkých plátech a plodem jsou kulovité „kuličky“.',
        },
        {
          name: 'Jasan ztepilý',
          latin: 'Fraxinus excelsior',
          slug: 'jasan',
          danger: 'Javor jasanolistý má zpeřené listy podobné jasanu; jasan má černé sametové pupeny a jednokřídlé nažky.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['valberg-2013', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'leaf', color: '#B5651D', accent: '#5B7A2E' },
    photos: [],
    related: ['jasan', 'lipa', 'briza'],
    seo: {
      title: 'Může papoušek okusovat javor? | LES.cz',
      description:
        'Javor a papoušci: co je hypoglycin A, proč jsou javorové větve neověřené a proč nikdy ne semena. Raději bříza, vrba nebo líska.',
    },
  },
  {
    slug: 'habr',
    name: 'Habr',
    synonyms: ['habr obecný', 'habrové větve'],
    latin: 'Carpinus betulus L.',
    family: 'Betulaceae – břízovité',
    category: 'vetve-a-stromy',
    tagline: 'Tvrdé dřevo pro tvrdé zobáky. Svaly v ceně.',
    months: ALL_YEAR,
    shop: {
      price: 'ZDARMA*',
      availability: 'SKLADEM CELÝ ROK',
      warehouse: 'Příroda, oddělení dubohabřin a živých plotů',
      shipping: 'Vlastní nohy',
      buyMessage:
        'Objednávka přijata! Habr vám ji podepíše tvrdým dřevem. *Živé větve jen se souhlasem majitele – habrové ploty sousedů nejsou samoobsluha.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Habr se objevuje na chovatelských seznamech vhodných dřevin; tvrdé dřevo vydrží déle než bříza či lípa. Údaj vychází z praxe a čeká na ověření.',
      provenance: 'C',
    },
    parts: c('Větve, větvičky, kůra, pupeny, mladé listy.'),
    nutrition: woodNutrition('Habrové dřevo je velmi tvrdé a husté.'),
    benefits: BENEFITS_BRANCH,
    species: speciesBranch('Tvrdé dřevo ocení hlavně střední a velcí papoušci; malým druhům dejte tenké větvičky.'),
    serving: c('Celé větve jako bidýlka nebo k okusování.'),
    preparation: PREP_BRANCH,
    risks: list('C', RISKS_COMMON),
    collecting: collectLive('Habr se často pěstuje jako stříhaný živý plot – větve z řezu plotu jsou vhodným zdrojem, pokud plot nebyl stříkán.'),
    habitat: b('Dubohabřiny a listnaté lesy nížin a pahorkatin; hojně v živých plotech a parcích.', 'kubat-2002'),
    whenToCollect: c('Celoročně; nejlépe v době vegetačního klidu nebo při stříhání živých plotů.'),
    identification: {
      parts: {
        cely: 'Strom do 20–25 m nebo stříhaný keř; kmen nepravidelně zprohýbaný, „svalnatý“.',
        list: 'Střídavý, vejčitě eliptický, ostře dvojitě pilovitý, s výraznými souběžnými žilkami, mírně zřasený.',
        kura: 'Hladká, šedá, s tmavšími podélnými pruhy, i ve stáří nerozbrázděná.',
        vetev: 'Pupeny drobné, špičaté, přitisklé k větvičce (na rozdíl od odstávajících pupenů buku).',
        kvet: 'Jehnědy; samčí převislé, samičí na koncích větévek; duben–květen.',
        plod: 'Drobný oříšek na trojlaločném listenu, v převislých plodenstvích.',
      },
      lookalikes: [
        {
          name: 'Buk lesní',
          latin: 'Fagus sylvatica',
          slug: 'buk',
          danger: 'List celokrajný a zvlněný, pupeny dlouhé a odstávající. Také používaná dřevina.',
        },
        {
          name: 'Líska obecná',
          latin: 'Corylus avellana',
          slug: 'liska',
          danger: 'List je okrouhlejší a měkce chlupatý. Také používaná dřevina.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['harrison-lightfoot-2006', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'bark', color: '#8E938A', accent: '#5E7F3A' },
    photos: [],
    related: ['buk', 'liska'],
    seo: {
      title: 'Habrové větve pro papoušky | LES.cz',
      description:
        'Může papoušek okusovat habr? Jak poznat habr obecný od buku, kdy řezat větve a jak je připravit. Tvrdé dřevo, lesní cena.',
    },
  },
  {
    slug: 'jasan',
    name: 'Jasan',
    synonyms: ['jasan ztepilý', 'jasanové větve'],
    latin: 'Fraxinus excelsior L.',
    family: 'Oleaceae – olivovníkovité',
    category: 'vetve-a-stromy',
    tagline: 'Černé sametové pupeny. Luxus, který se nemusí žehlit.',
    months: ALL_YEAR,
    shop: {
      price: 'ZDARMA*',
      availability: 'SKLADEM, POUZE ZDRAVÉ KUSY',
      warehouse: 'Příroda, oddělení lužních a suťových lesů',
      shipping: 'Vlastní nohy',
      buyMessage:
        'Objednávka přijata! Jasan vydáváme jen zdravý – nemocné, odumírající větve ze skladu nevydáváme. *Živé větve jen se souhlasem majitele.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Jasan se objevuje na chovatelských seznamech vhodných dřevin. Údaj vychází z praxe a čeká na ověření. Pozor na záměnu s jedovatým akátem a s javorem jasanolistým.',
      provenance: 'C',
    },
    parts: c('Větve, větvičky, kůra. Jen zdravé, živé dřevo.'),
    nutrition: woodNutrition(''),
    benefits: BENEFITS_BRANCH,
    species: speciesBranch(),
    serving: c('Celé větve jako bidýlka nebo k okusování.'),
    preparation: PREP_BRANCH,
    risks: list('C', [
      ...RISKS_COMMON,
      'Jasany v Evropě masově napadá houbová choroba (nekróza jasanu) – nepoužívejte odumírající větve se skvrnami na kůře.',
      'Záměna s akátem (trnité větve, jedovatá kůra a semena) nebo s javorem jasanolistým.',
    ]),
    collecting: collectLive('Odebírejte jen větve bez skvrn, nekróz a odumřelých částí.'),
    habitat: b('Lužní a suťové lesy, břehy potoků, vlhké listnaté lesy; vysazován v alejích.', 'kubat-2002'),
    whenToCollect: c('Celoročně; nejlépe v době vegetačního klidu, kdy jsou dobře vidět černé pupeny.'),
    identification: {
      parts: {
        cely: 'Strom do 30–40 m se štíhlým kmenem a řídkou korunou.',
        list: 'Vstřícný, lichozpeřený, s 9–15 přisedlými pilovitými lístky.',
        kura: 'Mladá hladká, zelenošedá; později síťovitě (kosočtverečně) rozbrázděná.',
        vetev: 'Silné šedozelené větévky se vstřícnými, černými, sametově matnými pupeny – nejspolehlivější znak.',
        kvet: 'Drobné květy bez okvětí v chomáčích, duben–květen, před olistěním.',
        plod: 'Jednokřídlá nažka („peruť“) v převislých trsech; zůstává na stromě často přes zimu.',
      },
      lookalikes: [
        {
          name: 'Akát (trnovník akát)',
          latin: 'Robinia pseudoacacia',
          slug: 'akat',
          danger: 'Také zpeřené listy, ale střídavé, lístky celokrajné a na větvích trny. Kůra a semena jsou jedovaté!',
        },
        {
          name: 'Jeřáb ptačí',
          latin: 'Sorbus aucuparia',
          slug: 'jerabiny',
          danger: 'Zpeřené listy jsou střídavé, plodem červené malvičky (jeřabiny).',
        },
        {
          name: 'Javor jasanolistý',
          latin: 'Acer negundo',
          slug: 'javor',
          danger: 'Vstřícné zpeřené listy jen se 3–5 lístky, plodem dvounažka; semena obsahují hypoglycin A.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['harrison-lightfoot-2006', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'branch', color: '#7D8471', accent: '#1F1F1F' },
    photos: [],
    related: ['olse', 'javor', 'akat'],
    seo: {
      title: 'Jasanové větve pro papoušky | LES.cz',
      description:
        'Může papoušek okusovat jasan? Jak poznat jasan podle černých pupenů, jak ho nezaměnit s akátem a proč jen zdravé větve.',
    },
  },
  {
    slug: 'olse',
    name: 'Olše',
    synonyms: ['olše lepkavá', 'olše černá', 'olšové větve', 'olšové šištičky'],
    latin: 'Alnus glutinosa (L.) Gaertn.',
    family: 'Betulaceae – břízovité',
    category: 'vetve-a-stromy',
    tagline: 'Šištičky, které nejsou šišky. Olše ráda mate zákazníky.',
    months: ALL_YEAR,
    shop: {
      price: 'ZDARMA*',
      availability: 'SKLADEM CELÝ ROK',
      warehouse: 'Příroda, oddělení potoků a olšin',
      shipping: 'Vlastní nohy (holínky doporučeny)',
      buyMessage:
        'Objednávka přijata! Olšové větve čekají u potoka, kde mají nohy pořád mokré. *Živé větve jen se souhlasem majitele.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Olše se objevuje na chovatelských seznamech vhodných dřevin. Údaj vychází z praxe a čeká na ověření.',
      provenance: 'C',
    },
    parts: c('Větve, větvičky, kůra, pupeny; větvičky s dřevnatými šištičkami jako hračka.'),
    nutrition: woodNutrition('Kůra a šištičky obsahují třísloviny.'),
    benefits: BENEFITS_BRANCH,
    species: speciesBranch(),
    serving: c('Celé větve jako bidýlka nebo k okusování; větvičky se šištičkami k ohryzávání.'),
    preparation: PREP_BRANCH,
    risks: list('C', [
      ...RISKS_COMMON,
      'Olše rostou u vody, často pod znečištěnými přítoky – vybírejte čistá místa.',
      'Obsah tříslovin v kůře a šištičkách – vliv na papoušky není ověřen.',
    ]),
    collecting: collectLive(''),
    habitat: b('Břehy potoků a řek, olšiny, mokřady, prameniště; od nížin do podhůří.', 'kubat-2002'),
    whenToCollect: c('Celoročně; šištičky zůstávají na stromě i přes zimu.'),
    identification: {
      parts: {
        cely: 'Strom do 25 m, často vícekmenný, s úzkou korunou.',
        list: 'Střídavý, obvejčitý až okrouhlý, na špičce uťatý nebo mělce vykrojený, mladý lepkavý.',
        kura: 'Tmavě hnědá až černošedá, ve stáří rozpraskaná do destiček.',
        vetev: 'Pupeny stopkaté, fialovohnědé, lepkavé.',
        kvet: 'Jehnědy; samčí převislé, kvetou v únoru–březnu před olistěním.',
        plod: 'Drobné dřevnaté šištičky (do 2 cm), zůstávají na stromě přes zimu.',
      },
      lookalikes: [
        {
          name: 'Líska obecná',
          latin: 'Corylus avellana',
          slug: 'liska',
          danger: 'Má zašpičatělý list a oříšky místo šištiček. Také používaná dřevina.',
        },
        {
          name: 'Krušina olšová',
          latin: 'Frangula alnus',
          slug: 'krusina-olsova',
          danger: 'Keř podobných stanovišť s celokrajnými listy a černými bobulemi; kůra i plody jsou jedovaté.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['harrison-lightfoot-2006', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'cone', color: '#4A3A2C', accent: '#6E8B4E' },
    photos: [],
    related: ['liska', 'vrba', 'jasan', 'sisky'],
    seo: {
      title: 'Olše pro papoušky: větve a šištičky | LES.cz',
      description:
        'Může papoušek okusovat olši? Jak poznat olši lepkavou, jak ji nezaměnit s krušinou a jak větve se šištičkami připravit.',
    },
  },
  {
    slug: 'vinna-reva',
    name: 'Vinná réva',
    synonyms: ['réva', 'vinná réva', 'révové dřevo', 'réví'],
    latin: 'Vitis vinifera L.',
    family: 'Vitaceae – révovité',
    category: 'vetve-a-stromy',
    tagline: 'Z vinice rovnou do voliéry. Bez alkoholu, bez postřiku.',
    months: [1, 2, 3, 11, 12],
    shop: {
      price: 'ZDARMA*',
      availability: 'NASKLADNĚNO PŘI ZIMNÍM ŘEZU',
      warehouse: 'Zahrada, oddělení pergol a nestříkaných keřů',
      shipping: 'Vlastní nohy',
      badge: 'Zimní edice',
      buyMessage:
        'Objednávka přijata! Révové pruty vydáváme při zimním řezu. *Jen z nestříkané révy a se souhlasem majitele. Víno v ceně není, papoušek je řidič.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Pruty a kmínky nestříkané révy se v chovatelské praxi používají k okusování a jako zprohýbaná bidýlka. Réva ve vinicích bývá intenzivně ošetřována postřiky – ty jsou hlavní riziko. Údaj vychází z praxe a čeká na ověření.',
      provenance: 'C',
    },
    parts: c('Jednoleté pruty a starší dřevo z nestříkaných keřů, odlupující se kůra.'),
    nutrition: woodNutrition('Plody (hrozny) nejsou předmětem této karty.'),
    benefits: c(
      'Zkroucené dřevo poskytuje bidýlka nepravidelného tvaru a průměru; vláknitá kůra se dobře loupe a trhá.',
    ),
    species: speciesBranch(),
    serving: c('Pruty a kousky kmínků jako bidýlka nebo k okusování.'),
    preparation: PREP_BRANCH,
    risks: list('C', [
      'Postřiky ve vinicích (měďnaté a sirné přípravky, fungicidy, insekticidy) – jen réva, o níž s jistotou víte, že nebyla ošetřována.',
      'Plísně a houby na starém dřevě.',
      'Záměna s přísavníkem (loubincem) nebo břečťanem na pergolách a zdech.',
    ]),
    collecting: collectLive('Ve vinicích se réva pravidelně stříká – prosté „vzít si pruty z vinice“ nestačí.'),
    habitat: c('Zahrady, pergoly, vinice; v lužních lesích jižní Moravy vzácně roste réva lesní, která je zvláště chráněná a nesbírá se.', 'kubat-2002', 'zakon-ochrana-prirody'),
    whenToCollect: c('Při zimním řezu (listopad–březen), kdy je réva bez listů.'),
    identification: {
      parts: {
        cely: 'Dřevnatá liána, pnoucí se pomocí úponků; v kultuře řezaná na nízký kmínek nebo pergolu.',
        list: 'Střídavý, dlanitě 3–5laločný, se srdčitou bází a hrubě zubatým okrajem.',
        kura: 'Na starém dřevě se odlupuje v dlouhých vláknitých pruzích.',
        vetev: 'Letorosty s úponky vyrůstajícími naproti listům; dřevo s výraznými kolénky.',
        kvet: 'Drobné zelenavé vonné květy v latách, červen.',
        plod: 'Bobule v hroznech, zrají v září–říjnu.',
      },
      lookalikes: [
        {
          name: 'Přísavník (loubinec)',
          latin: 'Parthenocissus spp.',
          danger: 'Pnoucí rostlina na zdech s dlanitě složenými listy a modročernými bobulemi; nejde o révu – nepoužívejte.',
        },
        {
          name: 'Břečťan popínavý',
          latin: 'Hedera helix',
          slug: 'brectan',
          danger: 'Stálezelená liána s kožovitými listy a příčepivými kořeny; obsahuje saponiny – nepoužívat.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['kubat-2002', 'zakon-lesni', 'zakon-ochrana-prirody'],
    review: DRAFT,
    visual: { kind: 'branch', color: '#6A4A35', accent: '#7A3E6B' },
    photos: [],
    related: ['jablon', 'hrusen', 'brectan'],
    seo: {
      title: 'Vinná réva pro papoušky: pruty a dřevo | LES.cz',
      description:
        'Může papoušek okusovat vinnou révu? Proč jen nestříkané keře, kdy pruty řezat a jak révu nezaměnit s přísavníkem nebo břečťanem.',
    },
  },
  {
    slug: 'smrk-a-borovice',
    name: 'Smrk a borovice',
    synonyms: ['smrk ztepilý', 'borovice lesní', 'jehličí', 'smrkové větve', 'borové větve', 'chvojí'],
    latin: 'Picea abies (L.) H. Karst., Pinus sylvestris L.',
    family: 'Pinaceae – borovicovité',
    category: 'vetve-a-stromy',
    tagline: 'Vánoční kolekce s pryskyřicí. Lepí, voní, nasazuje výhrady.',
    months: ALL_YEAR,
    shop: {
      price: 'ZDARMA*',
      availability: 'SKLADEM S VÝHRADOU',
      warehouse: 'Příroda, oddělení jehličnatých lesů',
      shipping: 'Vlastní nohy (smůla na botách zdarma)',
      badge: 'Opatrně',
      buyMessage:
        'Objednávka přijata – s výhradou. Jehličnany obsahují pryskyřici a silice a podklady pro papoušky jsou skromné. *Sekat chvojí v lese zákon zakazuje; použít můžete spadanou klest nebo větve se souhlasem vlastníka. A pozor na tis – ten v naší nabídce není a nikdy nebude.',
    },
    safety: {
      level: 'stridme',
      summary:
        'Smrkové a borové větve se v chovatelské praxi občas používají, zejména vyschlé a bez pryskyřičných výronů. Čerstvé jehličí a pryskyřice obsahují silice; odborné podklady pro papoušky jsou skromné. Zásadní je nezaměnit je s jedovatým tisem nebo tújí.',
      provenance: 'C',
    },
    parts: c('Suché nebo proschlé větve bez pryskyřičných výronů, kůra. Šišky viz samostatný produkt.'),
    nutrition: woodNutrition('Jehličí a pryskyřice obsahují silice (terpeny).'),
    benefits: c('Okusování, loupání kůry a variabilní bidýlka; jehličí jako sezónní obohacení – vhodnost ověřte.'),
    species: speciesBranch('Podávejte střídmě a sledujte, zda papoušek jehličí nepolyká ve velkém.'),
    serving: c('Proschlé větve jako bidýlka; čerstvé jehličnaté větvičky jen výjimečně a v malém množství.'),
    preparation: c(
      'Větve omyjte horkou vodou a kartáčem; pryskyřičné výrony odstraňte nebo takové kusy nepoužívejte. V praxi se doporučuje větve nechat proschnout. Odstraňte části s houbou, plísní, lišejníkem nebo hmyzem (kůrovec).',
    ),
    risks: list('C', [
      'Pryskyřice – lepí peří, obtížně se odstraňuje.',
      'Silice v čerstvém jehličí – vliv na papoušky není podrobně prozkoumán.',
      'Záměna s tisem červeným (Taxus baccata), který je prudce jedovatý, nebo s tújí (zerav).',
      'Smrky napadené kůrovcem a ošetřované insekticidy (lapáky, ošetřené hromady dřeva) – nepoužívat.',
    ]),
    collecting: b(
      'Lesní zákon zakazuje v lese sekat chvojí a poškozovat stromy (§ 20); pro vlastní potřebu smíte sbírat suchou klest ležící na zemi (§ 19). Živé větve jen se souhlasem vlastníka. Nepoužívejte dřevo z ošetřených hromad a lapáků na kůrovce.',
      'zakon-lesni',
    ),
    habitat: b('Smrk: horské a podhorské lesy, rozsáhlé výsadby po celé ČR. Borovice: písčiny, skály, rašeliniště a hospodářské lesy.', 'kubat-2002'),
    whenToCollect: c('Celoročně; spadanou suchou klest po větrných dnech.'),
    identification: {
      parts: {
        cely: 'Smrk: kuželovitá koruna, kmen přímý. Borovice: ve stáří deštníkovitá koruna, horní část kmene oranžová.',
        list: 'Smrk: jehlice čtyřhranné, pichlavé, jednotlivě po celém obvodu větévky. Borovice: jehlice po dvou ve svazečku, 4–7 cm, šedozelené, stočené.',
        kura: 'Smrk: červenohnědá, šupinatá. Borovice: dole hluboce rozbrázděná, nahoře oranžovočervená, odlupující se tenkými šupinami.',
        vetev: 'Smrk: po opadu jehlic drsná větévka s jehlicovými polštářky. Borovice: jehlice ve svazečcích na krátkých větévkách.',
        kvet: 'Samčí šištičky žluté až červené, samičí drobné šištice; květen.',
        plod: 'Smrk: převislé šišky, celé opadávají. Borovice: drobné šišky 3–7 cm, dozrávají druhým rokem.',
      },
      lookalikes: [
        {
          name: 'Tis červený',
          latin: 'Taxus baccata',
          slug: 'tis-cerveny',
          danger: 'Ploché tmavozelené jehlice, bez pryskyřice, červené dužnaté míšky. Prudce jedovatý – všechny části kromě dužiny míšku!',
        },
        {
          name: 'Túje (zerav)',
          latin: 'Thuja spp.',
          slug: 'tuje',
          danger: 'Šupinovité listy v plochých větévkách; obsahuje thujon – nepoužívat.',
        },
        {
          name: 'Jedle bělokorá',
          latin: 'Abies alba',
          danger: 'Ploché jehlice se dvěma bílými proužky na rubu a vzpřímené šišky. Podklady pro papoušky chybí.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'branch', color: '#2F5233', accent: '#B5651D' },
    photos: [],
    related: ['sisky', 'tis-cerveny', 'tuje'],
    seo: {
      title: 'Smrk a borovice pro papoušky? | LES.cz',
      description:
        'Mohou papoušci okusovat smrk nebo borovici? Proč střídmě, co s pryskyřicí a jak jehličnany nezaměnit s jedovatým tisem nebo tújí.',
    },
  },
];
