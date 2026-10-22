#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { isLocale, type Locale } from "../../src/lib/i18n/locale";
import { SEVERITIES, isSeverity, type Severity } from "../../src/lib/severity";
import { scanFolder, hasFindingAtOrAbove } from "./scan";
import { renderTable, renderJson, renderSarif, renderMarkdown } from "./report";

/**
 * `repoguard scan <path>` — a login-free, server-free local scan that reuses
 * the webapp's rule engine, dependency checks, posture checks and scoring.
 * Output: terminal table, JSON, SARIF (for GitHub code scanning) or Markdown.
 */

type Format = "table" | "json" | "sarif" | "markdown";
const FORMATS: Format[] = ["table", "json", "sarif", "markdown"];

function version(): string {
  let dir = __dirname;
  for (let i = 0; i < 8; i++) {
    try {
      const pkg = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8"));
      if (pkg.name === "repoguard") return pkg.version ?? "0.0.0";
    } catch {
      /* keep climbing */
    }
    dir = path.dirname(dir);
  }
  return "0.0.0";
}

const HELP = `RepoGuard — defensive security scanner (CLI)

Usage:
  repoguard scan [path] [options]

Options:
  -f, --format <fmt>    Output: table | json | sarif | markdown   (default: table)
  -o, --output <file>   Write to a file instead of stdout
      --offline         Skip the OSV.dev dependency lookup (no network)
      --lang <en|cs>    Report language                            (default: en)
  -e, --exclude <path>  Exclude a path prefix (repeatable)
      --path-prefix <p> Prefix reported paths with <p> (for repo-root-relative SARIF when scanning a subfolder)
      --fail-on <sev>   Exit 1 if any finding is at/above: critical|high|medium|low|none (default: none)
  -h, --help            Show this help
  -v, --version         Show version

Examples:
  repoguard scan .
  repoguard scan ./site --format sarif --output repoguard.sarif
  repoguard scan . --offline --fail-on high

Use only on systems you own or are authorized to test. Provided "as is", with
no warranty and no liability — you run it at your own risk. See DISCLAIMER.md.
`;

interface Args {
  path: string;
  format: Format;
  output?: string;
  offline: boolean;
  lang: Locale;
  excludes: string[];
  pathPrefix?: string;
  failOn: Severity | "none";
}

function parseArgs(argv: string[]): Args {
  const args: Args = { path: ".", format: "table", offline: false, lang: "en", excludes: [], failOn: "none" };
  const rest = [...argv];
  if (rest[0] === "scan") rest.shift();
  let sawPath = false;
  const need = (flag: string, val: string | undefined): string => {
    if (val === undefined) fail(`Option ${flag} needs a value.`);
    return val;
  };
  while (rest.length) {
    const a = rest.shift()!;
    switch (a) {
      case "-f":
      case "--format": {
        const v = need(a, rest.shift()) as Format;
        if (!FORMATS.includes(v)) fail(`Unknown format "${v}". Use: ${FORMATS.join(", ")}.`);
        args.format = v;
        break;
      }
      case "-o":
      case "--output":
        args.output = need(a, rest.shift());
        break;
      case "--offline":
        args.offline = true;
        break;
      case "--lang": {
        const v = need(a, rest.shift());
        if (!isLocale(v)) fail(`Unknown language "${v}". Use: en, cs.`);
        args.lang = v;
        break;
      }
      case "-e":
      case "--exclude":
        args.excludes.push(need(a, rest.shift()));
        break;
      case "--path-prefix":
        args.pathPrefix = need(a, rest.shift());
        break;
      case "--fail-on": {
        const v = need(a, rest.shift());
        if (v !== "none" && !isSeverity(v)) fail(`Unknown severity "${v}". Use: ${SEVERITIES.join(", ")}, none.`);
        args.failOn = v as Severity | "none";
        break;
      }
      default:
        if (a.startsWith("-")) fail(`Unknown option "${a}". Try --help.`);
        if (sawPath) fail(`Unexpected argument "${a}".`);
        args.path = a;
        sawPath = true;
    }
  }
  return args;
}

function fail(message: string): never {
  process.stderr.write(`repoguard: ${message}\n`);
  process.exit(2);
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("-h") || argv.includes("--help") || argv.length === 0) {
    process.stdout.write(HELP);
    process.exit(0);
  }
  if (argv.includes("-v") || argv.includes("--version")) {
    process.stdout.write(`${version()}\n`);
    process.exit(0);
  }

  const args = parseArgs(argv);
  const root = path.resolve(args.path);

  const result = await scanFolder(root, { locale: args.lang, offline: args.offline, excludes: args.excludes, pathPrefix: args.pathPrefix });

  let rendered: string;
  switch (args.format) {
    case "json":
      rendered = renderJson(result);
      break;
    case "sarif":
      rendered = renderSarif(result, version());
      break;
    case "markdown":
      rendered = renderMarkdown(result, args.lang);
      break;
    default:
      rendered = renderTable(result, args.lang);
  }

  if (args.output) {
    await writeFile(args.output, rendered.endsWith("\n") ? rendered : `${rendered}\n`, "utf8");
    if (args.format === "table") process.stdout.write(renderTable(result, args.lang) + "\n");
    process.stderr.write(`repoguard: wrote ${args.format} report to ${args.output}\n`);
  } else {
    process.stdout.write(rendered + "\n");
  }

  if (args.failOn !== "none" && hasFindingAtOrAbove(result.findings, args.failOn)) {
    process.stderr.write(`repoguard: findings at or above "${args.failOn}" severity — failing.\n`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  process.stderr.write(`repoguard: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(2);
});
