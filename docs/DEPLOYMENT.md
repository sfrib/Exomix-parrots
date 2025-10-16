# Vercel deploy ExoMixu

Tento návod popisuje kompletní postup, jak připravit a nasadit současnou verzi ExoMixu na Vercel. Zaměřuje se na ověření kódu, nastavení databáze a tajných klíčů i na konfiguraci build pipeline, aby nasazení odpovídalo roadmapě VetExotic Group.

## 1. Kontrola lokálního projektu

1. **Instalace závislostí**
   ```bash
   npm install
   ```
2. **Lokální testy** – doporučené, protože Vercel spouští pouze build.
   ```bash
   npm run lint
   npm run test
   ```
   Pokud nemáš všechna data nebo není dostupný prohlížeč, můžeš testy dočasně přeskočit, ale před produkcí je spusť v CI.
3. **Build kontrola** – ověří, že projekt přejde přes Next.js kompilaci.
   ```bash
   npm run build
   ```

## 2. Databáze a seed dat

Aplikace počítá s Postgres/Supabase databází. Pro Vercel je nejjednodušší použít Supabase projekt.

1. Vytvoř projekt na [app.supabase.com](https://app.supabase.com/).
2. Importuj schéma:
   ```bash
   npm run prisma:migrate
   ```
   nebo nahráním SQL skriptů ze složky `sql/` v Supabase SQL editoru.
3. Nahraj seed data pomocí připravených CSV nebo skriptů (viz `sql/` a `data/`).

> **Tip:** U produkční instance si nastav zvláštní **service role** klíče, které nepoužíváš pro client-side dotazy.

## 3. Environment proměnné

Ve Vercel dashboardu (`Project → Settings → Environment Variables`) založ následující klíče:

| Klíč | Popis |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (Supabase `postgresql://…`) |
| `APP_URL` | Finální doména (např. `https://app.exomix.cz`) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Přístup do SMTP účtu pro notifikace |
| `MAIL_FROM` | Výchozí odesílatel e-mailů |
| `LINK_SIGNING_SECRET` | Tajný klíč pro podepisování odkazů |
| `SHARE_SALT` | Salt pro hashování sdílených receptů |
| `EMAIL_TEMPLATE_HTML_PATH` | Volitelné, pokud používáš vlastní HTML šablony |

Pokud využíváš Supabase REST/Realtime klienta, přidej ještě `NEXT_PUBLIC_SUPABASE_URL` a `NEXT_PUBLIC_SUPABASE_ANON_KEY` pro klientské čtení.

> V produkci nepoužívej `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`. Service role patří pouze do server-side prostředí (Edge/Node).

## 4. Nastavení projektu ve Vercelu

1. **Import repozitáře** – v dashboardu Vercelu zvol "Add New..." → "Project" a připoj GitHub repozitář `ExoMix`.
2. **Framework preset** – Vercel automaticky rozpozná Next.js. Build command `npm run build`, output `.` (default).
3. **Environmenty** – zkopíruj proměnné minimálně do Production a Preview. Development se načítá z `.env.local` při lokálním běhu.
4. **Region** – doporučeno EU (Frankfurt), aby byl nejbližší Supabase instanci.
5. **Protected routes** – pokud využíváš `Basic Auth` pro `/admin`, nastav `VERCEL_PROTECTION_BYPASS` nebo předělej na NextAuth/Clerk dle potřeby.

Po uložení konfigurace spusť první build. V logu uvidíš kroky `npm install`, `npm run build`. Při úspěchu získáš produkční URL (např. `https://exomix.vercel.app`).

## 5. Post-deploy checklist

- [ ] Ověř API: `/api/configurator`, `/api/export/csv`, `/api/export/pdf`.
- [ ] Zkontroluj admin panel `/admin/ingredients` a `/admin/species`.
- [ ] Spusť PDF export (používá `puppeteer-core` + `@sparticuz/chromium` – na Vercelu funguje bez extra nastavení).
- [ ] Otestuj e-mailový tok (např. `npm run workers:reminder` přes Vercel cron job nebo ručně).
- [ ] Nastav monitoring (Logtail/Sentry) dle roadmapy.

## 6. CI/CD doporučení

- Povolit "Require checks to pass" na GitHubu (`lint`, `test`, `build`).
- Vytvořit Vercel Preview komentáře na PR – lze přes Vercel GitHub integraci.
- Používat feature branches zarovnané s roadmapou (např. `feat/solver-updates`, `feat/admin-crud`).

## 7. Aktualizace podle roadmapy

Před každým release ověř, že implementované moduly odpovídají fázi roadmapy v [`docs/ROADMAP.md`](./ROADMAP.md). Tím zajistíš, že deployment reflektuje schválené priority VetExotic Group.

---

**ExoMix připravuje. Kubíček doporučuje. VetExotic garantuje.**
