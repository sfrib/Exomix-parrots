import type { Product } from '@/lib/types';
import { a, b, c, DRAFT, list } from '../helpers';

/**
 * C. BYLINKY A PLANÉ ROSTLINY
 */
export const HERBS: Product[] = [
  {
    slug: 'pampeliska',
    name: 'Pampeliška',
    synonyms: ['smetánka lékařská', 'smetánka', 'pampeliška lékařská', 'mlíčí'],
    latin: 'Taraxacum sect. Ruderalia',
    family: 'Asteraceae – hvězdnicovité',
    category: 'bylinky-a-plane-rostliny',
    tagline: 'Bestseller každé louky. Dodáváme i s chmýřím, pokud přijdete pozdě.',
    months: [3, 4, 5, 6, 7, 8, 9, 10],
    shop: {
      price: 'ZDARMA',
      availability: 'SKLADEM TÉMĚŘ VŠUDE (březen–říjen)',
      warehouse: 'Příroda, oddělení luk, mezí a zahradních trávníků',
      shipping: 'Vlastní nohy, případně vlastní zahrada',
      badge: 'Bestseller',
      buyMessage:
        'Objednávka přijata! Vaše pampelišky na vás čekají na nejbližší louce. Pokud už zbylo jen chmýří, reklamaci řešte s větrem.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Listy a květy pampelišky patří mezi nejčastěji doporučovanou planou zeleň pro papoušky. Podmínkou je sběr z čistého místa.',
      provenance: 'B',
      sourceIds: ['harrison-lightfoot-2006'],
    },
    parts: b('Mladé listy, květy, v menší míře i kořen.', 'harrison-lightfoot-2006'),
    nutrition: {
      summary: c(
        'Listová zelenina s vysokým obsahem vápníku, vitaminu A (z karotenoidů) a vitaminu K, s nízkou energetickou hodnotou. Obsahuje i hořčiny.',
        'usda-fdc',
      ),
      values: [
        { label: 'Energie', amount: 45, unit: 'kcal' },
        { label: 'Voda', amount: 86, unit: 'g' },
        { label: 'Bílkoviny', amount: 2.7, unit: 'g' },
        { label: 'Vláknina', amount: 3.5, unit: 'g' },
        { label: 'Vápník', amount: 187, unit: 'mg' },
        { label: 'Fosfor', amount: 66, unit: 'mg' },
        { label: 'Vitamin C', amount: 35, unit: 'mg' },
        { label: 'Vitamin A (RAE)', amount: 508, unit: 'µg' },
      ],
      valuesBasis: 'USDA FoodData Central – dandelion greens, raw (listy pampelišky, syrové). Orientační hodnoty na 100 g.',
      valuesProvenance: 'C',
      valuesSourceIds: ['usda-fdc'],
    },
    benefits: c(
      'Zdroj vápníku s příznivým poměrem Ca:P a provitaminu A, kterého bývá v zrninových směsích málo. Zpestření krmné dávky a příležitost k okusování a trhání.',
    ),
    species: {
      mali: 'Vhodné – lístky a květy, malé množství denně nebo obden.',
      stredni: 'Vhodné – listy i celé květy.',
      velci: 'Vhodné – celé listy, květy i kousky kořene.',
      poznamka:
        'Pampeliška má mírně močopudný účinek – u ptáků s onemocněním ledvin konzultujte množství s veterinářem.',
      provenance: 'C',
    },
    serving: c('Čerstvé omyté listy a květy samostatně nebo jako součást zeleninové misky. Listy lze zavěsit do klece ke trhání.'),
    preparation: c('Omýt pitnou vodou, osušit. Nepodávat zvadlé, plesnivé nebo zapařené listy.'),
    risks: list('C', [
      'Sběr z trávníků ošetřovaných herbicidy, z okrajů silnic a psích venčišť.',
      'Záměna s jinými žlutými hvězdnicovitými rostlinami (většinou neškodné, ale bez jistoty určení nepodávat).',
      'Velké množství najednou může změkčit trus.',
    ]),
    collecting: b(
      'Sbírejte z neošetřených luk a zahrad mimo frekventované cesty. Na chráněných územích se řiďte místními pravidly.',
      'zakon-ochrana-prirody',
    ),
    habitat: b('Louky, pastviny, trávníky, meze, okraje cest – hojně od nížin po hory.', 'kubat-2002'),
    whenToCollect: c('Listy nejlépe na jaře (mladé, méně hořké), květy od dubna; sbírejte za sucha.'),
    identification: {
      parts: {
        cely: 'Vytrvalá bylina s přízemní růžicí listů a dutými bezlistými stvoly s jediným úborem; celá rostlina roní bílé mléko.',
        list: 'Listy v přízemní růžici, kopinaté, různě hluboce zubaté až peřenodílné („lví zub“), lysé nebo jen řídce chlupaté.',
        kvet: 'Zlatožlutý úbor složený jen z jazykovitých květů, na dutém stvolu.',
        plod: 'Nažky s chmýřím tvořící kulovitý „chmýřník“.',
      },
      lookalikes: [
        {
          name: 'Jestřábníky, škardy, prasetník',
          latin: 'Hieracium, Crepis, Hypochaeris',
          danger: 'Podobné žluté úbory, ale mají větvené nebo olistěné lodyhy či chlupaté listy. Nejsou známé jako vysoce toxické, ale bez jistého určení nepodávejte.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['harrison-lightfoot-2006', 'usda-fdc', 'kubat-2002', 'zakon-ochrana-prirody'],
    review: DRAFT,
    visual: { kind: 'flower', color: '#F2C230', accent: '#4E8A3A' },
    photos: [],
    related: ['jitrocel', 'cekanka', 'ptacinec'],
    seo: {
      title: 'Může papoušek pampelišku? | LES.cz',
      description:
        'Pampeliška pro papoušky: listy, květy i kořen. Jak ji sbírat, kolik podávat a proč je tak oblíbená. Zdarma na každé louce.',
    },
  },
  {
    slug: 'jitrocel',
    name: 'Jitrocel',
    synonyms: ['jitrocel kopinatý', 'jitrocel větší', 'skorocel'],
    latin: 'Plantago lanceolata L., Plantago major L.',
    family: 'Plantaginaceae – jitrocelovité',
    category: 'bylinky-a-plane-rostliny',
    tagline: 'Klasika od cesty. Doporučujeme ale kus dál od cesty.',
    months: [4, 5, 6, 7, 8, 9, 10],
    shop: {
      price: 'ZDARMA',
      availability: 'SKLADEM (duben–říjen)',
      warehouse: 'Příroda, oddělení luk a polních cest',
      shipping: 'Vlastní nohy (od cesty doporučujeme ujít aspoň pár kroků)',
      buyMessage:
        'Objednávka přijata! Jitrocel je připraven k vyzvednutí. Prosíme, neodebírejte zboží přímo z krajnice – tam ho testují auta.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Listy i zralé klasy se semeny jsou chovateli ptáků běžně podávány; zvlášť oblíbené jsou u malých papoušků.',
      provenance: 'C',
    },
    parts: c('Mladé listy a klasy se semeny (zelené i dozrálé).'),
    nutrition: {
      summary: c('Listová zeleň s vlákninou a slizovými látkami; semena v klasech jsou drobná a škrobovitá.'),
    },
    benefits: c('Přirozená práce se zobákem – vyklovávání semen z klasů je pro malé papoušky přirozené hledání potravy.'),
    species: {
      mali: 'Vhodné – klasy se semeny jsou oblíbený pamlsek (andulky, korely, agapornisové, neofémy).',
      stredni: 'Vhodné – listy i klasy.',
      velci: 'Vhodné spíše jako zeleň k trhání; semena jsou pro ně příliš drobná.',
      provenance: 'C',
    },
    serving: c('Celé listy nebo svazek klasů zavěšený v kleci, případně vložený do přírodní hračky.'),
    preparation: c('Omýt, osušit; klasy prohlédnout, zda nejsou plesnivé nebo napadené hmyzem.'),
    risks: list('C', [
      'Roste často u cest – riziko znečištění prachem, solí a výfukovými plyny.',
      'Plesnivé klasy po deštích nepodávat.',
    ]),
    collecting: c('Trhejte jednotlivé listy a klasy, rostlinu nevytrhávejte. Sbírejte mimo cesty a ošetřované plochy.'),
    habitat: b('Louky, pastviny, trávníky, sešlapávaná místa a okraje cest; velmi hojný.', 'kubat-2002'),
    whenToCollect: c('Listy od jara, klasy od června do září, za sucha.'),
    identification: {
      parts: {
        cely: 'Vytrvalá bylina s přízemní růžicí listů a bezlistými stvoly zakončenými klasem.',
        list: 'Jitrocel kopinatý: úzké kopinaté listy s 3–7 souběžnými žilkami. Jitrocel větší: široce vejčité listy s výraznými žilkami a dlouhým řapíkem; při přetržení vyčnívají pevná „vlákna“ žilek.',
        kvet: 'Drobné nenápadné květy v hustém klasu, u kopinatého s nápadnými bělavými prašníky.',
        plod: 'Tobolky s drobnými hnědými semeny v klasu.',
      },
      lookalikes: [
        {
          name: 'Konvalinka vonná (listy)',
          slug: 'konvalinka',
          danger: 'Široké listy konvalinky mají souběžnou žilnatinu podobně jako jitrocel větší, ale vyrůstají po dvou z pochvy a rostou v lese. Konvalinka je jedovatá.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['kubat-2002'],
    review: DRAFT,
    visual: { kind: 'herb', color: '#4F7F3A', accent: '#8A6D3B' },
    photos: [],
    related: ['klasy-trav', 'pampeliska', 'ptacinec'],
    seo: {
      title: 'Jitrocel pro papoušky | LES.cz',
      description:
        'Jitrocel kopinatý a větší pro papoušky: listy a klasy se semeny. Kde ho sbírat, jak ho připravit a s čím ho nezaměnit.',
    },
  },
  {
    slug: 'kopriva',
    name: 'Kopřiva dvoudomá',
    synonyms: ['kopřiva', 'žahavka'],
    latin: 'Urtica dioica L.',
    family: 'Urticaceae – kopřivovité',
    category: 'bylinky-a-plane-rostliny',
    tagline: 'Zboží s ochranou proti krádeži. Doporučujeme rukavice.',
    months: [3, 4, 5, 6],
    shop: {
      price: 'ZDARMA',
      availability: 'SKLADEM (nejlepší kusy březen–červen)',
      warehouse: 'Příroda, oddělení vlhkých okrajů a pasek',
      shipping: 'Vlastní nohy + rukavice (nejsou součástí balení)',
      badge: 'Pálí to',
      buyMessage:
        'Objednávka přijata! Kopřivy jsou připraveny k vyzvednutí. Upozornění: zboží je vybaveno aktivní ochranou proti krádeži. Rukavice si přineste vlastní.',
    },
    safety: {
      level: 'stridme',
      summary:
        'Mladé vrcholky jsou výživná zeleň, ale čerstvé obsahují žahavé chlupy. Podávejte jen spařené nebo usušené, v malém množství.',
      provenance: 'C',
    },
    parts: c('Mladé vrcholky (horní 2–4 páry listů) před květem; usušená nať.'),
    nutrition: {
      summary: c('Bohatá na vápník a bílkoviny ve srovnání s běžnou listovou zeleninou; obsahuje karotenoidy a vlákninu.', 'usda-fdc'),
      values: [
        { label: 'Energie', amount: 42, unit: 'kcal' },
        { label: 'Bílkoviny', amount: 2.7, unit: 'g' },
        { label: 'Vláknina', amount: 6.9, unit: 'g' },
        { label: 'Vápník', amount: 481, unit: 'mg' },
      ],
      valuesBasis: 'USDA FoodData Central – stinging nettles, blanched (spařené listy kopřivy). Orientační hodnoty na 100 g.',
      valuesProvenance: 'C',
      valuesSourceIds: ['usda-fdc'],
    },
    benefits: c('Zdroj vápníku a minerálních látek; usušená nať je vhodná do zimních zásob zeleně.'),
    species: {
      mali: 'Střídmě – drobně nasekané spařené lístky nebo sušená drť.',
      stredni: 'Střídmě – spařené lístky, sušená nať.',
      velci: 'Střídmě – spařené vrcholky, sušená nať.',
      poznamka: 'Čerstvou nespařenou kopřivu nepodávejte.',
      provenance: 'C',
    },
    serving: c('Spařené a vychladlé lístky do zeleninové misky, nebo usušená drcená nať přimíchaná ke krmení.'),
    preparation: c(
      'Žahavé chlupy se deaktivují spařením horkou vodou (pak nechat vychladnout a okapat) nebo důkladným usušením ve stínu.',
    ),
    risks: list('C', [
      'Čerstvé žahavé chlupy dráždí sliznice.',
      'Kopřivy rostou na půdách bohatých na dusík – nesbírejte u hnojišť, polí a skládek.',
      'Starší, kvetoucí rostliny jsou tuhé a méně vhodné.',
    ]),
    collecting: c('Stříhejte jen mladé vrcholky v rukavicích, rostlinu ponechte – znovu obroste.'),
    habitat: b('Lužní lesy, vlhké okraje lesů, paseky, okolí sídel a vodních toků; hojná.', 'kubat-2002'),
    whenToCollect: c('Březen až červen před rozkvětem; k sušení za sucha a dopoledne.'),
    identification: {
      parts: {
        cely: 'Vytrvalá bylina 30–150 cm s čtyřhrannou lodyhou, celá pokrytá žahavými chlupy.',
        list: 'Vstřícné listy, vejčité až kopinaté, hrubě pilovité, s žahavými chlupy.',
        kvet: 'Drobné zelenavé květy v převislých latách v úžlabí listů; rostliny jsou dvoudomé.',
      },
      lookalikes: [
        {
          name: 'Hluchavky',
          latin: 'Lamium spp.',
          danger: 'Podobné listy, ale nežahají a mají nápadné pyskaté květy. Nejsou známy jako jedovaté, přesto bez určení nepodávejte.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['usda-fdc', 'kubat-2002'],
    review: DRAFT,
    visual: { kind: 'herb', color: '#3F6E35', accent: '#9BBF6A' },
    photos: [],
    related: ['pampeliska', 'ptacinec', 'jitrocel'],
    seo: {
      title: 'Kopřiva pro papoušky – jak ji připravit | LES.cz',
      description:
        'Může papoušek kopřivu? Jen spařenou nebo sušenou. Kdy kopřivy sbírat, jak deaktivovat žahavé chlupy a kolik jich podávat.',
    },
  },
  {
    slug: 'sedmikraska',
    name: 'Sedmikráska chudobka',
    synonyms: ['sedmikráska', 'chudobka'],
    latin: 'Bellis perennis L.',
    family: 'Asteraceae – hvězdnicovité',
    category: 'bylinky-a-plane-rostliny',
    tagline: 'Malá, ale šikovná. Ideální velikost pro malé zobáky.',
    months: [3, 4, 5, 6, 7, 8, 9, 10],
    shop: {
      price: 'ZDARMA',
      availability: 'SKLADEM (březen–říjen, za teplých zim i déle)',
      warehouse: 'Příroda, oddělení trávníků a pastvin',
      shipping: 'Vlastní nohy, sehnout se je nutné',
      buyMessage:
        'Objednávka přijata! Sedmikrásky jsou připraveny k vyzvednutí. Balení po jednom kuse, sehnout se musíte sami.',
    },
    safety: {
      level: 'stridme',
      summary:
        'Květy bývají v chovatelské praxi podávány jako drobné zpestření. Odborné podklady specificky pro papoušky jsou omezené – podávejte jen občas a v malém množství.',
      provenance: 'C',
    },
    parts: c('Květní úbory, v menší míře mladé listy.'),
    nutrition: {
      summary: c('Nízkoenergetická zeleň; obsahuje saponiny a hořčiny. Podrobné nutriční údaje nemáme k dispozici.'),
    },
    benefits: c('Drobné zpestření a příležitost k zabavení – květy lze trhat a rozebírat.'),
    species: {
      mali: 'Střídmě – několik květů jako zpestření.',
      stredni: 'Střídmě – několik květů.',
      velci: 'Střídmě – spíše jako hračka k rozebírání.',
      provenance: 'C',
    },
    serving: c('Několik čerstvých květů na misce nebo zapíchnutých do přírodní hračky.'),
    preparation: c('Opláchnout, osušit, podávat čerstvé.'),
    risks: list('C', [
      'Sběr z trávníků ošetřovaných herbicidy nebo hnojivy.',
      'Obsah saponinů – nepodávejte ve velkém množství.',
    ]),
    collecting: c('Trhejte jednotlivé květy z neošetřených trávníků a pastvin.'),
    habitat: b('Trávníky, pastviny, louky, okraje cest; velmi hojná.', 'kubat-2002'),
    whenToCollect: c('Od března do října, za sucha.'),
    identification: {
      parts: {
        cely: 'Drobná vytrvalá bylina (5–15 cm) s přízemní růžicí listů.',
        list: 'Lopatkovité, slabě vroubkované listy v přízemní růžici.',
        kvet: 'Úbor s bílými (často růžově lemovanými) jazykovitými květy a žlutým středem, na bezlistém stvolu.',
      },
      lookalikes: [
        {
          name: 'Heřmánky a rmeny',
          slug: 'hermanek',
          danger: 'Mají větvené olistěné lodyhy s jemně dělenými listy, ne přízemní růžici.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['kubat-2002'],
    review: DRAFT,
    visual: { kind: 'flower', color: '#F5F1E6', accent: '#E8C33A' },
    photos: [],
    related: ['pampeliska', 'hermanek', 'jetel'],
    seo: {
      title: 'Sedmikráska pro papoušky | LES.cz',
      description:
        'Může papoušek sedmikrásky? Ano, ale střídmě. Co o sedmikrásce víme, co je potřeba ověřit a jak ji podávat.',
    },
  },
  {
    slug: 'jetel',
    name: 'Jetel',
    synonyms: ['jetel luční', 'jetel plazivý', 'jetel bílý', 'čtyřlístek'],
    latin: 'Trifolium pratense L., Trifolium repens L.',
    family: 'Fabaceae – bobovité',
    category: 'bylinky-a-plane-rostliny',
    tagline: 'Čtyřlístky bez příplatku. Štěstí negarantujeme.',
    months: [5, 6, 7, 8, 9],
    shop: {
      price: 'ZDARMA',
      availability: 'SKLADEM (květen–září)',
      warehouse: 'Příroda, oddělení luk a pastvin',
      shipping: 'Vlastní nohy',
      buyMessage:
        'Objednávka přijata! Jetel je připraven k vyzvednutí. Pokud najdete čtyřlístek, jde o bonus zdarma – štěstí ale neposíláme ani to nereklamujeme.',
    },
    safety: {
      level: 'stridme',
      summary:
        'Květy se v praxi podávají jako zpestření, ale jen střídmě: jetel luční obsahuje isoflavony (rostlinné estrogeny) a některé formy jetele plazivého tvoří kyanogenní glykosidy.',
      provenance: 'C',
      sourceIds: ['cooper-johnson-1984'],
    },
    parts: c('Květní hlávky, v malém množství mladé lístky.'),
    nutrition: {
      summary: c('Bobovitá rostlina s vyšším obsahem bílkovin a vápníku než běžná zeleň. Konkrétní hodnoty pro planý jetel nemáme ověřené.'),
    },
    benefits: c('Zpestření; květní hlávky se dají rozebírat zobákem.'),
    species: {
      mali: 'Střídmě – jednotlivé květy občas.',
      stredni: 'Střídmě – několik květů občas.',
      velci: 'Střídmě – několik květů občas.',
      poznamka: 'Nepodávejte ve velkém množství ani dlouhodobě denně, zvláště chovným párům (isoflavony) – konzultujte s veterinářem.',
      provenance: 'C',
    },
    serving: c('Několik čerstvých květů jako zpestření, ne jako hlavní zeleň.'),
    preparation: c('Opláchnout, osušit, nepodávat zapařené nebo plesnivé.'),
    risks: list(
      'C',
      [
        'Jetel luční: isoflavony s estrogenním účinkem (známé z chovu hospodářských zvířat).',
        'Jetel plazivý: některé populace tvoří kyanogenní glykosidy.',
        'Zapařená nebo plesnivá píce může obsahovat mykotoxiny.',
      ],
      'cooper-johnson-1984',
      'frohne-pfander-2005',
    ),
    collecting: c('Trhejte jednotlivé květní hlávky na neošetřených loukách.'),
    habitat: b('Louky, pastviny, trávníky, okraje cest; běžný.', 'kubat-2002'),
    whenToCollect: c('Květen až září, za sucha.'),
    identification: {
      parts: {
        cely: 'Vytrvalé byliny; jetel plazivý s plazivými lodyhami, jetel luční s přímými lodyhami.',
        list: 'Trojčetné listy, lístky vejčité až eliptické, často se světlou kresbou.',
        kvet: 'Kulovité hlávky drobných motýlovitých květů – bílé (jetel plazivý) nebo růžovofialové (jetel luční).',
      },
      lookalikes: [
        {
          name: 'Šťavel kyselý',
          latin: 'Oxalis acetosella',
          danger: 'Trojčetné srdčité lístky, roste v lese. Obsahuje kyselinu šťavelovou – papouškům nepodávat.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['cooper-johnson-1984', 'frohne-pfander-2005', 'kubat-2002'],
    review: DRAFT,
    visual: { kind: 'flower', color: '#C56A9A', accent: '#4E8A3A' },
    photos: [],
    related: ['sedmikraska', 'pampeliska', 'klasy-trav'],
    seo: {
      title: 'Může papoušek jetel? | LES.cz',
      description:
        'Jetel pro papoušky jen střídmě: proč, kolik a na co si dát pozor (isoflavony, kyanogenní glykosidy). Čtyřlístky bez příplatku.',
    },
  },
  {
    slug: 'ptacinec',
    name: 'Ptačinec žabinec',
    synonyms: ['ptačinec', 'žabinec', 'ptačí zob'],
    latin: 'Stellaria media (L.) Vill.',
    family: 'Caryophyllaceae – hvozdíkovité',
    category: 'bylinky-a-plane-rostliny',
    tagline: 'Má to v názvu. Ptáci ho milují už od pradávna.',
    months: [3, 4, 5, 6, 7, 8, 9, 10, 11],
    shop: {
      price: 'ZDARMA',
      availability: 'SKLADEM skoro celý rok (mimo mrazy)',
      warehouse: 'Příroda, oddělení záhonů, rumišť a vlhkých okrajů',
      shipping: 'Vlastní nohy, nebo jen dojít na vlastní záhon',
      badge: 'Ptačí oblíbenec',
      buyMessage:
        'Objednávka přijata! Ptačinec je připraven k vyzvednutí – nejspíš i na vašem záhonu. Zahrádkáři ho nazývají plevel, my „zboží s rychlým obratem“.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Tradiční zelené krmivo pro klecové ptáky a papoušky. Rozhodující je správné určení – existuje záměna s jedovatou drchničkou rolní.',
      provenance: 'C',
    },
    parts: c('Celá kvetoucí i nekvetoucí nať (lodyhy, listy, květy, nezralé tobolky).'),
    nutrition: {
      summary: c('Šťavnatá jemná zeleň s vysokým obsahem vody; obsahuje minerální látky a vitamin C. Ověřené hodnoty nemáme k dispozici.'),
    },
    benefits: c('Jemná zeleň vhodná i pro malé druhy; svazečky natě nabízejí zábavu s trháním a probíráním.'),
    species: {
      mali: 'Vhodné – svazeček natě, oblíbené u andulek, korel a agapornisů.',
      stredni: 'Vhodné.',
      velci: 'Vhodné, spíše jako doplněk k jiné zelenině.',
      provenance: 'C',
    },
    serving: c('Čerstvý svazeček natě zavěšený v kleci nebo na misce; nespotřebovanou zeleň do večera odstraňte.'),
    preparation: c('Důkladně omýt, osušit. Ze záhonů jen tam, kde se nepoužívají chemické přípravky.'),
    risks: list('C', [
      'Záměna s jedovatou drchničkou rolní (Anagallis arvensis).',
      'Rychle vadne a zapařuje se – podávat čerstvý.',
      'Sběr z ošetřovaných záhonů a polí.',
    ]),
    collecting: c('Stříhejte vrcholové části natě, kořeny ponechte. Sbírejte jen tam, kde si jste jistí, že roste jen ptačinec.'),
    habitat: b('Zahrady, záhony, pole, rumiště, vlhké okraje lesů a cest; velmi hojný.', 'kubat-2002'),
    whenToCollect: c('Od jara do podzimu, za mírných zim i v zimě.'),
    identification: {
      parts: {
        cely: 'Nízká, poléhavá jednoletá bylina s křehkými, větvenými lodyhami.',
        vetev: 'Lodyha má jednu podélnou řadu chlupů, která se mezi uzlinami střídá ze strany na stranu.',
        list: 'Vstřícné vejčité listy, dolní řapíkaté, horní přisedlé.',
        kvet: 'Drobné bílé hvězdovité květy: 5 korunních plátků tak hluboce rozeklaných, že vypadají jako 10.',
      },
      lookalikes: [
        {
          name: 'Drchnička rolní',
          latin: 'Anagallis arvensis',
          danger: 'Jedovatá. Má čtyřhrannou lysou lodyhu bez řady chlupů, listy na rubu s tmavými tečkami a cihlově červené (vzácně modré) nerozeklané květy. Bez květů je záměna snadná – sbírejte jen s jistotou.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002', 'cooper-johnson-1984'],
    },
    sourceIds: ['kubat-2002', 'cooper-johnson-1984'],
    review: DRAFT,
    visual: { kind: 'herb', color: '#6FA346', accent: '#F5F1E6' },
    photos: [],
    related: ['pampeliska', 'jitrocel', 'kopriva'],
    seo: {
      title: 'Ptačinec žabinec pro papoušky | LES.cz',
      description:
        'Ptačinec – tradiční zelené krmivo pro papoušky. Jak ho poznat, s čím ho nezaměnit (drchnička rolní) a jak ho podávat.',
    },
  },
  {
    slug: 'hermanek',
    name: 'Heřmánek pravý',
    synonyms: ['heřmánek', 'heřmánek lékařský'],
    latin: 'Matricaria chamomilla L. (syn. M. recutita)',
    family: 'Asteraceae – hvězdnicovité',
    category: 'bylinky-a-plane-rostliny',
    tagline: 'Wellness oddělení lesa. Vůně v ceně.',
    months: [5, 6, 7, 8],
    shop: {
      price: 'ZDARMA',
      availability: 'SKLADEM (květen–srpen)',
      warehouse: 'Příroda, oddělení polních okrajů a úhorů',
      shipping: 'Vlastní nohy',
      buyMessage:
        'Objednávka přijata! Heřmánek je připraven k vyzvednutí na okraji pole. Prosíme, ověřte dutost lůžka – náš sklad bohužel obsahuje i padělky.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Květy heřmánku se v chovatelské praxi podávají čerstvé nebo sušené. Zásadní je odlišení od podobných rmenů a heřmánkovců.',
      provenance: 'C',
    },
    parts: c('Květní úbory (čerstvé nebo sušené).'),
    nutrition: {
      summary: c('Bylina s obsahem silice a flavonoidů; nutričně nevýznamná, podává se jako zpestření.'),
    },
    benefits: c('Zpestření a aromatická „hračka“. Případné léčebné využití (např. odvar) jen po konzultaci s veterinářem.'),
    species: {
      mali: 'Vhodné v malém množství – několik květů.',
      stredni: 'Vhodné v malém množství.',
      velci: 'Vhodné v malém množství.',
      provenance: 'C',
    },
    serving: c('Několik čerstvých nebo sušených květů na misce nebo v přírodní hračce.'),
    preparation: c('Čerstvé opláchnout a osušit; sušit ve stínu a skladovat v suchu (pozor na plíseň).'),
    risks: list('C', [
      'Záměna s rmeny (Anthemis) a heřmánkovcem nevonným.',
      'Roste na okrajích polí – riziko postřiků.',
      'Výjimečně alergické reakce známé u lidí.',
    ]),
    collecting: c('Trhejte jen květy, sbírejte daleko od ošetřovaných polí.'),
    habitat: b('Pole, úhory, okraje cest a rumiště, hlavně v teplejších oblastech.', 'kubat-2002'),
    whenToCollect: c('Květen až srpen, když jsou květy plně rozvité, za slunečného počasí.'),
    identification: {
      parts: {
        cely: 'Jednoletá, silně aromatická bylina 15–50 cm.',
        list: 'Jemně 2–3× peřenosečné listy s nitkovitými úkrojky.',
        kvet: 'Úbory s bílými jazykovitými a žlutými trubkovitými květy; lůžko úboru je kuželovité a DUTÉ (po podélném rozříznutí). Typická heřmánková vůně.',
      },
      lookalikes: [
        {
          name: 'Heřmánkovec nevonný',
          latin: 'Tripleurospermum inodorum',
          danger: 'Plné (ne duté) lůžko, chybí typická vůně. Není silně jedovatý, ale nejde o heřmánek.',
        },
        {
          name: 'Rmeny',
          latin: 'Anthemis spp.',
          danger: 'Plné lůžko s plevkami mezi květy, jiná vůně; rmen smrdutý zapáchá a dráždí. Nepodávat.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['kubat-2002'],
    review: DRAFT,
    visual: { kind: 'flower', color: '#FFFFFF', accent: '#E8C33A' },
    photos: [],
    related: ['sedmikraska', 'medunka', 'rebricek'],
    seo: {
      title: 'Heřmánek pro papoušky | LES.cz',
      description:
        'Heřmánek pravý pro papoušky: jak ho poznat podle dutého lůžka, s čím ho nezaměnit a jak ho podávat čerstvý i sušený.',
    },
  },
  {
    slug: 'medunka',
    name: 'Meduňka lékařská',
    synonyms: ['meduňka', 'citronová meduňka'],
    latin: 'Melissa officinalis L.',
    family: 'Lamiaceae – hluchavkovité',
    category: 'bylinky-a-plane-rostliny',
    tagline: 'Dovoz ze zahrady. V lese ji skladník marně hledá.',
    months: [5, 6, 7, 8, 9],
    shop: {
      price: 'ZDARMA (ze zahrady nebo truhlíku)',
      availability: 'SKLADEM U VÁS NA ZAHRADĚ (květen–září)',
      warehouse: 'Zahrada, oddělení bylinkových záhonů',
      shipping: 'Vlastní nohy, maximálně na konec zahrady',
      buyMessage:
        'Objednávka přijata! Meduňka v lese běžně neroste, takže tentokrát zboží vyzvedněte na vlastní zahradě. Lesní skladník si mezitím dává pauzu.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Kuchyňská a léčivá bylina, kterou chovatelé běžně podávají jako zpestření. Podávejte v malém množství, obsahuje silice.',
      provenance: 'C',
    },
    parts: c('Čerstvé nebo sušené listy a mladé vrcholky.'),
    nutrition: {
      summary: c('Aromatická bylina se silicí (citral, citronellal) a fenolovými kyselinami; nutričně nevýznamná.'),
    },
    benefits: c('Aromatické zpestření, materiál k trhání. Uklidňující účinky známé z humánní fytoterapie nejsou u papoušků ověřeny.'),
    species: {
      mali: 'Vhodné v malém množství – pár lístků.',
      stredni: 'Vhodné v malém množství.',
      velci: 'Vhodné v malém množství.',
      provenance: 'C',
    },
    serving: c('Několik lístků nebo vrcholek k trhání; sušené listy do přírodní hračky.'),
    preparation: c('Omýt, osušit. Kupované rostliny v květináčích mohou být ošetřené – nechte je několik týdnů dorůst nebo pěstujte ze semínek.'),
    risks: list('C', [
      'Rostliny z obchodu mohou obsahovat zbytky pesticidů.',
      'Silice – nepodávat ve velkém množství, nepoužívat koncentrovaný olej.',
    ]),
    collecting: c('Stříhejte vrcholky z vlastní neošetřené zahrady.'),
    habitat: b('Pěstovaná bylina, zplaňuje vzácně v teplých oblastech.', 'kubat-2002'),
    whenToCollect: c('Před květem a na začátku kvetení (květen–srpen).'),
    identification: {
      parts: {
        cely: 'Vytrvalá bylina 30–80 cm se čtyřhrannou lodyhou a výraznou citronovou vůní po rozemnutí.',
        list: 'Vstřícné vejčité, vroubkovaně pilovité listy s vrásčitou čepelí.',
        kvet: 'Drobné bělavé až nažloutlé pyskaté květy v úžlabí listů.',
      },
      lookalikes: [
        {
          name: 'Šanta kočičí a jiné hluchavkovité',
          latin: 'Nepeta cataria',
          danger: 'Podobný vzhled, jiná vůně. Při pochybnostech rozhodne citronová vůně a původ (vlastní záhon).',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['kubat-2002'],
    review: DRAFT,
    visual: { kind: 'herb', color: '#7DAA4A', accent: '#E9F0C8' },
    photos: [],
    related: ['mata', 'hermanek', 'pampeliska'],
    seo: {
      title: 'Meduňka pro papoušky | LES.cz',
      description:
        'Meduňka lékařská pro papoušky: z vlastní zahrady, v malém množství. Jak ji podávat a na co si dát pozor u kupovaných rostlin.',
    },
  },
  {
    slug: 'mata',
    name: 'Máta',
    synonyms: ['máta peprná', 'máta klasnatá', 'máta rolní', 'máta vodní'],
    latin: 'Mentha spp.',
    family: 'Lamiaceae – hluchavkovité',
    category: 'bylinky-a-plane-rostliny',
    tagline: 'Osvěžení k zobání. Žvýkačku nedodáváme.',
    months: [5, 6, 7, 8, 9],
    shop: {
      price: 'ZDARMA',
      availability: 'SKLADEM (květen–září, divoké druhy u vody)',
      warehouse: 'Příroda, oddělení potoků a vlhkých luk; zahrada',
      shipping: 'Vlastní nohy (gumáky doporučeny)',
      buyMessage:
        'Objednávka přijata! Máta je připravena k vyzvednutí u potoka nebo na zahradě. Dávkujte střídmě – i les má rád svěží dech s mírou.',
    },
    safety: {
      level: 'stridme',
      summary:
        'Lístky máty bývají podávány jako aromatické zpestření, ale obsahují silice (mentol, u některých druhů pulegon). Jen několik lístků občas.',
      provenance: 'C',
      sourceIds: ['frohne-pfander-2005'],
    },
    parts: c('Čerstvé lístky a mladé vrcholky; ne koncentrované oleje.'),
    nutrition: {
      summary: c('Aromatická bylina; v malém množství nutričně nevýznamná.', 'usda-fdc'),
      values: [
        { label: 'Energie', amount: 70, unit: 'kcal' },
        { label: 'Vláknina', amount: 8, unit: 'g' },
        { label: 'Vápník', amount: 243, unit: 'mg' },
        { label: 'Vitamin C', amount: 32, unit: 'mg' },
      ],
      valuesBasis: 'USDA FoodData Central – peppermint, fresh (máta peprná, čerstvá). Orientační hodnoty na 100 g.',
      valuesProvenance: 'C',
      valuesSourceIds: ['usda-fdc'],
    },
    benefits: c('Aromatické zpestření a materiál k trhání.'),
    species: {
      mali: 'Střídmě – 1 až 2 lístky občas.',
      stredni: 'Střídmě – několik lístků občas.',
      velci: 'Střídmě – několik lístků občas.',
      provenance: 'C',
    },
    serving: c('Několik čerstvých lístků jako zpestření, ne denně.'),
    preparation: c('Omýt, osušit. Nikdy nepoužívejte mátové oleje, bonbony ani čaje s přísadami.'),
    risks: list(
      'C',
      [
        'Silice – ve větším množství dráždí trávicí trakt.',
        'Máta polej (Mentha pulegium) obsahuje pulegon, který je toxický – nepodávat.',
        'Koncentrované mátové oleje a výrobky pro lidi jsou nevhodné.',
      ],
      'frohne-pfander-2005',
    ),
    collecting: c('Stříhejte vrcholky z čistých míst, u potoků mimo zemědělsky obhospodařované plochy.'),
    habitat: b('Vlhké louky, břehy potoků a příkopy (máta vodní, rolní, dlouholistá); máta peprná se pěstuje.', 'kubat-2002'),
    whenToCollect: c('Před květem a na začátku kvetení.'),
    identification: {
      parts: {
        cely: 'Vytrvalé byliny se čtyřhrannou lodyhou a výraznou mátovou vůní po rozemnutí.',
        list: 'Vstřícné, vejčité až kopinaté pilovité listy.',
        kvet: 'Drobné růžovofialové květy v lichopřeslenech nebo klasech.',
      },
      lookalikes: [
        {
          name: 'Máta polej',
          latin: 'Mentha pulegium',
          danger: 'Drobnější listy, květy v oddálených lichopřeslenech. Obsahuje toxický pulegon – nepodávat.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002', 'frohne-pfander-2005'],
    },
    sourceIds: ['usda-fdc', 'kubat-2002', 'frohne-pfander-2005'],
    review: DRAFT,
    visual: { kind: 'herb', color: '#3E9B6B', accent: '#B9E2C4' },
    photos: [],
    related: ['medunka', 'hermanek'],
    seo: {
      title: 'Může papoušek mátu? | LES.cz',
      description:
        'Máta pro papoušky jen střídmě: proč, kolik lístků a kterým druhům máty (máta polej) se vyhnout. Žádné mátové oleje.',
    },
  },
  {
    slug: 'rebricek',
    name: 'Řebříček obecný',
    synonyms: ['řebříček', 'krvavník'],
    latin: 'Achillea millefolium agg.',
    family: 'Asteraceae – hvězdnicovité',
    category: 'bylinky-a-plane-rostliny',
    tagline: 'Tisíc lístků v jednom balení. Počítat je nemusíte.',
    months: [6, 7, 8, 9],
    shop: {
      price: 'ZDARMA',
      availability: 'SKLADEM (červen–září)',
      warehouse: 'Příroda, oddělení suchých luk a mezí',
      shipping: 'Vlastní nohy',
      buyMessage:
        'Objednávka přijata! Řebříček je připraven k vyzvednutí na mezi. Upozornění: dávkování „tisíc lístků denně“ je jen marketing, skutečná porce je mnohem menší.',
    },
    safety: {
      level: 'stridme',
      summary:
        'Bývá podáván jako bylinkové zpestření, ale obsahuje silice (v malém množství i thujon). Jen malé množství občas; u chovných a nemocných ptáků se poraďte s veterinářem.',
      provenance: 'C',
      sourceIds: ['frohne-pfander-2005'],
    },
    parts: c('Mladé lístky a květy v malém množství.'),
    nutrition: {
      summary: c('Aromatická bylina se silicí, hořčinami a flavonoidy; nutričně nevýznamná.'),
    },
    benefits: c('Zpestření, jemně dělené listy jsou zajímavé k probírání.'),
    species: {
      mali: 'Střídmě – jen pár lístků občas.',
      stredni: 'Střídmě.',
      velci: 'Střídmě.',
      provenance: 'C',
    },
    serving: c('Malé množství čerstvé nebo sušené natě jako zpestření, ne denně.'),
    preparation: c('Opláchnout, osušit; sušit ve stínu.'),
    risks: list(
      'C',
      [
        'Silice včetně malého množství thujonu – nepodávat ve větším množství ani dlouhodobě.',
        'Záměna s jedovatými miříkovitými rostlinami (okolíkovité květenství) – zejména s bolehlavem.',
      ],
      'frohne-pfander-2005',
    ),
    collecting: c('Stříhejte vrcholky z čistých luk a mezí.'),
    habitat: b('Louky, pastviny, meze, okraje cest; velmi hojný.', 'kubat-2002'),
    whenToCollect: c('Červen až září, za sucha.'),
    identification: {
      parts: {
        cely: 'Vytrvalá aromatická bylina 20–60 cm.',
        list: 'Listy 2–3× peřenosečné, velmi jemně dělené (připomínají pírko), aromatické.',
        kvet: 'Drobné úbory (bílé až růžové) nahloučené v ploché chocholičnaté latě. Nejde o okolík – každý „kvítek“ je malý úbor s 5 jazykovitými květy.',
      },
      lookalikes: [
        {
          name: 'Bolehlav plamatý a další jedovaté miříkovité',
          slug: 'bolehlav-plamaty',
          danger: 'Smrtelně jedovatý. Má okolíky a dutou, často červeně skvrnitou lodyhu, listy nejsou „pérovité“ jako u řebříčku. Při jakékoli pochybnosti nesbírat.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002', 'cooper-johnson-1984'],
    },
    sourceIds: ['kubat-2002', 'frohne-pfander-2005', 'cooper-johnson-1984'],
    review: DRAFT,
    visual: { kind: 'flower', color: '#EFE8DA', accent: '#5E8C3E' },
    photos: [],
    related: ['hermanek', 'sedmikraska'],
    seo: {
      title: 'Řebříček pro papoušky – jen střídmě | LES.cz',
      description:
        'Řebříček obecný pro papoušky: proč jen v malém množství, jak ho poznat a proč si dát pozor na záměnu s bolehlavem.',
    },
  },
  {
    slug: 'ostropestrec',
    name: 'Ostropestřec mariánský',
    synonyms: ['ostropestřec', 'pestřec mariánský', 'semínka ostropestřce'],
    latin: 'Silybum marianum (L.) Gaertn.',
    family: 'Asteraceae – hvězdnicovité',
    category: 'bylinky-a-plane-rostliny',
    tagline: 'Kubíčkova volba. Bodlinatý obal, ceněný obsah.',
    months: [8, 9],
    shop: {
      price: 'ZDARMA (pokud ho pěstujete)',
      availability: 'V LESE NENÍ SKLADEM – zahradní a polní kultura',
      warehouse: 'Zahrada nebo pole, oddělení bodláků',
      shipping: 'Vlastní nohy + kožené rukavice',
      badge: 'Z ExoMixu',
      buyMessage:
        'Objednávka přijata! Ostropestřec v lese bohužel nevedeme, náš skladník ho hledal tři dny a vrátil se jen s píchanci. Zkuste vlastní záhon – a o množství se poraďte s veterinářem.',
    },
    safety: {
      level: 'stridme',
      summary:
        'ExoMix používá ostropestřec jako limitovanou složku směsí (semena) a ostropestřecový olej v premixech. Množství a případné podávání při onemocnění jater určuje veterinář.',
      provenance: 'A',
      sourceIds: ['exomix'],
    },
    parts: a('Semena (nažky) – v ExoMixu jako „ostropestřec (limitovaný)“; olej ze semen jako součást premixů.'),
    nutrition: {
      summary: a(
        'Ostropestřecový olej je v databázi ExoMixu (premix.json) veden s obsahem tuku 99 % a omega-6 mastných kyselin 40 % a energetickou hodnotou 900 (jednotka v datech ExoMixu neuvedena, odpovídá kcal/100 g). Semena jsou tučná – proto limit v receptuře.',
      ),
    },
    benefits: c(
      'Ostropestřec je znám obsahem silymarinu, který se v humánní i veterinární medicíně zkoumá pro podporu jater. U papoušků není účinek ověřen – konzultujte veterináře, nenasazujte svépomocí.',
    ),
    species: {
      mali: 'Jen jako limitovaná složka směsi podle doporučení veterináře.',
      stredni: 'Jen jako limitovaná složka směsi podle doporučení veterináře.',
      velci: 'Jen jako limitovaná složka směsi podle doporučení veterináře.',
      poznamka:
        'ExoMix u druhů citlivých na tuk (např. agapornis růžohrdlý, papoušek nádherný) upozorňuje na přebytek tuku. Režim „hepatopatie“ v ExoMixu počítá s tukem 3–6 % a vlákninou 8–14 % ve směsi.',
      provenance: 'A',
      sourceIds: ['exomix'],
    },
    serving: a('Jako malá, limitovaná součást semenné směsi (v ukázkových etiketách ExoMixu „ostropestřec (limit)“).'),
    preparation: c('Semena jen čistá, suchá, bez plísně a zatuchlého zápachu; skladovat v suchu a chladu. Olej jen čerstvý, ne žluklý.'),
    risks: list('C', [
      'Vysoký obsah tuku v semenech a oleji – riziko přetučnění směsi.',
      'Plesnivá nebo žluklá semena a olej – nepoužívat.',
      'Podpora jater není náhradou léčby – u podezření na onemocnění jater vždy veterinář.',
    ]),
    collecting: c('V přírodě ČR roste jen vzácně jako zplanělá rostlina. Semena sbírejte z vlastní pěstované rostliny nebo použijte kontrolované krmivo.'),
    habitat: b('Pěstovaná léčivá rostlina, příležitostně zplaňuje na rumištích v teplých oblastech.', 'kubat-2002'),
    whenToCollect: c('Zralé úbory koncem léta (srpen–září), za sucha.'),
    identification: {
      parts: {
        cely: 'Statná dvouletá až jednoletá bylina až 150 cm, celá ostnitá.',
        list: 'Velké lesklé listy s bílou mramorovou kresbou podél žilek, okraje s ostny.',
        kvet: 'Velké purpurové úbory obklopené trnitými zákrovními listeny.',
        plod: 'Lesklé hnědočerné až skvrnité nažky s bílým chmýrem.',
      },
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    exomix: [
      'Ukázkové etikety ExoMixu uvádějí složku „ostropestřec (limitovaný)“ / „ostropestřec (limit)“.',
      'Databáze premixů ExoMixu (premix.json) obsahuje „Ostropestřecový olej“: tuk 99 %, omega-3 0,1 %, omega-6 40 %, energie 900.',
      'Rádce Kubíček v ExoMixu: „Na játra bych ti tam hodil ostropestřec, co ty na to?“',
      'Režim „hepatopatie“ v ExoMixu: tuk 3–6 %, vláknina 8–14 %, omega-3 0,8–2,5 %; poznámka „podpora jater – ostropestřec, omega 3“.',
    ],
    sourceIds: ['exomix', 'kubat-2002'],
    review: DRAFT,
    visual: { kind: 'flower', color: '#8E4FA0', accent: '#7FA35A' },
    photos: [],
    related: ['pampeliska', 'cekanka'],
    seo: {
      title: 'Ostropestřec pro papoušky – jak s ním | LES.cz',
      description:
        'Ostropestřec mariánský v krmení papoušků: jak ho používá ExoMix, proč je limitovaný a proč podporu jater řešit s veterinářem.',
    },
  },
  {
    slug: 'cekanka',
    name: 'Čekanka obecná',
    synonyms: ['čekanka', 'planá čekanka'],
    latin: 'Cichorium intybus L.',
    family: 'Asteraceae – hvězdnicovité',
    category: 'bylinky-a-plane-rostliny',
    tagline: 'Modrá jako obloha. Čeká u cesty, ale vy ji trhejte kus dál.',
    months: [4, 5, 6, 7, 8, 9],
    shop: {
      price: 'ZDARMA',
      availability: 'SKLADEM (listy jaro, květy červenec–září)',
      warehouse: 'Příroda, oddělení mezí a suchých strání',
      shipping: 'Vlastní nohy',
      buyMessage:
        'Objednávka přijata! Čekanka je připravena k vyzvednutí. Jak už název napovídá, počká – ale jen do poledne, pak zavírá květy.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Listy čekanky (a příbuzné listové saláty z čekanky) jsou běžně uváděnou zelení pro papoušky. Podmínkou je sběr z čistého místa.',
      provenance: 'C',
    },
    parts: c('Mladé listy z přízemní růžice, květy.'),
    nutrition: {
      summary: c('Listová zeleň s vápníkem, provitaminem A a vitaminem K, s hořčinami (laktucin, intybin).', 'usda-fdc'),
      values: [
        { label: 'Energie', amount: 23, unit: 'kcal' },
        { label: 'Voda', amount: 92, unit: 'g' },
        { label: 'Vláknina', amount: 4, unit: 'g' },
        { label: 'Vápník', amount: 100, unit: 'mg' },
        { label: 'Fosfor', amount: 47, unit: 'mg' },
        { label: 'Vitamin C', amount: 24, unit: 'mg' },
      ],
      valuesBasis: 'USDA FoodData Central – chicory greens, raw (listy čekanky, syrové). Orientační hodnoty na 100 g.',
      valuesProvenance: 'C',
      valuesSourceIds: ['usda-fdc'],
    },
    benefits: c('Zeleň s příznivým poměrem vápníku a fosforu, vhodná k trhání.'),
    species: {
      mali: 'Vhodné – kousky listů a květy.',
      stredni: 'Vhodné.',
      velci: 'Vhodné.',
      provenance: 'C',
    },
    serving: c('Čerstvé omyté listy samostatně nebo v zeleninové misce; květy jako zpestření.'),
    preparation: c('Omýt, osušit. Nepodávat zvadlé listy.'),
    risks: list('C', [
      'Roste často u cest – sbírejte dál od provozu.',
      'Hořčiny – zavádějte postupně.',
    ]),
    collecting: c('Trhejte jednotlivé listy z růžice, rostlinu nevytrhávejte.'),
    habitat: b('Meze, okraje cest, suché stráně a pastviny, hlavně v teplejších oblastech.', 'kubat-2002'),
    whenToCollect: c('Listy duben–červen, květy červenec–září (otevřené dopoledne).'),
    identification: {
      parts: {
        cely: 'Vytrvalá bylina 30–120 cm s tuhými, rozkladitě větvenými lodyhami; roní mléko.',
        list: 'Přízemní listy peřenolaločné (podobné pampelišce), lodyžní menší a objímavé.',
        kvet: 'Světle modré úbory jen z jazykovitých květů, přisedlé na lodyze; otevřené hlavně dopoledne.',
      },
      lookalikes: [
        {
          name: 'Pampeliška (listy)',
          slug: 'pampeliska',
          danger: 'Neškodná záměna – růžice listů jsou podobné. Čekanka se pozná podle větvené lodyhy a modrých květů.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['usda-fdc', 'kubat-2002'],
    review: DRAFT,
    visual: { kind: 'flower', color: '#6A8FD6', accent: '#5E8C3E' },
    photos: [],
    related: ['pampeliska', 'jitrocel'],
    seo: {
      title: 'Čekanka pro papoušky | LES.cz',
      description:
        'Čekanka obecná pro papoušky: listy i modré květy. Nutriční charakteristika, příprava a jak ji poznat na mezi.',
    },
  },
  {
    slug: 'lipovy-kvet',
    name: 'Lipový květ',
    synonyms: ['lípa květ', 'lipový čaj', 'květ lípy'],
    latin: 'Tilia cordata Mill., Tilia platyphyllos Scop.',
    family: 'Malvaceae – slézovité (dříve Tiliaceae – lipovité)',
    category: 'bylinky-a-plane-rostliny',
    tagline: 'Letní parfém české krajiny. Balení s křidélkem.',
    months: [6, 7],
    shop: {
      price: 'ZDARMA',
      availability: 'JEN KRÁTCE SKLADEM (červen–červenec)',
      warehouse: 'Příroda, oddělení alejí a lesních okrajů',
      shipping: 'Vlastní nohy + nízká větev (žebřík nepůjčujeme)',
      badge: 'Limitka',
      buyMessage:
        'Objednávka přijata! Lipový květ je připraven k vyzvednutí. Pozor, akce trvá jen pár týdnů v roce – pak lípa vyhlásí inventuru a květy stáhne z prodeje.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Lípa (dřevo, listy i květy) bývá uváděna mezi bezpečné stromy pro papoušky. Květy podávejte čerstvé nebo usušené, v rozumném množství.',
      provenance: 'C',
    },
    parts: c('Květenství s listenem („křidélkem“), čerstvé nebo sušené.'),
    nutrition: {
      summary: c('Obsahuje sliz, flavonoidy a malé množství silice; nutričně nevýznamné, podává se jako zpestření.'),
    },
    benefits: c('Zpestření a zábava – květenství s listenem se dá rozebírat; sušené květy jsou vhodné do zimních hraček.'),
    species: {
      mali: 'Vhodné v malém množství.',
      stredni: 'Vhodné v malém množství.',
      velci: 'Vhodné; větvičky s květy i k okusování.',
      provenance: 'C',
    },
    serving: c('Čerstvá květenství zavěšená v kleci nebo sušená v přírodní hračce.'),
    preparation: c('Opláchnout, osušit; sušit ve stínu v tenké vrstvě, skladovat v papírovém sáčku v suchu.'),
    risks: list('C', [
      'Lípy v alejích u silnic – prach a emise.',
      'Medovice a zbytky po mšicích na listech – sbírejte čisté květy.',
      'Plesnivé sušené květy nepodávat.',
    ]),
    collecting: c('Stříhejte jen dosažitelné květy, větve nelámejte. Na cizích stromech jen se souhlasem vlastníka.', 'zakon-lesni'),
    habitat: b('Listnaté a smíšené lesy, aleje, parky, návsi.', 'kubat-2002'),
    whenToCollect: c('Lípa velkolistá kvete zhruba v červnu, srdčitá o něco později (konec června–červenec); sbírejte v plném květu za sucha.'),
    identification: {
      parts: {
        cely: 'Mohutný listnatý strom se široce vejčitou korunou.',
        list: 'Srdčité, pilovité listy; lípa srdčitá má na rubu rezavé chomáčky chlupů v úžlabí žilek, velkolistá bělavé chlupy.',
        kvet: 'Nažloutlé vonné květy ve vrcholících, stopka květenství srostlá s blanitým jazykovitým listenem.',
        plod: 'Kulovité oříšky na listenu („vrtulka“).',
      },
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'flower', color: '#E9D97A', accent: '#8FB35A' },
    photos: [],
    related: ['lipa', 'hermanek', 'pupeny'],
    seo: {
      title: 'Lipový květ pro papoušky | LES.cz',
      description:
        'Lipový květ pro papoušky: kdy ho sbírat, jak ho usušit a jak ho podávat. Krátká letní akce z oddělení alejí.',
    },
  },
];
