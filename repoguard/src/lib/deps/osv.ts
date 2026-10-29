import { scoreToSeverity, type Severity } from "../severity";
import { cvss3BaseScore } from "./cvss";
import type { ParsedDependency } from "./parsers";
import { compareVersions } from "./version";

const OSV_API = "https://api.osv.dev/v1";
const BATCH_SIZE = 500;
const DETAIL_CONCURRENCY = 8;

export interface OsvVulnerability {
  id: string;
  summary?: string;
  details?: string;
  aliases?: string[];
  severity?: { type: string; score: string }[];
  database_specific?: { severity?: string; cwe_ids?: string[] };
  affected?: {
    package?: { name: string; ecosystem: string };
    ranges?: { type: string; events: Record<string, string>[] }[];
    versions?: string[];
    ecosystem_specific?: { severity?: string };
  }[];
  references?: { type: string; url: string }[];
}

export interface AdvisoryCache {
  get(id: string): Promise<OsvVulnerability | null>;
  set(id: string, vuln: OsvVulnerability): Promise<void>;
}

export interface DependencyVulnerability {
  dependency: ParsedDependency;
  advisoryId: string;
  aliases: string[];
  summary: string;
  severity: Severity;
  cvssScore: number | null;
  cvssVector: string | null;
  fixedVersion: string | null;
  cwe: string | null;
  referenceUrl: string;
}

type FetchFn = typeof fetch;

async function postJson(fetchFn: FetchFn, url: string, body: unknown) {
  const res = await fetchFn(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OSV ${res.status}: ${await res.text().catch(() => "")}`);
  return res.json();
}

/** Returns, per dependency index, the ids of advisories affecting it. */
async function queryBatch(deps: ParsedDependency[], fetchFn: FetchFn): Promise<string[][]> {
  const result: string[][] = [];
  for (let start = 0; start < deps.length; start += BATCH_SIZE) {
    const chunk = deps.slice(start, start + BATCH_SIZE);
    const data = await postJson(fetchFn, `${OSV_API}/querybatch`, {
      queries: chunk.map((d) => ({ package: { name: d.name, ecosystem: d.ecosystem }, version: d.version })),
    });
    chunk.forEach((_, i) => {
      result.push((data.results?.[i]?.vulns ?? []).map((v: { id: string }) => v.id));
    });
  }
  return result;
}

async function fetchDetails(ids: string[], fetchFn: FetchFn, cache?: AdvisoryCache): Promise<Map<string, OsvVulnerability>> {
  const map = new Map<string, OsvVulnerability>();
  const queue = [...ids];
  const worker = async () => {
    while (queue.length) {
      const id = queue.shift()!;
      const cached = await cache?.get(id);
      if (cached) {
        map.set(id, cached);
        continue;
      }
      const res = await fetchFn(`${OSV_API}/vulns/${encodeURIComponent(id)}`);
      if (!res.ok) continue;
      const vuln = (await res.json()) as OsvVulnerability;
      map.set(id, vuln);
      await cache?.set(id, vuln);
    }
  };
  await Promise.all(Array.from({ length: Math.min(DETAIL_CONCURRENCY, ids.length) }, worker));
  return map;
}

const LABEL_SEVERITY: Record<string, Severity> = {
  CRITICAL: "critical",
  HIGH: "high",
  MODERATE: "medium",
  MEDIUM: "medium",
  LOW: "low",
};

export function severityOf(vuln: OsvVulnerability): { severity: Severity; score: number | null; vector: string | null } {
  const v3 = vuln.severity?.find((s) => s.type === "CVSS_V3");
  if (v3) {
    const score = cvss3BaseScore(v3.score);
    if (score !== null) return { severity: scoreToSeverity(score), score, vector: v3.score };
  }
  const v4 = vuln.severity?.find((s) => s.type === "CVSS_V4");
  const label =
    vuln.database_specific?.severity?.toUpperCase() ??
    vuln.affected?.find((a) => a.ecosystem_specific?.severity)?.ecosystem_specific?.severity?.toUpperCase();
  // Unknown severity defaults to medium so it is not hidden.
  return { severity: (label && LABEL_SEVERITY[label]) || "medium", score: null, vector: v4?.score ?? v3?.score ?? null };
}

function samePackage(dep: ParsedDependency, affected: NonNullable<OsvVulnerability["affected"]>[number]): boolean {
  const pkg = affected.package;
  if (!pkg || pkg.ecosystem !== dep.ecosystem) return false;
  const norm = (n: string) => (dep.ecosystem === "npm" ? n : n.toLowerCase().replace(/[._]+/g, "-"));
  return norm(pkg.name) === norm(dep.name);
}

/** Lowest fixed version for the range the installed version falls into. */
export function fixedVersionFor(dep: ParsedDependency, vuln: OsvVulnerability): string | null {
  const candidates: string[] = [];
  for (const affected of vuln.affected ?? []) {
    if (!samePackage(dep, affected)) continue;
    for (const range of affected.ranges ?? []) {
      if (range.type === "GIT") continue;
      let introduced: string | null = null;
      for (const event of range.events) {
        if (event.introduced !== undefined) introduced = event.introduced;
        if (event.fixed !== undefined) {
          const inRange =
            (introduced === null || introduced === "0" || compareVersions(dep.version, introduced) >= 0) &&
            compareVersions(dep.version, event.fixed) < 0;
          if (inRange) return event.fixed;
          candidates.push(event.fixed);
          introduced = null;
        }
      }
    }
  }
  const newer = candidates.filter((f) => compareVersions(f, dep.version) > 0).sort(compareVersions);
  return newer[0] ?? null;
}

function referenceUrl(vuln: OsvVulnerability): string {
  return `https://osv.dev/vulnerability/${encodeURIComponent(vuln.id)}`;
}

export async function checkDependencies(
  deps: ParsedDependency[],
  options: { fetchFn?: FetchFn; cache?: AdvisoryCache } = {},
): Promise<DependencyVulnerability[]> {
  const fetchFn = options.fetchFn ?? fetch;
  if (deps.length === 0) return [];
  const idsPerDep = await queryBatch(deps, fetchFn);
  const uniqueIds = [...new Set(idsPerDep.flat())];
  const details = await fetchDetails(uniqueIds, fetchFn, options.cache);

  const results: DependencyVulnerability[] = [];
  deps.forEach((dep, i) => {
    for (const id of idsPerDep[i]) {
      const vuln = details.get(id);
      if (!vuln) continue;
      const { severity, score, vector } = severityOf(vuln);
      results.push({
        dependency: dep,
        advisoryId: vuln.id,
        aliases: vuln.aliases ?? [],
        summary: vuln.summary ?? vuln.details?.split("\n")[0]?.slice(0, 200) ?? vuln.id,
        severity,
        cvssScore: score,
        cvssVector: vector,
        fixedVersion: fixedVersionFor(dep, vuln),
        cwe: vuln.database_specific?.cwe_ids?.[0] ?? null,
        referenceUrl: referenceUrl(vuln),
      });
    }
  });
  return results;
}
