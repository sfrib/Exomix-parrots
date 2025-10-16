
# ExoMix – Navazující moduly (JWT, RBAC, Feedy, Sdílení, PDF, AI)

Tento balík doplňuje předchozí „vet review + notifikace“ o:
- **JWT one-click** akce z e-mailu (`lib/jwt.ts`, `pages/api/vet/reviews/oneclick.ts`)
- **RBAC** helper (`lib/rbac.ts`)
- **Cron workers**: 72h připomínka a expirace
- **Dodavatelské feedy** (rozhraní + mocky): Noviko, Samohyl, RájPapoušků
- **Komunitní sdílení receptů**: share token + veřejná stránka
- **Filtry & preference**: SQL patch `sql/filters_patch.sql`
- **PDF export**: HTML šablona + skeleton API
- **AI návrhář**: prompt šablony v `lib/ai/prompts.ts`

## Instalace
```
npm i jsonwebtoken
# plus @react-pdf/renderer server-side pro PDF (dle volby)
```
ENV:
```
LINK_SIGNING_SECRET=super-secret
SHARE_SALT=random-salt
APP_URL=https://app.exomix.cz
```

## Poznámky
- Jednoklikové akce přesměrovávají přes `/api/vet/reviews/oneclick?token=...` na bezpečný endpoint.
- RBAC helper propojte s vaším auth (NextAuth/Supabase).
- Feedy mají pouze mock – přidejte reálné scraping/API dle podmínek dodavatelů.
- PDF generujte přes `@react-pdf/renderer`: poskládej komponentu a vrať `pdf(Component).toBuffer()`.
