import { db } from "../db";
import { liveFetch, liveCert } from "./fetch";
import { auditSite, scoreSite } from "./audit";
import type { Locale } from "../i18n/locale";

const STALE_MS = 10 * 60 * 1000;

/** Creates an audit record for a verified site owned by the user. */
export async function createSiteAudit(siteId: string, userId: string) {
  const site = await db.site.findFirst({ where: { id: siteId, userId } });
  if (!site) throw new Error("Web nebyl nalezen.");
  if (!site.verified) throw new Error("Web musí být nejdřív ověřen.");
  const running = await db.siteAudit.findFirst({ where: { siteId, status: "running", startedAt: { gt: new Date(Date.now() - STALE_MS) } } });
  if (running) throw new Error("Audit už právě probíhá.");
  return db.siteAudit.create({ data: { siteId, status: "running" } });
}

/** Runs the audit for a created record and stores the result (never throws). */
export async function executeSiteAudit(auditId: string, locale: Locale = "en"): Promise<void> {
  const audit = await db.siteAudit.findUnique({ where: { id: auditId }, include: { site: true } });
  if (!audit) return;
  try {
    const { site } = audit;
    const result = await auditSite(site.origin, liveFetch, locale, liveCert);
    if (!result.reachable) throw new Error(locale === "cs" ? "Web je nedostupný." : "The site is unreachable.");
    const { score, grade } = scoreSite(result.findings);
    const now = new Date();
    await db.$transaction([
      db.siteAudit.update({ where: { id: audit.id }, data: { status: "done", score, grade, findings: JSON.stringify(result.findings), finishedAt: now } }),
      db.site.update({ where: { id: site.id }, data: { lastScore: score, lastGrade: grade, lastAuditAt: now } }),
    ]);
  } catch (err) {
    await db.siteAudit.update({ where: { id: audit.id }, data: { status: "failed", error: err instanceof Error ? err.message : "Neznámá chyba", finishedAt: new Date() } });
  }
}
