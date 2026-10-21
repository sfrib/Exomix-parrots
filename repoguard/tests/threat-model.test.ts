import { describe, expect, it } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import type { Finding } from "@/generated/prisma/client";
import {
  ThreatModelError,
  buildContext,
  buildFindingRefs,
  pickExcerptTargets,
  runPipeline,
  stripCode,
} from "@/lib/threat-model";

function finding(over: Partial<Finding>): Finding {
  return {
    id: "f", repoId: "r", kind: "code", fingerprint: "fp", ruleId: "php.sqli", severity: "high", title: "SQL injection",
    cwe: "CWE-89", file: "a.php", line: 10, snippet: "$wpdb->query( $sql );", explanation: "", fix: "",
    packageName: null, ecosystem: null, installedVersion: null, fixedVersion: null, advisoryId: null, aliases: null,
    cvssScore: null, cvssVector: null, referenceUrl: null, aiReview: null, aiReviewedAt: null,
    firstSeenAt: new Date(), createdAt: new Date(), ...over,
  };
}

const findings = [
  finding({ fingerprint: "a", severity: "medium", ruleId: "php.input.unsanitized", title: "Vstup", file: "b.php", line: 3 }),
  finding({ fingerprint: "b", severity: "critical", ruleId: "secret.wp-db-password", title: "Heslo", file: "wp-config.php", line: 2, snippet: "define( 'DB_PASSWORD', 'Ara-********' );" }),
  finding({ fingerprint: "c", severity: "high", file: "a.php", line: 10 }),
  finding({ fingerprint: "d", kind: "dependency", severity: "high", ruleId: "dep.npm", title: "lodash", file: "package-lock.json", line: null, snippet: null, packageName: "lodash", installedVersion: "4.17.15", ecosystem: "npm", fixedVersion: "4.17.19", aliases: "CVE-2020-8203" }),
  finding({ fingerprint: "e", severity: "critical", file: "a.php", line: 50 }),
];

describe("context building", () => {
  it("numbers findings by severity and builds a redacted context", () => {
    const refs = buildFindingRefs(findings);
    expect(refs.map((r) => `${r.ref}:${r.fingerprint}`)).toEqual(["F1:e", "F2:b", "F3:c", "F4:d", "F5:a"]);
    const key = "sk_" + "live_" + "K9j8H7g6F5".repeat(3);
    const ctx = buildContext({ fullName: "o/r" }, findings, refs, [
      { file: "a.php", line: 50, content: Array.from({ length: 80 }, (_, i) => (i === 49 ? `$k = '${key}';` : `// ${i + 1}`)).join("\n") },
    ]);
    expect(ctx).toContain("F1 [critical] php.sqli CWE-89 – SQL injection @ a.php:50");
    expect(ctx).toContain("package lodash 4.17.15 (npm), fixed in 4.17.19, CVE-2020-8203");
    expect(ctx).toContain('<code_excerpt file="a.php" lines="35-65">');
    expect(ctx).not.toContain(key);
  });

  it("picks one excerpt per file from critical/high code findings", () => {
    expect(pickExcerptTargets(findings)).toEqual([
      { file: "a.php", line: 50 },
      { file: "wp-config.php", line: 2 },
    ]);
  });

  it("strips code blocks from model output", () => {
    const out = stripCode({ a: ["ok", "x ```bash\nrm -rf /\n``` y"], b: { c: "`" + "x".repeat(70) + "`" } });
    expect(out).toEqual({ a: ["ok", "x [kód odstraněn] y"], b: { c: "[kód odstraněn]" } });
  });
});

const SCENARIOS = {
  scenarios: [
    {
      id: "S1", title: "Únik dat majitelů", attacker: "Registrovaný uživatel", entryPoint: "AJAX akce delete_bird",
      steps: ["Odešle upravený parametr id.", "Dotaz vrátí cizí záznamy."], impact: "Únik osobních údajů.",
      relatedFindings: ["F1", "F3"], likelihood: "high", severity: "critical",
    },
  ],
};
const DEFENSES = { defenses: [{ scenarioId: "S1", prevent: ["Použít $wpdb->prepare()."], detect: ["Logovat chyby SQL."], contain: ["Změnit hesla."], verify: "Znovu spustit RepoGuard." }] };
const AUDIT = {
  riskLevel: "high", score: 41.6, summary: "Shrnutí.", verdicts: [{ scenarioId: "S1", realistic: true, reason: "Akce je dostupná." }],
  actionPlan: [{ priority: 1, action: "Opravit SQL.", effort: "low", scenarioIds: ["S1"] }], strengths: [],
};

function fakeClient(responses: object[], calls: any[] = []): Anthropic {
  let i = 0;
  return {
    beta: {
      messages: {
        stream: (params: any) => {
          calls.push(params);
          const body = responses[i++];
          return { finalMessage: async () => body };
        },
      },
    },
  } as unknown as Anthropic;
}

const ok = (data: object) => ({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(data) }] });

describe("runPipeline", () => {
  it("runs modeler → defender → auditor and passes results along", async () => {
    const calls: any[] = [];
    const stages: string[] = [];
    const result = await runPipeline("<repository/>", fakeClient([ok(SCENARIOS), ok(DEFENSES), ok(AUDIT)], calls), {
      onStage: async (s) => void stages.push(s),
    });
    expect(stages).toEqual(["scenarios", "defenses", "audit"]);
    expect(calls).toHaveLength(3);
    for (const c of calls) {
      expect(c.model).toBe("claude-opus-5-5");
      expect(c.fallbacks).toBe("default");
      expect(c.system).toContain("Never output code, exploit payloads");
    }
    expect(calls[1].messages[0].content).toContain("Únik dat majitelů");
    expect(calls[2].messages[0].content).toContain("Logovat chyby SQL");
    expect(result.audit.score).toBe(42);
    expect(result.scenarios.scenarios[0].relatedFindings).toEqual(["F1", "F3"]);
  });

  it("stops early when there are no scenarios", async () => {
    const calls: any[] = [];
    const result = await runPipeline("ctx", fakeClient([ok({ scenarios: [] })], calls));
    expect(calls).toHaveLength(1);
    expect(result.audit.score).toBe(100);
  });

  it("turns refusals and malformed output into readable errors", async () => {
    await expect(runPipeline("ctx", fakeClient([{ stop_reason: "refusal", content: [] }]))).rejects.toThrow(ThreatModelError);
    await expect(runPipeline("ctx", fakeClient([ok({ wrong: true })]))).rejects.toThrow("neodpovídá");
  });
});
