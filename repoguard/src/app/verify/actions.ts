"use server";

import { canonicalReport, verifyReport, type ReportSignature } from "@/lib/sign";

export type VerifyResult =
  | { ok: true; repository: string; commit: string | null; findingCount: number; signedAt: string }
  | { ok: false; message: string };

/** Public: validates a pasted RepoGuard JSON report against its embedded signature. */
export async function verifyPastedReport(_prev: VerifyResult | null, formData: FormData): Promise<VerifyResult> {
  const raw = String(formData.get("report") ?? "").trim();
  if (!raw) return { ok: false, message: "Vložte obsah reportu." };
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, message: "Vložený text není platný JSON report." };
  }
  const signature = data.signature as ReportSignature | null;
  if (!signature?.value) return { ok: false, message: "Report neobsahuje podpis (byl vytvořen bez REPORT_SIGNING_SECRET)." };
  if (typeof data.repository !== "string" || !Array.isArray(data.findings)) {
    return { ok: false, message: "Report nemá očekávanou strukturu." };
  }
  const canonical = canonicalReport(
    { fullName: data.repository, lastCommitSha: data.commit ?? null },
    data.findings.map((f: any) => ({ fingerprint: f.id, ruleId: f.ruleId, severity: f.severity, file: f.file ?? null, line: f.line ?? null })),
  );
  if (!verifyReport(canonical, signature)) {
    return { ok: false, message: "Podpis NESOUHLASÍ. Report byl změněn, nebo pochází z jiné instance RepoGuardu." };
  }
  return { ok: true, repository: data.repository, commit: data.commit ?? null, findingCount: canonical.findingCount, signedAt: signature.signedAt };
}
