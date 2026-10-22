# RepoGuard Roadmap

RepoGuard is a **defensive** security tool: it finds, explains and helps fix weaknesses in
repositories and live websites you own. It never generates or runs attack code. Every item
below keeps that line.

Legend: ✅ done · 🚧 in progress · ⏭ planned · 💡 idea

## Done

- ✅ **Code analysis** — PHP/WordPress & JS/TS rules (SQLi, XSS, authz, uploads, dangerous
  functions) with CWE, file:line, explanation and fix.
- ✅ **Secrets** — provider keys, wp-config credentials, connection strings, committed `.env`
  (masked everywhere).
- ✅ **Compromise detection** — webshells, backdoors, obfuscated code, PHP in `uploads/`.
- ✅ **Web hardening (repo)** — exposed backups/dumps/logs, dangerous `.htaccess`/`wp-config`,
  outdated WordPress core/plugins.
- ✅ **AI agent & CI audit** — Claude Code / MCP / Cursor config + GitHub Actions (prompt
  injection, dangerous permissions, hooks, unpinned packages).
- ✅ **Dependency CVEs** — OSV.dev for composer/npm/yarn/pip, CVSS, fixed version.
- ✅ **Live website audit** — ownership-verified, passive: security headers & quality, TLS
  certificate + protocol + cipher, HTTP→HTTPS, mixed content, cookies, CORS, directory
  listing, `security.txt`, exposed paths. SSRF-guarded.
- ✅ **Score A–F**, triage (false positive / accepted risk), new/resolved history.
- ✅ **Evidence & verification** — per-finding "how I found it", signed reports (`/verify`),
  annotation patch (PR), SARIF.
- ✅ **Optional AI** — per-finding review + attack-scenario analysis (defensive only).
- ✅ **Bilingual** (English default + Czech), locale-aware exports.
- ✅ **CLI** — `repoguard scan <folder>`, no login/server; table / JSON / SARIF / Markdown,
  `--fail-on` for CI. Shares the webapp's engine, parsers, scoring and SARIF builder.
- ✅ **GitHub Action** — composite action that scans and uploads SARIF to Code Scanning.

## Phase 1 — Harden what exists

- ✅ **Deeper TLS** — protocol (TLS 1.0/1.1) and weak-cipher / no-forward-secrecy detection
  (done via Node `tls`, no extra dependency). ⏭ optionally probe which legacy versions the
  server still accepts (bounded extra handshakes).
- ✅ **Robustness pass** — acted on the adversarial review of the SSRF guard and audit checks
  (DNS-rebinding IP pinning, streaming size cap, ownership re-verification, `ipaddr.js`
  private-range detection, false-positive hardening) with tests for `normalizeOrigin` and the
  hardened checks.
- ⏭ **Self-audit** — run RepoGuard on its own repo in CI and keep the grade at A. The Action
  and `examples/workflows/` exist, but a scanner that scans itself flags its own rule patterns
  and i18n catalog (the literal word `eval`, regex source) as findings; enabling it as blocking
  CI first needs a baseline/`.repoguardignore` story so those self-references don't show as real
  alerts.
- ⏭ **Accessibility & mobile polish** of the UI.

## Phase 2 — Distribution: CLI + GitHub Action (biggest reach)

- ✅ **`repoguard scan`** — runs the code / dependency / agent-config / web-hardening scan
  locally on a folder, no login or server. Output: terminal table, JSON, **SARIF**, Markdown;
  `--fail-on`, `--offline`, `--lang`, `--exclude`, `--path-prefix`. (`cli/`)
- ✅ **GitHub Action** — composite `action.yml` that runs the CLI and uploads SARIF to GitHub
  Code Scanning, so findings show in the repo's Security tab. Fails the build on
  critical/high (configurable via `fail-on`). Ready-made workflows in `examples/workflows/`.
- ✅ **Shared core** — the rule engine, dependency parsers/OSV, posture checks, scoring, SARIF
  builder and fingerprints live in `src/lib/` and are imported by **both** the webapp and the
  CLI (no logic duplication). The CLI build pulls in only the pure modules, not the DB/UI layer.

## Phase 3 — Monitoring & teams

- ⏭ **Scheduled scans** — daily dependency + web re-check (cron endpoint exists; add UI,
  per-repo schedule).
- ⏭ **Alerts** — email / Slack / webhook on a new critical/high finding or a new CVE.
- ⏭ **Trends** — score over time, regressions vs. fixes per repo/site.
- ⏭ **Multiple users / orgs** — shared repos and reports, roles.

## Phase 4 — Depth

- 💡 **More ecosystems** — Python (bandit-style), Go, Ruby; Laravel/Symfony-specific rules.
- 💡 **Live web: authenticated checks** — session-based checks on your own app (with your
  consent and credentials), still passive.
- 💡 **SBOM** — export CycloneDX / SPDX from the dependency inventory.
- 💡 **Config-as-code** — `.repoguard.yml` for per-repo rule tuning and baselines.

## Non-goals (won't build)

- ❌ Any exploit, payload, attack tooling, or offensive "red team" automation.
- ❌ Scanning sites you don't own / aren't authorized to test.
- ❌ An operating system. RepoGuard is a focused auditing tool, not a platform rewrite.

## How to contribute

Rules live in `src/lib/scanner/rules/*.ts` (one object per rule: pattern or custom check +
CWE + bilingual explanation/fix) with a vulnerable + safe fixture in `tests/`. Site checks
live in `src/lib/site/`. Open an issue describing the weakness and a minimal repro before a PR.
