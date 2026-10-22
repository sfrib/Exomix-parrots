import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { MAX_FILE_BYTES, detectLanguage, isExcluded, isPostureFile } from "../../src/lib/scanner/files";
import { isComponentFile } from "../../src/lib/scanner/rules/components";
import { isManifest } from "../../src/lib/deps/parsers";
import type { SourceFile } from "../../src/lib/scanner/types";

/**
 * Walks a local folder and collects everything the scanner needs, using the
 * exact same language detection, exclude list and size cap as the webapp. The
 * CLI never talks to GitHub: the folder on disk is the source of truth.
 */

export interface WalkResult {
  /** Code / config / agent / workflow files, ready for the rule engine. */
  sources: SourceFile[];
  /** Dependency manifests and lockfiles (composer/npm/yarn/pip). */
  manifests: { path: string; content: string }[];
  /** Non-code files kept for repository-posture checks (.gitignore, SECURITY.md…). */
  posture: { path: string; content: string }[];
  /** Component files (WP core version.php, plugin/theme readme/style) for outdated-component checks. */
  components: { path: string; content: string }[];
  /** Every non-excluded file path in the tree, for path-based exposed-file checks. */
  allPaths: string[];
  /** Files skipped because they exceeded the size cap. */
  skippedLarge: string[];
  filesRead: number;
}

/** Directory names never worth descending into, on top of the shared exclude prefixes. */
const SKIP_DIRS = new Set([".git", "node_modules", "vendor", ".next", "dist", "build", "coverage", "bower_components"]);

async function listFiles(root: string, extraExcludes: string[]): Promise<string[]> {
  const out: string[] = [];
  const walk = async (dir: string) => {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      const rel = path.relative(root, abs).split(path.sep).join("/");
      if (entry.isSymbolicLink()) continue; // never follow links out of the tree
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name) || isExcluded(`${rel}/`, extraExcludes)) continue;
        await walk(abs);
      } else if (entry.isFile()) {
        if (!isExcluded(rel, extraExcludes)) out.push(rel);
      }
    }
  };
  await walk(root);
  return out.sort();
}

export async function walkFolder(root: string, extraExcludes: string[] = []): Promise<WalkResult> {
  const result: WalkResult = { sources: [], manifests: [], posture: [], components: [], allPaths: [], skippedLarge: [], filesRead: 0 };
  result.allPaths = await listFiles(root, extraExcludes);

  for (const rel of result.allPaths) {
    const abs = path.join(root, rel);
    const lang = detectLanguage(rel);
    const manifest = isManifest(rel);
    const posture = isPostureFile(rel);
    const component = isComponentFile(rel);
    if (!lang && !manifest && !posture && !component) continue;

    let size: number;
    try {
      size = (await stat(abs)).size;
    } catch {
      continue;
    }
    if (size > MAX_FILE_BYTES) {
      result.skippedLarge.push(rel);
      continue;
    }

    let content: string;
    try {
      content = await readFile(abs, "utf8");
    } catch {
      continue;
    }
    result.filesRead++;
    if (lang) result.sources.push({ path: rel, content, language: lang });
    if (manifest) result.manifests.push({ path: rel, content });
    if (posture) result.posture.push({ path: rel, content });
    if (component) result.components.push({ path: rel, content });
  }
  return result;
}
