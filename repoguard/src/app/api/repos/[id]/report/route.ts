import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { renderReport } from "@/lib/report";
import { getLocale } from "@/lib/i18n/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Nepřihlášen", { status: 401 });

  const { id } = await params;
  const locale = await getLocale();
  const repo = await db.repo.findFirst({ where: { id, userId: user.id }, include: {
      findings: true,
      suppressions: true,
      threatModels: { where: { status: "done" }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!repo) return new Response("Repozitář nebyl nalezen", { status: 404 });

  const pdf = await renderReport(repo, repo.findings, repo.suppressions, repo.threatModels[0], locale);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `repoguard-${repo.fullName.replace(/[^\w.-]+/g, "_")}-${date}.pdf`;
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
