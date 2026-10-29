import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { countBySeverity, partitionSuppressed, statusFor } from "@/lib/findings";
import { computeScore } from "@/lib/score";
import { formatDateTime, plural, pluralEn } from "@/lib/format";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/messages";
import { GradeBadge, SeverityCounts, StatusBadge } from "@/components/Badges";
import { ActionForm } from "@/components/ActionForm";
import { scanRepo } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const repos = await db.repo.findMany({
    where: { userId: user.id },
    include: {
      findings: { select: { severity: true, kind: true, ruleId: true, fingerprint: true } },
      suppressions: { select: { fingerprint: true } },
    },
    orderBy: { fullName: "asc" },
  });

  const rows = repos.map((r) => {
    const { active } = partitionSuppressed(r.findings, r.suppressions);
    return {
      repo: r,
      active,
      status: statusFor(r, active),
      score: computeScore(active, { code: Boolean(r.lastCodeScanAt), deps: Boolean(r.lastDepScanAt) }),
    };
  });
  const statuses = rows.map((r) => r.status);
  const summary = {
    critical: statuses.filter((s) => s === "critical").length,
    warnings: statuses.filter((s) => s === "warnings").length,
    ok: statuses.filter((s) => s === "ok").length,
  };
  const reposCount =
    locale === "cs" ? plural(repos.length, "připojený repozitář", "připojené repozitáře", "připojených repozitářů") : pluralEn(repos.length, "connected repository", "connected repositories");
  const findingsCount = (n: number) => (locale === "cs" ? plural(n, "nález", "nálezy", "nálezů") : pluralEn(n, "finding", "findings"));
  const vulnsCount = (n: number) => (locale === "cs" ? plural(n, "zranitelnost", "zranitelnosti", "zranitelností") : pluralEn(n, "vulnerability", "vulnerabilities"));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("dash.title", locale)}</h1>
          <p className="text-sm text-slate-500">{reposCount}</p>
        </div>
        <Link href="/repos/add" className="btn-primary">
          {t("dash.addRepo", locale)}
        </Link>
      </div>

      {repos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <SummaryTile label={t("common.critical", locale)} value={summary.critical} tone="text-red-700" />
          <SummaryTile label={t("common.warnings", locale)} value={summary.warnings} tone="text-amber-700" />
          <SummaryTile label={t("common.ok", locale)} value={summary.ok} tone="text-emerald-700" />
        </div>
      )}

      {repos.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-slate-600">{t("dash.empty", locale)}</p>
          <Link href="/repos/add" className="btn-primary mt-4">
            {t("dash.pickRepos", locale)}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map(({ repo, active, status, score }) => {
            const code = active.filter((f) => f.kind !== "dependency");
            const deps = active.filter((f) => f.kind === "dependency");
            return (
              <li key={repo.id} className="card flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="flex min-w-0 items-center gap-4">
                  {score && <GradeBadge grade={score.grade} score={score.score} />}
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={status} locale={locale} />
                      <Link href={`/repos/${repo.id}`} className="truncate font-semibold hover:underline">
                        {repo.fullName}
                      </Link>
                      {repo.isPrivate && <span className="rounded border border-slate-300 px-1.5 text-xs text-slate-500">{t("common.private", locale)}</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                      <span>
                        {t("dash.codeLabel", locale)}: {findingsCount(code.length)} · {formatDateTime(repo.lastCodeScanAt, locale)}
                      </span>
                      <span>
                        {t("dash.depsLabel", locale)}: {vulnsCount(deps.length)} · {formatDateTime(repo.lastDepScanAt, locale)}
                      </span>
                    </div>
                    <SeverityCounts counts={countBySeverity(active)} locale={locale} />
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <ActionForm action={scanRepo.bind(null, repo.id, "all")} label={t("common.scan", locale)} pendingLabel="…" variant="secondary" className="text-right" />
                  <Link href={`/repos/${repo.id}`} className="btn-secondary">
                    {t("common.detail", locale)}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="card p-4">
      <div className={`text-2xl font-bold ${tone}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
