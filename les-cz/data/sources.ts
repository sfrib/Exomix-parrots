import type { Source } from '@/lib/types';

/**
 * Registr odborných zdrojů.
 *
 * Pravidlo: produkty smí odkazovat POUZE na zdroje z tohoto seznamu.
 * U knižních zdrojů je při odborné kontrole potřeba doplnit konkrétní
 * kapitolu / stranu – dokud se tak nestane, zůstává produkt ve stavu „návrh“.
 */
export const SOURCES: Source[] = [
  {
    id: 'exomix',
    kind: 'exomix',
    citation:
      'ExoMix – výživový konfigurátor pro papoušky (VetExotic). Repozitář sfrib/exomix-parrots: data/ingredients.json, data/premix.json, data/profiles.json, data/modes.js, labels/label_schema.sample.json, src/types/types.ts, src/lib/targets.ts.',
    note: 'Interní projektová data. Obsahují především semena, premixy a profily druhů – databázi lesních rostlin ExoMix zatím neobsahuje.',
  },
  {
    id: 'usda-fdc',
    kind: 'databaze',
    citation: 'U.S. Department of Agriculture, Agricultural Research Service: FoodData Central.',
    url: 'https://fdc.nal.usda.gov/',
    note: 'Hodnoty jsou pro potraviny určené lidem, často pro pěstované odrůdy (ne pro planě rostoucí druhy). Slouží jen pro orientaci.',
  },
  {
    id: 'harrison-lightfoot-2006',
    kind: 'kniha',
    citation: 'Harrison, G. J., Lightfoot, T. L. (eds.): Clinical Avian Medicine. Spix Publishing, Palm Beach 2006.',
    note: 'Kapitoly o výživě a toxikologii ptáků. Konkrétní strany doplnit při odborné kontrole.',
  },
  {
    id: 'ritchie-1994',
    kind: 'kniha',
    citation: 'Ritchie, B. W., Harrison, G. J., Harrison, L. R.: Avian Medicine: Principles and Application. Wingers Publishing, Lake Worth 1994.',
    note: 'Kapitola o toxikologii ptáků. Konkrétní strany doplnit při odborné kontrole.',
  },
  {
    id: 'frohne-pfander-2005',
    kind: 'kniha',
    citation:
      'Frohne, D., Pfänder, H. J.: Poisonous Plants: A Handbook for Doctors, Pharmacists, Toxicologists, Biologists and Veterinarians. 2nd ed. Manson Publishing, London 2005.',
    note: 'Obecná toxikologie rostlin (obsahové látky). Údaje se netýkají specificky papoušků.',
  },
  {
    id: 'cooper-johnson-1984',
    kind: 'kniha',
    citation: 'Cooper, M. R., Johnson, A. W.: Poisonous Plants in Britain and their Effects on Animals and Man. HMSO, London 1984.',
    note: 'Evropské jedovaté rostliny a jejich účinky na zvířata.',
  },
  {
    id: 'hargis-1989',
    kind: 'clanek',
    citation:
      'Hargis, A. M., Stauber, E., Casteel, S., Eitner, D.: Avocado (Persea americana) intoxication in caged birds. Journal of the American Veterinary Medical Association 194 (1), 1989, 64–66.',
  },
  {
    id: 'valberg-2013',
    kind: 'clanek',
    citation:
      'Valberg, S. J. et al.: Seasonal pasture myopathy/atypical myopathy in North America associated with ingestion of hypoglycin A within seeds of the box elder tree. Equine Veterinary Journal 45 (4), 2013, 419–426.',
    note: 'Studie se týká koní a javoru jasanolistého; přenositelnost na ptáky není ověřena.',
  },
  {
    id: 'aspca',
    kind: 'databaze',
    citation: 'ASPCA Animal Poison Control Center: Toxic and Non-Toxic Plants List.',
    url: 'https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants',
    note: 'Seznam je pro psy, kočky a koně – pro papoušky jen pomocný zdroj.',
  },
  {
    id: 'kubat-2002',
    kind: 'kniha',
    citation: 'Kubát, K. et al. (eds.): Klíč ke květeně České republiky. Academia, Praha 2002.',
    note: 'Určovací znaky rostlin a jejich výskyt v ČR.',
  },
  {
    id: 'zakon-lesni',
    kind: 'pravni-predpis',
    citation: 'Zákon č. 289/1995 Sb., o lesích a o změně a doplnění některých zákonů (lesní zákon), zejména § 19 a § 20.',
    url: 'https://www.zakonyprolidi.cz/cs/1995-289',
    note: '§ 19: každý smí pro vlastní potřebu sbírat lesní plody a suchou na zemi ležící klest. § 20: mimo jiné zákaz poškozovat stromy, sekat chvojí, sbírat plody způsobem poškozujícím les.',
  },
  {
    id: 'zakon-ochrana-prirody',
    kind: 'pravni-predpis',
    citation: 'Zákon č. 114/1992 Sb., o ochraně přírody a krajiny, a vyhláška č. 395/1992 Sb. (seznam zvláště chráněných druhů).',
    url: 'https://www.zakonyprolidi.cz/cs/1992-114',
    note: 'Zvláště chráněné druhy se nesbírají; v národních parcích, rezervacích a dalších chráněných územích platí přísnější pravidla.',
  },
];

export const SOURCE_MAP: Record<string, Source> = Object.fromEntries(SOURCES.map((s) => [s.id, s]));
