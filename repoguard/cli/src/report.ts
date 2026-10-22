import { buildSarif, type SarifFinding } from "../../src/lib/sarif";
import { SEVERITIES, type Severity } from "../../src/lib/severity";
import { gradeFor, type Grade } from "../../src/lib/score";
import { t } from "../../src/lib/i18n/messages";
import type { Locale } from "../../src/lib/i18n/locale";
import type { CliFinding, CliScanResult } from "./scan";

/** Terminal, JSON, SARIF and Markdown renderers for a CLI scan result. */

type MsgKey = Parameters<typeof t>[0];
const sevLabel = (s: Severity, locale: Locale) => t(`sev.${s}` as MsgKey, locale);
const catLabel = (c: string, locale: Locale) => t(`cat.${c}` as MsgKey, locale);

const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };

function sortFindings(findings: CliFinding[]): CliFinding[] {
  return [...findings].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || (a.file ?? "").localeCompare(b.file ?? "") || (a.line ?? 0) - (b.line ?? 0));
}

// --- Terminal output -------------------------------------------------------

const useColor = () => process.stdout.isTTY && !process.env.NO_COLOR;
const code = (n: string) => (s: string) => (useColor() ? `\x1b[${n}m${s}\x1b[0m` : s);
const bold = code("1");
const dim = code("2");
const COLOR: Record<Severity, (s: string) => string> = {
  critical: code("1;31"),
  high: code("31"),
  medium: code("33"),
  low: code("36"),
};
const GRADE_COLOR: Record<Grade, (s: string) => string> = { A: code("32"), B: code("32"), C: code("33"), D: code("33"), F: code("1;31") };

export function renderTable(result: CliScanResult, locale: Locale): string {
  const out: string[] = [];
  const cs = locale === "cs";
  out.push("", bold(`RepoGuard — ${cs ? "výsledek skenu" : "scan result"}`));
  out.push(dim(result.root), "");

  if (result.score) {
    const g = GRADE_COLOR[result.score.grade];
    out.push(`${cs ? "Skóre" : "Score"}: ${bold(`${result.score.score}/100`)} ${g(`(${result.score.grade})`)}`);
    for (const c of result.score.categories) {
      const bar = catLabel(c.category, locale).padEnd(22);
      out.push(dim(`  ${bar} ${String(c.score).padStart(3)}/100   ${c.findings} ${cs ? "nálezů" : "findings"}`));
    }
    out.push("");
  }

  const findings = sortFindings(result.findings);
  if (findings.length === 0) {
    out.push(code("32")(cs ? "✓ Žádné nálezy." : "✓ No findings."));
  } else {
    for (const f of findings) {
      const loc = f.file ? `${f.file}${f.line ? `:${f.line}` : ""}` : "—";
      out.push(`${COLOR[f.severity](`[${sevLabel(f.severity, locale)}]`)} ${bold(f.title)}  ${dim(`${f.ruleId}${f.cwe ? ` · ${f.cwe}` : ""}`)}`);
      out.push(`  ${dim(loc)}`);
      if (f.snippet) out.push(`  ${dim(f.snippet)}`);
    }
    out.push("");
    const counts = SEVERITIES.map((s) => ({ s, n: findings.filter((f) => f.severity === s).length })).filter((c) => c.n > 0);
    out.push(counts.map((c) => COLOR[c.s](`${c.n} ${sevLabel(c.s, locale).toLowerCase()}`)).join(dim(" · ")));
  }

  const { stats } = result;
  out.push("", dim(`${stats.filesScanned} ${cs ? "souborů" : "files"} · ${stats.checkedDeps ? `${stats.dependencies} ${cs ? "závislostí" : "dependencies"}` : cs ? "závislosti přeskočeny" : "dependencies skipped"}${stats.skippedLarge.length ? ` · ${stats.skippedLarge.length} ${cs ? "velkých přeskočeno" : "large skipped"}` : ""}`));
  return out.join("\n");
}

// --- JSON ------------------------------------------------------------------

export function renderJson(result: CliScanResult): string {
  return JSON.stringify(
    {
      tool: "RepoGuard CLI",
      generatedAt: new Date().toISOString(),
      root: result.root,
      score: result.score,
      stats: result.stats,
      findings: sortFindings(result.findings),
    },
    null,
    2,
  );
}

// --- SARIF -----------------------------------------------------------------

export function renderSarif(result: CliScanResult, version: string): string {
  const sarifFindings: SarifFinding[] = sortFindings(result.findings)
    .filter((f) => f.file)
    .map((f) => ({
      ruleId: f.ruleId,
      title: f.title,
      explanation: f.explanation,
      fix: f.fix,
      severity: f.severity,
      cwe: f.cwe,
      category: f.category,
      file: f.file!,
      line: f.line ?? 1,
      fingerprint: f.fingerprint,
    }));
  return JSON.stringify(
    buildSarif(sarifFindings, {
      toolName: "RepoGuard",
      version,
      informationUri: "https://github.com/sfrib/Exomix-parrots/tree/main/repoguard",
    }),
    null,
    2,
  );
}

// --- Markdown --------------------------------------------------------------

export function renderMarkdown(result: CliScanResult, locale: Locale): string {
  const cs = locale === "cs";
  const out: string[] = [`# RepoGuard — ${cs ? "bezpečnostní report" : "security report"}`, ""];
  if (result.score) {
    out.push(`**${cs ? "Skóre" : "Score"}: ${result.score.score}/100 (${result.score.grade})**`, "");
    out.push(cs ? "| Oblast | Skóre | Nálezy |" : "| Area | Score | Findings |", "| --- | --- | --- |");
    for (const c of result.score.categories) out.push(`| ${catLabel(c.category, locale)} | ${c.score} | ${c.findings} |`);
    out.push("");
  }
  const findings = sortFindings(result.findings);
  if (findings.length === 0) out.push(cs ? "Žádné nálezy." : "No findings.");
  for (const f of findings) {
    out.push(`## [${sevLabel(f.severity, locale)}] ${f.title}${f.cwe ? ` (${f.cwe})` : ""}`, "");
    if (f.file) out.push(`\`${f.file}${f.line ? `:${f.line}` : ""}\``, "");
    if (f.kind === "dependency") out.push(`${f.installedVersion} → ${f.fixedVersion ?? "–"}, CVSS ${f.cvssScore ?? "–"}${f.referenceUrl ? ` · ${f.referenceUrl}` : ""}`, "");
    if (f.snippet) out.push("```", f.snippet, "```", "");
    out.push(`**${cs ? "Proč" : "Why"}:** ${f.explanation}`, "", `**${cs ? "Oprava" : "Fix"}:** ${f.fix}`, "");
  }
  return out.join("\n");
}

export { gradeFor };
