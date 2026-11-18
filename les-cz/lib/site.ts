/**
 * Centrální konfigurace webu LES.cz.
 * Údaje označené `verified: false` je nutné před spuštěním ověřit (ARES / veřejný rejstřík / Laguna).
 */
export const SITE = {
  name: 'LES.cz',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.les.cz',
  slogan: 'Nejlepší zverimex je les.',
  slogans: [
    'Příroda má vždycky naskladněno.',
    'Doručení? Musíte si dojít sami.',
    'Nejlevnější hračky rostou na stromech.',
    'Všechno pro papouška. Bez pokladny a bez kurýra.',
  ],
  description:
    'LES.cz je vtipný „e-shop“, ve kterém se nic neprodává. Vzdělávací průvodce přírodními materiály pro papoušky: lesní plody, větve, byliny, přírodní hračky a rizikové rostliny.',
  locale: 'cs_CZ',
  social: {
    instagram: 'https://www.instagram.com/',
    facebook: 'https://www.facebook.com/',
    /** Doplnit skutečné profily po jejich založení. */
    ready: false,
  },
} as const;

export const OPERATOR = {
  name: 'Společnost Laguna, z. s.',
  ico: '05733189',
  address: 'Luka pod Medníkem 79, Jílové u Prahy',
  web: 'https://www.centrumlaguna.cz/',
  /** Údaje převzaté ze zadání – před zveřejněním ověřit v ARES a spolkovém rejstříku. */
  verified: false,
  verifyNote:
    'Identifikační údaje převzaty ze zadání projektu. Před zveřejněním ověřit v ARES a ve spolkovém rejstříku (justice.cz), doplnit PSČ, spisovou značku a kontaktní e-mail.',
  contactEmail: null as string | null,
} as const;

export const SUPPORT = {
  /** Oficiální stránka Laguny. Konkrétní stránku/účet pro dary doplní Laguna. */
  url: 'https://www.centrumlaguna.cz/',
  /** Číslo (ideálně transparentního) účtu – doplní Laguna, dokud není ověřeno, nezobrazuje se. */
  bankAccount: null as string | null,
  verified: false,
} as const;

/** Nejbližší dostupné ExoMix moduly (pro křížové odkazy). */
export const EXOMIX = {
  name: 'ExoMix',
  description: 'Výživový konfigurátor krmných směsí pro papoušky z dílny VetExotic.',
  url: null as string | null,
} as const;
