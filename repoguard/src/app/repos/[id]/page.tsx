import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { countBySeverity, groupBySeverity, isNewFinding, sortFindings, statusFor } from "@/lib/findings";
import { formatDateTime, plural } from "@/lib/format";
import { SEVERITY_LABEL_CS } from "@/lib/severity";
import { DEFAULT_EXCLUDES } from "@/lib/scanner/files";
import { SeverityCounts, StatusBadge } from "@/components/Badges";
import { ActionForm } from "@/components/ActionForm";
import { FindingCard } from "@/components/FindingCard";
import { disconnectRepo, saveExcludes, scanRepo } from "@/app/actions";

export const dynamic = "force-dynamic";

type Tab = "code" | "deps" | "inventory" | "history";

const TABS: { id: Tab; label: string }[] = [
  { id: "code", label: "Kód" },
  { id: "deps", label: "Závislosti (CVE)" },
  { id: "inventory", label: "Seznam závislostí" },
  { id: "history", label: "Historie skenů" },
];

export default async function RepoDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const tab: Tab = TABS.some((t) => t.id === tabParam) ? (tabParam as Tab) : "code";

  const repo = await db.repo.findFirst({
    where: { id, userId: user.id },
    include: {
      findings: true,
      dependencies: { orderBy: [{ direct: "desc" }, { name: "asc" }] },
      scans: { orderBy: { startedAt: "desc" }, take: 20 },
    },
  });
  if (!repo) notFound();

  const code = sortFindings(repo.findings.filter((f) => f.kind === "code"));
  const deps = sortFindings(repo.findings.filter((f) => f.kind === "dependency"));
  const previousScanEnd = (kind: string) =>
    repo.scans.filter((s) => s.kind === kind && s.status === "done")[1]?.finishedAt ?? null;
  const lastFailed = repo.scans[0]?.status === "failed" ? repo.scans[0] : null;
  const running = repo.scans.some((s) => s.status === "running");
  const counts: Record<Tab, number> = { code: code.length, deps: deps.length, inventory: repo.dependencies.length, history: repo.scans.length };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">
          ← Přehled
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{repo.fullName}</h1>
          <StatusBadge status={statusFor(repo, repo.findings)} />
          <a href={repo.htmlUrl} target="_blank" rel="noreferrer" className="text-sm text-sky-700 hover:underline">
            Otevřít na GitHubu ↗
          </a>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
          <span>Větev: {repo.defaultBranch}</span>
          <span>Poslední sken kódu: {formatDateTime(repo.lastCodeScanAt)}</span>
          <span>Poslední kontrola závislostí: {formatDateTime(repo.lastDepScanAt)}</span>
          {repo.lastCommitSha && <span className="font-mono">commit {repo.lastCommitSha.slice(0, 7)}</span>}
        </div>
        <div className="mt-2">
          <SeverityCounts counts={countBySeverity(repo.findings)} />
        </div>
      </div>

      <div className="card flex flex-wrap items-start gap-3 p-4">
        <ActionForm action={scanRepo.bind(null, repo.id, "all")} label="Spustit kompletní sken" pendingLabel="Skenuji…" />
        <ActionForm action={scanRepo.bind(null, repo.id, "code")} label="Skenovat kód" pendingLabel="Skenuji kód…" variant="secondary" />
        <ActionForm action={scanRepo.bind(null, repo.id, "deps")} label="Zkontrolovat závislosti (CVE)" pendingLabel="Kontroluji…" variant="secondary" />
        <a href={`/api/repos/${repo.id}/report`} className="btn-secondary">
          Exportovat PDF
        </a>
        <form action={disconnectRepo.bind(null, repo.id)} className="ml-auto">
          <button className="btn-danger">Odpojit</button>
        </form>
      </div>

      {running && <p className="rounded-lg bg-sky-50 p-3 text-sm text-sky-800">Sken právě probíhá…</p>}
      {lastFailed && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          Poslední sken ({formatDateTime(lastFailed.startedAt)}) selhal: {lastFailed.error}
        </p>
      )}

      <nav className="flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`?tab=${t.id}`}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${tab === t.id ? "border-slate-900 font-semibold text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            {t.label} <span className="text-slate-400">({counts[t.id]})</span>
          </Link>
        ))}
      </nav>

      {tab === "code" && (
        <FindingList
          findings={code}
          scanned={Boolean(repo.lastCodeScanAt)}
          emptyText="Ve zdrojovém kódu nebyla nalezena žádná slabá místa."
          htmlUrl={repo.htmlUrl}
          commitSha={repo.lastCommitSha}
          previousScanEnd={previousScanEnd("code")}
        />
      )}
      {tab === "deps" && (
        <FindingList
          findings={deps}
          scanned={Boolean(repo.lastDepScanAt)}
          emptyText={
            repo.dependencies.length > 0
              ? `Žádná ze závislostí (${repo.dependencies.length}) nemá známou zranitelnost.`
              : "V repozitáři nebyly nalezeny žádné podporované soubory závislostí (composer.json/.lock, package.json, package-lock.json, yarn.lock, requirements.txt)."
          }
          htmlUrl={repo.htmlUrl}
          commitSha={repo.lastCommitSha}
          previousScanEnd={previousScanEnd("deps")}
        />
      )}
      {tab === "inventory" && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-2">Balíček</th>
                <th className="px-4 py-2">Verze</th>
                <th className="px-4 py-2">Ekosystém</th>
                <th className="px-4 py-2">Typ</th>
                <th className="px-4 py-2">Soubor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {repo.dependencies.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-1.5 font-mono text-xs">{d.name}</td>
                  <td className="px-4 py-1.5 font-mono text-xs">
                    {d.version}
                    {d.approximate && <span title="Odvozeno z rozsahu verzí, chybí lockfile"> ≈</span>}
                  </td>
                  <td className="px-4 py-1.5">{d.ecosystem}</td>
                  <td className="px-4 py-1.5">{d.direct ? "přímá" : "nepřímá"}</td>
                  <td className="px-4 py-1.5 font-mono text-xs text-slate-500">{d.manifest}</td>
                </tr>
              ))}
              {repo.dependencies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    Zatím žádné závislosti. Spusťte kontrolu závislostí.
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
                {s.kind === "code" ? "Sken kódu" : "Kontrola závislostí"} · {s.trigger === "cron" ? "automaticky" : "ručně"}
              </span>
              <span className="text-slate-500">
                {formatDateTime(s.startedAt)} ·{" "}
                {s.status === "done" ? "dokončeno" : s.status === "running" ? "probíhá" : <span className="text-red-700">selhalo: {s.error}</span>}
              </span>
            </li>
          ))}
          {repo.scans.length === 0 && <li className="px-4 py-6 text-center text-slate-500">Zatím neproběhl žádný sken.</li>}
        </ul>
      )}

      <details className="card p-4">
        <summary className="cursor-pointer text-sm font-medium">Nastavení skenu – vynechané cesty</summary>
        <p className="mt-2 text-sm text-slate-500">
          Jedna cesta (prefix) na řádek, např. <code className="font-mono">wp-content/plugins/akismet</code> pro pluginy třetích stran.
          Vždy se vynechávají: {DEFAULT_EXCLUDES.join(", ")}. Jednotlivý řádek kódu lze vynechat komentářem{" "}
          <code className="font-mono">repoguard-ignore</code>.
        </p>
        <ActionForm action={saveExcludes.bind(null, repo.id)} label="Uložit" variant="secondary" className="mt-3 space-y-2">
          <textarea
            name="excludePaths"
            defaultValue={repo.excludePaths}
            rows={4}
            className="block w-full rounded-lg border border-slate-300 p-2 font-mono text-xs"
          />
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
}: {
  findings: Awaited<ReturnType<typeof db.finding.findMany>>;
  scanned: boolean;
  emptyText: string;
  htmlUrl: string;
  commitSha: string | null;
  previousScanEnd: Date | null;
}) {
  if (!scanned) return <p className="card p-6 text-center text-slate-500">Zatím neproběhl žádný sken. Spusťte ho tlačítkem výše.</p>;
  if (findings.length === 0) return <p className="card p-6 text-center text-emerald-700">✓ {emptyText}</p>;
  return (
    <div className="space-y-8">
      {groupBySeverity(findings).map((group) => (
        <section key={group.severity} className="space-y-3">
          <h2 className="text-lg font-semibold">
            {SEVERITY_LABEL_CS[group.severity]} závažnost <span className="text-slate-400">({group.items.length})</span>
          </h2>
          {group.items.map((f) => (
            <FindingCard key={f.id} finding={f} htmlUrl={htmlUrl} commitSha={commitSha} isNew={isNewFinding(f.firstSeenAt, previousScanEnd)} />
          ))}
        </section>
      ))}
    </div>
  );
}
