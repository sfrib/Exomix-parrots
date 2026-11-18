import type { Category, CategorySlug } from '@/lib/types';

export const CATEGORIES: Category[] = [
  {
    slug: 'lesni-ovoce',
    letter: 'A',
    name: 'Lesní ovoce',
    shortName: 'Ovoce',
    description: 'Jahody, borůvky, maliny, šípky, jeřabiny a další plody, které les sám vypěstoval, zalil i sklidil.',
    claim: 'Bio, lokální, sezónní. A s doručením nám nepomůžete.',
    icon: 'berry',
    color: '#C8323C',
  },
  {
    slug: 'vetve-a-stromy',
    letter: 'B',
    name: 'Větve a stromy',
    shortName: 'Větve',
    description: 'Bříza, vrba, líska, jabloň a další dřeviny na okusování, bidla a obohacení prostředí.',
    claim: 'Nábytek, hračka i brusný kámen na zobák v jednom.',
    icon: 'branch',
    color: '#6B4A2B',
  },
  {
    slug: 'bylinky-a-plane-rostliny',
    letter: 'C',
    name: 'Bylinky a plané rostliny',
    shortName: 'Bylinky',
    description: 'Pampeliška, jitrocel, ptačinec, kopřiva a další zeleň z louky i od lesa.',
    claim: 'Salátový bar, který se sám zalévá.',
    icon: 'herb',
    color: '#3E7B3A',
  },
  {
    slug: 'prirodni-hracky',
    letter: 'D',
    name: 'Přírodní hračky',
    shortName: 'Hračky',
    description: 'Šišky, kůra, listí, klasy trav a pupeny – materiál pro hledání, trhání a ničení.',
    claim: 'Nejlevnější hračky rostou na stromech.',
    icon: 'cone',
    color: '#9A6B3C',
  },
  {
    slug: 'rizikove-zbozi',
    letter: 'G',
    name: 'Zakázané a rizikové zboží',
    shortName: 'Rizikové',
    description: 'Rostliny, které mohou být pro papoušky jedovaté nebo nevhodné. Naučte se je poznat dřív, než je papoušek ochutná.',
    claim: 'Tohle zboží lesní skladník nevydá. Ani za nic.',
    icon: 'warning',
    color: '#A3262A',
  },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c])) as Record<CategorySlug, Category>;

export function isCategorySlug(value: string): value is CategorySlug {
  return value in CATEGORY_MAP;
}
