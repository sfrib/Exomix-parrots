import { versionFromConstraint } from "./version";

export type Ecosystem = "Packagist" | "npm" | "PyPI";

export interface ParsedDependency {
  ecosystem: Ecosystem;
  name: string;
  version: string;
  manifest: string;
  direct: boolean;
  /** True when the version was derived from a range rather than a lockfile. */
  approximate: boolean;
}

export interface ManifestFile {
  path: string;
  content: string;
}

export const MANIFEST_NAMES = ["composer.json", "composer.lock", "package.json", "package-lock.json", "yarn.lock"];
export function isManifest(path: string): boolean {
  const name = path.split("/").pop() ?? "";
  return MANIFEST_NAMES.includes(name) || /^requirements.*\.txt$/.test(name);
}

function dirOf(path: string): string {
  const i = path.lastIndexOf("/");
  return i === -1 ? "" : path.slice(0, i);
}

function safeJson(content: string): any {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

const COMPOSER_PLATFORM = /^(php|hhvm|ext-|lib-|composer-plugin-api|composer-runtime-api|composer$)/;

function parseComposer(json: ManifestFile, lock: ManifestFile | undefined): ParsedDependency[] {
  const manifest = safeJson(json?.content ?? "{}") ?? {};
  const directNames = new Set(
    Object.keys({ ...(manifest.require ?? {}), ...(manifest["require-dev"] ?? {}) }).map((n) => n.toLowerCase()),
  );
  if (lock) {
    const data = safeJson(lock.content);
    if (data) {
      return [...(data.packages ?? []), ...(data["packages-dev"] ?? [])]
        .filter((p: any) => p?.name && p?.version && !String(p.version).startsWith("dev-"))
        .map((p: any) => ({
          ecosystem: "Packagist" as const,
          name: String(p.name).toLowerCase(),
          version: String(p.version).replace(/^v/i, ""),
          manifest: lock.path,
          direct: directNames.has(String(p.name).toLowerCase()),
          approximate: false,
        }));
    }
  }
  if (!json) return [];
  const deps: ParsedDependency[] = [];
  for (const [name, constraint] of Object.entries({ ...(manifest.require ?? {}), ...(manifest["require-dev"] ?? {}) })) {
    if (COMPOSER_PLATFORM.test(name) || !name.includes("/")) continue;
    const version = versionFromConstraint(String(constraint));
    if (version) deps.push({ ecosystem: "Packagist", name: name.toLowerCase(), version, manifest: json.path, direct: true, approximate: true });
  }
  return deps;
}

function parsePackageLock(lock: ManifestFile, directNames: Set<string>): ParsedDependency[] {
  const data = safeJson(lock.content);
  if (!data) return [];
  const deps: ParsedDependency[] = [];
  if (data.packages) {
    for (const [key, info] of Object.entries<any>(data.packages)) {
      if (!key || !info?.version || info.link) continue;
      const idx = key.lastIndexOf("node_modules/");
      if (idx === -1) continue;
      const name = key.slice(idx + "node_modules/".length);
      const topLevel = key.split("node_modules/").length === 2;
      deps.push({ ecosystem: "npm", name, version: info.version, manifest: lock.path, direct: topLevel && directNames.has(name), approximate: false });
    }
    return deps;
  }
  // lockfileVersion 1
  const walk = (tree: Record<string, any> | undefined, top: boolean) => {
    for (const [name, info] of Object.entries(tree ?? {})) {
      if (info?.version && !String(info.version).includes(":")) {
        deps.push({ ecosystem: "npm", name, version: info.version, manifest: lock.path, direct: top && directNames.has(name), approximate: false });
      }
      walk(info?.dependencies, false);
    }
  };
  walk(data.dependencies, true);
  return deps;
}

function parseYarnLock(lock: ManifestFile, directNames: Set<string>): ParsedDependency[] {
  const deps: ParsedDependency[] = [];
  const blocks = lock.content.split(/\n(?=\S)/);
  for (const block of blocks) {
    const header = block.split("\n")[0];
    const version = block.match(/^\s+version:?\s+"?([^"\s]+)"?/m)?.[1];
    if (!version || header.startsWith("#") || header.startsWith("__metadata")) continue;
    const spec = header.replace(/^"|":?$|:$/g, "").split(",")[0].trim().replace(/^"/, "");
    const at = spec.lastIndexOf("@");
    const name = at > 0 ? spec.slice(0, at) : spec;
    if (!name) continue;
    deps.push({ ecosystem: "npm", name, version, manifest: lock.path, direct: directNames.has(name), approximate: false });
  }
  return deps;
}

function parsePackageJson(pkg: ManifestFile): ParsedDependency[] {
  const data = safeJson(pkg.content) ?? {};
  const deps: ParsedDependency[] = [];
  for (const [name, constraint] of Object.entries({ ...(data.dependencies ?? {}), ...(data.devDependencies ?? {}) })) {
    const version = versionFromConstraint(String(constraint));
    if (version) deps.push({ ecosystem: "npm", name, version, manifest: pkg.path, direct: true, approximate: true });
  }
  return deps;
}

export function parseRequirements(file: ManifestFile): ParsedDependency[] {
  const deps: ParsedDependency[] = [];
  for (const raw of file.content.split("\n")) {
    const line = raw.split("#")[0].split(";")[0].trim();
    if (!line || line.startsWith("-") || /^(git\+|https?:|file:)/.test(line)) continue;
    const m = line.match(/^([A-Za-z0-9][A-Za-z0-9._-]*)(\[[^\]]*\])?\s*(==|===|>=|~=|>|<=|<|!=)?\s*([^,\s]+)?/);
    if (!m || !m[4]) continue;
    const exact = m[3] === "==" || m[3] === "===";
    if (m[3] && !exact && m[3] !== ">=" && m[3] !== "~=") continue;
    const version = m[4].includes("*") ? versionFromConstraint(m[4]) : m[4];
    if (!version) continue;
    deps.push({
      ecosystem: "PyPI",
      name: m[1].toLowerCase().replace(/[._]+/g, "-"),
      version,
      manifest: file.path,
      direct: true,
      approximate: !exact,
    });
  }
  return deps;
}

/** Parses all supported manifests; lockfiles take precedence over ranges in the same directory. */
export function parseManifests(files: ManifestFile[]): ParsedDependency[] {
  const byDir = new Map<string, Map<string, ManifestFile>>();
  for (const f of files) {
    const dir = dirOf(f.path);
    if (!byDir.has(dir)) byDir.set(dir, new Map());
    byDir.get(dir)!.set(f.path.split("/").pop()!, f);
  }

  const all: ParsedDependency[] = [];
  for (const group of byDir.values()) {
    const composerJson = group.get("composer.json");
    const composerLock = group.get("composer.lock");
    if (composerJson || composerLock) all.push(...parseComposer(composerJson!, composerLock));

    const pkg = group.get("package.json");
    const pkgData = pkg ? safeJson(pkg.content) ?? {} : {};
    const directNpm = new Set(Object.keys({ ...(pkgData.dependencies ?? {}), ...(pkgData.devDependencies ?? {}) }));
    const npmLock = group.get("package-lock.json");
    const yarnLock = group.get("yarn.lock");
    if (npmLock) all.push(...parsePackageLock(npmLock, directNpm));
    else if (yarnLock) all.push(...parseYarnLock(yarnLock, directNpm));
    else if (pkg) all.push(...parsePackageJson(pkg));

    for (const [name, f] of group) if (/^requirements.*\.txt$/.test(name)) all.push(...parseRequirements(f));
  }

  const seen = new Map<string, ParsedDependency>();
  for (const d of all) {
    const key = `${d.ecosystem}:${d.name}:${d.version}`;
    const prev = seen.get(key);
    if (!prev || (d.direct && !prev.direct)) seen.set(key, d);
  }
  return [...seen.values()];
}
