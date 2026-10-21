"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getRepoById, hasScanAccess } from "@/lib/github";
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
    if (r.dependencies !== undefined) {
      parts.push(
        `Závislosti: ${plural(r.dependencies, "balíček", "balíčky", "balíčků")}, ${plural(r.dependencyFindings ?? 0, "zranitelnost", "zranitelnosti", "zranitelností")}.`,
      );
    }
    revalidatePath(`/repos/${repoId}`);
    revalidatePath("/dashboard");
    return { ok: true, message: `Sken dokončen. ${parts.join(" ")}` };
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
