import { createHash } from "node:crypto";
import { db } from "./db";
import { tokenFor } from "./session";
import { downloadRepoFiles, getHeadSha, getRepoById, hasScanAccess } from "./github";
import { scanFiles } from "./scanner/engine";
import { MAX_FILE_BYTES, detectLanguage, isExcluded, parseExcludes } from "./scanner/files";
import type { SourceFile } from "./scanner/types";
import { isManifest, parseManifests, type Ecosystem, type ParsedDependency } from "./deps/parsers";
import { checkDependencies, type AdvisoryCache, type DependencyVulnerability, type OsvVulnerability } from "./deps/osv";

export type ScanKind = "code" | "deps" | "all";
export type ScanTrigger = "manual" | "cron";

const ADVISORY_TTL_MS = 24 * 60 * 60 * 1000;
const STALE_RUNNING_MS = 15 * 60 * 1000;

const advisoryCache: AdvisoryCache = {
  async get(id) {
    const row = await db.advisory.findUnique({ where: { id } });
    if (!row || Date.now() - row.fetchedAt.getTime() > ADVISORY_TTL_MS) return null;
    return JSON.parse(row.json) as OsvVulnerability;
  },
  async set(id, vuln) {
    const json = JSON.stringify(vuln);
    await db.advisory.upsert({ where: { id }, create: { id, json }, update: { json, fetchedAt: new Date() } });
  },
};

function sha1(text: string): string {
  return createHash("sha1").update(text).digest("hex");
}

function upgradeCommand(ecosystem: Ecosystem, name: string, version: string): string {
  switch (ecosystem) {
    case "Packagist":
      return `composer require ${name}:^${version}`;
    case "npm":
      return `npm install ${name}@^${version}`;
    case "PyPI":
      return `pip install "${name}>=${version}"`;
  }
}

function describeDependencyRisk(v: DependencyVulnerability) {
  const d = v.dependency;
  const ids = [v.advisoryId, ...v.aliases.filter((a) => a !== v.advisoryId)].join(", ");
  const parts = [
    `Balíček ${d.name} ve verzi ${d.version} obsahuje veřejně známou zranitelnost (${ids}).`,
    `Popis z databáze OSV: „${v.summary}“.`,
    "Informace o známých zranitelnostech jsou veřejné, takže je útočníci aktivně vyhledávají na webech, které používají zranitelné verze.",
  ];
  if (!d.direct) parts.push("Jde o nepřímou závislost – nainstalovala ji jiná knihovna, kterou používáte.");
  if (d.approximate) parts.push(`Verze je odvozena z rozsahu v ${d.manifest} (chybí lockfile); skutečně nainstalovaná verze může být novější.`);
  const explanation = parts.join(" ");

  let fix: string;
  if (v.fixedVersion) {
    fix = d.direct
      ? `Aktualizujte ${d.name} alespoň na verzi ${v.fixedVersion}: ${upgradeCommand(d.ecosystem, d.name, v.fixedVersion)}. Po aktualizaci aplikaci otestujte a commitněte i aktualizovaný lockfile.`
      : `Aktualizujte balíček, který ${d.name} vyžaduje, případně vynuťte opravenou verzi ${v.fixedVersion} (npm: \"overrides\" v package.json, Composer: composer update ${d.name} --with-dependencies). Poté commitněte lockfile.`;
  } else {
    fix = "Opravená verze zatím není k dispozici. Prostudujte doporučení v advisory (odkaz níže), zvažte náhradu balíčku nebo omezte použití zranitelné funkce.";
  }
  return { explanation, fix };
}

function codeFingerprint(f: { ruleId: string; file: string; snippet: string }): string {
  return sha1(`${f.ruleId}|${f.file}|${f.snippet.replace(/\s+/g, " ")}`);
}

function depFingerprint(v: DependencyVulnerability): string {
  const d = v.dependency;
  return sha1(`${d.ecosystem}|${d.name}|${d.version}|${v.advisoryId}`);
}

async function previousFirstSeen(repoId: string, kind: string): Promise<Map<string, Date>> {
  const rows = await db.finding.findMany({ where: { repoId, kind }, select: { fingerprint: true, firstSeenAt: true } });
  return new Map(rows.map((r) => [r.fingerprint, r.firstSeenAt]));
}

export interface ScanResult {
  codeFindings?: number;
  dependencyFindings?: number;
  dependencies?: number;
  filesScanned?: number;
}

/**
 * Runs a scan for a repo owned by `userId`. Access is re-verified against GitHub
 * with the user's own token before any file is read.
 */
export async function runScan(repoId: string, userId: string, kind: ScanKind, trigger: ScanTrigger = "manual"): Promise<ScanResult> {
  const repo = await db.repo.findFirst({ where: { id: repoId, userId }, include: { user: true } });
  if (!repo) throw new Error("Repozitář nebyl nalezen.");

  const running = await db.scan.findFirst({
    where: { repoId, status: "running", startedAt: { gt: new Date(Date.now() - STALE_RUNNING_MS) } },
  });
  if (running) throw new Error("Sken tohoto repozitáře už právě probíhá.");

  const token = tokenFor(repo.user);
  const kinds: Array<"code" | "deps"> = kind === "all" ? ["code", "deps"] : [kind];
  const scans = await Promise.all(
    kinds.map((k) => db.scan.create({ data: { repoId, kind: k, status: "running", trigger } })),
  );

  try {
    const remote = await getRepoById(token, repo.githubId);
    if (!hasScanAccess(remote, repo.user.login)) {
      throw new Error("K tomuto repozitáři už nemáte dostatečný přístup. Sken byl zastaven.");
    }
    const sha = await getHeadSha(token, remote.full_name, remote.default_branch);
    const excludes = parseExcludes(repo.excludePaths);
    const wantCode = kinds.includes("code");
    const wantDeps = kinds.includes("deps");

    const files = await downloadRepoFiles(token, remote.full_name, sha, (path, size) => {
      if (wantDeps && isManifest(path) && !isExcluded(path, excludes)) return true;
      if (!wantCode || size > MAX_FILE_BYTES || isExcluded(path, excludes)) return false;
      return detectLanguage(path) !== null;
    });

    const result: ScanResult = {};
    const now = new Date();

    if (wantCode) {
      const sources: SourceFile[] = files
        .map((f) => ({ ...f, language: detectLanguage(f.path)! }))
        .filter((f) => f.language !== null);
      const findings = scanFiles(sources);
      const firstSeen = await previousFirstSeen(repoId, "code");
      await db.$transaction([
        db.finding.deleteMany({ where: { repoId, kind: "code" } }),
        db.finding.createMany({
          data: findings.map((f) => {
            const fingerprint = codeFingerprint(f);
            return {
              repoId,
              kind: "code",
              fingerprint,
              ruleId: f.ruleId,
              severity: f.severity,
              title: f.title,
              cwe: f.cwe ?? null,
              file: f.file,
              line: f.line,
              snippet: f.snippet,
              explanation: f.explanation,
              fix: f.fix,
              firstSeenAt: firstSeen.get(fingerprint) ?? now,
            };
          }),
        }),
        db.scan.update({
          where: { id: scans.find((s) => s.kind === "code")!.id },
          data: { status: "done", finishedAt: new Date(), commitSha: sha, filesScanned: sources.length },
        }),
      ]);
      result.codeFindings = findings.length;
      result.filesScanned = sources.length;
    }

    if (wantDeps) {
      const manifests = files.filter((f) => isManifest(f.path));
      const deps: ParsedDependency[] = parseManifests(manifests);
      const vulns = await checkDependencies(deps, { cache: advisoryCache });
      const firstSeen = await previousFirstSeen(repoId, "dependency");
      await db.$transaction([
        db.finding.deleteMany({ where: { repoId, kind: "dependency" } }),
        db.dependency.deleteMany({ where: { repoId } }),
        db.dependency.createMany({
          data: deps.map((d) => ({ repoId, ...d })),
        }),
        db.finding.createMany({
          data: vulns.map((v) => {
            const fingerprint = depFingerprint(v);
            const { explanation, fix } = describeDependencyRisk(v);
            const cve = v.aliases.find((a) => a.startsWith("CVE-"));
            return {
              repoId,
              kind: "dependency",
              fingerprint,
              ruleId: `dep.${v.dependency.ecosystem.toLowerCase()}`,
              severity: v.severity,
              title: `${v.dependency.name} ${v.dependency.version} – ${cve ?? v.advisoryId}`,
              cwe: v.cwe,
              file: v.dependency.manifest,
              line: null,
              snippet: null,
              explanation,
              fix,
              packageName: v.dependency.name,
              ecosystem: v.dependency.ecosystem,
              installedVersion: v.dependency.version,
              fixedVersion: v.fixedVersion,
              advisoryId: v.advisoryId,
              aliases: v.aliases.join(", "),
              cvssScore: v.cvssScore,
              cvssVector: v.cvssVector,
              referenceUrl: v.referenceUrl,
              firstSeenAt: firstSeen.get(fingerprint) ?? now,
            };
          }),
        }),
        db.scan.update({
          where: { id: scans.find((s) => s.kind === "deps")!.id },
          data: { status: "done", finishedAt: new Date(), commitSha: sha, filesScanned: manifests.length },
        }),
      ]);
      result.dependencyFindings = vulns.length;
      result.dependencies = deps.length;
    }

    await db.repo.update({
      where: { id: repoId },
      data: {
        fullName: remote.full_name,
        defaultBranch: remote.default_branch,
        htmlUrl: remote.html_url,
        isPrivate: remote.private,
        lastCommitSha: sha,
        ...(wantCode ? { lastCodeScanAt: now } : {}),
        ...(wantDeps ? { lastDepScanAt: now } : {}),
      },
    });
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Neznámá chyba";
    await db.scan.updateMany({
      where: { id: { in: scans.map((s) => s.id) }, status: "running" },
      data: { status: "failed", error: message, finishedAt: new Date() },
    });
    throw err;
  }
}
