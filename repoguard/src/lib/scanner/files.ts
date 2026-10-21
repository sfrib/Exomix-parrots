import type { Language } from "./types";

/** Directories that hold third-party or generated code. */
export const DEFAULT_EXCLUDES = [
  "node_modules/",
  "vendor/",
  ".git/",
  ".next/",
  "dist/",
  "build/",
  "coverage/",
  "wp-admin/",
  "wp-includes/",
  "bower_components/",
];

export const MAX_FILE_BYTES = 512 * 1024;

const LOCKFILES = /(^|\/)(package-lock\.json|composer\.lock|yarn\.lock|pnpm-lock\.yaml)$/;

export function detectLanguage(path: string): Language | null {
  const lower = path.toLowerCase();
  const name = lower.split("/").pop() ?? "";
  if (LOCKFILES.test(lower) || /\.min\.(js|css)$/.test(lower) || /\.map$/.test(lower)) return null;
  if (/\.(php|phtml|inc|php[345789])$/.test(name)) return "php";
  if (/\.(js|jsx|mjs|cjs|ts|tsx|vue|svelte)$/.test(name)) return "js";
  if (/^\.env(\..+)?$/.test(name)) return "config";
  if (/\.(json|ya?ml|ini|conf|cfg|xml|properties|toml|sql|sh|bash|py|htaccess|npmrc)$/.test(name)) return "config";
  if (name === ".htaccess" || name === ".npmrc" || name === "dockerfile") return "config";
  return null;
}

/** Parses the per-repo exclude setting (one path prefix per line, "#" for comments). */
export function parseExcludes(setting: string): string[] {
  return setting
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.replace(/^\.?\//, ""));
}

export function isExcluded(path: string, extra: string[] = []): boolean {
  const normalized = path.replace(/^\.?\//, "");
  const segments = `/${normalized}`;
  return [...DEFAULT_EXCLUDES, ...extra].some((prefix) =>
    prefix.endsWith("/") ? segments.includes(`/${prefix}`) : normalized === prefix || normalized.startsWith(`${prefix}/`) || normalized.startsWith(prefix),
  );
}
