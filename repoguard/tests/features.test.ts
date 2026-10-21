import { describe, expect, it } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import type { Finding, Repo, Suppression } from "@/generated/prisma/client";
import { checkPosture } from "@/lib/posture";
import { computeScore, gradeFor } from "@/lib/score";
import { toJson, toMarkdown, toSarif } from "@/lib/export";
import { buildReviewPrompt, reviewFinding, AiReviewError } from "@/lib/ai-review";
import { partitionSuppressed, statusFor } from "@/lib/findings";
import type { GitHubRepo } from "@/lib/github";

const remote: GitHubRepo = {
  id: 1, full_name: "o/r", private: true, html_url: "https://github.com/o/r", default_branch: "main", description: null,
  pushed_at: null, archived: false, language: "PHP", owner: { login: "o" }, permissions: { admin: true },
  security_and_analysis: { secret_scanning: { status: "disabled" } },
};

describe("checkPosture", () => {
  it("reports missing protections", () => {
    const ids = checkPosture({ repo: remote, files: [{ path: ".gitignore", content: "node_modules\n" }], dependabotAlerts: false, branchProtected: false, usesEnvFiles: true }).map((f) => f.ruleId);
    expect(ids).toEqual([
      "repo.dependabot-alerts-off",
      "repo.secret-scanning-off",
      "repo.branch-unprotected",
      "repo.no-security-policy",
      "repo.no-dependency-updates",
      "repo.env-not-ignored",
    ]);
  });

  it("is quiet for a well-configured repo and unknown settings", () => {
    const files = [
      { path: ".gitignore", content: ".env\n.env.*\n" },
      { path: "SECURITY.md", content: "Contact: security@example.invalid" },
      { path: ".github/dependabot.yml", content: "version: 2" },
    ];
    const good = { ...remote, security_and_analysis: { secret_scanning: { status: "enabled" as const }, secret_scanning_push_protection: { status: "enabled" as const } } };
    expect(checkPosture({ repo: good, files, dependabotAlerts: null, branchProtected: null, usesEnvFiles: true })).toEqual([]);
  });
});

describe("computeScore", () => {
  it("averages category scores and grades them", () => {
    const findings = [
      { kind: "code", ruleId: "php.sqli", severity: "critical" },
      { kind: "code", ruleId: "secret.generic", severity: "high" },
      { kind: "dependency", ruleId: "dep.npm", severity: "medium" },
      { kind: "repo", ruleId: "repo.no-security-policy", severity: "low" },
    ];
    const r = computeScore(findings, { code: true, deps: true })!;
    expect(r.categories.map((c) => [c.category, c.score])).toEqual([
      ["malware", 100],
      ["code", 75],
      ["secrets", 85],
      ["web", 100],
      ["agent", 100],
      ["repo", 98],
      ["deps", 95],
    ]);
    expect(r.score).toBe(93);
    expect(r.grade).toBe("A");
    expect(computeScore([], { code: false, deps: false })).toBeNull();
    expect([95, 80, 65, 45, 10].map(gradeFor)).toEqual(["A", "B", "C", "D", "F"]);
  });

  it("floors a category at zero", () => {
    const many = Array.from({ length: 6 }, () => ({ kind: "code", ruleId: "php.sqli", severity: "critical" }));
    const codeCat = computeScore(many, { code: true, deps: false })!.categories.find((c) => c.category === "code")!;
    expect(codeCat.score).toBe(0);
  });
});

function finding(over: Partial<Finding>): Finding {
  return {
    id: "f1", repoId: "r1", kind: "code", fingerprint: "fp1", ruleId: "php.sqli", severity: "critical", title: "SQL injection",
    cwe: "CWE-89", file: "plugin.php", line: 7, snippet: "$wpdb->query( $sql );", explanation: "Riziko.", fix: "Oprava.",
    packageName: null, ecosystem: null, installedVersion: null, fixedVersion: null, advisoryId: null, aliases: null,
    cvssScore: null, cvssVector: null, referenceUrl: null, aiReview: null, aiReviewedAt: null,
    firstSeenAt: new Date("2026-10-01"), createdAt: new Date("2026-10-01"), ...over,
  };
}

const repo = {
  id: "r1", userId: "u1", githubId: 1, fullName: "o/r", defaultBranch: "main", isPrivate: true, htmlUrl: "https://github.com/o/r",
  excludePaths: "", lastCodeScanAt: new Date(), lastDepScanAt: null, lastCommitSha: "abc1234def", createdAt: new Date(),
} satisfies Repo;

describe("triage", () => {
  it("excludes suppressed findings from status", () => {
    const fs = [finding({}), finding({ id: "f2", fingerprint: "fp2", severity: "low", ruleId: "php.info-disclosure" })];
    const sup = [{ fingerprint: "fp1" }];
    const { active, suppressed } = partitionSuppressed(fs, sup);
    expect(suppressed.map((f) => f.id)).toEqual(["f1"]);
    expect(statusFor(repo, active)).toBe("warnings");
    expect(statusFor(repo, [finding({ kind: "repo", severity: "low", ruleId: "repo.no-security-policy" })])).toBe("ok");
  });
});

describe("exports", () => {
  const suppression: Suppression = { id: "s1", repoId: "r1", fingerprint: "fp2", status: "false_positive", note: "Testovací soubor", createdAt: new Date() };
  const data = {
    ...repo,
    findings: [
      finding({}),
      finding({ id: "f2", fingerprint: "fp2", severity: "medium", ruleId: "php.input.unsanitized", cwe: "CWE-20", title: "Vstup", line: 3 }),
      finding({ id: "f3", fingerprint: "fp3", kind: "repo", file: null, line: null, ruleId: "repo.no-security-policy", severity: "low", title: "Chybí SECURITY.md", cwe: null }),
    ],
    suppressions: [suppression],
  };

  it("produces valid-looking SARIF with CWE tags and suppressions", () => {
    const sarif = toSarif(data, "0.2.0");
    expect(sarif.version).toBe("2.1.0");
    const run = sarif.runs[0];
    expect(run.tool.driver.rules.map((r) => r.id)).toEqual(["php.sqli", "php.input.unsanitized"]);
    expect(run.tool.driver.rules[0].properties.tags).toContain("external/cwe/cwe-89");
    expect(run.results).toHaveLength(2); // repo-level finding has no code location
    expect(run.results[0]).toMatchObject({ level: "error", locations: [{ physicalLocation: { artifactLocation: { uri: "plugin.php" }, region: { startLine: 7 } } }] });
    expect(run.results[1].suppressions?.[0].justification).toContain("Testovací soubor");
  });

  it("JSON and Markdown keep suppressed findings separate", () => {
    const json = toJson(data);
    expect(json.findings.map((f) => f.ruleId)).toEqual(["php.sqli", "repo.no-security-policy"]);
    expect(json.suppressed).toHaveLength(1);
    expect(json.score?.grade).toBeDefined();
    const md = toMarkdown(data);
    expect(md).toContain("# Bezpečnostní report – o/r");
    expect(md).toContain("## Potlačené nálezy");
  });
});

describe("AI review", () => {
  const key = "sk_" + "live_" + "Z1y2X3w4V5".repeat(3);
  const content = Array.from({ length: 120 }, (_, i) => (i === 59 ? `$wpdb->query( "DELETE FROM t WHERE id=" . $_POST['id'] ); // '${key}'` : `// line ${i + 1}`)).join("\n");

  it("builds a prompt with a redacted excerpt around the line", () => {
    const prompt = buildReviewPrompt(finding({ line: 60 }), content);
    expect(prompt).toContain("rule: php.sqli");
    expect(prompt).toContain('<code_excerpt file="plugin.php">');
    expect(prompt).toContain("   60 > $wpdb->query");
    expect(prompt).toContain("   20   // line 20");
    expect(prompt).not.toContain("   19   ");
    expect(prompt).not.toContain(key);
  });

  function fakeClient(response: object): Anthropic {
    return { beta: { messages: { parse: async (params: any) => ({ ...response, _params: params }) } } } as unknown as Anthropic;
  }

  it("returns the parsed review and sends a defensive, fallback-enabled request", async () => {
    const review = { verdict: "true_positive", confidence: "high", suggestedSeverity: "critical", summary: "Ano.", reasoning: "Vstup jde do SQL.", fixSteps: ["Použijte prepare()."], patch: "" };
    let sent: any;
    const client = { beta: { messages: { parse: async (p: any) => ((sent = p), { stop_reason: "end_turn", parsed_output: review }) } } } as unknown as Anthropic;
    await expect(reviewFinding(finding({}), content, client)).resolves.toEqual(review);
    expect(sent.model).toBe("claude-opus-5-5");
    expect(sent.fallbacks).toBe("default");
    expect(sent.betas).toEqual(["server-side-fallback-2026-07-01"]);
    expect(sent.system).toContain("Never write exploit code");
  });

  it("reports refusals as a readable error", async () => {
    await expect(reviewFinding(finding({}), null, fakeClient({ stop_reason: "refusal", parsed_output: null }))).rejects.toBeInstanceOf(AiReviewError);
  });
});
