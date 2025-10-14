# ExoMix – Integrated UI + PDF + Charts

Tento balíček spojuje:
- UI kostru (sidebar/topbar, SaveBar, etiketa náhled)
- API: `/api/recipes/[id]/label-pdf` (A6 PDF s QR/EAN)
- Grafy: donut + stacked bar, demo `/recipes/[id]/composition`

## Co je zapojené
- Tlačítko **Etiketa** → `/recipes/r1/label` (HTML náhled)
- Tlačítko **Tisk PDF** → `/api/recipes/r1/label-pdf` (otevře PDF v nové kartě)
- Tlačítko **Grafy** v detailu receptu → `/recipes/r1/composition`

## Instalace (Next.js + Tailwind)
1) Zkopíruj složku do projektu (nebo jako repo).  
2) Nainstaluj balíčky pro PDF/QR/EAN:
```
npm i chrome-aws-lambda puppeteer-core qrcode bwip-js
```
3) Přidej Tailwind a postcss (pokud ještě nemáš).  
4) Spusť `npm run dev` a otevři:
   - `/recipes` → seznam
   - `/recipes/r1` → detail (SaveBar funguje)
   - `/recipes/r1/label` → náhled etikety (HTML)
   - `/api/recipes/r1/label-pdf` → PDF výstup
   - `/recipes/r1/composition` → donut & stacked bar

## Kontrolní checklist propojení
- [x] SaveBar → **Etiketa** směruje na `/recipes/r1/label` (HTML náhled)
- [x] SaveBar → **Tisk PDF** otevírá `/api/recipes/r1/label-pdf` v nové kartě
- [x] Detail receptu má akci **Grafy** → `/recipes/r1/composition`
- [x] Stránka etikety obsahuje tlačítko **Uložit jako PDF** → `/api/recipes/r1/label-pdf`
- [x] Stránka etikety obsahuje tlačítko **Stáhnout HTML** → `/recipes/r1/label`
- [x] Grafy renderují bez JS knihoven (čisté SVG), žádné konflikty s Tailwind

## Pozn.: data jsou mock
- Napojení na DB: v API route `/pages/api/recipes/[id]/label-pdf.ts` nahraď mock daty reálnými (Prisma/Supabase).
- QR odkaz a EAN vygeneruj z dat receptu/šarže.
