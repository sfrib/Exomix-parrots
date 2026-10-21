# RepoGuard

A defensive security scanner for **your own** GitHub repositories. It finds common weaknesses in PHP/WordPress and JavaScript/TypeScript code and alerts you when a dependency has a known vulnerability (CVE). The UI is in Czech.

RepoGuard only **reports and explains** issues. It never generates or runs exploit code, and it only scans repositories the signed-in user owns or has been granted access to.

## Architecture

| Layer | Choice | Why |
| --- | --- | --- |
| App | Next.js 16 (App Router, TypeScript, server actions) | One codebase for UI and API; same stack as ExoMix |
| Auth | NextAuth (Auth.js v4) with GitHub OAuth, JWT sessions | Mature GitHub provider. The GitHub token is stored AES-256-GCM encrypted in the DB and never sent to the browser |
| DB | Prisma 7 + SQLite (`better-sqlite3` adapter) | Zero setup locally. Switch to Postgres by changing the provider and adapter |
| Code scanning | Built-in rule engine (`src/lib/scanner`) | Runs in memory on the downloaded tarball. Nothing is written to disk or executed |
| CVE data | [OSV.dev](https://osv.dev) batch API | Free, no API key, covers Packagist, npm and PyPI. Includes GitHub Advisory Database data |
| PDF | `@react-pdf/renderer` + DejaVu fonts | Server-side rendering with full Czech diacritics |
| Styling | Tailwind CSS 4 | |

```
repoguard/
├─ prisma/schema.prisma          # User, Repo, Scan, Finding, Dependency, Advisory cache
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                # landing + GitHub sign-in
│  │  ├─ dashboard/              # repo list with status badges
│  │  ├─ repos/add/              # pick repos you own / have access to
│  │  ├─ repos/[id]/             # findings grouped by severity, deps, history, settings
│  │  ├─ actions.ts              # server actions (connect, scan, settings)
│  │  └─ api/
│  │     ├─ auth/[...nextauth]/  # GitHub OAuth
│  │     ├─ repos/[id]/report/   # PDF export
│  │     └─ cron/                # scheduled re-check (Bearer CRON_SECRET)
│  ├─ components/
│  └─ lib/
│     ├─ scanner/
│     │  ├─ engine.ts            # runs rules, comment stripping, secret masking, suppression
│     │  ├─ files.ts             # language detection, default excludes
│     │  └─ rules/{php,js,secrets}.ts
│     ├─ deps/
│     │  ├─ parsers.ts           # composer.json/.lock, package.json/-lock, yarn.lock, requirements.txt
│     │  ├─ osv.ts               # OSV batch query, fixed-version detection
│     │  └─ cvss.ts              # CVSS v3.x base score calculator
│     ├─ github.ts               # repo listing, access check, tarball download
│     ├─ scan.ts                 # orchestrates a scan and stores results
│     └─ report.tsx              # PDF document
└─ tests/                        # vitest: rules (vulnerable vs safe fixtures), parsers, OSV, CVSS, access
```

## Local setup

Requirements: Node.js 20+.

1. **Create a GitHub OAuth App**: GitHub → Settings → Developer settings → OAuth Apps → *New OAuth App*
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
   - Generate a client secret.

2. **Configure the environment**:
   ```bash
   cd repoguard
   cp .env.example .env
   openssl rand -base64 32   # paste as NEXTAUTH_SECRET
   ```
   Fill in `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. Setting `ALLOWED_GITHUB_LOGINS=your-login` is recommended, so nobody else can sign in to your instance.

3. **Install, create the database, run**:
   ```bash
   npm install          # also runs prisma generate
   npm run db:push      # creates repoguard.db (SQLite)
   npm run dev
   ```
   Open http://localhost:3000, sign in with GitHub, click **Přidat repozitář**, connect a repo and run **Spustit kompletní sken**.

4. **Tests and typecheck**:
   ```bash
   npm test
   npm run lint
   ```

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | `file:./repoguard.db` for SQLite |
| `NEXTAUTH_URL` | yes | Public URL of the app |
| `NEXTAUTH_SECRET` | yes | Session encryption. Also derives the token encryption key |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | yes | GitHub OAuth App |
| `ALLOWED_GITHUB_LOGINS` | recommended | Comma-separated logins allowed to sign in |
| `TOKEN_ENCRYPTION_KEY` | optional | Separate key for encrypting stored GitHub tokens |
| `CRON_SECRET` | optional | Enables `/api/cron` |
| `GITHUB_OAUTH_SCOPE` | optional | Default `read:user repo` (needed for private repos). Use `read:user` for public repos only |

## Scheduled CVE checks

`GET /api/cron` re-checks dependencies of all connected repos (add `?code=1` to re-scan code too). It requires `Authorization: Bearer $CRON_SECRET`.

```bash
# crontab: every day at 06:15
15 6 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron > /dev/null
```

On Vercel, add a cron job in `vercel.json` (`{"crons":[{"path":"/api/cron","schedule":"15 6 * * *"}]}`); Vercel sends the bearer header automatically. Note that SQLite does not persist on Vercel, so use Postgres there: set `provider = "postgresql"` in `prisma/schema.prisma` and replace the adapter in `src/lib/db.ts` with `@prisma/adapter-pg`.

## What is scanned

**Code (PHP, JS/TS, config files)**. Each finding has a severity, CWE, file and line, a plain-language Czech explanation, and a concrete fix.

| Area | Examples | CWE |
| --- | --- | --- |
| SQL injection | `$wpdb->query("… $var")`, `mysqli_query` with concatenation, `db.query(\`… ${x}\`)`, `$queryRawUnsafe` | 89 |
| Unsanitised input / XSS | `$_GET`/`$_POST` without `sanitize_*`/`absint`, `echo $_GET[…]`, `innerHTML =`, `res.send(req.query…)` | 20, 79 |
| Missing authorisation | `wp_ajax_*` handlers without `current_user_can`, missing nonce, `nopriv` handlers that change data, `register_rest_route` without `permission_callback`, POST handlers without auth | 862, 352 |
| Insecure uploads | `move_uploaded_file` without type validation, client filename in path, `'test_type' => false`, allowing PHP/SVG, multer without `fileFilter` | 434, 22 |
| Hardcoded secrets | `DB_PASSWORD` / salts in `wp-config.php`, AWS/GitHub/Stripe/Slack/Google/SendGrid keys, private keys, connection strings, committed `.env` | 798, 538 |
| Dangerous functions | `eval`, `create_function`, `preg_replace /e`, `exec`/`system`/`shell_exec`, `unserialize`, dynamic `include`, `child_process.exec` | 95, 78, 502, 98 |
| Other | open redirects, disabled TLS verification, md5/sha1 passwords, weak randomness for tokens, `phpinfo`/display_errors, JWT `none`, CORS `*` with credentials | 601, 295, 916, 338, 209, 347, 942 |

- Comments are ignored (except for secret detection). Secrets are **masked** in the DB, UI and PDF.
- `node_modules/`, `vendor/`, `wp-admin/`, `wp-includes/`, build output and minified files are skipped. You can add your own path prefixes per repo (e.g. third-party plugins under `wp-content/plugins/…`).
- To silence a reviewed false positive, put a `repoguard-ignore` comment on the line or the line above.

**Dependencies.** RepoGuard reads `composer.lock` (or `composer.json`), `package-lock.json` / `yarn.lock` (or `package.json`) and `requirements*.txt` anywhere in the repo. It checks them against OSV.dev and shows CVE/GHSA ids, the CVSS score (computed from the v3 vector), severity, the fixed version and the upgrade command. Versions taken from ranges without a lockfile are marked approximate (≈). A finding that first appears after the previous scan is labelled **Nové** (new).

### Adding a rule

Rules are plain objects in `src/lib/scanner/rules/*.ts`:

```ts
{
  id: "php.example",
  title: "Krátký český název",
  cwe: "CWE-123",
  severity: "high",
  languages: ["php"],
  pattern: /dangerous_call\s*\(/,       // line rule…
  // check: (ctx) => [{ line: 3 }],      // …or a file rule with custom logic
  explanation: "Proč je to riziko…",
  fix: "Jak to opravit…",
}
```

Add a vulnerable and a safe sample to `tests/fixtures/` and assert on them in `tests/scanner.test.ts`.

## Security notes

- Access is checked twice: when connecting a repo (only repos you own, have write/admin access to, or private repos shared with you) and again with your token **before every scan**. Every DB query is scoped to the signed-in user.
- Repository contents are downloaded as a tarball and processed in memory. They are not stored, apart from short masked snippets of each finding.
- The OAuth `repo` scope is the only way for an OAuth App to read private repos, but it also grants write access. RepoGuard only ever uses `GET` requests against GitHub. A GitHub App with read-only *Contents* permission would be a tighter option later.
- Known limitations: the scanner is pattern-based (no full data-flow analysis), so expect some false positives and negatives. WordPress core, plugin and theme versions are not in OSV; WPScan/Wordfence feeds would be a future integration (they require API keys).
