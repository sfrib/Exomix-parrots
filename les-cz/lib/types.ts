/**
 * Datový model LES.cz – centrální databáze přírodních materiálů pro papoušky.
 *
 * Každý obsahový údaj nese PŮVOD (provenance), aby bylo na webu vždy vidět,
 * odkud informace pochází a zda je ověřená:
 *
 *   A = převzato z projektu ExoMix (repozitář sfrib/exomix-parrots)
 *   B = dohledáno v odborné literatuře (zdroj uveden v `sourceIds`)
 *   C = nutno ověřit (pracovní text, odborná kontrola zatím neproběhla)
 */

export type Provenance = 'A' | 'B' | 'C';

export type CategorySlug =
  | 'lesni-ovoce'
  | 'vetve-a-stromy'
  | 'bylinky-a-plane-rostliny'
  | 'prirodni-hracky'
  | 'rizikove-zbozi';

export type Season = 'jaro' | 'leto' | 'podzim' | 'zima';

/**
 * Úroveň bezpečnosti.
 *  - doporuceno: v odborné literatuře a chovatelské praxi běžně podáváno; i tak platí střídmost a správná příprava
 *  - stridme:   lze podávat jen omezeně / jen určitou část / jen po úpravě
 *  - neovereno: podklady jsou rozporné nebo chybí – nepodávat bez konzultace s veterinářem
 *  - rizikove:  toxické nebo prokazatelně nevhodné – nepodávat
 */
export type SafetyLevel = 'doporuceno' | 'stridme' | 'neovereno' | 'rizikove';

/** Skupiny papoušků podle kategorií používaných v ExoMixu (src/types/types.ts). */
export type ParrotGroup = 'mali' | 'stredni' | 'velci';

/** Text s uvedeným původem. */
export interface Sourced {
  text: string;
  provenance: Provenance;
  sourceIds?: string[];
}

/** Seznam položek s uvedeným původem. */
export interface SourcedList {
  items: string[];
  provenance: Provenance;
  sourceIds?: string[];
}

export interface NutrientValue {
  label: string;
  amount: number;
  unit: string;
}

export interface Nutrition {
  /** Slovní nutriční charakteristika. */
  summary: Sourced;
  /** Důležité živiny – orientační hodnoty na 100 g čerstvé hmoty. */
  values?: NutrientValue[];
  /** Ke kterému záznamu se hodnoty vztahují (např. „USDA FDC – jahody, syrové; pěstovaná odrůda“). */
  valuesBasis?: string;
  valuesProvenance?: Provenance;
  valuesSourceIds?: string[];
}

export interface SpeciesSuitability {
  mali: string;
  stredni: string;
  velci: string;
  poznamka?: string;
  provenance: Provenance;
  sourceIds?: string[];
}

export type IdentificationPart = 'cely' | 'list' | 'kura' | 'vetev' | 'kvet' | 'plod';

export interface Identification {
  /** Popis určovacích znaků podle částí rostliny. */
  parts: Partial<Record<IdentificationPart, string>>;
  /** Možné záměny – hlavně s jedovatými rostlinami. */
  lookalikes?: Array<{ name: string; latin?: string; slug?: string; danger: string }>;
  provenance: Provenance;
  sourceIds?: string[];
}

export interface Photo {
  src: string;
  alt: string;
  part: IdentificationPart;
  author: string;
  license: string;
  sourceUrl?: string;
}

export type IllustrationKind =
  | 'berry'
  | 'leaf'
  | 'branch'
  | 'flower'
  | 'cone'
  | 'nut'
  | 'grass'
  | 'bark'
  | 'herb'
  | 'warning';

export interface ShopInfo {
  /** Humorná „cena“, obvykle „ZDARMA“. */
  price: string;
  /** Např. „NASKLADNĚNO V LESE“, „VYPRODÁNO DO JARA“. */
  availability: string;
  /** Např. „Příroda, oddělení lesních mýtin“. */
  warehouse: string;
  /** Např. „Vlastní nohy“. */
  shipping: string;
  /** Krátký marketingový štítek na kartě (např. „Novinka“, „Hit sezóny“). */
  badge?: string;
  /** Text po kliknutí na KOUPIT (bez právního dovětku – ten doplní komponenta). */
  buyMessage: string;
}

export interface ReviewStatus {
  status: 'navrh' | 'v-kontrole' | 'overeno';
  /** ISO datum poslední odborné kontroly; null = kontrola zatím neproběhla. */
  reviewedAt: string | null;
  reviewer: string | null;
}

export interface Product {
  slug: string;
  /** Český název. */
  name: string;
  /** Další české názvy a lidové názvy (pro vyhledávání). */
  synonyms?: string[];
  /** Latinský botanický název. */
  latin: string;
  /** Čeleď (latinsky – česky). */
  family: string;
  category: CategorySlug;
  /** Vtipný „produktový“ podtitulek. */
  tagline: string;
  /** Měsíce (1–12), kdy je vhodné sbírat / „naskladněno“. */
  months: number[];
  shop: ShopInfo;
  safety: { level: SafetyLevel; summary: string; provenance: Provenance; sourceIds?: string[] };
  /** Část rostliny vhodná k použití (u rizikového zboží: která část je nebezpečná). */
  parts: Sourced;
  nutrition: Nutrition;
  benefits: Sourced;
  species: SpeciesSuitability;
  serving: Sourced;
  preparation: Sourced;
  risks: SourcedList;
  collecting: Sourced;
  habitat: Sourced;
  whenToCollect: Sourced;
  identification: Identification;
  /** Informace převzaté z ExoMixu (A). */
  exomix?: string[];
  /** Všechny zdroje použité u produktu. */
  sourceIds: string[];
  review: ReviewStatus;
  visual: { kind: IllustrationKind; color: string; accent: string };
  photos: Photo[];
  related?: string[];
  seo?: { title?: string; description?: string };
}

export interface Source {
  id: string;
  /** Bibliografická citace. */
  citation: string;
  url?: string;
  /** Typ zdroje. */
  kind: 'exomix' | 'kniha' | 'clanek' | 'databaze' | 'pravni-predpis';
  /** Poznámka k použití zdroje (omezení, co je potřeba dohledat). */
  note?: string;
}

export interface Category {
  slug: CategorySlug;
  letter: string;
  name: string;
  shortName: string;
  description: string;
  claim: string;
  icon: IllustrationKind;
  color: string;
}

export interface Article {
  slug: string;
  title: string;
  question: string;
  description: string;
  updated: string;
  /** Odstavce textu; prvek může být i seznam. */
  body: Array<{ heading?: string; paragraphs?: string[]; list?: string[] }>;
  relatedProducts: string[];
  provenance: Provenance;
  sourceIds: string[];
}
