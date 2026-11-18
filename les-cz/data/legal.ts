import { OPERATOR, SUPPORT } from '@/lib/site';

export interface LegalDoc {
  slug: string;
  title: string;
  description: string;
  sections: Array<{ heading: string; paragraphs?: string[]; list?: string[] }>;
}

const OP = `${OPERATOR.name}, IČO ${OPERATOR.ico}, se sídlem ${OPERATOR.address}`;

/**
 * Právní dokumenty LES.cz.
 * VŠECHNY TEXTY JSOU NÁVRHY URČENÉ K FINÁLNÍ PRÁVNÍ KONTROLE.
 * Na webu se zobrazují s výrazným označením „Návrh“.
 */
export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: 'provozovatel',
    title: 'Identifikace provozovatele',
    description: 'Kdo provozuje LES.cz a jak nás kontaktovat.',
    sections: [
      {
        heading: 'Provozovatel',
        paragraphs: [
          `Provozovatelem webu LES.cz je ${OP}.`,
          'LES.cz je samostatná vzdělávací a osvětová značka Společnosti Laguna, z. s. Web nic neprodává a neslouží k podnikání.',
        ],
      },
      {
        heading: 'Údaje k doplnění a ověření před spuštěním',
        list: [
          'Ověřit název, IČO a sídlo v ARES a ve spolkovém rejstříku (justice.cz).',
          'Doplnit PSČ sídla a spisovou značku zápisu ve spolkovém rejstříku.',
          'Doplnit kontaktní e-mail pro LES.cz (např. samostatnou schránku, ne osobní adresu).',
          'Ověřit, kdo za spolek odpovídá za obsah webu, a případně uvést odpovědnou osobu.',
        ],
      },
      {
        heading: 'Mateřská organizace',
        paragraphs: [`Více o Společnosti Laguna najdete na jejím oficiálním webu: ${OPERATOR.web}`],
      },
    ],
  },
  {
    slug: 'pravidla-uzivani',
    title: 'Pravidla používání webu',
    description: 'LES.cz je parodie na e-shop. Nic se neprodává, nic se neobjednává.',
    sections: [
      {
        heading: '1. Povaha webu',
        paragraphs: [
          'LES.cz je vzdělávací a osvětový projekt ve formě parodie na internetový obchod. Grafika, „ceny“, „skladová dostupnost“, „doprava“, tlačítka KOUPIT, košík i výprodej jsou humorná stylizace.',
          'Na webu se nic neprodává, neobjednává ani neodesílá. Kliknutím na tlačítko KOUPIT nevzniká objednávka, kupní smlouva ani jiný smluvní vztah a neukládají se žádné údaje. Web nemá registraci ani zákaznické účty a nepřijímá platby.',
        ],
      },
      {
        heading: '2. Obsah a jeho využití',
        paragraphs: [
          'Texty, ilustrace, logo a grafika jsou chráněny autorským právem. Odkazování na stránky a sdílení odkazů na sociálních sítích je vítané. Přebírání obsahu ve větším rozsahu je možné jen se souhlasem provozovatele.',
          'Fotografie třetích stran jsou použity podle uvedených licencí; autor a licence jsou uvedeny u každé fotografie.',
        ],
      },
      {
        heading: '3. Odpovědnost',
        paragraphs: [
          'Informace jsou zpracovány s péčí, ale jsou obecné a nenahrazují konzultaci s veterinářem. Za rozhodnutí o krmení a péči o konkrétní zvíře odpovídá chovatel. Sběr v přírodě probíhá na vlastní odpovědnost a v souladu s právními předpisy (zejména lesní zákon a zákon o ochraně přírody a krajiny).',
          'Provozovatel neodpovídá za obsah webů třetích stran, na které odkazuje.',
        ],
      },
      {
        heading: '4. Dobrovolná podpora',
        paragraphs: [
          'Případná podpora Společnosti Laguna je dobrovolný dar, není platbou za zboží ani službu a nezakládá žádný nárok na protiplnění. LES.cz žádné platby nepřijímá – odkaz vede na oficiální kanály Laguny.',
        ],
      },
      {
        heading: '5. Změny pravidel',
        paragraphs: ['Provozovatel může tato pravidla měnit. Aktuální znění je vždy zveřejněno na této stránce. Pravidla se řídí právním řádem České republiky.'],
      },
    ],
  },
  {
    slug: 'ochrana-osobnich-udaju',
    title: 'Zásady ochrany osobních údajů',
    description: 'LES.cz sbírá co nejméně údajů – žádné formuláře, účty, cookies ani analytiku.',
    sections: [
      {
        heading: 'Správce',
        paragraphs: [`Správcem případných osobních údajů je ${OP}. Kontakt pro otázky ochrany osobních údajů bude doplněn před spuštěním webu.`],
      },
      {
        heading: 'Jaké údaje zpracováváme',
        paragraphs: [
          'LES.cz nemá registraci, zákaznické účty, objednávky, kontaktní formulář, newsletter ani komentáře. Tlačítko KOUPIT a košík fungují jen ve vašem prohlížeči a nic neukládají ani neodesílají.',
          'Při každé návštěvě webu zpracovává poskytovatel hostingu technické údaje nutné k doručení stránky a k zajištění bezpečnosti (zejména IP adresa, čas požadavku, požadovaná adresa a údaje o prohlížeči) v serverových protokolech. Právním základem je oprávněný zájem na bezpečném a funkčním provozu webu (čl. 6 odst. 1 písm. f) GDPR). Doba uchování odpovídá nastavení poskytovatele hostingu – doplnit podle zvoleného poskytovatele.',
          'Písma jsou hostována přímo na našem serveru; při načtení stránky se kvůli nim nekontaktují servery třetích stran.',
        ],
      },
      {
        heading: 'Příjemci',
        paragraphs: ['Zpracovatelem technických údajů je poskytovatel hostingu (doplnit název a sídlo; při hostingu mimo EU doplnit záruky pro předávání údajů).'],
      },
      {
        heading: 'Odkazy na jiné weby',
        paragraphs: ['Po kliknutí na odkaz na web Laguny nebo na sociální sítě se řídí zpracování údajů zásadami těchto webů.'],
      },
      {
        heading: 'Vaše práva',
        paragraphs: [
          'Máte právo na přístup k osobním údajům, jejich opravu, výmaz, omezení zpracování, právo vznést námitku proti zpracování a právo podat stížnost u Úřadu pro ochranu osobních údajů (www.uoou.cz).',
        ],
      },
    ],
  },
  {
    slug: 'cookies',
    title: 'Informace o cookies',
    description: 'LES.cz nepoužívá žádné cookies – ani analytické, ani marketingové.',
    sections: [
      {
        heading: 'Současný stav',
        paragraphs: [
          'LES.cz nepoužívá cookies ani obdobné technologie (localStorage, pixely, fingerprinting). Nepoužíváme analytické ani marketingové nástroje. Proto se vás neptáme na souhlas – není na co.',
        ],
      },
      {
        heading: 'Pokud se to v budoucnu změní',
        list: [
          'Analytické a marketingové cookies budou použity jen s vaším předchozím souhlasem (§ 89 odst. 3 zákona č. 127/2005 Sb., o elektronických komunikacích, a GDPR).',
          'Lišta pro souhlas nabídne stejně snadné odmítnutí jako přijetí a souhlas půjde kdykoli odvolat.',
          'Upřednostníme analytiku bez cookies a bez osobních údajů.',
        ],
      },
      {
        heading: 'Vložený obsah',
        paragraphs: ['Web zatím nevkládá obsah sociálních sítí (přehrávače, widgety). Pokud by se tak stalo, bude se načítat až po souhlasu.'],
      },
    ],
  },
  {
    slug: 'dobrovolna-podpora',
    title: 'Informace o dobrovolné podpoře',
    description: 'Jak funguje dobrovolná podpora Společnosti Laguna a proč to není platba za zboží.',
    sections: [
      {
        heading: 'Co je dobrovolná podpora',
        paragraphs: [
          'Návštěvník LES.cz může, ale nemusí, podpořit činnost Společnosti Laguna, z. s. Jde o dobrovolný dar spolku. Dar není platbou za zboží, služby ani obsah webu a dárce za něj nedostává žádné protiplnění.',
          'Výše daru je zcela na dárci. Obsah LES.cz je dostupný všem bez ohledu na to, zda kdo přispěl.',
        ],
      },
      {
        heading: 'Jak podpora probíhá',
        paragraphs: [
          `LES.cz nepřijímá platby ani platební údaje. Odkaz „Podpořit Lagunu“ vede na oficiální web Laguny (${SUPPORT.url}), kde jsou uvedeny její aktuální možnosti podpory.`,
        ],
      },
      {
        heading: 'K ověření před spuštěním (Laguna + účetní / daňový poradce)',
        list: [
          'Ověřit oficiální stránku a číslo účtu pro dary (ideálně transparentní účet) a doplnit přímý odkaz.',
          'Ověřit, zda Laguna vydává potvrzení o daru a zda dary splňují podmínky pro odpočet od základu daně (§ 15 odst. 1 a § 20 odst. 8 zákona č. 586/1992 Sb., o daních z příjmů).',
          'Ověřit účetní zachycení darů přijatých prostřednictvím LES.cz (dar spolku, ne tržba) a zda LES.cz nezakládá hospodářskou činnost.',
          'Pokud by dar byl spojen s jakýmkoli protiplněním (např. uvedení jména na webu), ověřit daňové dopady.',
          'Pokud by Laguna chtěla dary přijímat přímo na LES.cz (platební brána), doplnit zásady ochrany osobních údajů a smlouvu se zpracovatelem.',
        ],
      },
    ],
  },
  {
    slug: 'odborne-upozorneni',
    title: 'Odborné upozornění',
    description: 'Jak číst informace na LES.cz a proč nenahrazují veterináře.',
    sections: [
      {
        heading: 'Informace nenahrazují veterinární péči',
        paragraphs: [
          'Obsah LES.cz je obecný vzdělávací materiál. Nenahrazuje vyšetření ani radu veterináře se zaměřením na ptáky. Potřeby jednotlivých druhů i jedinců se liší – zejména u mláďat, chovných, starých a nemocných ptáků.',
        ],
      },
      {
        heading: 'Původ informací',
        list: [
          'A – převzato z projektu ExoMix (výživový konfigurátor VetExotic).',
          'B – dohledáno v odborné literatuře; zdroj je uveden u každé informace.',
          'C – pracovní text, který je potřeba ověřit.',
          'U každé produktové karty je uveden stav a datum poslední odborné kontroly. Dokud kontrola neproběhne, je obsah návrhem.',
        ],
      },
      {
        heading: 'Bezpečnost rostlin',
        paragraphs: [
          'Zařazení rostliny mezi „běžně podávané“ neznamená, že je bezpečná v jakémkoli množství, v jakékoli části a pro každého ptáka. Rostlina, která v naší databázi chybí, není automaticky bezpečná. Výskyt rostliny v přírodě nic neříká o její vhodnosti pro papoušky.',
          'Určení rostlin podle popisu a fotografií je jen orientační. Pokud si nejste jistí na 100 %, rostlinu nesbírejte.',
        ],
      },
      {
        heading: 'Podezření na otravu',
        paragraphs: [
          'Ihned kontaktujte veterináře, uschovejte vzorek rostliny a zapamatujte si, kdy a kolik toho mohl pták sníst. Nepodávejte domácí léčbu bez pokynu veterináře.',
        ],
      },
    ],
  },
];

export const LEGAL_MAP = Object.fromEntries(LEGAL_DOCS.map((d) => [d.slug, d]));
