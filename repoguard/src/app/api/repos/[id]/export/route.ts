import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { toJson, toMarkdown, toSarif } from "@/lib/export";
import { annotatablePaths, buildAnnotationPatch } from "@/lib/annotate";
import { GitHubError, getFileContent, getRepoById, hasScanAccess } from "@/lib/github";
import { tokenFor } from "@/lib/session";
import { getLocale } from "@/lib/i18n/server";
import { mapLimit } from "@/lib/concurrency";
import pkg from "../../../../../../package.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORMATS = {
  sarif: { type: "application/sarif+json", ext: "sarif" },
  json: { type: "application/json", ext: "json" },
  md: { type: "text/markdown; charset=utf-8", ext: "md" },
  patch: { type: "text/x-patch; charset=utf-8", ext: "patch" },
} as const;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Nepřihlášen", { status: 401 });

  const format = new URL(req.url).searchParams.get("format") ?? "json";
  if (!(format in FORMATS)) return new Response("Neznámý formát", { status: 400 });
  const { type, ext } = FORMATS[format as keyof typeof FORMATS];

  const { id } = await params;
  const locale = await getLocale();
  const repo = await db.repo.findFirst({ where: { id, userId: user.id }, include: { findings: true, suppressions: true } });
  if (!repo) return new Response("Repozitář nebyl nalezen", { status: 404 });

  let body: string;
  if (format === "patch") {
    const active = repo.findings.filter((f) => !repo.suppressions.some((s) => s.fingerprint === f.fingerprint));
    const paths = annotatablePaths(active).slice(0, 100);
    if (paths.length === 0 || !repo.lastCommitSha) return new Response("Nejsou žádné nálezy s místem v kódu, které lze anotovat.", { status: 400 });
    try {
      const token = tokenFor(user);
      const remote = await getRepoById(token, repo.githubId);
      if (!hasScanAccess(remote, user.login)) return new Response("K repozitáři už nemáte přístup.", { status: 403 });
      const fetched = await mapLimit(paths, 8, async (path) => {
        try {
          return { path, content: await getFileContent(token, remote.full_name, path, repo.lastCommitSha!) };
        } catch {
          return null; // skip unreadable/too-large file
        }
      });
      body = buildAnnotationPatch(fetched.filter((x): x is { path: string; content: string } => x !== null), active, repo.htmlUrl, repo.lastCommitSha);
    } catch (err) {
      const status = err instanceof GitHubError ? err.status : 502;
      return new Response(err instanceof Error ? err.message : "Nepodařilo se načíst soubory z GitHubu.", { status });
    }
    if (!body) return new Response("Patch se nepodařilo vytvořit.", { status: 400 });
  } else {
    body =
      format === "sarif" ? JSON.stringify(toSarif(repo, pkg.version, locale), null, 2) : format === "md" ? toMarkdown(repo, locale) : JSON.stringify(toJson(repo, locale), null, 2);
  }
  const filename = `repoguard-${repo.fullName.replace(/[^\w.-]+/g, "_")}.${ext}`;
  return new Response(body, {
    headers: { "Content-Type": type, "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "no-store" },
  });
}
