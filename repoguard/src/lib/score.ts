import { isSeverity, type Severity } from "./severity";

/**
 * Security score per category: each category starts at 100 and loses points
 * per active (non-suppressed) finding; the overall score is the average of
 * the categories that were checked. Graded A–F like AgentShield.
 */

export const CATEGORIES = ["malware", "code", "secrets", "web", "agent", "deps", "repo"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL_CS: Record<Category, string> = {
  malware: "Detekce napadení",
  code: "Kód",
  web: "Zabezpečení webu",
  secrets: "Tajné klíče",
  agent: "AI agenti a CI",
  deps: "Závislosti",
  repo: "Nastavení repozitáře",
};

const DEDUCTION: Record<Severity, number> = { critical: 25, high: 15, medium: 5, low: 2 };

export type Grade = "A" | "B" | "C" | "D" | "F";

export function categoryOf(f: { kind: string; ruleId: string }): Category {
  if (f.kind === "dependency") return "deps";
  if (f.kind === "repo") return "repo";
  if (f.ruleId.startsWith("secret.")) return "secrets";
  if (f.ruleId.startsWith("agent.") || f.ruleId.startsWith("ci.")) return "agent";
  if (f.ruleId.startsWith("malware.")) return "malware";
  if (f.ruleId.startsWith("web.") || f.ruleId.startsWith("comp.")) return "web";
  return "code";
}

export function gradeFor(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

export interface ScoreResult {
  score: number;
  grade: Grade;
  categories: { category: Category; score: number; findings: number }[];
}

export function computeScore(
  findings: { kind: string; ruleId: string; severity: string }[],
  checked: { code: boolean; deps: boolean },
): ScoreResult | null {
  const active: Category[] = [
    ...(checked.code ? (["malware", "code", "secrets", "web", "agent", "repo"] as const) : []),
    ...(checked.deps ? (["deps"] as const) : []),
  ];
  if (active.length === 0) return null;
  const categories = active.map((category) => {
    const items = findings.filter((f) => categoryOf(f) === category);
    const lost = items.reduce((sum, f) => sum + (isSeverity(f.severity) ? DEDUCTION[f.severity] : 0), 0);
    return { category, score: Math.max(0, 100 - lost), findings: items.length };
  });
  const score = Math.round(categories.reduce((s, c) => s + c.score, 0) / categories.length);
  return { score, grade: gradeFor(score), categories };
}
