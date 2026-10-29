import { createHmac, timingSafeEqual } from "node:crypto";
import type { Finding, Repo } from "@/generated/prisma/client";

/**
 * Tamper-evident signing of a findings report. A report carries an HMAC-SHA256
 * over a canonical representation of (repository, commit, findings). Anyone with
 * the same signing secret can confirm the report is genuine and unmodified — so
 * an admin can trust it was produced by this RepoGuard instance for a specific
 * commit, not fabricated. This never touches the scanned site; it only signs data.
 */

const VERSION = "rgsig-v1";

function signingKey(): string {
  const key = process.env.REPORT_SIGNING_SECRET || process.env.NEXTAUTH_SECRET;
  if (!key) throw new Error("Missing REPORT_SIGNING_SECRET or NEXTAUTH_SECRET");
  return `repoguard-report:${key}`;
}

/** Stable, order-independent digest input for a report. */
export function canonicalReport(repo: Pick<Repo, "fullName" | "lastCommitSha">, findings: Pick<Finding, "fingerprint" | "ruleId" | "severity" | "file" | "line">[]) {
  const items = findings
    .map((f) => `${f.fingerprint}|${f.ruleId}|${f.severity}|${f.file ?? ""}|${f.line ?? ""}`)
    .sort();
  return { repository: repo.fullName, commit: repo.lastCommitSha ?? null, findingCount: items.length, items };
}

export interface ReportSignature {
  version: string;
  algorithm: "HMAC-SHA256";
  signedAt: string;
  repository: string;
  commit: string | null;
  findingCount: number;
  value: string;
}

export function signReport(canonical: ReturnType<typeof canonicalReport>, signedAt = new Date().toISOString()): ReportSignature {
  const payload = JSON.stringify({ version: VERSION, signedAt, ...canonical });
  const value = createHmac("sha256", signingKey()).update(payload).digest("base64url");
  return {
    version: VERSION,
    algorithm: "HMAC-SHA256",
    signedAt,
    repository: canonical.repository,
    commit: canonical.commit,
    findingCount: canonical.findingCount,
    value,
  };
}

/** Recomputes the signature from the canonical data and compares it in constant time. */
export function verifyReport(canonical: ReturnType<typeof canonicalReport>, signature: ReportSignature): boolean {
  if (signature.version !== VERSION || signature.algorithm !== "HMAC-SHA256") return false;
  let expected: ReportSignature;
  try {
    expected = signReport(canonical, signature.signedAt);
  } catch {
    return false;
  }
  const a = Buffer.from(expected.value);
  const b = Buffer.from(signature.value);
  return a.length === b.length && timingSafeEqual(a, b);
}
