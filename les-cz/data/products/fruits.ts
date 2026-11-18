import type { Product } from '@/lib/types';
import { a, b, c, DRAFT, list } from '../helpers';

/**
 * A. LESNÍ OVOCE
 * Vzorový (kanonický) produkt: lesní jahody. Ostatní produkty dodržují stejnou strukturu.
 */
export const FRUITS: Product[] = [
  {
    slug: 'lesni-jahody',
    name: 'Lesní jahody',
    synonyms: ['jahodník obecný', 'jahody', 'lesní jahůdky'],
    latin: 'Fragaria vesca L.',
    family: 'Rosaceae – růžovité',
    category: 'lesni-ovoce',
    tagline: 'Limitovaná edice. Každá jahoda je ručně dozrálá sluncem.',
    months: [6, 7, 8],
    shop: {
      price: 'ZDARMA',
      availability: 'NASKLADNĚNO V LESE (červen–srpen)',
      warehouse: 'Příroda, oddělení lesních mýtin a pasek',
      shipping: 'Vlastní nohy',
      badge: 'Hit léta',
      buyMessage:
        'Vaše jahody jsou připraveny k vyzvednutí. Vezměte si pohodlnou obuv, košík a vyrazte do nejbližšího lesa. Náš kurýr je momentálně strom a nikam nejede.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Zralé plody jsou v chovatelské praxi i literatuře o výživě ptáků uváděny jako vhodné ovoce. Jde o ovoce s cukry – podávejte jako pamlsek, ne jako základ krmné dávky.',
      provenance: 'B',
      sourceIds: ['harrison-lightfoot-2006'],
    },
    parts: b('Zralé plody (červené, měkké). Mladé listy lze podat v malém množství jako zeleň.', 'harrison-lightfoot-2006'),
    nutrition: {
      summary: c(
        'Vodnaté ovoce s nízkou energetickou hodnotou, zdroj vitaminu C, vlákniny a polyfenolů. Obsahuje cukry (fruktóza, glukóza).',
        'usda-fdc',
      ),
      values: [
        { label: 'Energie', amount: 32, unit: 'kcal' },
        { label: 'Voda', amount: 91, unit: 'g' },
        { label: 'Vláknina', amount: 2, unit: 'g' },
        { label: 'Cukry', amount: 4.9, unit: 'g' },
        { label: 'Vitamin C', amount: 59, unit: 'mg' },
        { label: 'Vápník', amount: 16, unit: 'mg' },
      ],
      valuesBasis: 'USDA FoodData Central – jahody, syrové (pěstovaná jahoda Fragaria × ananassa, ne lesní jahodník). Orientační hodnoty na 100 g.',
      valuesProvenance: 'C',
      valuesSourceIds: ['usda-fdc'],
    },
    benefits: c(
      'Pestrost v krmné dávce, vitamin C a polyfenoly, silná motivace k hledání potravy (foraging) – drobné plody se dají schovat do přírodních hraček.',
    ),
    species: {
      mali: 'Vhodné jako občasný pamlsek – 1 až 2 plody.',
      stredni: 'Vhodné jako pamlsek – několik plodů.',
      velci: 'Vhodné jako pamlsek, ideálně v kombinaci se zeleninou.',
      poznamka:
        'Množství je orientační a vychází z obecného pravidla, že ovoce tvoří jen menší část krmné dávky. U ptáků s nadváhou nebo s onemocněním jater nejdřív konzultujte veterináře.',
      provenance: 'C',
    },
    serving: c('Celé čerstvé plody, podávejte zvlášť od zrnin. Nespotřebované zbytky po několika hodinách odstraňte.'),
    preparation: b(
      'Plody důkladně omyjte pitnou vodou. Nesbírejte plody u cest a na místech, kde se pohybují psi a lišky – plody mohou být znečištěné trusem (riziko parazitů pro člověka i zvíře).',
      'harrison-lightfoot-2006',
    ),
    risks: list(
      'C',
      [
        'Cukry – při nadměrném podávání přispívají k obezitě.',
        'Rychle plesniví – nepodávejte měkké, nahnilé nebo plesnivé plody.',
        'Znečištění trusem divokých zvířat – vždy omýt.',
        'Záměna s rostlinami s červenými plody, které nejsou jahody (viz možné záměny).',
      ],
    ),
    collecting: b(
      'Lesní plody smí každý sbírat pro vlastní potřebu (lesní zákon, § 19), ale způsobem, který les nepoškozuje. Trhejte jen zralé plody, rostlinu nevytrhávejte.',
      'zakon-lesni',
    ),
    habitat: b('Paseky, lesní okraje, světliny, meze a prosluněné stráně, od nížin po hory.', 'kubat-2002'),
    whenToCollect: c('Červen až srpen, za sucha, nejlépe dopoledne po oschnutí rosy.'),
    identification: {
      parts: {
        cely: 'Nízká vytrvalá bylina (5–25 cm) s nadzemními šlahouny.',
        list: 'Trojčetný list, lístky vejčité, hrubě pilovité, na rubu hedvábitě chlupaté.',
        kvet: 'Bílé pětičetné květy, duben–červen.',
        plod: 'Drobné červené „jahody“ – nažky (semínka) jsou na povrchu dužnatého květního lůžka.',
      },
      lookalikes: [
        {
          name: 'Mochna jahodovitá',
          latin: 'Potentilla sterilis',
          danger: 'Nejedovatá, ale nemá dužnaté plody – záměna jen při sběru listů.',
        },
        {
          name: 'Jedovaté rostliny s červenými bobulemi (např. lilek potměchuť, lýkovec jedovatý)',
          slug: 'lilek-potmechut',
          danger: 'Mají bobule, ne „jahodu“ se semínky na povrchu. Sbírejte jen to, co bezpečně poznáte.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['harrison-lightfoot-2006', 'usda-fdc', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'berry', color: '#C8323C', accent: '#3E7B3A' },
    photos: [],
    related: ['maliny', 'boruvky', 'ostruziny'],
    seo: {
      title: 'Může papoušek lesní jahody? | LES.cz',
      description:
        'Lesní jahody pro papoušky: kdy je sbírat, jak je připravit, kolik jich podávat a s čím je nezaměnit. Zdarma, doprava vlastníma nohama.',
    },
  },

  // ---------------------------------------------------------------- BORŮVKY
  {
    slug: 'boruvky',
    name: 'Borůvky',
    synonyms: ['brusnice borůvka', 'černé jahody', 'černice', 'borůvka lesní'],
    latin: 'Vaccinium myrtillus L.',
    family: 'Ericaceae – vřesovcovité',
    category: 'lesni-ovoce',
    tagline: 'Modrá je letos v kurzu. Hlavně na zobáčku a v trusu.',
    months: [7, 8],
    shop: {
      price: 'ZDARMA',
      availability: 'MOMENTÁLNĚ VYPRODÁNO – lesní dodavatel nestíhá (naskladnění červenec–srpen)',
      warehouse: 'Příroda, oddělení jehličnatých a smíšených lesů, regál „kyselá půda“',
      shipping: 'Vlastní nohy, záda ohnutá do pravého úhlu',
      badge: 'Bestseller',
      buyMessage:
        'Objednávka přijata! Borůvky čekají v lese pod smrky. Upozorňujeme, že po konzumaci může mít papoušek modrý trus i zobák – nejde o reklamaci, ale o vlastnost zboží. Fialové prsty sběrače jsou v ceně.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Zralé plody jsou v literatuře o výživě ptáků i v chovatelské praxi uváděny mezi vhodným ovocem. Obsahují cukry, proto patří do kategorie pamlsků, ne do základu krmné dávky.',
      provenance: 'B',
      sourceIds: ['harrison-lightfoot-2006'],
    },
    parts: b('Zralé modročerné plody. Listy a nať nepodávejte – pro papoušky k nim chybí podklady.', 'harrison-lightfoot-2006'),
    nutrition: {
      summary: c(
        'Ovoce bohaté na antokyany (modrofialová barviva) a další polyfenoly, se střední energetickou hodnotou a obsahem cukrů. Borůvka lesní má na rozdíl od kanadské borůvky tmavou dužninu a vyšší obsah barviv.',
        'usda-fdc',
      ),
      values: [
        { label: 'Energie', amount: 57, unit: 'kcal' },
        { label: 'Voda', amount: 84, unit: 'g' },
        { label: 'Vláknina', amount: 2.4, unit: 'g' },
        { label: 'Cukry', amount: 10, unit: 'g' },
        { label: 'Vitamin C', amount: 9.7, unit: 'mg' },
        { label: 'Vápník', amount: 6, unit: 'mg' },
      ],
      valuesBasis:
        'USDA FoodData Central – borůvky, syrové (pěstovaná kanadská borůvka Vaccinium corymbosum, ne lesní borůvka). Orientační hodnoty na 100 g.',
      valuesProvenance: 'C',
      valuesSourceIds: ['usda-fdc'],
    },
    benefits: c(
      'Zpestření krmné dávky, zdroj polyfenolů. Drobné plody jsou ideální odměna při tréninku a k ukrývání do přírodních hraček.',
    ),
    species: {
      mali: 'Občasný pamlsek – 1 až 3 bobule.',
      stredni: 'Pamlsek – malá hrst bobulí několikrát týdně.',
      velci: 'Pamlsek – hrst bobulí, ideálně spolu se zeleninou.',
      poznamka:
        'Množství je orientační. Po borůvkách bývá trus modrofialově zbarvený – to je běžné, nezaměňujte to ale s krví nebo s neobvyklou barvou trusu, která trvá i po vysazení borůvek.',
      provenance: 'C',
    },
    serving: c('Čerstvé celé bobule zvlášť od zrnin, případně rozmražené (zamražené v sezóně). Zbytky po několika hodinách odstraňte.'),
    preparation: b(
      'Bobule přeberte, odstraňte lístky, nezralé a plesnivé plody a důkladně je omyjte pitnou vodou. Nesbírejte u cest a v místech s výskytem psů a lišek (znečištění trusem).',
      'harrison-lightfoot-2006',
    ),
    risks: list('C', [
      'Cukry – při nadměrném podávání přispívají k obezitě.',
      'Silně barví – zbarvení trusu je neškodné, ale může zmást při hodnocení zdravotního stavu.',
      'Rychle plesniví – podávejte jen čerstvé nebo správně zamražené plody.',
      'Záměna s jedovatými černými bobulemi (rulík zlomocný, vraní oko čtyřlisté) nebo s vlochyní bahenní.',
    ]),
    collecting: b(
      'Lesní plody smí každý sbírat pro vlastní potřebu (lesní zákon, § 19). Používání česáků může keříky poškodit – šetrnější je ruční sběr. Keříky nevytrhávejte.',
      'zakon-lesni',
    ),
    habitat: b(
      'Kyselé půdy ve smrkových, borových a smíšených lesích, na pasekách, vřesovištích a v horách, kde často tvoří souvislé porosty.',
      'kubat-2002',
    ),
    whenToCollect: c('Červenec až srpen (na horách i do září). Sbírejte za sucha zcela vybarvené, měkké plody.'),
    identification: {
      parts: {
        cely: 'Opadavý keřík vysoký 15–50 cm se zelenými, hranatými větvičkami.',
        list: 'Drobné vejčité listy, jemně pilovité, světle zelené, na podzim opadávají.',
        kvet: 'Drobné baňkovité květy, zelenavě narůžovělé, jednotlivě v paždí listů (květen–červen).',
        plod: 'Modročerná ojíněná bobule s tmavě fialovou dužninou, která silně barví. Na vrcholu má korunku (zbytek kalicha).',
      },
      lookalikes: [
        {
          name: 'Rulík zlomocný',
          latin: 'Atropa bella-donna',
          slug: 'rulik-zlomocny',
          danger:
            'Velmi jedovatý. Bylina vysoká 0,5–1,5 m (ne keřík), lesklé černé bobule velikosti třešně s výrazným zeleným hvězdicovitým kalichem.',
        },
        {
          name: 'Vraní oko čtyřlisté',
          latin: 'Paris quadrifolia',
          slug: 'vrani-oko',
          danger: 'Jedovaté. Jediná modročerná bobule nad přeslenem čtyř listů na lodyze.',
        },
        {
          name: 'Vlochyně bahenní',
          latin: 'Vaccinium uliginosum',
          danger:
            'Modré bobule se SVĚTLOU dužninou, šedozelené celokrajné listy, roste na rašeliništích. Ve větším množství způsobuje u lidí nevolnost – nesbírat.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['harrison-lightfoot-2006', 'usda-fdc', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'berry', color: '#2E3A6B', accent: '#4F7A3A' },
    photos: [],
    related: ['lesni-jahody', 'maliny', 'brusinky'],
    seo: {
      title: 'Může papoušek borůvky? | LES.cz',
      description:
        'Lesní borůvky pro papoušky: kolik podávat, proč je trus modrý, jak je sbírat a s jakými jedovatými bobulemi si je nesplést.',
    },
  },

  // ---------------------------------------------------------------- MALINY
  {
    slug: 'maliny',
    name: 'Maliny',
    synonyms: ['maliník obecný', 'malina'],
    latin: 'Rubus idaeus L.',
    family: 'Rosaceae – růžovité',
    category: 'lesni-ovoce',
    tagline: 'Duté uvnitř, plné uvnitř papouška.',
    months: [7, 8],
    shop: {
      price: 'ZDARMA',
      availability: 'NASKLADNĚNO NA PASEKÁCH (červenec–srpen)',
      warehouse: 'Příroda, oddělení pasek a lesních okrajů, regál „pozor, píchá“',
      shipping: 'Vlastní nohy, dlouhé rukávy doporučeny',
      badge: 'Oblíbené',
      buyMessage:
        'Objednávka přijata! Maliny jsou připraveny k vyzvednutí na nejbližší pasece. Balné neúčtujeme – košík si přineste vlastní. Případné škrábance od maliníku nejsou vadou zboží.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Zralé plody jsou v literatuře i chovatelské praxi uváděny jako vhodné ovoce pro papoušky. Jako u každého ovoce platí střídmost kvůli cukrům.',
      provenance: 'B',
      sourceIds: ['harrison-lightfoot-2006'],
    },
    parts: c(
      'Zralé plody. Mladé listy maliníku se v chovatelské praxi podávají jako zeleň, pro papoušky k nim ale chybí odborné podklady – jen v malém množství.',
    ),
    nutrition: {
      summary: c(
        'Ovoce s nízkým obsahem cukrů a vysokým obsahem vlákniny (drobná semena), zdroj vitaminu C a polyfenolů.',
        'usda-fdc',
      ),
      values: [
        { label: 'Energie', amount: 52, unit: 'kcal' },
        { label: 'Voda', amount: 86, unit: 'g' },
        { label: 'Vláknina', amount: 6.5, unit: 'g' },
        { label: 'Cukry', amount: 4.4, unit: 'g' },
        { label: 'Vitamin C', amount: 26, unit: 'mg' },
        { label: 'Vápník', amount: 25, unit: 'mg' },
      ],
      valuesBasis: 'USDA FoodData Central – maliny, syrové (pěstované odrůdy). Orientační hodnoty na 100 g.',
      valuesProvenance: 'C',
      valuesSourceIds: ['usda-fdc'],
    },
    benefits: c('Zpestření krmné dávky; díky vláknině a nižšímu obsahu cukrů patří mezi „rozumnější“ ovoce. Měkké plody jsou vhodné i pro ptáky s citlivým zobákem.'),
    species: {
      mali: 'Občasný pamlsek – 1 až 2 plody.',
      stredni: 'Pamlsek – několik plodů.',
      velci: 'Pamlsek – malá hrst plodů.',
      poznamka: 'Množství je orientační. Ovoce má tvořit jen menší část krmné dávky.',
      provenance: 'C',
    },
    serving: c('Celé čerstvé plody nebo rozmražené plody zamražené v sezóně. Zbytky odstraňte do několika hodin – maliny rychle kvasí a plesniví.'),
    preparation: b(
      'Plody přeberte (bývají v nich larvy malinovníka) a opatrně omyjte pitnou vodou. Nesbírejte u cest a v místech, kde se pohybují psi a lišky.',
      'harrison-lightfoot-2006',
    ),
    risks: list('C', [
      'Cukry – nepřekračujte rozumné množství.',
      'Velmi rychle plesniví a kvasí.',
      'Larvy hmyzu v plodech – plody přeberte.',
      'Záměna listů nebo plodů je málo pravděpodobná, přesto sbírejte jen jistě určený maliník.',
    ]),
    collecting: b(
      'Lesní plody smí každý sbírat pro vlastní potřebu (lesní zákon, § 19). Šlahouny nelamte a nevytrhávejte.',
      'zakon-lesni',
    ),
    habitat: b('Paseky, lesní okraje, světliny, kamenité stráně, často ve velkých porostech po těžbě dřeva.', 'kubat-2002'),
    whenToCollect: c('Červenec až srpen. Sbírejte plody, které se snadno oddělí od lůžka – to je známka zralosti.'),
    identification: {
      parts: {
        cely: 'Keř s dvouletými prýty vysokými 1–2 m, porostlými drobnými ostny.',
        list: 'Lichozpeřené listy se 3–7 lístky, na rubu bělavě plstnaté.',
        kvet: 'Drobné bílé květy s krátkými korunními lístky (květen–červen).',
        plod: 'Červené souplodí peckoviček, které se při zralosti oddělí od kuželovitého lůžka – plod je uvnitř dutý.',
      },
      lookalikes: [
        {
          name: 'Ostružiník',
          latin: 'Rubus fruticosus agg.',
          slug: 'ostruziny',
          danger: 'Nejde o nebezpečnou záměnu – ostružiny jsou černé a lůžko v nich zůstává.',
        },
        {
          name: 'Jedovaté rostliny s červenými bobulemi (např. lilek potměchuť)',
          slug: 'lilek-potmechut',
          danger: 'Mají hladké lesklé bobule, ne souplodí peckoviček. Sbírejte jen to, co bezpečně poznáte.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['harrison-lightfoot-2006', 'usda-fdc', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'berry', color: '#C2305A', accent: '#4E8A3E' },
    photos: [],
    related: ['ostruziny', 'lesni-jahody', 'boruvky'],
    seo: {
      title: 'Může papoušek maliny? | LES.cz',
      description:
        'Maliny pro papoušky: kolik jich podávat, jak je připravit, kde a kdy je v lese sbírat. Zboží zdarma, doprava vlastníma nohama.',
    },
  },

  // ---------------------------------------------------------------- OSTRUŽINY
  {
    slug: 'ostruziny',
    name: 'Ostružiny',
    synonyms: ['ostružiník křovitý', 'ostružina', 'černé maliny'],
    latin: 'Rubus fruticosus agg.',
    family: 'Rosaceae – růžovité',
    category: 'lesni-ovoce',
    tagline: 'Zboží s ochranou proti krádeži. Integrovanou, ostnatou.',
    months: [8, 9],
    shop: {
      price: 'ZDARMA',
      availability: 'NASKLADNĚNO (srpen–září)',
      warehouse: 'Příroda, oddělení lesních okrajů a neprostupných houštin',
      shipping: 'Vlastní nohy, rukavice a trpělivost',
      buyMessage:
        'Objednávka přijata! Ostružiny jsou zabezpečeny originálním ostnatým obalem. Odběr probíhá na vlastní nebezpečí, reklamace škrábanců přijímá výhradně nejbližší keř.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Zralé plody jsou uváděny mezi ovocem vhodným pro papoušky. Platí střídmost kvůli cukrům a důkladná kontrola plísní.',
      provenance: 'B',
      sourceIds: ['harrison-lightfoot-2006'],
    },
    parts: c('Zralé černé plody. Mladé listy se v praxi podávají jako zeleň, odborné podklady pro papoušky však chybí – jen v malém množství.'),
    nutrition: {
      summary: c('Ovoce s nižším obsahem cukrů, vysokým podílem vlákniny (semena) a polyfenolů včetně antokyanů.', 'usda-fdc'),
      values: [
        { label: 'Energie', amount: 43, unit: 'kcal' },
        { label: 'Voda', amount: 88, unit: 'g' },
        { label: 'Vláknina', amount: 5.3, unit: 'g' },
        { label: 'Cukry', amount: 4.9, unit: 'g' },
        { label: 'Vitamin C', amount: 21, unit: 'mg' },
        { label: 'Vápník', amount: 29, unit: 'mg' },
      ],
      valuesBasis: 'USDA FoodData Central – ostružiny, syrové (pěstované odrůdy). Orientační hodnoty na 100 g.',
      valuesProvenance: 'C',
      valuesSourceIds: ['usda-fdc'],
    },
    benefits: c('Zpestření krmné dávky, vláknina a polyfenoly. Plody na kousku stonku (bez ostnů) mohou sloužit i jako zábava při hledání potravy.'),
    species: {
      mali: 'Občasný pamlsek – 1 plod, případně rozdělený.',
      stredni: 'Pamlsek – několik plodů.',
      velci: 'Pamlsek – malá hrst plodů.',
      poznamka: 'Množství je orientační. Trus může být po ostružinách tmavě zbarvený.',
      provenance: 'C',
    },
    serving: c('Čerstvé celé plody nebo rozmražené plody zamražené v sezóně. Zbytky odstraňte do několika hodin.'),
    preparation: b(
      'Plody přeberte, odstraňte nedozrálé, plesnivé a hmyzem napadené kusy a omyjte je pitnou vodou. Nepodávejte ostnaté části rostliny.',
      'harrison-lightfoot-2006',
    ),
    risks: list('C', [
      'Cukry – podávejte střídmě.',
      'Plísně – koncem sezóny (deštivé září) jsou plody často napadené plísní.',
      'Ostny – nepodávejte šlahouny s ostny.',
      'Záměna s jedovatými černými plody (krušina olšová, rulík zlomocný).',
    ]),
    collecting: b(
      'Lesní plody smí každý sbírat pro vlastní potřebu (lesní zákon, § 19). Šlahouny nelamte.',
      'zakon-lesni',
    ),
    habitat: b('Lesní okraje, paseky, křoviny, meze a světlé lesy; v nížinách a pahorkatinách velmi hojně.', 'kubat-2002'),
    whenToCollect: c('Srpen až září. Sbírejte lesklé, zcela černé a měkké plody za suchého počasí.'),
    identification: {
      parts: {
        cely: 'Ostnitý keř s obloukovitě převislými nebo plazivými šlahouny.',
        list: 'Dlanitě složené listy se 3–5 lístky, pilovité, často s ostny i na řapíku a žilnatině.',
        kvet: 'Bílé až narůžovělé pětičetné květy (červen–srpen).',
        plod: 'Černé lesklé souplodí peckoviček; na rozdíl od maliny zůstává lůžko uvnitř plodu.',
      },
      lookalikes: [
        {
          name: 'Krušina olšová',
          latin: 'Frangula alnus',
          slug: 'krusina-olsova',
          danger: 'Jedovatá. Keř BEZ ostnů s celokrajnými listy a jednotlivými hladkými bobulemi (zelené → červené → černé).',
        },
        {
          name: 'Rulík zlomocný',
          latin: 'Atropa bella-donna',
          slug: 'rulik-zlomocny',
          danger: 'Velmi jedovatý. Bylina bez ostnů s lesklou černou bobulí a zeleným hvězdicovitým kalichem.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['harrison-lightfoot-2006', 'usda-fdc', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'berry', color: '#2A1E3A', accent: '#5B7F35' },
    photos: [],
    related: ['maliny', 'boruvky', 'krusina-olsova'],
    seo: {
      title: 'Může papoušek ostružiny? | LES.cz',
      description:
        'Ostružiny pro papoušky: jak je sbírat, připravit a kolik podávat. A jak je nezaměnit s jedovatou krušinou nebo rulíkem.',
    },
  },

  // ---------------------------------------------------------------- BRUSINKY
  {
    slug: 'brusinky',
    name: 'Brusinky',
    synonyms: ['brusnice brusinka', 'brusinka', 'brusnice'],
    latin: 'Vaccinium vitis-idaea L.',
    family: 'Ericaceae – vřesovcovité',
    category: 'lesni-ovoce',
    tagline: 'Kyselé jako lesní skladník v pondělí ráno.',
    months: [8, 9, 10],
    shop: {
      price: 'ZDARMA',
      availability: 'NASKLADNĚNO V BOROVÝCH LESÍCH (srpen–říjen)',
      warehouse: 'Příroda, oddělení borů, vřesovišť a horských svahů',
      shipping: 'Vlastní nohy',
      buyMessage:
        'Objednávka přijata! Brusinky jsou připraveny v borovém lese. Upozornění: zboží je výrazně kyselé – výraz obličeje papouška po ochutnání není vadou zboží, ale jeho recenzí.',
    },
    safety: {
      level: 'stridme',
      summary:
        'Zralé plody nejsou uváděny jako toxické a příbuzné druhy brusnic se papouškům běžně podávají. Specifické podklady pro brusinku u papoušků ale chybí, plody jsou velmi kyselé – podávejte jen v malém množství. Listy nepodávejte.',
      provenance: 'C',
    },
    parts: c('Pouze zralé červené plody. Listy obsahují arbutin a třísloviny – nepodávat.', 'frohne-pfander-2005'),
    nutrition: {
      summary: c(
        'Kyselé ovoce s organickými kyselinami (mimo jiné kyselina benzoová) a polyfenoly. Pro brusinku (Vaccinium vitis-idaea) jsme v USDA FoodData Central nenašli spolehlivý záznam syrových plodů – hodnoty proto neuvádíme. Klikva (Vaccinium macrocarpon, „brusinky“ z obchodu) je jiný druh.',
      ),
    },
    benefits: c('Zpestření krmné dávky na podzim, kdy ostatní lesní ovoce končí.'),
    species: {
      mali: 'Jen ochutnávka – 1 bobule, nejlépe rozpůlená.',
      stredni: 'Pamlsek – 2 až 3 bobule.',
      velci: 'Pamlsek – několik bobulí.',
      poznamka: 'Množství je orientační a záměrně nízké kvůli kyselosti a chybějícím podkladům pro papoušky.',
      provenance: 'C',
    },
    serving: c('Čerstvé zralé bobule, ideálně smíchané s jiným ovocem nebo zeleninou. Nepodávejte slazené ani sušené brusinky z obchodu (přidaný cukr).'),
    preparation: c('Bobule přeberte, odstraňte lístky a nezralé plody a omyjte je pitnou vodou.'),
    risks: list('C', [
      'Vysoká kyselost – ve větším množství může dráždit trávicí trakt.',
      'Listy obsahují arbutin – nepodávat.',
      'Záměna s medvědicí lékařskou nebo s jedovatými červenými bobulemi (konvalinka).',
      'Slazené a sušené výrobky z obchodu obsahují přidaný cukr.',
    ]),
    collecting: b(
      'Lesní plody smí každý sbírat pro vlastní potřebu (lesní zákon, § 19). Keříky nevytrhávejte – rostou velmi pomalu.',
      'zakon-lesni',
    ),
    habitat: b('Kyselé půdy borů a smrčin, vřesoviště, okraje rašelinišť, horské polohy. V nížinách vzácnější.', 'kubat-2002'),
    whenToCollect: c('Srpen až říjen. Sbírejte plody zcela vybarvené do červena.'),
    identification: {
      parts: {
        cely: 'Stálezelený keřík vysoký 10–30 cm s plazivým oddenkem.',
        list: 'Kožovité, lesklé, tmavě zelené listy s podvinutým okrajem; na rubu světlejší s drobnými tmavými tečkami (žlázkami).',
        kvet: 'Bílé až narůžovělé zvonkovité květy v převislých hroznech (květen–červen).',
        plod: 'Kulovité červené lesklé bobule (5–8 mm), kyselé, v hroznech.',
      },
      lookalikes: [
        {
          name: 'Medvědice lékařská',
          latin: 'Arctostaphylos uva-ursi',
          danger: 'Listy bez teček na rubu, plody moučnaté a bez chuti. V ČR je vzácná – nesbírat.',
        },
        {
          name: 'Konvalinka vonná',
          latin: 'Convallaria majalis',
          slug: 'konvalinka',
          danger:
            'Velmi jedovatá. Na konci léta má červené bobule, ale jde o bylinu se dvěma velkými listy, ne o stálezelený keřík.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['frohne-pfander-2005', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'berry', color: '#B3122E', accent: '#2F5D34' },
    photos: [],
    related: ['boruvky', 'jerabiny', 'konvalinka'],
    seo: {
      title: 'Může papoušek brusinky? | LES.cz',
      description:
        'Lesní brusinky pro papoušky: proč jen v malém množství, proč ne listy a jak brusinku nezaměnit s konvalinkou či medvědicí.',
    },
  },

  // ---------------------------------------------------------------- JEŘABINY
  {
    slug: 'jerabiny',
    name: 'Jeřabiny',
    synonyms: ['jeřáb ptačí', 'jeřabina', 'oskeruše ptačí'],
    latin: 'Sorbus aucuparia L.',
    family: 'Rosaceae – růžovité',
    category: 'lesni-ovoce',
    tagline: 'Jeřáb PTAČÍ. Už název naznačuje, pro koho je zboží určeno.',
    months: [9, 10, 11],
    shop: {
      price: 'ZDARMA',
      availability: 'PRÁVĚ DOZRÁVÁ – naši skladníci jsou už na větvích (září–listopad)',
      warehouse: 'Příroda, oddělení lesních okrajů, horských lesů a stromořadí',
      shipping: 'Vlastní nohy; v zimě doporučujeme zastavit se po prvních mrazících',
      badge: 'Podzimní hit',
      buyMessage:
        'Objednávka přijata! Jeřabiny visí v trsech na stromě a čekají. Pozor: o toto zboží je velký zájem – drozdi, kosi a brkoslavové mají předkupní právo a nikdo z nich nechodí na pokladnu.',
    },
    safety: {
      level: 'stridme',
      summary:
        'Jeřabiny se ptákům v chovech podávají, syrové plody však obsahují kyselinu parasorbovou, která může dráždit trávicí trakt; semena obsahují malé množství kyanogenních glykosidů. Podávejte jen v malém množství, ideálně po zamražení nebo tepelné úpravě.',
      provenance: 'C',
      sourceIds: ['frohne-pfander-2005'],
    },
    parts: c('Zralé plody (malvice). Listy, kůru ani větve s plody ve velkém množství nepodávejte.', 'frohne-pfander-2005'),
    nutrition: {
      summary: c(
        'Plody obsahují vitamin C, karotenoidy, organické kyseliny a třísloviny; chuť je hořká a trpká. V USDA FoodData Central záznam pro jeřabiny není, nutriční hodnoty proto neuvádíme.',
      ),
    },
    benefits: c('Podzimní a zimní zpestření krmné dávky; trsy plodů na stopkách jsou vhodné k zavěšení jako zábava pro hledání potravy.'),
    species: {
      mali: 'Jen ochutnávka – 1 až 2 bobule občas.',
      stredni: 'Pamlsek – několik bobulí občas.',
      velci: 'Pamlsek – malý trs občas.',
      poznamka: 'Množství je záměrně nízké. Pro papoušky nejsou k dispozici údaje o bezpečné dávce.',
      provenance: 'C',
    },
    serving: c('Malé množství bobulí, případně celý malý trs zavěšený v kleci. Podávejte občas, ne denně.'),
    preparation: c(
      'Plody omyjte pitnou vodou. Kyselina parasorbová se z velké části rozkládá zamražením nebo tepelnou úpravou – proto se doporučuje plody předem zamrazit nebo krátce povařit.',
      'frohne-pfander-2005',
    ),
    risks: list(
      'C',
      [
        'Kyselina parasorbová v syrových plodech – při větším množství dráždí trávicí trakt.',
        'Semena obsahují malé množství kyanogenních glykosidů.',
        'Jeřáby se často vysazují podél silnic – takové plody nesbírejte.',
        'Záměna s jedovatými červenými plody (tis červený, lilek potměchuť, kalina obecná).',
      ],
      'frohne-pfander-2005',
    ),
    collecting: b(
      'Lesní plody smí každý sbírat pro vlastní potřebu (lesní zákon, § 19). Větve stromů nelámejte a neřežte bez souhlasu vlastníka – lesní zákon zakazuje stromy poškozovat (§ 20).',
      'zakon-lesni',
    ),
    habitat: b('Lesní okraje, světlé lesy, paseky, horské lesy až po hranici lesa; často vysazován ve stromořadích a parcích.', 'kubat-2002'),
    whenToCollect: c('Září až listopad. Po prvních mrazících jsou plody méně hořké.'),
    identification: {
      parts: {
        cely: 'Strom nebo keř vysoký 5–15 m s řídkou korunou.',
        list: 'Lichozpeřené listy s 9–19 podlouhlými pilovitými lístky.',
        kura: 'Hladká, šedá až šedohnědá, lesklá kůra.',
        kvet: 'Bílé drobné květy v plochých chocholících, nepříjemně páchnou (květen–červen).',
        plod: 'Kulovité oranžově červené malvice (asi 1 cm) v bohatých chocholících.',
      },
      lookalikes: [
        {
          name: 'Tis červený',
          latin: 'Taxus baccata',
          slug: 'tis-cerveny',
          danger: 'Smrtelně jedovatý. Jehličnan s plochými jehlicemi, červený pohárkovitý „míšek“ s černým semenem uvnitř.',
        },
        {
          name: 'Lilek potměchuť',
          latin: 'Solanum dulcamara',
          slug: 'lilek-potmechut',
          danger: 'Jedovatá popínavá rostlina s vejčitými červenými bobulemi v řídkých vijanech.',
        },
        {
          name: 'Kalina obecná',
          latin: 'Viburnum opulus',
          danger: 'Syrové plody jsou mírně jedovaté. Laločnaté listy (jako javor), sklovitě průsvitné červené peckovice.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002', 'frohne-pfander-2005'],
    },
    sourceIds: ['frohne-pfander-2005', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'berry', color: '#E0561F', accent: '#4A6E2C' },
    photos: [],
    related: ['sipky', 'hloh', 'tis-cerveny'],
    seo: {
      title: 'Může papoušek jeřabiny? | LES.cz',
      description:
        'Jeřabiny pro papoušky: proč jen málo, proč je zamrazit nebo povařit a jak jeřáb nezaměnit s tisem či lilkem potměchutí.',
    },
  },

  // ---------------------------------------------------------------- ŠÍPKY
  {
    slug: 'sipky',
    name: 'Šípky',
    synonyms: ['růže šípková', 'šípek', 'psí růže'],
    latin: 'Rosa canina L.',
    family: 'Rosaceae – růžovité',
    category: 'lesni-ovoce',
    tagline: 'Vitamin C v balení, které se otevírá zobákem.',
    months: [9, 10, 11],
    shop: {
      price: 'ZDARMA',
      availability: 'NASKLADNĚNO NA MEZÍCH (září–listopad)',
      warehouse: 'Příroda, oddělení mezí, pastvin a lesních okrajů',
      shipping: 'Vlastní nohy, rukavice proti ostnům',
      badge: 'Vitaminová bomba',
      buyMessage:
        'Objednávka přijata! Šípky čekají na keři na mezi. Upozorňujeme, že uvnitř je originální „svědivé“ plnivo – papouškovi obvykle nevadí, vám možná ano. Prosíme, neházejte ho spolusběračům za límec.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Šípky se papouškům v chovatelské praxi běžně podávají a nejsou uváděny jako toxické. Specifické odborné podklady pro papoušky jsou ale omezené – podávejte jako zpestření, ne jako základ krmiva.',
      provenance: 'C',
    },
    parts: c('Zralé plody (šípky) celé i rozpůlené. Sušené šípky z čaje jen bez přísad.'),
    nutrition: {
      summary: c(
        'Mimořádně bohatý zdroj vitaminu C, dále karotenoidů a vlákniny. Plod je sušší a energeticky hutnější než bobule.',
        'usda-fdc',
      ),
      values: [
        { label: 'Energie', amount: 162, unit: 'kcal' },
        { label: 'Voda', amount: 59, unit: 'g' },
        { label: 'Vláknina', amount: 24, unit: 'g' },
        { label: 'Vitamin C', amount: 426, unit: 'mg' },
        { label: 'Vápník', amount: 169, unit: 'mg' },
      ],
      valuesBasis:
        'USDA FoodData Central – šípky, plané (záznam „Rose Hips, wild (Northern Plains Indians)“, druh neurčen). Orientační hodnoty na 100 g.',
      valuesProvenance: 'C',
      valuesSourceIds: ['usda-fdc'],
    },
    benefits: c('Zdroj vitaminu C a vlákniny; tuhý plod zaměstná zobák a nabízí přirozenou činnost (vylupování semen).'),
    species: {
      mali: 'Rozpůlený šípek občas – drobní papoušci často jen oklovou dužninu.',
      stredni: 'Pamlsek – 1 až 2 šípky.',
      velci: 'Pamlsek – několik šípků, rádi je rozlouskávají.',
      poznamka: 'Množství je orientační.',
      provenance: 'C',
    },
    serving: c('Celé čerstvé šípky (velcí papoušci), rozpůlené šípky (menší druhy), případně sušené šípky bez přísad.'),
    preparation: c(
      'Plody omyjte pitnou vodou. Uvnitř jsou nažky s jemnými chloupky, které u lidí dráždí kůži; papoušci je obvykle vyloupají. U drobných druhů je vhodné šípek rozpůlit.',
    ),
    risks: list('C', [
      'Chloupky na semenech mohou dráždit – u citlivých jedinců šípky zbavte semen.',
      'Plísně – měkké, nahnilé plody nepodávejte.',
      'Keře podél polí a silnic mohou být ošetřené nebo znečištěné.',
      'Záměna s jedovatými červenými plody (lilek potměchuť, tis červený).',
    ]),
    collecting: b(
      'Lesní plody smí každý sbírat pro vlastní potřebu (lesní zákon, § 19); mimo les respektujte vlastníka pozemku. Keře nepoškozujte.',
      'zakon-lesni',
    ),
    habitat: b('Meze, křoviny, pastviny, lesní okraje a světlé lesy, od nížin do podhůří.', 'kubat-2002'),
    whenToCollect: c('Září až listopad. Sbírejte zcela vybarvené plody; po prvních mrazících jsou měkčí.'),
    identification: {
      parts: {
        cely: 'Keř 1–3 m s obloukovitými větvemi a hákovitými (srpovitými) ostny.',
        list: 'Lichozpeřené listy s 5–7 eliptickými pilovitými lístky.',
        kvet: 'Velké jednoduché růžové až bílé pětičetné květy (červen).',
        plod: 'Šípek – červená až oranžová lesklá „češule“ s dužnatou stěnou a chlupatými nažkami uvnitř.',
      },
      lookalikes: [
        {
          name: 'Lilek potměchuť',
          latin: 'Solanum dulcamara',
          slug: 'lilek-potmechut',
          danger: 'Jedovatý. Popínavá bylina bez ostnů s měkkými červenými bobulemi.',
        },
        {
          name: 'Tis červený',
          latin: 'Taxus baccata',
          slug: 'tis-cerveny',
          danger: 'Smrtelně jedovatý jehličnan s červeným pohárkovitým míškem.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['usda-fdc', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'berry', color: '#D9381E', accent: '#5E7D33' },
    photos: [],
    related: ['jerabiny', 'hloh', 'lilek-potmechut'],
    seo: {
      title: 'Může papoušek šípky? | LES.cz',
      description:
        'Šípky pro papoušky: vitamin C z meze, jak je podávat malým i velkým druhům, kdy je sbírat a s čím je nezaměnit.',
    },
  },

  // ---------------------------------------------------------------- BEZINKY
  {
    slug: 'bezinky',
    name: 'Bezinky',
    synonyms: ['bez černý', 'černý bez', 'bezinka', 'kozinky'],
    latin: 'Sambucus nigra L.',
    family: 'Viburnaceae (dříve Adoxaceae / Caprifoliaceae) – kalinovité',
    category: 'lesni-ovoce',
    tagline: 'Zboží pro pokročilé. Návod k použití je delší než nákupní seznam.',
    months: [8, 9],
    shop: {
      price: 'ZDARMA',
      availability: 'NASKLADNĚNO – jen plně zralé kusy (srpen–září)',
      warehouse: 'Příroda, oddělení lesních okrajů, pasek a zarostlých zahrad',
      shipping: 'Vlastní nohy + vlastní hrnec',
      badge: 'Jen s návodem',
      buyMessage:
        'Objednávka přijata – s výhradou! Vydáváme pouze plně zralé černé bobule bez stopek. Nezralé kusy, listy a stonky zůstávají na skladě natrvalo. Doporučujeme bobule před podáním tepelně upravit. Kurýr (keř) za nesprávné použití neručí.',
    },
    safety: {
      level: 'stridme',
      summary:
        'Zralé plody se po úpravě používají, ale nezralé plody, semena, listy, stonky a kůra obsahují kyanogenní glykosidy (sambunigrin). Podávejte jen plně zralé bobule bez stopek, ideálně tepelně upravené, a jen v malém množství. Pozor na záměnu s jedovatým bezem chebdím a bezem červeným.',
      provenance: 'B',
      sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984'],
    },
    parts: b(
      'Pouze plně zralé černé bobule bez stopek. Nezralé (zelené a červené) plody, stopky, listy, kůra a dřeň jsou nevhodné.',
      'frohne-pfander-2005',
    ),
    nutrition: {
      summary: c('Bobule bohaté na antokyany, vitamin C a vlákninu.', 'usda-fdc'),
      values: [
        { label: 'Energie', amount: 73, unit: 'kcal' },
        { label: 'Voda', amount: 80, unit: 'g' },
        { label: 'Vláknina', amount: 7, unit: 'g' },
        { label: 'Vitamin C', amount: 36, unit: 'mg' },
        { label: 'Vápník', amount: 38, unit: 'mg' },
      ],
      valuesBasis: 'USDA FoodData Central – bezinky, syrové (druh bezu blíže neurčen). Orientační hodnoty na 100 g.',
      valuesProvenance: 'C',
      valuesSourceIds: ['usda-fdc'],
    },
    benefits: c('Zpestření krmné dávky koncem léta; zdroj barviv a vlákniny. Vzhledem k rizikům jde spíše o příležitostnou položku.'),
    species: {
      mali: 'Nedoporučujeme bez konzultace s veterinářem – riziko záměny a nepřesného dávkování.',
      stredni: 'Jen ochutnávka – několik tepelně upravených bobulí občas.',
      velci: 'Jen malé množství tepelně upravených bobulí občas.',
      poznamka: 'Bezpečná dávka pro papoušky není v dostupných zdrojích stanovena. Trus může být po bezinkách tmavě zbarvený.',
      provenance: 'C',
    },
    serving: c('Malé množství zralých bobulí po tepelné úpravě, vychladlých, bez přidaného cukru. Nepodávejte celé okolíky se stopkami.'),
    preparation: b(
      'Okolíky omyjte, bobule pečlivě oberte vidličkou ze stopek, vyřaďte všechny zelené a červené bobule. Tepelnou úpravou (krátké povaření nebo spaření) se obsah kyanogenních látek snižuje.',
      'frohne-pfander-2005',
    ),
    risks: list(
      'B',
      [
        'Nezralé bobule, stopky, listy, kůra a semena obsahují kyanogenní glykosidy (sambunigrin).',
        'Záměna s bezem chebdím (bylina, jedovatý) a s bezem červeným (červené plody, jedovatá semena).',
        'Syrové bobule mohou i u lidí vyvolat nevolnost a průjem.',
        'Plísně a hmyz v přezrálých okolících.',
      ],
      'frohne-pfander-2005',
      'cooper-johnson-1984',
    ),
    collecting: b(
      'Lesní plody smí každý sbírat pro vlastní potřebu (lesní zákon, § 19). Okolíky odstřihávejte nůžkami, větve nelámejte.',
      'zakon-lesni',
    ),
    habitat: b('Lesní okraje, paseky, lužní lesy, křoviny, okolí sídel a zarostlé zahrady; má rád dusíkem bohaté půdy.', 'kubat-2002'),
    whenToCollect: c('Srpen až září, jakmile jsou VŠECHNY bobule v okolíku černé a lesklé a okolík se sklání dolů.'),
    identification: {
      parts: {
        cely: 'Keř nebo malý strom do 7 m.',
        list: 'Vstřícné lichozpeřené listy s 5–7 pilovitými lístky, po rozemnutí nepříjemně voní.',
        kura: 'Šedohnědá, korkovitá, s nápadnými bradavičnatými lenticelami; dřeň větví je BÍLÁ.',
        kvet: 'Smetanově bílé drobné květy v plochých vrcholících, výrazně voní (květen–červen).',
        plod: 'Černé lesklé peckovice (5–6 mm) v PŘEVISLÝCH vrcholících na červenofialových stopkách.',
      },
      lookalikes: [
        {
          name: 'Bez chebdí',
          latin: 'Sambucus ebulus',
          slug: 'bez-chebdi',
          danger:
            'Jedovatý. Vytrvalá BYLINA 0,5–2 m (na zimu zatahuje), vrcholíky plodů stojí VZPŘÍMENĚ, celá rostlina nepříjemně páchne.',
        },
        {
          name: 'Bez červený',
          latin: 'Sambucus racemosa',
          slug: 'bez-cerveny',
          danger: 'Jedovatá semena. ČERVENÉ plody ve vejčitých latách, dozrávají už v červnu až červenci; dřeň větví je hnědá.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002', 'frohne-pfander-2005'],
    },
    sourceIds: ['frohne-pfander-2005', 'cooper-johnson-1984', 'usda-fdc', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'berry', color: '#2B1B33', accent: '#7A3E66' },
    photos: [],
    related: ['bez-chebdi', 'bez-cerveny', 'ostruziny'],
    seo: {
      title: 'Může papoušek bezinky? Jen s výhradou | LES.cz',
      description:
        'Bezinky pro papoušky jen plně zralé, bez stopek a tepelně upravené. Proč, kolik a jak nezaměnit černý bez s jedovatým bezem chebdím.',
    },
  },

  // ---------------------------------------------------------------- HLOH
  {
    slug: 'hloh',
    name: 'Hloh',
    synonyms: ['hloh jednosemenný', 'hloh obecný', 'hložinky', 'hlohyně'],
    latin: 'Crataegus monogyna Jacq., C. laevigata (Poir.) DC.',
    family: 'Rosaceae – růžovité',
    category: 'lesni-ovoce',
    tagline: 'Malé jablíčko s velkou peckou. Jako by ho navrhoval pták.',
    months: [9, 10],
    shop: {
      price: 'ZDARMA',
      availability: 'NASKLADNĚNO V KŘOVINÁCH (září–říjen)',
      warehouse: 'Příroda, oddělení mezí, remízků a trnitých křovin',
      shipping: 'Vlastní nohy, rukavice proti trnům',
      buyMessage:
        'Objednávka přijata! Hložinky jsou připraveny na trnitém keři. Balení obsahuje dužninu a tvrdou pecku – pecku si prosím nechte, i papoušek ji obvykle vrátí jako nevyžádané zboží.',
    },
    safety: {
      level: 'stridme',
      summary:
        'Dužnina zralých plodů není uváděna jako toxická a hložinky jsou přirozenou potravou volně žijících ptáků. Semena (pecky) však obsahují malé množství kyanogenních glykosidů a hloh obsahuje látky s účinkem na srdce a oběh (využívané v bylinářství). Pro papoušky chybí podklady – jen občas a v malém množství.',
      provenance: 'C',
    },
    parts: c('Dužnina zralých plodů, ideálně bez pecek. Listy a květy (bylinářsky využívané pro účinek na srdce) nepodávejte.'),
    nutrition: {
      summary: c(
        'Moučnatá dužnina se sacharidy, vlákninou, vitaminem C a polyfenoly (flavonoidy, procyanidiny). V USDA FoodData Central záznam pro hložinky není, nutriční hodnoty proto neuvádíme.',
      ),
    },
    benefits: c('Podzimní zpestření; drobné plody se dají použít při hledání potravy.'),
    species: {
      mali: 'Jen ochutnávka dužniny – plod rozkrojte a pecku odstraňte.',
      stredni: '1 až 2 plody občas, ideálně bez pecek.',
      velci: 'Několik plodů občas; pecky raději odstraňte.',
      poznamka: 'Množství je orientační a záměrně nízké. U ptáků se srdečním onemocněním nebo léčených na srdce hloh nepodávejte bez konzultace s veterinářem.',
      provenance: 'C',
    },
    serving: c('Malé množství rozkrojených plodů bez pecek, zvlášť od zrnin.'),
    preparation: c('Plody omyjte pitnou vodou, rozkrojte a odstraňte pecky.'),
    risks: list('C', [
      'Pecky obsahují malé množství kyanogenních glykosidů.',
      'Látky s účinkem na srdce a krevní oběh – opatrnost u nemocných ptáků.',
      'Trny při sběru.',
      'Záměna s jinými keři s červenými plody (např. skalníky – Cotoneaster), jejichž bezpečnost pro papoušky není ověřena.',
    ]),
    collecting: b(
      'Lesní plody smí každý sbírat pro vlastní potřebu (lesní zákon, § 19); mimo les respektujte vlastníka pozemku. Keře nepoškozujte.',
      'zakon-lesni',
    ),
    habitat: b('Křoviny, meze, remízky, lesní okraje a světlé listnaté lesy, pastviny.', 'kubat-2002'),
    whenToCollect: c('Září až říjen, jakmile jsou plody tmavě červené a měkké.'),
    identification: {
      parts: {
        cely: 'Trnitý keř nebo malý strom 2–8 m.',
        list: 'Střídavé listy, hluboce (C. monogyna) nebo mělce (C. laevigata) laločnaté.',
        vetev: 'Větve s ostrými trny 1–2 cm dlouhými.',
        kvet: 'Bílé pětičetné květy v chocholících, nevýrazně páchnou (květen).',
        plod: 'Červené kulovité až vejčité malvice (8–12 mm) s moučnatou dužninou a 1 (C. monogyna) nebo 2–3 peckami.',
      },
      lookalikes: [
        {
          name: 'Skalník (rod Cotoneaster)',
          latin: 'Cotoneaster sp.',
          danger: 'Keř bez trnů s celokrajnými listy, často v parcích. Bezpečnost pro papoušky není ověřena – nesbírat.',
        },
        {
          name: 'Tis červený',
          latin: 'Taxus baccata',
          slug: 'tis-cerveny',
          danger: 'Smrtelně jedovatý jehličnan s červeným pohárkovitým míškem.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'berry', color: '#A3241E', accent: '#557A35' },
    photos: [],
    related: ['sipky', 'jerabiny', 'drin'],
    seo: {
      title: 'Může papoušek hložinky? | LES.cz',
      description:
        'Plody hlohu pro papoušky: proč jen dužninu bez pecek, proč opatrně a jak hloh poznat. Lesní e-shop, kde nic nekoupíte.',
    },
  },

  // ---------------------------------------------------------------- LÍSKOVÉ OŘÍŠKY
  {
    slug: 'liskove-orisky',
    name: 'Lískové oříšky',
    synonyms: ['líska obecná', 'lískáče', 'lískovce', 'oříšky'],
    latin: 'Corylus avellana L.',
    family: 'Betulaceae – břízovité',
    category: 'lesni-ovoce',
    tagline: 'Balení s pevným obalem. Otevírací nástroj je součástí papouška.',
    months: [8, 9, 10],
    shop: {
      price: 'ZDARMA',
      availability: 'NASKLADNĚNO – pokud nás nepředběhnou veverky (srpen–říjen)',
      warehouse: 'Příroda, oddělení lesních okrajů a podrostu, sekce „ořechy a semena“',
      shipping: 'Vlastní nohy; veverky doručují jen do vlastních skrýší',
      badge: 'Konkurence veverek',
      buyMessage:
        'Objednávka přijata! Lískové oříšky jsou připraveny pod keři lísky. Upozorňujeme, že veverky, sojky a plši mají v našem lese věrnostní program a vyzvedávají dříve. Prázdné skořápky reklamovat nelze.',
    },
    safety: {
      level: 'stridme',
      summary:
        'Lískové ořechy nejsou toxické a používají se i ve směsích pro papoušky. Jsou však velmi tučné a energeticky bohaté – pro malé druhy a ptáky s nadváhou nebo onemocněním jater jen výjimečně. Zásadní je kvalita: plesnivé ořechy mohou obsahovat aflatoxiny.',
      provenance: 'B',
      sourceIds: ['harrison-lightfoot-2006', 'exomix'],
    },
    parts: b('Zralá jádra ořechů (velcí papoušci je mohou dostat i ve skořápce). Zelené nezralé ořechy nesbírejte.', 'harrison-lightfoot-2006'),
    nutrition: {
      summary: c(
        'Energeticky velmi bohaté jádro s vysokým obsahem tuku (převážně mononenasycené mastné kyseliny), bílkovin, vitaminu E a minerálních látek. Poměr vápníku k fosforu je nízký (fosforu je víc).',
        'usda-fdc',
      ),
      values: [
        { label: 'Energie', amount: 628, unit: 'kcal' },
        { label: 'Tuk', amount: 61, unit: 'g' },
        { label: 'Bílkoviny', amount: 15, unit: 'g' },
        { label: 'Vláknina', amount: 9.7, unit: 'g' },
        { label: 'Vápník', amount: 114, unit: 'mg' },
        { label: 'Fosfor', amount: 290, unit: 'mg' },
        { label: 'Vitamin E', amount: 15, unit: 'mg' },
      ],
      valuesBasis: 'USDA FoodData Central – lískové ořechy, syrové (pěstované odrůdy). Orientační hodnoty na 100 g jader.',
      valuesProvenance: 'C',
      valuesSourceIds: ['usda-fdc'],
    },
    benefits: c(
      'Kvalitní zdroj energie, tuků a vitaminu E; ořech ve skořápce je u velkých papoušků výborná činnost pro zobák (foraging). Vhodné jako odměna při tréninku.',
    ),
    species: {
      mali: 'Jen výjimečně – drobný kousek nebo trocha mletého jádra.',
      stredni: 'Pamlsek – půl až jeden ořech občas.',
      velci: 'Pamlsek – 1 až 2 ořechy denně nebo ob den, ve skořápce jako zábava.',
      poznamka:
        'Množství je orientační. ExoMix ve svých profilech druhů uvádí, že agapornis růžohrdlý je „citlivý na přebytek tuku“ a papoušek nádherný „velmi citlivý na přebytek tuku“ – u těchto a podobných druhů ořechy jen výjimečně.',
      provenance: 'C',
      sourceIds: ['exomix'],
    },
    serving: a(
      'Ve vzorové receptuře ExoMix jsou lískové ořechy uvedeny v mleté podobě jako jedna ze složek směsi. Pro velké papoušky lze podat celý ořech ve skořápce nebo nalouskaný, pro menší druhy mleté či nasekané jádro v malém množství.',
    ),
    preparation: b(
      'Používejte jen zralé, suché, nepoškozené ořechy. Plesnivé, zatuchlé, nahnědlé nebo hořké jádro vyhoďte – plísně mohou produkovat aflatoxiny. Ořechy skladujte v suchu a chladu. Nepodávejte solené ani pražené ořechy s přísadami.',
      'harrison-lightfoot-2006',
    ),
    risks: list(
      'B',
      [
        'Vysoký obsah tuku – riziko obezity a zátěže jater při nadměrném podávání.',
        'Plísně a aflatoxiny – riziko zejména u starých, vlhkých a poškozených ořechů.',
        'Nízký poměr Ca:P – ořechy nesmí tvořit velkou část krmné dávky.',
        'Ořechy ležící dlouho na zemi bývají napadené červy nebo plísní.',
      ],
      'harrison-lightfoot-2006',
    ),
    collecting: b(
      'Lesní plody včetně ořechů smí každý sbírat pro vlastní potřebu (lesní zákon, § 19). Keře neolamujte a ořechy nesrážejte klacky.',
      'zakon-lesni',
    ),
    habitat: b('Podrost listnatých a smíšených lesů, lesní okraje, křoviny, meze a stráně.', 'kubat-2002'),
    whenToCollect: c('Srpen až říjen, jakmile ořechy hnědnou a samy se uvolňují z obalu. Sbírejte čerstvě spadané, ne dlouho ležící ořechy.'),
    identification: {
      parts: {
        cely: 'Mnohokmenný keř 2–6 m.',
        list: 'Okrouhlé až obvejčité listy se srdčitou bází, dvojitě pilovité, měkce chlupaté.',
        kura: 'Hladká, šedohnědá, lesklá kůra s lenticelami.',
        kvet: 'Samčí květy v převislých žlutých jehnědách (únor–březen), samičí drobné s červenými bliznami.',
        plod: 'Ořech v zeleném třásnitém listenovém obalu, jednotlivě nebo po 2–4.',
      },
      lookalikes: [
        {
          name: 'Habr obecný',
          latin: 'Carpinus betulus',
          slug: 'habr',
          danger: 'Nebezpečná záměna to není – habr má podobné listy, ale netvoří ořechy, plodem je nažka s trojlaločnou listenou.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    exomix: [
      'Vzorový štítek receptury ExoMix (labels/label_schema.sample.json) uvádí „lískové ořechy (mleté)“ jako složku směsi.',
      'Profily druhů ExoMix: agapornis růžohrdlý (Agapornis roseicollis) – „citlivý na přebytek tuku“; papoušek nádherný (Neophema splendida) – „velmi citlivý na přebytek tuku“.',
      'Validátor ExoMix upozorňuje na směsi s tukem nad 20 % a sleduje poměr Ca:P – ořechy oba parametry výrazně ovlivňují.',
    ],
    sourceIds: ['exomix', 'harrison-lightfoot-2006', 'usda-fdc', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'nut', color: '#9A6B3A', accent: '#6E8B3D' },
    photos: [],
    related: ['liska', 'jedle-kastany', 'bukvice'],
    seo: {
      title: 'Může papoušek lískové ořechy? | LES.cz',
      description:
        'Lískové oříšky pro papoušky: kolik jich dát malým a velkým druhům, proč pozor na tuk a plísně a co o nich říká ExoMix.',
    },
  },

  // ---------------------------------------------------------------- DŘÍN
  {
    slug: 'drin',
    name: 'Dřínky',
    synonyms: ['dřín obecný', 'dřín jarní', 'dřínky', 'drnky'],
    latin: 'Cornus mas L.',
    family: 'Cornaceae – dřínovité',
    category: 'lesni-ovoce',
    tagline: 'Jako třešně, jen kyselejší a vzácnější. Prémiová řada.',
    months: [8, 9],
    shop: {
      price: 'ZDARMA',
      availability: 'OMEZENÁ DOSTUPNOST – jen v teplejších oblastech (srpen–září)',
      warehouse: 'Příroda, oddělení teplých strání a doubrav',
      shipping: 'Vlastní nohy, případně vlak na jižní Moravu',
      badge: 'Neověřeno',
      buyMessage:
        'Objednávka přijata do stavu „čeká na schválení“! Dřínky jsou k mání na teplých stráních, ale naše odborné oddělení zatím nemá dost podkladů pro papoušky. Než je dáte do klece, poraďte se s veterinářem. Mezitím je můžete sníst sami.',
    },
    safety: {
      level: 'neovereno',
      summary:
        'Zralé plody dřínu jsou jedlé pro člověka a nejsou známé jako toxické. Odborné podklady pro papoušky jsme však nenašli. Do odborné kontroly je vedeme jako neověřené – nepodávejte bez konzultace s veterinářem.',
      provenance: 'C',
    },
    parts: c('V úvahu přichází jen dužnina zcela zralých plodů (tmavě červených, měkkých), bez pecky.'),
    nutrition: {
      summary: c(
        'Kyselé peckovice s organickými kyselinami, vitaminem C, antokyany a tříslovinami. V USDA FoodData Central záznam pro dřín není, nutriční hodnoty proto neuvádíme.',
      ),
    },
    benefits: c('Případné zpestření krmné dávky – přínos pro papoušky není doložen.'),
    species: {
      mali: 'Nepodávat bez konzultace s veterinářem.',
      stredni: 'Nepodávat bez konzultace s veterinářem.',
      velci: 'Nepodávat bez konzultace s veterinářem.',
      poznamka: 'Podklady pro papoušky chybí.',
      provenance: 'C',
    },
    serving: c('Pouze po konzultaci s veterinářem; pak jen ochutnávka dužniny bez pecky.'),
    preparation: c('Plody omyjte, odstraňte tvrdou pecku. Nezralé (tvrdé, světle červené) plody jsou velmi trpké.'),
    risks: list('C', [
      'Chybí odborné podklady pro papoušky.',
      'Tvrdá pecka – riziko poškození zobáku nebo vdechnutí úlomků u malých druhů.',
      'Záměna s jinými keři s červenými plody (např. zimolezy), které mohou být jedovaté.',
      'Dřín se pěstuje i v parcích a zahradách – tam respektujte vlastníka.',
    ]),
    collecting: b(
      'Lesní plody smí každý sbírat pro vlastní potřebu (lesní zákon, § 19). Keře nepoškozujte.',
      'zakon-lesni',
    ),
    habitat: b(
      'Teplé křoviny, šípákové a dubové doubravy, skalnaté stráně v teplejších oblastech (střední a jižní Čechy, jižní Morava); často vysazován v parcích.',
      'kubat-2002',
    ),
    whenToCollect: c('Srpen až září, kdy jsou plody tmavě červené, měkké a samy opadávají.'),
    identification: {
      parts: {
        cely: 'Keř nebo malý strom 2–6 m.',
        list: 'Vstřícné, vejčité, celokrajné listy s obloukovitými žilkami sbíhajícími se ke špičce.',
        kura: 'Šedohnědá, odlupující se v šupinách.',
        kvet: 'Drobné žluté květy v okolících, rozkvétají brzy na jaře (březen) před olistěním.',
        plod: 'Podlouhlá lesklá červená peckovice 1,5–2 cm s jednou tvrdou peckou.',
      },
      lookalikes: [
        {
          name: 'Svída krvavá',
          latin: 'Cornus sanguinea',
          danger: 'Příbuzný keř s ČERNÝMI hořkými plody v plochých vrcholících; pro papoušky se nedoporučuje.',
        },
        {
          name: 'Zimolez (např. zimolez obecný)',
          latin: 'Lonicera sp.',
          danger: 'Červené bobule obvykle ve dvojicích, považované za mírně jedovaté.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'berry', color: '#B01E2F', accent: '#C9A227' },
    photos: [],
    related: ['hloh', 'sipky'],
    seo: {
      title: 'Může papoušek dřínky? Zatím neověřeno | LES.cz',
      description:
        'Dřínky a papoušci: proč je zatím vedeme jako neověřené, jak dřín poznat a s čím ho nezaměnit. Poctivě, bez marketingových slibů.',
    },
  },

  // ---------------------------------------------------------------- JEDLÉ KAŠTANY
  {
    slug: 'jedle-kastany',
    name: 'Jedlé kaštany',
    synonyms: ['kaštanovník jedlý', 'jedlý kaštan', 'maroni', 'kaštany'],
    latin: 'Castanea sativa Mill.',
    family: 'Fagaceae – bukovité',
    category: 'lesni-ovoce',
    tagline: 'Jen pečené. Syrové zboží je určeno výhradně k obdivování.',
    months: [9, 10],
    shop: {
      price: 'ZDARMA',
      availability: 'OMEZENĚ – kaštanovník u nás roste hlavně ve vysazených porostech (září–říjen)',
      warehouse: 'Příroda, oddělení teplých oblastí, parků a starých sadů',
      shipping: 'Vlastní nohy + vlastní trouba',
      buyMessage:
        'Objednávka přijata! Jedlé kaštany jsou balené v ostnatém obalu s mnoha jemnými ostny – pozor, jejich bratranci koňské kaštany vypadají podobně, ale do papouška nepatří. Před podáním upéct nebo uvařit, oloupat a nechat vychladnout. Sůl ani karamel nepřikládáme.',
    },
    safety: {
      level: 'stridme',
      summary:
        'Tepelně upravené, oloupané jedlé kaštany se papouškům v chovatelské praxi podávají jako škrobová potravina. Syrové obsahují třísloviny a jsou hůře stravitelné. Zásadní je NEZAMĚNIT je s jedovatým koňským kaštanem.',
      provenance: 'C',
    },
    parts: c('Pouze tepelně upravené (pečené nebo vařené) a oloupané jádro. Ostnaté číšky, slupky a syrové plody nepodávat.'),
    nutrition: {
      summary: c(
        'Na rozdíl od ostatních ořechů jsou jedlé kaštany škrobové a chudé na tuk. Obsahují vlákninu a vitamin C.',
        'usda-fdc',
      ),
      values: [
        { label: 'Energie', amount: 245, unit: 'kcal' },
        { label: 'Sacharidy', amount: 53, unit: 'g' },
        { label: 'Tuk', amount: 2.2, unit: 'g' },
        { label: 'Bílkoviny', amount: 3.2, unit: 'g' },
        { label: 'Vláknina', amount: 5.1, unit: 'g' },
        { label: 'Vitamin C', amount: 26, unit: 'mg' },
      ],
      valuesBasis: 'USDA FoodData Central – evropské kaštany, pečené. Orientační hodnoty na 100 g jader.',
      valuesProvenance: 'C',
      valuesSourceIds: ['usda-fdc'],
    },
    benefits: c('Nízkotučná energetická potravina pro chladné měsíce; měkké jádro je vhodné i pro starší ptáky.'),
    species: {
      mali: 'Jen malý kousek upraveného jádra občas.',
      stredni: 'Kousek upraveného jádra občas.',
      velci: 'Půl až jeden upravený kaštan občas.',
      poznamka: 'Množství je orientační. Kaštany jsou škrobové – nepodávejte je ve velkém množství ptákům s nadváhou.',
      provenance: 'C',
    },
    serving: c('Upečené nebo uvařené, oloupané a vychladlé kaštany, bez soli, cukru a koření, nakrájené na kousky.'),
    preparation: c(
      'Kaštany nařízněte, upečte nebo uvařte do měkka, oloupejte obě slupky a nechte vychladnout. Plesnivé, červivé nebo uvnitř tmavé kaštany vyhoďte.',
    ),
    risks: list('C', [
      'ZÁMĚNA S KOŇSKÝM KAŠTANEM – jedovatý (escin, eskulin).',
      'Syrové kaštany obsahují třísloviny a jsou hůře stravitelné.',
      'Plísně – kaštany snadno plesniví uvnitř.',
      'Horké kaštany – nechte vychladnout.',
    ]),
    collecting: c(
      'Kaštanovník v ČR roste převážně ve vysazených porostech, parcích a sadech – sbírejte jen tam, kde to vlastník dovoluje, případně na veřejně přístupných místech.',
    ),
    habitat: b('Teplé oblasti; v ČR převážně vysazovaný v parcích, sadech a lesních porostech, místy zplaňuje.', 'kubat-2002'),
    whenToCollect: c('Září až říjen, kdy číšky praskají a kaštany samy padají.'),
    identification: {
      parts: {
        cely: 'Mohutný listnatý strom až 30 m.',
        list: 'Jednoduché, podlouhle kopinaté listy 10–25 cm s OSTRÝMI pilovitými zuby.',
        kura: 'Šedohnědá, u starších stromů hluboce brázditá, často spirálovitě.',
        kvet: 'Dlouhé vzpřímené žlutobílé jehnědy, nepříjemně páchnou (červen–červenec).',
        plod: 'Číška s HUSTÝMI jemnými ostny (jako ježek), uvnitř 1–3 hnědé lesklé plody se ŠPIČKOU (střapečkem) na vrcholu.',
      },
      lookalikes: [
        {
          name: 'Jírovec maďal (koňský kaštan)',
          latin: 'Aesculus hippocastanum',
          slug: 'kunsky-kastan',
          danger:
            'Jedovatý. DLANITĚ složené listy z 5–7 lístků, tobolka s ŘÍDKÝMI silnými ostny, semeno velké, kulaté, lesklé BEZ špičky.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002', 'frohne-pfander-2005'],
    },
    sourceIds: ['usda-fdc', 'kubat-2002', 'frohne-pfander-2005'],
    review: DRAFT,
    visual: { kind: 'nut', color: '#7A4A26', accent: '#A9B83A' },
    photos: [],
    related: ['kunsky-kastan', 'liskove-orisky', 'bukvice'],
    seo: {
      title: 'Může papoušek jedlé kaštany? | LES.cz',
      description:
        'Jedlé kaštany pro papoušky jen pečené a oloupané. Jak je připravit a hlavně jak je nezaměnit s jedovatým koňským kaštanem.',
    },
  },

  // ---------------------------------------------------------------- BUKVICE
  {
    slug: 'bukvice',
    name: 'Bukvice',
    synonyms: ['buk lesní', 'bukvičky', 'bukové oříšky'],
    latin: 'Fagus sylvatica L.',
    family: 'Fagaceae – bukovité',
    category: 'lesni-ovoce',
    tagline: 'Zboží ve stavu „čeká na posudek“. Les je má, my zatím nevíme.',
    months: [9, 10],
    shop: {
      price: 'ZDARMA',
      availability: 'NASKLADNĚNO, ALE ZATÍM NEUVOLNĚNO K VÝDEJI (září–říjen)',
      warehouse: 'Příroda, oddělení bučin',
      shipping: 'Nedoručujeme – zboží čeká na odbornou kontrolu',
      badge: 'Neověřeno',
      buyMessage:
        'Objednávka pozastavena! Bukvice máme v bučině na skladě, ale naše odborné oddělení zatím nemá dost podkladů, že jsou pro papoušky v pořádku. Do vyjasnění je vydáváme jen sojkám, veverkám a divokým prasatům. Pro vašeho papouška raději vyberte jiné zboží.',
    },
    safety: {
      level: 'neovereno',
      summary:
        'Syrové bukvice obsahují látky (uváděny saponiny, kyselina šťavelová a další), které ve větším množství vyvolávají trávicí a jiné potíže u lidí i hospodářských zvířat. Podklady pro papoušky chybí – nepodávat bez konzultace s veterinářem. Bukové větve jsou samostatná položka (buk).',
      provenance: 'C',
      sourceIds: ['cooper-johnson-1984', 'frohne-pfander-2005'],
    },
    parts: c('Do odborné kontroly nepodávat. Větve buku viz samostatný produkt.'),
    nutrition: {
      summary: c(
        'Olejnatá semena s vysokým obsahem tuku a bílkovin. Pro papoušky rozhoduje spíše otázka bezpečnosti než výživy.',
        'usda-fdc',
      ),
      values: [
        { label: 'Energie', amount: 576, unit: 'kcal' },
        { label: 'Tuk', amount: 50, unit: 'g' },
        { label: 'Bílkoviny', amount: 6.2, unit: 'g' },
      ],
      valuesBasis: 'USDA FoodData Central – bukvice, sušené (druh buku blíže neurčen). Orientační hodnoty na 100 g.',
      valuesProvenance: 'C',
      valuesSourceIds: ['usda-fdc'],
    },
    benefits: c('Přínos pro papoušky není doložen.'),
    species: {
      mali: 'Nepodávat.',
      stredni: 'Nepodávat bez konzultace s veterinářem.',
      velci: 'Nepodávat bez konzultace s veterinářem.',
      poznamka: 'Podklady pro papoušky chybí.',
      provenance: 'C',
    },
    serving: c('Do odborné kontroly nepodávat.'),
    preparation: c('Uváděné tepelné zpracování (pražení) obsah problematických látek snižuje, pro papoušky však není ověřeno.'),
    risks: list(
      'C',
      [
        'Saponiny a další látky v syrových semenech – trávicí potíže.',
        'Vysoký obsah tuku.',
        'Plísně u semen ležících dlouho na vlhké zemi.',
        'Ostnité číšky mohou poranit.',
      ],
      'cooper-johnson-1984',
      'frohne-pfander-2005',
    ),
    collecting: b(
      'Lesní plody smí každý sbírat pro vlastní potřebu (lesní zákon, § 19) – pro papoušky je ale zatím nesbírejte.',
      'zakon-lesni',
    ),
    habitat: b('Bučiny a smíšené lesy od pahorkatin do hor.', 'kubat-2002'),
    whenToCollect: c('Září až říjen (bukvice neplodí každý rok stejně – bohaté roky se střídají se slabými).'),
    identification: {
      parts: {
        cely: 'Mohutný listnatý strom až 40 m.',
        list: 'Vejčité celokrajné listy se zvlněným okrajem, mladé s jemnými brvami.',
        kura: 'Hladká, stříbřitě šedá kůra i u starých stromů.',
        plod: 'Trojhranné hnědé nažky (bukvice), po dvou ve čtyřchlopňové dřevnaté číšce s měkkými ostny.',
      },
      lookalikes: [
        {
          name: 'Žaludy',
          latin: 'Quercus sp.',
          slug: 'zaludy',
          danger: 'Jiný plod (v miskovité číšce), bohatý na třísloviny – pro papoušky rizikové.',
        },
      ],
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['cooper-johnson-1984', 'frohne-pfander-2005', 'usda-fdc', 'kubat-2002', 'zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'nut', color: '#8A5A2B', accent: '#B98B4E' },
    photos: [],
    related: ['buk', 'zaludy', 'liskove-orisky'],
    seo: {
      title: 'Může papoušek bukvice? Zatím neověřeno | LES.cz',
      description:
        'Bukvice a papoušci: proč syrová semena buku zatím nedoporučujeme a čím je nahradit. Bukové větve jsou jiná kapitola.',
    },
  },
];
