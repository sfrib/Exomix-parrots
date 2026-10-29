import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, beforeAll } from "vitest";
import type { Finding, Repo } from "@/generated/prisma/client";
import { canonicalReport, signReport, verifyReport } from "@/lib/sign";
import { buildAnnotationPatch, annotatablePaths } from "@/lib/annotate";

beforeAll(() => {
  process.env.REPORT_SIGNING_SECRET = "test-report-secret";
});

const repo = { fullName: "demo/registr", lastCommitSha: "abc1234" } as Repo;

function finding(over: Partial<Finding>): Finding {
  return {
    id: "f", repoId: "r", kind: "code", fingerprint: "fp", ruleId: "php.sqli", severity: "critical", title: "SQL injection",
    cwe: "CWE-89", file: "plugin.php", line: 3, snippet: "", explanation: "", fix: "",
    packageName: null, ecosystem: null, installedVersion: null, fixedVersion: null, advisoryId: null, aliases: null,
    cvssScore: null, cvssVector: null, referenceUrl: null, aiReview: null, aiReviewedAt: null,
    firstSeenAt: new Date(), createdAt: new Date(), ...over,
  };
}

describe("report signing", () => {
  const findings = [finding({ fingerprint: "a" }), finding({ fingerprint: "b", ruleId: "secret.generic", severity: "high" })];

  it("signs and verifies a report, and detects tampering", () => {
    const canon = canonicalReport(repo, findings);
    const sig = signReport(canon);
    expect(sig.algorithm).toBe("HMAC-SHA256");
    expect(verifyReport(canon, sig)).toBe(true);
    // Tamper with a finding: signature no longer matches.
    const tampered = canonicalReport(repo, [finding({ fingerprint: "a", severity: "low" }), findings[1]]);
    expect(verifyReport(tampered, sig)).toBe(false);
    // Tamper with the signature value.
    expect(verifyReport(canon, { ...sig, value: sig.value.slice(0, -2) + "xy" })).toBe(false);
  });

  it("is independent of finding order", () => {
    const a = signReport(canonicalReport(repo, findings));
    const b = signReport(canonicalReport(repo, [...findings].reverse()), a.signedAt);
    expect(a.value).toBe(b.value);
  });
});

describe("annotation patch", () => {
  const files = [
    { path: "plugin.php", content: "<?php\n$id = $_POST['id'];\n$wpdb->query( 'DELETE FROM x WHERE id=' . $id );\necho 'done';\n" },
    { path: "logo.png", content: "binary" }, // unknown comment syntax -> skipped
  ];
  const findings = [
    finding({ file: "plugin.php", line: 3, title: "SQL injection", severity: "critical", cwe: "CWE-89" }),
    finding({ file: "logo.png", line: 1, ruleId: "x", title: "y" }),
    finding({ file: "missing.php", line: 1, ruleId: "z", title: "w" }),
  ];

  it("only annotates files with a known comment syntax", () => {
    expect(annotatablePaths(findings)).toEqual(["plugin.php", "missing.php"]);
  });

  it("produces a unified diff that git can apply, inserting a RepoGuard comment at the line", () => {
    const patch = buildAnnotationPatch(files, findings, "https://github.com/demo/registr", "abc1234");
    expect(patch).toContain("diff --git a/plugin.php b/plugin.php");
    expect(patch).toContain("+// RepoGuard [critical] php.sqli CWE-89 — SQL injection");
    expect(patch).not.toContain("logo.png");

    // Apply it to a real git repo and confirm the comment lands above line 3.
    const dir = mkdtempSync(path.join(tmpdir(), "rg-patch-"));
    execFileSync("git", ["init", "-q"], { cwd: dir });
    execFileSync("git", ["config", "user.email", "t@t"], { cwd: dir });
    execFileSync("git", ["config", "user.name", "t"], { cwd: dir });
    writeFileSync(path.join(dir, "plugin.php"), files[0].content);
    execFileSync("git", ["add", "."], { cwd: dir });
    execFileSync("git", ["commit", "-qm", "init"], { cwd: dir });
    writeFileSync(path.join(dir, "rg.patch"), patch);
    // git apply --check succeeds => the patch is valid and applies cleanly.
    execFileSync("git", ["apply", "--check", "rg.patch"], { cwd: dir });
    execFileSync("git", ["apply", "rg.patch"], { cwd: dir });
    const lines = readFileSync(path.join(dir, "plugin.php"), "utf8").split("\n");
    expect(lines[2]).toContain("// RepoGuard [critical] php.sqli");
    expect(lines[3]).toContain("$wpdb->query");
  });
});
