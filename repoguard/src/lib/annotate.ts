import type { Finding } from "@/generated/prisma/client";
import { blobUrl } from "./format";

/**
 * Generates a unified diff that inserts a visible "RepoGuard" warning comment
 * above each flagged line. The user reviews it and opens a pull request — a
 * legitimate way to put a warning into the code that a site admin sees and
 * approves. It never modifies a live site; it only produces a patch to review.
 */

interface FileContent {
  path: string;
  content: string;
}

function commentPrefix(path: string): { open: string; close: string } | null {
  const name = path.toLowerCase();
  if (/\.(php|phtml|inc|js|jsx|mjs|cjs|ts|tsx|vue|svelte)$/.test(name)) return { open: "// ", close: "" };
  if (/\.(css|scss)$/.test(name)) return { open: "/* ", close: " */" };
  if (/\.(ya?ml|sh|bash|conf|cfg|ini|toml|properties|env.*)$/.test(name) || /(^|\/)(\.htaccess|\.env.*|dockerfile)$/.test(name)) return { open: "# ", close: "" };
  if (/\.(html?|xml|svg)$/.test(name)) return { open: "<!-- ", close: " -->" };
  return null; // unknown syntax: do not annotate to avoid breaking the file
}

function marker(f: Finding, htmlUrl: string, commitSha: string | null, c: { open: string; close: string }): string {
  const cwe = f.cwe ? ` ${f.cwe}` : "";
  const link = f.file ? blobUrl(htmlUrl, commitSha, f.file, f.line) : "";
  const text = `RepoGuard [${f.severity}] ${f.ruleId}${cwe} — ${f.title}. Verify: ${link}`.replace(/\s+/g, " ").trim();
  return `${c.open}${text}${c.close}`;
}

/** Builds the patch. Only findings with a real file+line in files we know how to comment are annotated. */
export function buildAnnotationPatch(files: FileContent[], findings: Finding[], htmlUrl: string, commitSha: string | null): string {
  const byPath = new Map<string, FileContent>();
  for (const f of files) byPath.set(f.path, f);

  const perFile = new Map<string, Finding[]>();
  for (const f of findings) {
    if (!f.file || !f.line || !byPath.has(f.file)) continue;
    if (!commentPrefix(f.file)) continue;
    (perFile.get(f.file) ?? perFile.set(f.file, []).get(f.file)!).push(f);
  }

  const chunks: string[] = [];
  for (const [path, fileFindings] of [...perFile.entries()].sort()) {
    const c = commentPrefix(path)!;
    const content = byPath.get(path)!.content;
    const rawLines = content.split("\n");
    // A trailing "\n" produces a final empty element; track it instead of emitting a blank line.
    const trailingNewline = rawLines.length > 0 && rawLines[rawLines.length - 1] === "";
    const lines = trailingNewline ? rawLines.slice(0, -1) : rawLines;
    if (lines.length === 0) continue;

    // Keep one finding per line; indent the comment like the flagged line.
    const byLine = new Map<number, Finding>();
    for (const f of fileFindings) if (f.line && f.line <= lines.length && !byLine.has(f.line)) byLine.set(f.line, f);
    if (byLine.size === 0) continue;

    // Whole-file single hunk with only insertions: always applies cleanly.
    const hunk: string[] = [];
    lines.forEach((line, idx) => {
      const f = byLine.get(idx + 1);
      if (f) {
        const indent = line.match(/^\s*/)?.[0] ?? "";
        hunk.push(`+${indent}${marker(f, htmlUrl, commitSha, c)}`);
      }
      hunk.push(` ${line}`);
    });
    if (!trailingNewline) hunk.push("\\ No newline at end of file");
    const oldCount = lines.length;
    const newCount = oldCount + byLine.size;
    chunks.push(
      `diff --git a/${path} b/${path}`,
      `--- a/${path}`,
      `+++ b/${path}`,
      `@@ -1,${oldCount} +1,${newCount} @@`,
      ...hunk,
    );
  }
  if (chunks.length === 0) return "";
  return chunks.join("\n") + "\n";
}

export function annotatablePaths(findings: Finding[]): string[] {
  const paths = new Set<string>();
  for (const f of findings) if (f.file && f.line && commentPrefix(f.file)) paths.add(f.file);
  return [...paths];
}
