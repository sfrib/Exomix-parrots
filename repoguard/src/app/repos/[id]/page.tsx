import Link from "next/link";
import { notFound } from "next/navigation";
import type { Finding, Suppression } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { countBySeverity, groupBySeverity, isNewFinding, partitionSuppressed, sortFindings, statusFor } from "@/lib/findings";
import { formatDateTime } from "@/lib/format";
import { SEVERITY_LABEL_CS } from "@/lib/severity";
import { CATEGORY_LABEL_CS, categoryOf, computeScore, type Category } from "@/lib/score";
import { DEFAULT_EXCLUDES } from "@/lib/scanner/files";
import { aiReviewEnabled } from "@/lib/ai-review";
import { GradeBadge, SeverityCounts, StatusBadge } from "@/components/Badges";
import { ActionForm } from "@/components/ActionForm";
import { FindingCard } from "@/components/FindingCard";
import { ThreatModelView } from "@/components/ThreatModelView";
import { disconnectRepo, saveExcludes, scanRepo } from "@/app/actions";

export const dynamic = "force-dynamic";

type Tab = "malware" | "code" | "web" | "agent" | "deps" | "repo" | "threats" | "inventory" | "history" | "suppressed";

const TABS: { id: Tab; label: string }[] = [
  { id: "malware", label: "Detekce napadení" },
  { id: "code", label: "Kód a klíče" },
  { id: "web", label: "Zabezpečení webu" },
  { id: "agent", label: "AI agenti a CI" },
  { id: "deps", label: "Závislosti (CVE)" },
  { id: "repo", label: "Nastavení repozitáře" },
  { id: "threats", label: "Útočné scénáře (AI)" },
  { id: "inventory", label: "Seznam závislostí" },
  { id: "history", label: "Historie skenů" },
  { id: "suppressed", label: "Potlačené" },
];

const TAB_CATEGORIES: Partial<Record<Tab, Category[]>> = {
  malware: ["malware"],
  code: ["code", "secrets"],
  web: ["web"],
  agent: ["agent"],
  deps: ["deps"],
  repo: ["repo"],
};

const EMPTY_TEXT: Partial<Record<Tab, string>> = {
  malware: "Nebyly nalezeny žádné známky napadení (webshelly, zadní vrátka, obfuskovaný kód). Není to záruka – pravidelně kontrolujte a držte web aktualizovaný.",
  code: "Ve zdrojovém kódu nebyla nalezena žádná slabá místa ani uložená hesla.",
  web: "Nebyly nalezeny vystavené citlivé soubory, nebezpečné .htaccess direktivy ani zjevně zastaralé komponenty.",
  agent:
    "V konfiguraci AI agentů (CLAUDE.md, .claude/, .mcp.json, .cursorrules…) ani v GitHub Actions nebyly nalezeny žádné problémy.",
  repo: "Nastavení repozitáře odpovídá doporučením.",
};

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
      suppressions: true,
      dependencies: { orderBy: [{ direct: "desc" }, { name: "asc" }] },
      scans: { orderBy: { startedAt: "desc" }, take: 30 },
      threatModels: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!repo) notFound();

  const { active, suppressed } = partitionSuppressed(repo.findings, repo.suppressions);
  const score = computeScore(active, { code: Boolean(repo.lastCodeScanAt), deps: Boolean(repo.lastDepScanAt) });
  const inTab = (t: Tab) => sortFindings(active.filter((f) => TAB_CATEGORIES[t]?.includes(categoryOf(f))));
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

  const listProps = (t: Tab) => ({
    htmlUrl: repo.htmlUrl,
    commitSha: repo.lastCommitSha,
    previousScanEnd: previousScanEnd(t === "deps" ? "deps" : "code"),
    aiEnabled,
    suppressionOf,
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">
          ← Přehled
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="break-all text-2xl font-bold">{repo.fullName}</h1>
          <StatusBadge status={statusFor(repo, active)} />
          <a href={repo.htmlUrl} target="_blank" rel="noreferrer" className="text-sm text-sky-700 hover:underline">
            Otevřít na GitHubu ↗
          </a>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
          <span>Větev: {repo.defaultBranch}</span>
          <span>Sken kódu: {formatDateTime(repo.lastCodeScanAt)}</span>
          <span>Kontrola závislostí: {formatDateTime(repo.lastDepScanAt)}</span>
          {repo.lastCommitSha && <span className="font-mono">commit {repo.lastCommitSha.slice(0, 7)}</span>}
        </div>
      </div>

      {score && (
        <div className="card flex flex-wrap items-center gap-6 p-4">
          <div>
            <div className="text-xs text-slate-500">Bezpečnostní skóre</div>
            <div className="mt-1">
              <GradeBadge grade={score.grade} score={score.score} size="lg" />
            </div>
          </div>
          <ul className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {score.categories.map((c) => (
              <li key={c.category}>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{CATEGORY_LABEL_CS[c.category]}</span>
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
            <SeverityCounts counts={countBySeverity(active)} />
          </div>
        </div>
      )}

      <div className="card flex flex-wrap items-start gap-3 p-4">
        <ActionForm action={scanRepo.bind(null, repo.id, "all")} label="Spustit kompletní sken" pendingLabel="Skenuji…" />
        <ActionForm action={scanRepo.bind(null, repo.id, "code")} label="Skenovat kód" pendingLabel="Skenuji kód…" variant="secondary" />
        <ActionForm action={scanRepo.bind(null, repo.id, "deps")} label="Zkontrolovat závislosti (CVE)" pendingLabel="Kontroluji…" variant="secondary" />
        <details className="relative">
          <summary className="btn-secondary cursor-pointer list-none">Export ▾</summary>
          <div className="absolute z-10 mt-1 w-56 rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg">
            <a href={`/api/repos/${repo.id}/report`} className="block px-3 py-1.5 hover:bg-slate-50">PDF report</a>
            <a href={`/api/repos/${repo.id}/export?format=sarif`} className="block px-3 py-1.5 hover:bg-slate-50">SARIF (GitHub Code Scanning)</a>
            <a href={`/api/repos/${repo.id}/export?format=json`} className="block px-3 py-1.5 hover:bg-slate-50">JSON</a>
            <a href={`/api/repos/${repo.id}/export?format=md`} className="block px-3 py-1.5 hover:bg-slate-50">Markdown</a>
          </div>
        </details>
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

      <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
        Nálezy ve skenu jsou <strong>deterministické</strong> – každý je konkrétní shoda pravidla na řádku vašeho kódu, s odkazem přímo na GitHub
        (u každého nálezu „Jak jsem to našel a jak to ověřit"). AI se používá jen ve volitelných funkcích „Posoudit pomocí AI" a „Útočné scénáře".
      </p>

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

      {(tab === "malware" || tab === "code" || tab === "web" || tab === "agent" || tab === "repo") && (
        <FindingList findings={inTab(tab)} scanned={Boolean(repo.lastCodeScanAt)} emptyText={EMPTY_TEXT[tab]!} {...listProps(tab)} />
      )}
      {tab === "deps" && (
        <FindingList
          findings={inTab("deps")}
          scanned={Boolean(repo.lastDepScanAt)}
          emptyText={
            repo.dependencies.length > 0
              ? `Žádná ze závislostí (${repo.dependencies.length}) nemá známou zranitelnost.`
              : "V repozitáři nebyly nalezeny žádné podporované soubory závislostí (composer.json/.lock, package.json, package-lock.json, yarn.lock, requirements.txt)."
          }
          {...listProps("deps")}
        />
      )}
      {tab === "threats" && <ThreatModelView repoId={repo.id} models={repo.threatModels} aiEnabled={aiEnabled} />}
      {tab === "suppressed" &&
        (suppressed.length === 0 ? (
          <p className="card p-6 text-center text-slate-500">
            Žádné potlačené nálezy. Nález, který jste ověřili jako falešně pozitivní nebo jehož riziko akceptujete, označte tlačítkem „Označit…“.
          </p>
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
                {s.kind === "code" ? "Sken kódu a nastavení" : "Kontrola závislostí"} · {s.trigger === "cron" ? "automaticky" : "ručně"}
              </span>
              <span className="text-slate-500">
                {formatDateTime(s.startedAt)} ·{" "}
                {s.status === "done" ? (
                  <>
                    dokončeno
                    {(s.newCount > 0 || s.resolvedCount > 0) && (
                      <>
                        {" "}· <span className="text-red-700">+{s.newCount} nových</span> ·{" "}
                        <span className="text-emerald-700">−{s.resolvedCount} vyřešených</span>
                      </>
                    )}
                  </>
                ) : s.status === "running" ? (
                  "probíhá"
                ) : (
                  <span className="text-red-700">selhalo: {s.error}</span>
                )}
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
  aiEnabled,
  suppressionOf,
}: {
  findings: Finding[];
  scanned: boolean;
  emptyText: string;
  htmlUrl: string;
  commitSha: string | null;
  previousScanEnd: Date | null;
  aiEnabled: boolean;
  suppressionOf: Map<string, Suppression>;
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
            <FindingCard
              key={f.id}
              finding={f}
              htmlUrl={htmlUrl}
              commitSha={commitSha}
              isNew={isNewFinding(f.firstSeenAt, previousScanEnd)}
              aiEnabled={aiEnabled}
              suppression={suppressionOf.get(f.fingerprint)}
            />
          ))}
        </section>
      ))}
    </div>
  );
}
