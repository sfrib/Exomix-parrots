import { createHash } from "node:crypto";
import type { DependencyVulnerability } from "./deps/osv";

/**
 * Stable finding identities, shared by the webapp scan pipeline and the CLI so
 * the same finding gets the same fingerprint everywhere (cross-run matching,
 * suppression keys, SARIF partialFingerprints).
 */

export function sha1(text: string): string {
  return createHash("sha1").update(text).digest("hex");
}

export function codeFingerprint(f: { ruleId: string; file: string; snippet: string }): string {
  return sha1(`${f.ruleId}|${f.file}|${f.snippet.replace(/\s+/g, " ")}`);
}

export function depFingerprint(v: DependencyVulnerability): string {
  const d = v.dependency;
  return sha1(`${d.ecosystem}|${d.name}|${d.version}|${v.advisoryId}`);
}
