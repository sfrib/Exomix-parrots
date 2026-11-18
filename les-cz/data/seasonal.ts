import type { Season } from '@/lib/types';

export interface SeasonalCampaign {
  season: Season;
  headline: string;
  subline: string;
  /** Krátké hlášky do „skladového ticker“ pásu a na sociální sítě. */
  messages: string[];
  /** Produkty, které kampaň zvýrazňuje (slugy). */
  featured: string[];
  /** Co dělat a na co si dát pozor – odborná část kampaně. */
  tips: string[];
}

export const CAMPAIGNS: Record<Season, SeasonalCampaign> = {
  jaro: {
    season: 'jaro',
    headline: 'Nová kolekce pupenů právě dorazila.',
    subline: 'Mladé lístky jsou zpět! Příroda znovu otevřela.',
    messages: [
      'Nová kolekce pupenů právě dorazila.',
      'Mladé lístky jsou zpět! Příroda znovu otevřela.',
      'Pampelišky naskladněny po celé republice. Expedice probíhá na vlastní nohy.',
      'Kopřivy: čerstvá dodávka. Pozor, zboží kouše.',
      'Jarní úklid ve skladu: větve z ořezu sadů jen se souhlasem majitele.',
    ],
    featured: ['pupeny', 'pampeliska', 'kopriva', 'ptacinec', 'vrba', 'briza'],
    tips: [
      'Jarní zeleň zavádějte postupně – papoušek po zimě nemusí být na čerstvou zeleň zvyklý.',
      'Na jaře se v sadech stříká. Větve ze sadů berte jen tam, kde víte, že se nestříkalo.',
      'Mláďata ptáků a hnízda v keřích nerušte – sbírejte jinde.',
    ],
  },
  leto: {
    season: 'leto',
    headline: 'Čerstvé jahody naskladněny.',
    subline: 'Kurýr odmítá opustit les.',
    messages: [
      'Čerstvé jahody naskladněny. Kurýr odmítá opustit les.',
      'Borůvky momentálně vyprodány. Lesní dodavatel nestíhá.',
      'Maliny skladem. Doprava zdarma, protože žádná není.',
      'Klasy trav: letní akce pro andulky a korely.',
      'Lipový květ voní až do skladu. Expedice do konce července.',
    ],
    featured: ['lesni-jahody', 'boruvky', 'maliny', 'ostruziny', 'klasy-trav', 'lipovy-kvet'],
    tips: [
      'V horku ovoce rychle kvasí a plesniví – nesnědené zbytky odstraňujte do několika hodin.',
      'Klasy trav kontrolujte na námel (černé rohovité útvary v klasu) – takové klasy nesbírejte.',
      'Pozor na záměnu borůvek s jedovatým rulíkem zlomocným a vraním okem.',
    ],
  },
  podzim: {
    season: 'podzim',
    headline: 'Pozor! Začíná sezóna šišek.',
    subline: 'Lesní sklad hlásí plné zásoby.',
    messages: [
      'Pozor! Začíná sezóna šišek. Lesní sklad hlásí plné zásoby.',
      'Jeřabiny právě dozrávají. Naši skladníci jsou už na větvích.',
      'Podzimní výprodej! Větve padají za každého počasí.',
      'Šípky naskladněny. Reklamace trnů nepřijímáme.',
      'Listí: 100% sleva. Platí do vyprodání stromů.',
    ],
    featured: ['sisky', 'jerabiny', 'sipky', 'hloh', 'liskove-orisky', 'suche-listi'],
    tips: [
      'Podzim je sezóna plísní. Spadané plody a listí kontrolujte – nic plesnivého nepodávejte.',
      'Koňský kaštan není jedlý kaštan. Žaludy a bukvice do misky nepatří.',
      'Šišky před podáním vyčistěte; dekorační šišky se sprejem nebo třpytkami nikdy.',
    ],
  },
  zima: {
    season: 'zima',
    headline: 'Zimní zásoby větviček doplněny.',
    subline: 'Skladník má trochu omrzlé listí.',
    messages: [
      'Zimní zásoby větviček doplněny. Skladník má trochu omrzlé listí.',
      'Jeřabiny po prvních mrazech: poslední kusy na větvích.',
      'Inventura: v lese napočítáno 1 milion šišek. Plus minus.',
      'Zimní provoz: otevřeno nonstop, topení nefunguje.',
      'Šípky vydrží na keři i v zimě. Na rozdíl od skladníka.',
    ],
    featured: ['vetvicky', 'kura', 'sisky', 'sipky', 'jerabiny', 'jablon'],
    tips: [
      'V zimě je čerstvé zeleně málo – sledujte pestrost krmné dávky i jinak než lesem.',
      'Větve přinesené z mrazu nechte rozmrznout a oschnout a omyjte je.',
      'Ořez ovocných stromů probíhá v zimě – ideální zdroj větví ze sadu, kde se nestříká (se souhlasem majitele).',
    ],
  },
};

/** Lesní výprodej – humorná kategorie. Ceny jsou vždy nula, slevy vždy 100 %. */
export const CLEARANCE = {
  title: 'Lesní výprodej',
  intro:
    'Doprodej sezónního zboží. Všechny ceny jsou snížené z nuly na nulu. Sleva tedy činí 100 % z ničeho, což je podle našeho účetního oddělení pořád nic.',
  items: [
    { slug: 'suche-listi', label: 'Listí z loňské kolekce', deal: 'Sleva 100 %', note: 'Mírně použité větrem.' },
    { slug: 'sisky', label: 'Šišky – balení „co spadlo“', deal: '3 + 1 zdarma', note: 'Každá čtvrtá šiška zdarma. Ty první tři také.' },
    { slug: 'vetvicky', label: 'Větvičky po vichřici', deal: 'Doprodej', note: 'Jen suchá klest ležící na zemi. Živé větve pouze se souhlasem majitele.' },
    { slug: 'sipky', label: 'Šípky po prvním mrazu', deal: 'Poslední kusy', note: 'Měkčí, sladší, skladník je už nestíhá sbírat.' },
    { slug: 'kura', label: 'Kůra – druhá jakost', deal: 'Outlet', note: 'Kůra ze spadlých větví bezpečných dřevin. Bez plísní a lišejníků.' },
    { slug: 'klasy-trav', label: 'Klasy trav – letní kolekce', deal: 'Doprodej do září', note: 'Kontrola na námel povinná.' },
  ],
};
