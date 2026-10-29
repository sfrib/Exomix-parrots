import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * `.repoguardignore` — a per-project baseline the CLI reads from the scan root.
 * gitignore-style, one entry per line, `#` for comments:
 *
 *   build/                 # exclude a path prefix from scanning entirely
 *   vendor
 *   rule:js.dangerous.eval           # drop this rule everywhere
 *   rule:secret.generic src/config   # drop this rule only under a path prefix
 *
 * Path excludes are merged with `--exclude`. Rule ignores drop matching
 * findings after detection, so new findings elsewhere still surface.
 */

export interface IgnoreRule {
  ruleId: string;
  /** When set, only findings whose path starts with this prefix are ignored. */
  pathPrefix?: string;
}

export interface RepoGuardConfig {
  excludes: string[];
  ignores: IgnoreRule[];
}

export const IGNORE_FILE = ".repoguardignore";

export function parseIgnoreFile(content: string): RepoGuardConfig {
  const excludes: string[] = [];
  const ignores: IgnoreRule[] = [];
  for (const raw of content.split("\n")) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    if (line.startsWith("rule:")) {
      const [ruleId, pathPrefix] = line.slice("rule:".length).trim().split(/\s+/, 2);
      if (ruleId) ignores.push({ ruleId, pathPrefix: pathPrefix?.replace(/^\.?\/|\/$/g, "") || undefined });
    } else {
      excludes.push(line.replace(/^\.?\/|\/$/g, ""));
    }
  }
  return { excludes, ignores };
}

/** Loads `.repoguardignore` from the scan root, if present. */
export async function loadConfig(root: string): Promise<RepoGuardConfig> {
  try {
    const content = await readFile(path.join(root, IGNORE_FILE), "utf8");
    return parseIgnoreFile(content);
  } catch {
    return { excludes: [], ignores: [] };
  }
}

/** True when a finding is baselined away by an ignore rule (matched on its pre-prefix path). */
export function isIgnored(ignores: IgnoreRule[], ruleId: string, file: string | null): boolean {
  // A pathPrefix matches the exact file or a directory prefix only — never an
  // unbounded substring, so "src/api" does not swallow "src/apiClient.ts".
  return ignores.some((ig) => ig.ruleId === ruleId && (!ig.pathPrefix || (file != null && (file === ig.pathPrefix || file.startsWith(`${ig.pathPrefix}/`)))));
}
