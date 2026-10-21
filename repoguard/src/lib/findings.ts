import { SEVERITIES, SEVERITY_RANK, isSeverity, repoStatus, type Severity } from "./severity";

export function countBySeverity(findings: { severity: string }[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) if (isSeverity(f.severity)) counts[f.severity]++;
  return counts;
}

export function groupBySeverity<T extends { severity: string }>(findings: T[]): { severity: Severity; items: T[] }[] {
  return SEVERITIES.map((severity) => ({ severity, items: findings.filter((f) => f.severity === severity) })).filter(
    (g) => g.items.length > 0,
  );
}

export function sortFindings<T extends { severity: string; file: string | null; line: number | null }>(findings: T[]): T[] {
  return [...findings].sort(
    (a, b) =>
      (SEVERITY_RANK[a.severity as Severity] ?? 9) - (SEVERITY_RANK[b.severity as Severity] ?? 9) ||
      (a.file ?? "").localeCompare(b.file ?? "") ||
      (a.line ?? 0) - (b.line ?? 0),
  );
}

export function statusFor(repo: { lastCodeScanAt: Date | null; lastDepScanAt: Date | null }, findings: { severity: string }[]) {
  return repoStatus(
    findings.map((f) => f.severity),
    Boolean(repo.lastCodeScanAt || repo.lastDepScanAt),
  );
}

/** A finding is "new" when it first appeared after the previous completed scan of the same kind. */
export function isNewFinding(firstSeenAt: Date, previousScanFinishedAt: Date | null): boolean {
  return previousScanFinishedAt !== null && firstSeenAt.getTime() > previousScanFinishedAt.getTime();
}
