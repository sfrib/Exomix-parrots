import type { Severity } from "../severity";

/**
 * agentjson: AI agent configs (.claude/settings.json, .mcp.json, .vscode/tasks.json…)
 * agentmd: agent instruction files (CLAUDE.md, AGENTS.md, .claude/agents/*.md, .cursorrules…)
 * workflow: GitHub Actions workflows
 */
export type Language = "php" | "js" | "config" | "agentjson" | "agentmd" | "workflow";

export interface SourceFile {
  path: string;
  content: string;
  language: Language;
}

/** Prepared view of a file passed to rules. */
export interface FileContext {
  file: SourceFile;
  /** Raw lines (1-based index = array index + 1). */
  lines: string[];
  /** Lines with comments blanked out, same length/positions as `lines`. */
  codeLines: string[];
  /** Whole file with comments blanked out. */
  code: string;
}

export interface RuleMatch {
  line: number;
  /** Override the rule's default severity for this match (e.g. user input reaching a sink). */
  severity?: Severity;
  /** Text to mask in the snippet (secrets). */
  secret?: string;
}

interface RuleBase {
  id: string;
  /** Short Czech title. */
  title: string;
  cwe?: string;
  severity: Severity;
  languages: Language[] | "all";
  /** Czech, plain-language explanation of the risk. */
  explanation: string;
  /** Czech, concrete suggested fix. */
  fix: string;
  /** Match against raw lines including comments (needed for secrets). Default false. */
  includeComments?: boolean;
}

/** Line rule: reports every line matching `pattern` and not matching `exclude`. */
export interface LineRule extends RuleBase {
  pattern: RegExp;
  exclude?: RegExp;
  /** Optional per-line refinement; return null to drop the match. */
  refine?: (line: string, match: RegExpMatchArray) => Omit<RuleMatch, "line"> | null;
}

/** File rule: arbitrary logic over the whole file. */
export interface FileRule extends RuleBase {
  check: (ctx: FileContext) => RuleMatch[];
}

export type Rule = LineRule | FileRule;

export interface CodeFinding {
  ruleId: string;
  title: string;
  severity: Severity;
  cwe?: string;
  file: string;
  line: number;
  snippet: string;
  explanation: string;
  fix: string;
}
