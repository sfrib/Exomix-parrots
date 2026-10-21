import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import * as tar from "tar-stream";

const API = "https://api.github.com";
const MAX_ARCHIVE_BYTES = 250 * 1024 * 1024;
const MAX_FILES = 8000;

export interface GitHubRepo {
  id: number;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch: string;
  description: string | null;
  pushed_at: string | null;
  archived: boolean;
  language: string | null;
  owner: { login: string };
  permissions?: { admin?: boolean; maintain?: boolean; push?: boolean; triage?: boolean; pull?: boolean };
  /** Only returned to admins. */
  security_and_analysis?: Record<string, { status?: "enabled" | "disabled" } | undefined>;
}

export class GitHubError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function gh(token: string, path: string, accept = "application/vnd.github+json"): Promise<Response> {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: accept,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "RepoGuard",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const messages: Record<number, string> = {
      401: "Přihlášení ke GitHubu vypršelo. Odhlaste se a přihlaste znovu.",
      403: "GitHub odmítl požadavek (chybí oprávnění nebo byl překročen limit API).",
      404: "Repozitář nebyl nalezen nebo k němu nemáte přístup.",
    };
    throw new GitHubError(messages[res.status] ?? `Chyba GitHub API (${res.status}).`, res.status);
  }
  return res;
}

/**
 * Whether the signed-in user may scan the repo: they own it, have write/admin access,
 * or have been granted access to a private repo. Read access to someone else's public
 * repo is not enough.
 */
export function hasScanAccess(repo: GitHubRepo, login: string): boolean {
  const p = repo.permissions ?? {};
  if (repo.owner.login.toLowerCase() === login.toLowerCase()) return true;
  if (p.admin || p.maintain || p.push) return true;
  return repo.private && Boolean(p.pull);
}

export async function listAccessibleRepos(token: string, login: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  for (let page = 1; page <= 10; page++) {
    const res = await gh(token, `/user/repos?affiliation=owner,collaborator,organization_member&sort=pushed&per_page=100&page=${page}`);
    const batch = (await res.json()) as GitHubRepo[];
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos.filter((r) => hasScanAccess(r, login));
}

export async function getRepoById(token: string, githubId: number): Promise<GitHubRepo> {
  return (await gh(token, `/repositories/${githubId}`)).json();
}

export async function getHeadSha(token: string, fullName: string, ref: string): Promise<string> {
  const res = await gh(token, `/repos/${fullName}/commits/${encodeURIComponent(ref)}`, "application/vnd.github.sha");
  return (await res.text()).trim();
}

/** Dependabot alerts: true/false, or null when the token cannot tell (needs admin). */
export async function getDependabotAlertsEnabled(token: string, fullName: string): Promise<boolean | null> {
  try {
    await gh(token, `/repos/${fullName}/vulnerability-alerts`);
    return true;
  } catch (err) {
    if (err instanceof GitHubError && err.status === 404) return false;
    return null;
  }
}

export async function isBranchProtected(token: string, fullName: string, branch: string): Promise<boolean | null> {
  try {
    const res = await gh(token, `/repos/${fullName}/branches/${encodeURIComponent(branch)}`);
    const data = (await res.json()) as { protected?: boolean };
    return typeof data.protected === "boolean" ? data.protected : null;
  } catch {
    return null;
  }
}

/** Raw content of one file at a commit, used for AI review context. */
export async function getFileContent(token: string, fullName: string, path: string, ref: string): Promise<string> {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  const res = await gh(token, `/repos/${fullName}/contents/${encoded}?ref=${encodeURIComponent(ref)}`, "application/vnd.github.raw+json");
  return res.text();
}

export interface DownloadedFile {
  path: string;
  content: string;
}

export interface RepoFiles {
  files: DownloadedFile[];
  /** Every regular-file path in the repo (incl. ones whose content was not downloaded). */
  paths: { path: string; size: number }[];
}

/**
 * Downloads the repository tarball at `ref` and returns text files accepted by `accept`.
 * Files are read in memory only; nothing is written to disk or executed.
 */
export async function downloadRepoFiles(
  token: string,
  fullName: string,
  ref: string,
  accept: (path: string, size: number) => boolean,
): Promise<RepoFiles> {
  const res = await gh(token, `/repos/${fullName}/tarball/${encodeURIComponent(ref)}`);
  if (!res.body) throw new GitHubError("GitHub nevrátil archiv repozitáře.", 502);

  const files: DownloadedFile[] = [];
  const paths: { path: string; size: number }[] = [];
  let downloaded = 0;
  const extract = tar.extract();

  const source = Readable.fromWeb(res.body as import("node:stream/web").ReadableStream);
  source.on("data", (chunk: Buffer) => {
    downloaded += chunk.length;
    if (downloaded > MAX_ARCHIVE_BYTES) source.destroy(new Error("Repozitář je příliš velký (limit 250 MB)."));
  });

  const consume = (async () => {
    for await (const entry of extract) {
      const { name, type, size = 0 } = entry.header;
      // Archive paths start with "<owner>-<repo>-<sha>/"
      const path = name.split("/").slice(1).join("/");
      if (type !== "file" || !path) {
        entry.resume();
        continue;
      }
      if (paths.length < 50000) paths.push({ path, size });
      if (files.length >= MAX_FILES || !accept(path, size)) {
        entry.resume();
        continue;
      }
      const chunks: Buffer[] = [];
      for await (const chunk of entry) chunks.push(chunk as Buffer);
      const buf = Buffer.concat(chunks);
      if (buf.includes(0)) continue; // binary
      files.push({ path, content: buf.toString("utf8") });
    }
  })();

  await Promise.all([pipeline(source, createGunzip(), extract), consume]);
  return { files, paths };
}
