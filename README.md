# ExoMix – COMPLETE APP

Monorepo složené z UI, API, databázových modelů, PDF exportu etiket, notifikací a vet-review workflow.

## Požadavky
- Node 18+
- Postgres (lokálně/ Supabase)
- SMTP přístup (pro maily)
- Volitelně: Vercel (serverless) nebo vlastní server

## Instalace
```bash
cp .env.example .env
npm i
npm run prisma:generate
# pokud chceš migrace: npx prisma migrate dev
npm run dev
```
Otevři:  
- `/recipes` – seznam receptů  
- `/recipes/r1` – detail (SaveBar → Etiketa, Tisk PDF, Grafy)  
- `/recipes/r1/label` – HTML etiketa (A6)  
- `/api/recipes/r1/label-pdf` – PDF etiketa (A6)  
- `/recipes/r1/composition` – grafy (donut + stacked bar)

## Struktura
- `app/` – Next.js App Router (layouty, stránky, UI)  
- `pages/api/` – API routes (PDF, vet-review, notifikace, supplier feed...)  
- `components/` – UI komponenty (Button, SaveBar, Card, grafy)  
- `prisma/schema.prisma` – modely (User, Species, Recipe, VetReview, Notification…)  
- `emails/` – HTML šablony (vet review)  
- `labels/` – samostatné HTML šablony a filler skript  
- `workers/` – cron skripty pro připomínky/expirace  
- `lib/` – mailer, db, jwt, rbac, share, AI prompty, supplier adaptéry  
- `sql/` – SQL DDL + patch pro filtry  
- `tests/` – Playwright smoke test

## Poznámky
- PDF generování: `chrome-aws-lambda` (Vercel friendly). Lokálně lze přepnout na `puppeteer` dle potřeby.
- V API jsou **mock data** – napoj postupně na Prisma/Supabase.
- E-maily využívají Nodemailer; v produkci lze snadno přepnout na SendGrid/Mailjet.
