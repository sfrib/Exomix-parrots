import { describe, expect, it } from "vitest";
import type { Finding, Repo, ThreatModel } from "@/generated/prisma/client";
import { renderReport } from "@/lib/report";

const repo = {
  id: "r1", userId: "u1", githubId: 1, fullName: "demo/registr-ptaku", defaultBranch: "main", isPrivate: true,
  htmlUrl: "https://github.com/demo/registr-ptaku", excludePaths: "", lastCodeScanAt: new Date(), lastDepScanAt: new Date(),
  lastCommitSha: "0123456789", createdAt: new Date(),
} satisfies Repo;

const SEVERITIES = ["critical", "high", "medium", "low"];

function findings(n: number): Finding[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `f${i}`, repoId: "r1", kind: i % 10 === 0 ? "dependency" : "code", fingerprint: `fp${i}`, ruleId: "php.sqli",
    severity: SEVERITIES[i % 4], title: `Nález č. ${i} – SQL injection v registru`, cwe: "CWE-89", file: `wp-content/plugins/registr/soubor-${i}.php`,
    line: i + 1, snippet: `$wpdb->query( "SELECT * FROM {$wpdb->prefix}ptaci WHERE id = " . $_GET['id'] ); // ${i}`,
    explanation: "Vysvětlení rizika s českými znaky: ěščřžýáíé ".repeat(4), fix: "Návrh opravy pomocí $wpdb->prepare(). ".repeat(4),
    packageName: "lodash", ecosystem: "npm", installedVersion: "4.17.15", fixedVersion: "4.17.19", advisoryId: "GHSA-x", aliases: "CVE-2020-8203",
    cvssScore: 7.4, cvssVector: null, referenceUrl: "https://osv.dev/vulnerability/GHSA-x",
    aiReview: i === 1 ? JSON.stringify({ verdict: "true_positive", confidence: "high", suggestedSeverity: "high", summary: "Skutečný problém.", reasoning: "", fixSteps: [], patch: "" }) : null,
    aiReviewedAt: null, firstSeenAt: new Date(), createdAt: new Date(),
  }));
}

const scenario = (id: string) => ({
  id, title: "Únik dat majitelů", attacker: "Registrovaný uživatel", entryPoint: "AJAX akce", steps: ["Krok jedna.", "Krok dva."],
  impact: "Únik osobních údajů.", relatedFindings: ["F1", "F2"], likelihood: "high", severity: "critical",
});

const threatModel: ThreatModel = {
  id: "t1", repoId: "r1", status: "done", stage: "audit", model: "claude-opus-5-5", commitSha: "0123456", inputs: "[]",
  scenarios: JSON.stringify({ scenarios: ["S1", "S2", "S3", "S4"].map(scenario) }),
  defenses: JSON.stringify({ defenses: [{ scenarioId: "S1", prevent: ["Použít prepare()."], detect: ["Logy."], contain: ["Zálohy."], verify: "Test." }] }),
  audit: JSON.stringify({ riskLevel: "high", score: 40, summary: "Shrnutí.", verdicts: [], actionPlan: [{ priority: 1, action: "Opravit SQL.", effort: "low", scenarioIds: ["S1"] }], strengths: [] }),
  error: null, createdAt: new Date(), finishedAt: new Date(),
};

describe("PDF report", () => {
  // Regression: long reports used to crash react-pdf ("unsupported number") because of dynamic page numbers.
  it.each([1, 40, 150])("renders %i findings with an attack-scenario analysis", async (n) => {
    const pdf = await renderReport(repo, findings(n), [{ id: "s", repoId: "r1", fingerprint: "fp0", status: "accepted_risk", note: "OK", createdAt: new Date() }], threatModel);
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(10_000);
  }, 60_000);
});
