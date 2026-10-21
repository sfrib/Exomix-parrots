import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { runScan } from "@/lib/scan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(req.headers.get("authorization") ?? "");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/**
 * Scheduled re-check of all connected repos (dependencies by default, add ?code=1 for code too).
 * Call with "Authorization: Bearer $CRON_SECRET" (Vercel Cron sends this automatically).
 */
export async function GET(req: Request) {
  if (!process.env.CRON_SECRET) return Response.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  if (!authorized(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const kind = new URL(req.url).searchParams.get("code") === "1" ? "all" : "deps";
  const repos = await db.repo.findMany({ select: { id: true, userId: true, fullName: true } });
  const results = [];
  for (const repo of repos) {
    try {
      const r = await runScan(repo.id, repo.userId, kind, "cron");
      results.push({ repo: repo.fullName, ok: true, ...r });
    } catch (err) {
      results.push({ repo: repo.fullName, ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  }
  return Response.json({ kind, scanned: results.length, results });
}
