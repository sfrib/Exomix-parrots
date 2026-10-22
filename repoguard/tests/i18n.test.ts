import { describe, expect, it } from "vitest";
import { ALL_RULES } from "@/lib/scanner/rules";
import { RULE_EN, localizedFinding } from "@/lib/i18n/findings";
import { MESSAGES } from "@/lib/i18n/messages";
import type { Finding } from "@/generated/prisma/client";

describe("i18n completeness", () => {
  it("has English text for every scanner rule id", () => {
    const missing = ALL_RULES.filter((r) => !RULE_EN[r.id] || !RULE_EN[r.id].explanation).map((r) => r.id);
    expect(missing).toEqual([]);
  });

  it("has both locales for every UI message", () => {
    const bad = Object.entries(MESSAGES).filter(([, m]) => !m.en || !m.cs).map(([k]) => k);
    expect(bad).toEqual([]);
  });

  it("every English rule entry has a non-empty title, explanation and fix", () => {
    for (const [id, t] of Object.entries(RULE_EN)) {
      expect(t.title, id).toBeTruthy();
      expect(t.explanation, id).toBeTruthy();
      expect(t.fix, id).toBeTruthy();
    }
  });
});

function finding(over: Partial<Finding>): Finding {
  return {
    id: "f", repoId: "r", kind: "code", fingerprint: "fp", ruleId: "php.sqli", severity: "high", title: "CZ titulek",
    cwe: "CWE-89", file: "a.php", line: 1, snippet: "", explanation: "CZ vysvětlení", fix: "CZ oprava",
    packageName: null, ecosystem: null, installedVersion: null, fixedVersion: null, advisoryId: null, aliases: null,
    cvssScore: null, cvssVector: null, referenceUrl: null, aiReview: null, aiReviewedAt: null,
    firstSeenAt: new Date(), createdAt: new Date(), ...over,
  };
}

describe("localizedFinding", () => {
  it("returns stored Czech for cs and English for en", () => {
    const f = finding({});
    expect(localizedFinding(f, "cs")).toEqual({ title: "CZ titulek", explanation: "CZ vysvětlení", fix: "CZ oprava" });
    const en = localizedFinding(f, "en");
    expect(en.title).toContain("SQL injection");
    expect(en.explanation).toContain("concatenating");
  });

  it("builds English dependency text from fields", () => {
    const f = finding({ kind: "dependency", ruleId: "dep.npm", title: "lodash 4.17.15 – CVE-2020-8203", packageName: "lodash", ecosystem: "npm", installedVersion: "4.17.15", fixedVersion: "4.17.19", advisoryId: "GHSA-x", aliases: "CVE-2020-8203" });
    const en = localizedFinding(f, "en");
    expect(en.explanation).toContain("lodash version 4.17.15");
    expect(en.fix).toContain("npm install lodash@^4.17.19");
  });

  it("builds English component and repo text", () => {
    expect(localizedFinding(finding({ ruleId: "comp.wp-core", severity: "high", installedVersion: "5.2.1", file: "wp-includes/version.php" }), "en").title).toBe("WordPress core version 5.2.1");
    expect(localizedFinding(finding({ kind: "repo", ruleId: "repo.branch-unprotected", file: null, line: null }), "en").title).toContain("default branch");
  });
});
