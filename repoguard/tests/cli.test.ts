import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { walkFolder } from "../cli/src/walk";
import { scanFolder, hasFindingAtOrAbove } from "../cli/src/scan";
import { renderJson, renderSarif, renderMarkdown, renderTable } from "../cli/src/report";
import { parseIgnoreFile, isIgnored } from "../cli/src/config";

const FIXTURES = path.resolve(import.meta.dirname, "fixtures");

describe("CLI walker", () => {
  let dir: string;
  beforeAll(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "rg-walk-"));
    await writeFile(path.join(dir, "app.php"), "<?php echo 1;");
    await writeFile(path.join(dir, "package.json"), JSON.stringify({ dependencies: { lodash: "4.17.20" } }));
    await writeFile(path.join(dir, ".gitignore"), "node_modules\n");
    await mkdir(path.join(dir, "node_modules", "x"), { recursive: true });
    await writeFile(path.join(dir, "node_modules", "x", "evil.php"), "<?php eval($_GET['x']);");
  });
  afterAll(async () => rm(dir, { recursive: true, force: true }));

  it("classifies files and honours the excludes", async () => {
    const r = await walkFolder(dir);
    expect(r.sources.map((s) => s.path)).toContain("app.php");
    expect(r.manifests.map((m) => m.path)).toContain("package.json");
    expect(r.posture.map((p) => p.path)).toContain(".gitignore");
    // node_modules is never descended into.
    expect(r.allPaths.some((p) => p.includes("node_modules"))).toBe(false);
  });
});

describe("CLI scan (offline)", () => {
  it("finds the vulnerable fixtures and scores them", async () => {
    const result = await scanFolder(FIXTURES, { offline: true });
    const ids = result.findings.map((f) => f.ruleId);
    expect(ids).toContain("php.sqli");
    expect(result.findings.some((f) => f.severity === "critical")).toBe(true);
    expect(result.score).not.toBeNull();
    // Posture findings are scored under the repository category, not code.
    expect(result.findings.some((f) => f.kind === "repo")).toBe(true);
    expect(result.score!.categories.find((c) => c.category === "repo")!.findings).toBeGreaterThan(0);
    expect(result.stats.checkedDeps).toBe(false);
    // English text by default.
    const sqli = result.findings.find((f) => f.ruleId === "php.sqli")!;
    expect(sqli.title.toLowerCase()).toContain("sql injection");
  });

  it("produces Czech text with --lang cs", async () => {
    const result = await scanFolder(FIXTURES, { offline: true, locale: "cs" });
    const sqli = result.findings.find((f) => f.ruleId === "php.sqli")!;
    expect(sqli.explanation).toMatch(/dotaz|SQL/i);
  });

  it("prefixes reported paths and keeps detection working", async () => {
    const plain = await scanFolder(FIXTURES, { offline: true });
    const prefixed = await scanFolder(FIXTURES, { offline: true, pathPrefix: "repoguard/tests/fixtures" });
    expect(prefixed.findings.every((f) => !f.file || f.file.startsWith("repoguard/tests/fixtures/"))).toBe(true);
    // Same number of findings, prefix only changes reporting.
    expect(prefixed.findings.length).toBe(plain.findings.length);
    // Posture (exact-path detection) still fires under a prefix.
    expect(prefixed.findings.some((f) => f.kind === "repo")).toBe(true);
  });
});

describe("CLI dependency scan (mocked OSV)", () => {
  let dir: string;
  beforeAll(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "rg-dep-"));
    await writeFile(
      path.join(dir, "package.json"),
      JSON.stringify({ dependencies: { "demo-pkg": "1.0.0" } }),
    );
  });
  afterAll(async () => rm(dir, { recursive: true, force: true }));

  const fetchFn = (async (url: string | URL) => {
    const u = String(url);
    if (u.endsWith("/querybatch")) {
      return new Response(JSON.stringify({ results: [{ vulns: [{ id: "GHSA-demo" }] }] }), { status: 200 });
    }
    if (u.includes("/vulns/")) {
      return new Response(
        JSON.stringify({
          id: "GHSA-demo",
          summary: "Demo vulnerability",
          aliases: ["CVE-2024-0001"],
          severity: [{ type: "CVSS_V3", score: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" }],
          affected: [{ package: { name: "demo-pkg", ecosystem: "npm" }, ranges: [{ type: "ECOSYSTEM", events: [{ introduced: "0" }, { fixed: "1.0.1" }] }] }],
        }),
        { status: 200 },
      );
    }
    return new Response("{}", { status: 200 });
  }) as unknown as typeof fetch;

  it("reports a dependency vulnerability with a fixed version", async () => {
    const result = await scanFolder(dir, { fetchFn });
    const dep = result.findings.find((f) => f.kind === "dependency");
    expect(dep).toBeDefined();
    expect(dep!.category).toBe("deps");
    expect(dep!.package).toBe("demo-pkg");
    expect(dep!.fixedVersion).toBe("1.0.1");
    expect(dep!.severity).toBe("critical");
    expect(result.stats.checkedDeps).toBe(true);
  });
});

describe("CLI .repoguardignore", () => {
  it("parses path excludes and rule ignores", () => {
    const cfg = parseIgnoreFile(["# comment", "build/", "vendor", "rule:js.dangerous.eval", "rule:secret.generic src/config", ""].join("\n"));
    expect(cfg.excludes).toEqual(["build", "vendor"]);
    expect(cfg.ignores).toEqual([
      { ruleId: "js.dangerous.eval", pathPrefix: undefined },
      { ruleId: "secret.generic", pathPrefix: "src/config" },
    ]);
  });

  it("matches rule ignores globally and by path prefix", () => {
    const ig = [{ ruleId: "js.dangerous.eval", pathPrefix: "lib/rules" }];
    expect(isIgnored(ig, "js.dangerous.eval", "lib/rules/js.ts")).toBe(true);
    expect(isIgnored(ig, "js.dangerous.eval", "app/real.ts")).toBe(false); // elsewhere still reported
    expect(isIgnored([{ ruleId: "php.sqli" }], "php.sqli", "anywhere.php")).toBe(true);
  });

  it("drops ignored findings from a scan but keeps the rest", async () => {
    const all = await scanFolder(FIXTURES, { offline: true });
    const filtered = await scanFolder(FIXTURES, { offline: true, ignores: [{ ruleId: "php.sqli" }] });
    expect(all.findings.some((f) => f.ruleId === "php.sqli")).toBe(true);
    expect(filtered.findings.some((f) => f.ruleId === "php.sqli")).toBe(false);
    expect(filtered.findings.length).toBeLessThan(all.findings.length);
  });
});

describe("CLI renderers", () => {
  it("renders valid SARIF, JSON, Markdown and a table", async () => {
    const result = await scanFolder(FIXTURES, { offline: true });

    const sarif = JSON.parse(renderSarif(result, "9.9.9"));
    expect(sarif.version).toBe("2.1.0");
    expect(sarif.runs[0].tool.driver.name).toBe("RepoGuard");
    // Repo-level findings (no file) are excluded from SARIF results.
    expect(sarif.runs[0].results.every((r: { locations: unknown[] }) => r.locations.length === 1)).toBe(true);
    expect(sarif.runs[0].results.length).toBe(result.findings.filter((f) => f.file).length);

    const json = JSON.parse(renderJson(result));
    expect(json.findings.length).toBe(result.findings.length);
    expect(json.score.grade).toMatch(/[A-F]/);

    expect(renderMarkdown(result, "en")).toContain("# RepoGuard");
    expect(renderTable(result, "en")).toContain("Score");
  });

  it("fail-on threshold respects severity ordering", async () => {
    const result = await scanFolder(FIXTURES, { offline: true });
    expect(hasFindingAtOrAbove(result.findings, "critical")).toBe(true);
    expect(hasFindingAtOrAbove(result.findings, "low")).toBe(true);
    // A result with only low findings should not trip a high threshold.
    const lowOnly = { ...result, findings: result.findings.filter((f) => f.severity === "low") };
    expect(hasFindingAtOrAbove(lowOnly.findings, "high")).toBe(false);
  });
});
