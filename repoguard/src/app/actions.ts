"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getFileContent, getRepoById, hasScanAccess } from "@/lib/github";
import { AiReviewError, aiReviewEnabled, reviewFinding } from "@/lib/ai-review";
import { createThreatModel, executeThreatModel } from "@/lib/threat-run";
import { requireUser, tokenFor } from "@/lib/session";
import { runScan, type ScanKind } from "@/lib/scan";
import { plural } from "@/lib/format";

export type ActionState = { ok: boolean; message: string } | null;

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Neočekávaná chyba.";
}

export async function connectRepo(githubId: number, _prev: ActionState): Promise<ActionState> {
  const user = await requireUser();
  if (!Number.isSafeInteger(githubId) || githubId <= 0) return { ok: false, message: "Neplatný repozitář." };
  try {
    const remote = await getRepoById(tokenFor(user), githubId);
    if (!hasScanAccess(remote, user.login)) {
      return { ok: false, message: "Tento repozitář vám nepatří ani k němu nemáte udělený přístup." };
    }
    await db.repo.upsert({
      where: { userId_githubId: { userId: user.id, githubId: remote.id } },
      create: {
        userId: user.id,
        githubId: remote.id,
        fullName: remote.full_name,
        defaultBranch: remote.default_branch,
        isPrivate: remote.private,
        htmlUrl: remote.html_url,
      },
      update: { fullName: remote.full_name, defaultBranch: remote.default_branch, isPrivate: remote.private },
    });
  } catch (err) {
    return { ok: false, message: errorMessage(err) };
  }
  revalidatePath("/dashboard");
  revalidatePath("/repos/add");
  return { ok: true, message: "Repozitář byl připojen." };
}

export async function disconnectRepo(repoId: string): Promise<void> {
  const user = await requireUser();
  await db.repo.deleteMany({ where: { id: repoId, userId: user.id } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

const SCAN_KINDS: ScanKind[] = ["code", "deps", "all"];

export async function scanRepo(repoId: string, kind: ScanKind, _prev: ActionState): Promise<ActionState> {
  const user = await requireUser();
  // Bound action arguments come from the client, so validate them.
  if (!SCAN_KINDS.includes(kind)) return { ok: false, message: "Neplatný typ skenu." };
  try {
    const r = await runScan(repoId, user.id, kind);
    const parts: string[] = [];
    if (r.filesScanned !== undefined) {
      parts.push(`Kód: ${plural(r.filesScanned, "soubor", "soubory", "souborů")}, ${plural(r.codeFindings ?? 0, "nález", "nálezy", "nálezů")}.`);
    }
    if (r.repoFindings !== undefined) parts.push(`Nastavení repozitáře: ${plural(r.repoFindings, "doporučení", "doporučení", "doporučení")}.`);
    if (r.dependencies !== undefined) {
      parts.push(
        `Závislosti: ${plural(r.dependencies, "balíček", "balíčky", "balíčků")}, ${plural(r.dependencyFindings ?? 0, "zranitelnost", "zranitelnosti", "zranitelností")}.`,
      );
    }
    revalidatePath(`/repos/${repoId}`);
    revalidatePath("/dashboard");
    const diff = r.newCount || r.resolvedCount ? ` Nové: ${r.newCount ?? 0}, vyřešené: ${r.resolvedCount ?? 0}.` : "";
    return { ok: true, message: `Sken dokončen. ${parts.join(" ")}${diff}` };
  } catch (err) {
    revalidatePath(`/repos/${repoId}`);
    return { ok: false, message: `Sken selhal: ${errorMessage(err)}` };
  }
}

export async function saveExcludes(repoId: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const value = String(formData.get("excludePaths") ?? "").replace(/\r/g, "");
  if (value.length > 4000) return { ok: false, message: "Seznam je příliš dlouhý (max. 4000 znaků)." };
  const updated = await db.repo.updateMany({ where: { id: repoId, userId: user.id }, data: { excludePaths: value } });
  if (updated.count === 0) return { ok: false, message: "Repozitář nebyl nalezen." };
  revalidatePath(`/repos/${repoId}`);
  return { ok: true, message: "Nastavení uloženo. Projeví se při příštím skenu." };
}

const SUPPRESSION_STATUSES = ["false_positive", "accepted_risk"];

export async function suppressFinding(repoId: string, fingerprint: string, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  if (!SUPPRESSION_STATUSES.includes(status)) return { ok: false, message: "Vyberte důvod." };
  const finding = await db.finding.findFirst({ where: { repoId, fingerprint, repo: { userId: user.id } } });
  if (!finding) return { ok: false, message: "Nález nebyl nalezen." };
  await db.suppression.upsert({
    where: { repoId_fingerprint: { repoId, fingerprint } },
    create: { repoId, fingerprint, status, note },
    update: { status, note },
  });
  revalidatePath(`/repos/${repoId}`);
  revalidatePath("/dashboard");
  return { ok: true, message: "Nález byl označen a nezapočítává se do skóre." };
}

export async function restoreFinding(repoId: string, fingerprint: string): Promise<void> {
  const user = await requireUser();
  await db.suppression.deleteMany({ where: { repoId, fingerprint, repo: { userId: user.id } } });
  revalidatePath(`/repos/${repoId}`);
  revalidatePath("/dashboard");
}

export async function aiReviewFinding(findingId: string, _prev: ActionState): Promise<ActionState> {
  const user = await requireUser();
  if (!aiReviewEnabled()) return { ok: false, message: "AI posouzení není zapnuté (AI_REVIEW_ENABLED)." };
  const finding = await db.finding.findFirst({ where: { id: findingId, repo: { userId: user.id } }, include: { repo: true } });
  if (!finding) return { ok: false, message: "Nález nebyl nalezen." };

  try {
    let content: string | null = null;
    if (finding.kind === "code" && finding.file && finding.repo.lastCommitSha) {
      const token = tokenFor(user);
      // Re-check access before reading the file, as for scans.
      const remote = await getRepoById(token, finding.repo.githubId);
      if (!hasScanAccess(remote, user.login)) return { ok: false, message: "K repozitáři už nemáte přístup." };
      content = await getFileContent(token, remote.full_name, finding.file, finding.repo.lastCommitSha);
    }
    const review = await reviewFinding(finding, content);
    await db.finding.update({ where: { id: finding.id }, data: { aiReview: JSON.stringify(review), aiReviewedAt: new Date() } });
  } catch (err) {
    return { ok: false, message: err instanceof AiReviewError ? err.message : errorMessage(err) };
  }
  revalidatePath(`/repos/${finding.repoId}`);
  return { ok: true, message: "AI posouzení je hotové." };
}

export async function startThreatModel(repoId: string, _prev: ActionState): Promise<ActionState> {
  const user = await requireUser();
  if (!aiReviewEnabled()) return { ok: false, message: "AI funkce nejsou zapnuté (AI_REVIEW_ENABLED)." };
  try {
    const tm = await createThreatModel(repoId, user.id);
    // Runs after the response is sent; the page polls until it finishes.
    after(() => executeThreatModel(tm.id));
  } catch (err) {
    return { ok: false, message: errorMessage(err) };
  }
  revalidatePath(`/repos/${repoId}`);
  return { ok: true, message: "Analýza byla spuštěna. Obvykle trvá několik minut." };
}
