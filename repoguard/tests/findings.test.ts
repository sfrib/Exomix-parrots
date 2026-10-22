import { describe, expect, it } from "vitest";
import { isNewFinding, groupBySeverity, sortFindings } from "@/lib/findings";
import { repoStatus } from "@/lib/severity";
import { decrypt, encrypt } from "@/lib/crypto";
import { hasScanAccess, type GitHubRepo } from "@/lib/github";

describe("isNewFinding", () => {
  const scan1End = new Date("2026-10-01T10:00:30Z");
  it("is never new on the first scan", () => {
    expect(isNewFinding(new Date("2026-10-01T10:00:00Z"), null)).toBe(false);
  });
  it("is new only when first seen after the previous scan finished", () => {
    expect(isNewFinding(new Date("2026-10-01T10:00:00Z"), scan1End)).toBe(false);
    expect(isNewFinding(new Date("2026-10-02T08:00:00Z"), scan1End)).toBe(true);
  });
});

describe("repoStatus", () => {
  it("maps severities to the badge", () => {
    expect(repoStatus([], false)).toBe("unscanned");
    expect(repoStatus([], true)).toBe("ok");
    expect(repoStatus(["low", "medium"], true)).toBe("warnings");
    expect(repoStatus(["medium", "high"], true)).toBe("critical");
  });
});

describe("grouping", () => {
  it("orders by severity, file and line", () => {
    const items = [
      { severity: "low", file: "a", line: 1 },
      { severity: "critical", file: "b", line: 9 },
      { severity: "critical", file: "b", line: 2 },
    ];
    expect(sortFindings(items).map((i) => `${i.severity}:${i.line}`)).toEqual(["critical:2", "critical:9", "low:1"]);
    expect(groupBySeverity(items).map((g) => [g.severity, g.items.length])).toEqual([
      ["critical", 2],
      ["low", 1],
    ]);
  });
});

describe("token encryption", () => {
  it("round-trips and detects tampering", () => {
    process.env.NEXTAUTH_SECRET = "test-secret";
    const enc = encrypt("gho_example");
    expect(enc).not.toContain("gho_example");
    expect(decrypt(enc)).toBe("gho_example");
    const parts = enc.split(".");
    parts[3] = Buffer.from("tampered").toString("base64");
    expect(() => decrypt(parts.join("."))).toThrow();
  });
});

describe("hasScanAccess", () => {
  const base: GitHubRepo = {
    id: 1, full_name: "o/r", private: false, html_url: "", default_branch: "main", description: null,
    pushed_at: null, archived: false, language: null, owner: { login: "owner" }, permissions: { pull: true },
  };
  it("allows owners and collaborators with write access", () => {
    expect(hasScanAccess(base, "OWNER")).toBe(true);
    expect(hasScanAccess({ ...base, permissions: { push: true, pull: true } }, "someone")).toBe(true);
  });
  it("allows read access only to private repos explicitly shared with the user", () => {
    expect(hasScanAccess({ ...base, private: true }, "someone")).toBe(true);
  });
  it("rejects other people's public repos", () => {
    expect(hasScanAccess(base, "someone")).toBe(false);
    expect(hasScanAccess({ ...base, permissions: undefined }, "someone")).toBe(false);
  });
});
