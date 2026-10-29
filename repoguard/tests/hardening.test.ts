import { describe, expect, it } from "vitest";
import { checkExposedFiles } from "@/lib/scanner/rules/hardening";
import { checkComponents } from "@/lib/scanner/rules/components";
import { scanFile } from "@/lib/scanner/engine";
import { detectLanguage } from "@/lib/scanner/files";
import { categoryOf } from "@/lib/score";
import type { SourceFile } from "@/lib/scanner/types";

describe("exposed files", () => {
  it("flags backups, dumps, admin tools and routes them to the web category", () => {
    const paths = [
      "wp-config.php.bak",
      "db/dump.sql",
      "backup-2026.zip",
      "wp-content/debug.log",
      "adminer.php",
      "info.php",
      ".htpasswd",
      ".git/config",
      "wp-content/uploads/.DS_Store",
      "src/app.php", // benign
      "readme.txt", // benign
    ].map((path) => ({ path }));
    const found = checkExposedFiles(paths);
    const byRule = Object.fromEntries(found.map((f) => [f.ruleId, f.severity]));
    expect(byRule["web.config-backup"]).toBe("critical");
    expect(byRule["web.db-dump"]).toBe("high");
    expect(byRule["web.backup-archive"]).toBe("medium");
    expect(byRule["web.debug-log"]).toBe("medium");
    expect(byRule["web.admin-tool"]).toBe("high");
    expect(byRule["web.phpinfo"]).toBe("medium");
    expect(byRule["web.htpasswd"]).toBe("medium");
    expect(byRule["web.git-exposed"]).toBe("high");
    expect(byRule["web.editor-metadata"]).toBe("low");
    expect(found.some((f) => f.file === "src/app.php")).toBe(false);
    // One finding per file: wp-config.php.bak matches config-backup, not also backup-archive.
    expect(found.filter((f) => f.file === "wp-config.php.bak")).toHaveLength(1);
    for (const f of found) expect(categoryOf({ kind: "code", ruleId: f.ruleId })).toBe("web");
  });
});

function file(path: string, body: string): SourceFile {
  return { path, content: body, language: detectLanguage(path) ?? "config" };
}

describe("htaccess and wp-config hardening", () => {
  it("flags directory listing and debug settings", () => {
    const ht = scanFile({ path: ".htaccess", content: "Options +Indexes\nphp_flag display_errors on\n", language: "config" });
    expect(ht.map((f) => f.ruleId).sort()).toEqual(["web.htaccess-dir-listing", "web.htaccess-display-errors"]);
    const wp = scanFile(file("wp-config.php", "<?php\ndefine( 'WP_DEBUG', true );\n"));
    const ids = wp.map((f) => f.ruleId);
    expect(ids).toContain("web.wpconfig-debug");
    expect(ids).toContain("web.wpconfig-file-edit");
  });

  it("does not flag a hardened wp-config", () => {
    const wp = scanFile(file("wp-config.php", "<?php\ndefine( 'WP_DEBUG', false );\ndefine( 'DISALLOW_FILE_EDIT', true );\n"));
    expect(wp.filter((f) => f.ruleId.startsWith("web.")).map((f) => f.ruleId)).toEqual([]);
  });
});

describe("outdated components", () => {
  it("detects WordPress core version and flags old releases", () => {
    const old = checkComponents([{ path: "wp-includes/version.php", content: "<?php\n$wp_version = '5.4.2';\n" }]);
    expect(old[0]).toMatchObject({ ruleId: "comp.wp-core", severity: "high", installedVersion: "5.4.2" });
    const recent = checkComponents([{ path: "wp-includes/version.php", content: "$wp_version = '6.6.1';" }]);
    expect(recent[0]).toMatchObject({ ruleId: "comp.wp-core", severity: "low" });
  });

  it("flags a plugin whose 'Tested up to' is old", () => {
    const found = checkComponents([
      { path: "wp-content/plugins/old-slider/old-slider.php", content: "<?php\n/*\nPlugin Name: Old Slider\nVersion: 1.2.0\n*/\n" },
      { path: "wp-content/plugins/old-slider/readme.txt", content: "=== Old Slider ===\nStable tag: 1.2.0\nTested up to: 4.9\n" },
    ]);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ ruleId: "comp.stale-plugin", severity: "medium" });
    expect(found[0].title).toContain("old-slider");
  });

  it("leaves a current plugin alone", () => {
    const found = checkComponents([
      { path: "wp-content/plugins/registr/registr.php", content: "<?php\n/*\nPlugin Name: Registr\nVersion: 3.0.0\n*/\n" },
      { path: "wp-content/plugins/registr/readme.txt", content: "Stable tag: 3.0.0\nTested up to: 6.6\n" },
    ]);
    expect(found).toEqual([]);
  });
});
