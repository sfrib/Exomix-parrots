import { stripComments } from "./comments";
import type { CodeFinding, FileContext, FileRule, Rule, RuleMatch, SourceFile } from "./types";
import { ALL_RULES } from "./rules";
import { SECRET_RULE_PREFIX } from "./rules/secrets";
import { SEVERITY_RANK } from "../severity";

const SUPPRESS = /repoguard-ignore/;
const MAX_SNIPPET = 200;

export function isFileRule(rule: Rule): rule is FileRule {
  return "check" in rule;
}

export function buildContext(file: SourceFile): FileContext {
  const code = stripComments(file.content, file.language);
  return { file, lines: file.content.split("\n"), codeLines: code.split("\n"), code };
}

/** Masks a secret so the report never contains the full value. */
export function maskSecret(text: string, secret: string): string {
  if (!secret) return text;
  const visible = secret.length > 8 ? secret.slice(0, 4) : "";
  return text.split(secret).join(`${visible}${"*".repeat(8)}`);
}

function snippetFor(ctx: FileContext, match: RuleMatch): string {
  let text = (ctx.lines[match.line - 1] ?? "").trim();
  if (match.secret) text = maskSecret(text, match.secret);
  return text.length > MAX_SNIPPET ? `${text.slice(0, MAX_SNIPPET)}…` : text;
}

function isSuppressed(ctx: FileContext, line: number): boolean {
  return SUPPRESS.test(ctx.lines[line - 1] ?? "") || SUPPRESS.test(ctx.lines[line - 2] ?? "");
}

function runLineRule(rule: Exclude<Rule, FileRule>, ctx: FileContext): RuleMatch[] {
  const source = rule.includeComments ? ctx.lines : ctx.codeLines;
  const matches: RuleMatch[] = [];
  source.forEach((line, idx) => {
    const m = line.match(rule.pattern);
    if (!m) return;
    if (rule.exclude?.test(line)) return;
    const refined = rule.refine ? rule.refine(line, m) : {};
    if (refined === null) return;
    matches.push({ line: idx + 1, ...refined });
  });
  return matches;
}

export function scanFile(file: SourceFile, rules: Rule[] = ALL_RULES): CodeFinding[] {
  const ctx = buildContext(file);
  const findings: CodeFinding[] = [];
  const seen = new Set<string>();

  for (const rule of rules) {
    if (rule.languages !== "all" && !rule.languages.includes(file.language)) continue;
    const matches = isFileRule(rule) ? rule.check(ctx) : runLineRule(rule, ctx);
    for (const match of matches) {
      const key = `${rule.id}:${match.line}`;
      if (seen.has(key) || isSuppressed(ctx, match.line)) continue;
      seen.add(key);
      findings.push({
        ruleId: rule.id,
        title: rule.title,
        severity: match.severity ?? rule.severity,
        cwe: rule.cwe,
        file: file.path,
        line: match.line,
        snippet: snippetFor(ctx, match),
        explanation: rule.explanation,
        fix: rule.fix,
      });
    }
  }
  return dedupeSecrets(findings);
}

/** Several secret rules can hit the same line; keep only the most severe one. */
function dedupeSecrets(findings: CodeFinding[]): CodeFinding[] {
  const best = new Map<number, CodeFinding>();
  for (const f of findings) {
    if (!f.ruleId.startsWith(SECRET_RULE_PREFIX)) continue;
    const current = best.get(f.line);
    if (!current || SEVERITY_RANK[f.severity] < SEVERITY_RANK[current.severity]) best.set(f.line, f);
  }
  return findings.filter((f) => !f.ruleId.startsWith(SECRET_RULE_PREFIX) || best.get(f.line) === f);
}

export function scanFiles(files: SourceFile[], rules: Rule[] = ALL_RULES): CodeFinding[] {
  return files.flatMap((f) => scanFile(f, rules));
}
