# LES.cz – Nejlepší zverimex je les.

Vzdělávací a osvětový projekt **Společnosti Laguna, z. s.** Vypadá jako e-shop, ale nic neprodává: je to průvodce přírodními materiály pro papoušky (lesní plody, větve, byliny, přírodní hračky a rizikové rostliny).

- Koncepce, IA, vizuální identita, SEO, sociální sítě, implementační plán: [`docs/KONCEPCE.md`](docs/KONCEPCE.md)
- Co bylo převzato z ExoMixu a co ne: [`docs/EXOMIX_ANALYZA.md`](docs/EXOMIX_ANALYZA.md)

## Spuštění

Požadavky: Node.js 18.17+ (testováno na Node 22).

```bash
cd les-cz
npm install
npm run dev        # http://localhost:3100
npm test           # kontrola integrity databáze + vyhledávání
npm run typecheck
npm run build && npm start
```

Volitelná proměnná prostředí: `NEXT_PUBLIC_SITE_URL` (výchozí `https://www.les.cz`) – používá se pro canonical URL, sitemapu a Open Graph.

## Nasazení (Vercel)

Nový projekt ve Vercelu ze stejného repozitáře, **Root Directory = `les-cz`**, framework Next.js. Žádné tajné klíče ani databáze nejsou potřeba.

## Struktura

```
les-cz/
├── app/                    stránky (App Router), sitemap, robots, manifest, OG obrázek
├── components/             UI komponenty (karta produktu, katalog, KOUPIT, ilustrace…)
├── data/
│   ├── products/           databáze: fruits, branches, herbs, toys, risky
│   ├── index.ts            agregace a dotazy nad databází
│   ├── sources.ts          registr odborných zdrojů
│   ├── helpers.ts          a() / b() / c() – původ informace, obecná pravidla sběru
│   ├── categories.ts       oddělení A–D, G
│   ├── seasonal.ts         sezónní kampaně a lesní výprodej
│   ├── articles.ts         Lesní poradna (SEO články)
│   └── legal.ts            právní texty (NÁVRH k právní kontrole)
├── lib/                    typy, vyhledávání, roční období, SEO, konfigurace webu
├── tests/                  Vitest – integrita dat, vyhledávání
└── docs/                   koncepce a analýza ExoMixu
```

## Jak přidat nebo upravit rostlinu

1. Otevřete příslušný soubor v `data/products/` a zkopírujte existující položku jako šablonu.
2. Každý odborný text zabalte do `a()` (z ExoMixu), `b(text, ...zdroje)` (literatura) nebo `c()` (k ověření). Zdroje musí existovat v `data/sources.ts`.
3. Nikdy nepište „bezpečné pro všechny papoušky“. Nejisté údaje = `c()` nebo úroveň `neovereno`.
4. Po odborné kontrole nastavte `review: { status: 'overeno', reviewedAt: 'RRRR-MM-DD', reviewer: 'Jméno' }`.
5. Fotografie přidávejte do `photos` (jen skutečné fotografie s autorem a licencí; žádné AI generované obrázky pro identifikaci).
6. Spusťte `npm test` – test odhalí neexistující zdroje, rozbité odkazy a další chyby.

## Stav

Obsah je **pracovní návrh**: žádná karta zatím neprošla odbornou kontrolou veterinářem, právní texty neprošly právní kontrolou a identifikační údaje Laguny je nutné ověřit v ARES a spolkovém rejstříku.
