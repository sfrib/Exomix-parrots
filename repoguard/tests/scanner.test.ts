import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { scanFile, maskSecret } from "@/lib/scanner/engine";
import { detectLanguage, isExcluded, parseExcludes } from "@/lib/scanner/files";
import { stripComments } from "@/lib/scanner/comments";
import type { SourceFile } from "@/lib/scanner/types";

function fixture(name: string): SourceFile {
  const content = readFileSync(path.join(__dirname, "fixtures", name), "utf8");
  return { path: name, content, language: detectLanguage(name)! };
}

function ruleIds(file: SourceFile) {
  return scanFile(file).map((f) => `${f.ruleId}@${f.line}`);
}

describe("PHP rules", () => {
  const findings = scanFile(fixture("vulnerable-plugin.php"));
  const byRule = (id: string) => findings.filter((f) => f.ruleId === id);

  it("flags SQL injection, critical when user input reaches the query", () => {
    const sqli = byRule("php.sqli");
    expect(sqli.map((f) => [f.line, f.severity])).toEqual([
      [7, "critical"],
      [21, "high"],
    ]);
    expect(sqli[0].cwe).toBe("CWE-89");
  });

  it("flags missing capability and nonce checks on AJAX handlers", () => {
    expect(byRule("php.authz.ajax-capability").map((f) => [f.line, f.severity])).toEqual([[3, "high"]]);
    expect(byRule("php.authz.ajax-nonce").map((f) => f.line)).toEqual([3]);
    expect(byRule("php.authz.nopriv-state-change").map((f) => f.line)).toEqual([11]);
  });

  it("flags REST route without permission_callback", () => {
    expect(byRule("php.authz.rest-permission").map((f) => f.line)).toEqual([38]);
  });

  it("flags unescaped output but not escaped output", () => {
    expect(byRule("php.xss.echo-input").map((f) => f.line)).toEqual([24]);
  });

  it("flags unsanitised input", () => {
    expect(byRule("php.input.unsanitized").map((f) => f.line)).toEqual([6]);
  });

  it("flags insecure uploads", () => {
    expect(byRule("php.upload.no-validation").map((f) => f.line)).toEqual([28]);
    expect(byRule("php.upload.client-filename").map((f) => f.line)).toEqual([28]);
  });

  it("flags dangerous functions and ignores commented-out code", () => {
    expect(byRule("php.dangerous.eval").map((f) => f.line)).toEqual([31]);
    expect(byRule("php.dangerous.exec").map((f) => [f.line, f.severity])).toEqual([[32, "critical"]]);
    expect(byRule("php.dangerous.unserialize").map((f) => [f.line, f.severity])).toEqual([[33, "critical"]]);
    expect(byRule("php.dangerous.include-input").map((f) => f.line)).toEqual([34]);
    expect(byRule("php.crypto.weak-password-hash").map((f) => f.line)).toEqual([35]);
    expect(byRule("php.tls.verify-disabled").map((f) => f.line)).toEqual([36]);
  });

  it("every finding has Czech explanation and fix", () => {
    for (const f of findings) {
      expect(f.explanation.length).toBeGreaterThan(20);
      expect(f.fix.length).toBeGreaterThan(20);
    }
  });

  it("reports nothing on the safe equivalent", () => {
    expect(ruleIds(fixture("safe-plugin.php"))).toEqual([]);
  });
});

describe("JS/TS rules", () => {
  it("flags common Node/browser weaknesses", () => {
    const ids = ruleIds(fixture("vulnerable.ts"));
    expect(ids).toEqual(
      expect.arrayContaining([
        "js.sqli@5",
        "js.dangerous.exec@6",
        "js.xss.html-sink@7",
        "js.xss.reflected@8",
        "js.open-redirect@9",
        "js.crypto.weak-random@10",
        "js.dangerous.eval@11",
      ]),
    );
    const sqli = scanFile(fixture("vulnerable.ts")).find((f) => f.ruleId === "js.sqli")!;
    expect(sqli.severity).toBe("critical");
  });

  it("reports nothing on the safe equivalent", () => {
    expect(ruleIds(fixture("safe.ts"))).toEqual([]);
  });
});

describe("secret rules", () => {
  // Built at runtime so the repository itself never contains token-shaped strings.
  const ghToken = "ghp_" + "A1b2C3d4E5".repeat(4);
  const stripeKey = "sk_" + "live_" + "Z9y8X7w6V5".repeat(3);

  it("detects provider tokens and masks them in the snippet", () => {
    const file: SourceFile = {
      path: "config.js",
      language: "js",
      content: `const gh = "${ghToken}";\nconst stripe = '${stripeKey}';\n`,
    };
    const findings = scanFile(file);
    expect(findings.map((f) => f.ruleId)).toEqual(["secret.github", "secret.stripe"]);
    expect(findings[0].severity).toBe("critical");
    for (const f of findings) {
      expect(f.snippet).not.toContain(ghToken);
      expect(f.snippet).not.toContain(stripeKey);
      expect(f.snippet).toContain("********");
    }
  });

  it("detects wp-config credentials but not placeholders or env lookups", () => {
    const file: SourceFile = {
      path: "wp-config.php",
      language: "php",
      content: [
        "<?php",
        "define( 'DB_PASSWORD', 'Papousek2024!' );",
        "define( 'AUTH_KEY', 'put your unique phrase here' );",
        "define( 'DB_PASSWORD', 'password_here' );",
        "$api_key = getenv( 'API_KEY' );",
        "$smtp_password = 'Kakadu-Ara-77';",
      ].join("\n"),
    };
    const findings = scanFile(file);
    expect(findings.map((f) => `${f.ruleId}@${f.line}`)).toEqual(["secret.wp-db-password@2", "secret.generic@6", "web.wpconfig-file-edit@1"]);
    expect(findings[0].snippet).not.toContain("Papousek2024!");
  });

  it("flags committed .env files but not .env.example", () => {
    const env = { path: ".env", language: "config" as const, content: "DB_HOST=localhost\nDB_PASS=reallysecret123\n" };
    expect(scanFile(env).some((f) => f.ruleId === "secret.env-file")).toBe(true);
    expect(scanFile({ ...env, path: ".env.example" }).some((f) => f.ruleId === "secret.env-file")).toBe(false);
  });

  it("flags preg_replace with the /e modifier but not without it", () => {
    const file: SourceFile = {
      path: "a.php",
      language: "php",
      content: "<?php\n$a = preg_replace( '/(.*)/e', 'strtoupper(\"$1\")', $s );\n$b = preg_replace( '/x/i', 'y', $s );\n",
    };
    expect(scanFile(file).map((f) => `${f.ruleId}@${f.line}`)).toEqual(["php.dangerous.eval@2"]);
  });

  it("respects repoguard-ignore", () => {
    const file: SourceFile = { path: "a.php", language: "php", content: "<?php\n// repoguard-ignore\neval( $x );\n" };
    expect(scanFile(file)).toEqual([]);
  });
});

describe("helpers", () => {
  it("strips comments but keeps strings and line positions", () => {
    const src = "$a = 'http://x'; // eval(1)\n/* eval(2)\n */ $b = \"#notcomment\"; # eval(3)";
    const out = stripComments(src, "php");
    expect(out.split("\n")).toHaveLength(3);
    expect(out).not.toContain("eval");
    expect(out).toContain("'http://x'");
    expect(out).toContain('"#notcomment"');
  });

  it("detects language and exclusions", () => {
    expect(detectLanguage("wp-content/plugins/x/x.php")).toBe("php");
    expect(detectLanguage("src/app.tsx")).toBe("js");
    expect(detectLanguage("assets/app.min.js")).toBeNull();
    expect(detectLanguage("package-lock.json")).toBeNull();
    expect(isExcluded("vendor/autoload.php")).toBe(true);
    expect(isExcluded("wp/wp-includes/load.php")).toBe(true);
    expect(isExcluded("wp-content/plugins/akismet/a.php", parseExcludes("# third party\nwp-content/plugins/akismet"))).toBe(true);
    expect(isExcluded("wp-content/plugins/registr/a.php", parseExcludes("wp-content/plugins/akismet"))).toBe(false);
  });

  it("masks secrets", () => {
    expect(maskSecret("key = 'abcdefghijkl'", "abcdefghijkl")).toBe("key = 'abcd********'");
  });
});
