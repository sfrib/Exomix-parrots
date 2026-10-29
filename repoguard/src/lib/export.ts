import type { Finding, Repo, Suppression } from "@/generated/prisma/client";
import { computeScore, categoryOf } from "./score";
import { partitionSuppressed, sortFindings, SUPPRESSION_LABEL_CS } from "./findings";
import { isSeverity } from "./severity";
import { localizedFinding } from "./i18n/findings";
import { t } from "./i18n/messages";
import type { Locale } from "./i18n/locale";
import { canonicalReport, signReport } from "./sign";
import { buildSarif, type SarifFinding } from "./sarif";

/** Report exports: SARIF 2.1.0 (GitHub code scanning), JSON and Markdown. */

const INFORMATION_URI = "https://github.com/sfrib/Exomix-parrots/tree/main/repoguard";

type RepoWithFindings = Repo & { findings: Finding[]; suppressions: Suppression[] };

export function toSarif(repo: RepoWithFindings, version: string, locale: Locale = "en") {
  const suppressedBy = new Map(repo.suppressions.map((s) => [s.fingerprint, s]));
  // Repository settings findings have no code location, so they are not part of SARIF.
  const sarifFindings: SarifFinding[] = sortFindings(repo.findings)
    .filter((f) => f.file)
    .map((f) => {
      const lf = localizedFinding(f, locale);
      const suppression = suppressedBy.get(f.fingerprint);
      return {
        ruleId: f.ruleId,
        title: lf.title,
        explanation: lf.explanation,
        fix: lf.fix,
        severity: isSeverity(f.severity) ? f.severity : "medium",
        cwe: f.cwe,
        category: categoryOf(f),
        file: f.file!,
        line: f.line ?? 1,
        fingerprint: f.fingerprint,
        suppression: suppression
          ? { justification: `${SUPPRESSION_LABEL_CS[suppression.status] ?? suppression.status}: ${suppression.note}` }
          : null,
      };
    });
  return buildSarif(sarifFindings, {
    toolName: "RepoGuard",
    version,
    informationUri: INFORMATION_URI,
    provenance: repo.lastCommitSha ? [{ repositoryUri: repo.htmlUrl, revisionId: repo.lastCommitSha, branch: repo.defaultBranch }] : undefined,
  });
}

export function toJson(repo: RepoWithFindings, locale: Locale = "en") {
  const { active, suppressed } = partitionSuppressed(repo.findings, repo.suppressions);
  const score = computeScore(active, { code: Boolean(repo.lastCodeScanAt), deps: Boolean(repo.lastDepScanAt) });
  const strip = (f: Finding) => {
    const lf = localizedFinding(f, locale);
    return {
    id: f.fingerprint,
    category: categoryOf(f),
    ruleId: f.ruleId,
    severity: f.severity,
    title: lf.title,
    cwe: f.cwe,
    file: f.file,
    line: f.line,
    snippet: f.snippet,
    explanation: lf.explanation,
    fix: lf.fix,
    ...(f.kind === "dependency"
      ? { package: f.packageName, ecosystem: f.ecosystem, installedVersion: f.installedVersion, fixedVersion: f.fixedVersion, advisoryId: f.advisoryId, aliases: f.aliases, cvssScore: f.cvssScore }
      : {}),
    firstSeenAt: f.firstSeenAt,
    aiReview: f.aiReview ? JSON.parse(f.aiReview) : null,
    };
  };
  let signature = null;
  try {
    signature = signReport(canonicalReport(repo, active));
  } catch {
    // Signing secret not configured; report is still valid, just unsigned.
  }
  return {
    repository: repo.fullName,
    commit: repo.lastCommitSha,
    generatedAt: new Date().toISOString(),
    signature,
    lastCodeScanAt: repo.lastCodeScanAt,
    lastDependencyScanAt: repo.lastDepScanAt,
    score,
    findings: sortFindings(active).map(strip),
    suppressed: suppressed.map((f) => ({ ...strip(f), suppression: repo.suppressions.find((s) => s.fingerprint === f.fingerprint) })),
  };
}

export function toMarkdown(repo: RepoWithFindings, locale: Locale = "en"): string {
  const { active, suppressed } = partitionSuppressed(repo.findings, repo.suppressions);
  const score = computeScore(active, { code: Boolean(repo.lastCodeScanAt), deps: Boolean(repo.lastDepScanAt) });
  const cs = locale === "cs";
  const out: string[] = [`# ${cs ? "Bezpečnostní report" : "Security report"} – ${repo.fullName}`, ""];
  if (repo.lastCommitSha) out.push(`Commit \`${repo.lastCommitSha.slice(0, 7)}\` · ${cs ? "větev" : "branch"} \`${repo.defaultBranch}\``, "");
  if (score) {
    out.push(
      `**${cs ? "Skóre" : "Score"}: ${score.score}/100 (${score.grade})**`,
      "",
      cs ? "| Oblast | Skóre | Nálezy |" : "| Area | Score | Findings |",
      "| --- | --- | --- |",
    );
    for (const c of score.categories) out.push(`| ${t(`cat.${c.category}`, locale)} | ${c.score} | ${c.findings} |`);
    out.push("");
  }
  for (const f of sortFindings(active)) {
    const sev = isSeverity(f.severity) ? t(`sev.${f.severity}`, locale) : f.severity;
    const lf = localizedFinding(f, locale);
    out.push(`## [${sev}] ${lf.title}${f.cwe ? ` (${f.cwe})` : ""}`, "");
    if (f.file) out.push(`\`${f.file}${f.line ? `:${f.line}` : ""}\``, "");
    if (f.kind === "dependency") out.push(`${f.installedVersion} → ${f.fixedVersion ?? "–"}, CVSS ${f.cvssScore ?? "–"}, ${f.aliases ?? f.advisoryId}`, "");
    if (f.snippet) out.push("```", f.snippet, "```", "");
    out.push(`**${t("finding.why", locale)}:** ${lf.explanation}`, "", `**${t("finding.fix", locale)}:** ${lf.fix}`, "");
  }
  if (suppressed.length) {
    out.push(`## ${cs ? "Potlačené nálezy" : "Suppressed findings"}`, "");
    for (const f of suppressed) {
      const s = repo.suppressions.find((x) => x.fingerprint === f.fingerprint)!;
      const label = s.status === "false_positive" ? (cs ? "Falešně pozitivní" : "False positive") : cs ? "Akceptované riziko" : "Accepted risk";
      out.push(`- ${localizedFinding(f, locale).title} – ${label}${s.note ? `: ${s.note}` : ""}`);
    }
  }
  return out.join("\n");
}
