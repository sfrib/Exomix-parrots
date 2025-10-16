# ExoMix – Complete App

> **Strategický plán:** Detailní produktový roadmap najdeš v [`docs/ROADMAP.md`](./docs/ROADMAP.md). Používej ho jako zdroj pravdy pro prioritizaci dalších modulů a integrací.

Kompletní reference implementace ExoMixu: Next.js 14 (App Router) front-end, REST API, PDF export etiket, notifikační workflow a podpůrné skripty pro veterinární revize receptů.

## Co potřebujeme od tebe, aby projekt fungoval

| Oblast | Co dodat | Proč je to potřeba |
| --- | --- | --- |
| **Databáze** | `DATABASE_URL` (Postgres / Supabase), ideálně s připraveným schématem nebo přístupem pro migrace | Aplikace používá Prisma modely `User`, `Recipe`, `Species`, `VetReview`, `Notification` atd. Bez funkční databáze se nenačtou recepty ani schvalovací workflow. |
| **Doména / URL** | Veřejná hodnota `APP_URL` (např. `https://app.exomix.cz`) | Linky v mailech, sdílené recepty a QR kódy musí mířit na finální doménu. |
| **SMTP** | Přihlašovací údaje `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, odesílatel `MAIL_FROM` | Notifikace o revizi a připomínky se posílají přes Nodemailer. Bez SMTP se workflow zastaví. |
| **Bezpečnost** | `LINK_SIGNING_SECRET`, `SHARE_SALT` | Podepisování sdílených odkazů a generování hashů pro bezpečné odkazy. |
| **Obsah mailů** | (Volitelně) vlastní cesta `EMAIL_TEMPLATE_HTML_PATH` | Pokud potřebuješ custom HTML šablony mimo `/emails`. |
| **Integrace** | Přístupy k VetExotic službám (Můj Exot, RegistrPtaku.cz, Laguna) | Propojení QR kódů a sdílení dat, až se bude napojovat na produkční ekosystém. |

> Pokud nám předáš výše uvedené přístupy + schválenou doménu, dokážeme aplikaci rozběhnout lokálně i na Vercelu během pár minut.

## Požadavky na prostředí

- Node.js **18+** (kvůli Next 14)
- Postgres 14+ nebo Supabase (kompatibilní s Prisma)
- Přístup k SMTP serveru (testovací i produkční účet)
- Doporučeno: účet na Vercelu nebo jiném hostingu pro Next.js

## Vytvoření `.env`

Soubor `.env` si vytvoř ručně podle níže uvedeného vzoru:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/exomix"
APP_URL="http://localhost:3000"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="super-secret"
MAIL_FROM="ExoMix <no-reply@exomix.cz>"
LINK_SIGNING_SECRET="change-me"
SHARE_SALT="change-me-too"
# EMAIL_TEMPLATE_HTML_PATH="/absolute/path/to/custom_template.html" # volitelné
```

## Rychlý start

```bash
npm install
npm run prisma:generate
npx prisma migrate dev # nebo pnpm/npm script prisma:migrate, pokud chceš vytvořit DB schéma
npm run dev
```

Po startu otevři následující ukázkové stránky:

- `/recipes` – seznam receptů
- `/recipes/r1` – detail (SaveBar → Etiketa, Tisk PDF, Grafy)
- `/recipes/r1/label` – HTML etiketa (A6)
- `/api/recipes/r1/label-pdf` – PDF etiketa (A6)
- `/recipes/r1/composition` – grafy (donut + stacked bar)

## Každodenní příkazy

- `npm run dev` – lokální vývoj
- `npm run build && npm start` – produkční běh
- `npm run lint` – statická analýza Next/TypeScript
- `npm run test` – Playwright smoke test UI
- `npm run prisma:migrate` – vytvoření/aktualizace DB schématu
- `npm run workers:reminder` / `npm run workers:expiring` – ruční spuštění cron skriptů pro notifikace

## Nasazení na Vercel

Kompletní postup včetně seznamu environment proměnných, nastavení Supabase a post-deploy checklistu najdeš v průvodci
[`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md). Stručně:

1. Připrav databázi (Supabase/Postgres) a spusť migrace.
2. Přidej všechny tajné klíče do Vercel projektu (`DATABASE_URL`, SMTP, podepisování odkazů...).
3. Nech Vercel sestavit projekt přes `npm run build` a po prvním deploy zkontroluj admin UI, exporty a API.

Tento návod je sladěný s roadmapou VetExotic Group, takže při každém release ověř, že stav implementace odpovídá aktuální fázi.

## Struktura

- `app/` – Next.js App Router (layouty, stránky, UI)
- `pages/api/` – API routes (PDF, vet-review, notifikace, supplier feed...)
- `components/` – UI komponenty (Button, SaveBar, Card, grafy)
- `lib/` – databázové a integrační utility (`db`, `mailer`, `jwt`, `share`, …)
- `prisma/schema.prisma` – datový model (User, Species, Recipe, VetReview, Notification…)
- `emails/` – HTML šablony pro veterinární revize
- `labels/` – samostatné HTML šablony a filler skript pro etikety
- `workers/` – cron skripty pro připomínky a expirace
- `sql/` – manuální SQL skripty a view pro filtrování
- `tests/` – Playwright smoke test

## Důležité poznámky k provozu

- PDF generování využívá `@sparticuz/chromium` + `puppeteer-core`. Na Vercelu funguje out-of-the-box, lokálně můžeš přepnout na plný `puppeteer` dle potřeby.
- API zatím používá **mock data** – pro produkční nasazení napoj Prisma dotazy na skutečná data z Postgres/Supabase.
- E-maily běží přes Nodemailer; pro produkci je možné přepnout na SendGrid/Mailjet/SMTP relay dle preferencí.
- Playwright test (`npm run test`) předpokládá běžící dev server na `http://localhost:3000`.

---

**ExoMix – Science for feathers.**
