# LES.cz – koncepce projektu

> **Nejlepší zverimex je les.**
> Vzdělávací a osvětový projekt Společnosti Laguna, z. s., který se tváří jako e-shop.

## 1. Koncepce

LES.cz je parodie na internetový obchod. Návštěvník prochází sortiment, filtruje, otevírá produktové karty a kliká na **KOUPIT** – ale nic se neprodává, neobjednává ani neposílá. Po kliknutí se objeví vtipné „potvrzení objednávky“ s jasným vysvětlením, že nejde o nákup.

**Cíl:** E-SHOP + ENCYKLOPEDIE + VZDĚLÁVACÍ PORTÁL + HUMORNÝ MARKETING.

Cesta návštěvníka: pobaví ho koncept → prohlíží nabídku → kliká na produkty → dozví se něco nového → naučí se poznávat rostliny → ví, co může papouškovi dát → sdílí web → případně dobrovolně podpoří Lagunu.

**Zásady obsahu**
- Humor patří do cen, skladů, tlačítek a kampaní. Odborné texty jsou střízlivé.
- Odborná správnost má vždy přednost před vtipem.
- U každé informace je vidět její původ (A – ExoMix, B – literatura, C – k ověření) a stav odborné kontroly.
- Nikdy „bezpečné pro všechny papoušky“. Rostlina, která v databázi chybí, není automaticky bezpečná.

**Slogany:** Nejlepší zverimex je les. · Příroda má vždycky naskladněno. · Doručení? Musíte si dojít sami. · Nejlevnější hračky rostou na stromech. · Všechno pro papouška. Bez pokladny a bez kurýra.

## 2. Informační architektura

```
/                         Homepage (13 bloků, viz bod 5)
/obchod                   Celý sortiment – filtry (oddělení, bezpečnost, měsíc), hledání, řazení
/kategorie/[slug]         A–D, G – oddělení
/produkt/[slug]           Produktová karta (20 bodů, viz bod 7)
/sezona, /sezona/[období] E. Sezónní nabídka (jaro, léto, podzim, zima)
/vyprodej                 F. Lesní výprodej (humor)
/rizikove-rostliny        → přesměrování na /kategorie/rizikove-zbozi (G)
/je-to-bezpecne           A. Je to pro papouška bezpečné? (ověření podle názvu)
/poznej-strom             B. Poznej svůj strom (6 znaků × každá dřevina)
/co-roste-ted             C+D. Co roste právě teď? + celoroční kalendář sběru
/jak-sbirat               E. Jak správně sbírat (pravidla, zákon, hygiena, otrava)
/prirodni-obohaceni       G. Přírodní obohacení (návody na hračky)
/poradna, /poradna/[slug] Lesní poradna – SEO články
/hledat                   Vyhledávání (noindex)
/kosik                    Vtipný prázdný košík (noindex)
/podporit-lagunu          Dobrovolná podpora
/o-projektu, /zdroje      O projektu, metodika a registr zdrojů
/pravni/[slug]            provozovatel, pravidla-uzivani, ochrana-osobnich-udaju,
                          cookies, dobrovolna-podpora, odborne-upozorneni
```

**Navigace:** sezónní ticker → hlavička (logo, hledání, Co roste teď, Je to bezpečné?, Poznej strom, Podpořit Lagunu, košík s „0“) → lišta oddělení (A–D, G, Sezónní nabídka, Lesní výprodej −100 %) → patička (sortiment, nástroje, právní informace, odkaz na Lagunu). Na mobilu menu v rozbalovacím panelu bez JavaScriptu.

## 3. Struktura stránek

Viz bod 2. Všechny stránky jsou staticky generované (SSG), 124 stránek při 78 produktech.

## 4. Vizuální identita

- **Inspirace:** les, staré lesní lékárny (cenovky, štítky, papír), přírodovědné katalogy, moderní e-commerce, humorné kampaně.
- **Barvy:** lesní zelená `#2F6B3A`, tmavě zelená `#13311F`, přírodní béžová `#F3EBDD` / papír `#FBF7EF`, hnědá `#6B4A2B`, jemná žlutá `#F2D675` (tlačítko KOUPIT, akcenty), bílá. Rizikové zboží: brusinková červená `#A3262A`.
- **Písma:** Fraunces (titulky – „lékárenský“ serif), Inter (text). Hostována lokálně přes `next/font` (bez volání Googlu z prohlížeče).
- **Logo:** cenovka (e-shop) se smrkem uvnitř (les). Značka funguje samostatně jako avatar na sociálních sítích (`components/Logo.tsx`, `app/icon.svg`).
- **Prvky:** cenovky, razítko „Doprava vlastní nohy“, účtenka s nulami, papírová textura, kalendářní lišta měsíců, štítky bezpečnosti (zelená / žlutá / oranžová / červená) a původu (A/B/C).
- **Obrázky:** dokud nejsou k dispozici licencované fotografie, používají se vlastní SVG ilustrace (`PlantIllustration`). Ilustrace výslovně nejsou určené k určování rostlin. **Fotografie pro identifikaci nesmí být generované AI** – musí to být skutečné, odborně ověřené fotografie s licencí (např. vlastní focení, Wikimedia Commons s uvedením autora).

## 5. Homepage

1. Úvodní banner se sloganem a kolážemi „produktů“ 2. logo 3. vyhledávání „Co hledáte pro svého papouška?“ / „Zadejte název rostliny, stromu nebo plodu.“ + lišta výhod (doprava zdarma, nonstop, lokální, vrácení do lesa) 4. hlavní kategorie 5. sezónní nabídka (přepíná se podle aktuálního měsíce) 6. doporučené produkty 7. nejnovější přírůstky 8. produktové tipy 9. vzdělávací sekce (poradna) 10. průvodce stromy 11. průvodce bezpečnými rostlinami 12. dobrovolná podpora Laguny 13. patička s právními informacemi.

## 6. Kategorie

| | Oddělení | Položky |
| --- | --- | --- |
| A | Lesní ovoce | 13 (jahody, borůvky, maliny, ostružiny, brusinky, jeřabiny, šípky, bezinky, hloh, lískové oříšky, dřín, jedlé kaštany, bukvice) |
| B | Větve a stromy | 15 (bříza, vrba, líska, jabloň, hrušeň, buk, dub, lípa, topol, javor, habr, jasan, olše, vinná réva, smrk a borovice) |
| C | Bylinky a plané rostliny | 13 (pampeliška, jitrocel, kopřiva, sedmikráska, jetel, ptačinec, heřmánek, meduňka, máta, řebříček, ostropestřec, čekanka, lipový květ) |
| D | Přírodní hračky | 8 (šišky, větvičky, kůra, suché listí, seno a suchá tráva, klasy trav, přírodní vlákna, pupeny) |
| E | Sezónní nabídka | výběr podle měsíců `months` u každé položky |
| F | Lesní výprodej | humorný výběr (`data/seasonal.ts`) |
| G | Zakázané a rizikové zboží | 29 (tis, avokádo, konvalinka, náprstník, oměj, rulík, lilek potměchuť, krušina, brslen, bez červený, bez chebdí, vraní oko, lýkovec, bolehlav, koňský kaštan, akát, střemcha a peckoviny, medvědí česnek, ocún, žaludy, hasivka, pryskyřníky a sasanky, břečťan, jmelí, túje, zlatý déšť, houby, plísně, rododendron) |

Bezpečnost: 29 × běžně podáváno, 15 × střídmě, 6 × neověřeno, 28 × rizikové (nepodávat).

## 7. Produktová karta

Všech 20 požadovaných bodů je v šabloně `app/produkt/[slug]/page.tsx`: ilustrace (1), český a latinský název, čeleď a kategorie (2–5), sezóna s měsíční lištou (6), vhodná část (7), nutriční charakteristika (8), živiny – jen tam, kde existuje databázový záznam, s uvedením, k čemu se vztahuje (9), přínos (10), vhodnost podle skupin papoušků podle ExoMixu (11), podávání (12), příprava (13), rizika (14), sběr + obecná pravidla (15), kde najít (16), kdy sbírat (17), znaky a místa pro fotografie k identifikaci včetně záměn (18), odborné zdroje (19), stav a datum odborné kontroly (20). Každý blok má štítek původu A/B/C.

## 8. Databáze rostlin

- Typy: `lib/types.ts` (`Product`, `Sourced`, `SafetyLevel`, `Provenance`…).
- Data: `data/products/{fruits,branches,herbs,toys,risky}.ts`, agregace v `data/index.ts`.
- Zdroje: `data/sources.ts` – produkty smí citovat jen zdroje z registru (hlídá test).
- Pomocníci: `data/helpers.ts` – `a()`, `b()`, `c()`, `list()`, `DRAFT`, obecná pravidla sběru.
- Analýza ExoMixu: `docs/EXOMIX_ANALYZA.md`.

## 9. Sezónní kalendář

- Každá položka má `months` (1–12). Z nich se generuje `/co-roste-ted` (výběr měsíce + tabulka), `/sezona/[období]` a sezónní nabídka na homepage.
- Kampaně a hlášky pro web i sociální sítě: `data/seasonal.ts` (jaro: pupeny, pampelišky; léto: jahody, borůvky; podzim: šišky, jeřabiny; zima: větvičky, ořez sadů).

## 10. Právní texty

`data/legal.ts` – provozovatel, pravidla používání, ochrana osobních údajů, cookies, dobrovolná podpora, odborné upozornění. **Všechny jsou označené jako návrh k finální právní kontrole.**

Klíčová rozhodnutí: žádná registrace, účty, formuláře, cookies ani analytika → není potřeba cookie lišta; tlačítko KOUPIT nic neukládá ani neodesílá a výslovně vysvětluje, že nejde o nákup; strukturovaná data záměrně **nepoužívají** schema.org `Product/Offer` (nevytvářet dojem prodeje); dar Laguně je oddělen od „nákupu“ a LES.cz nepřijímá platby.

**Před spuštěním ověřit:** údaje Laguny v ARES a spolkovém rejstříku (IČO 05733189, sídlo Luka pod Medníkem 79, Jílové u Prahy – PSČ a spisová značka chybí), oficiální stránku/účet pro dary, daňové a účetní nastavení darů, poskytovatele hostingu (pro zásady ochrany údajů), vlastnictví domény les.cz.

## 11. Technická architektura

- **Stejný stack jako ExoMix:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3, Vitest. Žádný druhý paralelní systém – LES.cz je samostatná aplikace v adresáři `les-cz/` téhož repozitáře, protože jde o samostatnou značku a doménu. Sdílí datový přístup i kategorie druhů s ExoMixem.
- **Obsah jako kód:** databáze je v typovaných TS souborech → statické generování, rychlost, SEO, žádná databáze ani osobní údaje. Změny obsahu přes pull request (revize, historie).
- **Klientský JavaScript jen tam, kde je potřeba:** katalog s filtry, vyhledávání, tlačítko KOUPIT (nativní `<dialog>`), sezónní přepínání. Ostatní jsou serverové komponenty.
- **Vyhledávání:** `lib/search.ts` – bez diakritiky, české/lidové/latinské názvy, váhování shody.
- **SEO:** metadata a canonical na každé stránce, Open Graph obrázek, `sitemap.xml`, `robots.txt`, JSON-LD (WebSite + SearchAction, Organization/NGO, BreadcrumbList, Article, FAQPage), interní prolinkování (související produkty, záměny, články, kalendář).
- **Přístupnost:** sémantické nadpisy, skip link, `aria` popisky, klávesnicí ovladatelné filtry, respektování `prefers-reduced-motion`.
- **Kontrola kvality:** `npm test` – integrita dat (unikátní slugy, existující zdroje a odkazy, platné měsíce, zákaz paušálních tvrzení o bezpečnosti, rizikové zboží nikdy jako vhodné), vyhledávání a kalendář.

## 12. Implementační plán

| Fáze | Obsah | Stav |
| --- | --- | --- |
| 1 | Analýza ExoMixu, koncepce, IA, datový model | hotovo |
| 2 | Databáze 78 položek (A/B/C), registr zdrojů | hotovo – čeká na odbornou kontrolu |
| 3 | Web: homepage, katalog, karty, nástroje, poradna, právní texty, SEO | hotovo |
| 4 | **Odborná kontrola** veterinářem: projít karty, doplnit strany zdrojů, přepnout `review` na `overeno` s datem | další krok |
| 5 | Fotografie: 6 fotografií na dřevinu + fotky plodů/bylin s licencí (`photos` u produktu) | další krok |
| 6 | Právní kontrola textů, ověření údajů Laguny, nastavení darů | další krok |
| 7 | Nasazení (Vercel, root directory `les-cz`), doména, `NEXT_PUBLIC_SITE_URL` | další krok |
| 8 | Sociální sítě (bod 14), pravidelné sezónní kampaně | další krok |
| 9 | Volitelně: CMS (např. Git-based nebo Supabase) a sdílený balíček dat s ExoMixem | později |

## 13. SEO a marketing

- Každý produkt má vlastní URL `/produkt/[slug]`, vlastní titulek a popis (např. „Může papoušek lesní jahody?“), FAQ strukturovaná data.
- Články poradny pokrývají hlavní dotazy: jaké větve může papoušek okusovat, může papoušek borůvky, jsou šišky bezpečné, jak poznat bezpečný strom, jaké bylinky může papoušek, co sbírat v lese, jak připravit přírodní hračku.
- Prolinkování: karta → záměny (rizikové zboží) → související produkty → článek → kalendář.

## 14. Sociální sítě (Instagram, Facebook)

| Formát | Frekvence | Příklad |
| --- | --- | --- |
| Co právě roste | týdně | „Jeřabiny právě dozrávají. Naši skladníci jsou už na větvích.“ + karusel 3 položek |
| Produkt týdne | týdně | karta produktu jako „reklama“ s cenou ZDARMA a odkazem |
| Lesní skladové novinky | 2× měsíčně | „Zimní zásoby větviček doplněny. Skladník má trochu omrzlé listí.“ |
| Bezpečná větev týdne | týdně | 6 znaků stromu (karusel podle „Poznej svůj strom“) |
| Rostlina měsíce | měsíčně | delší edukační příspěvek / reels |
| Pozor na jedovaté rostliny | 2× měsíčně | „Tohle zboží lesní skladník nevydá“ – tis, rulík, konvalinka vs. medvědí česnek |

Pravidla: humor ano, ale každý příspěvek s odbornou informací projde stejnou kontrolou jako web; žádné AI fotografie rostlin k určování; odkaz vždy na kartu na LES.cz. Profily zatím nejsou založené (`lib/site.ts → SITE.social.ready = false`).
