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

## Phase 1 — Harden what exists (next)

- 🚧 **Deeper TLS** — protocol (TLS 1.0/1.1) and weak-cipher / no-forward-secrecy detection
  (done via Node `tls`, no extra dependency). ⏭ optionally probe which legacy versions the
  server still accepts (bounded extra handshakes).
- ⏭ **Self-audit** — run RepoGuard on its own repo in CI and keep the grade at A.
- ⏭ **Robustness pass** — act on the adversarial review of the SSRF guard and audit checks;
  add fuzz-style tests for `normalizeOrigin`.
- ⏭ **Accessibility & mobile polish** of the UI.

## Phase 2 — Distribution: CLI + GitHub Action (biggest reach)

- ⏭ **`npx repoguard scan`** — run the code / dependency / agent-config / web-hardening scan
  locally on a folder, no login or server. Output: terminal table, JSON, **SARIF**.
- ⏭ **GitHub Action** — `repoguard/scan-action` that runs the CLI and uploads SARIF to GitHub
  Code Scanning, so findings show in the repo's Security tab. Fails the build on new
  critical/high (configurable).
- ⏭ **Shared core** — extract the rule engine / parsers / scoring into a package both the
  webapp and the CLI import (no logic duplication).

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
