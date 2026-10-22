import { describe, expect, it } from "vitest";
import { compareVersions, versionFromConstraint } from "@/lib/deps/version";
import { cvss3BaseScore } from "@/lib/deps/cvss";
import { parseManifests, parseRequirements } from "@/lib/deps/parsers";
import { checkDependencies, fixedVersionFor, type OsvVulnerability } from "@/lib/deps/osv";

describe("compareVersions", () => {
  it.each([
    ["1.2.3", "1.2.4", -1],
    ["1.10.0", "1.9.9", 1],
    ["v2.0.0", "2.0", 0],
    ["1.0.0-beta.2", "1.0.0", -1],
    ["1.0rc1", "1.0", -1],
    ["4.17.21", "4.17.21", 0],
  ])("%s vs %s", (a, b, expected) => {
    expect(compareVersions(a, b)).toBe(expected);
  });

  it("derives versions from ranges", () => {
    expect(versionFromConstraint("^1.2")).toBe("1.2.0");
    expect(versionFromConstraint(">=7.4 <9")).toBe("7.4.0");
    expect(versionFromConstraint("*")).toBeNull();
    expect(versionFromConstraint("dev-main")).toBeNull();
  });
});

describe("cvss3BaseScore", () => {
  it.each([
    ["CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H", 9.8],
    ["CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N", 6.1],
    ["CVSS:3.0/AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:N/A:N", 5.9],
    ["CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:N", 0],
  ])("%s → %s", (vector, score) => {
    expect(cvss3BaseScore(vector)).toBe(score);
  });

  it("rejects malformed vectors", () => {
    expect(cvss3BaseScore("CVSS:3.1/AV:X")).toBeNull();
    expect(cvss3BaseScore("CVSS:4.0/AV:N")).toBeNull();
  });
});

describe("parseManifests", () => {
  it("prefers lockfiles and marks direct dependencies", () => {
    const deps = parseManifests([
      { path: "composer.json", content: JSON.stringify({ require: { php: ">=8.0", "guzzlehttp/guzzle": "^7.0" } }) },
      {
        path: "composer.lock",
        content: JSON.stringify({
          packages: [
            { name: "guzzlehttp/guzzle", version: "7.4.1" },
            { name: "guzzlehttp/psr7", version: "v2.1.0" },
          ],
          "packages-dev": [{ name: "phpunit/phpunit", version: "9.5.0" }],
        }),
      },
      { path: "theme/package.json", content: JSON.stringify({ dependencies: { lodash: "^4.17.0" } }) },
      {
        path: "theme/package-lock.json",
        content: JSON.stringify({
          lockfileVersion: 3,
          packages: {
            "": { name: "theme" },
            "node_modules/lodash": { version: "4.17.15" },
            "node_modules/a/node_modules/minimist": { version: "1.2.0" },
          },
        }),
      },
    ]);
    const summary = deps.map((d) => `${d.ecosystem}:${d.name}@${d.version}${d.direct ? "*" : ""}${d.approximate ? "~" : ""}`);
    expect(summary.sort()).toEqual(
      [
        "Packagist:guzzlehttp/guzzle@7.4.1*",
        "Packagist:guzzlehttp/psr7@2.1.0",
        "Packagist:phpunit/phpunit@9.5.0",
        "npm:lodash@4.17.15*",
        "npm:minimist@1.2.0",
      ].sort(),
    );
  });

  it("falls back to ranges without a lockfile", () => {
    const deps = parseManifests([{ path: "package.json", content: JSON.stringify({ devDependencies: { jquery: "~3.4.1" } }) }]);
    expect(deps).toEqual([{ ecosystem: "npm", name: "jquery", version: "3.4.1", manifest: "package.json", direct: true, approximate: true }]);
  });

  it("parses yarn.lock v1", () => {
    const deps = parseManifests([
      { path: "package.json", content: JSON.stringify({ dependencies: { axios: "^0.21.0" } }) },
      {
        path: "yarn.lock",
        content: '# yarn lockfile v1\n\naxios@^0.21.0:\n  version "0.21.1"\n  resolved "https://x"\n\n"@babel/core@^7.0.0", "@babel/core@^7.1.0":\n  version "7.12.3"\n',
      },
    ]);
    expect(deps.map((d) => `${d.name}@${d.version}${d.direct ? "*" : ""}`)).toEqual(["axios@0.21.1*", "@babel/core@7.12.3"]);
  });

  it("parses requirements.txt", () => {
    const deps = parseRequirements({
      path: "requirements.txt",
      content: "# comment\nDjango==3.2.0\nrequests>=2.20  # loose\n-r other.txt\nPyYAML[extra]==5.3\ngit+https://x\nfoo<2\n",
    });
    expect(deps.map((d) => `${d.name}@${d.version}${d.approximate ? "~" : ""}`)).toEqual(["django@3.2.0", "requests@2.20~", "pyyaml@5.3"]);
  });
});

const LODASH_VULN: OsvVulnerability = {
  id: "GHSA-p6mc-m468-83gw",
  summary: "Prototype Pollution in lodash",
  aliases: ["CVE-2020-8203"],
  severity: [{ type: "CVSS_V3", score: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:N/I:H/A:H" }],
  database_specific: { severity: "HIGH", cwe_ids: ["CWE-1321"] },
  affected: [
    {
      package: { name: "lodash", ecosystem: "npm" },
      ranges: [{ type: "SEMVER", events: [{ introduced: "3.7.0" }, { fixed: "4.17.19" }] }],
    },
  ],
};

describe("OSV client", () => {
  const dep = { ecosystem: "npm" as const, name: "lodash", version: "4.17.15", manifest: "package-lock.json", direct: true, approximate: false };

  it("finds the fixed version for the matching range", () => {
    expect(fixedVersionFor(dep, LODASH_VULN)).toBe("4.17.19");
    const multi: OsvVulnerability = {
      ...LODASH_VULN,
      affected: [
        {
          package: { name: "lodash", ecosystem: "npm" },
          ranges: [{ type: "ECOSYSTEM", events: [{ introduced: "0" }, { fixed: "3.10.2" }, { introduced: "4.0.0" }, { fixed: "4.17.21" }] }],
        },
      ],
    };
    expect(fixedVersionFor(dep, multi)).toBe("4.17.21");
  });

  it("queries OSV in batch, fetches details and maps severity", async () => {
    const calls: string[] = [];
    const fetchFn = (async (url: string, init?: RequestInit) => {
      calls.push(`${init?.method ?? "GET"} ${url}`);
      if (url.endsWith("/querybatch")) {
        const body = JSON.parse(String(init!.body));
        return Response.json({
          results: body.queries.map((q: any) => (q.package.name === "lodash" ? { vulns: [{ id: LODASH_VULN.id }] } : {})),
        });
      }
      return Response.json(LODASH_VULN);
    }) as typeof fetch;

    const results = await checkDependencies([dep, { ...dep, name: "left-pad", version: "1.3.0" }], { fetchFn });
    expect(calls).toEqual(["POST https://api.osv.dev/v1/querybatch", "GET https://api.osv.dev/v1/vulns/GHSA-p6mc-m468-83gw"]);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      advisoryId: "GHSA-p6mc-m468-83gw",
      aliases: ["CVE-2020-8203"],
      severity: "high",
      cvssScore: 7.4,
      fixedVersion: "4.17.19",
      cwe: "CWE-1321",
    });
  });

  it("uses the advisory cache", async () => {
    const fetchFn = (async (url: string) =>
      url.endsWith("/querybatch") ? Response.json({ results: [{ vulns: [{ id: LODASH_VULN.id }] }] }) : new Response("nope", { status: 500 })) as typeof fetch;
    const cache = { get: async () => LODASH_VULN, set: async () => {} };
    const results = await checkDependencies([dep], { fetchFn, cache });
    expect(results[0].advisoryId).toBe(LODASH_VULN.id);
  });
});
