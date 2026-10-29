/** Ecosystem-agnostic version comparison, good enough for semver, Composer and PEP 440 style versions. */

function normalize(v: string): string {
  return v.trim().replace(/^[v=]+/i, "").split("+")[0];
}

function tokenize(v: string): (number | string)[] {
  const [release, ...pre] = normalize(v).split(/-(.*)/s);
  const parts: (number | string)[] = release.split(".").flatMap((p) => {
    if (/^\d+$/.test(p)) return [Number(p)];
    // Python-style pre-releases such as "0rc1" or "2b3"
    const m = p.match(/^(\d+)([a-z]+\d*)$/i);
    return m ? [Number(m[1]), `~${m[2]}`] : [p];
  });
  // Semver/Composer pre-releases such as 1.0.0-beta.2 sort before the release
  const suffix = pre.filter(Boolean).join("");
  if (suffix) parts.push(`~${suffix}`);
  return parts;
}

export function compareVersions(a: string, b: string): number {
  const ta = tokenize(a);
  const tb = tokenize(b);
  const len = Math.max(ta.length, tb.length);
  for (let i = 0; i < len; i++) {
    const x = ta[i];
    const y = tb[i];
    if (x === undefined) return typeof y === "string" && y.startsWith("~") ? 1 : y === 0 ? 0 : -1;
    if (y === undefined) return typeof x === "string" && x.startsWith("~") ? -1 : x === 0 ? 0 : 1;
    if (typeof x === "number" && typeof y === "number") {
      if (x !== y) return x < y ? -1 : 1;
      continue;
    }
    // A pre-release marker sorts before any number at the same position.
    if (typeof x === "string" && x.startsWith("~") && typeof y === "number") return -1;
    if (typeof y === "string" && y.startsWith("~") && typeof x === "number") return 1;
    const cmp = String(x).localeCompare(String(y), "en", { numeric: true });
    if (cmp !== 0) return cmp < 0 ? -1 : 1;
  }
  return 0;
}

/**
 * Best-effort concrete version from a range such as "^1.2", "~2.0.3", ">=1.4 <2" or "1.2.*".
 * Returns null when no version can be derived (e.g. "*", git URLs, "dev-master").
 */
export function versionFromConstraint(constraint: string): string | null {
  const first = constraint.split("||")[0].split("|")[0].trim();
  const m = first.match(/(\d+(?:\.\d+){0,3})/);
  if (!m || /^(dev-|git|http|file:|link:|workspace:)/i.test(first)) return null;
  const parts = m[1].split(".");
  while (parts.length < 3) parts.push("0");
  return parts.join(".");
}
