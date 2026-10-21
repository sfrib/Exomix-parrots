import type { Finding, Repo, Suppression } from "@/generated/prisma/client";
import { computeScore, CATEGORY_LABEL_CS, categoryOf } from "./score";
import { partitionSuppressed, sortFindings, SUPPRESSION_LABEL_CS } from "./findings";
import { SEVERITY_LABEL_CS, isSeverity, type Severity } from "./severity";

/** Report exports: SARIF 2.1.0 (GitHub code scanning), JSON and Markdown. */

const SARIF_LEVEL: Record<Severity, "error" | "warning" | "note"> = {
  critical: "error",
  high: "error",
  medium: "warning",
  low: "note",
};

// GitHub maps "security-severity" (0–10) to its own severity labels.
const SECURITY_SEVERITY: Record<Severity, string> = { critical: "9.5", high: "8.0", medium: "5.5", low: "2.0" };

type RepoWithFindings = Repo & { findings: Finding[]; suppressions: Suppression[] };

export function toSarif(repo: RepoWithFindings, version: string) {
  const suppressedBy = new Map(repo.suppressions.map((s) => [s.fingerprint, s]));
  // Repository settings findings have no code location, so they are not part of SARIF.
  const findings = sortFindings(repo.findings).filter((f) => f.file);
  const ruleIds = [...new Set(findings.map((f) => f.ruleId))];
  const rules = ruleIds.map((id) => {
    const f = findings.find((x) => x.ruleId === id)!;
    const sev = isSeverity(f.severity) ? f.severity : "medium";
    return {
      id,
      name: id,
      shortDescription: { text: f.kind === "dependency" ? "Zranitelná závislost" : f.title },
      fullDescription: { text: f.kind === "dependency" ? "Závislost se známou zranitelností (OSV.dev)." : f.explanation },
      help: { text: f.kind === "dependency" ? "Aktualizujte balíček na opravenou verzi." : f.fix },
      properties: {
        tags: ["security", ...(f.cwe ? [`external/cwe/${f.cwe.toLowerCase()}`] : []), categoryOf(f)],
        "security-severity": SECURITY_SEVERITY[sev],
      },
    };
  });
  const results = findings.map((f) => {
    const sev = isSeverity(f.severity) ? f.severity : "medium";
    const suppression = suppressedBy.get(f.fingerprint);
    return {
      ruleId: f.ruleId,
      ruleIndex: ruleIds.indexOf(f.ruleId),
      level: SARIF_LEVEL[sev],
      message: { text: `${f.title}. ${f.explanation} Oprava: ${f.fix}` },
      locations: [{ physicalLocation: { artifactLocation: { uri: f.file! }, region: { startLine: f.line ?? 1 } } }],
      partialFingerprints: { "repoguard/v1": f.fingerprint },
      ...(suppression
        ? { suppressions: [{ kind: "external", status: "accepted", justification: `${SUPPRESSION_LABEL_CS[suppression.status] ?? suppression.status}: ${suppression.note}` }] }
        : {}),
    };
  });
  return {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: { driver: { name: "RepoGuard", version, informationUri: "https://github.com/sfrib/Exomix-parrots/tree/main/repoguard", rules } },
        versionControlProvenance: repo.lastCommitSha
          ? [{ repositoryUri: repo.htmlUrl, revisionId: repo.lastCommitSha, branch: repo.defaultBranch }]
          : undefined,
        results,
      },
    ],
  };
}

export function toJson(repo: RepoWithFindings) {
  const { active, suppressed } = partitionSuppressed(repo.findings, repo.suppressions);
  const score = computeScore(active, { code: Boolean(repo.lastCodeScanAt), deps: Boolean(repo.lastDepScanAt) });
  const strip = (f: Finding) => ({
    id: f.fingerprint,
    category: categoryOf(f),
    ruleId: f.ruleId,
    severity: f.severity,
    title: f.title,
    cwe: f.cwe,
    file: f.file,
    line: f.line,
    snippet: f.snippet,
    explanation: f.explanation,
    fix: f.fix,
    ...(f.kind === "dependency"
      ? { package: f.packageName, ecosystem: f.ecosystem, installedVersion: f.installedVersion, fixedVersion: f.fixedVersion, advisoryId: f.advisoryId, aliases: f.aliases, cvssScore: f.cvssScore }
      : {}),
    firstSeenAt: f.firstSeenAt,
    aiReview: f.aiReview ? JSON.parse(f.aiReview) : null,
  });
  return {
    repository: repo.fullName,
    commit: repo.lastCommitSha,
    generatedAt: new Date().toISOString(),
    lastCodeScanAt: repo.lastCodeScanAt,
    lastDependencyScanAt: repo.lastDepScanAt,
    score,
    findings: sortFindings(active).map(strip),
    suppressed: suppressed.map((f) => ({ ...strip(f), suppression: repo.suppressions.find((s) => s.fingerprint === f.fingerprint) })),
  };
}

export function toMarkdown(repo: RepoWithFindings): string {
  const { active, suppressed } = partitionSuppressed(repo.findings, repo.suppressions);
  const score = computeScore(active, { code: Boolean(repo.lastCodeScanAt), deps: Boolean(repo.lastDepScanAt) });
  const out: string[] = [`# Bezpečnostní report – ${repo.fullName}`, ""];
  if (repo.lastCommitSha) out.push(`Commit \`${repo.lastCommitSha.slice(0, 7)}\` · větev \`${repo.defaultBranch}\``, "");
  if (score) {
    out.push(`**Skóre: ${score.score}/100 (${score.grade})**`, "", "| Oblast | Skóre | Nálezy |", "| --- | --- | --- |");
    for (const c of score.categories) out.push(`| ${CATEGORY_LABEL_CS[c.category]} | ${c.score} | ${c.findings} |`);
    out.push("");
  }
  for (const f of sortFindings(active)) {
    const sev = isSeverity(f.severity) ? SEVERITY_LABEL_CS[f.severity] : f.severity;
    out.push(`## [${sev}] ${f.title}${f.cwe ? ` (${f.cwe})` : ""}`, "");
    if (f.file) out.push(`\`${f.file}${f.line ? `:${f.line}` : ""}\``, "");
    if (f.kind === "dependency") out.push(`Nainstalováno ${f.installedVersion}, opraveno ve verzi ${f.fixedVersion ?? "–"}, CVSS ${f.cvssScore ?? "–"}, ${f.aliases ?? f.advisoryId}`, "");
    if (f.snippet) out.push("```", f.snippet, "```", "");
    out.push(`**Proč je to riziko:** ${f.explanation}`, "", `**Jak to opravit:** ${f.fix}`, "");
  }
  if (suppressed.length) {
    out.push("## Potlačené nálezy", "");
    for (const f of suppressed) {
      const s = repo.suppressions.find((x) => x.fingerprint === f.fingerprint)!;
      out.push(`- ${f.title} – ${SUPPRESSION_LABEL_CS[s.status] ?? s.status}${s.note ? `: ${s.note}` : ""}`);
    }
  }
  return out.join("\n");
}
