import Link from "next/link";
import { notFound } from "next/navigation";
import type { Finding, Suppression } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { countBySeverity, groupBySeverity, isNewFinding, partitionSuppressed, sortFindings, statusFor } from "@/lib/findings";
import { formatDateTime } from "@/lib/format";
import { categoryOf, computeScore, type Category } from "@/lib/score";
import { DEFAULT_EXCLUDES } from "@/lib/scanner/files";
import { aiReviewEnabled } from "@/lib/ai-review";
import { type Locale } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import { t, type MessageKey } from "@/lib/i18n/messages";
import { GradeBadge, SeverityCounts, StatusBadge } from "@/components/Badges";
import { ActionForm } from "@/components/ActionForm";
import { FindingCard } from "@/components/FindingCard";
import { ThreatModelView } from "@/components/ThreatModelView";
import { disconnectRepo, saveExcludes, scanRepo } from "@/app/actions";

export const dynamic = "force-dynamic";

type Tab = "malware" | "code" | "web" | "agent" | "deps" | "repo" | "threats" | "inventory" | "history" | "suppressed";

const TABS: { id: Tab; label: MessageKey }[] = [
  { id: "malware", label: "cat.malware" },
  { id: "code", label: "tab.code" },
  { id: "web", label: "cat.web" },
  { id: "agent", label: "cat.agent" },
  { id: "deps", label: "tab.deps" },
  { id: "repo", label: "cat.repo" },
  { id: "threats", label: "tab.threats" },
  { id: "inventory", label: "tab.inventory" },
  { id: "history", label: "tab.history" },
  { id: "suppressed", label: "tab.suppressed" },
];

const TAB_CATEGORIES: Partial<Record<Tab, Category[]>> = {
  malware: ["malware"],
  code: ["code", "secrets"],
  web: ["web"],
  agent: ["agent"],
  deps: ["deps"],
  repo: ["repo"],
};

const EMPTY_KEY: Partial<Record<Tab, MessageKey>> = {
  malware: "empty.malware",
  code: "empty.code",
  web: "empty.web",
  agent: "empty.agent",
  repo: "empty.repo",
};

export default async function RepoDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [user, locale, { id }, { tab: tabParam }] = await Promise.all([requireUser(), getLocale(), params, searchParams]);
  const tab: Tab = TABS.some((x) => x.id === tabParam) ? (tabParam as Tab) : "code";

  const repo = await db.repo.findFirst({
    where: { id, userId: user.id },
    include: {
      findings: true,
      suppressions: true,
      dependencies: { orderBy: [{ direct: "desc" }, { name: "asc" }] },
      scans: { orderBy: { startedAt: "desc" }, take: 30 },
      threatModels: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!repo) notFound();

  const { active, suppressed } = partitionSuppressed(repo.findings, repo.suppressions);
  const score = computeScore(active, { code: Boolean(repo.lastCodeScanAt), deps: Boolean(repo.lastDepScanAt) });
  const inTab = (x: Tab) => sortFindings(active.filter((f) => TAB_CATEGORIES[x]?.includes(categoryOf(f))));
  const previousScanEnd = (kind: string) => repo.scans.filter((s) => s.kind === kind && s.status === "done")[1]?.finishedAt ?? null;
  const lastFailed = repo.scans[0]?.status === "failed" ? repo.scans[0] : null;
  const running = repo.scans.some((s) => s.status === "running");
  const aiEnabled = aiReviewEnabled();
  const suppressionOf = new Map(repo.suppressions.map((s) => [s.fingerprint, s]));

  const counts: Record<Tab, number> = {
    malware: inTab("malware").length,
    code: inTab("code").length,
    web: inTab("web").length,
    agent: inTab("agent").length,
    deps: inTab("deps").length,
    repo: inTab("repo").length,
    threats: repo.threatModels.filter((m) => m.status === "done").length,
    inventory: repo.dependencies.length,
    history: repo.scans.length,
    suppressed: suppressed.length,
  };

  const listProps = (x: Tab) => ({
    htmlUrl: repo.htmlUrl,
    commitSha: repo.lastCommitSha,
    previousScanEnd: previousScanEnd(x === "deps" ? "deps" : "code"),
    aiEnabled,
    locale,
    suppressionOf,
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">
          {t("back.overview", locale)}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="break-all text-2xl font-bold">{repo.fullName}</h1>
          <StatusBadge status={statusFor(repo, active)} locale={locale} />
          <a href={repo.htmlUrl} target="_blank" rel="noreferrer" className="text-sm text-sky-700 hover:underline">
            {t("repo.openGithub", locale)}
          </a>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
          <span>
            {t("repo.branch", locale)}: {repo.defaultBranch}
          </span>
          <span>
            {t("repo.codeScan", locale)}: {formatDateTime(repo.lastCodeScanAt, locale)}
          </span>
          <span>
            {t("repo.depScan", locale)}: {formatDateTime(repo.lastDepScanAt, locale)}
          </span>
          {repo.lastCommitSha && <span className="font-mono">{t("detail.commit", locale)} {repo.lastCommitSha.slice(0, 7)}</span>}
        </div>
      </div>

      {score && (
        <div className="card flex flex-wrap items-center gap-6 p-4">
          <div>
            <div className="text-xs text-slate-500">{t("repo.score", locale)}</div>
            <div className="mt-1">
              <GradeBadge grade={score.grade} score={score.score} size="lg" />
            </div>
          </div>
          <ul className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {score.categories.map((c) => (
              <li key={c.category}>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{t(`cat.${c.category}`, locale)}</span>
                  <span>{c.score}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${c.score >= 90 ? "bg-emerald-500" : c.score >= 60 ? "bg-amber-500" : "bg-red-600"}`}
                    style={{ width: `${c.score}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="w-full">
            <SeverityCounts counts={countBySeverity(active)} locale={locale} />
          </div>
        </div>
      )}

      <div className="card flex flex-wrap items-start gap-3 p-4">
        <ActionForm action={scanRepo.bind(null, repo.id, "all")} label={t("repo.fullScan", locale)} pendingLabel="…" />
        <ActionForm action={scanRepo.bind(null, repo.id, "code")} label={t("repo.scanCode", locale)} pendingLabel="…" variant="secondary" />
        <ActionForm action={scanRepo.bind(null, repo.id, "deps")} label={t("repo.scanDeps", locale)} pendingLabel="…" variant="secondary" />
        <details className="relative">
          <summary className="btn-secondary cursor-pointer list-none">{t("export.menu", locale)}</summary>
          <div className="absolute z-10 mt-1 w-56 rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg">
            <a href={`/api/repos/${repo.id}/report`} className="block px-3 py-1.5 hover:bg-slate-50">{t("export.pdf", locale)}</a>
            <a href={`/api/repos/${repo.id}/export?format=sarif`} className="block px-3 py-1.5 hover:bg-slate-50">{t("export.sarif", locale)}</a>
            <a href={`/api/repos/${repo.id}/export?format=json`} className="block px-3 py-1.5 hover:bg-slate-50">{t("export.json", locale)}</a>
            <a href={`/api/repos/${repo.id}/export?format=md`} className="block px-3 py-1.5 hover:bg-slate-50">{t("export.md", locale)}</a>
            <a href={`/api/repos/${repo.id}/export?format=patch`} className="block px-3 py-1.5 hover:bg-slate-50">{t("export.patch", locale)}</a>
          </div>
        </details>
        <form action={disconnectRepo.bind(null, repo.id)} className="ml-auto">
          <button className="btn-danger">{t("repo.disconnect", locale)}</button>
        </form>
      </div>

      <details className="card p-4 text-sm">
        <summary className="cursor-pointer font-medium">{t("verif.title", locale)}</summary>
        <div className="mt-2 space-y-2 text-slate-600">
          <p>{t("verif.p1", locale)}</p>
          <p>
            {t("verif.p2a", locale)}{" "}
            <Link href="/verify" className="text-sky-700 hover:underline">
              /verify
            </Link>{" "}
            {t("verif.p2b", locale)}
          </p>
          <p>{t("verif.p3", locale)}</p>
          <p className="text-xs text-slate-400">{t("verif.legal", locale)}</p>
        </div>
      </details>

      {running && <p className="rounded-lg bg-sky-50 p-3 text-sm text-sky-800">{t("detail.scanning", locale)}</p>}
      {lastFailed && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {t("detail.lastScanFailed", locale)} ({formatDateTime(lastFailed.startedAt, locale)}) {t("detail.failedWith", locale)}: {lastFailed.error}
        </p>
      )}

      <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">{t("repo.deterministic", locale)}</p>

      <nav className="flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((x) => (
          <Link
            key={x.id}
            href={`?tab=${x.id}`}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${tab === x.id ? "border-slate-900 font-semibold text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            {t(x.label, locale)} <span className="text-slate-400">({counts[x.id]})</span>
          </Link>
        ))}
      </nav>

      {(tab === "malware" || tab === "code" || tab === "web" || tab === "agent" || tab === "repo") && (
        <FindingList findings={inTab(tab)} scanned={Boolean(repo.lastCodeScanAt)} emptyText={t(EMPTY_KEY[tab]!, locale)} {...listProps(tab)} />
      )}
      {tab === "deps" && (
        <FindingList
          findings={inTab("deps")}
          scanned={Boolean(repo.lastDepScanAt)}
          emptyText={
            repo.dependencies.length > 0
              ? `${t("deps.allSafe", locale)} (${repo.dependencies.length})`
              : t("empty.depsNoManifest", locale)
          }
          {...listProps("deps")}
        />
      )}
      {tab === "threats" && <ThreatModelView repoId={repo.id} models={repo.threatModels} aiEnabled={aiEnabled} locale={locale} />}
      {tab === "suppressed" &&
        (suppressed.length === 0 ? (
          <p className="card p-6 text-center text-slate-500">{t("empty.suppressed", locale)}</p>
        ) : (
          <div className="space-y-3">
            {sortFindings(suppressed).map((f) => (
              <FindingCard
                key={f.id}
                finding={f}
                htmlUrl={repo.htmlUrl}
                commitSha={repo.lastCommitSha}
                isNew={false}
                aiEnabled={aiEnabled}
                locale={locale}
                suppression={suppressionOf.get(f.fingerprint)}
              />
            ))}
          </div>
        ))}
      {tab === "inventory" && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-2">{t("inv.package", locale)}</th>
                <th className="px-4 py-2">{t("inv.version", locale)}</th>
                <th className="px-4 py-2">{t("inv.ecosystem", locale)}</th>
                <th className="px-4 py-2">{t("inv.type", locale)}</th>
                <th className="px-4 py-2">{t("inv.file", locale)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {repo.dependencies.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-1.5 font-mono text-xs">{d.name}</td>
                  <td className="px-4 py-1.5 font-mono text-xs">
                    {d.version}
                    {d.approximate && <span title={t("inv.approx", locale)}> ≈</span>}
                  </td>
                  <td className="px-4 py-1.5">{d.ecosystem}</td>
                  <td className="px-4 py-1.5">{d.direct ? t("inv.direct", locale) : t("inv.indirect", locale)}</td>
                  <td className="px-4 py-1.5 font-mono text-xs text-slate-500">{d.manifest}</td>
                </tr>
              ))}
              {repo.dependencies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    {t("inv.empty", locale)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {tab === "history" && (
        <ul className="card divide-y divide-slate-100 text-sm">
          {repo.scans.map((s) => (
            <li key={s.id} className="flex flex-wrap justify-between gap-2 px-4 py-2">
              <span>
                {s.kind === "code" ? t("hist.codeScan", locale) : t("hist.depScan", locale)} · {s.trigger === "cron" ? t("hist.auto", locale) : t("hist.manual", locale)}
              </span>
              <span className="text-slate-500">
                {formatDateTime(s.startedAt, locale)} ·{" "}
                {s.status === "done" ? (
                  <>
                    {t("hist.done", locale)}
                    {(s.newCount > 0 || s.resolvedCount > 0) && (
                      <>
                        {" "}· <span className="text-red-700">+{s.newCount} {t("hist.new", locale)}</span> ·{" "}
                        <span className="text-emerald-700">−{s.resolvedCount} {t("hist.resolved", locale)}</span>
                      </>
                    )}
                  </>
                ) : s.status === "running" ? (
                  t("hist.running", locale)
                ) : (
                  <span className="text-red-700">{t("hist.failed", locale)}: {s.error}</span>
                )}
              </span>
            </li>
          ))}
          {repo.scans.length === 0 && <li className="px-4 py-6 text-center text-slate-500">{t("hist.empty", locale)}</li>}
        </ul>
      )}

      <details className="card p-4">
        <summary className="cursor-pointer text-sm font-medium">{t("settings.title", locale)}</summary>
        <p className="mt-2 text-sm text-slate-500">
          {t("settings.help1", locale)} <code className="font-mono">wp-content/plugins/akismet</code> {t("settings.help2", locale)}{" "}
          {DEFAULT_EXCLUDES.join(", ")}. {t("settings.help3", locale)} <code className="font-mono">repoguard-ignore</code>
          {t("settings.help4", locale)}
        </p>
        <ActionForm action={saveExcludes.bind(null, repo.id)} label={t("common.save", locale)} variant="secondary" className="mt-3 space-y-2">
          <textarea name="excludePaths" defaultValue={repo.excludePaths} rows={4} className="block w-full rounded-lg border border-slate-300 p-2 font-mono text-xs" />
        </ActionForm>
      </details>
    </div>
  );
}

function FindingList({
  findings,
  scanned,
  emptyText,
  htmlUrl,
  commitSha,
  previousScanEnd,
  aiEnabled,
  locale,
  suppressionOf,
}: {
  findings: Finding[];
  scanned: boolean;
  emptyText: string;
  htmlUrl: string;
  commitSha: string | null;
  previousScanEnd: Date | null;
  aiEnabled: boolean;
  locale: Locale;
  suppressionOf: Map<string, Suppression>;
}) {
  if (!scanned) return <p className="card p-6 text-center text-slate-500">{t("list.noScan", locale)}</p>;
  if (findings.length === 0) return <p className="card p-6 text-center text-emerald-700">✓ {emptyText}</p>;
  return (
    <div className="space-y-8">
      {groupBySeverity(findings).map((group) => (
        <section key={group.severity} className="space-y-3">
          <h2 className="text-lg font-semibold">
            {t(`sev.${group.severity}`, locale)} {t("sev.severityWord", locale)} <span className="text-slate-400">({group.items.length})</span>
          </h2>
          {group.items.map((f) => (
            <FindingCard
              key={f.id}
              finding={f}
              htmlUrl={htmlUrl}
              commitSha={commitSha}
              isNew={isNewFinding(f.firstSeenAt, previousScanEnd)}
              aiEnabled={aiEnabled}
              locale={locale}
              suppression={suppressionOf.get(f.fingerprint)}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
