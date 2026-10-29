export const SEVERITIES = ["critical", "high", "medium", "low"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const SEVERITY_RANK: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };

export const SEVERITY_LABEL_CS: Record<Severity, string> = {
  critical: "Kritická",
  high: "Vysoká",
  medium: "Střední",
  low: "Nízká",
};

export type RepoStatus = "ok" | "warnings" | "critical" | "unscanned";

export const STATUS_LABEL_CS: Record<RepoStatus, string> = {
  ok: "OK",
  warnings: "Varování",
  critical: "Kritické",
  unscanned: "Neskenováno",
};

export function isSeverity(value: string): value is Severity {
  return (SEVERITIES as readonly string[]).includes(value);
}

/** Overall repo status: any critical/high finding is critical, anything else is a warning. */
export function repoStatus(severities: string[], scanned: boolean): RepoStatus {
  if (!scanned) return "unscanned";
  if (severities.some((s) => s === "critical" || s === "high")) return "critical";
  if (severities.length > 0) return "warnings";
  return "ok";
}

export function scoreToSeverity(score: number): Severity {
  if (score >= 9) return "critical";
  if (score >= 7) return "high";
  if (score >= 4) return "medium";
  return "low";
}
