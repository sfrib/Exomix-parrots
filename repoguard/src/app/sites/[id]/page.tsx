import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/server";
import { formatDateTime } from "@/lib/format";
import { VERIFY_PATH } from "@/lib/site/verify";
import type { SiteFinding } from "@/lib/site/audit";
import { GradeBadge } from "@/components/Badges";
import { ActionForm } from "@/components/ActionForm";
import { AutoRefresh } from "@/components/AutoRefresh";
import { SiteFindingCard } from "@/components/SiteFindingCard";
import { auditSiteAction, deleteSite, verifySite } from "@/app/sites/actions";

export const dynamic = "force-dynamic";

const SEV_ORDER = ["critical", "high", "medium", "low"] as const;

export default async function SiteDetail({ params }: { params: Promise<{ id: string }> }) {
  const [user, locale, { id }] = await Promise.all([requireUser(), getLocale(), params]);
  const cs = locale === "cs";
  const site = await db.site.findFirst({
    where: { id, userId: user.id },
    include: { audits: { orderBy: { startedAt: "desc" }, take: 10 } },
  });
  if (!site) notFound();

  const latest = site.audits[0];
  const lastDone = site.audits.find((a) => a.status === "done");
  const findings: SiteFinding[] = lastDone ? (JSON.parse(lastDone.findings) as SiteFinding[]) : [];
  findings.sort((a, b) => SEV_ORDER.indexOf(a.severity) - SEV_ORDER.indexOf(b.severity));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/sites" className="text-sm text-slate-500 hover:text-slate-900">
          {cs ? "← Weby" : "← Websites"}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="break-all text-2xl font-bold">{site.origin}</h1>
          {site.verified && site.lastGrade && <GradeBadge grade={site.lastGrade} score={site.lastScore ?? 0} />}
        </div>
      </div>

      {!site.verified ? (
        <div className="card space-y-3 p-4 text-sm">
          <h2 className="font-semibold">{cs ? "Ověřte vlastnictví webu" : "Verify site ownership"}</h2>
          <p className="text-slate-600">
            {cs ? "Než web zkontrolujeme, musíte doložit, že ho vlastníte. Stačí jeden ze způsobů:" : "Before we check the site, prove you own it. Either method is enough:"}
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-slate-600">
            <li>
              {cs ? "Nahrajte soubor" : "Upload a file"} <code className="font-mono text-xs">{VERIFY_PATH}</code> {cs ? "s tímto obsahem:" : "with this content:"}
              <pre className="mt-1 overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 font-mono text-xs text-slate-100">
                <code>{site.verifyToken}</code>
              </pre>
              <span className="text-xs text-slate-400">
                {cs ? "Dostupný na: " : "Reachable at: "}
                <span className="font-mono">
                  {site.origin}
                  {VERIFY_PATH}
                </span>
              </span>
            </li>
            <li>
              {cs ? "Nebo přidejte DNS TXT záznam na " : "Or add a DNS TXT record on "}
              <code className="font-mono text-xs">{site.host}</code> {cs ? "s hodnotou " : "with the value "}
              <code className="font-mono text-xs">{site.verifyToken}</code>.
            </li>
          </ol>
          <ActionForm action={verifySite.bind(null, site.id)} label={cs ? "Ověřit teď" : "Verify now"} pendingLabel="…" />
        </div>
      ) : (
        <div className="card flex flex-wrap items-center gap-3 p-4">
          <ActionForm action={auditSiteAction.bind(null, site.id)} label={cs ? "Spustit audit" : "Run audit"} pendingLabel="…" />
          <span className="text-xs text-slate-500">
            {cs ? "Ověřeno" : "Verified"} {formatDateTime(site.verifiedAt, locale)} · {cs ? "poslední audit" : "last audit"} {formatDateTime(site.lastAuditAt, locale)}
          </span>
          <form action={deleteSite.bind(null, site.id)} className="ml-auto">
            <button className="btn-danger">{cs ? "Odstranit" : "Remove"}</button>
          </form>
        </div>
      )}

      {latest?.status === "running" && (
        <p className="card flex items-center gap-3 p-4 text-sm text-sky-800">
          <AutoRefresh />
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-700 border-t-transparent" aria-hidden />
          {cs ? "Audit probíhá…" : "Audit running…"}
        </p>
      )}
      {latest?.status === "failed" && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {cs ? "Poslední audit selhal" : "The last audit failed"}: {latest.error}
        </p>
      )}

      {site.verified && lastDone && (
        <>
          <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
            {cs
              ? "Kontrola je pasivní (čtení hlaviček a několik známých cest). Výsledek odráží stav v době auditu – po změně na serveru spusťte audit znovu."
              : "The check is passive (reading headers and a few well-known paths). The result reflects the moment of the audit — re-run it after server changes."}
          </p>
          {findings.length === 0 ? (
            <p className="card p-6 text-center text-emerald-700">✓ {cs ? "Nebyly nalezeny žádné problémy. Dobrá práce!" : "No issues found. Nice work!"}</p>
          ) : (
            <div className="space-y-3">
              {findings.map((f) => (
                <SiteFindingCard key={f.id} finding={f} locale={locale} />
              ))}
            </div>
          )}
        </>
      )}

      {site.audits.filter((a) => a.status === "done").length > 1 && (
        <details className="card p-4 text-sm">
          <summary className="cursor-pointer font-medium">{cs ? "Historie auditů" : "Audit history"}</summary>
          <ul className="mt-2 space-y-1 text-slate-600">
            {site.audits
              .filter((a) => a.status === "done")
              .map((a) => (
                <li key={a.id}>
                  {formatDateTime(a.startedAt, locale)} · {cs ? "skóre" : "score"} {a.score}/100 ({a.grade})
                </li>
              ))}
          </ul>
        </details>
      )}
    </div>
  );
}
