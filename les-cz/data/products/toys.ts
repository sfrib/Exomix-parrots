import type { Product } from '@/lib/types';
import { b, c, DRAFT, list } from '../helpers';

/**
 * D. PŘÍRODNÍ HRAČKY
 */
export const TOYS: Product[] = [
  {
    slug: 'sisky',
    name: 'Šišky',
    synonyms: ['smrková šiška', 'borová šiška', 'modřínová šiška', 'šiška'],
    latin: 'Picea abies (L.) H. Karst., Pinus sylvestris L., Larix decidua Mill.',
    family: 'Pinaceae – borovicovité',
    category: 'prirodni-hracky',
    tagline: 'Pozor! Začíná sezóna šišek. Lesní sklad hlásí plné zásoby.',
    months: [1, 2, 3, 9, 10, 11, 12],
    shop: {
      price: 'ZDARMA',
      availability: 'PLNÉ ZÁSOBY (podzim–jaro)',
      warehouse: 'Příroda, oddělení jehličnatých lesů, regál „pod stromem“',
      shipping: 'Vlastní nohy, gravitace dopraví zboží až na zem',
      badge: 'Sezóna šišek',
      buyMessage:
        'Objednávka přijata! Šišky leží připravené pod stromy. Expedici zajistila gravitace, vyzvednutí je na vás. Dekorační šišky se třpytkami prosíme reklamujte rovnou v koši.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Přírodní šišky smrku, borovice a modřínu jsou chovateli běžně používané jako hračka k rozebírání. Podmínkou je čistota a žádné povrchové úpravy.',
      provenance: 'C',
    },
    parts: c('Celé dozrálé, spadané šišky (rozebírání šupin, schovávání pamlsků mezi šupiny).'),
    nutrition: {
      summary: c('Nejde o krmivo – šiška slouží jako hračka. Semena v šiškách bývají většinou vypadaná.'),
    },
    benefits: c('Přirozené ničení a rozebírání, příležitost k hledání pamlsků (foraging) a zaměstnání zobáku.'),
    species: {
      mali: 'Vhodné menší šišky (modřín, menší borové) – spíš k okusování než k rozebírání.',
      stredni: 'Vhodné – borové a modřínové šišky.',
      velci: 'Vhodné – i velké smrkové šišky, rychle je rozeberou.',
      provenance: 'C',
    },
    serving: c('Celou šišku vložte do klece nebo zavěšte; mezi šupiny lze zastrčit kousek pamlsku.'),
    preparation: c(
      'Šišky očistěte kartáčem a opláchněte. Chovatelé je často prohřívají v troubě při nízké teplotě (zhruba do 100 °C, hodinu, s dohledem), aby se zbavily hmyzu a část pryskyřice zaschla. Doporučený postup je potřeba ověřit; trouba nesmí být s nepřilnavým povrchem přehřátá.',
    ),
    risks: list('C', [
      'Dekorační šišky (barvy, laky, třpytky, vonné oleje) – nikdy nepodávat.',
      'Lepkavá pryskyřice na čerstvých zelených šiškách – lepí peří.',
      'Plíseň u šišek z vlhkých míst.',
      'Šišky z okolí silnic a ošetřovaných ploch.',
      'Přehřátí nepřilnavých (PTFE) povrchů v kuchyni uvolňuje výpary nebezpečné pro ptáky.',
    ], 'harrison-lightfoot-2006'),
    collecting: b(
      'Spadané šišky ze země lze sbírat bez trhání ze stromu; na cizím pozemku a v chráněných územích dodržujte pravidla vlastníka a území.',
      'zakon-lesni',
    ),
    habitat: b('Smrkové, borové a smíšené lesy, parky, aleje modřínů.', 'kubat-2002'),
    whenToCollect: c('Od podzimu do jara, za sucha; nejlepší jsou suché otevřené šišky.'),
    identification: {
      parts: {
        cely: 'Vhodná šiška: suchá, čistá, bez plísně, bez barev a vůní. Nevhodná: vlhká, zapáchající, s bílým nebo zeleným povlakem, upravená pro dekoraci.',
        plod: 'Smrková šiška je podlouhlá, převislá, s tenkými šupinami; borová krátká, vejčitá, s tvrdými šupinami se štítkem; modřínová malá, vejčitá, vzpřímená na větvičkách.',
      },
      provenance: 'B',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['kubat-2002', 'zakon-lesni', 'harrison-lightfoot-2006'],
    review: DRAFT,
    visual: { kind: 'cone', color: '#8B5A2B', accent: '#C9A26B' },
    photos: [],
    related: ['smrk-a-borovice', 'vetvicky', 'kura'],
    seo: {
      title: 'Jsou šišky bezpečné pro papoušky? | LES.cz',
      description:
        'Šišky jako hračka pro papoušky: které jsou vhodné, jak je vyčistit a proč nikdy nepoužívat dekorační šišky. Gravitace doručuje zdarma.',
    },
  },
  {
    slug: 'vetvicky',
    name: 'Větvičky k okusování',
    synonyms: ['větve', 'větvičky', 'okusové větve', 'bidýlka', 'proutí'],
    latin: 'různé druhy (např. Betula, Salix, Corylus, Malus, Tilia)',
    family: 'různé čeledi',
    category: 'prirodni-hracky',
    tagline: 'Zimní zásoby větviček doplněny. Skladník má trochu omrzlé listí.',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    shop: {
      price: 'ZDARMA',
      availability: 'SKLADEM CELOROČNĚ',
      warehouse: 'Příroda, oddělení stromů a keřů, regál „bezpečné dřeviny“',
      shipping: 'Vlastní nohy + nůžky (a souhlas vlastníka stromu)',
      badge: 'Celoročně',
      buyMessage:
        'Objednávka přijata! Větvičky čekají na stromě. Upozornění: živé větve smíte řezat jen se souhlasem majitele stromu – i v lese má každý strom svého pána.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Čerstvé větvičky vybraných stromů (bříza, vrba, líska, jabloň, lípa a další) jsou v chovu papoušků běžnou a doporučovanou formou obohacení. Bezpečnost závisí vždy na konkrétním druhu – viz jednotlivé stromy.',
      provenance: 'C',
    },
    parts: c('Mladé i starší větvičky s kůrou, pupeny a listy u druhů, kde jsou listy vhodné.'),
    nutrition: {
      summary: c('Nejde o hlavní krmivo; kůra, pupeny a lýko jsou spíše doplňkem a hlavně zaměstnáním.'),
    },
    benefits: c('Přirozené okusování, opotřebení zobáku, různé průměry bidýlek pro zdraví nohou, prevence nudy a stereotypního chování.'),
    species: {
      mali: 'Vhodné tenké větvičky a jemné proutí (vrba, bříza).',
      stredni: 'Vhodné větvičky středního průměru.',
      velci: 'Vhodné silnější větve – rozkousají je rychle, počítejte s častou výměnou.',
      poznamka: 'Seznam dřevin, které považujeme za vhodné, a těch, kterým se vyhnout, najdete v kategorii Větve a stromy a v Rizikovém zboží.',
      provenance: 'C',
    },
    serving: c('Větvičky zavěste nebo připevněte jako bidýlka různých průměrů; zbytky po okousání pravidelně vyměňujte.'),
    preparation: c(
      'Větve očistěte kartáčem, omyjte horkou vodou a nechte oschnout. Chovatelé je někdy krátce spaří nebo nechají vyschnout na slunci; účinnost proti parazitům je potřeba ověřit.',
    ),
    risks: list('C', [
      'Nesprávně určený strom (např. tis, akát, peckoviny) – viz Rizikové zboží.',
      'Stříkané ovocné stromy a dřeviny u silnic.',
      'Plíseň, houby a lišejníky na kůře.',
      'Trusem znečištěné větve (divocí ptáci) – omýt.',
    ]),
    collecting: b(
      'Ze země lze pro vlastní potřebu sbírat suchou ležící klest. Živé větve stříhejte jen se souhlasem vlastníka stromu; stromy nepoškozujte (lesní zákon, § 20).',
      'zakon-lesni',
    ),
    habitat: c('Vlastní zahrada, sad s neošetřenými stromy (se svolením majitele), prořezávky.'),
    whenToCollect: c('Celoročně; na jaře s pupeny, v zimě při prořezávce ovocných stromů.'),
    identification: {
      parts: {
        cely: 'Pokud si druhem stromu nejste jistí, větve nepoužívejte. Strom určete podle listů, kůry a plodů – viz produktové karty jednotlivých stromů.',
        vetev: 'Vhodná větev: zdravá, bez plísně, bez lepkavých výpotků, bez hub a lišejníků, z neošetřeného stromu.',
      },
      provenance: 'C',
    },
    sourceIds: ['zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'branch', color: '#7A5634', accent: '#6C9A47' },
    photos: [],
    related: ['briza', 'vrba', 'liska', 'jablon', 'lipa'],
    seo: {
      title: 'Jaké větve může papoušek okusovat? | LES.cz',
      description:
        'Větvičky pro papoušky: které stromy jsou vhodné, jak větve připravit a proč nikdy neřezat cizí strom bez dovolení.',
    },
  },
  {
    slug: 'kura',
    name: 'Kůra',
    synonyms: ['kůra stromů', 'lýko', 'borka'],
    latin: 'různé druhy bezpečných dřevin',
    family: 'různé čeledi',
    category: 'prirodni-hracky',
    tagline: 'Přírodní obal, který se dá sloupnout. Bez plastu, bez lepidla.',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    shop: {
      price: 'ZDARMA',
      availability: 'SKLADEM (dodáváme jen s celou větví)',
      warehouse: 'Příroda, oddělení stromů, sekce „vnější obal“',
      shipping: 'Vlastní nohy – kůru ze živých stromů neloupeme',
      buyMessage:
        'Objednávka přijata! Kůru dodáváme výhradně s větví, ze které ji papoušek oloupe sám. Loupání kůry ze živých stromů v lese je zakázané – strom by to nepřežil a lesník by vás nepřežil taky.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Kůra na větvích vhodných dřevin je přirozenou součástí okusování. Rozhoduje druh stromu a čistota – kůra s houbami a lišejníky se nepodává.',
      provenance: 'C',
    },
    parts: c('Kůra na větvích a spadlých kusech dřeva z vhodných dřevin.'),
    nutrition: {
      summary: c('Hlavně vláknina; nutričně zanedbatelná, význam je v činnosti.'),
    },
    benefits: c('Loupání kůry je pro mnoho druhů oblíbená činnost a zaměstnává zobák.'),
    species: {
      mali: 'Vhodná tenká kůra na proutí a tenkých větvičkách.',
      stredni: 'Vhodná.',
      velci: 'Vhodná – i silnější kusy.',
      provenance: 'C',
    },
    serving: c('Ponechte kůru na větvi; volné kusy z čistých spadlých větví lze vložit do hledací krabice.'),
    preparation: c('Kartáčem odstraňte nečistoty, omyjte horkou vodou a nechte vyschnout. Kusy s plísní, houbou nebo lišejníkem vyřaďte.'),
    risks: list('C', [
      'Kůra jedovatých dřevin (tis, akát, peckoviny) – viz Rizikové zboží.',
      'Houby, plísně a lišejníky.',
      'Hmyz pod kůrou (kůrovci) – kůra ze suchých smrků není vhodná.',
    ]),
    collecting: b(
      'Kůru ze živých stromů neloupejte – poškozování stromů zakazuje lesní zákon (§ 20). Sbírejte jen spolu se suchou klestí ležící na zemi nebo z vlastních prořezávek.',
      'zakon-lesni',
    ),
    habitat: c('Vlastní zahrada, prořezávky, suchá klest na zemi v lese.'),
    whenToCollect: c('Celoročně za sucha.'),
    identification: {
      parts: {
        kura: 'Vhodná kůra: suchá nebo čerstvá, pevná, bez povlaků, bez zápachu. Nevhodná: s bílým nebo zeleným povlakem, s plodnicemi hub, lišejníky nebo chodbičkami hmyzu.',
      },
      provenance: 'C',
    },
    sourceIds: ['zakon-lesni'],
    review: DRAFT,
    visual: { kind: 'bark', color: '#6B4A2B', accent: '#A88B63' },
    photos: [],
    related: ['vetvicky', 'briza', 'vrba'],
    seo: {
      title: 'Kůra stromů pro papoušky | LES.cz',
      description:
        'Kůra jako přírodní hračka pro papoušky: z jakých stromů, jak ji očistit a proč ji nikdy neloupat ze živých stromů.',
    },
  },
  {
    slug: 'suche-listi',
    name: 'Suché listí',
    synonyms: ['listí', 'spadané listí', 'suché listy'],
    latin: 'různé druhy bezpečných dřevin',
    family: 'různé čeledi',
    category: 'prirodni-hracky',
    tagline: 'Podzimní výprodej! Listí padá za každého počasí.',
    months: [9, 10, 11],
    shop: {
      price: 'ZDARMA',
      availability: 'VÝPRODEJ (září–listopad)',
      warehouse: 'Příroda, oddělení podzimních kolekcí, regál „na zemi“',
      shipping: 'Vlastní nohy + papírový sáček',
      badge: 'Výprodej',
      buyMessage:
        'Objednávka přijata! Listí právě padá – čím později přijdete, tím víc ho bude. Na mokré a plesnivé kusy se reklamace nevztahuje, ty prosím v lese nechte.',
    },
    safety: {
      level: 'stridme',
      summary:
        'Suché, čisté listy vhodných stromů se používají jako výplň hledacích krabic. Hlavním rizikem je plíseň – spadané listí z vlhkého lesa často není vhodné.',
      provenance: 'C',
    },
    parts: c('Suché, čisté listy vhodných dřevin (např. bříza, lípa, líska, javor je sporný – viz karty stromů).'),
    nutrition: {
      summary: c('Slouží jako materiál k činnosti, ne jako krmivo.'),
    },
    benefits: c('Šustivá výplň pro hledání pamlsků (foraging), trhání a hnízdní chování.'),
    species: {
      mali: 'Střídmě – malé množství v hledací misce.',
      stredni: 'Střídmě – výplň krabičky.',
      velci: 'Střídmě – výplň hledací krabice.',
      poznamka: 'Nepoužívejte listí jako stálou podestýlku – vlhne a plesniví.',
      provenance: 'C',
    },
    serving: c('Do krabičky nebo misky vložte suché listy a mezi ně schovejte pamlsky; po použití vyhoďte.'),
    preparation: c('Sbírejte listí, které je suché už na stromě nebo hned po spadnutí; doma ho rozprostřete a nechte proschnout. Prohlédněte, zda není plesnivé.'),
    risks: list('C', [
      'Plíseň – spadané listí z vlhkého prostředí může obsahovat spory hub (riziko aspergilózy).',
      'Listí jedovatých stromů (tis, peckoviny, akát, javor klen) – nepoužívat.',
      'Listí z okolí silnic a ošetřovaných zahrad.',
    ], 'harrison-lightfoot-2006'),
    collecting: b('Spadané listí v lese smíte sebrat v malém množství pro vlastní potřebu bez poškozování lesa.', 'zakon-lesni'),
    habitat: c('Listnaté lesy, parky, vlastní zahrada.'),
    whenToCollect: c('Září až listopad, výhradně za suchého počasí.'),
    identification: {
      parts: {
        list: 'Vhodný list: suchý, pružný nebo křehký, bez skvrn, bez povlaku a zatuchlého zápachu. Nevhodný: vlhký, slepený, černě skvrnitý, s bílým povlakem.',
      },
      provenance: 'C',
    },
    sourceIds: ['zakon-lesni', 'harrison-lightfoot-2006'],
    review: DRAFT,
    visual: { kind: 'leaf', color: '#C7782E', accent: '#8E5A2A' },
    photos: [],
    related: ['briza', 'lipa', 'liska'],
    seo: {
      title: 'Suché listí jako hračka pro papoušky | LES.cz',
      description:
        'Suché listí do hledacích krabic pro papoušky: které listy použít, jak je usušit a proč pozor na plíseň.',
    },
  },
  {
    slug: 'seno-a-sucha-trava',
    name: 'Seno a suchá tráva',
    synonyms: ['seno', 'suchá tráva', 'luční seno'],
    latin: 'směs lučních trav a bylin (Poaceae a další)',
    family: 'Poaceae – lipnicovité a další',
    category: 'prirodni-hracky',
    tagline: 'Šustí, voní, nepráší. Pokud práší, vracíme ho louce.',
    months: [6, 7, 8, 9],
    shop: {
      price: 'ZDARMA (při vlastním sušení)',
      availability: 'SKLADEM PO SENOSEČI (červen–září)',
      warehouse: 'Příroda, oddělení luk, sekce „posekáno“',
      shipping: 'Vlastní nohy, souhlas majitele louky',
      buyMessage:
        'Objednávka přijata! Seno je připraveno k vyzvednutí – pokud vám majitel louky dovolí. Upozornění: zaprášené a zatuchlé seno lesní sklad nevydává.',
    },
    safety: {
      level: 'stridme',
      summary:
        'Suchou trávu a seno lze použít jako materiál ke trhání a do hnízdních budek jen ve výborné kvalitě. Plesnivé nebo prašné seno je zdrojem spor plísní (Aspergillus) a riziko aspergilózy u ptáků.',
      provenance: 'B',
      sourceIds: ['harrison-lightfoot-2006'],
    },
    parts: c('Suchá stébla, listy a klásky trav bez plísně a prachu.'),
    nutrition: {
      summary: c('Především vláknina; jako krmivo pro papoušky nemá význam.'),
    },
    benefits: c('Materiál k trhání, splétání a vystýlání; u některých druhů podporuje hnízdní chování (to není vždy žádoucí).'),
    species: {
      mali: 'Střídmě – jen malé svazky čistých stébel.',
      stredni: 'Střídmě.',
      velci: 'Střídmě.',
      poznamka: 'U ptáků s respiračními problémy nepoužívat.',
      provenance: 'C',
    },
    serving: c('Malý svazek stébel nebo výplň hledací krabice; nepoužívat jako podestýlku na dno klece.'),
    preparation: c('Seno musí být suché, zelenavé až světle žluté, vonět čerstvě a při protřepání neprášit. Skladujte v suchu a vzdušně.'),
    risks: list(
      'B',
      [
        'Plíseň a spory Aspergillus – riziko aspergilózy (onemocnění dýchacích cest ptáků).',
        'Prach dráždí dýchací cesty.',
        'Ostré osiny některých trav.',
        'Jedovaté byliny přimíchané v seně.',
      ],
      'harrison-lightfoot-2006',
    ),
    collecting: c('Trávu sbírejte a sušte sami z čistých luk se souhlasem vlastníka, nebo použijte kontrolované seno pro hlodavce.'),
    habitat: c('Louky a pastviny mimo silnice a hnojené plochy.'),
    whenToCollect: c('Po senoseči za suchého počasí; sušit rychle a ve vrstvě, která se nezapaří.'),
    identification: {
      parts: {
        cely: 'Vhodné seno: suché, voňavé, zelenavé, bez prachu. Nevhodné: zatuchlé, šedé, s bílými nebo zelenými povlaky, vlhké uprostřed balíku, prašné.',
      },
      provenance: 'C',
    },
    sourceIds: ['harrison-lightfoot-2006'],
    review: DRAFT,
    visual: { kind: 'grass', color: '#C9B36A', accent: '#7E9A4A' },
    photos: [],
    related: ['klasy-trav', 'plisne'],
    seo: {
      title: 'Seno a suchá tráva pro papoušky | LES.cz',
      description:
        'Seno a suchá tráva jako hračka pro papoušky: jak poznat kvalitní seno a proč plesnivé seno znamená riziko aspergilózy.',
    },
  },
  {
    slug: 'klasy-trav',
    name: 'Klasy trav a jitrocele',
    synonyms: ['klasy', 'travní semena', 'lata', 'klásky', 'semena trav'],
    latin: 'Poaceae (např. Poa, Dactylis, Lolium, Phleum) a Plantago spp.',
    family: 'Poaceae – lipnicovité; Plantaginaceae – jitrocelovité',
    category: 'prirodni-hracky',
    tagline: 'Samoobslužný bufet pro malé zobáky. Semínka si každý vyloupe sám.',
    months: [6, 7, 8, 9],
    shop: {
      price: 'ZDARMA',
      availability: 'SKLADEM (červen–září)',
      warehouse: 'Příroda, oddělení luk, sekce „ještě neposekáno“',
      shipping: 'Vlastní nohy',
      badge: 'Oblíbené u andulek',
      buyMessage:
        'Objednávka přijata! Klasy jsou připraveny k vyzvednutí na louce. Kontrola kvality: černé „rohy“ v klasech (námel) jsou vadné zboží – takové klasy vyhoďte.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Zelené i dozrálé klasy lučních trav a jitrocele jsou oblíbené u malých papoušků. Je nutné kontrolovat námel (paličkovice nachová) – je toxický.',
      provenance: 'C',
      sourceIds: ['cooper-johnson-1984', 'frohne-pfander-2005'],
    },
    parts: c('Klasy a laty se semeny v mléčné až plné zralosti.'),
    nutrition: {
      summary: c('Semena trav jsou škrobovitá, v mléčné zralosti šťavnatější a měkčí. Ověřené hodnoty pro plané druhy nemáme.'),
    },
    benefits: c('Přirozené vyklovávání semen – pro andulky, korely a další trávojedné druhy velmi přirozená činnost.'),
    species: {
      mali: 'Vhodné – andulky, korely, agapornisové, neofémy a papoušíčci je obvykle milují.',
      stredni: 'Vhodné jako zpestření.',
      velci: 'Spíše jako hračka; semena jsou pro ně drobná.',
      provenance: 'C',
    },
    serving: c('Svazek klasů zavěšený v kleci nebo vložený do hračky; podávejte čerstvé.'),
    preparation: c('Každý klas prohlédněte: odstraňte klasy s námelem (černé až fialové rohovité útvary místo zrn), plesnivé a slepené klasy. Opláchněte a osušte.'),
    risks: list(
      'B',
      [
        'Námel (sklerocia paličkovice nachové, Claviceps purpurea) – obsahuje námelové alkaloidy, toxické pro zvířata i člověka.',
        'Plíseň na klasech po deštích.',
        'Trávy z okrajů silnic a polí (postřiky, emise).',
      ],
      'cooper-johnson-1984',
      'frohne-pfander-2005',
    ),
    collecting: c('Trhejte jen klasy, sbírejte na neošetřených loukách před senosečí, se souhlasem vlastníka pozemku.'),
    habitat: b('Louky, pastviny, meze, lesní okraje.', 'kubat-2002'),
    whenToCollect: c('Červen až září, za sucha; nejoblíbenější jsou klasy v mléčné zralosti.'),
    identification: {
      parts: {
        cely: 'Vhodný klas: zelený až zlatavý, semena plná, bez povlaku.',
        plod: 'Nevhodný klas: místo některých zrn černé až tmavě fialové, rovné nebo zahnuté „rohy“ delší než zrna – to je námel. Takový klas i ostatní z téže trsy vyhoďte.',
      },
      lookalikes: [
        {
          name: 'Námel (paličkovice nachová)',
          latin: 'Claviceps purpurea',
          danger: 'Houba napadající klasy trav a obilí; její sklerocia jsou toxická. Pozor hlavně po vlhkém období kvetení trav.',
        },
      ],
      provenance: 'B',
      sourceIds: ['cooper-johnson-1984', 'frohne-pfander-2005'],
    },
    sourceIds: ['cooper-johnson-1984', 'frohne-pfander-2005', 'kubat-2002'],
    review: DRAFT,
    visual: { kind: 'grass', color: '#B9A456', accent: '#5E8C3E' },
    photos: [],
    related: ['jitrocel', 'seno-a-sucha-trava', 'ptacinec'],
    seo: {
      title: 'Klasy trav pro andulky a korely | LES.cz',
      description:
        'Klasy lučních trav a jitrocele pro malé papoušky: jak je sbírat, kdy jsou nejlepší a jak poznat toxický námel.',
    },
  },
  {
    slug: 'prirodni-vlakna',
    name: 'Přírodní vlákna a provázky',
    synonyms: ['juta', 'sisal', 'bavlněný provázek', 'lýko', 'provázek'],
    latin: 'jutovník, agáve sisalová, bavlník a další (zpracovaná vlákna)',
    family: 'různé čeledi',
    category: 'prirodni-hracky',
    tagline: 'Jediné zboží, které les nevede. Skladník se omlouvá a odkazuje na železářství.',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    shop: {
      price: 'ZDARMA… ale ne v lese',
      availability: 'V LESE NEVEDEME',
      warehouse: 'Mimo les – tohle zboží příroda sama neplete',
      shipping: 'Neposíláme. Les provázky nevyrábí, jen pavouci a ti nespolupracují.',
      buyMessage:
        'Objednávku bohužel nelze vyřídit – les provázky nevyrábí a pavouci odmítli spolupráci. Pokud vlákna používáte, pak jen krátké kousky a pod dohledem.',
    },
    safety: {
      level: 'neovereno',
      summary:
        'Přírodní provázky a vlákna jsou v hračkách pro papoušky běžná, ale nesou riziko zamotání (uškrcení, zaškrcení prstů) a spolknutí vláken s ucpáním volete nebo trávicího traktu. Bez dohledu nepoužívat.',
      provenance: 'C',
    },
    parts: c('Krátké kousky neobarvených přírodních vláken jako součást hraček (k rozplétání), ne volně visící dlouhé provázky.'),
    nutrition: {
      summary: c('Nemá nutriční hodnotu; vlákna nejsou krmivo.'),
    },
    benefits: c('Rozplétání a trhání může být zajímavou činností – ale vždy existují bezpečnější alternativy (větvičky, kůra, šišky).'),
    species: {
      mali: 'Neověřeno – riziko zamotání je u malých druhů vysoké, raději nepoužívat.',
      stredni: 'Neověřeno – jen krátké kousky pod dohledem.',
      velci: 'Neověřeno – jen krátké kousky pod dohledem, pravidelně kontrolovat roztřepení.',
      provenance: 'C',
    },
    serving: c('Pouze krátké uzlíky nebo kousky vpletené do hračky; roztřepené provázky ihned odstraňte.'),
    preparation: c('Jen neobarvená, neimpregnovaná, nebělená vlákna bez olejů a vůní.'),
    risks: list('C', [
      'Zamotání a uškrcení, zaškrcení prstů nebo nohou dlouhými vlákny.',
      'Spolknutí vláken – riziko ucpání volete nebo střev.',
      'Impregnace, barviva a oleje (např. jutový olej) v průmyslových vláknech.',
    ]),
    collecting: c('Nesbírá se v přírodě. Pokud kupujete, volte výrobky určené pro ptáky s deklarovaným složením.'),
    habitat: c('V lese nevedeme.'),
    whenToCollect: c('Kdykoli – v železářství, ne v lese.'),
    identification: {
      parts: {
        cely: 'Vhodné: krátké, pevné, neobarvené kousky. Nevhodné: dlouhé visící provázky, roztřepená vlákna, syntetická nebo barvená vlákna, provázky s vůní nebo olejem.',
      },
      provenance: 'C',
    },
    sourceIds: [],
    review: DRAFT,
    visual: { kind: 'grass', color: '#B89B6A', accent: '#6B4A2B' },
    photos: [],
    related: ['vetvicky', 'kura', 'sisky'],
    seo: {
      title: 'Provázky a vlákna pro papoušky – rizika | LES.cz',
      description:
        'Jsou provázky z juty a sisalu bezpečné pro papoušky? Rizika zamotání a spolknutí vláken a bezpečnější přírodní alternativy.',
    },
  },
  {
    slug: 'pupeny',
    name: 'Pupeny a mladé lístky',
    synonyms: ['pupeny', 'rašící listy', 'jarní výhonky', 'mladé listy'],
    latin: 'různé druhy bezpečných dřevin (např. Betula, Salix, Corylus, Tilia, Malus)',
    family: 'různé čeledi',
    category: 'prirodni-hracky',
    tagline: 'Nová kolekce pupenů právě dorazila. Mladé lístky jsou zpět – příroda znovu otevřela.',
    months: [3, 4, 5],
    shop: {
      price: 'ZDARMA',
      availability: 'JARNÍ KOLEKCE (březen–květen)',
      warehouse: 'Příroda, oddělení jarních novinek',
      shipping: 'Vlastní nohy + nůžky (a souhlas majitele stromu)',
      badge: 'Jarní novinka',
      buyMessage:
        'Objednávka přijata! Nová kolekce pupenů je připravena na větvích. Rychle, než se z novinek stanou obyčejné listy. Pupeny peckovin (třešeň, švestka, střemcha) v nabídce záměrně nemáme.',
    },
    safety: {
      level: 'doporuceno',
      summary:
        'Pupeny a mladé lístky na větvičkách vhodných dřevin jsou oblíbené jarní obohacení. Platí jen pro dřeviny vedené jako vhodné; pupeny peckovin a jiných rizikových dřevin vylučujeme.',
      provenance: 'C',
    },
    parts: c('Větvičky s rašícími pupeny a mladými listy vhodných dřevin (bříza, vrba, líska, lípa, jabloň, hrušeň).'),
    nutrition: {
      summary: c('Mladé pletivo je měkčí a šťavnatější než starší listy; konkrétní nutriční údaje pro jednotlivé druhy nemáme ověřené.'),
    },
    benefits: c('Jarní zpestření, rozebírání pupenů zobákem, přirozená sezónní změna v nabídce.'),
    species: {
      mali: 'Vhodné – tenké větvičky s pupeny (vrba, bříza).',
      stredni: 'Vhodné.',
      velci: 'Vhodné – celé větve s pupeny.',
      provenance: 'C',
    },
    serving: c('Celou větvičku s pupeny vložte do klece nebo zavěste; nespotřebované zbytky po zvadnutí odstraňte.'),
    preparation: c('Omýt a osušit; větve jen z neošetřených stromů (ovocné stromy se na jaře často stříkají).'),
    risks: list('C', [
      'Pupeny peckovin (třešeň, višeň, švestka, meruňka, střemcha) – obsahují kyanogenní glykosidy, nepodávat.',
      'Postřiky ovocných stromů v předjaří a na jaře.',
      'Záměna dřeviny – v době rašení chybí listy, určujte podle kůry a stavby pupenů.',
    ], 'frohne-pfander-2005'),
    collecting: b('Živé větve stříhejte jen se souhlasem vlastníka stromu a strom nepoškozujte.', 'zakon-lesni'),
    habitat: c('Vlastní zahrada, sad s neošetřenými stromy, prořezávky.'),
    whenToCollect: c('Březen až květen, podle druhu a počasí.'),
    identification: {
      parts: {
        vetev: 'Pupeny určujte podle druhu stromu: vrba má pupeny kryté jedinou šupinou, líska vejčité pupeny a v předjaří jehnědy, bříza drobné lepkavé pupeny a bílou kůru.',
        list: 'Mladé listy by měly být zdravé, bez mšic a lepkavé medovice.',
      },
      lookalikes: [
        {
          name: 'Střemcha a peckoviny',
          slug: 'stremcha-a-pecky',
          danger: 'Pupeny a mladé listy peckovin obsahují kyanogenní glykosidy. V době rašení lze peckoviny zaměnit – při pochybnostech větev nepoužívejte.',
        },
      ],
      provenance: 'C',
      sourceIds: ['kubat-2002'],
    },
    sourceIds: ['zakon-lesni', 'frohne-pfander-2005', 'kubat-2002'],
    review: DRAFT,
    visual: { kind: 'branch', color: '#7A5634', accent: '#9CCB5C' },
    photos: [],
    related: ['vrba', 'briza', 'liska', 'lipa', 'jablon'],
    seo: {
      title: 'Pupeny a mladé lístky pro papoušky | LES.cz',
      description:
        'Jarní pupeny a mladé lístky pro papoušky: z jakých stromů ano, proč ne peckoviny a jak větve připravit. Nová jarní kolekce.',
    },
  },
];
