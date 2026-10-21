import { db } from "./db";
import { tokenFor } from "./session";
import { getFileContent, getRepoById, hasScanAccess } from "./github";
import { partitionSuppressed } from "./findings";
import { AI_MODEL } from "./ai-review";
import { ThreatModelError, buildContext, buildFindingRefs, pickExcerptTargets, runPipeline } from "./threat-model";

const STALE_MS = 20 * 60 * 1000;

/** Creates a threat-model record for the user's repo; throws a readable error when it cannot start. */
export async function createThreatModel(repoId: string, userId: string) {
  const repo = await db.repo.findFirst({ where: { id: repoId, userId } });
  if (!repo) throw new ThreatModelError("Repozitář nebyl nalezen.");
  if (!repo.lastCodeScanAt) throw new ThreatModelError("Nejdřív spusťte sken kódu – analýza vychází z jeho nálezů.");
  const running = await db.threatModel.findFirst({
    where: { repoId, status: "running", createdAt: { gt: new Date(Date.now() - STALE_MS) } },
  });
  if (running) throw new ThreatModelError("Analýza už probíhá.");
  return db.threatModel.create({ data: { repoId, status: "running", model: AI_MODEL, commitSha: repo.lastCommitSha } });
}

/** Runs the pipeline for a created record and stores the result (never throws). */
export async function executeThreatModel(threatModelId: string, locale: "en" | "cs" = "en"): Promise<void> {
  const tm = await db.threatModel.findUnique({
    where: { id: threatModelId },
    include: { repo: { include: { user: true, findings: true, suppressions: true } } },
  });
  if (!tm) return;
  const { repo } = tm;
  try {
    const { active } = partitionSuppressed(repo.findings, repo.suppressions);
    if (active.length === 0) throw new ThreatModelError("Repozitář nemá žádné aktivní nálezy – není co analyzovat.");
    const refs = buildFindingRefs(active);

    // Excerpts are read with the owner's token after re-checking access, as for scans.
    const excerpts: { file: string; line: number | null; content: string }[] = [];
    const targets = pickExcerptTargets(active);
    if (targets.length > 0 && repo.lastCommitSha) {
      const token = tokenFor(repo.user);
      const remote = await getRepoById(token, repo.githubId);
      if (!hasScanAccess(remote, repo.user.login)) throw new ThreatModelError("K repozitáři už nemáte přístup.");
      for (const t of targets) {
        try {
          excerpts.push({ ...t, content: await getFileContent(token, remote.full_name, t.file, repo.lastCommitSha) });
        } catch {
          // A missing file only reduces context.
        }
      }
    }

    const context = buildContext(repo, active, refs, excerpts);
    const result = await runPipeline(
      context,
      undefined,
      {
        onStage: async (stage) => {
          await db.threatModel.update({ where: { id: tm.id }, data: { stage } });
        },
      },
      locale,
    );
    await db.threatModel.update({
      where: { id: tm.id },
      data: {
        status: "done",
        inputs: JSON.stringify(refs),
        scenarios: JSON.stringify(result.scenarios),
        defenses: JSON.stringify(result.defenses),
        audit: JSON.stringify(result.audit),
        finishedAt: new Date(),
      },
    });
  } catch (err) {
    const message = err instanceof ThreatModelError ? err.message : err instanceof Error ? err.message : "Neznámá chyba";
    await db.threatModel.update({ where: { id: tm.id }, data: { status: "failed", error: message, finishedAt: new Date() } });
  }
}
