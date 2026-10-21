import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { toJson, toMarkdown, toSarif } from "@/lib/export";
import pkg from "../../../../../../package.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORMATS = {
  sarif: { type: "application/sarif+json", ext: "sarif" },
  json: { type: "application/json", ext: "json" },
  md: { type: "text/markdown; charset=utf-8", ext: "md" },
} as const;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Nepřihlášen", { status: 401 });

  const format = new URL(req.url).searchParams.get("format") ?? "json";
  if (!(format in FORMATS)) return new Response("Neznámý formát", { status: 400 });
  const { type, ext } = FORMATS[format as keyof typeof FORMATS];

  const { id } = await params;
  const repo = await db.repo.findFirst({ where: { id, userId: user.id }, include: { findings: true, suppressions: true } });
  if (!repo) return new Response("Repozitář nebyl nalezen", { status: 404 });

  const body =
    format === "sarif" ? JSON.stringify(toSarif(repo, pkg.version), null, 2) : format === "md" ? toMarkdown(repo) : JSON.stringify(toJson(repo), null, 2);
  const filename = `repoguard-${repo.fullName.replace(/[^\w.-]+/g, "_")}.${ext}`;
  return new Response(body, {
    headers: { "Content-Type": type, "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "no-store" },
  });
}
