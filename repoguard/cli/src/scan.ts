import { scanFiles } from "../../src/lib/scanner/engine";
import { checkExposedFiles } from "../../src/lib/scanner/rules/hardening";
import { checkComponents } from "../../src/lib/scanner/rules/components";
import { checkPosture } from "../../src/lib/posture";
import { parseManifests } from "../../src/lib/deps/parsers";
import { checkDependencies, type DependencyVulnerability } from "../../src/lib/deps/osv";
import { describeDependencyRisk } from "../../src/lib/deps/describe";
import { computeScore, categoryOf, type Category, type ScoreResult } from "../../src/lib/score";
import { isSeverity, type Severity } from "../../src/lib/severity";
import { codeFingerprint, depFingerprint, sha1 } from "../../src/lib/fingerprint";
import { localizedFinding, type FindingInput } from "../../src/lib/i18n/findings";
import type { Locale } from "../../src/lib/i18n/locale";
import type { GitHubRepo } from "../../src/lib/github";
import { walkFolder, type WalkResult } from "./walk";

/**
 * Orchestrates a local folder scan by reusing the webapp's rule engine,
 * dependency parsing/OSV lookup, posture checks and scoring. Nothing here
 * re-implements detection logic — it only wires the shared pieces together and
 * normalises their output into one flat, localised finding list for the CLI.
 */

export interface CliFinding {
  kind: "code" | "dependency" | "repo";
  ruleId: string;
  severity: Severity;
  category: Category;
  cwe: string | null;
  file: string | null;
  line: number | null;
  snippet: string | null;
  title: string;
  explanation: string;
  fix: string;
  fingerprint: string;
  // Dependency-specific
  package?: string;
  ecosystem?: string;
  installedVersion?: string;
  fixedVersion?: string | null;
  advisoryId?: string;
  aliases?: string[];
  cvssScore?: number | null;
  referenceUrl?: string;
}

export interface ScanOptions {
  locale?: Locale;
  /** Skip the OSV.dev dependency lookup (no network). */
  offline?: boolean;
  excludes?: string[];
  /** Prepended to every reported file path (and fingerprint), so a subfolder
   * scan maps onto repo-root-relative paths for GitHub code scanning. */
  pathPrefix?: string;
  /** Injectable for tests. */
  fetchFn?: typeof fetch;
}

export interface CliScanResult {
  root: string;
  findings: CliFinding[];
  score: ScoreResult | null;
  stats: { filesScanned: number; dependencies: number; skippedLarge: string[]; checkedDeps: boolean };
}

const enText = (shape: FindingInput, locale: Locale) => localizedFinding(shape, locale);

function normalizeDependency(v: DependencyVulnerability, locale: Locale): CliFinding {
  const d = v.dependency;
  const cs = describeDependencyRisk(v);
  const title = `${d.name} ${d.version}: ${v.advisoryId}`;
  const lf = enText(
    {
      kind: "dependency",
      ruleId: `dep.${v.advisoryId}`,
      title,
      explanation: cs.explanation,
      fix: cs.fix,
      severity: v.severity,
      packageName: d.name,
      ecosystem: d.ecosystem,
      installedVersion: d.version,
      fixedVersion: v.fixedVersion,
      advisoryId: v.advisoryId,
      aliases: v.aliases.join(", "),
    },
    locale,
  );
  return {
    kind: "dependency",
    ruleId: `dep.${v.advisoryId}`,
    severity: v.severity,
    category: "deps",
    cwe: v.cwe,
    file: d.manifest,
    line: null,
    snippet: null,
    title: lf.title,
    explanation: lf.explanation,
    fix: lf.fix,
    fingerprint: depFingerprint(v),
    package: d.name,
    ecosystem: d.ecosystem,
    installedVersion: d.version,
    fixedVersion: v.fixedVersion,
    advisoryId: v.advisoryId,
    aliases: v.aliases,
    cvssScore: v.cvssScore,
    referenceUrl: v.referenceUrl,
  };
}

/** A minimal synthetic repo so the file-based posture checks run without a GitHub token. */
function syntheticRepo(): GitHubRepo {
  return {
    id: 0,
    full_name: "local/scan",
    private: true,
    html_url: "",
    default_branch: "main",
    description: null,
    pushed_at: null,
    archived: false,
    language: null,
    owner: { login: "local" },
    permissions: { admin: false },
    security_and_analysis: undefined,
  };
}

export async function scanFolder(root: string, options: ScanOptions = {}): Promise<CliScanResult> {
  const locale: Locale = options.locale ?? "en";
  const walk: WalkResult = await walkFolder(root, options.excludes ?? []);

  const findings: CliFinding[] = [];

  // Code / secrets / agent / malware / per-file hardening rules.
  for (const f of scanFiles(walk.sources)) {
    const lf = enText({ kind: "code", ruleId: f.ruleId, title: f.title, explanation: f.explanation, fix: f.fix, severity: f.severity }, locale);
    findings.push({
      kind: "code",
      ruleId: f.ruleId,
      severity: f.severity,
      category: categoryOf({ kind: "code", ruleId: f.ruleId }),
      cwe: f.cwe ?? null,
      file: f.file,
      line: f.line,
      snippet: f.snippet,
      title: lf.title,
      explanation: lf.explanation,
      fix: lf.fix,
      fingerprint: codeFingerprint(f),
    });
  }

  // Path-based exposed files + outdated WordPress components.
  const web = [...checkExposedFiles(walk.allPaths.map((path) => ({ path }))), ...checkComponents(walk.components)];
  for (const w of web) {
    const shape = { kind: "code", ruleId: w.ruleId, title: w.title, explanation: w.explanation, fix: w.fix, severity: w.severity, file: w.file, installedVersion: (w as { installedVersion?: string }).installedVersion };
    const lf = enText(shape, locale);
    findings.push({
      kind: "code",
      ruleId: w.ruleId,
      severity: w.severity,
      category: categoryOf({ kind: "code", ruleId: w.ruleId }),
      cwe: null,
      file: w.file,
      line: null,
      snippet: null,
      title: lf.title,
      explanation: lf.explanation,
      fix: lf.fix,
      fingerprint: codeFingerprint({ ruleId: w.ruleId, file: w.file, snippet: w.title }),
    });
  }

  // Repository posture (file-based subset: SECURITY.md, dependency-update config, .env in .gitignore).
  const posture = checkPosture({
    repo: syntheticRepo(),
    files: walk.posture,
    dependabotAlerts: null,
    branchProtected: null,
    usesEnvFiles: walk.sources.some((f) => /getenv\(|process\.env|\$_ENV|dotenv|os\.environ/.test(f.content)),
  });
  for (const p of posture) {
    const lf = enText({ kind: "repo", ruleId: p.ruleId, title: p.title, explanation: p.explanation, fix: p.fix, severity: p.severity }, locale);
    findings.push({
      kind: "repo",
      ruleId: p.ruleId,
      severity: p.severity,
      category: categoryOf({ kind: "repo", ruleId: p.ruleId }),
      cwe: null,
      file: p.file,
      line: null,
      snippet: null,
      title: lf.title,
      explanation: lf.explanation,
      fix: lf.fix,
      fingerprint: sha1(`repo|${p.ruleId}`),
    });
  }

  // Dependencies (OSV.dev) unless offline.
  let dependencies = 0;
  let checkedDeps = false;
  if (!options.offline) {
    const parsed = parseManifests(walk.manifests);
    dependencies = parsed.length;
    const vulns = await checkDependencies(parsed, { fetchFn: options.fetchFn });
    checkedDeps = true;
    for (const v of vulns) findings.push(normalizeDependency(v, locale));
  }

  // Report paths relative to the repo root when scanning a subfolder, and
  // recompute code fingerprints so they match what a full-repo scan produces.
  const prefix = options.pathPrefix?.replace(/^\.?\/|\/$/g, "") ?? "";
  const prefixed: CliFinding[] =
    prefix === ""
      ? findings
      : findings.map((f) => {
          if (!f.file) return f;
          const file = `${prefix}/${f.file}`;
          const fingerprint = f.kind === "code" ? codeFingerprint({ ruleId: f.ruleId, file, snippet: f.snippet ?? f.title }) : f.fingerprint;
          return { ...f, file, fingerprint };
        });

  const score = computeScore(
    prefixed.map((f) => ({ kind: f.kind, ruleId: f.ruleId, severity: f.severity })),
    { code: true, deps: checkedDeps },
  );

  return {
    root,
    findings: prefixed,
    score,
    stats: { filesScanned: walk.sources.length, dependencies, skippedLarge: walk.skippedLarge, checkedDeps },
  };
}

export function hasFindingAtOrAbove(findings: CliFinding[], threshold: Severity): boolean {
  const rank: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return findings.some((f) => isSeverity(f.severity) && rank[f.severity] <= rank[threshold]);
}
